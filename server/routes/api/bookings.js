const express = require('express');
const router = express.Router();
const { bookingLimiter } = require('../../middleware/rateLimiter');
const { validate, bookingSchema } = require('../../middleware/validator');
const bookingController = require('../../controllers/bookingController');
const Booking = require('../../models/Booking');
const BlockedDate = require('../../models/BlockedDate');
const BusinessHour = require('../../models/BusinessHour');
const Service = require('../../models/Service');
const { addMinutesToTime, formatTimeSlot } = require('../../utils/helpers');

router.post('/', bookingLimiter, validate(bookingSchema), bookingController.create);

// Public API: available time slots for a given date + service
router.get('/available-slots', async (req, res) => {
  try {
    const { date, serviceId } = req.query;
    if (!date || !serviceId) {
      return res.status(400).json({ success: false, error: 'Date et serviceId requis' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service introuvable' });
    }

    const [businessHours, blockedDatesSet] = await Promise.all([
      BusinessHour.findAll(),
      BlockedDate.findBlockedDatesInRange(date, date)
    ]);

    const slots = await Booking.getAvailableSlots(date, service.duration_minutes, businessHours, blockedDatesSet);

    const formatted = slots.map(s => {
      const end = addMinutesToTime(s, service.duration_minutes);
      return {
        start: s,
        end,
        label: formatTimeSlot(s) + ' - ' + formatTimeSlot(end)
      };
    });

    res.json({ success: true, slots: formatted, duration: service.duration_minutes });
  } catch (err) {
    console.error('Available slots API error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Public API: blocked dates + closed days
router.get('/blocked-dates', async (req, res) => {
  try {
    const [blockedDates, businessHours] = await Promise.all([
      BlockedDate.findAllDates(),
      BusinessHour.findAll()
    ]);

    const closedDays = businessHours
      .filter(h => !h.is_open)
      .map(h => h.day_of_week);

    res.json({ success: true, blockedDates, closedDays });
  } catch (err) {
    console.error('Blocked dates API error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

// Public API: service options + base price
router.get('/service-options/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service introuvable' });
    }
    res.json({
      success: true,
      options: service.options || [],
      price: service.price,
      name: service.name
    });
  } catch (err) {
    console.error('Service options API error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

module.exports = router;
