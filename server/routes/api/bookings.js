const express = require('express');
const router = express.Router();
const { bookingLimiter } = require('../../middleware/rateLimiter');
const { validate, bookingSchema } = require('../../middleware/validator');
const bookingController = require('../../controllers/bookingController');
const BlockedDate = require('../../models/BlockedDate');
const BusinessHour = require('../../models/BusinessHour');
const Service = require('../../models/Service');

router.post('/', bookingLimiter, validate(bookingSchema), bookingController.create);

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
