const path = require('path');
const fsPromises = require('fs').promises;
const sharp = require('sharp');
const Service = require('../../models/Service');
const { slugify } = require('../../utils/helpers');

async function optimizeServiceImage(file) {
  const originalPath = file.path;
  const ext = path.extname(file.filename);
  const optimizedFilename = file.filename.replace(ext, '.webp');
  const optimizedPath = path.join(path.dirname(originalPath), optimizedFilename);

  await sharp(originalPath)
    .resize(600, 600, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(optimizedPath);

  if (originalPath !== optimizedPath) {
    await fsPromises.unlink(originalPath);
  }

  return optimizedFilename;
}

async function deleteServiceImage(filename) {
  if (!filename || filename.startsWith('http')) return;
  const filePath = path.join(__dirname, '../../../public/images/services', filename);
  try {
    await fsPromises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Service image cleanup:', err.message);
  }
}

const servicesController = {
  async index(req, res) {
    try {
      const services = await Service.findAll();
      res.render('admin/services/index', {
        layout: 'layouts/admin',
        title: 'Services',
        isLoginPage: false,
        services
      });
    } catch (err) {
      console.error('Services list error:', err);
      req.flash('error', 'Erreur lors du chargement des services.');
      res.redirect('/admin');
    }
  },

  createForm(req, res) {
    res.render('admin/services/form', {
      layout: 'layouts/admin',
      title: 'Nouveau service',
      isLoginPage: false,
      service: null
    });
  },

  async store(req, res) {
    try {
      const data = req.validatedBody;
      data.slug = data.slug || slugify(data.name);

      if (req.file) {
        data.image = await optimizeServiceImage(req.file);
      }

      await Service.create(data);
      req.flash('success', 'Service créé avec succès.');
      res.redirect('/admin/services');
    } catch (err) {
      console.error('Service create error:', err);
      req.flash('error', 'Erreur lors de la création du service.');
      res.redirect('/admin/services/create');
    }
  },

  async editForm(req, res) {
    try {
      const service = await Service.findById(req.params.id);
      if (!service) {
        req.flash('error', 'Service introuvable.');
        return res.redirect('/admin/services');
      }

      res.render('admin/services/form', {
        layout: 'layouts/admin',
        title: `Modifier : ${service.name}`,
        isLoginPage: false,
        service
      });
    } catch (err) {
      console.error('Service edit error:', err);
      req.flash('error', 'Erreur lors du chargement du service.');
      res.redirect('/admin/services');
    }
  },

  async update(req, res) {
    try {
      const data = req.validatedBody;
      data.slug = data.slug || slugify(data.name);

      if (req.file) {
        const service = await Service.findById(req.params.id);
        if (service) await deleteServiceImage(service.image);
        data.image = await optimizeServiceImage(req.file);
      }

      await Service.update(req.params.id, data);
      req.flash('success', 'Service mis à jour.');
      res.redirect('/admin/services');
    } catch (err) {
      console.error('Service update error:', err);
      req.flash('error', 'Erreur lors de la mise à jour.');
      res.redirect(`/admin/services/${req.params.id}/edit`);
    }
  },

  async toggle(req, res) {
    try {
      await Service.toggleActive(req.params.id);
      req.flash('success', 'Statut du service mis à jour.');
      res.redirect('/admin/services');
    } catch (err) {
      console.error('Service toggle error:', err);
      req.flash('error', 'Erreur lors de la mise à jour.');
      res.redirect('/admin/services');
    }
  },

  async reorder(req, res) {
    try {
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Données invalides' });
      }
      await Service.updateOrder(items);
      res.json({ success: true });
    } catch (err) {
      console.error('Service reorder error:', err);
      res.status(500).json({ success: false, error: 'Erreur de réordonnement' });
    }
  },

  async destroy(req, res) {
    try {
      await Service.delete(req.params.id);
      req.flash('success', 'Service supprimé.');
      res.redirect('/admin/services');
    } catch (err) {
      console.error('Service delete error:', err);
      req.flash('error', 'Erreur lors de la suppression.');
      res.redirect('/admin/services');
    }
  }
};

module.exports = servicesController;
