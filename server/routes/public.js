const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.home);
router.get('/services', publicController.services);
router.get('/mentions-legales', publicController.mentionsLegales);
router.get('/politique-confidentialite', publicController.politiqueConfidentialite);
router.get('/blog', publicController.blog);
router.get('/blog/:slug', publicController.blogPost);
router.get('/robots.txt', publicController.robotsTxt);
router.get('/sitemap.xml', publicController.sitemap);

module.exports = router;
