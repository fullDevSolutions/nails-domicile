exports.up = function(knex) {
  return knex.schema.alterTable('bookings', table => {
    table.json('selected_options').nullable().after('notes');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('bookings', table => {
    table.dropColumn('selected_options');
  });
};
