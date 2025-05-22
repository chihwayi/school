import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubjectService } from '../../../core/services/subject.service';
import { Subject, SubjectCategory } from '../../../models/subject.model';

@Component({
  selector: 'app-subject-form',
  standalone: false,
  templateUrl: './subject-form.component.html',
  styleUrl: './subject-form.component.scss'
})
export class SubjectFormComponent implements OnInit {
  subjectForm: FormGroup;
  isEditMode = false;
  subjectId: number | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  
  categories = Object.values(SubjectCategory);
  levels = ['O-LEVEL', 'A-LEVEL'];

  constructor(
    private fb: FormBuilder,
    private subjectService: SubjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.subjectForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.subjectId = +params['id'];
        this.isEditMode = true;
        this.loadSubject();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[A-Z0-9-]+$/)]],
      level: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  loadSubject(): void {
    if (!this.subjectId) return;
    
    this.loading = true;
    this.error = null;
    
    this.subjectService.getSubjectById(this.subjectId).subscribe({
      next: (subject) => {
        this.subjectForm.patchValue({
          name: subject.name,
          code: subject.code,
          level: subject.level,
          category: subject.category,
          description: subject.description || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load subject details';
        this.loading = false;
        console.error('Error loading subject:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.subjectForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const formValue = this.subjectForm.value;
    const subjectData: Partial<Subject> = {
      name: formValue.name.trim(),
      code: formValue.code.trim().toUpperCase(),
      level: formValue.level,
      category: formValue.category,
      description: formValue.description?.trim() || null
    };

    if (this.isEditMode && this.subjectId) {
      this.updateSubject(subjectData);
    } else {
      this.createSubject(subjectData);
    }
  }

  createSubject(subjectData: Partial<Subject>): void {
    this.subjectService.createSubject(subjectData as Subject).subscribe({
      next: (subject) => {
        this.router.navigate(['/subjects'], {
          queryParams: { created: subject.id }
        });
      },
      error: (error) => {
        this.saving = false;
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          this.error = 'A subject with this code already exists';
        } else {
          this.error = 'Failed to create subject. Please try again.';
        }
        console.error('Error creating subject:', error);
      }
    });
  }

  updateSubject(subjectData: Partial<Subject>): void {
    if (!this.subjectId) return;
    
    this.subjectService.updateSubject(this.subjectId, subjectData as Subject).subscribe({
      next: (subject) => {
        this.router.navigate(['/subjects'], {
          queryParams: { updated: subject.id }
        });
      },
      error: (error) => {
        this.saving = false;
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          this.error = 'A subject with this code already exists';
        } else {
          this.error = 'Failed to update subject. Please try again.';
        }
        console.error('Error updating subject:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/subjects']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.subjectForm.controls).forEach(key => {
      const control = this.subjectForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.subjectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.subjectForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Subject code can only contain uppercase letters, numbers, and hyphens';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: 'Subject name',
      code: 'Subject code',
      level: 'Level',
      category: 'Category',
      description: 'Description'
    };
    return displayNames[fieldName] || fieldName;
  }

  getCategoryDisplayName(category: SubjectCategory): string {
    const categoryNames: { [key in SubjectCategory]: string } = {
      [SubjectCategory.SCIENCES]: 'Sciences',
      [SubjectCategory.HUMANITIES]: 'Arts/Humanities',
      [SubjectCategory.LANGUAGES]: 'Languages',
      [SubjectCategory.MATHEMATICS]: 'Mathematics',
      [SubjectCategory.TECHNICAL]: 'Technical',
      [SubjectCategory.ARTS]: 'Arts',
      [SubjectCategory.OTHER]: 'Other'
    };
    return categoryNames[category] || category;
  }
}
