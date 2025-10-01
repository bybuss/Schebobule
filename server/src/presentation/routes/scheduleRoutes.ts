import { Router } from "express";
import { container } from "../../di/container.ts";
import { ScheduleController } from "../controllers/ScheduleController.ts";
import { authenticateToken } from "../../middleware/authenticateToken";
import { isAdmin } from "../../middleware/isAdmin";

const router = Router();
const scheduleController = container.resolve(ScheduleController);

router.get("/", authenticateToken, scheduleController.getAllSchedules.bind(scheduleController));
router.get("/grouped", authenticateToken, scheduleController.getSchedulesGroupedByTimeSlot.bind(scheduleController));
router.get("/group/:groupName", authenticateToken, scheduleController.getScheduleByGroup.bind(scheduleController));
router.get("/teacher/:teacherName", authenticateToken, scheduleController.getScheduleByTeacher.bind(scheduleController));
router.get("/date-range", authenticateToken, scheduleController.getScheduleByDateRange.bind(scheduleController));
router.get("/group/:groupName/date/:date", authenticateToken, scheduleController.getScheduleByGroupAndDate.bind(scheduleController));
router.get("/:id", authenticateToken, scheduleController.getScheduleById.bind(scheduleController));

router.post("/", authenticateToken, isAdmin, scheduleController.createSchedule.bind(scheduleController));
router.put("/:id", authenticateToken, isAdmin, scheduleController.updateSchedule.bind(scheduleController));
router.delete("/:id", authenticateToken, isAdmin, scheduleController.deleteSchedule.bind(scheduleController));

export { router as scheduleRoutes };
