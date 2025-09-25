exports.up = function(knex) {
    return knex.schema.createTable("users", function(table) {
        table.increments("id").primary();
        table.string("email").unique().notNullable();
        table.string("password_hash").notNullable();
        table.boolean("is_admin").defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("users");
};
