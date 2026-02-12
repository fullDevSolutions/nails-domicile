const db = require('../../config/database');

const Service = {
  async findAll() {
    const rows = await db('services').orderBy('display_order', 'asc');
    return rows.map(Service.parseJson);
  },

  async findActive() {
    const rows = await db('services').where({ is_active: true }).orderBy('display_order', 'asc');
    return rows.map(Service.parseJson);
  },

  async findById(id) {
    const row = await db('services').where({ id }).first();
    return row ? Service.parseJson(row) : null;
  },

  async findBySlug(slug) {
    const row = await db('services').where({ slug }).first();
    return row ? Service.parseJson(row) : null;
  },

  async create(data) {
    const [id] = await db('services').insert({
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      price: data.price,
      price_unit: data.priceUnit || 'séance',
      duration_minutes: data.durationMinutes,
      icon: data.icon || '💅',
      image: data.image || '',
      includes: JSON.stringify(data.includes || []),
      options: JSON.stringify(data.options || []),
      display_order: data.displayOrder || 0,
      is_active: data.isActive !== false
    });
    return id;
  },

  async update(id, data) {
    const updateData = {
      name: data.name,
      slug: data.slug,
      description: data.description || '',
      price: data.price,
      price_unit: data.priceUnit || 'séance',
      duration_minutes: data.durationMinutes,
      icon: data.icon || '💅',
      includes: JSON.stringify(data.includes || []),
      options: JSON.stringify(data.options || []),
      display_order: data.displayOrder || 0,
      is_active: data.isActive !== false
    };
    if (data.image !== undefined) updateData.image = data.image;
    return db('services').where({ id }).update(updateData);
  },

  async toggleActive(id) {
    const service = await db('services').where({ id }).first();
    if (!service) return null;
    await db('services').where({ id }).update({ is_active: !service.is_active });
    return !service.is_active;
  },

  async updateOrder(items) {
    const trx = await db.transaction();
    try {
      for (const item of items) {
        await trx('services').where({ id: item.id }).update({ display_order: item.order });
      }
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async delete(id) {
    return db('services').where({ id }).del();
  },

  parseJson(row) {
    if (row.includes && typeof row.includes === 'string') {
      try { row.includes = JSON.parse(row.includes); } catch (err) {
        console.error('Failed to parse includes for service', row.id, ':', err.message);
        row.includes = [];
      }
    }
    if (row.options && typeof row.options === 'string') {
      try { row.options = JSON.parse(row.options); } catch (err) {
        console.error('Failed to parse options for service', row.id, ':', err.message);
        row.options = [];
      }
    }
    return row;
  }
};

module.exports = Service;
