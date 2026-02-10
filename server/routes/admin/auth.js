const express = require('express');
const router = express.Router();
const { loginLimiter } = require('../../middleware/rateLimiter');
const { validate, loginSchema } = require('../../middleware/validator');
const { isAuthenticated, isGuest } = require('../../middleware/auth');
const authController = require('../../controllers/admin/authController');

router.get('/login', isGuest, authController.loginPage);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;
