import { useState } from "react";
import { container } from "../../di/container";
import { GetSchedulesUseCase } from "../domain/usecases/GetSchedulesUseCase";
import { CreateScheduleUseCase } from "../domain/usecases/CreateScheduleUseCase";
import { UpdateScheduleUseCase } from "../domain/usecases/UpdateScheduleUseCase";
import { DeleteScheduleUseCase } from "../domain/usecases/DeleteScheduleUseCase";
import { useAuth } from "../../app/AuthContext";
import { Schedule } from "../domain/models/Schedule";
import { ScheduleState } from "./ScheduleState";
import { ScheduleAction } from "./ScheduleAction";
import { getPairTime, isValidPairNumber, getPairTimeWithDate } from "../domain/PairSchedule";

export const useScheduleViewModel = () => {
    const [state, setState] = useState<ScheduleState>({
        schedules: [],
        isLoading: false,
        error: null,
        selectedSchedule: null,
        isCreateModalOpen: false,
        isEditModalOpen: false,
        filters: {
            groupName: "",
            teacherName: ""
        }
    });

    const { user } = useAuth();
    const isAdmin = user?.is_admin || false;

    const getSchedulesUseCase = container.resolve(GetSchedulesUseCase) as GetSchedulesUseCase;
    const createScheduleUseCase = container.resolve(CreateScheduleUseCase) as CreateScheduleUseCase;
    const updateScheduleUseCase = container.resolve(UpdateScheduleUseCase) as UpdateScheduleUseCase;
    const deleteScheduleUseCase = container.resolve(DeleteScheduleUseCase) as DeleteScheduleUseCase;

    const updateState = (updates: Partial<ScheduleState>) => {
        console.log("[ScheduleViewModel] Updating state:", updates);
        setState(prev => ({ ...prev, ...updates }));
    };

    const loadSchedules = async () => {
        console.log("[ScheduleViewModel] Loading schedules");
        updateState({ isLoading: true, error: null });
        
        try {
            const schedules = await getSchedulesUseCase.execute();
            console.log("[ScheduleViewModel] Schedules loaded:", schedules.length);
            updateState({ schedules, isLoading: false });
        } catch (error: any) {
            console.error("[ScheduleViewModel] Error loading schedules:", error);
            updateState({ error: error.message || "Ошибка загрузки расписания", isLoading: false });
        }
    };

    const createSchedule = async (scheduleData: Omit<Schedule, "id">) => {
        console.log("[ScheduleViewModel] Creating schedule:", scheduleData);
        
        if (!isValidPairNumber(scheduleData.pairNumber)) {
            updateState({ 
                isCreateModalOpen: false,
                error: "Номер пары должен быть от 1 до 7" 
            });
            return;
        }

        const scheduleDate = new Date(scheduleData.startTime);
        scheduleDate.setHours(0, 0, 0, 0);
        const scheduleDateStr = scheduleDate.toISOString().split('T')[0];

        const schedulesForSameDayAndGroup = state.schedules.filter(s => {
            const existingDate = new Date(s.startTime);
            existingDate.setHours(0, 0, 0, 0);
            const existingDateStr = existingDate.toISOString().split('T')[0];
            
            return existingDateStr === scheduleDateStr && 
                s.groupName === scheduleData.groupName;
        });

        console.log(`[ScheduleViewModel] Found ${schedulesForSameDayAndGroup.length} schedules for ${scheduleData.groupName} on ${scheduleDateStr}`);

        if (schedulesForSameDayAndGroup.length >= 4) {
            updateState({ 
                isCreateModalOpen: false,
                error: `У группы "${scheduleData.groupName}" уже ${schedulesForSameDayAndGroup.length} пары на ${scheduleDate.toLocaleDateString('ru-RU')}. Максимум - 4 пары в день.` 
            });
            return;
        }

        const hasTimeConflict = schedulesForSameDayAndGroup.some(s => {
            const newStart = scheduleData.startTime.getTime();
            const newEnd = scheduleData.endTime.getTime();
            const existingStart = s.startTime.getTime();
            const existingEnd = s.endTime.getTime();
            
            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (hasTimeConflict) {
            updateState({ 
                isCreateModalOpen: false,
                error: `У группы "${scheduleData.groupName}" уже есть занятие в это время (${scheduleData.startTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})})` 
            });
            return;
        }

        const schedulesForSameDayAndTeacher = state.schedules.filter(s => {
            const existingDate = new Date(s.startTime);
            existingDate.setHours(0, 0, 0, 0);
            const existingDateStr = existingDate.toISOString().split('T')[0];
            
            return existingDateStr === scheduleDateStr && 
                s.teacherName === scheduleData.teacherName;
        });

        const hasTeacherConflict = schedulesForSameDayAndTeacher.some(s => {
            const newStart = scheduleData.startTime.getTime();
            const newEnd = scheduleData.endTime.getTime();
            const existingStart = s.startTime.getTime();
            const existingEnd = s.endTime.getTime();
            
            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (hasTeacherConflict) {
            updateState({ 
                isCreateModalOpen: false,
                error: `У преподавателя "${scheduleData.teacherName}" уже есть занятие в это время (${scheduleData.startTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})})` 
            });
            return;
        }

        const schedulesForSameDayAndRoom = state.schedules.filter(s => {
            const existingDate = new Date(s.startTime);
            existingDate.setHours(0, 0, 0, 0);
            const existingDateStr = existingDate.toISOString().split('T')[0];
            
            return existingDateStr === scheduleDateStr && 
                s.room === scheduleData.room;
        });

        const hasRoomConflict = schedulesForSameDayAndRoom.some(s => {
            const newStart = scheduleData.startTime.getTime();
            const newEnd = scheduleData.endTime.getTime();
            const existingStart = s.startTime.getTime();
            const existingEnd = s.endTime.getTime();
            
            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (hasRoomConflict) {
            updateState({ 
                isCreateModalOpen: false,
                error: `Аудитория "${scheduleData.room}" уже занята в это время (${scheduleData.startTime.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})})` 
            });
            return;
        }

        updateState({ isLoading: true, error: null });
        
        try {
            const newSchedule = await createScheduleUseCase.execute(scheduleData);
            console.log("[ScheduleViewModel] Schedule created:", newSchedule);
            
            const updatedSchedules = [...state.schedules, newSchedule];
            updateState({ 
                schedules: updatedSchedules, 
                isLoading: false,
                isCreateModalOpen: false 
            });
        } catch (error: any) {
            console.error("[ScheduleViewModel] Error creating schedule:", error);
            
            let errorMessage = error.message;
            if (errorMessage.includes("400")) {
                errorMessage = "Некорректные данные. Проверьте все поля.";
            } else if (errorMessage.includes("conflict") || errorMessage.includes("конфликт")) {
                errorMessage = "Конфликт расписания. Преподаватель или аудитория уже заняты в это время.";
            }
            
            updateState({ 
                error: errorMessage, 
                isLoading: false,
                isCreateModalOpen: false 
            });
        }
    };

    const updateSchedule = async (id: number, scheduleData: Partial<Schedule>) => {
        console.log("[ScheduleViewModel] Updating schedule:", id, scheduleData);
        
        if (scheduleData.pairNumber && !isValidPairNumber(scheduleData.pairNumber)) {
            updateState({ error: "Номер пары должен быть от 1 до 7" });
            return;
        }

        updateState({ isLoading: true, error: null });
        
        try {
            const updatedSchedule = await updateScheduleUseCase.execute(id, scheduleData);
            console.log("[ScheduleViewModel] Schedule updated:", updatedSchedule);
            
            const updatedSchedules = state.schedules.map(schedule =>
                schedule.id === id ? updatedSchedule : schedule
            );
            updateState({ 
                schedules: updatedSchedules, 
                isLoading: false,
                isEditModalOpen: false,
                selectedSchedule: null 
            });
        } catch (error: any) {
            console.error("[ScheduleViewModel] Error updating schedule:", error);
            updateState({ error: error.message || "Ошибка обновления расписания", isLoading: false });
        }
    };

    const deleteSchedule = async (id: number) => {
        console.log("[ScheduleViewModel] Deleting schedule:", id);
        
        if (!window.confirm("Вы уверены, что хотите удалить это расписание?")) {
            return;
        }

        updateState({ isLoading: true, error: null });
        
        try {
            await deleteScheduleUseCase.execute(id);
            console.log("[ScheduleViewModel] Schedule deleted:", id);
            
            const updatedSchedules = state.schedules.filter(schedule => schedule.id !== id);
            updateState({ 
                schedules: updatedSchedules, 
                isLoading: false 
            });
        } catch (error: any) {
            console.error("[ScheduleViewModel] Error deleting schedule:", error);
            updateState({ error: error.message || "Ошибка удаления расписания", isLoading: false });
        }
    };

    const openCreateModal = () => {
        console.log("[ScheduleViewModel] Opening create modal");
        updateState({ 
            isCreateModalOpen: true,
            selectedSchedule: null 
        });
    };

    const openEditModal = (schedule: Schedule) => {
        console.log("[ScheduleViewModel] Opening edit modal for schedule:", schedule.id);
        updateState({ 
            isEditModalOpen: true,
            selectedSchedule: schedule 
        });
    };

    const closeModal = () => {
        console.log("[ScheduleViewModel] Closing modal");
        updateState({ 
            isCreateModalOpen: false,
            isEditModalOpen: false,
            selectedSchedule: null 
        });
    };

    const setGroupFilter = (groupName: string) => {
        console.log("[ScheduleViewModel] Setting group filter:", groupName);
        updateState({ 
            filters: { ...state.filters, groupName } 
        });
    };

    const setTeacherFilter = (teacherName: string) => {
        console.log("[ScheduleViewModel] Setting teacher filter:", teacherName);
        updateState({ 
            filters: { ...state.filters, teacherName } 
        });
    };

    const clearFilters = () => {
        console.log("[ScheduleViewModel] Clearing filters");
        updateState({ 
            filters: { groupName: "", teacherName: "" } 
        });
    };

    const clearError = () => {
        updateState({ error: null });
    };

    const filteredSchedules = state.schedules.filter(schedule => {
        const matchesGroup = !state.filters.groupName || 
            schedule.groupName.toLowerCase().includes(state.filters.groupName.toLowerCase());
        const matchesTeacher = !state.filters.teacherName || 
            schedule.teacherName.toLowerCase().includes(state.filters.teacherName.toLowerCase());
        return matchesGroup && matchesTeacher;
    });

    const groupedByDate = filteredSchedules.reduce((groups, schedule) => {
        const dateKey = schedule.startTime.toISOString().split('T')[0];
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(schedule);
        return groups;
    }, {} as Record<string, Schedule[]>);

    Object.keys(groupedByDate).forEach(date => {
        groupedByDate[date].sort((a, b) => a.pairNumber - b.pairNumber);
    });

    const action: ScheduleAction = {
        loadSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        openCreateModal,
        openEditModal,
        closeModal,
        setGroupFilter,
        setTeacherFilter,
        clearFilters,
        clearError
    };

    return { 
        state, 
        action, 
        isAdmin, 
        filteredSchedules, 
        groupedByDate,
        getPairTime 
    };
};
