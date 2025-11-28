import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../repositories/ScheduleRepository";

@injectable()
export class DeleteScheduleUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(id: number): Promise<void> {
        console.log("[DeleteScheduleUseCase] Executing delete schedule ID:", id);
        return this.scheduleRepository.deleteSchedule(id);
    }
}
