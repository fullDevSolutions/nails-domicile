const crypto = require('crypto');

function generateToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function csrfProtection(req, res, next) {
  // Make token available to all views
  res.locals.csrfToken = generateToken(req);

  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.body._csrf || req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({ success: false, error: 'Token CSRF invalide' });
    }
    req.flash('error', 'Session expirée, veuillez réessayer.');
    return res.redirect('back');
  }

  next();
}

module.exports = csrfProtection;
