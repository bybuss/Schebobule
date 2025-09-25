import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";

@injectable()
export class DeleteScheduleUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(id: number): Promise<boolean> {
        return await this.scheduleRepository.delete(id);
    }
}
