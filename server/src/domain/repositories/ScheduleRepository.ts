import type { Schedule } from "../models/Schedule.ts";

export interface ScheduleRepository {
    create(schedule: Omit<Schedule, "id">): Promise<Schedule>;
    update(id: number, schedule: Partial<Schedule>): Promise<Schedule | null>;
    delete(id: number): Promise<boolean>;
    getById(id: number): Promise<Schedule | null>;

    getScheduleByGroup(groupName: string): Promise<Schedule[]>;
    getScheduleByTeacher(teacherName: string): Promise<Schedule[]>;
    getScheduleByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]>;
    getScheduleByGroupAndDate(groupName: string, date: Date): Promise<Schedule[]>;
    getSchedulesGroupedByTimeSlot(): Promise<{timeSlot: string, schedules: Schedule[]}[]>;
    getAllSchedules(): Promise<Schedule[]>;
}
