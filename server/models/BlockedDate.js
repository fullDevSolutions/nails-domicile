const db = require('../../config/database');

const BlockedDate = {
  async findAll() {
    return db('blocked_dates').orderBy('blocked_date', 'asc');
  },

  async findAllDates() {
    const rows = await db('blocked_dates').select('blocked_date', 'is_recurring');
    return rows;
  },

  async isBlocked(date) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const exact = await db('blocked_dates').where({ blocked_date: dateStr }).first();
    if (exact) return true;

    // Check recurring dates (same month-day, any year)
    const month = String(new Date(date).getMonth() + 1).padStart(2, '0');
    const day = String(new Date(date).getDate()).padStart(2, '0');
    const recurring = await db('blocked_dates')
      .where({ is_recurring: true })
      .whereRaw('DATE_FORMAT(blocked_date, "%m-%d") = ?', [`${month}-${day}`])
      .first();
    return !!recurring;
  },

  async create(data) {
    const [id] = await db('blocked_dates').insert({
      blocked_date: data.blockedDate,
      reason: data.reason || null,
      is_recurring: data.isRecurring || false
    });
    return id;
  },

  async delete(id) {
    return db('blocked_dates').where({ id }).del();
  }
};

module.exports = BlockedDate;
