const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const clientsController = require('../../controllers/admin/clientsController');

router.use(isAuthenticated);

router.get('/', clientsController.index);
router.get('/:id', clientsController.show);

module.exports = router;
