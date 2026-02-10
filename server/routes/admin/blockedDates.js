const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const { validate, blockedDateSchema } = require('../../middleware/validator');
const blockedDatesController = require('../../controllers/admin/blockedDatesController');

router.use(isAuthenticated);

router.get('/', blockedDatesController.index);
router.post('/', validate(blockedDateSchema), blockedDatesController.store);
router.delete('/:id', blockedDatesController.destroy);

module.exports = router;
