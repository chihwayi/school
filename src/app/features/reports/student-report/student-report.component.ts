import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReportService } from '../../../core/services/report.service';
import { StudentService } from '../../../core/services/student.service';
import { Assessment } from '../../../models/assessment.model';
import { Student } from '../../../models/student.model';
import { Subject } from '../../../models/subject.model';

interface SubjectReport {
  subject: Subject;
  assessments: Assessment[];
  courseworkAverage: number;
  examScore: number;
  totalScore: number;
  grade: string;
  comment?: string;
}

@Component({
  selector: 'app-student-report',
  standalone: false,
  templateUrl: './student-report.component.html',
  styleUrl: './student-report.component.scss'
})
export class StudentReportComponent implements OnInit {
  student: Student | null = null;
  assessments: Assessment[] = [];
  subjectReports: SubjectReport[] = [];
  overallComment = '';
  
  loading = true;
  error: string | null = null;
  
  term = 'Term 1';
  academicYear = '2024';
  
  // Teacher comment editing
  editingComments = false;
  subjectComments: { [subjectId: number]: string } = {};
  tempOverallComment = '';
  editingOverallComment = ''; // Added this property
  
  // Available terms for selection
  availableTerms = ['Term 1', 'Term 2', 'Term 3']; // Added this property
  
  // Permissions
  canEditComments = false;
  canViewReport = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private assessmentService: AssessmentService,
    private reportService: ReportService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadRouteParams();
    this.loadStudentReport();
  }

  private checkPermissions(): void {
    const user = this.authService.getCurrentUser();
    const roles = user?.roles || [];
    
    this.canViewReport = roles.some((role: string) => 
      ['ADMIN', 'CLERK', 'TEACHER', 'CLASS_TEACHER'].includes(role)
    );
    
    this.canEditComments = roles.some((role: string) => 
      ['ADMIN', 'TEACHER', 'CLASS_TEACHER'].includes(role)
    );
  }

  private loadRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      this.term = params['term'] || 'Term 1';
      this.academicYear = params['year'] || '2024';
    });
  }

  private loadStudentReport(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (!studentId) {
      this.error = 'Student ID not found';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    // Load student details and assessments
    Promise.all([
      this.studentService.getStudentById(parseInt(studentId)).toPromise(),
      this.assessmentService.getStudentTermAssessments(parseInt(studentId), this.term, this.academicYear).toPromise()
    ]).then(([student, assessments]) => {
      this.student = student!;
      this.assessments = assessments || [];
      this.processReportData();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading student report:', error);
      this.error = 'Failed to load student report';
      this.loading = false;
    });
  }

  private processReportData(): void {
    if (!this.assessments.length) {
      this.subjectReports = [];
      return;
    }

    // Group assessments by subject
    const subjectMap = new Map<number, Assessment[]>();
    
    this.assessments.forEach(assessment => {
      const subjectId = assessment.studentSubject.subject.id;
      if (!subjectMap.has(subjectId)) {
        subjectMap.set(subjectId, []);
      }
      subjectMap.get(subjectId)!.push(assessment);
    });

    // Create subject reports
    this.subjectReports = Array.from(subjectMap.entries()).map(([subjectId, assessments]) => {
      const subject = assessments[0].studentSubject.subject;
      
      // Separate coursework and exams
      const coursework = assessments.filter(a => 
        ['TEST', 'CLASSWORK', 'HOMEWORK', 'PROJECT'].includes(a.type)
      );
      const exams = assessments.filter(a => a.type === 'EXAM');
      
      // Calculate averages
      const courseworkAverage = this.calculateAverage(coursework);
      const examScore = exams.length > 0 ? 
        exams.reduce((sum, exam) => sum + (exam.score / exam.maxScore * 100), 0) / exams.length : 0;
      
      // Total score (weighted: 40% coursework, 60% exam)
      const totalScore = (courseworkAverage * 0.4) + (examScore * 0.6);
      
      return {
        subject,
        assessments,
        courseworkAverage,
        examScore,
        totalScore,
        grade: this.calculateGrade(totalScore),
        comment: this.subjectComments[subjectId] || ''
      };
    }).sort((a, b) => a.subject.name.localeCompare(b.subject.name));
  }

  private calculateAverage(assessments: Assessment[]): number {
    if (assessments.length === 0) return 0;
    
    const totalPercentage = assessments.reduce((sum, assessment) => {
      return sum + (assessment.score / assessment.maxScore * 100);
    }, 0);
    
    return totalPercentage / assessments.length;
  }

  private calculateGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    if (percentage >= 50) return 'E';
    return 'U';
  }

  getOverallGrade(): string {
    if (this.subjectReports.length === 0) return 'N/A';
    
    const totalScore = this.subjectReports.reduce((sum, report) => sum + report.totalScore, 0);
    const averageScore = totalScore / this.subjectReports.length;
    
    return this.calculateGrade(averageScore);
  }

  getOverallPercentage(): number {
    if (this.subjectReports.length === 0) return 0;
    
    const totalScore = this.subjectReports.reduce((sum, report) => sum + report.totalScore, 0);
    return Math.round(totalScore / this.subjectReports.length);
  }

  getGradeClass(grade: string): string {
    return `grade-${grade.toLowerCase()}`;
  }

  getPassedSubjects(): number {
    // Assuming passing grade is 50% (grade E or better)
    return this.subjectReports.filter(report => report.totalScore >= 50).length;
  }

  getFailedSubjects(): number {
    // Subjects with less than 50% (grade U)
    return this.subjectReports.filter(report => report.totalScore < 50).length;
  }

  getClassRank(): string {
    // This would typically require class/level data to calculate actual rank
    // For now, returning a placeholder. You might need to implement a service call
    // to get the actual rank based on the student's performance compared to peers
    return 'N/A'; // Replace with actual ranking logic when class data is available
  }

  changeTerm(termOption: string): void {
    if (termOption !== this.term) {
      this.term = termOption;
      // Update the URL with new term parameter
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { term: termOption, year: this.academicYear },
        queryParamsHandling: 'merge'
      });
      // Reload the report data for the new term
      this.loadStudentReport();
    }
  }

  startEditingComments(): void {
    this.editingComments = true;
    this.tempOverallComment = this.overallComment;
    this.editingOverallComment = this.overallComment; // Initialize editing comment
    
    // Initialize subject comments
    this.subjectReports.forEach(report => {
      this.subjectComments[report.subject.id] = report.comment || '';
    });
  }

  saveComments(): void {
    if (!this.student) return;

    const promises: Promise<any>[] = [];

    // Save subject comments
    Object.entries(this.subjectComments).forEach(([subjectId, comment]) => {
      if (comment.trim()) {
        promises.push(
          this.reportService.addSubjectComment(
            this.student!.id, 
            this.term, 
            this.academicYear, 
            { subjectId: parseInt(subjectId), comment }
          ).toPromise()
        );
      }
    });

    // Save overall comment - use editingOverallComment instead of tempOverallComment
    if (this.editingOverallComment.trim()) {
      promises.push(
        this.reportService.addOverallComment(
          this.student.id,
          this.term,
          this.academicYear,
          { comment: this.editingOverallComment }
        ).toPromise()
      );
    }

    Promise.all(promises).then(() => {
      this.overallComment = this.editingOverallComment; // Update with editing comment
      this.editingComments = false;
      
      // Update subject reports with new comments
      this.subjectReports.forEach(report => {
        report.comment = this.subjectComments[report.subject.id];
      });
    }).catch(error => {
      console.error('Error saving comments:', error);
      alert('Failed to save comments. Please try again.');
    });
  }

  cancelEditingComments(): void {
    this.editingComments = false;
    this.tempOverallComment = '';
    this.editingOverallComment = ''; // Reset editing comment
    this.subjectComments = {};
  }

  generatePDF(): void {
    if (!this.student) return;

    this.reportService.generateReportPDF(this.student.id, this.term, this.academicYear)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${this.student!.firstName}_${this.student!.lastName}_Report_${this.term}_${this.academicYear}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Error generating PDF:', error);
          alert('Failed to generate PDF report. Please try again.');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }
}