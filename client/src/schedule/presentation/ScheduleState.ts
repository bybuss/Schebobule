import { Schedule } from "../domain/models/Schedule";

export interface ScheduleState {
    schedules: Schedule[];
    isLoading: boolean;
    error: string | null;
    selectedSchedule: Schedule | null;
    isCreateModalOpen: boolean;
    isEditModalOpen: boolean;
    filters: {
        groupName: string;
        teacherName: string;
    };
}
