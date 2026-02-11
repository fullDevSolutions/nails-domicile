const bcrypt = require('bcryptjs');

const isDemoMode = process.env.DEMO_MODE === 'true';

exports.seed = async function(knex) {
  await knex('admin_users').del();

  const email = process.env.ADMIN_EMAIL || 'admin@nailsbysarah.fr';
  const password = process.env.ADMIN_PASSWORD || (isDemoMode ? 'DemoAdmin1!' : null);

  if (!password) {
    throw new Error(
      'ADMIN_PASSWORD est requis dans le fichier .env pour créer le compte admin.\n' +
      'Exemple : ADMIN_PASSWORD=MonMotDePasse123!'
    );
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD doit contenir au moins 8 caractères.');
  }

  const users = [
    {
      email,
      password_hash: await bcrypt.hash(password, 12),
      role: 'admin'
    }
  ];

  if (isDemoMode) {
    users.push({
      email: 'demo@nailsbysarah.fr',
      password_hash: await bcrypt.hash('demo1234', 12),
      role: 'demo'
    });
  }

  await knex('admin_users').insert(users);
};
