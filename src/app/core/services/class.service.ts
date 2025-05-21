import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClassGroup } from '../../models/class.model';
import { Student } from '../../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private apiUrl = `${environment.apiUrl}/api/classes`;

  constructor(private http: HttpClient) {}

  getAllClassGroups(): Observable<ClassGroup[]> {
    return this.http.get<ClassGroup[]>(`${this.apiUrl}/all`);
  }

  getClassGroupById(id: number): Observable<ClassGroup> {
    return this.http.get<ClassGroup>(`${this.apiUrl}/${id}`);
  }

  createClassGroup(classGroup: ClassGroup): Observable<ClassGroup> {
    return this.http.post<ClassGroup>(`${this.apiUrl}`, classGroup);
  }

  updateClassGroup(id: number, classGroup: ClassGroup): Observable<ClassGroup> {
    return this.http.put<ClassGroup>(`${this.apiUrl}/${id}`, classGroup);
  }

  deleteClassGroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getClassGroupByDetails(form: string, section: string, year: string): Observable<ClassGroup> {
    return this.http.get<ClassGroup>(`${this.apiUrl}/form/${form}/section/${section}/year/${year}`);
  }

  getStudentsInClass(classGroupId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/${classGroupId}/students`);
  }

  assignClassTeacher(classGroupId: number, teacherId: number): Observable<ClassGroup> {
    return this.http.post<ClassGroup>(`${this.apiUrl}/${classGroupId}/assign-teacher/${teacherId}`, {});
  }
}
