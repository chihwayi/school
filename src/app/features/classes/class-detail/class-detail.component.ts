import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ClassService } from '../../../core/services/class.service';
import { ClassGroup } from '../../../models/class.model';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-class-detail',
  standalone: false,
  templateUrl: './class-detail.component.html',
  styleUrl: './class-detail.component.scss'
})
export class ClassDetailComponent implements OnInit, OnDestroy {
  classGroup: ClassGroup | null = null;
  students: Student[] = [];
  loading = true;
  studentsLoading = false;
  error: string | null = null;
  classId!: number;
  canEdit = false;
  canDelete = false;
  
  // Statistics
  totalStudents = 0;
  maleStudents = 0;
  femaleStudents = 0;
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.classId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.classId) {
      this.loadClassDetails();
      this.loadStudents();
    } else {
      this.error = 'Invalid class ID';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    this.canEdit = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
    this.canDelete = this.authService.hasRole('ADMIN');
  }

  private loadClassDetails(): void {
    this.loading = true;
    this.error = null;
    
    this.classService.getClassGroupById(this.classId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classGroup) => {
          this.classGroup = classGroup;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load class details: ' + error.message;
          this.loading = false;
        }
      });
  }

  private loadStudents(): void {
    this.studentsLoading = true;
    
    this.classService.getStudentsInClass(this.classId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (students) => {
          this.students = students;
          this.calculateStatistics();
          this.studentsLoading = false;
        },
        error: (error) => {
          console.error('Failed to load students:', error);
          this.studentsLoading = false;
        }
      });
  }

  private calculateStatistics(): void {
    this.totalStudents = this.students.length;
    // Note: Gender calculation would require gender field in Student model
    // For now, we'll just show total count
    this.maleStudents = 0;
    this.femaleStudents = 0;
  }

  editClass(): void {
    if (this.canEdit) {
      this.router.navigate(['/classes', this.classId, 'edit']);
    }
  }

  deleteClass(): void {
    if (this.canDelete && this.classGroup) {
      const confirmDelete = confirm(
        `Are you sure you want to delete class ${this.classGroup.form} ${this.classGroup.section}?`
      );
      
      if (confirmDelete) {
        this.classService.deleteClassGroup(this.classId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.router.navigate(['/classes']);
            },
            error: (error) => {
              this.error = 'Failed to delete class: ' + error.message;
            }
          });
      }
    }
  }

  viewStudent(student: Student): void {
    this.router.navigate(['/students', student.id]);
  }

  goBack(): void {
    this.router.navigate(['/classes']);
  }

  getClassDisplayName(): string {
    if (this.classGroup) {
      return `${this.classGroup.form} ${this.classGroup.section}`;
    }
    return '';
  }

  getClassTeacherName(): string {
    if (this.classGroup?.classTeacher) {
      return `${this.classGroup.classTeacher.firstName} ${this.classGroup.classTeacher.lastName}`;
    }
    return 'No Class Teacher Assigned';
  }

  getStudentLevel(student: Student): string {
    // Determine if student is O-Level or A-Level based on form
    const form = student.form.toLowerCase();
    if (form.includes('5') || form.includes('6')) {
      return 'A-Level';
    }
    return 'O-Level';
  }

  getStudentDisplayName(student: Student): string {
    return `${student.firstName} ${student.lastName}`;
  }

  // TrackBy function for ngFor performance optimization
  trackByStudentId(index: number, student: Student): number {
    return student.id;
  }
}