import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class GetAllSchedulesUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(): Promise<Schedule[]> {
        return await this.scheduleRepository.getAllSchedules();
    }
}
