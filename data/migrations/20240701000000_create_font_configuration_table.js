/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.hasTable('FontConfiguration').then(function(exists) {
    if (!exists) {
      return knex.schema.createTable('FontConfiguration', function(table) {
        table.text('id').primary();
        table.text('name').notNullable();
        table.text('assignedLanguage').notNullable();
        table.text('characters').notNullable(); // Stores JSON string of characters
        table.text('fileName').notNullable();
        table.integer('fileSize').notNullable();
        table.text('storagePath').notNullable();
        table.text('downloadURL').notNullable();
        table.text('createdAt').notNullable(); // Stores ISO8601 date string

        // Add index for faster lookups on assignedLanguage for getFontsForGenerator
        table.index('assignedLanguage');
        table.index('createdAt');
      });
    }
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('FontConfiguration');
};
