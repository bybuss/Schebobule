import express from "express";
import "reflect-metadata";
import type { Request, Response } from "express";
import { container } from "tsyringe";
import ScheduleController from "./presentation/routes/ScheduleController.ts";
import { GetScheduleUseCase } from "./domain/usecases/GetScheduleUseCase.ts";
import { ScheduleRepositoryImpl } from "./data/repositories/ScheduleRepository.ts";

const app = express();
const PORT = 5000;

container.registerSingleton("ScheduleRepository", ScheduleRepositoryImpl); 
container.registerSingleton(GetScheduleUseCase, GetScheduleUseCase);

const router = express.Router();
const scheduleController = container.resolve(ScheduleController);
router.get("/schedule/:groupName", scheduleController.getSchedue.bind(scheduleController));

app.get("/", (req: Request, res, Response) => {
  res.send("SKEBOB!!");
});

app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
