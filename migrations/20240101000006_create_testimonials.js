exports.up = function(knex) {
  return knex.schema.createTable('testimonials', table => {
    table.increments('id').primary();
    table.string('client_name', 100).notNullable();
    table.integer('rating').unsigned().notNullable().defaultTo(5);
    table.text('text').notNullable();
    table.boolean('is_featured').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('testimonials');
};
