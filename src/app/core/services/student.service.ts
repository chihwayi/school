import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Student, StudentRegistration, StudentUpdate, PromotionToALevel } from '../../models/student.model';
import { Subject } from '../../models/subject.model';
import { StudentSubject } from '../../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/api/students`;

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/all`);
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`);
  }

  createStudent(student: StudentRegistration): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/create`, student);
  }

  updateStudent(id: number, student: StudentUpdate): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStudentsByClass(form: string, section: string): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/form/${form}/section/${section}`);
  }

  assignSubjectToStudent(studentId: number, subjectId: number): Observable<StudentSubject> {
    return this.http.post<StudentSubject>(`${this.apiUrl}/${studentId}/assign-subject/${subjectId}`, {});
  }

  removeSubjectFromStudent(studentId: number, subjectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${studentId}/remove-subject/${subjectId}`);
  }

  getStudentSubjects(studentId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/${studentId}/subjects`);
  }

  advanceStudentsToNextForm(studentIds: number[]): Observable<Student[]> {
    return this.http.post<Student[]>(`${this.apiUrl}/batch/advance-form`, studentIds);
  }

  promoteStudentsToALevel(promotionData: PromotionToALevel): Observable<Student[]> {
    return this.http.post<Student[]>(`${this.apiUrl}/batch/promote-to-a-level`, promotionData);
  }
}
