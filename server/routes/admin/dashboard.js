const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const dashboardController = require('../../controllers/admin/dashboardController');

router.get('/', isAuthenticated, dashboardController.index);

module.exports = router;
