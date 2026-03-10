import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap } from 'lucide-react';
import { MultiStepSignup } from './MultiStepSignup';
import { OTPVerification } from './OTPVerification';

export function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [loginOTPData, setLoginOTPData] = useState(null); // For OTP from login flow
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirect to admin dashboard if user is admin, otherwise to student dashboard
        if (result.user?.role === 'admin') {
          navigate('/admin/analytics');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        // Check if this is an email verification required error
        if (result.error === 'EMAIL_VERIFICATION_REQUIRED') {
          // Show OTP form instead of error
          if (result.user) {
            setLoginOTPData({
              email: result.user.email,
              name: result.user.name
            });
            setShowOTP(true);
            setError('');
          } else {
            // Fallback: use the email from form
            setLoginOTPData({
              email: email,
              name: '' // Name not available, but OTP form can work without it
            });
            setShowOTP(true);
            setError('');
        }
      } else {
        setError(result.error || 'Authentication failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (formData) => {
    setError('');
    setLoading(true);

    try {
      const result = await signup(formData);
      if (result.success) {
        // Show OTP verification
        setSignupData(formData);
        setShowOTP(true);
        setError('');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setShowOTP(false);
    if (loginOTPData) {
      // OTP verified from login flow - try to login again
      alert('Email verified successfully! Please login again.');
      setLoginOTPData(null);
      setPassword(''); // Clear password so user can re-enter
    } else {
      // OTP verified from signup flow
    alert('Email verified successfully! Your account is pending admin approval. You will be able to login once approved.');
    setIsLogin(true);
      setEmail(signupData?.email || '');
    setPassword('');
    setSignupData(null);
    }
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setSignupData(null);
    setLoginOTPData(null);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 py-8">
      <div className={`w-full bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 ${isLogin ? 'max-w-md p-12' : 'max-w-5xl p-6 md:p-12'}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-xl mb-6 border border-gray-100">
            <GraduationCap className="w-7 h-7 text-gray-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-500 font-normal">
            {isLogin ? 'Sign in to continue your learning journey' : 'Complete the form below to create your account'}
          </p>
        </div>

        <div>
        {showOTP ? (
          <OTPVerification
            email={loginOTPData?.email || signupData?.email}
            name={loginOTPData?.name || signupData?.name}
            onVerified={handleOTPVerified}
            onCancel={handleOTPCancel}
          />
        ) : isLogin ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:ring-offset-0 h-11 text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:ring-offset-0 h-11 text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>
        ) : (
          <MultiStepSignup 
            onSubmit={handleSignup}
            loading={loading}
            error={error}
          />
        )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-normal"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
              {isLogin ? 'Create Account' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

