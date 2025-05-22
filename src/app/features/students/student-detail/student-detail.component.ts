import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { GuardianService } from '../../../core/services/guardian.service';
import { AssessmentService } from '../../../core/services/assessment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Student } from '../../../models/student.model';
import { Guardian } from '../../../models/guardian.model';
import { Subject } from '../../../models/subject.model';
import { Assessment } from '../../../models/assessment.model';

@Component({
  selector: 'app-student-detail',
  standalone: false,
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.scss'
})
export class StudentDetailComponent implements OnInit {
  student: Student | null = null;
  studentSubjects: Subject[] = [];
  guardians: Guardian[] = [];
  recentAssessments: Assessment[] = [];
  isLoading = true;
  error: string | null = null;
  activeTab = 'overview';

  // User permissions
  canEdit = false;
  canDelete = false;
  canViewAssessments = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studentService: StudentService,
    private guardianService: GuardianService,
    private assessmentService: AssessmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadStudentData();
  }

  private checkPermissions(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.roles) {
      this.canEdit = currentUser.roles.includes('ADMIN') || currentUser.roles.includes('CLERK');
      this.canDelete = currentUser.roles.includes('ADMIN') || currentUser.roles.includes('CLERK');
      this.canViewAssessments = true; // All logged-in users can view assessments
    }
  }

  private loadStudentData(): void {
    const studentId = this.route.snapshot.paramMap.get('id');
    if (!studentId) {
      this.error = 'Invalid student ID';
      this.isLoading = false;
      return;
    }

    const id = parseInt(studentId, 10);
    this.isLoading = true;

    // Load student basic info
    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        this.student = student;
        this.loadStudentSubjects(id);
        this.loadGuardians(id);
        this.loadRecentAssessments(id);
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.error = 'Failed to load student information';
        this.isLoading = false;
      }
    });
  }

  private loadStudentSubjects(studentId: number): void {
    this.studentService.getStudentSubjects(studentId).subscribe({
      next: (subjects) => {
        this.studentSubjects = subjects;
      },
      error: (error) => {
        console.error('Error loading student subjects:', error);
      }
    });
  }

  private loadGuardians(studentId: number): void {
    this.guardianService.getGuardiansByStudent(studentId).subscribe({
      next: (guardians) => {
        this.guardians = guardians;
      },
      error: (error) => {
        console.error('Error loading guardians:', error);
      }
    });
  }

  private loadRecentAssessments(studentId: number): void {
    // Get current academic year and term (you might want to make this dynamic)
    const currentYear = new Date().getFullYear().toString();
    const currentTerm = this.getCurrentTerm();

    this.assessmentService.getStudentTermAssessments(studentId, currentTerm, currentYear).subscribe({
      next: (assessments) => {
        this.recentAssessments = assessments.slice(0, 5); // Get latest 5 assessments
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading assessments:', error);
        this.isLoading = false;
      }
    });
  }

  private getCurrentTerm(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 4) return 'Term 1';
    if (month >= 5 && month <= 8) return 'Term 2';
    return 'Term 3';
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onEdit(): void {
    if (this.student) {
      this.router.navigate(['/students', this.student.id, 'edit']);
    }
  }

  onDelete(): void {
    if (this.student && confirm(`Are you sure you want to delete ${this.student.firstName} ${this.student.lastName}?`)) {
      this.studentService.deleteStudent(this.student.id).subscribe({
        next: () => {
          this.router.navigate(['/students']);
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.error = 'Failed to delete student';
        }
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/students']);
  }

  getSubjectsByCategory(): { [key: string]: Subject[] } {
    const grouped: { [key: string]: Subject[] } = {};
    this.studentSubjects.forEach(subject => {
      if (!grouped[subject.category]) {
        grouped[subject.category] = [];
      }
      grouped[subject.category].push(subject);
    });
    return grouped;
  }

  getPrimaryGuardian(): Guardian | null {
    return this.guardians.find(g => g.primaryGuardian) || null;
  }

  getSecondaryGuardians(): Guardian[] {
    return this.guardians.filter(g => !g.primaryGuardian);
  }

  getAverageScore(): number {
    if (this.recentAssessments.length === 0) return 0;
    const total = this.recentAssessments.reduce((sum, assessment) => {
      return sum + (assessment.score / assessment.maxScore) * 100;
    }, 0);
    return Math.round(total / this.recentAssessments.length);
  }

  getPerformanceClass(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'average';
    if (percentage >= 50) return 'below-average';
    return 'poor';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
