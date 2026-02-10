const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  await knex('admin_users').del();

  const passwordHash = await bcrypt.hash('admin123', 12);

  await knex('admin_users').insert([
    {
      email: 'admin@nailsbysarah.fr',
      password_hash: passwordHash,
      role: 'admin'
    }
  ]);
};
