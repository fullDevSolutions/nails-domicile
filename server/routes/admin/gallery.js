const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const galleryController = require('../../controllers/admin/galleryController');
const { validate, galleryUpdateSchema } = require('../../middleware/validator');

router.use(isAuthenticated);

router.get('/', galleryController.index);
router.post('/upload', upload.single('image'), galleryController.upload);
router.post('/reorder', galleryController.reorder);
router.post('/:id', validate(galleryUpdateSchema), galleryController.update);
router.delete('/:id', galleryController.destroy);

module.exports = router;
