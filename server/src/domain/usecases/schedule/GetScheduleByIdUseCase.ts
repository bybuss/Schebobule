import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class GetScheduleByIdUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(id: number): Promise<Schedule | null> {
        return await this.scheduleRepository.getById(id);
    }
}
