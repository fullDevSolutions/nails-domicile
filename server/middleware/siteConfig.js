const fs = require('fs');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const { maskPhone, maskEmail, maskAddress, maskName } = require('../utils/helpers');

function sanitizeLogoText(text) {
  if (!text) return '';
  return sanitizeHtml(text, {
    allowedTags: ['span'],
    allowedAttributes: { span: ['class'] }
  });
}

const configPath = path.join(__dirname, '../../config/site.config.json');
let siteConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function reloadConfig() {
  try {
    siteConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('Error reloading site config:', err.message);
  }
}

function siteConfigMiddleware(req, res, next) {
  const safeConfig = { ...siteConfig, theme: { ...siteConfig.theme, logo: { ...siteConfig.theme.logo, text: sanitizeLogoText(siteConfig.theme.logo.text) } } };
  res.locals.site = safeConfig;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.currentPath = req.path;
  const isDemo = process.env.DEMO_MODE === 'true';
  res.locals.demoMode = isDemo;
  res.locals.maskPhone = isDemo ? maskPhone : (p) => p;
  res.locals.maskEmail = isDemo ? maskEmail : (e) => e;
  res.locals.maskAddress = isDemo ? maskAddress : (a) => a;
  res.locals.maskName = isDemo ? maskName : (n) => n;
  const baseUrl = siteConfig.seo.canonicalUrl || `${req.protocol}://${req.get('host')}`;
  res.locals.canonicalUrl = baseUrl + req.path;
  next();
}

module.exports = { siteConfigMiddleware, reloadConfig, getSiteConfig: () => siteConfig };
