import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassGroup } from '../../models/class.model';
import { Teacher, TeacherRegistration, TeacherSubjectClass } from '../../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/api/teachers`;

  constructor(private http: HttpClient) {}

  getAllTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.apiUrl}/all`);
  }

  getTeacherById(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`);
  }

  createTeacher(teacher: TeacherRegistration): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.apiUrl}`, teacher);
  }

  updateTeacher(id: number, teacher: Partial<Teacher>): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/${id}`, teacher);
  }

  deleteTeacher(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCurrentTeacher(): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/current`);
  }

  getAssignedSubjectsAndClasses(): Observable<TeacherSubjectClass[]> {
    return this.http.get<TeacherSubjectClass[]>(`${this.apiUrl}/subjects/assigned`);
  }

  getSupervisedClasses(): Observable<ClassGroup[]> {
    return this.http.get<ClassGroup[]>(`${this.apiUrl}/class-teacher-assignments`);
  }
}
