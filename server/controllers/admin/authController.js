const AdminUser = require('../../models/AdminUser');

const isDemoMode = process.env.DEMO_MODE === 'true';

const authController = {
  loginPage(req, res) {
    res.render('admin/login', {
      layout: 'layouts/admin',
      title: 'Connexion',
      isLoginPage: true
    });
  },

  async login(req, res) {
    try {
      const { email, password } = req.validatedBody;

      const user = await AdminUser.findByEmail(email);
      if (!user) {
        req.flash('error', 'Email ou mot de passe incorrect.');
        return res.redirect('/admin/login');
      }

      // In demo mode, only allow demo role accounts to log in
      if (isDemoMode && user.role !== 'demo') {
        req.flash('error', 'Email ou mot de passe incorrect.');
        return res.redirect('/admin/login');
      }

      const valid = await AdminUser.verifyPassword(password, user.password_hash);
      if (!valid) {
        req.flash('error', 'Email ou mot de passe incorrect.');
        return res.redirect('/admin/login');
      }

      await AdminUser.updateLastLogin(user.id);

      req.session.adminUser = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      req.flash('success', 'Bienvenue !');
      res.redirect('/admin');
    } catch (err) {
      console.error('Login error:', err);
      req.flash('error', 'Une erreur est survenue.');
      res.redirect('/admin/login');
    }
  },

  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/admin/login');
    });
  }
};

module.exports = authController;
