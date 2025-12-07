import { injectable, inject } from "tsyringe";
import { ScheduleRepository } from "../domain/repositories/ScheduleRepository";
import { Schedule } from "../domain/models/Schedule";
import { ScheduleRequest, ScheduleResponse } from "../data/models";
import { NetworkService } from "../../common/data/NetworkService";
import { isValidPairNumber } from "../domain/PairSchedule";

@injectable()
export class ScheduleRepositoryImpl implements ScheduleRepository {
    constructor(@inject(NetworkService) private networkService: NetworkService) {}

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
            pairNumber: schedule.pairNumber,
            startTime: schedule.startTime.toISOString(),
            endTime: schedule.endTime.toISOString()
        };
        
        console.log("[ScheduleRepositoryImpl] Sending request data:", scheduleRequest);
        
        const response = await this.networkService.post<ScheduleResponse>("/api/schedules", scheduleRequest);
        return this.mapToSchedule(response);
    }

    async updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule> {
        console.log("[ScheduleRepositoryImpl] Updating schedule ID:", id, schedule);
        
        const updateData: any = { ...schedule };
        
        if (schedule.startTime) {
            updateData.startTime = schedule.startTime.toISOString();
        }
        if (schedule.endTime) {
            updateData.endTime = schedule.endTime.toISOString();
        }
        
        const response = await this.networkService.put<ScheduleResponse>(`/api/schedules/${id}`, updateData);
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

    private mapToSchedule = (response: ScheduleResponse): Schedule => {
        console.log("[ScheduleRepositoryImpl] Response data for mapping:", response);
        
        let pairNumber: number;
        
        if (response.pairNumber !== undefined && response.pairNumber !== null) {
            pairNumber = Number(response.pairNumber);
        } else {
            pairNumber = this.calculatePairNumberFromTime(response.startTime, response.endTime);
        }
        
        if (!isValidPairNumber(pairNumber)) {
            console.warn(`[ScheduleRepositoryImpl] Invalid pair number: ${pairNumber}, defaulting to 1`);
            pairNumber = 1;
        }
        
        return {
            id: response.id,
            groupName: response.groupName,
            teacherName: response.teacherName,
            startTime: new Date(response.startTime),
            endTime: new Date(response.endTime),
            subject: response.subject,
            room: response.room,
            pairNumber: pairNumber
        };
    }

    private calculatePairNumberFromTime(startTime: string, endTime: string): number {
        try {
            const start = new Date(startTime);
            
            const localDate = new Date(start.toLocaleString('ru-RU'));
            const hours = localDate.getHours();
            const minutes = localDate.getMinutes();
            
            console.log(`[ScheduleRepositoryImpl] Local time from UTC ${startTime}: ${hours}:${minutes}`);
            
            const totalMinutes = hours * 60 + minutes;
            
            if (totalMinutes >= 480 && totalMinutes < 570) return 1;
            if (totalMinutes >= 580 && totalMinutes < 670) return 2;
            if (totalMinutes >= 690 && totalMinutes < 780) return 3;
            if (totalMinutes >= 790 && totalMinutes < 880) return 4;
            if (totalMinutes >= 900 && totalMinutes < 990) return 5;
            if (totalMinutes >= 1000 && totalMinutes < 1090) return 6;
            if (totalMinutes >= 1100 && totalMinutes < 1190) return 7;
            
            return 1;
        } catch (error) {
            console.error("[ScheduleRepositoryImpl] Error calculating pair number:", error);
            return 1;
        }
    }
}
