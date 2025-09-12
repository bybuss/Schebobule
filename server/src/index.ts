import "reflect-metadata";
import express from "express";
import { container } from "tsyringe";
import type { Request, Response } from "express";
import ScheduleController from "./presentation/routes/ScheduleController.ts";
import { GetScheduleUseCase } from "./domain/usecases/GetScheduleUseCase.ts";
import { ScheduleRepositoryImpl } from "./data/repositories/ScheduleRepository.ts";
import { pool } from "./common/connection.ts";
import knex from 'knex';
import dotenv from 'dotenv';
import { UserDao } from "./data/dao/UserDao.ts";
import AuthController from "./presentation/routes/AuthController.ts";
import { AuthRepositoryImpl } from "./data/repositories/AuthRepositoryImpl.ts";

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

container.registerInstance(UserDao, new UserDao(pool));
container.registerSingleton("AuthRepository", AuthRepositoryImpl)
container.registerSingleton(AuthController)

container.registerSingleton("ScheduleRepository", ScheduleRepositoryImpl); 
container.registerSingleton(GetScheduleUseCase);
container.registerSingleton(ScheduleController);

const router = express.Router();

const scheduleController = container.resolve(ScheduleController);
const authController = container.resolve(AuthController);

router.get("/schedule/:groupName", scheduleController.getSchedue.bind(scheduleController));

app.get("/", (req: Request, res, Response) => {
  res.send("SKEBOB!!");
});

app.use(express.json());

app.use("/api", router);
app.post("/login", authController.login.bind(authController));
app.post("/register", authController.register.bind(authController));

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
