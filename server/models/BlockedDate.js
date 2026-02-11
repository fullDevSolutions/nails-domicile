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
    if (exact) return exact.block_type || 'full';

    // Check recurring dates (same month-day, any year)
    const month = String(new Date(date).getMonth() + 1).padStart(2, '0');
    const day = String(new Date(date).getDate()).padStart(2, '0');
    const recurring = await db('blocked_dates')
      .where({ is_recurring: true })
      .whereRaw('DATE_FORMAT(blocked_date, "%m-%d") = ?', [`${month}-${day}`])
      .first();
    return recurring ? (recurring.block_type || 'full') : null;
  },

  async findBlockedDatesInRange(startDate, endDate) {
    const rows = await db('blocked_dates').select('blocked_date', 'is_recurring', 'block_type');
    const blocked = new Map();
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const row of rows) {
      const d = new Date(row.blocked_date);
      const blockType = row.block_type || 'full';
      if (row.is_recurring) {
        // Match same month-day for each day in range
        const cur = new Date(start);
        while (cur <= end) {
          if (cur.getMonth() === d.getMonth() && cur.getDate() === d.getDate()) {
            blocked.set(cur.toISOString().split('T')[0], blockType);
          }
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        const dateStr = d.toISOString().split('T')[0];
        if (d >= start && d <= end) {
          blocked.set(dateStr, blockType);
        }
      }
    }
    return blocked;
  },

  async create(data) {
    const [id] = await db('blocked_dates').insert({
      blocked_date: data.blockedDate,
      reason: data.reason || null,
      is_recurring: data.isRecurring || false,
      block_type: data.blockType || 'full'
    });
    return id;
  },

  async delete(id) {
    return db('blocked_dates').where({ id }).del();
  }
};

module.exports = BlockedDate;
