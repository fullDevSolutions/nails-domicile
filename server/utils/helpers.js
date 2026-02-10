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

module.exports = {
  slugify,
  formatPrice,
  formatDate,
  formatDateTime,
  timeSlotLabels,
  statusLabels,
  statusColors
};
