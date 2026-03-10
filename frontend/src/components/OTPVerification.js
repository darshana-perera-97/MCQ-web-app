import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { userAPI } from '../services/api';

export function OTPVerification({ email, name, onVerified, onCancel }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userAPI.verifyOTP(email, otpString);
      if (response.message) {
        setVerified(true);
        setTimeout(() => {
          onVerified();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setCountdown(60);

    try {
      await userAPI.resendOTP(email);
      setError('');
      // Reset OTP inputs
      setOtp(['', '', '', '', '', '']);
      const firstInput = document.getElementById('otp-0');
      if (firstInput) firstInput.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-xl mb-5 border border-gray-100">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
        <p className="text-gray-600 font-normal">Your email has been successfully verified.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 rounded-xl mb-6 border border-gray-100">
          <Mail className="w-7 h-7 text-gray-700" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Verify Your Email</h2>
        <p className="text-sm text-gray-500 font-normal">
          We've sent a 6-digit verification code to
        </p>
        <p className="text-sm font-medium text-gray-900 mt-2">{email}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-4 block text-center">
            Enter Verification Code
          </Label>
          <div className="flex gap-3 justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:ring-offset-0 transition-all"
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : 'Verify Email'}
        </Button>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600 font-normal">
            Didn't receive the code?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className="rounded-lg h-10 px-6 text-sm font-normal border-gray-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all"
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Resend OTP
              </>
            )}
          </Button>
        </div>

        {onCancel && (
          <div className="text-center">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors font-normal"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

