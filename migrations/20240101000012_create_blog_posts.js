exports.up = function(knex) {
  return knex.schema.createTable('blog_posts', table => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('slug', 255).notNullable().unique();
    table.text('excerpt').nullable();
    table.text('content', 'longtext').nullable();
    table.string('cover_image', 500).nullable();
    table.string('author', 100).nullable();
    table.boolean('is_published').defaultTo(false);
    table.datetime('published_at').nullable();
    table.integer('display_order').defaultTo(0);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('blog_posts');
};
