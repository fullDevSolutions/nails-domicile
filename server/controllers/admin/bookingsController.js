const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const Client = require('../../models/Client');
const { sendBookingStatusUpdate } = require('../../utils/mailer');
const { formatDate, getMonthName, timeSlotLabels, statusLabels, statusColors } = require('../../utils/helpers');

const bookingsController = {
  async index(req, res) {
    try {
      const viewMode = req.query.view || 'calendar';

      if (viewMode === 'calendar') {
        const now = new Date();
        let calendarYear = now.getFullYear();
        let calendarMonth = now.getMonth();

        if (req.query.month) {
          const parts = req.query.month.split('-');
          calendarYear = parseInt(parts[0], 10);
          calendarMonth = parseInt(parts[1], 10) - 1;
        }

        const calendarData = await Booking.monthlyCalendarData(calendarYear, calendarMonth);
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        // 0=Monday ... 6=Sunday (ISO week)
        const rawDay = new Date(calendarYear, calendarMonth, 1).getDay();
        const firstDayOfWeek = rawDay === 0 ? 6 : rawDay - 1;

        const selectedDay = req.query.day || null;
        const selectedDayBookings = selectedDay && calendarData[selectedDay] ? calendarData[selectedDay] : [];

        const services = await Service.findAll();

        res.render('admin/bookings/index', {
          layout: 'layouts/admin',
          title: 'Réservations',
          isLoginPage: false,
          viewMode,
          calendarData,
          calendarYear,
          calendarMonth,
          calendarMonthName: getMonthName(calendarMonth),
          calendarDaysInMonth: daysInMonth,
          calendarFirstDayOfWeek: firstDayOfWeek,
          selectedDay,
          selectedDayBookings,
          services,
          bookings: [],
          filters: req.query,
          formatDate,
          timeSlotLabels,
          statusLabels,
          statusColors
        });
      } else {
        const { status, date_from, date_to, service_id } = req.query;
        const filters = {};
        if (status) filters.status = status;
        if (date_from) filters.dateFrom = date_from;
        if (date_to) filters.dateTo = date_to;
        if (service_id) filters.serviceId = service_id;

        const [bookings, services] = await Promise.all([
          Booking.findAll(filters),
          Service.findAll()
        ]);

        res.render('admin/bookings/index', {
          layout: 'layouts/admin',
          title: 'Réservations',
          isLoginPage: false,
          viewMode,
          calendarData: {},
          calendarYear: 0,
          calendarMonth: 0,
          calendarMonthName: '',
          calendarDaysInMonth: 0,
          calendarFirstDayOfWeek: 0,
          selectedDay: null,
          selectedDayBookings: [],
          bookings,
          services,
          filters: req.query,
          formatDate,
          timeSlotLabels,
          statusLabels,
          statusColors
        });
      }
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
      const booking = await Booking.findById(req.params.id);
      if (booking && booking.status === 'pending') {
        await Booking.updateStatus(req.params.id, 'confirmed');

        const client = await Client.findById(booking.client_id);
        const service = await Service.findById(booking.service_id);
        try {
          await sendBookingStatusUpdate(booking, client, service, 'confirmed');
        } catch (emailErr) {
          console.error('Confirm email failed:', emailErr.message);
        }
      }

      await Booking.markReminderSent(req.params.id);
      req.flash('success', 'RDV confirmé et rappel acquitté.');
      res.redirect('/admin');
    } catch (err) {
      console.error('Dismiss reminder error:', err);
      req.flash('error', 'Erreur lors de la confirmation.');
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
