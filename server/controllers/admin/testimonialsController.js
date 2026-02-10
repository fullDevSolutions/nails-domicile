const Testimonial = require('../../models/Testimonial');

const testimonialsController = {
  async index(req, res) {
    try {
      const testimonials = await Testimonial.findAll();
      res.render('admin/testimonials/index', {
        layout: 'layouts/admin',
        title: 'Témoignages',
        isLoginPage: false,
        testimonials
      });
    } catch (err) {
      console.error('Testimonials list error:', err);
      req.flash('error', 'Erreur lors du chargement.');
      res.redirect('/admin');
    }
  },

  createForm(req, res) {
    res.render('admin/testimonials/form', {
      layout: 'layouts/admin',
      title: 'Nouveau témoignage',
      isLoginPage: false,
      testimonial: null
    });
  },

  async store(req, res) {
    try {
      await Testimonial.create(req.validatedBody);
      req.flash('success', 'Témoignage ajouté.');
      res.redirect('/admin/testimonials');
    } catch (err) {
      console.error('Testimonial create error:', err);
      req.flash('error', 'Erreur lors de la création.');
      res.redirect('/admin/testimonials/create');
    }
  },

  async editForm(req, res) {
    try {
      const testimonial = await Testimonial.findById(req.params.id);
      if (!testimonial) {
        req.flash('error', 'Témoignage introuvable.');
        return res.redirect('/admin/testimonials');
      }
      res.render('admin/testimonials/form', {
        layout: 'layouts/admin',
        title: 'Modifier le témoignage',
        isLoginPage: false,
        testimonial
      });
    } catch (err) {
      console.error('Testimonial edit error:', err);
      req.flash('error', 'Erreur lors du chargement.');
      res.redirect('/admin/testimonials');
    }
  },

  async update(req, res) {
    try {
      await Testimonial.update(req.params.id, req.validatedBody);
      req.flash('success', 'Témoignage mis à jour.');
      res.redirect('/admin/testimonials');
    } catch (err) {
      console.error('Testimonial update error:', err);
      req.flash('error', 'Erreur lors de la mise à jour.');
      res.redirect(`/admin/testimonials/${req.params.id}/edit`);
    }
  },

  async toggle(req, res) {
    try {
      await Testimonial.toggleActive(req.params.id);
      req.flash('success', 'Statut mis à jour.');
      res.redirect('/admin/testimonials');
    } catch (err) {
      console.error('Testimonial toggle error:', err);
      req.flash('error', 'Erreur lors de la mise à jour.');
      res.redirect('/admin/testimonials');
    }
  },

  async destroy(req, res) {
    try {
      await Testimonial.delete(req.params.id);
      req.flash('success', 'Témoignage supprimé.');
      res.redirect('/admin/testimonials');
    } catch (err) {
      console.error('Testimonial delete error:', err);
      req.flash('error', 'Erreur lors de la suppression.');
      res.redirect('/admin/testimonials');
    }
  }
};

module.exports = testimonialsController;
