import { injectable, inject } from "tsyringe";
import { ScheduleRepository } from "../domain/repositories/ScheduleRepository";
import { Schedule } from "../domain/models/Schedule";
import { ScheduleRequest, ScheduleResponse } from "../data/models";
import { NetworkService } from "../../common/data/NetworkService";

@injectable()
export class ScheduleRepositoryImpl implements ScheduleRepository {
    constructor(
        @inject(NetworkService) private networkService: NetworkService
    ) {}

    async getAllSchedules(): Promise<Schedule[]> {
        console.log("[ScheduleRepositoryImpl] Getting all schedules");
        const response = await this.networkService.get<ScheduleResponse[]>("/api/schedules");
        return response.map(this.mapToSchedule);
    }

    async getScheduleById(id: number): Promise<Schedule> {
        console.log("[ScheduleRepositoryImpl] Getting schedule by ID:", id);
        const response = await this.networkService.get<ScheduleResponse>(`/api/schedules/${id}`);
        return this.mapToSchedule(response);
    }

    async createSchedule(schedule: Omit<Schedule, "id">): Promise<Schedule> {
        console.log("[ScheduleRepositoryImpl] Creating schedule:", schedule);
        const scheduleRequest: ScheduleRequest = {
            groupName: schedule.groupName,
            teacherName: schedule.teacherName,
            subject: schedule.subject,
            room: schedule.room,
            pairNumber: schedule.pairNumber
        };
        const response = await this.networkService.post<ScheduleResponse>("/api/schedules", scheduleRequest);
        return this.mapToSchedule(response);
    }

    async updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule> {
        console.log("[ScheduleRepositoryImpl] Updating schedule ID:", id, schedule);
        const response = await this.networkService.put<ScheduleResponse>(`/api/schedules/${id}`, schedule);
        return this.mapToSchedule(response);
    }

    async deleteSchedule(id: number): Promise<void> {
        console.log("[ScheduleRepositoryImpl] Deleting schedule ID:", id);
        await this.networkService.delete(`/api/schedules/${id}`);
    }

    async getScheduleByGroup(groupName: string): Promise<Schedule[]> {
        console.log("[ScheduleRepositoryImpl] Getting schedule by group:", groupName);
        const response = await this.networkService.get<ScheduleResponse[]>(`/api/schedules/group/${groupName}`);
        return response.map(this.mapToSchedule);
    }

    async getScheduleByTeacher(teacherName: string): Promise<Schedule[]> {
        console.log("[ScheduleRepositoryImpl] Getting schedule by teacher:", teacherName);
        const response = await this.networkService.get<ScheduleResponse[]>(`/api/schedules/teacher/${teacherName}`);
        return response.map(this.mapToSchedule);
    }

    private mapToSchedule(response: ScheduleResponse): Schedule {
        return {
            id: response.id,
            groupName: response.groupName,
            teacherName: response.teacherName,
            startTime: new Date(response.startTime),
            endTime: new Date(response.endTime),
            subject: response.subject,
            room: response.room,
            pairNumber: response.pairNumber
        };
    }
}
