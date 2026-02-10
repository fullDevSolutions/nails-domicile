const db = require('../../config/database');

const BusinessHour = {
  async findAll() {
    return db('business_hours').orderBy('day_of_week', 'asc');
  },

  async update(dayOfWeek, data) {
    return db('business_hours').where({ day_of_week: dayOfWeek }).update({
      open_time: data.openTime,
      close_time: data.closeTime,
      is_open: data.isOpen
    });
  },

  async updateAll(hours) {
    const trx = await db.transaction();
    try {
      for (const h of hours) {
        await trx('business_hours').where({ day_of_week: h.dayOfWeek }).update({
          open_time: h.openTime || '09:00',
          close_time: h.closeTime || '19:00',
          is_open: h.isOpen
        });
      }
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }
};

module.exports = BusinessHour;
