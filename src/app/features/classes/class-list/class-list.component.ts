import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ClassService } from '../../../core/services/class.service';
import { ClassGroup } from '../../../models/class.model';

@Component({
  selector: 'app-class-list',
  standalone: false,
  templateUrl: './class-list.component.html',
  styleUrl: './class-list.component.scss'
})
export class ClassListComponent implements OnInit, OnDestroy {
  classes: ClassGroup[] = [];
  filteredClasses: ClassGroup[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedForm = '';
  selectedYear = '';
  canCreate = false;
  canEdit = false;
  canDelete = false;
  
  // Filter options
  availableForms: string[] = [];
  availableYears: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private classService: ClassService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPermissions(): void {
    this.canCreate = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
    this.canEdit = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
    this.canDelete = this.authService.hasRole('ADMIN');
  }

  loadClasses(): void {
    this.loading = true;
    this.error = null;
    
    this.classService.getAllClassGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.classes = classes;
          this.filteredClasses = classes;
          this.extractFilterOptions();
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load classes: ' + error.message;
          this.loading = false;
        }
      });
  }

  private extractFilterOptions(): void {
    this.availableForms = [...new Set(this.classes.map(c => c.form))].sort();
    this.availableYears = [...new Set(this.classes.map(c => c.academicYear))].sort().reverse();
  }

  applyFilters(): void {
    this.filteredClasses = this.classes.filter(classGroup => {
      const matchesSearch = !this.searchTerm || 
        `${classGroup.form} ${classGroup.section}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (classGroup.classTeacher && 
         `${classGroup.classTeacher.firstName} ${classGroup.classTeacher.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesForm = !this.selectedForm || classGroup.form === this.selectedForm;
      const matchesYear = !this.selectedYear || classGroup.academicYear === this.selectedYear;
      
      return matchesSearch && matchesForm && matchesYear;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFormChange(): void {
    this.applyFilters();
  }

  onYearChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedForm = '';
    this.selectedYear = '';
    this.filteredClasses = this.classes;
  }

  createClass(): void {
    if (this.canCreate) {
      this.router.navigate(['/classes/new']);
    }
  }

  viewClass(classGroup: ClassGroup): void {
    this.router.navigate(['/classes', classGroup.id]);
  }

  editClass(classGroup: ClassGroup): void {
    if (this.canEdit) {
      this.router.navigate(['/classes', classGroup.id, 'edit']);
    }
  }

  deleteClass(classGroup: ClassGroup): void {
    if (this.canDelete) {
      const confirmDelete = confirm(`Are you sure you want to delete class ${classGroup.form} ${classGroup.section}?`);
      
      if (confirmDelete) {
        this.classService.deleteClassGroup(classGroup.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.loadClasses();
            },
            error: (error) => {
              this.error = 'Failed to delete class: ' + error.message;
            }
          });
      }
    }
  }

  getClassDisplayName(classGroup: ClassGroup): string {
    return `${classGroup.form} ${classGroup.section}`;
  }

  getClassTeacherName(classGroup: ClassGroup): string {
    if (classGroup.classTeacher) {
      return `${classGroup.classTeacher.firstName} ${classGroup.classTeacher.lastName}`;
    }
    return 'No Class Teacher';
  }
}
