const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const { validate, testimonialSchema } = require('../../middleware/validator');
const testimonialsController = require('../../controllers/admin/testimonialsController');

router.use(isAuthenticated);

function preprocessTestimonialForm(req, res, next) {
  req.body.isFeatured = req.body.isFeatured === 'true';
  req.body.isActive = req.body.isActive === 'true';
  req.body.rating = parseInt(req.body.rating) || 5;
  next();
}

router.get('/', testimonialsController.index);
router.get('/create', testimonialsController.createForm);
router.post('/', preprocessTestimonialForm, validate(testimonialSchema), testimonialsController.store);
router.get('/:id/edit', testimonialsController.editForm);
router.post('/:id', preprocessTestimonialForm, validate(testimonialSchema), testimonialsController.update);
router.post('/:id/toggle', testimonialsController.toggle);
router.delete('/:id', testimonialsController.destroy);

module.exports = router;
