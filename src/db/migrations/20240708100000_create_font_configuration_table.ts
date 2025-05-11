
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('FontConfiguration', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('assignedLanguage').notNullable();
    table.text('characters').notNullable(); // Store characters as a JSON string
    table.string('fileName').notNullable();
    table.bigInteger('fileSize').notNullable(); // Use bigInteger for potentially large file sizes
    table.string('storagePath').notNullable();
    table.string('downloadURL').notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('FontConfiguration');
}
