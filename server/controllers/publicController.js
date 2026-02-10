const Service = require('../models/Service');
const GalleryImage = require('../models/GalleryImage');
const Testimonial = require('../models/Testimonial');
const BlogPost = require('../models/BlogPost');

const publicController = {
  async home(req, res) {
    try {
      const [services, galleryImages, testimonials] = await Promise.all([
        Service.findActive(),
        GalleryImage.findAll(),
        Testimonial.findFeatured()
      ]);

      res.render('public/index', {
        layout: 'layouts/public',
        title: res.locals.site.seo.title,
        services,
        galleryImages,
        testimonials
      });
    } catch (err) {
      console.error('Home page error:', err);
      res.status(500).render('public/500', { layout: 'layouts/public', title: 'Erreur' });
    }
  },

  async services(req, res) {
    try {
      const services = await Service.findActive();

      res.render('public/services', {
        layout: 'layouts/public',
        title: `Nos Services - ${res.locals.site.business.name}`,
        metaDescription: `Découvrez tous les services de ${res.locals.site.business.name} : manucure, pose gel, capsules, nail art, pédicure.`,
        services
      });
    } catch (err) {
      console.error('Services page error:', err);
      res.status(500).render('public/500', { layout: 'layouts/public', title: 'Erreur' });
    }
  },

  mentionsLegales(req, res) {
    res.render('public/mentions-legales', {
      layout: 'layouts/public',
      title: `Mentions légales - ${res.locals.site.business.name}`
    });
  },

  politiqueConfidentialite(req, res) {
    res.render('public/politique-confidentialite', {
      layout: 'layouts/public',
      title: `Politique de confidentialité - ${res.locals.site.business.name}`
    });
  },

  async blog(req, res) {
    try {
      if (!res.locals.site.features.blog) {
        return res.status(404).render('public/404', { layout: 'layouts/public', title: 'Page non trouvée' });
      }
      const posts = await BlogPost.findPublished();
      res.render('public/blog/index', {
        layout: 'layouts/public',
        title: `Blog - ${res.locals.site.business.name}`,
        metaDescription: `Retrouvez les conseils et actualités de ${res.locals.site.business.name}`,
        posts
      });
    } catch (err) {
      console.error('Blog page error:', err);
      res.status(500).render('public/500', { layout: 'layouts/public', title: 'Erreur' });
    }
  },

  async blogPost(req, res) {
    try {
      if (!res.locals.site.features.blog) {
        return res.status(404).render('public/404', { layout: 'layouts/public', title: 'Page non trouvée' });
      }
      const post = await BlogPost.findBySlug(req.params.slug);
      if (!post) {
        return res.status(404).render('public/404', { layout: 'layouts/public', title: 'Article non trouvé' });
      }
      res.render('public/blog/show', {
        layout: 'layouts/public',
        title: `${post.title} - ${res.locals.site.business.name}`,
        metaDescription: post.excerpt || '',
        post
      });
    } catch (err) {
      console.error('Blog post page error:', err);
      res.status(500).render('public/500', { layout: 'layouts/public', title: 'Erreur' });
    }
  },

  robotsTxt(req, res) {
    const baseUrl = res.locals.site.seo.canonicalUrl || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`);
  },

  async sitemap(req, res) {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const urls = [
      { loc: '/', priority: '1.0' },
      { loc: '/services', priority: '0.8' },
      { loc: '/mentions-legales', priority: '0.3' },
      { loc: '/politique-confidentialite', priority: '0.3' }
    ];

    if (res.locals.site.features.blog) {
      urls.push({ loc: '/blog', priority: '0.7' });
      try {
        const posts = await BlogPost.findPublished();
        posts.forEach(p => urls.push({ loc: `/blog/${p.slug}`, priority: '0.6' }));
      } catch { /* ignore */ }
    }

    res.header('Content-Type', 'application/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <priority>${u.priority}</priority>
    <changefreq>weekly</changefreq>
  </url>`).join('\n')}
</urlset>`);
  }
};

module.exports = publicController;
