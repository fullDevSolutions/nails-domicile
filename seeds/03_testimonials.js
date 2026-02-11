exports.seed = async function(knex) {
  await knex('testimonials').del();

  await knex('testimonials').insert([
    {
      client_name: 'Marie L.',
      rating: 5,
      text: 'Sarah est une vraie professionnelle ! Mes ongles en gel tiennent parfaitement depuis 3 semaines, aucun décollement. Le rendu est magnifique, exactement la couleur que je voulais. Je recommande les yeux fermés !',
      is_featured: true,
      is_active: true
    },
    {
      client_name: 'Sophie D.',
      rating: 5,
      text: 'Le service à domicile change la vie ! Plus besoin de courir au salon après le boulot. Sarah arrive à l\'heure, installe tout proprement et le résultat est toujours impeccable. Ça fait 6 mois que je suis cliente fidèle.',
      is_featured: true,
      is_active: true
    },
    {
      client_name: 'Camille B.',
      rating: 5,
      text: 'Sarah a réalisé mes ongles pour mon mariage et c\'était absolument parfait. Un nail art délicat avec des petites fleurs, pile ce que j\'avais en tête. Toutes mes amies m\'ont demandé son contact !',
      is_featured: true,
      is_active: true
    },
    {
      client_name: 'Léa M.',
      rating: 4,
      text: 'Très contente de ma manucure semi-permanent. Le vernis a tenu 2 bonnes semaines sans s\'écailler. Seul petit bémol : le créneau de 18h n\'est pas toujours dispo, mais je comprends que c\'est un horaire demandé. Je reviendrai !',
      is_featured: false,
      is_active: true
    },
    {
      client_name: 'Emma P.',
      rating: 5,
      text: 'Première pose de capsules et je suis ravie du résultat. Sarah a pris le temps de m\'expliquer les différentes formes et longueurs. Très à l\'écoute et de bons conseils pour l\'entretien au quotidien.',
      is_featured: true,
      is_active: true
    },
    {
      client_name: 'Chloé R.',
      rating: 5,
      text: 'J\'ai testé le baby boomer et c\'est magnifique, très naturel et élégant. Sarah est minutieuse et perfectionniste, on voit qu\'elle aime son métier. L\'ambiance est super détendue en plus.',
      is_featured: false,
      is_active: true
    },
    {
      client_name: 'Inès G.',
      rating: 4,
      text: 'Bonne prestation pour ma pédicure. Les pieds sont tout doux et les ongles nickel. Le massage des pieds à la fin c\'est un vrai plus. J\'aurais aimé un peu plus de choix de couleurs pour le vernis classique.',
      is_featured: false,
      is_active: true
    },
    {
      client_name: 'Manon T.',
      rating: 5,
      text: 'Ça fait la 4ème fois que je fais appel à Sarah pour un remplissage et c\'est toujours parfait. Elle se souvient de mes préférences et me propose des nouveautés. Un vrai suivi personnalisé, rare de nos jours.',
      is_featured: true,
      is_active: true
    },
    {
      client_name: 'Julie F.',
      rating: 5,
      text: 'J\'ai offert une séance à ma mère pour son anniversaire et elle a adoré. Sarah est très douce et patiente. Ma mère qui n\'avait jamais fait de manucure professionnelle était aux anges. Merci !',
      is_featured: false,
      is_active: true
    },
    {
      client_name: 'Clara H.',
      rating: 4,
      text: 'Le nail art effet marbre est superbe, j\'ai reçu plein de compliments au bureau. La pose a pris un peu plus de temps que prévu mais le résultat en valait largement la peine.',
      is_featured: false,
      is_active: true
    },
    {
      client_name: 'Amandine V.',
      rating: 5,
      text: 'Je cherchais une prothésiste ongulaire à domicile depuis longtemps et je suis tellement contente d\'avoir trouvé Sarah. Travail soigné, produits de qualité, et en plus elle est super sympa. Foncez !',
      is_featured: false,
      is_active: true
    },
    {
      client_name: 'Nadia K.',
      rating: 3,
      text: 'La pose gel était jolie mais un ongle a commencé à se décoller au bout d\'une semaine. Sarah a été réactive et m\'a proposé une retouche gratuite rapidement, ce que j\'ai apprécié. Le service client est top.',
      is_featured: false,
      is_active: false
    }
  ]);
};
