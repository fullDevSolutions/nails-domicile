exports.up = function(knex) {
  return knex.schema.alterTable('bookings', table => {
    table.boolean('reminder_sent').defaultTo(false).after('total_price');
    table.datetime('reminder_sent_at').nullable().after('reminder_sent');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('bookings', table => {
    table.dropColumn('reminder_sent');
    table.dropColumn('reminder_sent_at');
  });
};
