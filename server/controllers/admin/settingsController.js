const fs = require('fs');
const path = require('path');
const BusinessHour = require('../../models/BusinessHour');
const AdminUser = require('../../models/AdminUser');
const { reloadConfig, getSiteConfig } = require('../../middleware/siteConfig');

const configPath = path.join(__dirname, '../../../config/site.config.json');

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  reloadConfig();
}

const settingsController = {
  async index(req, res) {
    try {
      const hours = await BusinessHour.findAll();
      const config = getSiteConfig();

      res.render('admin/settings/index', {
        layout: 'layouts/admin',
        title: 'Paramètres',
        isLoginPage: false,
        config,
        hours
      });
    } catch (err) {
      console.error('Settings error:', err);
      req.flash('error', 'Erreur lors du chargement des paramètres.');
      res.redirect('/admin');
    }
  },

  async updateBusiness(req, res) {
    try {
      const config = getSiteConfig();
      const { name, tagline, owner, profession, phone, email, siret, city, zip, serviceRadius, serviceArea, extraKmPrice, instagram, facebook, tiktok } = req.validatedBody;

      config.business.name = name;
      config.business.tagline = tagline || config.business.tagline;
      config.business.owner = owner;
      config.business.profession = profession || config.business.profession;
      config.business.phone = phone;
      config.business.email = email;
      config.business.siret = siret || config.business.siret;
      config.business.address.city = city || config.business.address.city;
      config.business.address.zip = zip || config.business.address.zip;
      config.business.serviceRadius = serviceRadius || config.business.serviceRadius;
      config.business.serviceArea = serviceArea || config.business.serviceArea;
      config.business.extraKmPrice = extraKmPrice || config.business.extraKmPrice;
      config.business.social.instagram = instagram || '';
      config.business.social.facebook = facebook || '';
      config.business.social.tiktok = tiktok || '';

      saveConfig(config);
      req.flash('success', 'Informations mises à jour.');
      res.redirect('/admin/settings');
    } catch (err) {
      console.error('Settings business error:', err);
      req.flash('error', 'Erreur lors de la mise à jour.');
      res.redirect('/admin/settings');
    }
  },

  async updateHours(req, res) {
    try {
      const hours = [];
      for (let i = 0; i <= 6; i++) {
        hours.push({
          dayOfWeek: i,
          openTime: req.body[`open_${i}`] || '09:00',
          closeTime: req.body[`close_${i}`] || '19:00',
          openTime2: req.body[`open2_${i}`] || null,
          closeTime2: req.body[`close2_${i}`] || null,
          isOpen: req.body[`is_open_${i}`] === 'on'
        });
      }
      await BusinessHour.updateAll(hours);
      req.flash('success', 'Horaires mis à jour.');
      res.redirect('/admin/settings');
    } catch (err) {
      console.error('Settings hours error:', err);
      req.flash('error', 'Erreur lors de la mise à jour des horaires.');
      res.redirect('/admin/settings');
    }
  },

  async updateTheme(req, res) {
    try {
      const config = getSiteConfig();
      const { primary, primaryDark, secondary, accent, gold, text, textLight, bg, bgLight } = req.validatedBody;

      if (primary) config.theme.colors.primary = primary;
      if (primaryDark) config.theme.colors.primaryDark = primaryDark;
      if (secondary) config.theme.colors.secondary = secondary;
      if (accent) config.theme.colors.accent = accent;
      if (gold) config.theme.colors.gold = gold;
      if (text) config.theme.colors.text = text;
      if (textLight) config.theme.colors.textLight = textLight;
      if (bg) config.theme.colors.bg = bg;
      if (bgLight) config.theme.colors.bgLight = bgLight;

      saveConfig(config);
      req.flash('success', 'Thème mis à jour.');
      res.redirect('/admin/settings');
    } catch (err) {
      console.error('Settings theme error:', err);
      req.flash('error', 'Erreur lors de la mise à jour du thème.');
      res.redirect('/admin/settings');
    }
  },

  async updateSeo(req, res) {
    try {
      const config = getSiteConfig();
      const { seoTitle, seoDescription, canonicalUrl, googleAnalyticsId } = req.validatedBody;

      config.seo.title = seoTitle || config.seo.title;
      config.seo.description = seoDescription || config.seo.description;
      config.seo.canonicalUrl = canonicalUrl || '';
      config.seo.googleAnalyticsId = googleAnalyticsId || '';

      saveConfig(config);
      req.flash('success', 'SEO mis à jour.');
      res.redirect('/admin/settings');
    } catch (err) {
      console.error('Settings SEO error:', err);
      req.flash('error', 'Erreur lors de la mise à jour SEO.');
      res.redirect('/admin/settings');
    }
  },

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.validatedBody;

      const user = await AdminUser.findById(req.session.adminUser.id);
      const valid = await AdminUser.verifyPassword(currentPassword, user.password_hash);

      if (!valid) {
        req.flash('error', 'Mot de passe actuel incorrect.');
        return res.redirect('/admin/settings');
      }

      await AdminUser.updatePassword(user.id, newPassword);
      req.flash('success', 'Mot de passe mis à jour.');
      res.redirect('/admin/settings');
    } catch (err) {
      console.error('Password update error:', err);
      req.flash('error', 'Erreur lors du changement de mot de passe.');
      res.redirect('/admin/settings');
    }
  }
};

module.exports = settingsController;
