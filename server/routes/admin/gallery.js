const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const galleryController = require('../../controllers/admin/galleryController');

router.use(isAuthenticated);

router.get('/', galleryController.index);
router.post('/upload', upload.single('image'), galleryController.upload);
router.post('/:id', galleryController.update);
router.post('/reorder', galleryController.reorder);
router.delete('/:id', galleryController.destroy);

module.exports = router;
