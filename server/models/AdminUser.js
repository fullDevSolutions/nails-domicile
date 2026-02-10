const db = require('../../config/database');
const bcrypt = require('bcryptjs');

const AdminUser = {
  async findByEmail(email) {
    return db('admin_users').where({ email }).first();
  },

  async findById(id) {
    return db('admin_users').where({ id }).first();
  },

  async verifyPassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  },

  async updateLastLogin(id) {
    return db('admin_users').where({ id }).update({ last_login_at: db.fn.now() });
  },

  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 12);
    return db('admin_users').where({ id }).update({ password_hash: hash });
  }
};

module.exports = AdminUser;
