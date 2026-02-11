const session = require('express-session');
const { ConnectSessionKnexStore } = require('connect-session-knex');
const db = require('./database');

const store = new ConnectSessionKnexStore({
  knex: db,
  tablename: 'sessions',
  createtable: false,
  clearInterval: 60000 * 60 // Clean expired sessions every hour
});

const sessionConfig = {
  store,
  secret: (() => {
    if (!process.env.SESSION_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('SESSION_SECRET environment variable is required in production');
      }
      return 'dev-secret-change-me-in-production';
    }
    return process.env.SESSION_SECRET;
  })(),
  resave: false,
  saveUninitialized: false,
  name: 'nails.sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

module.exports = sessionConfig;
