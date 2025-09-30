exports.up = function(knex) {
    return knex.schema.createTable("access_token_blacklist", function(table) {
        table.increments("id").primary();
        table.string("token").notNullable().unique();
        table.timestamp("expires_at").notNullable();
        table.timestamps(true, true);
        
        table.index("token");
        table.index("expires_at");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("access_token_blacklist");
};
