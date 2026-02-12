const BlockedDate = require('../../models/BlockedDate');
const { formatDate } = require('../../utils/helpers');

const blockedDatesController = {
  async index(req, res) {
    try {
      const blockedDates = await BlockedDate.findAll();

      res.render('admin/blocked-dates/index', {
        layout: 'layouts/admin',
        title: 'Dates bloquées',
        isLoginPage: false,
        blockedDates,
        formatDate
      });
    } catch (err) {
      console.error('Blocked dates list error:', err);
      req.flash('error', 'Erreur lors du chargement des dates bloquées.');
      res.redirect('/admin');
    }
  },

  async store(req, res) {
    try {
      const data = req.validatedBody;
      await BlockedDate.create(data);
      req.flash('success', 'Date bloquée ajoutée avec succès.');
      res.redirect('/admin/blocked-dates');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        req.flash('error', 'Cette date est déjà bloquée.');
      } else {
        console.error('Blocked date create error:', err);
        req.flash('error', 'Erreur lors de l\'ajout de la date.');
      }
      res.redirect('/admin/blocked-dates');
    }
  },

  async destroy(req, res) {
    try {
      await BlockedDate.delete(req.params.id);
      req.flash('success', 'Date débloquée avec succès.');
      res.redirect('/admin/blocked-dates');
    } catch (err) {
      console.error('Blocked date delete error:', err);
      req.flash('error', 'Erreur lors de la suppression.');
      res.redirect('/admin/blocked-dates');
    }
  }
};

module.exports = blockedDatesController;
