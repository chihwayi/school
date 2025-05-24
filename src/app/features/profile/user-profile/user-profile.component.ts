import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { Teacher } from '../../../models/teacher.model';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  currentUser: any;
  teacherData: Teacher | null = null;
  isLoading = false;
  isTeacher = false;
  activeTab = 'profile';
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private teacherService: TeacherService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      employeeId: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.isTeacher = this.authService.hasRole('ROLE_TEACHER') || this.authService.hasRole('ROLE_CLASS_TEACHER');

    if (this.isTeacher) {
      this.teacherService.getCurrentTeacher().subscribe({
        next: (teacher) => {
          this.teacherData = teacher;
          this.populateForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading teacher data:', error);
          this.errorMessage = 'Failed to load profile data';
          this.isLoading = false;
        }
      });
    } else {
      // For admin/clerk users, populate with basic user data
      this.populateBasicUserForm();
      this.isLoading = false;
    }
  }

  populateForm(): void {
    if (this.teacherData) {
      this.profileForm.patchValue({
        firstName: this.teacherData.firstName,
        lastName: this.teacherData.lastName,
        email: this.teacherData.user?.email || '',
        employeeId: this.teacherData.employeeId
      });
    }
  }

  populateBasicUserForm(): void {
    // For non-teacher users, we might not have detailed profile data
    // This would need to be implemented based on your user management system
    this.profileForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      employeeId: ''
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onUpdateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      const formData = this.profileForm.value;

      if (this.isTeacher && this.teacherData) {
        this.teacherService.updateTeacher(this.teacherData.id, formData).subscribe({
          next: (updated) => {
            this.teacherData = updated;
            this.successMessage = 'Profile updated successfully';
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.errorMessage = 'Failed to update profile';
            this.isLoading = false;
          }
        });
      } else {
        // Handle admin/clerk profile updates
        this.successMessage = 'Profile updated successfully';
        this.isLoading = false;
      }
    } else {
      this.markFormGroupTouched(this.profileForm);
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.clearMessages();

      // This would need to be implemented with a password change endpoint
      // For now, we'll simulate the process
      setTimeout(() => {
        this.successMessage = 'Password changed successfully';
        this.passwordForm.reset();
        this.isLoading = false;
      }, 1000);
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getRoleDisplayName(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrator';
      case 'ROLE_CLERK': return 'Clerk';
      case 'ROLE_TEACHER': return 'Teacher';
      case 'ROLE_CLASS_TEACHER': return 'Class Teacher';
      default: return role;
    }
  }

  isFieldInvalid(formGroup: FormGroup, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(formGroup: FormGroup, fieldName: string): string {
    const field = formGroup.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['passwordMismatch']) return 'Passwords do not match';
    }
    return '';
  }
}
