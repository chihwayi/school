import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Teacher } from '../../../models/teacher.model';
import { TeacherService } from '../../../core/services/teacher.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-teacher-list',
  standalone: false,
  templateUrl: './teacher-list.component.html',
  styleUrl: './teacher-list.component.scss'
})
export class TeacherListComponent implements OnInit {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  canCreate = false;
  canEdit = false;
  canDelete = false;
  Math = Math;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private teacherService: TeacherService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadTeachers();
  }

  private checkPermissions(): void {
    this.canCreate = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
    this.canEdit = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
    this.canDelete = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
  }

  loadTeachers(): void {
    this.loading = true;
    this.teacherService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers = teachers;
        this.filteredTeachers = teachers;
        this.totalItems = teachers.length;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load teachers';
        this.loading = false;
        console.error('Error loading teachers:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTeachers = this.teachers;
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredTeachers = this.teachers.filter(teacher =>
        teacher.firstName.toLowerCase().includes(searchLower) ||
        teacher.lastName.toLowerCase().includes(searchLower) ||
        teacher.employeeId.toLowerCase().includes(searchLower) ||
        (teacher.user?.email && teacher.user.email.toLowerCase().includes(searchLower))
      );
    }
    this.totalItems = this.filteredTeachers.length;
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch();
  }

  getPaginatedTeachers(): Teacher[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTeachers.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  createTeacher(): void {
    this.router.navigate(['/teachers/new']);
  }

  viewTeacher(teacher: Teacher): void {
    this.router.navigate(['/teachers', teacher.id]);
  }

  editTeacher(teacher: Teacher): void {
    this.router.navigate(['/teachers', teacher.id, 'edit']);
  }

  deleteTeacher(teacher: Teacher): void {
    if (confirm(`Are you sure you want to delete teacher ${teacher.firstName} ${teacher.lastName}?`)) {
      this.teacherService.deleteTeacher(teacher.id).subscribe({
        next: () => {
          this.loadTeachers();
        },
        error: (error) => {
          this.error = 'Failed to delete teacher';
          console.error('Error deleting teacher:', error);
        }
      });
    }
  }

  getFullName(teacher: Teacher): string {
    return `${teacher.firstName} ${teacher.lastName}`;
  }

  refreshList(): void {
    this.loadTeachers();
  }

  trackByTeacherId(index: number, teacher: Teacher): number {
    return teacher.id;
  }
}
