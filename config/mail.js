const nodemailer = require('nodemailer');

let transporter;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  // Dev: log emails to console
  transporter = {
    sendMail: async (options) => {
      console.log('=== EMAIL (dev mode) ===');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('========================');
      return { messageId: 'dev-' + Date.now() };
    }
  };
}

module.exports = transporter;
