exports.up = function(knex) {
  return knex.schema.createTable('business_hours', table => {
    table.increments('id').primary();
    table.integer('day_of_week').unsigned().notNullable(); // 0=Sunday, 1=Monday, ...
    table.string('day_name', 20).notNullable();
    table.time('open_time').defaultTo('09:00');
    table.time('close_time').defaultTo('19:00');
    table.boolean('is_open').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('business_hours');
};
