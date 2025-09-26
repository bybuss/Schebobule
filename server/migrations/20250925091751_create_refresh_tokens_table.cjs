exports.up = function(knex) {
    return knex.schema.createTable("refresh_tokens", function(table) {
        table.increments("id").primary();
        table.integer("user_id").unsigned().notNullable();
        table.string("token").notNullable().unique();
        table.timestamp("expires_at").notNullable();
        table.boolean("is_revoked").defaultTo(false);
        table.timestamps(true, true);

        table.foreign("user_id").references("id").inTable("users").onDelete("CASCADE");

        table.index("user_id");
        table.index("token");
        table.index("expires_at");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("refresh_tokens");
};
