import { Student } from "./student.model";
import { Subject } from "./subject.model";

export enum AssessmentType {
  EXAM = 'EXAM',
  TEST = 'TEST',
  CLASSWORK = 'CLASSWORK',
  HOMEWORK = 'HOMEWORK',
  PROJECT = 'PROJECT',
  OTHER = 'OTHER'
}

export interface Assessment {
  id: number;
  title: string;
  date: string; // ISO date string
  score: number;
  maxScore: number;
  type: AssessmentType;
  term: string;
  academicYear: string;
  studentSubject: {
    id: number;
    student: Student;
    subject: Subject;
  };
}

export interface AssessmentDTO {
  studentSubjectId: number;
  title: string;
  date: string; // ISO date string
  score: number;
  maxScore: number;
  type: AssessmentType;
  term: string;
  academicYear: string;
}

export interface AssessmentUpdate {
  title?: string;
  date?: string; // ISO date string
  score?: number;
  maxScore?: number;
}