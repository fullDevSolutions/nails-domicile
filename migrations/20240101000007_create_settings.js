exports.up = function(knex) {
  return knex.schema.createTable('settings', table => {
    table.increments('id').primary();
    table.string('setting_key', 100).notNullable().unique();
    table.text('setting_value').nullable();
    table.string('setting_type', 20).defaultTo('string');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('settings');
};
