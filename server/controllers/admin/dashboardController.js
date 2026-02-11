const Booking = require('../../models/Booking');
const Client = require('../../models/Client');
const { formatDate, formatTimeSlot, statusLabels, statusColors } = require('../../utils/helpers');

const dashboardController = {
  async index(req, res) {
    try {
      const [todayCount, todayCancelled, pendingCount, clientCount, monthRevenue, monthForecast, upcoming, chartData, reminders] = await Promise.all([
        Booking.todayCount(),
        Booking.todayCancelledCount(),
        Booking.pendingCount(),
        Client.count(),
        Booking.monthRevenue(),
        Booking.monthForecastRevenue(),
        Booking.upcoming(5),
        Booking.currentMonthStats(),
        Booking.needingReminder()
      ]);

      res.render('admin/dashboard', {
        layout: 'layouts/admin',
        title: 'Dashboard',
        isLoginPage: false,
        stats: { todayCount, todayCancelled, pendingCount, clientCount, monthRevenue, monthForecast },
        upcoming,
        chartData,
        reminders,
        formatDate,
        formatTimeSlot,
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
        stats: { todayCount: 0, todayCancelled: 0, pendingCount: 0, clientCount: 0, monthRevenue: 0, monthForecast: 0 },
        upcoming: [],
        chartData: [],
        reminders: [],
        formatDate,
        formatTimeSlot,
        statusLabels,
        statusColors
      });
    }
  }
};

module.exports = dashboardController;
