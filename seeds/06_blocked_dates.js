exports.seed = async function(knex) {
  await knex('blocked_dates').del();

  await knex('blocked_dates').insert([
    {
      blocked_date: '2025-12-25',
      reason: 'Noël',
      is_recurring: true
    },
    {
      blocked_date: '2025-01-01',
      reason: 'Jour de l\'an',
      is_recurring: true
    },
    {
      blocked_date: '2025-05-01',
      reason: 'Fête du travail',
      is_recurring: true
    }
  ]);
};
