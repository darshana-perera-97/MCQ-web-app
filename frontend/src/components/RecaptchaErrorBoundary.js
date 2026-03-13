import { Component } from 'react';
import { Button } from './ui/button';

/**
 * Catches reCAPTCHA timeout (and other) errors so the app doesn't crash.
 * Renders a fallback with "Continue anyway" and "Try again".
 */
export class RecaptchaErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('RecaptchaErrorBoundary caught:', error?.message || error, errorInfo);
  }

  handleContinue = () => {
    this.setState({ hasError: false, error: null });
    this.props.onContinue?.();
  };

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null });
    this.props.onTryAgain?.();
  };

  render() {
    if (this.state.hasError) {
      const isTimeout = /timeout/i.test(String(this.state.error?.message || ''));
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-sm text-amber-900 mb-3">
            {isTimeout
              ? "reCAPTCHA timed out. You can continue or try again."
              : "reCAPTCHA had a problem. You can continue or try again."}
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={this.handleTryAgain}>
              Try again
            </Button>
            <Button size="sm" onClick={this.handleContinue}>
              Continue anyway
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
