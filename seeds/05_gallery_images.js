exports.seed = async function(knex) {
  await knex('gallery_images').del();

  await knex('gallery_images').insert([
    {
      filename: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=80',
      alt_text: 'Nail art rose élégant',
      category: 'nail-art',
      display_order: 1
    },
    {
      filename: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=500&q=80',
      alt_text: 'French manucure classique',
      category: 'manucure',
      display_order: 2
    },
    {
      filename: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=500&q=80',
      alt_text: 'Ongles nude naturels',
      category: 'gel',
      display_order: 3
    },
    {
      filename: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500&q=80',
      alt_text: 'Nail art pailleté',
      category: 'nail-art',
      display_order: 4
    },
    {
      filename: 'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=500&q=80',
      alt_text: 'Manucure élégante',
      category: 'manucure',
      display_order: 5
    },
    {
      filename: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=500&q=80',
      alt_text: 'Pédicure soignée',
      category: 'pedicure',
      display_order: 6
    },
    {
      filename: 'https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=500&q=80',
      alt_text: 'Vernis rouge glamour',
      category: 'manucure',
      display_order: 7
    },
    {
      filename: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=500&q=80',
      alt_text: 'Nail art détaillé',
      category: 'nail-art',
      display_order: 8
    }
  ]);
};
