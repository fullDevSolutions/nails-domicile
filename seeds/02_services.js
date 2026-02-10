exports.seed = async function(knex) {
  await knex('services').del();

  await knex('services').insert([
    {
      name: 'Manucure Simple',
      slug: 'manucure-simple',
      description: 'La manucure classique parfaite pour des ongles soignés au quotidien. Je prends soin de vos mains et de vos ongles avec des produits de qualité professionnelle.',
      price: 25.00,
      price_unit: 'séance',
      duration_minutes: 45,
      icon: '💅',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
      includes: JSON.stringify(['Limage et mise en forme', 'Soin des cuticules', 'Gommage des mains', 'Massage hydratant', 'Vernis classique OU', 'Vernis semi-permanent']),

      options: JSON.stringify([]),
      display_order: 1,
      is_active: true
    },
    {
      name: 'Pose Gel UV',
      slug: 'pose-gel-uv',
      description: 'La pose gel renforce vos ongles naturels tout en leur donnant un aspect impeccable. Idéale pour celles qui veulent des ongles résistants avec une finition brillante longue durée.',
      price: 45.00,
      price_unit: 'pose',
      duration_minutes: 90,
      icon: '✨',
      image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&q=80',
      includes: JSON.stringify(['Préparation de l\'ongle', 'Pose gel de base', 'Gel de construction', 'Couleur au choix', 'Finition brillante', 'Huile cuticules']),
      options: JSON.stringify([{name: 'French', price: '+5€'}, {name: 'Baby Boomer', price: '+10€'}]),
      display_order: 2,
      is_active: true
    },
    {
      name: 'Pose Capsules',
      slug: 'pose-capsules',
      description: 'Pour celles qui rêvent de longueur ! Les capsules permettent d\'obtenir la forme et la longueur de vos rêves. Choisissez entre amande, carré, stiletto ou coffin.',
      price: 55.00,
      price_unit: 'pose',
      duration_minutes: 120,
      icon: '💎',
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600&q=80',
      includes: JSON.stringify(['Pose des capsules', 'Modelage et limage', 'Forme au choix', 'Longueur au choix', 'Gel de couleur', 'Finition et soin']),
      options: JSON.stringify([]),
      display_order: 3,
      is_active: true
    },
    {
      name: 'Nail Art',
      slug: 'nail-art',
      description: 'Exprimez votre personnalité avec des décorations uniques ! Du plus simple au plus élaboré, je réalise tous vos designs sur-mesure.',
      price: 5.00,
      price_unit: 'ongle',
      duration_minutes: 30,
      icon: '🎨',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&q=80',
      includes: JSON.stringify(['Strass et bijoux', 'Paillettes et chrome', 'Dessins à main levée', 'Stamping', 'Effet marbre', 'Ombré / Dégradé', 'Foils métalliques', 'Effet sucre']),
      options: JSON.stringify([{name: 'Simple', price: '5€/ongle'}, {name: 'Complexe', price: '10€/ongle'}, {name: 'Full set', price: '-20%'}]),
      display_order: 4,
      is_active: true
    },
    {
      name: 'Remplissage',
      slug: 'remplissage',
      description: 'L\'entretien indispensable pour maintenir vos ongles parfaits ! À réaliser toutes les 3 à 4 semaines pour combler la repousse et renouveler la couleur.',
      price: 35.00,
      price_unit: 'séance',
      duration_minutes: 75,
      icon: '🔄',
      image: 'https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=600&q=80',
      includes: JSON.stringify(['Retrait couleur', 'Limage de la repousse', 'Comblement gel', 'Nouvelle couleur', 'Finition brillante', 'Soin cuticules']),
      options: JSON.stringify([]),
      display_order: 5,
      is_active: true
    },
    {
      name: 'Pédicure',
      slug: 'pedicure',
      description: 'Offrez à vos pieds le soin qu\'ils méritent ! Une pédicure complète pour des pieds doux et des ongles impeccables, parfaite pour l\'été ou simplement pour se faire plaisir.',
      price: 30.00,
      price_unit: 'séance',
      duration_minutes: 60,
      icon: '🦶',
      image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&q=80',
      includes: JSON.stringify(['Bain de pieds relaxant', 'Limage des ongles', 'Soin des cuticules', 'Gommage pieds', 'Massage hydratant', 'Vernis au choix']),
      options: JSON.stringify([{name: 'Gel semi-permanent', price: '+10€'}]),
      display_order: 6,
      is_active: true
    }
  ]);
};
