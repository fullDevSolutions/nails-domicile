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
  secret: process.env.SESSION_SECRET || 'change-me',
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
