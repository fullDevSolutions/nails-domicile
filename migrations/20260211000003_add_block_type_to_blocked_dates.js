exports.up = function(knex) {
  return knex.schema.alterTable('blocked_dates', table => {
    table.string('block_type', 20).notNullable().defaultTo('full').after('is_recurring');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('blocked_dates', table => {
    table.dropColumn('block_type');
  });
};
