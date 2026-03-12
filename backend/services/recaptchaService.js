/**
 * Google reCAPTCHA v2 verification.
 * Set RECAPTCHA_SECRET in .env to enable verification; when unset, verification is skipped.
 */

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verify a reCAPTCHA response token with Google.
 * @param {string} token - The token from the client (g-recaptcha-response)
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export async function verifyRecaptcha(token) {
  if (!RECAPTCHA_SECRET || RECAPTCHA_SECRET.trim() === '') {
    return { success: true };
  }

  if (!token || typeof token !== 'string') {
    return { success: false, message: 'Captcha is required' };
  }

  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: token,
    });
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();

    if (data.success) {
      return { success: true };
    }
    return {
      success: false,
      message: data['error-codes']?.includes('timeout-or-duplicate')
        ? 'Captcha expired. Please try again.'
        : 'Captcha verification failed. Please try again.',
    };
  } catch (err) {
    console.error('reCAPTCHA verify error:', err);
    return { success: false, message: 'Captcha verification failed. Please try again.' };
  }
}
