const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const { validate, serviceSchema } = require('../../middleware/validator');
const servicesController = require('../../controllers/admin/servicesController');
const { createUpload } = require('../../middleware/upload');

const uploadService = createUpload('services');

router.use(isAuthenticated);

// Pre-process form data: textarea lines → arrays
function preprocessServiceForm(req, res, next) {
  if (req.body.includes && typeof req.body.includes === 'string') {
    req.body.includes = req.body.includes.split('\n').map(s => s.trim()).filter(Boolean);
  }
  if (req.body.isActive === 'true') req.body.isActive = true;
  else if (!req.body.isActive) req.body.isActive = false;
  next();
}

router.get('/', servicesController.index);
router.get('/create', servicesController.createForm);
router.post('/', uploadService.single('image'), preprocessServiceForm, validate(serviceSchema), servicesController.store);
router.get('/:id/edit', servicesController.editForm);
router.post('/:id', uploadService.single('image'), preprocessServiceForm, validate(serviceSchema), servicesController.update);
router.post('/:id/toggle', servicesController.toggle);
router.post('/reorder', servicesController.reorder);
router.delete('/:id', servicesController.destroy);

module.exports = router;
