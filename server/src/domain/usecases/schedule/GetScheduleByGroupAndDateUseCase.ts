import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class GetScheduleByGroupAndDateUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(groupName: string, date: Date): Promise<Schedule[]> {
        return await this.scheduleRepository.getScheduleByGroupAndDate(groupName, date);
    }
}
