exports.seed = async function(knex) {
  await knex('bookings').del();
  await knex('clients').del();

  // Get service IDs
  const services = await knex('services').select('id', 'name', 'price');
  const svcMap = {};
  services.forEach(s => { svcMap[s.name] = s; });

  // Create clients
  const clientData = [
    { first_name: 'Marie', last_name: 'Dupont', phone: '06 12 34 56 78', email: 'marie.dupont@gmail.com', address: '15 rue de Rivoli, 75001 Paris', total_bookings: 8 },
    { first_name: 'Sophie', last_name: 'Laurent', phone: '06 23 45 67 89', email: 'sophie.laurent@hotmail.fr', address: '8 avenue des Champs-Élysées, 75008 Paris', total_bookings: 5 },
    { first_name: 'Léa', last_name: 'Martin', phone: '06 34 56 78 90', email: 'lea.m@yahoo.fr', address: '42 boulevard Haussmann, 75009 Paris', total_bookings: 4 },
    { first_name: 'Camille', last_name: 'Bernard', phone: '06 45 67 89 01', email: 'camille.b@gmail.com', address: '3 rue de la Paix, 75002 Paris', total_bookings: 6 },
    { first_name: 'Emma', last_name: 'Petit', phone: '06 56 78 90 12', email: 'emma.petit@outlook.fr', address: '27 rue du Faubourg Saint-Honoré, 75008 Paris', total_bookings: 3 },
    { first_name: 'Chloé', last_name: 'Moreau', phone: '06 67 89 01 23', email: 'chloe.moreau@gmail.com', address: '11 rue de Sèvres, 75006 Paris', total_bookings: 4 },
    { first_name: 'Inès', last_name: 'Garcia', phone: '06 78 90 12 34', email: 'ines.garcia@free.fr', address: '5 place de la République, 75003 Paris', total_bookings: 2 },
    { first_name: 'Manon', last_name: 'Roux', phone: '06 89 01 23 45', email: 'manon.roux@gmail.com', address: '18 rue Oberkampf, 75011 Paris', total_bookings: 5 },
    { first_name: 'Julie', last_name: 'Lefèvre', phone: '06 90 12 34 56', email: 'julie.lefevre@gmail.com', address: '22 rue Montorgueil, 75002 Paris', total_bookings: 3 },
    { first_name: 'Clara', last_name: 'Fournier', phone: '06 01 23 45 67', email: 'clara.fournier@yahoo.fr', address: '9 rue du Bac, 75007 Paris', total_bookings: 2 },
  ];

  const clientIds = await knex('clients').insert(clientData);
  const c = clientIds[0]; // first inserted ID

  const today = new Date();
  const fmt = (d) => d.toISOString().split('T')[0];
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const bookings = [
    // ===== Mois dernier (M-2) — historique profond =====
    {
      client_id: c,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(addDays(today, -55)),
      time_slot: 'matin',
      address: clientData[0].address,
      notes: 'Première pose gel, couleur nude',
      selected_options: null,
      status: 'completed',
      total_price: 45.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -56)
    },
    {
      client_id: c + 1,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, -52)),
      time_slot: 'apresmidi',
      address: clientData[1].address,
      notes: null,
      selected_options: null,
      status: 'completed',
      total_price: 25.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -53)
    },
    {
      client_id: c + 3,
      service_id: svcMap['Pose Capsules'].id,
      booking_date: fmt(addDays(today, -48)),
      time_slot: 'matin',
      address: clientData[3].address,
      notes: 'Forme amande, rose pastel',
      selected_options: null,
      status: 'completed',
      total_price: 55.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -49)
    },
    {
      client_id: c + 4,
      service_id: svcMap['Pédicure'].id,
      booking_date: fmt(addDays(today, -45)),
      time_slot: 'midi',
      address: clientData[4].address,
      notes: null,
      selected_options: JSON.stringify([{ name: 'Gel semi-permanent', price: '+10€' }]),
      status: 'completed',
      total_price: 40.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -46)
    },
    {
      client_id: c + 7,
      service_id: svcMap['Nail Art'].id,
      booking_date: fmt(addDays(today, -42)),
      time_slot: 'apresmidi',
      address: clientData[7].address,
      notes: 'Motif géométrique noir et doré',
      selected_options: JSON.stringify([{ name: 'Complexe', price: '10€/ongle' }]),
      status: 'completed',
      total_price: 50.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -43)
    },
    {
      client_id: c + 8,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, -40)),
      time_slot: 'soir',
      address: clientData[8].address,
      notes: 'Vernis semi-permanent rouge',
      selected_options: null,
      status: 'completed',
      total_price: 25.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -41)
    },
    // No-show M-2
    {
      client_id: c + 6,
      service_id: svcMap['Remplissage'].id,
      booking_date: fmt(addDays(today, -38)),
      time_slot: 'matin',
      address: clientData[6].address,
      notes: null,
      selected_options: null,
      status: 'no_show',
      total_price: 35.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -39)
    },

    // ===== Mois précédent (M-1) =====
    {
      client_id: c,
      service_id: svcMap['Remplissage'].id,
      booking_date: fmt(addDays(today, -32)),
      time_slot: 'matin',
      address: clientData[0].address,
      notes: 'Remplissage pose gel',
      selected_options: null,
      status: 'completed',
      total_price: 35.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -33)
    },
    {
      client_id: c + 2,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(addDays(today, -30)),
      time_slot: 'apresmidi',
      address: clientData[2].address,
      notes: 'Couleur bordeaux',
      selected_options: JSON.stringify([{ name: 'French', price: '+5€' }]),
      status: 'completed',
      total_price: 50.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -31)
    },
    {
      client_id: c + 5,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, -28)),
      time_slot: 'midi',
      address: clientData[5].address,
      notes: null,
      selected_options: null,
      status: 'completed',
      total_price: 25.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -29)
    },
    {
      client_id: c + 9,
      service_id: svcMap['Pose Capsules'].id,
      booking_date: fmt(addDays(today, -25)),
      time_slot: 'matin',
      address: clientData[9].address,
      notes: 'Capsules stiletto, longueur moyenne',
      selected_options: null,
      status: 'completed',
      total_price: 55.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -26)
    },
    // Cancelled M-1
    {
      client_id: c + 6,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, -23)),
      time_slot: 'matin',
      address: clientData[6].address,
      notes: null,
      selected_options: null,
      status: 'cancelled',
      total_price: 25.00,
      reminder_sent: false
    },

    // ===== Ce mois-ci — semaines passées =====
    {
      client_id: c,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(addDays(today, -20)),
      time_slot: 'matin',
      address: clientData[0].address,
      notes: 'Couleur nude rosé souhaitée',
      selected_options: JSON.stringify([{ name: 'Baby Boomer', price: '+10€' }]),
      status: 'completed',
      total_price: 55.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -21)
    },
    {
      client_id: c + 1,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, -15)),
      time_slot: 'apresmidi',
      address: clientData[1].address,
      notes: null,
      selected_options: null,
      status: 'completed',
      total_price: 25.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -16)
    },
    {
      client_id: c + 3,
      service_id: svcMap['Pose Capsules'].id,
      booking_date: fmt(addDays(today, -12)),
      time_slot: 'matin',
      address: clientData[3].address,
      notes: 'Forme amande, longueur moyenne',
      selected_options: null,
      status: 'completed',
      total_price: 55.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -13)
    },
    {
      client_id: c + 2,
      service_id: svcMap['Pédicure'].id,
      booking_date: fmt(addDays(today, -10)),
      time_slot: 'midi',
      address: clientData[2].address,
      notes: null,
      selected_options: JSON.stringify([{ name: 'Gel semi-permanent', price: '+10€' }]),
      status: 'completed',
      total_price: 40.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -11)
    },
    {
      client_id: c + 7,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(addDays(today, -7)),
      time_slot: 'apresmidi',
      address: clientData[7].address,
      notes: 'French classique',
      selected_options: JSON.stringify([{ name: 'French', price: '+5€' }]),
      status: 'completed',
      total_price: 50.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -8)
    },
    {
      client_id: c + 5,
      service_id: svcMap['Remplissage'].id,
      booking_date: fmt(addDays(today, -5)),
      time_slot: 'matin',
      address: clientData[5].address,
      notes: null,
      selected_options: null,
      status: 'completed',
      total_price: 35.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -6)
    },
    {
      client_id: c + 3,
      service_id: svcMap['Remplissage'].id,
      booking_date: fmt(addDays(today, -3)),
      time_slot: 'soir',
      address: clientData[3].address,
      notes: 'Changement de couleur : rouge bordeaux',
      selected_options: null,
      status: 'completed',
      total_price: 35.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -4)
    },
    // No-show récent
    {
      client_id: c + 9,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, -2)),
      time_slot: 'apresmidi',
      address: clientData[9].address,
      notes: null,
      selected_options: null,
      status: 'no_show',
      total_price: 25.00,
      reminder_sent: true,
      reminder_sent_at: addDays(today, -3)
    },
    // Cancelled récent
    {
      client_id: c + 6,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(addDays(today, -1)),
      time_slot: 'matin',
      address: clientData[6].address,
      notes: 'Annulé : empêchement professionnel',
      selected_options: null,
      status: 'cancelled',
      total_price: 45.00,
      reminder_sent: false
    },

    // ===== Aujourd'hui =====
    {
      client_id: c,
      service_id: svcMap['Remplissage'].id,
      booking_date: fmt(today),
      time_slot: 'matin',
      address: clientData[0].address,
      notes: 'Remplissage pose gel du mois dernier',
      selected_options: null,
      status: 'confirmed',
      total_price: 35.00,
      reminder_sent: false
    },
    {
      client_id: c + 1,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(today),
      time_slot: 'apresmidi',
      address: clientData[1].address,
      notes: 'Couleur : rose pastel',
      selected_options: JSON.stringify([{ name: 'Baby Boomer', price: '+10€' }]),
      status: 'pending',
      total_price: 55.00,
      reminder_sent: false
    },

    // ===== Demain =====
    {
      client_id: c + 2,
      service_id: svcMap['Pose Capsules'].id,
      booking_date: fmt(addDays(today, 1)),
      time_slot: 'matin',
      address: clientData[2].address,
      notes: 'Forme stiletto, longueur longue, couleur noire mate',
      selected_options: null,
      status: 'confirmed',
      total_price: 55.00,
      reminder_sent: false
    },
    {
      client_id: c + 4,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, 1)),
      time_slot: 'soir',
      address: clientData[4].address,
      notes: 'Première visite !',
      selected_options: null,
      status: 'pending',
      total_price: 25.00,
      reminder_sent: false
    },

    // ===== Prochains jours =====
    {
      client_id: c + 3,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(addDays(today, 3)),
      time_slot: 'matin',
      address: clientData[3].address,
      notes: 'Effet chrome miroir doré',
      selected_options: JSON.stringify([{ name: 'French', price: '+5€' }]),
      status: 'confirmed',
      total_price: 50.00,
      reminder_sent: false
    },
    {
      client_id: c + 7,
      service_id: svcMap['Remplissage'].id,
      booking_date: fmt(addDays(today, 4)),
      time_slot: 'midi',
      address: clientData[7].address,
      notes: null,
      selected_options: null,
      status: 'pending',
      total_price: 35.00,
      reminder_sent: false
    },
    {
      client_id: c + 8,
      service_id: svcMap['Pose Gel UV'].id,
      booking_date: fmt(addDays(today, 5)),
      time_slot: 'matin',
      address: clientData[8].address,
      notes: 'Baby boomer naturel',
      selected_options: JSON.stringify([{ name: 'Baby Boomer', price: '+10€' }]),
      status: 'confirmed',
      total_price: 55.00,
      reminder_sent: false
    },
    {
      client_id: c + 5,
      service_id: svcMap['Pédicure'].id,
      booking_date: fmt(addDays(today, 5)),
      time_slot: 'apresmidi',
      address: clientData[5].address,
      notes: 'Pédicure + vernis semi-permanent',
      selected_options: JSON.stringify([{ name: 'Gel semi-permanent', price: '+10€' }]),
      status: 'pending',
      total_price: 40.00,
      reminder_sent: false
    },
    {
      client_id: c,
      service_id: svcMap['Nail Art'].id,
      booking_date: fmt(addDays(today, 7)),
      time_slot: 'apresmidi',
      address: clientData[0].address,
      notes: 'Design floral pour mariage, 10 ongles',
      selected_options: JSON.stringify([{ name: 'Full set', price: '-20%' }]),
      status: 'pending',
      total_price: 50.00,
      reminder_sent: false
    },
    {
      client_id: c + 9,
      service_id: svcMap['Manucure Simple'].id,
      booking_date: fmt(addDays(today, 8)),
      time_slot: 'matin',
      address: clientData[9].address,
      notes: null,
      selected_options: null,
      status: 'pending',
      total_price: 25.00,
      reminder_sent: false
    },
    {
      client_id: c + 4,
      service_id: svcMap['Pose Capsules'].id,
      booking_date: fmt(addDays(today, 10)),
      time_slot: 'apresmidi',
      address: clientData[4].address,
      notes: 'Capsules forme coffin, couleur nude',
      selected_options: null,
      status: 'pending',
      total_price: 55.00,
      reminder_sent: false
    },
  ];

  await knex('bookings').insert(bookings);
};
