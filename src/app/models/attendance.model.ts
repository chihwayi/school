import { Student } from "./student.model";

export interface Attendance {
  id: number;
  student: Student;
  date: string; // ISO date string
  present: boolean;
}