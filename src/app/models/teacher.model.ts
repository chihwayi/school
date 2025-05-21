import { Subject } from "./subject.model";

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface TeacherRegistration {
  firstName: string;
  lastName: string;
  employeeId: string;
  username: string;
  email: string;
  password: string;
}

export interface TeacherAssignment {
  teacherId: number;
  subjectId: number;
  form: string;
  section: string;
  academicYear: string;
}

export interface TeacherSubjectClass {
  id: number;
  teacher: Teacher;
  subject: Subject;
  form: string;
  section: string;
  academicYear: string;
}