const isDemoMode = process.env.DEMO_MODE === 'true';

function demoGuard(req, res, next) {
  res.locals.demoMode = isDemoMode;

  if (!isDemoMode) return next();

  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!writeMethods.includes(req.method)) return next();

  // Allow login and logout actions
  if (req.path === '/login' || req.path === '/logout') return next();

  // Block write operations
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(403).json({ error: 'Cette fonctionnalité est désactivée en mode démonstration.' });
  }

  req.flash('info', 'Cette fonctionnalité est désactivée en mode démonstration.');
  const referer = req.headers.referer;
  return res.redirect(referer || '/admin');
}

module.exports = demoGuard;
