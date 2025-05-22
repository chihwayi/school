import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, SubjectCategory } from '../../../models/subject.model';
import { SubjectService } from '../../../core/services/subject.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-subject-detail',
  standalone: false,
  templateUrl: './subject-detail.component.html',
  styleUrl: './subject-detail.component.scss'
})
export class SubjectDetailComponent implements OnInit {
[x: string]: any;
  subject: Subject | null = null;
  subjects: Subject[] = [];
  loading = true;
  error: string | null = null;
  canEdit = false;
  canDelete = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subjectService: SubjectService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadSubject();
    this.loadSubjectsByCategory(SubjectCategory.SCIENCES);
  }

  private checkPermissions(): void {
    this.canEdit = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
    this.canDelete = this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
  }

  private loadSubject(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.subjectService.getSubjectById(+id).subscribe({
        next: (subject) => {
          this.subject = subject;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load subject details';
          this.loading = false;
          console.error('Error loading subject:', error);
        }
      });
    }
  }

  loadSubjectsByCategory(category: SubjectCategory): void {
    this.subjectService.getSubjectsByCategory(category).subscribe({
      next: (data) => {
        this.subjects = data;
      },
      error: (err) => {
        console.error('Failed to load subjects:', err);
      }
    });
  }

  editSubject(): void {
    if (this.subject) {
      this.router.navigate(['/subjects', this.subject.id, 'edit']);
    }
  }

  deleteSubject(): void {
    if (this.subject && confirm('Are you sure you want to delete this subject?')) {
      this.subjectService.deleteSubject(this.subject.id).subscribe({
        next: () => {
          this.router.navigate(['/subjects']);
        },
        error: (error) => {
          this.error = 'Failed to delete subject';
          console.error('Error deleting subject:', error);
        }
      });
    }
  }

  getCategoryDescription(category: SubjectCategory): string {
    switch (category) {
      case SubjectCategory.SCIENCES:
        return 'Sciences';
      case SubjectCategory.HUMANITIES:
        return 'Humanities';
      case SubjectCategory.LANGUAGES:
        return 'Languages';
      case SubjectCategory.MATHEMATICS:
        return 'Mathematics';
      case SubjectCategory.TECHNICAL:
        return 'Technical';
      case SubjectCategory.ARTS:
        return 'Arts';
      case SubjectCategory.OTHER:
        return 'Other';
      default:
        return 'Unknown';
    }
  }

  goBack(): void {
    this.router.navigate(['/subjects']);
  }
}
