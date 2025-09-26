import "reflect-metadata";
import express from "express";
import { container } from "tsyringe";
import type { Request, Response } from "express";
import { ScheduleController } from "./presentation/controllers/ScheduleController.ts";
import AuthController from "./presentation/controllers/AuthController.ts";
import knex from 'knex';
import dotenv from 'dotenv';
import { pool } from "./common/connection.ts";
import { ScheduleRepositoryImpl } from "./data/repositories/ScheduleRepositoryImpl.ts";
import { ScheduleDao } from "./data/dao/ScheduleDao.ts";
import { UserDao } from "./data/dao/UserDao.ts";
import { RefreshTokenDao } from "./data/dao/RefreshTokenDao.ts";
import { AuthRepositoryImpl } from "./data/repositories/AuthRepositoryImpl.ts";
import { authenticateToken } from "./middleware/authenticateToken";
import { isAdmin } from "./middleware/isAdmin";

import { CreateScheduleUseCase } from "./domain/usecases/schedule/CreateScheduleUseCase.ts";
import { UpdateScheduleUseCase } from "./domain/usecases/schedule/UpdateScheduleUseCase.ts";
import { DeleteScheduleUseCase } from "./domain/usecases/schedule/DeleteScheduleUseCase.ts";
import { GetScheduleByIdUseCase } from "./domain/usecases/schedule/GetScheduleByIdUseCase.ts";
import { GetScheduleByGroupUseCase } from "./domain/usecases/schedule/GetScheduleByGroupUseCase.ts";
import { GetScheduleByTeacherUseCase } from "./domain/usecases/schedule/GetScheduleByTeacherUseCase.ts";
import { GetScheduleByDateRangeUseCase } from "./domain/usecases/schedule/GetScheduleByDateRangeUseCase.ts";
import { GetScheduleByGroupAndDateUseCase } from "./domain/usecases/schedule/GetScheduleByGroupAndDateUseCase.ts";
import { GetSchedulesGroupedByTimeSlotUseCase } from "./domain/usecases/schedule/GetSchedulesGroupedByTimeSlotUseCase.ts";
import { GetAllSchedulesUseCase } from "./domain/usecases/schedule/GetAllSchedulesUseCase.ts";

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
container.registerInstance(RefreshTokenDao, new RefreshTokenDao(pool));
container.registerSingleton("AuthRepository", AuthRepositoryImpl)
container.registerSingleton(AuthController)

container.registerInstance(ScheduleDao, new ScheduleDao(pool));
container.registerSingleton("ScheduleRepository", ScheduleRepositoryImpl);
container.registerSingleton(ScheduleController);

container.registerSingleton(CreateScheduleUseCase);
container.registerSingleton(UpdateScheduleUseCase);
container.registerSingleton(DeleteScheduleUseCase);
container.registerSingleton(GetScheduleByIdUseCase);
container.registerSingleton(GetScheduleByGroupUseCase);
container.registerSingleton(GetScheduleByTeacherUseCase);
container.registerSingleton(GetScheduleByDateRangeUseCase);
container.registerSingleton(GetScheduleByGroupAndDateUseCase);
container.registerSingleton(GetSchedulesGroupedByTimeSlotUseCase);
container.registerSingleton(GetAllSchedulesUseCase);

const router = express.Router();

const scheduleController = container.resolve(ScheduleController);
const authController = container.resolve(AuthController);


app.get("/", (req: Request, res, Response) => {
  res.send("SKEBOB!!");
});

app.use(express.json());

app.post("/login", authController.login.bind(authController));
app.post("/register", authController.register.bind(authController));
app.post("/refresh-token", authController.refreshToken.bind(authController));
app.post("/logout", authController.logout.bind(authController));

router.get("/schedules", authenticateToken, scheduleController.getAllSchedules.bind(scheduleController));
router.get("/schedules/grouped", authenticateToken, scheduleController.getSchedulesGroupedByTimeSlot.bind(scheduleController));
router.get("/schedules/group/:groupName", authenticateToken, scheduleController.getScheduleByGroup.bind(scheduleController));
router.get("/schedules/teacher/:teacherName", authenticateToken, scheduleController.getScheduleByTeacher.bind(scheduleController));
router.get("/schedules/date-range", authenticateToken, scheduleController.getScheduleByDateRange.bind(scheduleController));
router.get("/schedules/group/:groupName/date/:date", authenticateToken, scheduleController.getScheduleByGroupAndDate.bind(scheduleController));
router.get("/schedules/:id", authenticateToken, scheduleController.getScheduleById.bind(scheduleController));

router.post("/schedules", authenticateToken, isAdmin, scheduleController.createSchedule.bind(scheduleController));
router.put("/schedules/:id", authenticateToken, isAdmin, scheduleController.updateSchedule.bind(scheduleController));
router.delete("/schedules/:id", authenticateToken, isAdmin, scheduleController.deleteSchedule.bind(scheduleController));

app.use("/api", router);

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
