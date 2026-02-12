const Booking = require('../../models/Booking');
const Service = require('../../models/Service');
const Client = require('../../models/Client');
const BusinessHour = require('../../models/BusinessHour');
const BlockedDate = require('../../models/BlockedDate');
const { sendBookingStatusUpdate } = require('../../utils/mailer');
const { formatDate, getMonthName, formatTimeSlot, statusLabels, statusColors } = require('../../utils/helpers');
const { validateBooking, createBookingForClient } = require('../../services/bookingService');

const isDemoMode = process.env.DEMO_MODE === 'true';

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

        const monthStr = String(calendarMonth + 1).padStart(2, '0');
        const firstDay = `${calendarYear}-${monthStr}-01`;
        const lastDate = new Date(calendarYear, calendarMonth + 1, 0);
        const lastDayStr = `${calendarYear}-${monthStr}-${String(lastDate.getDate()).padStart(2, '0')}`;

        const [businessHours, blockedDatesSet, services] = await Promise.all([
          BusinessHour.findAll(),
          BlockedDate.findBlockedDatesInRange(firstDay, lastDayStr),
          Service.findAll()
        ]);

        const calendarData = await Booking.monthlyCalendarDataEnhanced(calendarYear, calendarMonth, businessHours, blockedDatesSet);
        const daysInMonth = lastDate.getDate();
        const rawDay = new Date(calendarYear, calendarMonth, 1).getDay();
        const firstDayOfWeek = rawDay === 0 ? 6 : rawDay - 1;

        // Week mode support
        const calMode = req.query.calMode || 'month';
        let weekStart = null;
        let weekDays = [];
        let prevWeekStart = null;
        let nextWeekStart = null;
        let prevWeekMonthParam = null;
        let nextWeekMonthParam = null;
        let weekNumber = null;

        if (calMode === 'week') {
          weekStart = req.query.weekStart || null;
          if (!weekStart) {
            const nowDate = new Date();
            let refDate;
            if (calendarYear === nowDate.getFullYear() && calendarMonth === nowDate.getMonth()) {
              refDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
            } else {
              refDate = new Date(calendarYear, calendarMonth, 1);
            }
            const dow = refDate.getDay();
            const mondayDiff = dow === 0 ? -6 : 1 - dow;
            refDate.setDate(refDate.getDate() + mondayDiff);
            weekStart = refDate.getFullYear() + '-' + String(refDate.getMonth() + 1).padStart(2, '0') + '-' + String(refDate.getDate()).padStart(2, '0');
          }

          const wsDate = new Date(weekStart + 'T00:00:00');
          for (let i = 0; i < 7; i++) {
            const d = new Date(wsDate);
            d.setDate(d.getDate() + i);
            weekDays.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
          }

          const prevWs = new Date(wsDate);
          prevWs.setDate(prevWs.getDate() - 7);
          prevWeekStart = prevWs.getFullYear() + '-' + String(prevWs.getMonth() + 1).padStart(2, '0') + '-' + String(prevWs.getDate()).padStart(2, '0');
          prevWeekMonthParam = prevWs.getFullYear() + '-' + String(prevWs.getMonth() + 1).padStart(2, '0');

          const nextWs = new Date(wsDate);
          nextWs.setDate(nextWs.getDate() + 7);
          nextWeekStart = nextWs.getFullYear() + '-' + String(nextWs.getMonth() + 1).padStart(2, '0') + '-' + String(nextWs.getDate()).padStart(2, '0');
          nextWeekMonthParam = nextWs.getFullYear() + '-' + String(nextWs.getMonth() + 1).padStart(2, '0');

          // ISO week number
          const thuDate = new Date(wsDate);
          thuDate.setDate(thuDate.getDate() + 3);
          const jan4 = new Date(thuDate.getFullYear(), 0, 4);
          const jan4Day = jan4.getDay() || 7;
          const mondayW1 = new Date(jan4);
          mondayW1.setDate(jan4.getDate() - jan4Day + 1);
          weekNumber = 1 + Math.round((thuDate - mondayW1) / 604800000);
        }

        const selectedDay = req.query.day || null;
        let selectedDayBookings = [];
        let selectedDaySlots = [];
        if (selectedDay && calendarData[selectedDay]) {
          const dayData = calendarData[selectedDay];
          selectedDaySlots = dayData.slots;
          // Gather unique bookings from slots + cancelled
          const seenIds = new Set();
          const slotBookings = [];
          for (const s of dayData.slots) {
            if (s.booking && !seenIds.has(s.booking.id)) {
              seenIds.add(s.booking.id);
              slotBookings.push(s.booking);
            }
          }
          selectedDayBookings = [...slotBookings, ...dayData.cancelledBookings];
        }

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
          calMode,
          weekStart,
          weekDays,
          prevWeekStart,
          nextWeekStart,
          prevWeekMonthParam,
          nextWeekMonthParam,
          weekNumber,
          selectedDay,
          selectedDayBookings,
          selectedDaySlots,
          services,
          bookings: [],
          filters: req.query,
          formatDate,
          formatTimeSlot,
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
          calMode: 'month',
          weekStart: null,
          weekDays: [],
          prevWeekStart: null,
          nextWeekStart: null,
          prevWeekMonthParam: null,
          nextWeekMonthParam: null,
          weekNumber: null,
          selectedDay: null,
          selectedDayBookings: [],
          selectedDaySlots: [],
          bookings,
          services,
          filters: req.query,
          formatDate,
          formatTimeSlot,
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

  async store(req, res) {
    try {
      const data = req.validatedBody;

      const result = await validateBooking(data);
      if (result.error) {
        return res.status(400).json({ success: false, errors: [result.error] });
      }

      const { service, timeSlotEnd, totalPrice, selectedOptions } = result;
      const status = data.status || 'confirmed';

      const { bookingId } = await createBookingForClient(data, {
        service, timeSlotEnd, totalPrice, selectedOptions, status
      });

      return res.json({ success: true, booking: { id: bookingId, totalPrice, status } });
    } catch (err) {
      console.error('Admin booking store error:', err);
      return res.status(500).json({ success: false, errors: ['Erreur serveur lors de la création.'] });
    }
  },

  async searchClients(req, res) {
    try {
      if (isDemoMode) {
        return res.json([]);
      }
      const q = (req.query.q || '').trim();
      if (q.length < 2) {
        return res.json([]);
      }
      const { rows: clients } = await Client.findAll(q, 1);
      const results = clients.slice(0, 10).map(c => ({
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        phone: c.phone,
        email: c.email || '',
        address: c.address || ''
      }));
      return res.json(results);
    } catch (err) {
      console.error('Search clients error:', err);
      return res.json([]);
    }
  },

  async calendarData(req, res) {
    try {
      const year = parseInt(req.query.year, 10) || new Date().getFullYear();
      const month = parseInt(req.query.month, 10) - 1;

      const monthStr = String(month + 1).padStart(2, '0');
      const firstDay = `${year}-${monthStr}-01`;
      const lastDate = new Date(year, month + 1, 0);
      const lastDayStr = `${year}-${monthStr}-${String(lastDate.getDate()).padStart(2, '0')}`;

      const [businessHours, blockedDatesSet] = await Promise.all([
        BusinessHour.findAll(),
        BlockedDate.findBlockedDatesInRange(firstDay, lastDayStr)
      ]);

      const data = await Booking.monthlyCalendarDataEnhanced(year, month, businessHours, blockedDatesSet);

      return res.json({ success: true, data });
    } catch (err) {
      console.error('Calendar data error:', err);
      return res.status(500).json({ success: false, errors: ['Erreur serveur.'] });
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
        formatTimeSlot,
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
