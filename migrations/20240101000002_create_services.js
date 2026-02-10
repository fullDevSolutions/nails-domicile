exports.up = function(knex) {
  return knex.schema.createTable('services', table => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.text('description').nullable();
    table.decimal('price', 8, 2).notNullable();
    table.string('price_unit', 50).defaultTo('séance');
    table.integer('duration_minutes').notNullable();
    table.string('icon', 10).defaultTo('💅');
    table.string('image', 500).nullable();
    table.json('includes').nullable();
    table.json('options').nullable();
    table.integer('display_order').defaultTo(0);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('services');
};
