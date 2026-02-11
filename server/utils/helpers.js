const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'span']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height'],
    span: ['style'],
    p: ['style'],
    div: ['style']
  },
  allowedStyles: {
    '*': { 'text-align': [/^left$/, /^right$/, /^center$/], 'color': [/^#[0-9a-fA-F]{3,6}$/] }
  }
};

function sanitizeContent(html) {
  if (!html) return '';
  return sanitizeHtml(html, sanitizeOptions);
}

function sanitizeText(str) {
  if (!str) return '';
  return str.replace(/[\r\n]/g, '').trim();
}

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatPrice(price) {
  return parseFloat(price).toFixed(2).replace('.', ',');
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

function formatDateTime(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

const timeSlotLabels = {
  matin: 'Matin (9h-12h)',
  midi: 'Midi (12h-14h)',
  apresmidi: 'Après-midi (14h-17h)',
  soir: 'Fin de journée (17h-19h)'
};

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show: 'Absent'
};

const statusColors = {
  pending: '#f0ad4e',
  confirmed: '#5cb85c',
  completed: '#0275d8',
  cancelled: '#d9534f',
  no_show: '#868e96'
};

function maskPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\s/g, '');
  if (digits.length < 4) return '••••';
  return digits.slice(0, 2) + ' •• •• •• ' + digits.slice(-2);
}

const monthNames = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function getMonthName(month) {
  return monthNames[month] || '';
}

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return '••••';
  return local[0] + '•••@' + domain;
}

module.exports = {
  sanitizeContent,
  sanitizeText,
  slugify,
  formatPrice,
  formatDate,
  formatDateTime,
  getMonthName,
  maskPhone,
  maskEmail,
  timeSlotLabels,
  statusLabels,
  statusColors
};
