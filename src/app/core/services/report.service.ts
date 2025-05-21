import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Assessment } from '../../models/assessment.model';
import { OverallComment } from '../../models/report.model';
import { SubjectComment } from '../../models/subject.model';
import { AssessmentService } from './assessment.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/api/reports`;

  constructor(
    private http: HttpClient,
    private assessmentService: AssessmentService
  ) {}

  // We'll leverage the assessment service to get assessment data
  getStudentTermReport(studentId: number, term: string, year: string): Observable<Assessment[]> {
    return this.assessmentService.getStudentTermAssessments(studentId, term, year);
  }

  // These endpoints would need to be added to the backend
  addSubjectComment(studentId: number, term: string, year: string, comment: SubjectComment): Observable<SubjectComment> {
    return this.http.post<SubjectComment>(
      `${this.apiUrl}/student/${studentId}/term/${term}/year/${year}/subject-comment`,
      comment
    );
  }

  addOverallComment(studentId: number, term: string, year: string, comment: OverallComment): Observable<OverallComment> {
    return this.http.post<OverallComment>(
      `${this.apiUrl}/student/${studentId}/term/${term}/year/${year}/overall-comment`,
      comment
    );
  }

  // Method to generate and download PDF report (this would be implemented differently depending on your backend)
  generateReportPDF(studentId: number, term: string, year: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/generate-pdf/student/${studentId}/term/${term}/year/${year}`,
      { responseType: 'blob' }
    );
  }
}
