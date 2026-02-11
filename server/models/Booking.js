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
      .orderBy('bookings.booking_date', 'desc')
      .orderBy('bookings.time_slot', 'asc');

    if (filters.status) {
      query = query.where('bookings.status', filters.status);
    }
    if (filters.dateFrom && filters.dateTo) {
      query = query.whereBetween('bookings.booking_date', [filters.dateFrom, filters.dateTo]);
    } else if (filters.dateFrom) {
      query = query.where('bookings.booking_date', '>=', filters.dateFrom);
    } else if (filters.dateTo) {
      query = query.where('bookings.booking_date', '<=', filters.dateTo);
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
      time_slot_end: data.timeSlotEnd,
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
      .orderBy('bookings.booking_date', 'desc')
      .orderBy('bookings.time_slot', 'asc');
  },

  async todayCount() {
    const today = new Date().toISOString().split('T')[0];
    const [{ count }] = await db('bookings')
      .where('booking_date', today)
      .whereNotIn('status', ['cancelled'])
      .count('id as count');
    return count;
  },

  async todayCancelledCount() {
    const today = new Date().toISOString().split('T')[0];
    const [{ count }] = await db('bookings')
      .where('booking_date', today)
      .where('status', 'cancelled')
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

  async monthForecastRevenue() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const [result] = await db('bookings')
      .whereIn('status', ['completed', 'confirmed'])
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
      .orderBy('bookings.time_slot', 'asc')
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
      .orderBy('bookings.time_slot', 'asc');
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

  /**
   * Check if a time range overlaps with any existing booking on the given date.
   */
  async isSlotAvailable(date, startTime, endTime) {
    const row = await db('bookings')
      .where('booking_date', date)
      .whereNot('status', 'cancelled')
      .where('time_slot', '<', endTime)
      .where('time_slot_end', '>', startTime)
      .first();
    return !row;
  },

  /**
   * Get available start times for a service on a given date.
   */
  async getAvailableSlots(date, durationMinutes, businessHours, blockedDatesSet) {
    const dateObj = new Date(date + 'T00:00:00');
    const dow = dateObj.getDay();

    // Find business hours for this day
    const bh = businessHours.find(h => h.day_of_week === dow);
    if (!bh || !bh.is_open) return [];

    // Check blocked date type
    const blockType = blockedDatesSet ? blockedDatesSet.get(date) : undefined;
    if (blockType === 'full') return [];

    // Build time ranges
    const ranges = [];
    if (bh.open_time && bh.close_time) {
      ranges.push({ start: bh.open_time.substring(0, 5), end: bh.close_time.substring(0, 5) });
    }
    if (bh.open_time_2 && bh.close_time_2) {
      ranges.push({ start: bh.open_time_2.substring(0, 5), end: bh.close_time_2.substring(0, 5) });
    }

    // Filter ranges for partial blocks
    const filteredRanges = ranges.filter((_, i) => {
      if (blockType === 'morning' && i === 0) return false;
      if (blockType === 'afternoon' && i === 1) return false;
      return true;
    });

    if (filteredRanges.length === 0) return [];

    // Generate possible start times (30-min steps)
    function timeToMin(t) {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    }
    function minToTime(m) {
      return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    }

    const starts = [];
    for (const range of filteredRanges) {
      const rangeStart = timeToMin(range.start);
      const rangeEnd = timeToMin(range.end);
      let t = rangeStart;
      while (t + durationMinutes <= rangeEnd) {
        starts.push(minToTime(t));
        t += 30;
      }
    }

    // Get existing bookings for this date
    const bookings = await db('bookings')
      .where('booking_date', date)
      .whereNot('status', 'cancelled')
      .select('time_slot', 'time_slot_end');

    // Filter out overlapping starts
    return starts.filter(s => {
      const sEnd = minToTime(timeToMin(s) + durationMinutes);
      return !bookings.some(b => s < b.time_slot_end && sEnd > b.time_slot);
    });
  },

  /**
   * Generate 30-min timeline slots for each day and map bookings onto them.
   */
  async monthlyCalendarDataEnhanced(year, month, businessHours, blockedDatesSet) {
    const monthStr = String(month + 1).padStart(2, '0');
    const firstDay = `${year}-${monthStr}-01`;
    const lastDate = new Date(year, month + 1, 0);
    const lastDayStr = `${year}-${monthStr}-${String(lastDate.getDate()).padStart(2, '0')}`;

    const rows = await db('bookings')
      .join('clients', 'bookings.client_id', 'clients.id')
      .join('services', 'bookings.service_id', 'services.id')
      .select(
        'bookings.id',
        'bookings.booking_date',
        'bookings.time_slot',
        'bookings.time_slot_end',
        'bookings.status',
        'bookings.total_price',
        'clients.first_name',
        'clients.last_name',
        'clients.phone',
        'services.name as service_name',
        'services.icon as service_icon'
      )
      .whereBetween('bookings.booking_date', [firstDay, lastDayStr])
      .orderBy('bookings.booking_date', 'asc')
      .orderBy('bookings.time_slot', 'asc');

    // Index business hours by day_of_week
    const hoursMap = {};
    for (const h of businessHours) {
      hoursMap[h.day_of_week] = h;
    }

    function timeToMin(t) {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    }
    function minToTime(m) {
      return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowHHMM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    const daysInMonth = lastDate.getDate();
    const result = {};

    // Group bookings by date
    const bookingsByDate = {};
    for (const row of rows) {
      const dateStr = new Date(row.booking_date).toISOString().split('T')[0];
      if (!bookingsByDate[dateStr]) bookingsByDate[dateStr] = [];
      bookingsByDate[dateStr].push(row);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(year, month, day);
      const dow = dateObj.getDay();
      const bh = hoursMap[dow];

      const blockType = blockedDatesSet.get(dayStr) || null;
      const isBlocked = blockType === 'full';
      const isOpen = bh ? bh.is_open : false;
      const isPast = dayStr < todayStr;

      const dayBookings = bookingsByDate[dayStr] || [];
      const activeBookings = dayBookings.filter(b => b.status !== 'cancelled');
      const cancelledBookings = dayBookings.filter(b => b.status === 'cancelled');

      // Build time ranges from business hours
      const ranges = [];
      if (bh && bh.open_time && bh.close_time) {
        ranges.push({
          start: bh.open_time.substring(0, 5),
          end: bh.close_time.substring(0, 5)
        });
      }
      if (bh && bh.open_time_2 && bh.close_time_2) {
        ranges.push({
          start: bh.open_time_2.substring(0, 5),
          end: bh.close_time_2.substring(0, 5)
        });
      }

      // Filter ranges for partial blocks
      const activeRanges = ranges.filter((_, i) => {
        if (blockType === 'morning' && i === 0) return false;
        if (blockType === 'afternoon' && i === 1) return false;
        return true;
      });

      // Generate 30-min slots
      const slots = [];
      if (isOpen && !isBlocked && activeRanges.length > 0) {
        for (const range of activeRanges) {
          const rangeStart = timeToMin(range.start);
          const rangeEnd = timeToMin(range.end);
          for (let t = rangeStart; t < rangeEnd; t += 30) {
            const slotStart = minToTime(t);
            const slotEnd = minToTime(t + 30);

            // Check if a booking covers this slot
            const booking = activeBookings.find(b =>
              b.time_slot < slotEnd && (b.time_slot_end || b.time_slot) > slotStart
            );

            // For today, mark past time slots as unavailable
            const isSlotPast = (dayStr === todayStr) && (slotStart <= nowHHMM);

            slots.push({
              time: slotStart,
              endTime: slotEnd,
              booking: booking || null,
              available: !booking && !isSlotPast
            });
          }
        }
      }

      const bookingCount = activeBookings.length;
      const availableCount = slots.filter(s => s.available).length;

      result[dayStr] = { isOpen, isBlocked, blockType, isPast, slots, bookingCount, availableCount, cancelledBookings };
    }

    return result;
  },

  async currentMonthStats() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    return db('bookings')
      .select(db.raw("DATE_FORMAT(booking_date, '%Y-%m-%d') as date"))
      .count('id as count')
      .whereBetween('booking_date', [firstDay, lastDay])
      .whereNotIn('status', ['cancelled'])
      .groupByRaw('DATE(booking_date)')
      .orderBy('date', 'asc');
  }
};

module.exports = Booking;
