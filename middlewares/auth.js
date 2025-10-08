export function ensureAuthPage(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  // For pages, redirect to login
  return res.redirect('/login');
}

export function ensureAuthApi(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.status(401).json({ message: 'Потрібно увійти через Passport' });
}
