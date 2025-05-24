import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentService } from '../../../core/services/assessment.service';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { Assessment } from '../../../models/assessment.model';
import { TeacherSubjectClass } from '../../../models/teacher.model';

@Component({
  selector: 'app-assessment-list',
  standalone: false,
  templateUrl: './assessment-list.component.html',
  styleUrl: './assessment-list.component.scss'
})
export class AssessmentListComponent implements OnInit, OnDestroy {
  assessments: Assessment[] = [];
  teacherSubjectClasses: TeacherSubjectClass[] = [];
  loading = true;
  canCreateAssessment = false;
  isTeacher = false;
  selectedTerm = '';
  selectedYear = '';
  availableYears: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private assessmentService: AssessmentService,
    private teacherService: TeacherService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.initializeYears();
    
    if (this.isTeacher) {
      this.loadTeacherSubjectClasses();
    }
    
    this.loadAssessments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    this.canCreateAssessment = this.authService.hasRole('TEACHER');
    this.isTeacher = this.authService.hasRole('TEACHER');
  }

  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.availableYears.push((currentYear - i).toString());
    }
  }

  private loadTeacherSubjectClasses(): void {
    this.teacherService.getAssignedSubjectsAndClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.teacherSubjectClasses = classes;
        },
        error: (error) => {
          console.error('Failed to load teacher subject classes:', error);
        }
      });
  }

  loadAssessments(): void {
    this.loading = true;
    // Note: This would need to be implemented in the backend
    // For now, we'll show an empty state
    setTimeout(() => {
      this.assessments = [];
      this.loading = false;
    }, 1000);
  }

  createAssessment(): void {
    this.router.navigate(['/assessments/new']);
  }

  viewSubjectClassAssessments(subjectClass: TeacherSubjectClass): void {
    // Navigate to assessments filtered by this subject class
    this.router.navigate(['/assessments'], {
      queryParams: {
        subject: subjectClass.subject.id,
        form: subjectClass.form,
        section: subjectClass.section
      }
    });
  }

  viewAssessment(assessment: Assessment): void {
    this.router.navigate(['/assessments', assessment.id]);
  }

  editAssessment(assessment: Assessment): void {
    this.router.navigate(['/assessments', assessment.id, 'edit']);
  }

  canEditAssessment(assessment: Assessment): boolean {
    return this.authService.hasRole('TEACHER') || this.authService.hasRole('ADMIN');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStudentName(assessment: Assessment): string {
    const student = assessment.studentSubject.student;
    return `${student.firstName} ${student.lastName}`;
  }

  getTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'exam':
        return 'type-exam';
      case 'test':
        return 'type-test';
      case 'classwork':
        return 'type-classwork';
      case 'homework':
        return 'type-homework';
      case 'project':
        return 'type-project';
      default:
        return 'type-other';
    }
  }

  getPercentage(assessment: Assessment): number {
    return Math.round((assessment.score / assessment.maxScore) * 100);
  }
}
