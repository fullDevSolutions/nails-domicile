const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const Client = require('../../models/Client');
const { sendBookingStatusUpdate } = require('../../utils/mailer');
const { formatDate, timeSlotLabels, statusLabels, statusColors } = require('../../utils/helpers');

const bookingsController = {
  async index(req, res) {
    try {
      const { status, date, service_id } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (date) filters.date = date;
      if (service_id) filters.serviceId = service_id;

      const [bookings, services] = await Promise.all([
        Booking.findAll(filters),
        Service.findAll()
      ]);

      res.render('admin/bookings/index', {
        layout: 'layouts/admin',
        title: 'Réservations',
        isLoginPage: false,
        bookings,
        services,
        filters: req.query,
        formatDate,
        timeSlotLabels,
        statusLabels,
        statusColors
      });
    } catch (err) {
      console.error('Bookings list error:', err);
      req.flash('error', 'Erreur lors du chargement des réservations.');
      res.redirect('/admin');
    }
  },

  async show(req, res) {
    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        req.flash('error', 'Réservation introuvable.');
        return res.redirect('/admin/bookings');
      }

      res.render('admin/bookings/show', {
        layout: 'layouts/admin',
        title: `Réservation #${booking.id}`,
        isLoginPage: false,
        booking,
        formatDate,
        timeSlotLabels,
        statusLabels,
        statusColors
      });
    } catch (err) {
      console.error('Booking show error:', err);
      req.flash('error', 'Erreur lors du chargement de la réservation.');
      res.redirect('/admin/bookings');
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(status)) {
        req.flash('error', 'Statut invalide.');
        return res.redirect('back');
      }

      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        req.flash('error', 'Réservation introuvable.');
        return res.redirect('/admin/bookings');
      }

      await Booking.updateStatus(req.params.id, status);

      // Send email notification
      const client = await Client.findById(booking.client_id);
      const service = await Service.findById(booking.service_id);
      try {
        await sendBookingStatusUpdate(booking, client, service, status);
      } catch (emailErr) {
        console.error('Status email failed:', emailErr.message);
      }

      req.flash('success', `Statut mis à jour : ${statusLabels[status]}`);
      res.redirect(`/admin/bookings/${req.params.id}`);
    } catch (err) {
      console.error('Status update error:', err);
      req.flash('error', 'Erreur lors de la mise à jour du statut.');
      res.redirect('back');
    }
  },

  async dismissReminder(req, res) {
    try {
      await Booking.markReminderSent(req.params.id);
      req.flash('success', 'Rappel acquitté.');
      res.redirect('/admin');
    } catch (err) {
      console.error('Dismiss reminder error:', err);
      req.flash('error', 'Erreur lors de l\'acquittement du rappel.');
      res.redirect('/admin');
    }
  },

  async destroy(req, res) {
    try {
      await Booking.delete(req.params.id);
      req.flash('success', 'Réservation supprimée.');
      res.redirect('/admin/bookings');
    } catch (err) {
      console.error('Booking delete error:', err);
      req.flash('error', 'Erreur lors de la suppression.');
      res.redirect('/admin/bookings');
    }
  }
};

module.exports = bookingsController;
