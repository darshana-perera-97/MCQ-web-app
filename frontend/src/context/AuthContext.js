import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI, setAdminSecret } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        
        // If user is admin, ensure admin secret is set
        if (userData.role === 'admin') {
          const adminSecret = process.env.REACT_APP_ADMIN_SECRET || 'admin123';
          setAdminSecret(adminSecret);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password, recaptchaToken) => {
    try {
      const response = await userAPI.login(email, password, recaptchaToken);
      const userData = response.user;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // If user is admin, set admin secret for API calls
      if (userData.role === 'admin') {
        const adminSecret = process.env.REACT_APP_ADMIN_SECRET || 'admin123';
        setAdminSecret(adminSecret);
      }
      
      return { success: true, user: userData };
    } catch (error) {
      // Check if this is an email verification error with user data
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.error === 'EMAIL_VERIFICATION_REQUIRED' && errorData.user) {
          return { 
            success: false, 
            error: 'EMAIL_VERIFICATION_REQUIRED',
            user: errorData.user
          };
        }
      }
      return { success: false, error: error.message };
    }
  };

  const signup = async (formData, recaptchaToken) => {
    try {
      const response = await userAPI.signup(formData, recaptchaToken);
      // Don't auto-login after signup - user needs admin approval
      return { success: true, message: response.message || 'Account created successfully. Waiting for admin approval.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('adminSecret');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

