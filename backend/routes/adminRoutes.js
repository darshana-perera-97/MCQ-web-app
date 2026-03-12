import express from 'express';
import { verifyRecaptcha } from '../services/recaptchaService.js';

const router = express.Router();

/**
 * Admin login route (using email and password from .env)
 * This is a simple implementation - in production use JWT
 */
router.post('/login', async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  const recaptchaResult = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaResult.success) {
    return res.status(400).json({ error: recaptchaResult.message || 'Captcha verification failed' });
  }

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminSecret = process.env.ADMIN_SECRET || 'admin123';

  if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
    res.json({
      message: 'Admin login successful',
      adminSecret: adminSecret
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

export default router;

