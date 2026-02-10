const fs = require('fs');
const path = require('path');

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
  res.locals.site = siteConfig;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.currentPath = req.path;
  const baseUrl = siteConfig.seo.canonicalUrl || `${req.protocol}://${req.get('host')}`;
  res.locals.canonicalUrl = baseUrl + req.path;
  next();
}

module.exports = { siteConfigMiddleware, reloadConfig, getSiteConfig: () => siteConfig };
