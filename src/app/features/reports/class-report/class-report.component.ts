import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { ClassService } from '../../../core/services/class.service';
import { StudentService } from '../../../core/services/student.service';
import { AssessmentService } from '../../../core/services/assessment.service';
import { ReportService } from '../../../core/services/report.service';
import { ClassGroup } from '../../../models/class.model';
import { Student } from '../../../models/student.model';
import { Assessment } from '../../../models/assessment.model';

interface StudentReportData {
  student: Student;
  assessments: Assessment[];
  subjectAverages: { [subjectId: number]: { average: number; subjectName: string; } };
  overallAverage: number;
}

@Component({
  selector: 'app-class-report',
  standalone: false,
  templateUrl: './class-report.component.html',
  styleUrl: './class-report.component.scss'
})
export class ClassReportComponent implements OnInit {
  classGroup: ClassGroup | null = null;
  students: Student[] = [];
  studentReports: StudentReportData[] = [];
  selectedTerm: string = '1';
  selectedYear: string = new Date().getFullYear().toString();
  loading = false;
  error: string | null = null;

  terms = [
    { value: '1', label: 'Term 1' },
    { value: '2', label: 'Term 2' },
    { value: '3', label: 'Term 3' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private studentService: StudentService,
    private assessmentService: AssessmentService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const classId = +params['id'];
      if (classId) {
        this.loadClassReport(classId);
      }
    });
  }

  loadClassReport(classId: number): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      classGroup: this.classService.getClassGroupById(classId),
      students: this.classService.getStudentsInClass(classId)
    }).subscribe({
      next: (data) => {
        this.classGroup = data.classGroup;
        this.students = data.students;
        this.loadStudentReports();
      },
      error: (error) => {
        this.error = 'Failed to load class information';
        this.loading = false;
        console.error('Error loading class:', error);
      }
    });
  }

  loadStudentReports(): void {
    if (this.students.length === 0) {
      this.loading = false;
      return;
    }

    const reportObservables: Observable<StudentReportData>[] = this.students.map(student => 
      new Observable<StudentReportData>(observer => {
        this.assessmentService.getStudentTermAssessments(
          student.id, 
          this.selectedTerm, 
          this.selectedYear
        ).subscribe({
          next: (assessments: Assessment[]) => {
            const reportData = this.processStudentAssessments(student, assessments);
            observer.next(reportData);
            observer.complete();
          },
          error: (error) => {
            console.error(`Error loading assessments for student ${student.id}:`, error);
            observer.next({
              student,
              assessments: [],
              subjectAverages: {},
              overallAverage: 0
            });
            observer.complete();
          }
        });
      })
    );

    forkJoin(reportObservables).subscribe({
      next: (reports) => {
        this.studentReports = reports.sort((a, b) => 
          a.student.lastName.localeCompare(b.student.lastName)
        );
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load student reports';
        this.loading = false;
        console.error('Error loading student reports:', error);
      }
    });
  }

  private processStudentAssessments(student: Student, assessments: Assessment[]): StudentReportData {
    const subjectAverages: { [subjectId: number]: { average: number; subjectName: string; } } = {};
    const subjectGroups: { [subjectId: number]: Assessment[] } = {};

    assessments.forEach(assessment => {
      const subjectId = assessment.studentSubject.subject.id;
      if (!subjectGroups[subjectId]) subjectGroups[subjectId] = [];
      subjectGroups[subjectId].push(assessment);
    });

    Object.keys(subjectGroups).forEach(subjectIdStr => {
      const subjectId = +subjectIdStr;
      const subjectAssessments = subjectGroups[subjectId];
      const subjectName = subjectAssessments[0].studentSubject.subject.name;

      const totalScore = subjectAssessments.reduce((sum, a) =>
        sum + (a.score / a.maxScore) * 100, 0);

      subjectAverages[subjectId] = {
        average: totalScore / subjectAssessments.length,
        subjectName
      };
    });

    const averages = Object.values(subjectAverages).map(s => s.average);
    const overallAverage = averages.length ? 
      averages.reduce((sum, avg) => sum + avg, 0) / averages.length : 0;

    return {
      student,
      assessments,
      subjectAverages,
      overallAverage
    };
  }

  onTermChange(): void {
    if (this.classGroup) this.loadStudentReports();
  }

  onYearChange(): void {
    if (this.classGroup) this.loadStudentReports();
  }

  getClassAverage(): number {
    if (this.studentReports.length === 0) return 0;
    const total = this.studentReports.reduce((sum, s) => sum + s.overallAverage, 0);
    return total / this.studentReports.length;
  }

  getTopPerformers(): StudentReportData[] {
    return this.studentReports.filter(r => r.overallAverage >= 80);
  }

  getAtRiskStudents(): StudentReportData[] {
    return this.studentReports.filter(r => r.overallAverage < 50);
  }

  getSortedStudentReports(): StudentReportData[] {
    return [...this.studentReports].sort((a, b) => b.overallAverage - a.overallAverage);
  }

  getSubjectAveragesArray(report: StudentReportData): { subjectName: string; average: number }[] {
    return Object.values(report.subjectAverages);
  }

  getGrade(percentage: number): string {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  }

  getGradeClass(percentage: number): string {
    if (percentage >= 80) return 'grade-a';
    if (percentage >= 70) return 'grade-b';
    if (percentage >= 60) return 'grade-c';
    if (percentage >= 50) return 'grade-d';
    if (percentage >= 40) return 'grade-e';
    return 'grade-f';
  }

  getSubjectCount(report: StudentReportData): number {
    return Object.keys(report.subjectAverages).length;
  }

  exportToPDF(): void {
    console.log('Exporting to PDF...');
    // PDF export logic
  }

  exportToExcel(): void {
    console.log('Exporting to Excel...');
    // Excel export logic
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }

  viewStudentReport(studentId: number): void {
    this.router.navigate(['/reports/student', studentId]);
  }
}