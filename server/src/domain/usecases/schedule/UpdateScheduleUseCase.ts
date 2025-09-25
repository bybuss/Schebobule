import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class UpdateScheduleUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(id: number, scheduleData: Partial<Schedule>): Promise<Schedule | null> {
        return await this.scheduleRepository.update(id, scheduleData);
    }
}
