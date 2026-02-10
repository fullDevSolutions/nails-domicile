const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const bookingsController = require('../../controllers/admin/bookingsController');

router.use(isAuthenticated);

router.get('/', bookingsController.index);
router.get('/:id', bookingsController.show);
router.post('/:id/status', bookingsController.updateStatus);
router.post('/:id/dismiss-reminder', bookingsController.dismissReminder);
router.delete('/:id', bookingsController.destroy);

module.exports = router;
