exports.up = function(knex) {
  return knex.schema.createTable('blocked_dates', table => {
    table.increments('id').primary();
    table.date('blocked_date').notNullable().unique();
    table.string('reason', 255).nullable();
    table.boolean('is_recurring').defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('blocked_dates');
};
