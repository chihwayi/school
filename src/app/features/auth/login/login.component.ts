import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SchoolService } from '../../../core/services/school.service';
import { SchoolConfig } from '../../../models/school-config.model';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  schoolConfig: SchoolConfig | null = null;
  setupRequired = false;
  hidePassword = true;
  isBrowser: boolean;
  apiBaseUrl: string = environment.apiUrl;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private schoolService: SchoolService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check if the code is running in a browser
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.checkSchoolSetup();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  private checkSchoolSetup(): void {
    this.isLoading = true;
    this.schoolService.checkSchoolConfiguration()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          if (!response.configured) {
            this.setupRequired = true;
          } else if (response.school) {
            this.schoolConfig = response.school;
            this.applySchoolTheme();
          }
        },
        error: (error) => {
          if (error.status === 412) {
            this.setupRequired = true;
          }
        }
      });
  }

  // Get full URL for resources stored on the server
  getFullResourceUrl(path: string | undefined): string {
    if (!path) return '';
    // If the path already starts with http or https, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // Make sure the path starts with a slash
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // Combine with API base URL to get the full URL
    return `${this.apiBaseUrl}${normalizedPath}`;
  }

  private applySchoolTheme(): void {
    if (!this.schoolConfig || !this.isBrowser) return;

    console.log('Applying school theme with:', this.schoolConfig);

    // Only manipulate DOM when running in the browser
    // Apply primary and secondary colors to CSS variables
    if (this.schoolConfig.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', this.schoolConfig.primaryColor);
      console.log('Set primary color:', this.schoolConfig.primaryColor);
    }
    
    if (this.schoolConfig.secondaryColor) {
      document.documentElement.style.setProperty('--secondary-color', this.schoolConfig.secondaryColor);
      console.log('Set secondary color:', this.schoolConfig.secondaryColor);
    }
    
    // Apply background image if available
    if (this.schoolConfig.backgroundPath) {
      const fullBackgroundUrl = this.getFullResourceUrl(this.schoolConfig.backgroundPath);
      const bgUrl = `url("${fullBackgroundUrl}")`;
      document.documentElement.style.setProperty('--login-bg-image', bgUrl);
      console.log('Set background image:', bgUrl);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest = {
      usernameOrEmail: this.loginForm.get('usernameOrEmail')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.authService.login(loginRequest)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          // If login successful, redirect to dashboard
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          if (error.status === 412) {
            this.setupRequired = true;
          } else {
            this.errorMessage = error.message || 'Invalid credentials. Please try again.';
          }
        }
      });
  }

  navigateToSetup(): void {
    this.router.navigate(['/setup']);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}