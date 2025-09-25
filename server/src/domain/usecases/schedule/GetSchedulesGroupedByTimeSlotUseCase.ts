import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class GetSchedulesGroupedByTimeSlotUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(): Promise<{timeSlot: string, schedules: Schedule[]}[]> {
        return await this.scheduleRepository.getSchedulesGroupedByTimeSlot();
    }
}
