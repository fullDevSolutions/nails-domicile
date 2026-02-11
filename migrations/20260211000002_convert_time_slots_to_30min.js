exports.up = async function(knex) {
  // 1. Add time_slot_end column
  const hasCol = await knex.schema.hasColumn('bookings', 'time_slot_end');
  if (!hasCol) {
    await knex.schema.alterTable('bookings', (table) => {
      table.string('time_slot_end', 5).after('time_slot').nullable();
    });
  }

  // 2. Convert old named slots to HH:MM
  const slotMap = {
    matin: '09:00',
    midi: '12:00',
    apresmidi: '14:00',
    soir: '17:00'
  };

  for (const [oldSlot, newTime] of Object.entries(slotMap)) {
    await knex('bookings')
      .where('time_slot', oldSlot)
      .update({ time_slot: newTime });
  }

  // 3. Calculate time_slot_end from service duration
  const bookings = await knex('bookings')
    .join('services', 'bookings.service_id', 'services.id')
    .select('bookings.id', 'bookings.time_slot', 'services.duration_minutes')
    .whereNull('bookings.time_slot_end');

  for (const b of bookings) {
    const [hours, mins] = b.time_slot.split(':').map(Number);
    const totalMins = hours * 60 + mins + b.duration_minutes;
    const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
    const endM = String(totalMins % 60).padStart(2, '0');
    await knex('bookings').where('id', b.id).update({ time_slot_end: `${endH}:${endM}` });
  }

  // Set default for any remaining nulls
  await knex('bookings')
    .whereNull('time_slot_end')
    .update({ time_slot_end: knex.raw("CONCAT(LPAD(CAST(SUBSTRING(time_slot, 1, 2) AS UNSIGNED) + 1, 2, '0'), ':00')") });
};

exports.down = async function(knex) {
  // Revert HH:MM back to named slots
  const reverseMap = {
    '09:00': 'matin',
    '09:30': 'matin',
    '10:00': 'matin',
    '10:30': 'matin',
    '11:00': 'matin',
    '11:30': 'matin',
    '12:00': 'midi',
    '12:30': 'midi',
    '13:00': 'midi',
    '13:30': 'midi',
    '14:00': 'apresmidi',
    '14:30': 'apresmidi',
    '15:00': 'apresmidi',
    '15:30': 'apresmidi',
    '16:00': 'apresmidi',
    '16:30': 'apresmidi',
    '17:00': 'soir',
    '17:30': 'soir',
    '18:00': 'soir',
    '18:30': 'soir'
  };

  for (const [time, slot] of Object.entries(reverseMap)) {
    await knex('bookings')
      .where('time_slot', time)
      .update({ time_slot: slot });
  }

  await knex.schema.alterTable('bookings', (table) => {
    table.dropColumn('time_slot_end');
  });
};
