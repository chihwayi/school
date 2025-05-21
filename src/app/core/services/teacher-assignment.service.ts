import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TeacherAssignment, TeacherSubjectClass } from '../../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherAssignmentService {
  private apiUrl = `${environment.apiUrl}/api/teacher-assignments`;

  constructor(private http: HttpClient) {}

  assignTeacherToSubjectAndClass(assignment: TeacherAssignment): Observable<TeacherSubjectClass> {
    return this.http.post<TeacherSubjectClass>(`${this.apiUrl}`, assignment);
  }

  removeTeacherAssignment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTeacherAssignments(teacherId: number): Observable<TeacherSubjectClass[]> {
    return this.http.get<TeacherSubjectClass[]>(`${this.apiUrl}/teacher/${teacherId}`);
  }

  getAssignmentForClass(subjectId: number, form: string, section: string, year: string): Observable<TeacherSubjectClass> {
    return this.http.get<TeacherSubjectClass>(
      `${this.apiUrl}/subject/${subjectId}/form/${form}/section/${section}/year/${year}`
    );
  }
}
