import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ClassService } from '../../../core/services/class.service';
import { StudentService } from '../../../core/services/student.service';
import { ClassGroup } from '../../../models/class.model';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-report-list',
  standalone: false,
  templateUrl: './report-list.component.html',
  styleUrl: './report-list.component.scss'
})
export class ReportListComponent implements OnInit {
  students: Student[] = [];
  classes: ClassGroup[] = [];
  filteredStudents: Student[] = [];
  filteredClasses: ClassGroup[] = [];
  loading = true;
  error: string | null = null;
  
  // Filter properties
  searchTerm = '';
  selectedForm = '';
  selectedSection = '';
  selectedLevel = '';
  
  // Available filter options
  forms: string[] = [];
  sections: string[] = [];
  levels = ['O-LEVEL', 'A-LEVEL'];
  
  // Current term and year
  currentTerm = 'Term 1';
  currentYear = '2024';
  
  // View mode
  viewMode: 'students' | 'classes' = 'students';

  constructor(
    private studentService: StudentService,
    private classService: ClassService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Load both students and classes
    Promise.all([
      this.studentService.getAllStudents().toPromise(),
      this.classService.getAllClassGroups().toPromise()
    ]).then(([students, classes]) => {
      this.students = students || [];
      this.classes = classes || [];
      this.filteredStudents = [...this.students];
      this.filteredClasses = [...this.classes];
      
      this.extractFilterOptions();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading report data:', error);
      this.error = 'Failed to load report data';
      this.loading = false;
    });
  }

  private extractFilterOptions(): void {
    // Extract unique forms and sections
    const formsSet = new Set<string>();
    const sectionsSet = new Set<string>();
    
    this.students.forEach(student => {
      if (student.form) formsSet.add(student.form);
      if (student.section) sectionsSet.add(student.section);
    });
    
    this.forms = Array.from(formsSet).sort();
    this.sections = Array.from(sectionsSet).sort();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.viewMode === 'students') {
      this.filteredStudents = this.students.filter(student => {
        const matchesSearch = !this.searchTerm || 
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          student.studentId.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        const matchesForm = !this.selectedForm || student.form === this.selectedForm;
        const matchesSection = !this.selectedSection || student.section === this.selectedSection;
        const matchesLevel = !this.selectedLevel || student.level === this.selectedLevel;
        
        return matchesSearch && matchesForm && matchesSection && matchesLevel;
      });
    } else {
      this.filteredClasses = this.classes.filter(cls => {
        const matchesSearch = !this.searchTerm || 
          `${cls.form} ${cls.section}`.toLowerCase().includes(this.searchTerm.toLowerCase());
        
        const matchesForm = !this.selectedForm || cls.form === this.selectedForm;
        const matchesSection = !this.selectedSection || cls.section === this.selectedSection;
        
        return matchesSearch && matchesForm && matchesSection;
      });
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedForm = '';
    this.selectedSection = '';
    this.selectedLevel = '';
    this.applyFilters();
  }

  switchViewMode(mode: 'students' | 'classes'): void {
    this.viewMode = mode;
    this.applyFilters();
  }

  viewStudentReport(student: Student): void {
    this.router.navigate(['/reports/student', student.id], {
      queryParams: { term: this.currentTerm, year: this.currentYear }
    });
  }

  viewClassReport(classGroup: ClassGroup): void {
    this.router.navigate(['/reports/class', classGroup.id], {
      queryParams: { term: this.currentTerm, year: this.currentYear }
    });
  }

  canViewReports(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.roles?.some((role: string) => ['ADMIN', 'CLERK', 'TEACHER', 'CLASS_TEACHER'].includes(role)) || false;
  }
}