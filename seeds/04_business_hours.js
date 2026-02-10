exports.seed = async function(knex) {
  await knex('business_hours').del();

  const days = [
    { day_of_week: 0, day_name: 'Dimanche', is_open: false },
    { day_of_week: 1, day_name: 'Lundi', is_open: true },
    { day_of_week: 2, day_name: 'Mardi', is_open: true },
    { day_of_week: 3, day_name: 'Mercredi', is_open: true },
    { day_of_week: 4, day_name: 'Jeudi', is_open: true },
    { day_of_week: 5, day_name: 'Vendredi', is_open: true },
    { day_of_week: 6, day_name: 'Samedi', is_open: true }
  ];

  await knex('business_hours').insert(
    days.map(d => ({
      ...d,
      open_time: '09:00',
      close_time: '19:00'
    }))
  );
};
