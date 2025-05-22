import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeacherService } from '../../../core/services/teacher.service';
import { Teacher, TeacherRegistration } from '../../../models/teacher.model';

@Component({
  selector: 'app-teacher-form',
  standalone: false,
  templateUrl: './teacher-form.component.html',
  styleUrl: './teacher-form.component.scss'
})
export class TeacherFormComponent implements OnInit {
  teacherForm: FormGroup;
  isEditMode = false;
  teacherId: number | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private teacherService: TeacherService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.teacherForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.teacherId = +params['id'];
        this.loadTeacher();
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      employeeId: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]]
    });
  }

  private loadTeacher(): void {
    if (!this.teacherId) return;

    this.loading = true;
    this.teacherService.getTeacherById(this.teacherId).subscribe({
      next: (teacher) => {
        this.populateForm(teacher);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load teacher details';
        this.loading = false;
        console.error('Error loading teacher:', error);
      }
    });
  }

  private populateForm(teacher: Teacher): void {
    this.teacherForm.patchValue({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      employeeId: teacher.employeeId,
      username: teacher.user?.username || '',
      email: teacher.user?.email || ''
    });

    // Make password optional for edit mode
    this.teacherForm.get('password')?.clearValidators();
    this.teacherForm.get('password')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.teacherForm.valid) {
      this.loading = true;
      this.error = null;
      this.success = null;

      if (this.isEditMode) {
        this.updateTeacher();
      } else {
        this.createTeacher();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createTeacher(): void {
    const teacherData: TeacherRegistration = {
      firstName: this.teacherForm.value.firstName.trim(),
      lastName: this.teacherForm.value.lastName.trim(),
      employeeId: this.teacherForm.value.employeeId.trim(),
      username: this.teacherForm.value.username.trim(),
      email: this.teacherForm.value.email.trim(),
      password: this.teacherForm.value.password
    };

    this.teacherService.createTeacher(teacherData).subscribe({
      next: (teacher) => {
        this.success = 'Teacher created successfully!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/teachers', teacher.id]);
        }, 2000);
      },
      error: (error) => {
        this.error = error.message || 'Failed to create teacher';
        this.loading = false;
        console.error('Error creating teacher:', error);
      }
    });
  }

  private updateTeacher(): void {
    if (!this.teacherId) return;

    const updateData: Partial<Teacher> = {
      firstName: this.teacherForm.value.firstName.trim(),
      lastName: this.teacherForm.value.lastName.trim(),
      employeeId: this.teacherForm.value.employeeId.trim()
    };

    this.teacherService.updateTeacher(this.teacherId, updateData).subscribe({
      next: (teacher) => {
        this.success = 'Teacher updated successfully!';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/teachers', teacher.id]);
        }, 2000);
      },
      error: (error) => {
        this.error = error.message || 'Failed to update teacher';
        this.loading = false;
        console.error('Error updating teacher:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.teacherForm.controls).forEach(key => {
      const control = this.teacherForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.teacherForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.teacherForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      employeeId: 'Employee ID',
      username: 'Username',
      email: 'Email',
      password: 'Password'
    };
    return labels[fieldName] || fieldName;
  }

  cancel(): void {
    if (this.isEditMode && this.teacherId) {
      this.router.navigate(['/teachers', this.teacherId]);
    } else {
      this.router.navigate(['/teachers']);
    }
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Edit Teacher' : 'Add New Teacher';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Teacher' : 'Create Teacher';
  }
}
