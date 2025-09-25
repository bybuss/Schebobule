import { injectable, inject } from "tsyringe";
import type { ScheduleRepository } from "../../repositories/ScheduleRepository.ts";
import type { Schedule } from "../../models/Schedule.ts";

@injectable()
export class GetScheduleByTeacherUseCase {
    constructor(
        @inject("ScheduleRepository") private scheduleRepository: ScheduleRepository
    ) {}

    async execute(teacherName: string): Promise<Schedule[]> {
        return await this.scheduleRepository.getScheduleByTeacher(teacherName);
    }
}
