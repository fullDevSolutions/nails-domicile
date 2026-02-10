const Booking = require('../../models/Booking');
const Client = require('../../models/Client');
const { formatDate, timeSlotLabels, statusLabels, statusColors } = require('../../utils/helpers');

const dashboardController = {
  async index(req, res) {
    try {
      const [todayCount, pendingCount, clientCount, monthRevenue, upcoming, chartData, reminders] = await Promise.all([
        Booking.todayCount(),
        Booking.pendingCount(),
        Client.count(),
        Booking.monthRevenue(),
        Booking.upcoming(5),
        Booking.last30DaysStats(),
        Booking.needingReminder()
      ]);

      res.render('admin/dashboard', {
        layout: 'layouts/admin',
        title: 'Dashboard',
        isLoginPage: false,
        stats: { todayCount, pendingCount, clientCount, monthRevenue },
        upcoming,
        chartData,
        reminders,
        formatDate,
        timeSlotLabels,
        statusLabels,
        statusColors
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      req.flash('error', 'Erreur lors du chargement du dashboard.');
      res.render('admin/dashboard', {
        layout: 'layouts/admin',
        title: 'Dashboard',
        isLoginPage: false,
        stats: { todayCount: 0, pendingCount: 0, clientCount: 0, monthRevenue: 0 },
        upcoming: [],
        chartData: [],
        reminders: [],
        formatDate,
        timeSlotLabels,
        statusLabels,
        statusColors
      });
    }
  }
};

module.exports = dashboardController;
