import React, { useEffect } from "react";
import { useScheduleViewModel } from "./ScheduleViewModel";
import { ScheduleCard } from "../../common/presentation/schedule/card/ScheduleCard";
import { ScheduleModal } from "../../common/presentation/schedule/modal/ScheduleModal";
import "./SchedulePage.css";

export const SchedulePage: React.FC = () => {
    const {
        state,
        action,
        isAdmin,
        groupedByDate,
        getPairTime
    } = useScheduleViewModel();

    useEffect(() => {
        console.log("[SchedulePage] Component mounted, loading schedules");
        action.loadSchedules();
    }, []);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("[SchedulePage] Applying filters");
        action.loadSchedules();
    };

    return (
        <div className="schedule-container">
            <div className="schedule-header">
                <h2>Расписание занятий</h2>
                {isAdmin && (
                    <button 
                        className="add-schedule-button"
                        onClick={action.openCreateModal}
                    >
                        + Добавить занятие
                    </button>
                )}
            </div>

            <div className="filters-section">
                <form className="filters-form" onSubmit={handleFilterSubmit}>
                    <div className="filter-group">
                        <label>Фильтр по группе:</label>
                        <input
                            type="text"
                            value={state.filters.groupName}
                            onChange={(e) => action.setGroupFilter(e.target.value)}
                            placeholder="Введите название группы"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Фильтр по преподавателю:</label>
                        <input
                            type="text"
                            value={state.filters.teacherName}
                            onChange={(e) => action.setTeacherFilter(e.target.value)}
                            placeholder="Введите ФИО преподавателя"
                        />
                    </div>
                    <div className="filter-buttons">
                        <button type="submit" className="apply-filter-button">
                            Применить фильтры
                        </button>
                        <button 
                            type="button" 
                            className="clear-filter-button"
                            onClick={action.clearFilters}
                        >
                            Очистить фильтры
                        </button>
                    </div>
                </form>
            </div>

            {state.isLoading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Загрузка расписания...</p>
                </div>
            )}

            {state.error && (
                <div className="error-container">
                    <div className="error-message">
                        {state.error}
                        <button onClick={action.clearError} className="error-close">×</button>
                    </div>
                </div>
            )}

            <div className="schedule-cards-container">
                {Object.keys(groupedByDate).length === 0 && !state.isLoading ? (
                    <div className="no-schedules">
                        <p>Нет данных для отображения</p>
                    </div>
                ) : (
                    Object.entries(groupedByDate).map(([date, schedules]) => (
                        <ScheduleCard
                            key={date}
                            date={date}
                            schedules={schedules}
                            isAdmin={isAdmin}
                            onEdit={action.openEditModal}
                            onDelete={action.deleteSchedule}
                            getPairTime={getPairTime}
                        />
                    ))
                )}
            </div>

            {state.isCreateModalOpen && (
                <ScheduleModal
                    mode="create"
                    onClose={action.closeModal}
                    onSubmit={action.createSchedule}
                    getPairTime={getPairTime}
                />
            )}
            {state.isEditModalOpen && state.selectedSchedule && (
                <ScheduleModal
                    mode="edit"
                    schedule={state.selectedSchedule}
                    onClose={action.closeModal}
                    onSubmit={(data) => action.updateSchedule(state.selectedSchedule!.id, data)}
                    getPairTime={getPairTime}
                />
            )}
        </div>
    );
};
