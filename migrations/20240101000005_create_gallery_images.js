exports.up = function(knex) {
  return knex.schema.createTable('gallery_images', table => {
    table.increments('id').primary();
    table.string('filename', 255).notNullable();
    table.string('alt_text', 255).defaultTo('');
    table.string('category', 50).defaultTo('general');
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('gallery_images');
};
