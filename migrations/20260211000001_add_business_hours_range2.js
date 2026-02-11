exports.up = function(knex) {
  return knex.schema.alterTable('business_hours', table => {
    table.time('open_time_2').nullable().after('close_time');
    table.time('close_time_2').nullable().after('open_time_2');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('business_hours', table => {
    table.dropColumn('open_time_2');
    table.dropColumn('close_time_2');
  });
};
