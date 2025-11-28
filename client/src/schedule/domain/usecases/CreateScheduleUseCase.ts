import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../repositories/ScheduleRepository";
import { Schedule } from "../models/Schedule";

@injectable()
export class CreateScheduleUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(schedule: Omit<Schedule, "id">): Promise<Schedule> {
        console.log("[CreateScheduleUseCase] Executing create schedule:", schedule);
        return this.scheduleRepository.createSchedule(schedule);
    }
}
