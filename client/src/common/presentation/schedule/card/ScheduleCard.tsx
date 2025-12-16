import React from "react";
import type { Schedule } from "../../../../schedule/domain/models/Schedule";
import "./ScheduleCard.css";

interface ScheduleCardProps {
    date: string;
    schedules: Schedule[];
    isAdmin: boolean;
    onEdit: (schedule: Schedule) => void;
    onDelete: (id: number) => void;
    getPairTime: (pairNumber: number) => { start: string; end: string };
}

const formatDateTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
    date,
    schedules,
    isAdmin,
    onEdit,
    onDelete,
    getPairTime
}) => {
    const formatDate = (dateStr: string) => {
        const dateObj = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return dateObj.toLocaleDateString('ru-RU', options);
    };

    return (
        <div className="schedule-card">
            <div className="card-header">
                <h3 className="card-date">{formatDate(date)}</h3>
                <div className="card-count">
                    {schedules.length} {schedules.length === 1 ? 'занятие' : 
                        schedules.length > 1 && schedules.length < 5 ? 'занятия' : 'занятий'}
                </div>
            </div>
            
            <div className="card-content">
                {schedules.map((schedule) => {
                    return (
                        <div key={schedule.id} className="pair-item">
                            <div className="pair-time">
                                <span className="pair-number">Пара {schedule.pairNumber}</span>
                                <span className="time-range">
                                    {formatDateTime(schedule.startTime)} - {formatDateTime(schedule.endTime)}
                                </span>
                            </div>
                            
                            <div className="pair-details">
                                <div className="detail-row">
                                    <span className="detail-label">Группа:</span>
                                    <span className="detail-value">{schedule.groupName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Предмет:</span>
                                    <span className="detail-value">{schedule.subject}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Преподаватель:</span>
                                    <span className="detail-value">{schedule.teacherName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Кабинет:</span>
                                    <span className="detail-value">{schedule.room}</span>
                                </div>
                            </div>
                            
                            {isAdmin && (
                                <div className="pair-actions">
                                    <button 
                                        className="edit-button"
                                        onClick={() => onEdit(schedule)}
                                    >
                                        Редактировать
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={() => onDelete(schedule.id)}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
