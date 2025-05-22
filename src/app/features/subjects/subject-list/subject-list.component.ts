import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject, SubjectCategory } from '../../../models/subject.model';

@Component({
  selector: 'app-subject-list',
  standalone: false,
  templateUrl: './subject-list.component.html',
  styleUrl: './subject-list.component.scss'
})
export class SubjectListComponent implements OnInit {
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  loading = true;
  error: string | null = null;
  Math = Math;
  
  // Filter options
  selectedCategory: string = 'ALL';
  selectedLevel: string = 'ALL';
  searchTerm: string = '';
  
  categories = Object.values(SubjectCategory);
  levels = ['O-LEVEL', 'A-LEVEL'];

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private subjectService: SubjectService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.loading = true;
    this.error = null;
    
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.subjects = subjects;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load subjects';
        this.loading = false;
        console.error('Error loading subjects:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.subjects];

    // Apply category filter
    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(subject => subject.category === this.selectedCategory);
    }

    // Apply level filter
    if (this.selectedLevel !== 'ALL') {
      filtered = filtered.filter(subject => subject.level === this.selectedLevel);
    }

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(subject => 
        subject.name.toLowerCase().includes(searchLower) ||
        subject.code.toLowerCase().includes(searchLower) ||
        (subject.description && subject.description.toLowerCase().includes(searchLower))
      );
    }

    this.filteredSubjects = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSubjects.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedSubjects(): Subject[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredSubjects.slice(startIndex, endIndex);
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onLevelChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedCategory = 'ALL';
    this.selectedLevel = 'ALL';
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  createSubject(): void {
    this.router.navigate(['/subjects/new']);
  }

  editSubject(subject: Subject): void {
    this.router.navigate(['/subjects', subject.id, 'edit']);
  }

  viewSubject(subject: Subject): void {
    this.router.navigate(['/subjects', subject.id]);
  }

  deleteSubject(subject: Subject): void {
    if (confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      this.subjectService.deleteSubject(subject.id).subscribe({
        next: () => {
          this.loadSubjects();
        },
        error: (error) => {
          console.error('Error deleting subject:', error);
          alert('Failed to delete subject. Please try again.');
        }
      });
    }
  }

  canCreateOrEdit(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_CLERK');
  }

  canDelete(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  retry(): void {
    this.loadSubjects();
  }

  getCategoryDisplayName(category: string): string {
    switch (category) {
      case 'SCIENCES': return 'Sciences';
      case 'HUMANITIES': return 'Humanities';
      case 'LANGUAGES': return 'Languages';
      case 'MATHEMATICS': return 'Mathematics';
      case 'TECHNICAL': return 'Technical';
      case 'ARTS': return 'Arts';
      case 'OTHER': return 'Other';
      default: return category;
    }
  }
}
