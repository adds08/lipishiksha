/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  console.log('[MIGRATION LOG] Attempting to run UP migration: 20240701000000_create_font_configuration_table.js');
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

    table.index('assignedLanguage');
    table.index('createdAt');
    console.log('[MIGRATION LOG] Schema for FontConfiguration table defined.');
  }).then(() => {
    console.log('[MIGRATION LOG] FontConfiguration table CREATED successfully by 20240701000000_create_font_configuration_table.js.');
  }).catch((err) => {
    console.error('[MIGRATION LOG] ERROR creating FontConfiguration table:', err);
    // Check if error is because table already exists, which might happen if knex_migrations table is out of sync
    // This specific check might be too complex here, knex.migrate.latest should handle it.
    // Re-throw to ensure migration process fails if createTable truly fails.
    throw err;
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  console.log('[MIGRATION LOG] Attempting to run DOWN migration: 20240701000000_create_font_configuration_table.js');
  return knex.schema.dropTableIfExists('FontConfiguration').then(() => {
    console.log('[MIGRATION LOG] FontConfiguration table DROPPED successfully by 20240701000000_create_font_configuration_table.js.');
  }).catch((err) => {
    console.error('[MIGRATION LOG] ERROR dropping FontConfiguration table:', err);
    throw err;
  });
};