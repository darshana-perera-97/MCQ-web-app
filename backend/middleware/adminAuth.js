/**
 * Admin authentication middleware
 * For MVP, we'll use a simple secret route check
 * In production, implement proper JWT authentication
 */
export const adminAuth = (req, res, next) => {
  // Check for admin secret in query or header
  const adminSecret = req.query.adminSecret || req.headers['x-admin-secret'];
  const validSecret = process.env.ADMIN_SECRET || 'admin123'; // Default for development

  if (adminSecret === validSecret) {
    req.isAdmin = true;
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

