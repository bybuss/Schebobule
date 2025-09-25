import type { ScheduleRepository } from "../../domain/repositories/ScheduleRepository.ts";
import type { Schedule } from "../../domain/models/Schedule.ts";
import { inject, injectable, singleton } from "tsyringe";
import { ScheduleDao } from "../dao/ScheduleDao.ts";

@singleton()
@injectable()
export class ScheduleRepositoryImpl implements ScheduleRepository {
    constructor(
        @inject(ScheduleDao) private scheduleDao: ScheduleDao
    ) {}

    async create(schedule: Omit<Schedule, "id">): Promise<Schedule> {
        if (schedule.endTime <= schedule.startTime) {
            throw new Error("End time must be after start time");
        }

        return await this.scheduleDao.create(schedule);
    }

    async update(id: number, schedule: Partial<Schedule>): Promise<Schedule | null> {
        if (schedule.endTime && schedule.startTime && schedule.endTime <= schedule.startTime) {
            throw new Error("End time must be after start time");
        }

        return await this.scheduleDao.update(id, schedule);
    }

    async delete(id: number): Promise<boolean> {
        return await this.scheduleDao.delete(id);
    }

    async getById(id: number): Promise<Schedule | null> {
        return await this.scheduleDao.getById(id);
    }

    async getScheduleByGroup(groupName: string): Promise<Schedule[]> {
        return await this.scheduleDao.getByGroup(groupName);
    }

    async getScheduleByTeacher(teacherName: string): Promise<Schedule[]> {
        return await this.scheduleDao.getByTeacher(teacherName);
    }

    async getScheduleByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]> {
        if (endDate <= startDate) {
            throw new Error("End date must be after start date");
        }
        return await this.scheduleDao.getByDateRange(startDate, endDate);
    }

    async getScheduleByGroupAndDate(groupName: string, date: Date): Promise<Schedule[]> {
        return await this.scheduleDao.getByGroupAndDate(groupName, date);
    }

    async getSchedulesGroupedByTimeSlot(): Promise<{timeSlot: string, schedules: Schedule[]}[]> {
        return await this.scheduleDao.getGroupedByTimeSlot();
    }

    async getAllSchedules(): Promise<Schedule[]> {
        return await this.scheduleDao.getAll();
    }
}
