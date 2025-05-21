import { Guardian } from "./guardian.model";

export enum StudentLevel {
  OLEVEL = 'O-LEVEL',
  ALEVEL = 'A-LEVEL'
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  studentId: string;
  form: string;
  section: string;
  level: StudentLevel;
}

export interface StudentRegistration {
  firstName: string;
  lastName: string;
  studentId: string;
  form: string;
  section: string;
  level: string;
  subjectIds?: number[];
}

export interface StudentUpdate {
  firstName: string;
  lastName: string;
  form: string;
  section: string;
  level: string;
}

export interface PromotionToALevel {
  studentIds: number[];
  subjectIds: number[];
  form: string;
  section: string;
}

export interface StudentWithGuardians {
  id: number;
  firstName: string;
  lastName: string;
  studentId: string;
  form: string;
  section: string;
  level: string;
  guardians: Guardian[];
}