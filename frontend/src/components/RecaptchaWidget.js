import { useRef, useImperativeHandle, forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

/**
 * reCAPTCHA v2 checkbox. Only renders when REACT_APP_RECAPTCHA_SITE_KEY is set.
 * Use ref to call getValue() and reset().
 */
export const RecaptchaWidget = forwardRef(function RecaptchaWidget(_props, ref) {
  const recaptchaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getValue: () => recaptchaRef.current?.getValue() || '',
    reset: () => recaptchaRef.current?.reset?.(),
  }), []);

  if (!siteKey || siteKey.indexOf('REACT_APP_') !== -1) {
    return null;
  }

  return (
    <div className="flex justify-center my-3">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        theme="light"
        size="normal"
      />
    </div>
  );
});

export function useRecaptchaRequired() {
  return Boolean(siteKey && siteKey.indexOf('REACT_APP_') === -1);
}
