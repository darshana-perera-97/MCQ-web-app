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
        setError(result.error || 'Authentication failed');
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
    alert('Email verified successfully! Your account is pending admin approval. You will be able to login once approved.');
    setIsLogin(true);
    setEmail(signupData.email);
    setPassword('');
    setSignupData(null);
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setSignupData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className={`w-full bg-white rounded-2xl shadow-sm border border-gray-200 ${isLogin ? 'max-w-md p-8' : 'max-w-5xl p-6 md:p-8'}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-xl mb-4">
            <GraduationCap className="w-7 h-7 text-gray-700" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-500">
            {isLogin ? 'Sign in to continue' : 'Complete the form below to create your account'}
          </p>
        </div>

        <div className={isLogin ? '' : 'max-h-[75vh] overflow-y-auto overflow-x-hidden pr-2'}>
        {showOTP ? (
          <OTPVerification
            email={signupData?.email}
            name={signupData?.name}
            onVerified={handleOTPVerified}
            onCancel={handleOTPCancel}
          />
        ) : isLogin ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
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
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? 'Please wait...' : 'Sign In'}
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

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span className="font-medium text-gray-900 underline">
              {isLogin ? 'Create Account' : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

