const db = require('../../config/database');

const GalleryImage = {
  async findAll() {
    return db('gallery_images').orderBy('display_order', 'asc');
  },

  async findById(id) {
    return db('gallery_images').where({ id }).first();
  },

  async create(data) {
    const [id] = await db('gallery_images').insert({
      filename: data.filename,
      alt_text: data.altText || '',
      category: data.category || 'general',
      display_order: data.displayOrder || 0
    });
    return id;
  },

  async update(id, data) {
    return db('gallery_images').where({ id }).update({
      alt_text: data.altText,
      category: data.category
    });
  },

  async updateOrder(items) {
    const trx = await db.transaction();
    try {
      for (const item of items) {
        await trx('gallery_images').where({ id: item.id }).update({ display_order: item.order });
      }
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async delete(id) {
    return db('gallery_images').where({ id }).del();
  }
};

module.exports = GalleryImage;
