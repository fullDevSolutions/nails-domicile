exports.seed = async function(knex) {
  await knex('testimonials').del();

  await knex('testimonials').insert([
    {
      client_name: 'Marie L.',
      rating: 5,
      text: 'Sarah est une vraie professionnelle ! Mes ongles tiennent parfaitement et le rendu est magnifique. Je recommande à 100%',
      is_featured: true,
      is_active: true
    },
    {
      client_name: 'Sophie D.',
      rating: 5,
      text: 'Le service à domicile est top ! Plus besoin de se déplacer, Sarah vient avec tout son matériel. Un vrai confort.',
      is_featured: true,
      is_active: true
    },
    {
      client_name: 'Camille B.',
      rating: 5,
      text: 'Des nail arts incroyables ! Sarah a réalisé exactement ce que je voulais pour mon mariage. Je suis cliente fidèle maintenant.',
      is_featured: true,
      is_active: true
    }
  ]);
};
