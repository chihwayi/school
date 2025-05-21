import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attendance } from '../../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/api/attendance`;

  constructor(private http: HttpClient) {}

  markAttendance(studentId: number, date: string, present: boolean): Observable<Attendance> {
    const params = new HttpParams()
      .set('studentId', studentId.toString())
      .set('date', date)
      .set('present', present.toString());
    
    return this.http.post<Attendance>(`${this.apiUrl}`, null, { params });
  }

  getAttendanceByStudent(studentId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getAttendanceByDate(date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/date/${date}`);
  }
}
