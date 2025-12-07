import React, { useState, useEffect } from "react";
import { Schedule } from "../../../../schedule/domain/models/Schedule";
import { PAIR_SCHEDULE } from "../../../../schedule/domain/PairSchedule";
import "./ScheduleModal.css";

interface ScheduleModalProps {
    mode: "create" | "edit";
    schedule?: Schedule;
    onClose: () => void;
    onSubmit: (data: Omit<Schedule, "id">) => Promise<void> | void;
    getPairTime: (pairNumber: number) => { start: string; end: string };
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
    mode,
    schedule,
    onClose,
    onSubmit,
    getPairTime
}) => {
    const formatDateForInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const parseDateFromInput = (dateString: string): Date => {
        if (dateString.includes('.')) {
            const [day, month, year] = dateString.split('.');
            return new Date(`${year}-${month}-${day}`);
        }
        return new Date(dateString);
    };

    const getDefaultDate = (): string => {
        const today = new Date();
        if (mode === 'edit' && schedule) {
            return formatDateForInput(schedule.startTime);
        }
        return formatDateForInput(today);
    };

    const [formData, setFormData] = useState({
        groupName: "",
        teacherName: "",
        subject: "",
        room: "",
        pairNumber: 1,
        date: getDefaultDate()
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        if (mode === "edit" && schedule) {
            setFormData({
                groupName: schedule.groupName,
                teacherName: schedule.teacherName,
                subject: schedule.subject,
                room: schedule.room,
                pairNumber: schedule.pairNumber,
                date: formatDateForInput(schedule.startTime)
            });
        }
    }, [mode, schedule]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.groupName.trim()) {
            newErrors.groupName = "Название группы обязательно";
        }
        if (!formData.teacherName.trim()) {
            newErrors.teacherName = "ФИО преподавателя обязательно";
        }
        if (!formData.subject.trim()) {
            newErrors.subject = "Название предмета обязательно";
        }
        if (!formData.room.trim()) {
            newErrors.room = "Номер кабинета обязателен";
        }
        if (formData.pairNumber < 1 || formData.pairNumber > 7) {
            newErrors.pairNumber = "Номер пары должен быть от 1 до 7";
        }
        if (!formData.date) {
            newErrors.date = "Дата обязательна";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            console.log("[ScheduleModal] Form validation failed:", errors);
            return;
        }

        console.log("[ScheduleModal] Submitting form:", formData);
        
        const pairTime = getPairTime(formData.pairNumber);
        
        const selectedDate = parseDateFromInput(formData.date);
        const [startHours, startMinutes] = pairTime.start.split(":").map(Number);
        const [endHours, endMinutes] = pairTime.end.split(":").map(Number);
        
        const startTime = new Date(selectedDate);
        startTime.setHours(startHours, startMinutes, 0, 0);
        
        const endTime = new Date(selectedDate);
        endTime.setHours(endHours, endMinutes, 0, 0);

        const scheduleData: Omit<Schedule, "id"> = {
            groupName: formData.groupName,
            teacherName: formData.teacherName,
            subject: formData.subject,
            room: formData.room,
            pairNumber: formData.pairNumber,
            startTime: startTime,
            endTime: endTime
        };

        console.log("[ScheduleModal] Full schedule data:", {
            ...scheduleData,
            date: selectedDate.toISOString(),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        });
        
        try {
            setServerError(null);
            await onSubmit(scheduleData);
        } catch (error: any) {
            console.error("[ScheduleModal] Error in onSubmit:", error);
            setServerError(error.message || "Произошла ошибка при создании расписания");
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="schedule-modal">
                <div className="modal-header">
                    <h2>{mode === "create" ? "Добавить занятие" : "Редактировать занятие"}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Дата проведения *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className={errors.date ? "error" : ""}
                                min={formatDateForInput(new Date())}
                                required
                            />
                            {errors.date && <span className="error-text">{errors.date}</span>}
                        </div>
                        <div className="form-group">
                            <label>Кабинет *</label>
                            <input
                                type="text"
                                value={formData.room}
                                onChange={(e) => handleInputChange('room', e.target.value)}
                                className={errors.room ? "error" : ""}
                                placeholder="Например: 101, 201-А"
                                required
                            />
                            {errors.room && <span className="error-text">{errors.room}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Группа *</label>
                            <input
                                type="text"
                                value={formData.groupName}
                                onChange={(e) => handleInputChange('groupName', e.target.value)}
                                className={errors.groupName ? "error" : ""}
                                placeholder="Например: ИТ-201"
                                required
                            />
                            {errors.groupName && <span className="error-text">{errors.groupName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Преподаватель *</label>
                            <input
                                type="text"
                                value={formData.teacherName}
                                onChange={(e) => handleInputChange('teacherName', e.target.value)}
                                className={errors.teacherName ? "error" : ""}
                                placeholder="Например: Иванов И.И."
                                required
                            />
                            {errors.teacherName && <span className="error-text">{errors.teacherName}</span>}
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label>Предмет *</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            className={errors.subject ? "error" : ""}
                            placeholder="Например: Математический анализ"
                            required
                        />
                        {errors.subject && <span className="error-text">{errors.subject}</span>}
                    </div>

                    <div className="pair-selection-section">
                        <div className="section-header">
                            <h3>Выберите пару *</h3>
                            {errors.pairNumber && <span className="error-text">{errors.pairNumber}</span>}
                        </div>
                        
                        <div className="pair-options">
                            {Object.entries(PAIR_SCHEDULE).map(([pairNum, time]) => (
                                <button
                                    key={pairNum}
                                    type="button"
                                    className={`pair-option ${formData.pairNumber === parseInt(pairNum) ? "selected" : ""}`}
                                    onClick={() => handleInputChange('pairNumber', parseInt(pairNum))}
                                >
                                    <span className="pair-number">Пара {pairNum}</span>
                                    <span className="pair-time">{time.start} - {time.end}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pair-preview">
                        <p><strong>Выбрано:</strong> Пара {formData.pairNumber} - {getPairTime(formData.pairNumber).start} - {getPairTime(formData.pairNumber).end}</p>
                        <p><strong>Дата:</strong> {new Date(formData.date).toLocaleDateString('ru-RU', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>

                    {serverError && (
                        <div className="modal-error-message">
                            {serverError}
                            <button 
                                onClick={() => setServerError(null)} 
                                className="modal-error-close"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="submit-button">
                            {mode === "create" ? "Создать" : "Сохранить изменения"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
