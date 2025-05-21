import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Guardian } from '../../models/guardian.model';

@Injectable({
  providedIn: 'root'
})
export class GuardianService {
  private apiUrl = `${environment.apiUrl}/api/guardians`;

  constructor(private http: HttpClient) {}

  getGuardiansByStudent(studentId: number): Observable<Guardian[]> {
    return this.http.get<Guardian[]>(`${this.apiUrl}/student/${studentId}`);
  }

  addGuardianToStudent(studentId: number, guardian: Guardian): Observable<Guardian> {
    return this.http.post<Guardian>(`${this.apiUrl}/student/${studentId}`, guardian);
  }

  updateGuardian(id: number, guardian: Guardian): Observable<Guardian> {
    return this.http.put<Guardian>(`${this.apiUrl}/${id}`, guardian);
  }

  deleteGuardian(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getGuardian(id: number): Observable<Guardian> {
    return this.http.get<Guardian>(`${this.apiUrl}/guardian/${id}`);
  }
}
