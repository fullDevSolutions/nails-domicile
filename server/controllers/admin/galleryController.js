const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const GalleryImage = require('../../models/GalleryImage');

const galleryController = {
  async index(req, res) {
    try {
      const images = await GalleryImage.findAll();
      res.render('admin/gallery/index', {
        layout: 'layouts/admin',
        title: 'Galerie',
        isLoginPage: false,
        images
      });
    } catch (err) {
      console.error('Gallery list error:', err);
      req.flash('error', 'Erreur lors du chargement de la galerie.');
      res.redirect('/admin');
    }
  },

  async upload(req, res) {
    try {
      if (!req.file) {
        req.flash('error', 'Aucun fichier sélectionné.');
        return res.redirect('/admin/gallery');
      }

      const originalPath = req.file.path;
      const ext = path.extname(req.file.filename);
      const optimizedFilename = req.file.filename.replace(ext, '.webp');
      const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);

      // Optimize with Sharp
      await sharp(originalPath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(optimizedPath);

      // Remove original if different from optimized
      if (originalPath !== optimizedPath) {
        fs.unlinkSync(originalPath);
      }

      await GalleryImage.create({
        filename: optimizedFilename,
        altText: req.body.alt_text || '',
        category: req.body.category || 'general'
      });

      req.flash('success', 'Image uploadée avec succès.');
      res.redirect('/admin/gallery');
    } catch (err) {
      console.error('Gallery upload error:', err);
      req.flash('error', "Erreur lors de l'upload.");
      res.redirect('/admin/gallery');
    }
  },

  async update(req, res) {
    try {
      await GalleryImage.update(req.params.id, {
        altText: req.body.alt_text,
        category: req.body.category
      });
      req.flash('success', 'Image mise à jour.');
      res.redirect('/admin/gallery');
    } catch (err) {
      console.error('Gallery update error:', err);
      req.flash('error', 'Erreur lors de la mise à jour.');
      res.redirect('/admin/gallery');
    }
  },

  async reorder(req, res) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Données invalides' });
      }
      await GalleryImage.updateOrder(items);
      res.json({ success: true });
    } catch (err) {
      console.error('Gallery reorder error:', err);
      res.status(500).json({ success: false, error: 'Erreur de réordonnement' });
    }
  },

  async destroy(req, res) {
    try {
      const image = await GalleryImage.findById(req.params.id);
      if (image) {
        const filePath = path.join(__dirname, '../../../public/images/gallery', image.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        await GalleryImage.delete(req.params.id);
      }
      req.flash('success', 'Image supprimée.');
      res.redirect('/admin/gallery');
    } catch (err) {
      console.error('Gallery delete error:', err);
      req.flash('error', 'Erreur lors de la suppression.');
      res.redirect('/admin/gallery');
    }
  }
};

module.exports = galleryController;
