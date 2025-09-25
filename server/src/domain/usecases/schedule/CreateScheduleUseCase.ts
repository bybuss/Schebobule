import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class CreateScheduleUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(scheduleData: Omit<Schedule, "id">): Promise<Schedule> {
        return await this.scheduleRepository.create(scheduleData);
    }
}
