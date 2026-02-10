const db = require('../../config/database');

const Testimonial = {
  async findAll() {
    return db('testimonials').orderBy('created_at', 'desc');
  },

  async findActive() {
    return db('testimonials')
      .where({ is_active: true })
      .orderBy('is_featured', 'desc')
      .orderBy('created_at', 'desc');
  },

  async findFeatured() {
    return db('testimonials')
      .where({ is_active: true, is_featured: true })
      .orderBy('created_at', 'desc');
  },

  async findById(id) {
    return db('testimonials').where({ id }).first();
  },

  async create(data) {
    const [id] = await db('testimonials').insert({
      client_name: data.clientName,
      rating: data.rating,
      text: data.text,
      is_featured: data.isFeatured || false,
      is_active: data.isActive !== false
    });
    return id;
  },

  async update(id, data) {
    return db('testimonials').where({ id }).update({
      client_name: data.clientName,
      rating: data.rating,
      text: data.text,
      is_featured: data.isFeatured || false,
      is_active: data.isActive !== false
    });
  },

  async toggleActive(id) {
    const t = await db('testimonials').where({ id }).first();
    if (!t) return null;
    await db('testimonials').where({ id }).update({ is_active: !t.is_active });
    return !t.is_active;
  },

  async delete(id) {
    return db('testimonials').where({ id }).del();
  }
};

module.exports = Testimonial;
