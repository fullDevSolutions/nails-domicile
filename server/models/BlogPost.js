const db = require('../../config/database');

const BlogPost = {
  async findAll() {
    return db('blog_posts').orderBy('display_order', 'asc').orderBy('created_at', 'desc');
  },

  async findPublished() {
    return db('blog_posts')
      .where({ is_published: true })
      .orderBy('published_at', 'desc');
  },

  async findById(id) {
    return db('blog_posts').where({ id }).first();
  },

  async findBySlug(slug) {
    return db('blog_posts').where({ slug, is_published: true }).first();
  },

  async create(data) {
    const [id] = await db('blog_posts').insert({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      cover_image: data.coverImage || '',
      author: data.author || '',
      is_published: data.isPublished || false,
      published_at: data.isPublished ? new Date() : null,
      display_order: data.displayOrder || 0
    });
    return id;
  },

  async update(id, data) {
    const updateData = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: data.content || '',
      cover_image: data.coverImage || '',
      author: data.author || '',
      is_published: data.isPublished || false,
      display_order: data.displayOrder || 0
    };

    // Set published_at on first publish
    if (data.isPublished) {
      const existing = await db('blog_posts').where({ id }).first();
      if (!existing.published_at) {
        updateData.published_at = new Date();
      }
    }

    return db('blog_posts').where({ id }).update(updateData);
  },

  async togglePublished(id) {
    const post = await db('blog_posts').where({ id }).first();
    if (!post) return null;
    const newState = !post.is_published;
    await db('blog_posts').where({ id }).update({
      is_published: newState,
      published_at: newState && !post.published_at ? new Date() : post.published_at
    });
    return newState;
  },

  async delete(id) {
    return db('blog_posts').where({ id }).del();
  }
};

module.exports = BlogPost;
