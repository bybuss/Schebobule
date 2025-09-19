
exports.up = function(knex) {
    return knex.schema.createTable("users", function(table) {
        table.increments("id").primary();
        table.string("email").unique().notNullable();
        table.string("passwordhash").notNullable();
        table.boolean("isAdmin").defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table("users", function(table) {
        table.dropColumn("isAdmin");
    });
};
