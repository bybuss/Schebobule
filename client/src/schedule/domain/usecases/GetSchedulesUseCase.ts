import { IScheduleRepository } from "../repositories/ScheduleRepository";
import { Schedule } from "../models/Schedule";

export class GetSchedulesUseCase {
  constructor(private scheduleRepository: IScheduleRepository) {}

  async execute(): Promise<Schedule[]> {
    return this.scheduleRepository.getAllSchedules();
  }
}
