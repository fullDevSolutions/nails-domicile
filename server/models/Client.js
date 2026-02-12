const db = require('../../config/database');

const CLIENTS_PER_PAGE = 20;

const Client = {
  async findAll(search, page = 1) {
    let query = db('clients').orderBy('created_at', 'desc');
    if (search) {
      const term = `%${search}%`;
      query = query.where(function() {
        this.where('first_name', 'like', term)
          .orWhere('last_name', 'like', term)
          .orWhere('phone', 'like', term)
          .orWhere('email', 'like', term);
      });
    }

    // Count total for pagination
    const countQuery = query.clone().clearSelect().clearOrder().count('id as count').first();
    const { count } = await countQuery;
    const totalPages = Math.max(1, Math.ceil(count / CLIENTS_PER_PAGE));
    const currentPage = Math.min(Math.max(1, parseInt(page, 10) || 1), totalPages);
    const offset = (currentPage - 1) * CLIENTS_PER_PAGE;

    const rows = await query.limit(CLIENTS_PER_PAGE).offset(offset);

    return { rows, total: count, currentPage, totalPages, perPage: CLIENTS_PER_PAGE };
  },

  async findById(id) {
    return db('clients').where({ id }).first();
  },

  async findOrCreate(data) {
    // Try to find by phone first
    let client = await db('clients').where({ phone: data.phone }).first();

    if (client) {
      // Update info if needed
      await db('clients').where({ id: client.id }).update({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email || client.email,
        address: data.address || client.address
      });
      return client;
    }

    // Create new client
    const [id] = await db('clients').insert({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      total_bookings: 0
    });

    return db('clients').where({ id }).first();
  },

  async incrementBookings(id) {
    return db('clients').where({ id }).increment('total_bookings', 1);
  },

  async count() {
    const [{ count }] = await db('clients').count('id as count');
    return count;
  }
};

module.exports = Client;
