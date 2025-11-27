export interface Schedule {
  id: number;
  groupName: string;
  teacherName: string;
  startTime: Date;
  endTime: Date;
  subject: string;
  room: string;
  pairNumber: number;
}
