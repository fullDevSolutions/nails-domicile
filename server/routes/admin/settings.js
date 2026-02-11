const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const settingsController = require('../../controllers/admin/settingsController');
const { validate, businessSchema, themeSchema, seoSchema, passwordSchema } = require('../../middleware/validator');
const { settingsLimiter } = require('../../middleware/rateLimiter');

router.use(isAuthenticated);
router.use(settingsLimiter);

router.get('/', settingsController.index);
router.post('/business', validate(businessSchema), settingsController.updateBusiness);
router.post('/hours', settingsController.updateHours);
router.post('/theme', validate(themeSchema), settingsController.updateTheme);
router.post('/seo', validate(seoSchema), settingsController.updateSeo);
router.post('/password', validate(passwordSchema), settingsController.updatePassword);

module.exports = router;
