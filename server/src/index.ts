import "reflect-metadata";
import express from "express";
import { container } from "tsyringe";
import type { Request, Response } from "express";
import ScheduleController from "./presentation/routes/ScheduleController.ts";
import { GetScheduleUseCase } from "./domain/usecases/GetScheduleUseCase.ts";
import { ScheduleRepositoryImpl } from "./data/repositories/ScheduleRepository.ts";
import { pool } from "./common/connection.ts";
import { UserDao } from "./data/dao/UserDao.ts";

import AuthController from "./presentation/routes/AuthController.ts";
import { AuthRepositoryImpl } from "./data/repositories/AuthRepositoryImpl.ts";

const app = express();
const PORT = 5000;

container.registerInstance(UserDao, new UserDao(pool));
container.registerSingleton("AuthRepository", AuthRepositoryImpl)
container.registerSingleton(AuthController)

container.registerSingleton("ScheduleRepository", ScheduleRepositoryImpl); 
container.registerSingleton(GetScheduleUseCase);
container.registerSingleton(ScheduleController);

console.log(container);

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
