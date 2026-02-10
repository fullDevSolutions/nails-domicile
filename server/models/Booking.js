const db = require('../../config/database');

const Booking = {
  async findAll(filters = {}) {
    let query = db('bookings')
      .join('clients', 'bookings.client_id', 'clients.id')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'clients.first_name', 'clients.last_name', 'clients.phone', 'clients.email',
        'services.name as service_name', 'services.icon as service_icon'
      )
      .orderBy('bookings.booking_date', 'desc');

    if (filters.status) {
      query = query.where('bookings.status', filters.status);
    }
    if (filters.date) {
      query = query.where('bookings.booking_date', filters.date);
    }
    if (filters.serviceId) {
      query = query.where('bookings.service_id', filters.serviceId);
    }

    return query;
  },

  async findById(id) {
    const row = await db('bookings')
      .join('clients', 'bookings.client_id', 'clients.id')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'clients.first_name', 'clients.last_name', 'clients.phone',
        'clients.email', 'clients.address as client_address',
        'services.name as service_name', 'services.icon as service_icon',
        'services.price as service_price', 'services.duration_minutes'
      )
      .where('bookings.id', id)
      .first();
    return row ? Booking.parseJson(row) : null;
  },

  async create(data) {
    const [id] = await db('bookings').insert({
      client_id: data.clientId,
      service_id: data.serviceId,
      booking_date: data.date,
      time_slot: data.timeSlot,
      address: data.address,
      notes: data.notes || null,
      selected_options: data.selectedOptions ? JSON.stringify(data.selectedOptions) : null,
      status: 'pending',
      total_price: data.totalPrice
    });
    return id;
  },

  async updateStatus(id, status) {
    return db('bookings').where({ id }).update({ status });
  },

  async delete(id) {
    return db('bookings').where({ id }).del();
  },

  async findByClientId(clientId) {
    return db('bookings')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'services.name as service_name', 'services.icon as service_icon'
      )
      .where('bookings.client_id', clientId)
      .orderBy('bookings.booking_date', 'desc');
  },

  async todayCount() {
    const today = new Date().toISOString().split('T')[0];
    const [{ count }] = await db('bookings')
      .where('booking_date', today)
      .whereNotIn('status', ['cancelled'])
      .count('id as count');
    return count;
  },

  async pendingCount() {
    const [{ count }] = await db('bookings')
      .where('status', 'pending')
      .count('id as count');
    return count;
  },

  async monthRevenue() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [result] = await db('bookings')
      .where('status', 'completed')
      .whereBetween('booking_date', [firstDay, lastDay])
      .sum('total_price as total');
    return result.total || 0;
  },

  async upcoming(limit = 5) {
    const today = new Date().toISOString().split('T')[0];
    return db('bookings')
      .join('clients', 'bookings.client_id', 'clients.id')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'clients.first_name', 'clients.last_name', 'clients.phone',
        'services.name as service_name', 'services.icon as service_icon'
      )
      .where('bookings.booking_date', '>=', today)
      .whereIn('bookings.status', ['pending', 'confirmed'])
      .orderBy('bookings.booking_date', 'asc')
      .orderByRaw("FIELD(bookings.time_slot, 'matin', 'midi', 'apresmidi', 'soir')")
      .limit(limit);
  },

  async needingReminder() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return db('bookings')
      .join('clients', 'bookings.client_id', 'clients.id')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.*',
        'clients.first_name', 'clients.last_name', 'clients.phone',
        'services.name as service_name', 'services.icon as service_icon'
      )
      .whereIn('bookings.booking_date', [today, tomorrowStr])
      .whereIn('bookings.status', ['pending', 'confirmed'])
      .where('bookings.reminder_sent', false)
      .orderBy('bookings.booking_date', 'asc')
      .orderByRaw("FIELD(bookings.time_slot, 'matin', 'midi', 'apresmidi', 'soir')");
  },

  async markReminderSent(id) {
    return db('bookings').where({ id }).update({
      reminder_sent: true,
      reminder_sent_at: new Date()
    });
  },

  async reminderCount() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [{ count }] = await db('bookings')
      .whereIn('booking_date', [today, tomorrowStr])
      .whereIn('status', ['pending', 'confirmed'])
      .where('reminder_sent', false)
      .count('id as count');
    return count;
  },

  parseJson(row) {
    if (row.selected_options && typeof row.selected_options === 'string') {
      try { row.selected_options = JSON.parse(row.selected_options); } catch { row.selected_options = []; }
    }
    return row;
  },

  async last30DaysStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    return db('bookings')
      .select(db.raw('DATE(booking_date) as date'))
      .count('id as count')
      .where('booking_date', '>=', startDate)
      .whereNotIn('status', ['cancelled'])
      .groupByRaw('DATE(booking_date)')
      .orderBy('date', 'asc');
  }
};

module.exports = Booking;
