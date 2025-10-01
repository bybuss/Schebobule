import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import knex from "knex";
import "./di/container.ts";
import { authRoutes } from "./presentation/routes/authRoutes.ts";
import { scheduleRoutes } from "./presentation/routes/scheduleRoutes.ts";

dotenv.config();

const app = express();
const PORT = 5000;

const db = knex({
    client: "pg",
    connection: {
        host: process.env.DB_HOST || "",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || ""
    }
});

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api/schedules", scheduleRoutes);

db.migrate.latest()
  .then(() => {
    console.log("Migrated successfully!!!!");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Migrations error: ${error}`);
    process.exit(1);
  });
