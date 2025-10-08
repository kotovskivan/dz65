import jwt from 'jsonwebtoken';

export function ensurePassport(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect('/login?reason=passport');
}

export function ensureJWT(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'JWT required' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt');
    req.jwtUser = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid JWT' });
  }
}
