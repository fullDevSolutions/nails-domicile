exports.seed = async function(knex) {
  await knex('bookings').del();
  await knex('clients').del();

  // Get service IDs + durations
  const services = await knex('services').select('id', 'name', 'price', 'duration_minutes');
  const svcMap = {};
  services.forEach(s => { svcMap[s.name] = s; });

  // Helper: compute end time
  function addMin(time, mins) {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + mins;
    return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
  }

  // Old slot → new time mapping
  const slotToTime = {
    matin: '09:00',
    midi: '12:00',
    apresmidi: '14:00',
    soir: '17:00'
  };

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

  function makeBooking(clientIdx, serviceName, daysFromToday, oldSlot, opts) {
    const svc = svcMap[serviceName];
    const startTime = slotToTime[oldSlot];
    const endTime = addMin(startTime, svc.duration_minutes);
    return {
      client_id: c + clientIdx,
      service_id: svc.id,
      booking_date: fmt(addDays(today, daysFromToday)),
      time_slot: startTime,
      time_slot_end: endTime,
      address: clientData[clientIdx].address,
      notes: opts.notes || null,
      selected_options: opts.selectedOptions || null,
      status: opts.status || 'pending',
      total_price: opts.totalPrice || svc.price,
      reminder_sent: opts.reminderSent || false,
      reminder_sent_at: opts.reminderSentAt || null
    };
  }

  const bookings = [
    // ===== Mois dernier (M-2) — historique profond =====
    makeBooking(0, 'Pose Gel UV', -55, 'matin', { notes: 'Première pose gel, couleur nude', status: 'completed', totalPrice: 45, reminderSent: true, reminderSentAt: addDays(today, -56) }),
    makeBooking(1, 'Manucure Simple', -52, 'apresmidi', { status: 'completed', totalPrice: 25, reminderSent: true, reminderSentAt: addDays(today, -53) }),
    makeBooking(3, 'Pose Capsules', -48, 'matin', { notes: 'Forme amande, rose pastel', status: 'completed', totalPrice: 55, reminderSent: true, reminderSentAt: addDays(today, -49) }),
    makeBooking(4, 'Pédicure', -45, 'midi', { selectedOptions: JSON.stringify([{ name: 'Gel semi-permanent', price: '+10€' }]), status: 'completed', totalPrice: 40, reminderSent: true, reminderSentAt: addDays(today, -46) }),
    makeBooking(7, 'Nail Art', -42, 'apresmidi', { notes: 'Motif géométrique noir et doré', selectedOptions: JSON.stringify([{ name: 'Complexe', price: '10€/ongle' }]), status: 'completed', totalPrice: 50, reminderSent: true, reminderSentAt: addDays(today, -43) }),
    makeBooking(8, 'Manucure Simple', -40, 'soir', { notes: 'Vernis semi-permanent rouge', status: 'completed', totalPrice: 25, reminderSent: true, reminderSentAt: addDays(today, -41) }),
    makeBooking(6, 'Remplissage', -38, 'matin', { status: 'no_show', totalPrice: 35, reminderSent: true, reminderSentAt: addDays(today, -39) }),

    // ===== Mois précédent (M-1) =====
    makeBooking(0, 'Remplissage', -32, 'matin', { notes: 'Remplissage pose gel', status: 'completed', totalPrice: 35, reminderSent: true, reminderSentAt: addDays(today, -33) }),
    makeBooking(2, 'Pose Gel UV', -30, 'apresmidi', { notes: 'Couleur bordeaux', selectedOptions: JSON.stringify([{ name: 'French', price: '+5€' }]), status: 'completed', totalPrice: 50, reminderSent: true, reminderSentAt: addDays(today, -31) }),
    makeBooking(5, 'Manucure Simple', -28, 'midi', { status: 'completed', totalPrice: 25, reminderSent: true, reminderSentAt: addDays(today, -29) }),
    makeBooking(9, 'Pose Capsules', -25, 'matin', { notes: 'Capsules stiletto, longueur moyenne', status: 'completed', totalPrice: 55, reminderSent: true, reminderSentAt: addDays(today, -26) }),
    makeBooking(6, 'Manucure Simple', -23, 'matin', { status: 'cancelled', totalPrice: 25 }),

    // ===== Ce mois-ci — semaines passées =====
    makeBooking(0, 'Pose Gel UV', -20, 'matin', { notes: 'Couleur nude rosé souhaitée', selectedOptions: JSON.stringify([{ name: 'Baby Boomer', price: '+10€' }]), status: 'completed', totalPrice: 55, reminderSent: true, reminderSentAt: addDays(today, -21) }),
    makeBooking(1, 'Manucure Simple', -15, 'apresmidi', { status: 'completed', totalPrice: 25, reminderSent: true, reminderSentAt: addDays(today, -16) }),
    makeBooking(3, 'Pose Capsules', -12, 'matin', { notes: 'Forme amande, longueur moyenne', status: 'completed', totalPrice: 55, reminderSent: true, reminderSentAt: addDays(today, -13) }),
    makeBooking(2, 'Pédicure', -10, 'midi', { selectedOptions: JSON.stringify([{ name: 'Gel semi-permanent', price: '+10€' }]), status: 'completed', totalPrice: 40, reminderSent: true, reminderSentAt: addDays(today, -11) }),
    makeBooking(7, 'Pose Gel UV', -7, 'apresmidi', { notes: 'French classique', selectedOptions: JSON.stringify([{ name: 'French', price: '+5€' }]), status: 'completed', totalPrice: 50, reminderSent: true, reminderSentAt: addDays(today, -8) }),
    makeBooking(5, 'Remplissage', -5, 'matin', { status: 'completed', totalPrice: 35, reminderSent: true, reminderSentAt: addDays(today, -6) }),
    makeBooking(3, 'Remplissage', -3, 'soir', { notes: 'Changement de couleur : rouge bordeaux', status: 'completed', totalPrice: 35, reminderSent: true, reminderSentAt: addDays(today, -4) }),
    makeBooking(9, 'Manucure Simple', -2, 'apresmidi', { status: 'no_show', totalPrice: 25, reminderSent: true, reminderSentAt: addDays(today, -3) }),
    makeBooking(6, 'Pose Gel UV', -1, 'matin', { notes: 'Annulé : empêchement professionnel', status: 'cancelled', totalPrice: 45 }),

    // ===== Aujourd'hui =====
    makeBooking(0, 'Remplissage', 0, 'matin', { notes: 'Remplissage pose gel du mois dernier', status: 'confirmed', totalPrice: 35 }),
    makeBooking(1, 'Pose Gel UV', 0, 'apresmidi', { notes: 'Couleur : rose pastel', selectedOptions: JSON.stringify([{ name: 'Baby Boomer', price: '+10€' }]), status: 'pending', totalPrice: 55 }),

    // ===== Demain =====
    makeBooking(2, 'Pose Capsules', 1, 'matin', { notes: 'Forme stiletto, longueur longue, couleur noire mate', status: 'confirmed', totalPrice: 55 }),
    makeBooking(4, 'Manucure Simple', 1, 'soir', { notes: 'Première visite !', status: 'pending', totalPrice: 25 }),

    // ===== Prochains jours =====
    makeBooking(3, 'Pose Gel UV', 3, 'matin', { notes: 'Effet chrome miroir doré', selectedOptions: JSON.stringify([{ name: 'French', price: '+5€' }]), status: 'confirmed', totalPrice: 50 }),
    makeBooking(7, 'Remplissage', 4, 'midi', { status: 'pending', totalPrice: 35 }),
    makeBooking(8, 'Pose Gel UV', 5, 'matin', { notes: 'Baby boomer naturel', selectedOptions: JSON.stringify([{ name: 'Baby Boomer', price: '+10€' }]), status: 'confirmed', totalPrice: 55 }),
    makeBooking(5, 'Pédicure', 5, 'apresmidi', { notes: 'Pédicure + vernis semi-permanent', selectedOptions: JSON.stringify([{ name: 'Gel semi-permanent', price: '+10€' }]), status: 'pending', totalPrice: 40 }),
    makeBooking(0, 'Nail Art', 7, 'apresmidi', { notes: 'Design floral pour mariage, 10 ongles', selectedOptions: JSON.stringify([{ name: 'Full set', price: '-20%' }]), status: 'pending', totalPrice: 50 }),
    makeBooking(9, 'Manucure Simple', 8, 'matin', { status: 'pending', totalPrice: 25 }),
    makeBooking(4, 'Pose Capsules', 10, 'apresmidi', { notes: 'Capsules forme coffin, couleur nude', status: 'pending', totalPrice: 55 }),
  ];

  await knex('bookings').insert(bookings);
};
