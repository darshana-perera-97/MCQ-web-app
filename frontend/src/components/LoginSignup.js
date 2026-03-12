import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { GraduationCap, Languages, Home, CheckCircle2, Building2, Phone, Mail } from 'lucide-react';
import { MultiStepSignup } from './MultiStepSignup';
import { OTPVerification } from './OTPVerification';
import { RecaptchaWidget, useRecaptchaRequired } from './RecaptchaWidget';

export function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showActivationInstructions, setShowActivationInstructions] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const [loginOTPData, setLoginOTPData] = useState(null); // For OTP from login flow
  const recaptchaRef = useRef(null);
  const recaptchaRequired = useRecaptchaRequired();

  const { login, signup } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const recaptchaToken = recaptchaRef.current?.getValue?.() || '';
    if (recaptchaRequired && !recaptchaToken) {
      setError(language === 'si' ? 'කරුණාකරල්ලෙන් captcha සම්පූර්ණ කරන්න' : 'Please complete the captcha');
      return;
    }
    setLoading(true);

    try {
      const result = await login(email, password, recaptchaToken);
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
        } else if (result.error === 'ACCOUNT_SUSPENDED') {
          setError(result.message || (language === 'si' ? 'ඔබේ ගිණුම නවතා ඇත. වැඩිදුර තොරතුරු සඳහා පරිපාලකයා අමතන්න.' : 'Your account is suspended. Please contact admin for more details.'));
        } else {
          setError(result.error || 'Authentication failed');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      recaptchaRef.current?.reset?.();
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (formData, recaptchaToken) => {
    setError('');
    if (recaptchaRequired && !recaptchaToken) {
      setError(language === 'si' ? 'කරුණාකරල්ලෙන් captcha සම්පූර්ණ කරන්න' : 'Please complete the captcha');
      return;
    }
    setLoading(true);

    try {
      const result = await signup(formData, recaptchaToken);
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
      recaptchaRef.current?.reset?.();
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setShowOTP(false);
    if (loginOTPData) {
      alert('Email verified successfully! Please login again.');
      setLoginOTPData(null);
      setPassword(''); // Clear password so user can re-enter
    } else {
      // OTP verified from signup flow → show activation instructions
      setShowActivationInstructions(true);
    }
  };

  const handleActivationDone = () => {
    setShowActivationInstructions(false);
    setIsLogin(true);
    setEmail(signupData?.email || '');
    setPassword('');
    setSignupData(null);
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setSignupData(null);
    setLoginOTPData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matches student dashboard */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
            {language === 'si' ? 'ශිෂ්‍ය පිවිසුම' : 'Student Login'}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={toggleLanguage}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 font-medium transition-all border border-gray-200"
              title={language === 'si' ? 'Switch to English' : 'සිංහලට මාරු වන්න'}
            >
              <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">{language === 'si' ? 'EN' : 'සිං'}</span>
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2 rounded-lg px-3 sm:px-5 py-2 font-medium transition-all border border-gray-200"
              title={language === 'si' ? 'මුල් පිටුව' : 'Back to Home'}
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{language === 'si' ? 'මුල් පිටුව' : 'Back to Home'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main content - centered card like dashboard cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex justify-center">
        <div className={`w-full bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 ${isLogin ? 'max-w-md p-8 sm:p-12' : 'max-w-5xl p-6 md:p-12'}`}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-xl mb-6 border border-blue-100">
              <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-blue-700" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {isLogin
                ? (language === 'si' ? 'නැවත සාදරයෙන් පිළිගනිමු' : 'Welcome Back')
                : (language === 'si' ? 'ගිණුම සාදන්න' : 'Create Account')}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-normal">
              {isLogin
                ? (language === 'si' ? 'ඔබේ ඉගෙනීම් ගමන දිගටම කරගෙන යාමට පිවිසෙන්න' : 'Sign in to continue your learning journey')
                : (language === 'si' ? 'ඔබේ ගිණුම සාදීමට පහත පෝරමය පුරවන්න' : 'Complete the form below to create your account')}
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
            ) : showActivationInstructions ? (
              <div className="space-y-6 max-w-lg mx-auto">
                <div className="flex justify-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 border border-green-200">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center">
                  {language === 'si' ? 'ඔබේ ගිණුම සාර්ථකව සාදා ඇත' : 'Account created successfully'}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {language === 'si'
                    ? 'ගිණුම සක්‍රිය කිරීමට කරුණාකර පහත බැංකු ගිණුම් වලින් එකකට එක් වර ගාස්තුව LKR 399 ගෙවන්න. ගෙවීමෙන් පසු, ගෙවීම් සල්ලිපතේ ඡායාරූපය හෝ තිර ගතිය පහත WhatsApp අංකයට හෝ විද්‍යුත් තැපැල් ලිපිනයට යවන්න. ලියාපදිංචි වීමේදී භාවිතා කළ සම්පූර්ණ නම සහ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න. අප කණ්ඩායම ඔබේ ගිණුම පැය 2-3 ඇතුළත සක්‍රිය කරනු ඇත.'
                    : 'To activate your account, please pay a one-time fee of LKR 399 to one of the bank accounts below. After payment, send a photo or screenshot of the payment slip to the WhatsApp number or email address given below. Include the full name and email address you used to register. Your account will be activated by our team within 2–3 hours.'}
                </p>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">
                    {language === 'si' ? 'බැංකු විස්තර' : 'Bank details'}
                  </p>
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      BOC
                    </div>
                    <dl className="text-sm text-gray-600 space-y-1">
                      <div><span className="font-medium text-gray-700">Account name:</span> W.S.A.D.S.Perera</div>
                      <div><span className="font-medium text-gray-700">Account no:</span> 88395576</div>
                      <div><span className="font-medium text-gray-700">Bank:</span> BOC</div>
                      <div><span className="font-medium text-gray-700">Branch:</span> Chilaw</div>
                    </dl>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
                  <p className="text-sm font-medium text-gray-800">
                    {language === 'si' ? 'ගෙවීම් සල්ලිපත යවන්න' : 'Send your payment slip to'}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-700">
                    <a href="https://wa.me/94710545132" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-green-700 hover:underline font-medium">
                      <Phone className="w-4 h-4" /> +94 71 054 5132
                    </a>
                    <span className="hidden sm:inline text-gray-400"> or </span>
                    <a href="mailto:exam-admin@nexgenai.asia" className="inline-flex items-center gap-2 text-blue-700 hover:underline font-medium">
                      <Mail className="w-4 h-4" /> exam-admin@nexgenai.asia
                    </a>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {language === 'si' ? 'ඔබ ලියාපදිංචි වියේ කළ නම සහ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න.' : 'Include the name and email you used to register.'}
                  </p>
                </div>

                <Button
                  onClick={handleActivationDone}
                  className="w-full h-11 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium"
                >
                  {language === 'si' ? 'පිවිසුමට යන්න' : 'Go to Login'}
                </Button>
              </div>
            ) : isLogin ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {language === 'si' ? 'විද්‍යුත් තැපැල් ලිපිනය' : 'Email Address'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={language === 'si' ? 'you@example.com' : 'you@example.com'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-lg border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:ring-offset-0 h-11 sm:h-12 text-gray-900 placeholder:text-gray-400 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {language === 'si' ? 'මුරපදය' : 'Password'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={language === 'si' ? 'මුරපදය ඇතුළත් කරන්න' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-lg border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:ring-offset-0 h-11 sm:h-12 text-gray-900 placeholder:text-gray-400 transition-all"
                  />
                </div>

                <RecaptchaWidget ref={recaptchaRef} />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 sm:h-12 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {language === 'si' ? 'පිවිසෙමින්...' : 'Signing in...'}
                    </span>
                  ) : (language === 'si' ? 'පිවිසෙන්න' : 'Sign In')}
                </Button>
              </form>
            ) : (
              <MultiStepSignup
                onSubmit={handleSignup}
                getRecaptchaToken={() => recaptchaRef.current?.getValue?.() || ''}
                recaptchaRef={recaptchaRef}
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
              {isLogin
                ? (language === 'si' ? 'ගිණුමක් නැද්ද? ' : "Don't have an account? ")
                : (language === 'si' ? 'දැනටමත් ගිණුමක් තිබේද? ' : 'Already have an account? ')}
              <span className="font-medium text-gray-900 hover:text-gray-800 transition-colors">
                {isLogin ? (language === 'si' ? 'ගිණුම සාදන්න' : 'Create Account') : (language === 'si' ? 'පිවිසෙන්න' : 'Sign In')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

