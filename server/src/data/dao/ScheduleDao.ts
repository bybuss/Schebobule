import { singleton } from "tsyringe";
import type { Schedule } from "../../domain/models/Schedule.ts";
import { Pool } from "pg";

@singleton()
export class ScheduleDao {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(schedule: Omit<Schedule, "id">): Promise<Schedule> {
        const result = await this.pool.query(
            `INSERT INTO schedules (group_name, teacher_name, start_time, end_time, subject, room) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [schedule.groupName, schedule.teacherName, schedule.startTime, schedule.endTime, schedule.subject, schedule.room]
        );
        return this.mapToSchedule(result.rows[0]);
    }

    async update(id: number, schedule: Partial<Schedule>): Promise<Schedule | null> {
        const fields = [];
        const values = [];
        let paramCount = 1;

        if (schedule.groupName !== undefined) {
            fields.push(`group_name = $${paramCount++}`);
            values.push(schedule.groupName);
        }
        if (schedule.teacherName !== undefined) {
            fields.push(`teacher_name = $${paramCount++}`);
            values.push(schedule.teacherName);
        }
        if (schedule.startTime !== undefined) {
            fields.push(`start_time = $${paramCount++}`);
            values.push(schedule.startTime);
        }
        if (schedule.endTime !== undefined) {
            fields.push(`end_time = $${paramCount++}`);
            values.push(schedule.endTime);
        }
        if (schedule.subject !== undefined) {
            fields.push(`subject = $${paramCount++}`);
            values.push(schedule.subject);
        }
        if (schedule.room !== undefined) {
            fields.push(`room = $${paramCount++}`);
            values.push(schedule.room);
        }

        if (fields.length === 0) return null;

        values.push(id);
        const result = await this.pool.query(
            `UPDATE schedules SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
            values
        );
        return result.rows.length > 0 ? this.mapToSchedule(result.rows[0]) : null;
    }

    async delete(id: number): Promise<boolean> {
        const result = await this.pool.query("DELETE FROM schedules WHERE id = $1", [id]);
        return (result.rowCount || 0) > 0;
    }

    async getById(id: number): Promise<Schedule | null> {
        const result = await this.pool.query("SELECT * FROM schedules WHERE id = $1", [id]);
        return result.rows.length > 0 ? this.mapToSchedule(result.rows[0]) : null;
    }

    async getByGroup(groupName: string): Promise<Schedule[]> {
        const result = await this.pool.query("SELECT * FROM schedules WHERE group_name = $1 ORDER BY start_time", [groupName]);
        return result.rows.map(row => this.mapToSchedule(row));
    }

    async getByTeacher(teacherName: string): Promise<Schedule[]> {
        const result = await this.pool.query("SELECT * FROM schedules WHERE teacher_name = $1 ORDER BY start_time", [teacherName]);
        return result.rows.map(row => this.mapToSchedule(row));
    }

    async getByDateRange(startDate: Date, endDate: Date): Promise<Schedule[]> {
        const result = await this.pool.query(
            "SELECT * FROM schedules WHERE start_time >= $1 AND end_time <= $2 ORDER BY start_time", 
            [startDate, endDate]
        );
        return result.rows.map(row => this.mapToSchedule(row));
    }

    async getByGroupAndDate(groupName: string, date: Date): Promise<Schedule[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await this.pool.query(
            "SELECT * FROM schedules WHERE group_name = $1 AND start_time >= $2 AND end_time <= $3 ORDER BY start_time",
            [groupName, startOfDay, endOfDay]
        );
        return result.rows.map(row => this.mapToSchedule(row));
    }

    async getAll(): Promise<Schedule[]> {
        const result = await this.pool.query("SELECT * FROM schedules ORDER BY start_time");
        return result.rows.map(row => this.mapToSchedule(row));
    }

    async getGroupedByTimeSlot(): Promise<{timeSlot: string, schedules: Schedule[]}[]> {
        const result = await this.pool.query(`
            SELECT 
                CONCAT(EXTRACT(HOUR FROM start_time), ':', EXTRACT(MINUTE FROM start_time), '-', 
                       EXTRACT(HOUR FROM end_time), ':', EXTRACT(MINUTE FROM end_time)) as time_slot,
                COUNT(*) as count
            FROM schedules 
            GROUP BY time_slot 
            ORDER BY time_slot
        `);
        
        const timeSlots = result.rows.map(row => row.time_slot);
        const grouped: {timeSlot: string, schedules: Schedule[]}[] = [];

        for (const timeSlot of timeSlots) {
            const schedulesResult = await this.pool.query(`
                SELECT * FROM schedules 
                WHERE CONCAT(EXTRACT(HOUR FROM start_time), ':', EXTRACT(MINUTE FROM start_time), '-', 
                            EXTRACT(HOUR FROM end_time), ':', EXTRACT(MINUTE FROM end_time)) = $1
                ORDER BY group_name, start_time
            `, [timeSlot]);
            
            grouped.push({
                timeSlot,
                schedules: schedulesResult.rows.map(row => this.mapToSchedule(row))
            });
        }

        return grouped;
    }

    private mapToSchedule(row: any): Schedule {
        return {
            id: row.id,
            groupName: row.group_name,
            teacherName: row.teacher_name,
            startTime: new Date(row.start_time),
            endTime: new Date(row.end_time),
            subject: row.subject,
            room: row.room
        };
    }
}
