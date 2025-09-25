exports.up = function(knex) {
    return knex.schema.createTable("schedules", function(table) {
        table.increments("id").primary();
        table.string("group_name").notNullable();
        table.string("teacher_name").notNullable();
        table.timestamp("start_time").notNullable();
        table.timestamp("end_time").notNullable();
        table.string("subject").notNullable();
        table.string("room").notNullable();
        table.timestamps(true, true);

        table.index("group_name");
        table.index("teacher_name");
        table.index("start_time");
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("schedules");
};
