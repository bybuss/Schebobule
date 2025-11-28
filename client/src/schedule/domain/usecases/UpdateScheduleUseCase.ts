import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../repositories/ScheduleRepository";
import { Schedule } from "../models/Schedule";

@injectable()
export class UpdateScheduleUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(id: number, schedule: Partial<Schedule>): Promise<Schedule> {
        console.log("[UpdateScheduleUseCase] Executing update schedule ID:", id, schedule);
        return this.scheduleRepository.updateSchedule(id, schedule);
    }
}
