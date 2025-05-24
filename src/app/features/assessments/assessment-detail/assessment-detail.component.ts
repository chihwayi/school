import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../../../core/services/assessment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Assessment } from '../../../models/assessment.model';

@Component({
  selector: 'app-assessment-detail',
  standalone: false,
  templateUrl: './assessment-detail.component.html',
  styleUrl: './assessment-detail.component.scss'
})
export class AssessmentDetailComponent implements OnInit {
  assessment: Assessment | null = null;
  loading = true;
  error: string | null = null;
  canEdit = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assessmentService: AssessmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkEditPermissions();
    this.loadAssessment();
  }

  private checkEditPermissions(): void {
    const user = this.authService.getCurrentUser();
    this.canEdit = user?.roles?.includes('TEACHER') || 
                   user?.roles?.includes('ADMIN') || 
                   user?.roles?.includes('CLERK');
  }

  private loadAssessment(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Assessment ID not found';
      this.loading = false;
      return;
    }

    // Note: You'll need to add a getAssessmentById method to your AssessmentService
    // For now, I'm using a placeholder implementation
    this.assessmentService.getAssessmentById(parseInt(id)).subscribe({
      next: (assessment) => {
        this.assessment = assessment;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load assessment details';
        this.loading = false;
        console.error('Error loading assessment:', err);
      }
    });
  }

  getStudentName(): string {
    if (!this.assessment?.studentSubject?.student) return 'N/A';
    const student = this.assessment.studentSubject.student;
    return `${student.firstName} ${student.lastName}`;
  }

  getPercentage(): number {
    if (!this.assessment || this.assessment.maxScore === 0) return 0;
    return Math.round((this.assessment.score / this.assessment.maxScore) * 100);
  }

  getGrade(): string {
    const percentage = this.getPercentage();
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    if (percentage >= 40) return 'E';
    return 'F';
  }

  getGradeClass(): string {
    const grade = this.getGrade();
    return `grade-${grade.toLowerCase()}`;
  }

  getScoreClass(): string {
    const percentage = this.getPercentage();
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 70) return 'score-good';
    if (percentage >= 60) return 'score-satisfactory';
    if (percentage >= 50) return 'score-pass';
    return 'score-fail';
  }

  getPerformanceText(): string {
    const percentage = this.getPercentage();
    if (percentage >= 90) return 'Excellent Performance';
    if (percentage >= 80) return 'Very Good Performance';
    if (percentage >= 70) return 'Good Performance';
    if (percentage >= 60) return 'Satisfactory Performance';
    if (percentage >= 50) return 'Pass';
    return 'Needs Improvement';
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  editAssessment(): void {
    if (this.assessment) {
      this.router.navigate(['/assessments', this.assessment.id, 'edit']);
    }
  }

  deleteAssessment(): void {
    if (!this.assessment) return;

    if (confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      this.assessmentService.deleteAssessment(this.assessment.id).subscribe({
        next: () => {
          this.router.navigate(['/assessments']);
        },
        error: (err) => {
          console.error('Error deleting assessment:', err);
          alert('Failed to delete assessment. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/assessments']);
  }
}
