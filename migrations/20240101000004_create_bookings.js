exports.up = function(knex) {
  return knex.schema.createTable('bookings', table => {
    table.increments('id').primary();
    table.integer('client_id').unsigned().notNullable()
      .references('id').inTable('clients').onDelete('CASCADE');
    table.integer('service_id').unsigned().notNullable()
      .references('id').inTable('services').onDelete('CASCADE');
    table.date('booking_date').notNullable();
    table.string('time_slot', 20).notNullable();
    table.string('address', 255).notNullable();
    table.text('notes').nullable();
    table.enum('status', ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'])
      .defaultTo('pending');
    table.decimal('total_price', 8, 2).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bookings');
};
