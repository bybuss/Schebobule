import type { ScheduleRepository } from "../repositories/ScheduleRepository.ts";
import type { Schedule } from "../models/Schedule.ts";
import { injectable } from "tsyringe";

@injectable()
export class GetScheduleUseCase {
    private scheduleRepository: ScheduleRepository;

    constructor(scheduleRepository: ScheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    async execute(groupName: string): Promise<Schedule[]> {
        return this.scheduleRepository.getScheduleByGroup(groupName);
    } 
}