import type { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { CreateScheduleUseCase } from "../../domain/usecases/schedule/CreateScheduleUseCase.ts";
import { UpdateScheduleUseCase } from "../../domain/usecases/schedule/UpdateScheduleUseCase.ts";
import { DeleteScheduleUseCase } from "../../domain/usecases/schedule/DeleteScheduleUseCase.ts";
import { GetScheduleByIdUseCase } from "../../domain/usecases/schedule/GetScheduleByIdUseCase.ts";
import { GetScheduleByGroupUseCase } from "../../domain/usecases/schedule/GetScheduleByGroupUseCase.ts";
import { GetScheduleByTeacherUseCase } from "../../domain/usecases/schedule/GetScheduleByTeacherUseCase.ts";
import { GetScheduleByDateRangeUseCase } from "../../domain/usecases/schedule/GetScheduleByDateRangeUseCase.ts";
import { GetScheduleByGroupAndDateUseCase } from "../../domain/usecases/schedule/GetScheduleByGroupAndDateUseCase.ts";
import { GetSchedulesGroupedByTimeSlotUseCase } from "../../domain/usecases/schedule/GetSchedulesGroupedByTimeSlotUseCase.ts";
import { GetAllSchedulesUseCase } from "../../domain/usecases/schedule/GetAllSchedulesUseCase.ts";
import type { Schedule } from "../../domain/models/Schedule.ts";

@injectable()
export class ScheduleController {
    constructor(
        @inject(CreateScheduleUseCase) private createScheduleUseCase: CreateScheduleUseCase,
        @inject(UpdateScheduleUseCase) private updateScheduleUseCase: UpdateScheduleUseCase,
        @inject(DeleteScheduleUseCase) private deleteScheduleUseCase: DeleteScheduleUseCase,
        @inject(GetScheduleByIdUseCase) private getScheduleByIdUseCase: GetScheduleByIdUseCase,
        @inject(GetScheduleByGroupUseCase) private getScheduleByGroupUseCase: GetScheduleByGroupUseCase,
        @inject(GetScheduleByTeacherUseCase) private getScheduleByTeacherUseCase: GetScheduleByTeacherUseCase,
        @inject(GetScheduleByDateRangeUseCase) private getScheduleByDateRangeUseCase: GetScheduleByDateRangeUseCase,
        @inject(GetScheduleByGroupAndDateUseCase) private getScheduleByGroupAndDateUseCase: GetScheduleByGroupAndDateUseCase,
        @inject(GetSchedulesGroupedByTimeSlotUseCase) private getSchedulesGroupedByTimeSlotUseCase: GetSchedulesGroupedByTimeSlotUseCase,
        @inject(GetAllSchedulesUseCase) private getAllSchedulesUseCase: GetAllSchedulesUseCase
    ) {}

    async createSchedule(req: Request, res: Response): Promise<void> {
        console.log(`[ScheduleController] CREATE schedule request received`);
        console.log(`[ScheduleController] Request body: ${JSON.stringify(req.body)}`);
        
        try {
            const { groupName, teacherName, startTime, endTime, subject, room } = req.body;

            console.log(`[ScheduleController] Parsed data - group: ${groupName}, teacher: ${teacherName}, start: ${startTime}, end: ${endTime}, subject: ${subject}, room: ${room}`);

            if (!groupName || !teacherName || !startTime || !endTime || !subject || !room) {
                console.log(`[ScheduleController] Validation failed: missing required fields`);
                res.status(400).json({ message: "All fields are required" });
                return;
            }
            
            const scheduleData: Omit<Schedule, "id"> = {
                groupName,
                teacherName,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                subject,
                room
            };

            console.log(`[ScheduleController] Calling createScheduleUseCase with data: ${JSON.stringify(scheduleData)}`);
            
            const newSchedule = await this.createScheduleUseCase.execute(scheduleData);
            
            console.log(`[ScheduleController] Schedule created successfully: ${JSON.stringify(newSchedule)}`);
            res.status(201).json(newSchedule);
        } catch (error) {
            console.error(`[ScheduleController] Error creating schedule: ${error}`);
            res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create schedule" });
        }
    }

    async updateSchedule(req: Request, res: Response): Promise<void> {
        console.log(`[ScheduleController] UPDATE schedule request received for ID: ${req.params.id}`);
        console.log(`[ScheduleController] Request body: ${JSON.stringify(req.body)}`);
        
        try {
            const id = parseInt(req.params.id || "");
            console.log(`[ScheduleController] Parsed schedule ID: ${id}`);

            const scheduleData = req.body;
            console.log(`[ScheduleController] Update data: ${JSON.stringify(scheduleData)}`);

            if (scheduleData.startTime) {
                scheduleData.startTime = new Date(scheduleData.startTime);
                console.log(`[ScheduleController] Parsed startTime: ${scheduleData.startTime}`);
            }
            if (scheduleData.endTime) {
                scheduleData.endTime = new Date(scheduleData.endTime);
                console.log(`[ScheduleController] Parsed endTime: ${scheduleData.endTime}`);
            }

            console.log(`[ScheduleController] Calling updateScheduleUseCase with ID: ${id} and data: ${JSON.stringify(scheduleData)}`);
            
            const updatedSchedule = await this.updateScheduleUseCase.execute(id, scheduleData);
            
            if (!updatedSchedule) {
                console.log(`[ScheduleController] Schedule with ID ${id} not found`);
                res.status(404).json({ message: "Schedule not found" });
                return;
            }

            console.log(`[ScheduleController] Schedule updated successfully: ${JSON.stringify(updatedSchedule)}`);
            res.json(updatedSchedule);
        } catch (error) {
            console.error(`[ScheduleController] Error updating schedule: ${error}`);
            res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update schedule" });
        }
    }

    async deleteSchedule(req: Request, res: Response): Promise<void> {
        console.log(`[ScheduleController] DELETE schedule request received for ID: ${req.params.id}`);
        
        try {
            const id = parseInt(req.params.id || "");
            console.log(`[ScheduleController] Parsed schedule ID: ${id}`);

            console.log(`[ScheduleController] Calling deleteScheduleUseCase with ID: ${id}`);
            
            const success = await this.deleteScheduleUseCase.execute(id);
            
            if (!success) {
                console.log(`[ScheduleController] Schedule with ID ${id} not found for deletion`);
                res.status(404).json({ message: "Schedule not found" });
                return;
            }

            console.log(`[ScheduleController] Schedule with ID ${id} deleted successfully`);
            res.json({ message: "Schedule deleted successfully" });
        } catch (error) {
            console.error(`[ScheduleController] Error deleting schedule: ${error}`);
            res.status(400).json({ message: error instanceof Error ? error.message : "Failed to delete schedule" });
        }
    }

    async getScheduleById(req: Request, res: Response): Promise<void> {
        console.log(`[ScheduleController] GET schedule by ID request received: ${req.params.id}`);
        
        try {
            const id = parseInt(req.params.id || "");
            console.log(`[ScheduleController] Parsed schedule ID: ${id}`);

            console.log(`[ScheduleController] Calling getScheduleByIdUseCase with ID: ${id}`);
            
            const schedule = await this.getScheduleByIdUseCase.execute(id);
            
            if (!schedule) {
                console.log(`[ScheduleController] Schedule with ID ${id} not found`);
                res.status(404).json({ message: "Schedule not found" });
                return;
            }

            console.log(`[ScheduleController] Schedule found: ${JSON.stringify(schedule)}`);
            res.json(schedule);
        } catch (error) {
            console.error(`[ScheduleController] Error getting schedule by id: ${error}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getScheduleByGroup(req: Request, res: Response): Promise<void> {
        const groupName = req.params.groupName || "unknown group";
        console.log(`[ScheduleController] GET schedule by group request received: ${groupName}`);
        
        try {
            console.log(`[ScheduleController] Calling getScheduleByGroupUseCase with group: ${groupName}`);
            
            const schedules = await this.getScheduleByGroupUseCase.execute(groupName);
            
            console.log(`[ScheduleController] Found ${schedules.length} schedules for group ${groupName}`);
            res.json(schedules);
        } catch (error) {
            console.error(`[ScheduleController] Error getting schedule by group: ${error}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getScheduleByTeacher(req: Request, res: Response): Promise<void> {
        const teacherName = req.params.teacherName || "unknown teacher";
        console.log(`[ScheduleController] GET schedule by teacher request received: ${teacherName}`);
        
        try {
            console.log(`[ScheduleController] Calling getScheduleByTeacherUseCase with teacher: ${teacherName}`);
            
            const schedules = await this.getScheduleByTeacherUseCase.execute(teacherName);
            
            console.log(`[ScheduleController] Found ${schedules.length} schedules for teacher ${teacherName}`);
            res.json(schedules);
        } catch (error) {
            console.error(`[ScheduleController] Error getting schedule by teacher: ${error}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getScheduleByDateRange(req: Request, res: Response): Promise<void> {
        console.log(`[ScheduleController] GET schedule by date range request received`);
        console.log(`[ScheduleController] Query parameters: ${JSON.stringify(req.query)}`);
        
        try {
            const { startDate, endDate } = req.query;
            
            if (!startDate || !endDate) {
                console.log(`[ScheduleController] Missing startDate or endDate parameters`);
                res.status(400).json({ message: "startDate and endDate are required" });
                return;
            }

            console.log(`[ScheduleController] Date range - start: ${startDate}, end: ${endDate}`);
            console.log(`[ScheduleController] Calling getScheduleByDateRangeUseCase with dates: ${startDate} to ${endDate}`);
            
            const schedules = await this.getScheduleByDateRangeUseCase.execute(
                new Date(startDate as string),
                new Date(endDate as string)
            );
            
            console.log(`[ScheduleController] Found ${schedules.length} schedules in date range`);
            res.json(schedules);
        } catch (error) {
            console.error(`[ScheduleController] Error getting schedule by date range: ${error}`);
            res.status(400).json({ message: error instanceof Error ? error.message : "Invalid date range" });
        }
    }

    async getScheduleByGroupAndDate(req: Request, res: Response): Promise<void> {
        const groupName = req.params.groupName;
        const date = req.params.date;
        console.log(`[ScheduleController] GET schedule by group and date request received - group: ${groupName}, date: ${date}`);
        
        try {
            if (!groupName || !date) {
                console.log(`[ScheduleController] Missing groupName or date parameters`);
                res.status(400).json({ message: "Date is required" });
                return;
            }

            console.log(`[ScheduleController] Calling getScheduleByGroupAndDateUseCase with group: ${groupName}, date: ${date}`);
            
            const schedules = await this.getScheduleByGroupAndDateUseCase.execute(
                groupName,
                new Date(date)
            );
            
            console.log(`[ScheduleController] Found ${schedules.length} schedules for group ${groupName} on date ${date}`);
            res.json(schedules);
        } catch (error) {
            console.error(`[ScheduleController] Error getting schedule by group and date: ${error}`);
            res.status(400).json({ message: error instanceof Error ? error.message : "Invalid date" });
        }
    }

    async getSchedulesGroupedByTimeSlot(req: Request, res: Response): Promise<void> {
        console.log(`[ScheduleController] GET schedules grouped by time slot request received`);
        
        try {
            console.log(`[ScheduleController] Calling getSchedulesGroupedByTimeSlotUseCase`);
            
            const groupedSchedules = await this.getSchedulesGroupedByTimeSlotUseCase.execute();
            
            console.log(`[ScheduleController] Found ${groupedSchedules.length} time slots with schedules`);
            res.json(groupedSchedules);
        } catch (error) {
            console.error(`[ScheduleController] Error getting grouped schedules: ${error}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getAllSchedules(req: Request, res: Response): Promise<void> {
        console.log(`[ScheduleController] GET all schedules request received`);
        
        try {
            console.log(`[ScheduleController] Calling getAllSchedulesUseCase`);
            
            const schedules = await this.getAllSchedulesUseCase.execute();
            
            console.log(`[ScheduleController] Found ${schedules.length} total schedules`);
            res.json(schedules);
        } catch (error) {
            console.error(`[ScheduleController] Error getting all schedules: ${error}`);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
