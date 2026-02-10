exports.up = function(knex) {
  return knex.schema.createTable('clients', table => {
    table.increments('id').primary();
    table.string('first_name', 50).notNullable();
    table.string('last_name', 50).notNullable();
    table.string('phone', 20).notNullable();
    table.string('email', 255).nullable();
    table.string('address', 255).nullable();
    table.integer('total_bookings').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('clients');
};
