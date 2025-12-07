import { Schedule } from "../domain/models/Schedule";

export interface ScheduleAction {
    loadSchedules: () => void;
    createSchedule: (schedule: Omit<Schedule, "id">) => void;
    updateSchedule: (id: number, schedule: Partial<Schedule>) => void;
    deleteSchedule: (id: number) => void;
    openCreateModal: () => void;
    openEditModal: (schedule: Schedule) => void;
    closeModal: () => void;
    setGroupFilter: (groupName: string) => void;
    setTeacherFilter: (teacherName: string) => void;
    clearFilters: () => void;
    clearError: () => void;
}
