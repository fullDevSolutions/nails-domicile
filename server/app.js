const express = require('express');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

const { siteConfigMiddleware } = require('./middleware/siteConfig');
const csrfProtection = require('./middleware/csrf');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(expressLayouts);
app.set('layout', 'layouts/public');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://images.unsplash.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Method override (for DELETE from forms via ?_method=DELETE)
app.use((req, res, next) => {
  if (req.query._method) {
    req.method = req.query._method.toUpperCase();
  }
  next();
});

// Static files
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0
}));

// Rate limiting
app.use(generalLimiter);

// Session
const sessionConfig = require('../config/session');
app.use(session(sessionConfig));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.flashMessages = {
    success: req.flash('success'),
    error: req.flash('error'),
    info: req.flash('info')
  };
  next();
});

// CSRF Protection
app.use(csrfProtection);

// Site config (available in all views)
app.use(siteConfigMiddleware);

// Admin reminder count middleware
const Booking = require('./models/Booking');
app.use('/admin', async (req, res, next) => {
  if (req.session && req.session.adminUser) {
    try {
      res.locals.reminderCount = await Booking.reminderCount();
    } catch {
      res.locals.reminderCount = 0;
    }
  }
  next();
});

// Routes
const publicRoutes = require('./routes/public');
const bookingApiRoutes = require('./routes/api/bookings');
const adminAuthRoutes = require('./routes/admin/auth');
const adminDashboardRoutes = require('./routes/admin/dashboard');
const adminBookingRoutes = require('./routes/admin/bookings');
const adminClientRoutes = require('./routes/admin/clients');
const adminServiceRoutes = require('./routes/admin/services');
const adminGalleryRoutes = require('./routes/admin/gallery');
const adminTestimonialRoutes = require('./routes/admin/testimonials');
const adminSettingsRoutes = require('./routes/admin/settings');
const adminBlockedDatesRoutes = require('./routes/admin/blockedDates');
const adminBlogRoutes = require('./routes/admin/blog');

app.use('/', publicRoutes);
app.use('/api/bookings', bookingApiRoutes);
app.use('/admin', adminAuthRoutes);
app.use('/admin', adminDashboardRoutes);
app.use('/admin/bookings', adminBookingRoutes);
app.use('/admin/clients', adminClientRoutes);
app.use('/admin/services', adminServiceRoutes);
app.use('/admin/gallery', adminGalleryRoutes);
app.use('/admin/testimonials', adminTestimonialRoutes);
app.use('/admin/settings', adminSettingsRoutes);
app.use('/admin/blocked-dates', adminBlockedDatesRoutes);
app.use('/admin/blog', adminBlogRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('public/404', {
    layout: 'layouts/public',
    title: 'Page non trouvée'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('public/500', {
    layout: 'layouts/public',
    title: 'Erreur serveur'
  });
});

module.exports = app;
