import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { environment } from '../../../environments/environment';
import { Subject, SubjectCategory } from '../../models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.apiUrl}/api/subjects`;

  constructor(private http: HttpClient) {}

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/all`);
  }

  getSubjectsByCategory(category: SubjectCategory): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/category/${category}`);
  }

  getSubjectsByLevel(level: string): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/level/${level}`);
  }

  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}`, subject);
  }

  updateSubject(id: number, subject: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${id}`, subject);
  }

  deleteSubject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSubjectById(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/${id}`);
  }
}
