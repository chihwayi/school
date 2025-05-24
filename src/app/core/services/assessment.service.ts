import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssessmentDTO, Assessment, AssessmentUpdate } from '../../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private apiUrl = `${environment.apiUrl}/api/assessments`;

  constructor(private http: HttpClient) {}

  recordAssessment(assessment: AssessmentDTO): Observable<Assessment> {
    return this.http.post<Assessment>(`${this.apiUrl}`, assessment);
  }

  getStudentSubjectAssessments(studentId: number, subjectId: number): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.apiUrl}/student/${studentId}/subject/${subjectId}`);
  }

  getStudentTermAssessments(studentId: number, term: string, year: string): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.apiUrl}/student/${studentId}/term/${term}/year/${year}`);
  }

  updateAssessment(id: number, assessment: AssessmentUpdate): Observable<Assessment> {
    return this.http.put<Assessment>(`${this.apiUrl}/${id}`, assessment);
  }

  deleteAssessment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAssessmentById(id: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.apiUrl}/${id}`);
  }
}
