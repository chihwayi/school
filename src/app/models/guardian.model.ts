import { Student } from "./student.model";

export interface Guardian {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  whatsappNumber?: string;
  primaryGuardian: boolean;
  student?: Student;
}