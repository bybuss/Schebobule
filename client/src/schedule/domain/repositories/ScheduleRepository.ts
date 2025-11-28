import { Schedule } from "../models/Schedule";

export interface ScheduleRepository {
    getAllSchedules(): Promise<Schedule[]>;
    getScheduleById(id: number): Promise<Schedule>;
    createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule>;
    updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule>;
    deleteSchedule(id: number): Promise<void>;
    getScheduleByGroup(groupName: string): Promise<Schedule[]>;
    getScheduleByTeacher(teacherName: string): Promise<Schedule[]>;
}
