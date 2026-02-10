const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const settingsController = require('../../controllers/admin/settingsController');

router.use(isAuthenticated);

router.get('/', settingsController.index);
router.post('/business', settingsController.updateBusiness);
router.post('/hours', settingsController.updateHours);
router.post('/theme', settingsController.updateTheme);
router.post('/seo', settingsController.updateSeo);
router.post('/password', settingsController.updatePassword);

module.exports = router;
