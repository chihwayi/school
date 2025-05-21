import { Teacher } from "./teacher.model";

export interface ClassGroup {
  id: number;
  form: string;
  section: string;
  academicYear: string;
  classTeacher?: Teacher;
}