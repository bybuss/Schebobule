import type { ScheduleRepository } from "../repositories/ScheduleRepository.ts";
import type { Schedule } from "../models/Schedule.ts";
import { injectable, inject } from "tsyringe";

@injectable()
export class GetScheduleUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(groupName: string): Promise<Schedule[]> {
        return this.scheduleRepository.getScheduleByGroup(groupName);
    }
}
