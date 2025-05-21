import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SchoolService } from '../../../core/services/school.service';
import { SchoolConfig } from '../../../models/school-config.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-school-setup',
  standalone: false,
  templateUrl: './school-setup.component.html',
  styleUrl: './school-setup.component.scss'
})
export class SchoolSetupComponent implements OnInit {
  setupForm!: FormGroup;
  logoPreview: string | ArrayBuffer | null = null;
  backgroundPreview: string | ArrayBuffer | null = null;
  logoFile: File | null = null;
  backgroundFile: File | null = null;
  isSubmitting = false;
  errorMessage = '';
  setupComplete = false;

  constructor(
    private fb: FormBuilder,
    private schoolService: SchoolService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if school is already configured
    this.schoolService.checkSchoolConfiguration().subscribe({
      next: (response) => {
        if (response.configured) {
          // School already configured, redirect to login
          this.router.navigate(['/login']);
        }
      },
      error: () => {
        // Ignore errors and continue with setup form
      }
    });

    this.initializeForm();
  }

  initializeForm(): void {
    this.setupForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      primaryColor: ['#3f51b5', [Validators.required]],
      secondaryColor: ['#f50057', [Validators.required]],
      contactEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      contactPhone: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(200)]],
      website: ['', [Validators.maxLength(100)]]
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.logoFile = input.files[0];
      this.previewImage(this.logoFile, 'logo');
    }
  }

  onBackgroundSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.backgroundFile = input.files[0];
      this.previewImage(this.backgroundFile, 'background');
    }
  }

  previewImage(file: File, type: 'logo' | 'background'): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        this.logoPreview = reader.result;
      } else {
        this.backgroundPreview = reader.result;
      }
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.setupForm.invalid) {
      this.markFormGroupTouched(this.setupForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const schoolConfig: SchoolConfig = this.setupForm.value;

    this.schoolService.setupSchool(schoolConfig, this.logoFile || undefined, this.backgroundFile || undefined)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: () => {
          this.setupComplete = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to setup school configuration. Please try again.';
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as FormGroup).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
}
