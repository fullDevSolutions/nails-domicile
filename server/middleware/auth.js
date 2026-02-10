function isAuthenticated(req, res, next) {
  if (req.session && req.session.adminUser) {
    res.locals.adminUser = req.session.adminUser;
    return next();
  }
  req.flash('error', 'Veuillez vous connecter pour accéder à cette page.');
  res.redirect('/admin/login');
}

function isGuest(req, res, next) {
  if (req.session && req.session.adminUser) {
    return res.redirect('/admin');
  }
  next();
}

module.exports = { isAuthenticated, isGuest };
