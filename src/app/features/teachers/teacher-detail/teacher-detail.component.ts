import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ClassGroup } from '../../../models/class.model';
import { Teacher, TeacherSubjectClass } from '../../../models/teacher.model';

@Component({
  selector: 'app-teacher-detail',
  standalone: false,
  templateUrl: './teacher-detail.component.html',
  styleUrl: './teacher-detail.component.scss'
})
export class TeacherDetailComponent implements OnInit, OnDestroy {
  teacher: Teacher | null = null;
  assignedSubjectsAndClasses: TeacherSubjectClass[] = [];
  supervisedClasses: ClassGroup[] = [];
  loading = true;
  error: string | null = null;
  canEdit = false;
  canDelete = false;
  teacherId!: number;
  currentYear: number = new Date().getFullYear();
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teacherService: TeacherService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.teacherId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (this.teacherId) {
      this.loadTeacherDetails();
    } else {
      this.error = 'Invalid teacher ID';
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

  private loadTeacherDetails(): void {
    this.loading = true;
    this.error = null;
    
    this.teacherService.getTeacherById(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teacher) => {
          this.teacher = teacher;
          this.loadAssignments();
        },
        error: (error) => {
          this.error = 'Failed to load teacher details: ' + error.message;
          this.loading = false;
        }
      });
  }

  private loadAssignments(): void {
    // Note: This assumes these methods exist in the service
    // You may need to add them to your TeacherService
    this.teacherService.getAssignedSubjectsAndClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assignments) => {
          this.assignedSubjectsAndClasses = assignments.filter(a => a.teacher.id === this.teacherId);
          this.loadSupervisedClasses();
        },
        error: (error) => {
          console.error('Failed to load teacher assignments:', error);
          this.loadSupervisedClasses();
        }
      });
  }

  private loadSupervisedClasses(): void {
    this.teacherService.getSupervisedClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.supervisedClasses = classes.filter(c => c.classTeacher?.id === this.teacherId);
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load supervised classes:', error);
          this.loading = false;
        }
      });
  }

  editTeacher(): void {
    if (this.canEdit) {
      this.router.navigate(['/teachers', this.teacherId, 'edit']);
    }
  }

  deleteTeacher(): void {
    if (this.canDelete && this.teacher) {
      const confirmDelete = confirm(`Are you sure you want to delete teacher ${this.teacher.firstName} ${this.teacher.lastName}?`);
      
      if (confirmDelete) {
        this.teacherService.deleteTeacher(this.teacherId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.router.navigate(['/teachers']);
            },
            error: (error) => {
              this.error = 'Failed to delete teacher: ' + error.message;
            }
          });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/teachers']);
  }
}
