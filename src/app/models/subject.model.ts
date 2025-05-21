import { Student } from "./student.model";

export enum SubjectCategory {
  SCIENCES = 'SCIENCES',
  HUMANITIES = 'HUMANITIES',
  LANGUAGES = 'LANGUAGES',
  MATHEMATICS = 'MATHEMATICS',
  TECHNICAL = 'TECHNICAL',
  ARTS = 'ARTS',
  OTHER = 'OTHER'
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  level: string;
  category: SubjectCategory;
  description?: string;
}

export interface StudentSubject {
  id: number;
  student: Student;
  subject: Subject;
}

export interface SubjectComment {
  subjectId: number;
  comment: string;
}