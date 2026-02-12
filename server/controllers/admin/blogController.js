const BlogPost = require('../../models/BlogPost');
const { slugify, formatDate, sanitizeContent } = require('../../utils/helpers');

const blogController = {
  async index(req, res) {
    try {
      const posts = await BlogPost.findAll();

      res.render('admin/blog/index', {
        layout: 'layouts/admin',
        title: 'Blog',
        isLoginPage: false,
        posts,
        formatDate
      });
    } catch (err) {
      console.error('Blog list error:', err);
      req.flash('error', 'Erreur lors du chargement des articles.');
      res.redirect('/admin');
    }
  },

  createForm(req, res) {
    res.render('admin/blog/form', {
      layout: 'layouts/admin',
      title: 'Nouvel article',
      isLoginPage: false,
      post: null
    });
  },

  async store(req, res) {
    try {
      const data = req.validatedBody;
      if (!data.slug) data.slug = slugify(data.title);
      if (data.content) data.content = sanitizeContent(data.content);
      await BlogPost.create(data);
      req.flash('success', 'Article créé avec succès.');
      res.redirect('/admin/blog');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        req.flash('error', 'Un article avec ce slug existe déjà.');
      } else {
        console.error('Blog create error:', err);
        req.flash('error', 'Erreur lors de la création de l\'article.');
      }
      res.redirect('/admin/blog/create');
    }
  },

  async editForm(req, res) {
    try {
      const post = await BlogPost.findById(req.params.id);
      if (!post) {
        req.flash('error', 'Article introuvable.');
        return res.redirect('/admin/blog');
      }

      res.render('admin/blog/form', {
        layout: 'layouts/admin',
        title: `Modifier : ${post.title}`,
        isLoginPage: false,
        post
      });
    } catch (err) {
      console.error('Blog edit form error:', err);
      req.flash('error', 'Erreur lors du chargement de l\'article.');
      res.redirect('/admin/blog');
    }
  },

  async update(req, res) {
    try {
      const data = req.validatedBody;
      if (!data.slug) data.slug = slugify(data.title);
      if (data.content) data.content = sanitizeContent(data.content);
      await BlogPost.update(req.params.id, data);
      req.flash('success', 'Article mis à jour.');
      res.redirect('/admin/blog');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
        req.flash('error', 'Un article avec ce slug existe déjà.');
      } else {
        console.error('Blog update error:', err);
        req.flash('error', 'Erreur lors de la mise à jour.');
      }
      res.redirect(`/admin/blog/${req.params.id}/edit`);
    }
  },

  async toggle(req, res) {
    try {
      const newState = await BlogPost.togglePublished(req.params.id);
      req.flash('success', newState ? 'Article publié.' : 'Article dépublié.');
      res.redirect('/admin/blog');
    } catch (err) {
      console.error('Blog toggle error:', err);
      req.flash('error', 'Erreur lors du changement de statut.');
      res.redirect('/admin/blog');
    }
  },

  async destroy(req, res) {
    try {
      await BlogPost.delete(req.params.id);
      req.flash('success', 'Article supprimé.');
      res.redirect('/admin/blog');
    } catch (err) {
      console.error('Blog delete error:', err);
      req.flash('error', 'Erreur lors de la suppression.');
      res.redirect('/admin/blog');
    }
  }
};

module.exports = blogController;
