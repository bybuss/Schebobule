import type { ScheduleRepository } from "../../domain/repositories/ScheduleRepository.ts";
import type { Schedule } from "../../domain/models/Schedule.ts";
import { singleton } from "tsyringe";

const mockSchedule: Schedule[] = [
    { id: 1, groupName: "Group A", teacherName: "John Doe", startTime: new Date(), endTime: new Date(), subject: "Math" },
    { id: 2, groupName: "Group B", teacherName: "Jane Smith", startTime: new Date(), endTime: new Date(), subject: "English" }
];

@singleton()
export class ScheduleRepositoryImpl implements ScheduleRepository {
    async getScheduleByGroup(groupName: string): Promise<Schedule[]> {
        return mockSchedule.filter(schedule => schedule.groupName === groupName);
    }
}
