const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');
const { validate, blogPostSchema } = require('../../middleware/validator');
const blogController = require('../../controllers/admin/blogController');

// Preprocessor: convert checkbox to boolean
function preprocessBlogForm(req, res, next) {
  if (req.body.isPublished === 'on' || req.body.isPublished === 'true') {
    req.body.isPublished = true;
  } else {
    req.body.isPublished = false;
  }
  if (req.body.displayOrder) {
    req.body.displayOrder = parseInt(req.body.displayOrder, 10);
  }
  next();
}

router.use(isAuthenticated);

router.get('/', blogController.index);
router.get('/create', blogController.createForm);
router.post('/', preprocessBlogForm, validate(blogPostSchema), blogController.store);
router.get('/:id/edit', blogController.editForm);
router.post('/:id', preprocessBlogForm, validate(blogPostSchema), blogController.update);
router.post('/:id/toggle', blogController.toggle);
router.delete('/:id', blogController.destroy);

module.exports = router;
