const db = require('../../config/database');

const Client = {
  async findAll(search) {
    let query = db('clients').orderBy('created_at', 'desc');
    if (search) {
      query = query.where(function() {
        this.where('first_name', 'like', `%${search}%`)
          .orWhere('last_name', 'like', `%${search}%`)
          .orWhere('phone', 'like', `%${search}%`)
          .orWhere('email', 'like', `%${search}%`);
      });
    }
    return query;
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
