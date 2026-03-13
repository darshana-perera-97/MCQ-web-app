import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Suppress unhandled reCAPTCHA timeout (thrown by Google's script)
function isRecaptchaTimeoutError(value) {
  const s = value == null ? '' : (value.message || value.error || value).toString();
  return /recaptcha/i.test(s) && /timeout/i.test(s);
}
function getRejectionMessage(reason) {
  if (reason == null) return '';
  if (typeof reason === 'string') return reason;
  if (reason instanceof Error) return reason.message;
  return reason.message != null ? String(reason.message) : String(reason);
}
window.addEventListener('unhandledrejection', (event) => {
  const msg = getRejectionMessage(event.reason);
  if (isRecaptchaTimeoutError(msg) || isRecaptchaTimeoutError(event.reason)) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('reCAPTCHA timeout suppressed');
    return true;
  }
}, true);
window.addEventListener('error', (event) => {
  if (isRecaptchaTimeoutError(event.message) || isRecaptchaTimeoutError(event.error)) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('reCAPTCHA timeout suppressed');
    return true;
  }
}, true);
const prevOnError = window.onerror;
window.onerror = function (message, source, lineno, colno, error) {
  if (isRecaptchaTimeoutError(message) || isRecaptchaTimeoutError(error)) {
    console.warn('reCAPTCHA timeout suppressed');
    return true;
  }
  return prevOnError ? prevOnError(message, source, lineno, colno, error) : false;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
