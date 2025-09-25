import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class GetScheduleByDateRangeUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(startDate: Date, endDate: Date): Promise<Schedule[]> {
        return await this.scheduleRepository.getScheduleByDateRange(startDate, endDate);
    }
}
