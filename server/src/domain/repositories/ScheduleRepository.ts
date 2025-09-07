import type { Schedule } from "../models/Schedule.ts";

export interface ScheduleRepository {
    getScheduleByGroup(groupName: string): Promise<Schedule[]>;
}
