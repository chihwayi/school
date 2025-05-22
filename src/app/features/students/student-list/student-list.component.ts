import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { AuthService } from '../../../core/services/auth.service';
import { Student, StudentLevel } from '../../../models/student.model';

@Component({
  selector: 'app-student-list',
  standalone: false,
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss'
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  Math = Math;

  // Filter properties
  searchTerm = '';
  selectedLevel = '';
  selectedForm = '';
  selectedSection = '';
  
  // Available filter options
  levels = Object.values(StudentLevel);
  forms: string[] = [];
  sections: string[] = [];

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;

  // Selection properties
  selectedStudents: Set<number> = new Set();
  showBulkActions = false;

  constructor(
    private studentService: StudentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadStudents();
    this.checkForMessages();
  }

  loadStudents(): void {
    this.loading = true;
    this.error = null;

    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.students = students;
        this.extractFilterOptions();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load students. Please try again.';
        this.loading = false;
        console.error('Error loading students:', error);
      }
    });
  }

  private extractFilterOptions(): void {
    const formsSet = new Set<string>();
    const sectionsSet = new Set<string>();

    this.students.forEach(student => {
      formsSet.add(student.form);
      sectionsSet.add(student.section);
    });

    this.forms = Array.from(formsSet).sort();
    this.sections = Array.from(sectionsSet).sort();
  }

  private checkForMessages(): void {
    this.route.queryParams.subscribe(params => {
      if (params['created']) {
        this.successMessage = 'Student created successfully!';
        this.clearMessageAfterDelay();
      } else if (params['updated']) {
        this.successMessage = 'Student updated successfully!';
        this.clearMessageAfterDelay();
      } else if (params['promoted']) {
        this.successMessage = `${params['promoted']} student(s) promoted successfully!`;
        this.clearMessageAfterDelay();
      }
    });
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      // Clear query params
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    }, 5000);
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedLevel = '';
    this.selectedForm = '';
    this.selectedSection = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.students];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower)
      );
    }

    // Apply level filter
    if (this.selectedLevel) {
      filtered = filtered.filter(student => student.level === this.selectedLevel);
    }

    // Apply form filter
    if (this.selectedForm) {
      filtered = filtered.filter(student => student.form === this.selectedForm);
    }

    // Apply section filter
    if (this.selectedSection) {
      filtered = filtered.filter(student => student.section === this.selectedSection);
    }

    this.filteredStudents = filtered;
    this.totalItems = filtered.length;
  }

  getPaginatedStudents(): Student[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredStudents.slice(startIndex, endIndex);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Selection methods
  toggleStudentSelection(studentId: number): void {
    if (this.selectedStudents.has(studentId)) {
      this.selectedStudents.delete(studentId);
    } else {
      this.selectedStudents.add(studentId);
    }
    this.updateBulkActionsVisibility();
  }

  toggleAllSelection(): void {
    const currentPageStudents = this.getPaginatedStudents();
    const allSelected = currentPageStudents.every(s => this.selectedStudents.has(s.id));
    
    if (allSelected) {
      currentPageStudents.forEach(s => this.selectedStudents.delete(s.id));
    } else {
      currentPageStudents.forEach(s => this.selectedStudents.add(s.id));
    }
    this.updateBulkActionsVisibility();
  }

  isAllSelected(): boolean {
    const currentPageStudents = this.getPaginatedStudents();
    return currentPageStudents.length > 0 && 
           currentPageStudents.every(s => this.selectedStudents.has(s.id));
  }

  isIndeterminate(): boolean {
    const currentPageStudents = this.getPaginatedStudents();
    const selectedCount = currentPageStudents.filter(s => this.selectedStudents.has(s.id)).length;
    return selectedCount > 0 && selectedCount < currentPageStudents.length;
  }

  private updateBulkActionsVisibility(): void {
    this.showBulkActions = this.selectedStudents.size > 0;
  }

  // Bulk actions
  bulkAdvanceForm(): void {
    if (this.selectedStudents.size === 0) return;
    
    if (confirm(`Are you sure you want to advance ${this.selectedStudents.size} selected student(s) to the next form?`)) {
      const studentIds = Array.from(this.selectedStudents);
      
      this.studentService.advanceStudentsToNextForm(studentIds).subscribe({
        next: (updatedStudents) => {
          this.successMessage = `${updatedStudents.length} student(s) advanced successfully!`;
          this.selectedStudents.clear();
          this.updateBulkActionsVisibility();
          this.loadStudents();
          this.clearMessageAfterDelay();
        },
        error: (error) => {
          this.error = 'Failed to advance students. Please try again.';
          console.error('Error advancing students:', error);
        }
      });
    }
  }

  bulkPromoteToALevel(): void {
    if (this.selectedStudents.size === 0) return;
    
    // Navigate to promotion form with selected students
    this.router.navigate(['/students/promote-to-a-level'], {
      queryParams: { students: Array.from(this.selectedStudents).join(',') }
    });
  }

  clearSelection(): void {
    this.selectedStudents.clear();
    this.updateBulkActionsVisibility();
  }

  // Navigation methods
  viewStudent(studentId: number): void {
    this.router.navigate(['/students', studentId]);
  }

  editStudent(studentId: number): void {
    this.router.navigate(['/students', studentId, 'edit']);
  }

  addNewStudent(): void {
    this.router.navigate(['/students/new']);
  }

  deleteStudent(student: Student): void {
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`)) {
      this.studentService.deleteStudent(student.id).subscribe({
        next: () => {
          this.successMessage = 'Student deleted successfully!';
          this.loadStudents();
          this.clearMessageAfterDelay();
        },
        error: (error) => {
          this.error = 'Failed to delete student. Please try again.';
          console.error('Error deleting student:', error);
        }
      });
    }
  }

  // Utility methods
  canManageStudents(): boolean {
    return this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
  }

  canViewStudent(): boolean {
    return this.authService.hasRole('ADMIN') || 
           this.authService.hasRole('CLERK') || 
           this.authService.hasRole('TEACHER');
  }

  getStudentFullName(student: Student): string {
    return `${student.firstName} ${student.lastName}`;
  }

  getClassDisplayName(student: Student): string {
    return `${student.form} ${student.section}`;
  }

  getLevelDisplayName(level: StudentLevel): string {
    return level === StudentLevel.OLEVEL ? 'O-Level' : 'A-Level';
  }

  getFilterSummary(): string {
    const filters: string[] = [];
    
    if (this.searchTerm) filters.push(`Search: "${this.searchTerm}"`);
    if (this.selectedLevel) filters.push(`Level: ${this.getLevelDisplayName(this.selectedLevel as StudentLevel)}`);
    if (this.selectedForm) filters.push(`Form: ${this.selectedForm}`);
    if (this.selectedSection) filters.push(`Section: ${this.selectedSection}`);
    
    return filters.length > 0 ? `Filtered by: ${filters.join(', ')}` : '';
  }

  exportStudents(): void {
    // This would implement CSV/Excel export functionality
    console.log('Export functionality to be implemented');
  }
}
  
