const db = require('../../config/database');
const { toLocalDateStr } = require('../utils/helpers');

const BlockedDate = {
  async findAll() {
    return db('blocked_dates').orderBy('blocked_date', 'asc');
  },

  async findAllDates() {
    const rows = await db('blocked_dates').select('blocked_date', 'is_recurring');
    return rows;
  },

  async isBlocked(date) {
    const dateStr = toLocalDateStr(new Date(date));
    const exact = await db('blocked_dates').where({ blocked_date: dateStr }).first();
    if (exact) return exact.block_type || 'full';

    // Check recurring dates (same month-day, any year)
    const dateObj = new Date(date);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const mmdd = `${month}-${day}`;

    // Use LPAD + MONTH/DAY functions instead of DATE_FORMAT for portability
    const recurring = await db('blocked_dates')
      .where({ is_recurring: true })
      .whereRaw(
        'CONCAT(LPAD(MONTH(blocked_date),2,"0"), "-", LPAD(DAY(blocked_date),2,"0")) = ?',
        [mmdd]
      )
      .first();
    return recurring ? (recurring.block_type || 'full') : null;
  },

  async findBlockedDatesInRange(startDate, endDate) {
    const rows = await db('blocked_dates').select('blocked_date', 'is_recurring', 'block_type');
    const blocked = new Map();
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    for (const row of rows) {
      const d = new Date(row.blocked_date);
      const blockType = row.block_type || 'full';
      if (row.is_recurring) {
        // Match same month-day for each day in range
        const cur = new Date(start);
        while (cur <= end) {
          if (cur.getMonth() === d.getMonth() && cur.getDate() === d.getDate()) {
            blocked.set(toLocalDateStr(cur), blockType);
          }
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        const dateStr = toLocalDateStr(d);
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
