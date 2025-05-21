import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { LoginRequest, LoginResponse, RegisterRequest, ApiResponse } from '../../models/auth.model';
import { SchoolConfig } from '../../models/school-config.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<any>(null);
  private schoolInfoSubject = new BehaviorSubject<Partial<SchoolConfig> | null>(null);
  private isBrowser: boolean;
  
  currentUser$ = this.currentUserSubject.asObservable();
  schoolInfo$ = this.schoolInfoSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    // Only access localStorage in the browser
    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const school = localStorage.getItem('school');
      
      if (token && user) {
        this.currentUserSubject.next(JSON.parse(user));
        
        if (school) {
          this.schoolInfoSubject.next(JSON.parse(school));
        }
      }
    }
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          // Store token and user info - only in browser
          if (this.isBrowser) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({
              username: response.username,
              roles: response.roles
            }));
            
            // Store school info if available
            if (response.school) {
              localStorage.setItem('school', JSON.stringify(response.school));
              this.schoolInfoSubject.next(response.school as Partial<SchoolConfig>);
            }
          }
          
          this.currentUserSubject.next({
            username: response.username,
            roles: response.roles
          });
        }),
        catchError(this.handleError)
      );
  }

  register(registerRequest: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/register`, registerRequest)
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    // Clear local storage - only in browser
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('school');
    }
    
    // Reset subjects
    this.currentUserSubject.next(null);
    this.schoolInfoSubject.next(null);
  }

  getToken(): string | null {
    // Only access localStorage in the browser
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getSchoolInfo(): Partial<SchoolConfig> | null {
    return this.schoolInfoSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  checkSchoolSetup(): Observable<{ configured: boolean, school?: SchoolConfig }> {
    return this.http.get<{ configured: boolean, school?: SchoolConfig }>(`${this.apiUrl}/check-school-setup`)
      .pipe(
        tap(response => {
          if (response.school) {
            this.schoolInfoSubject.next(response.school);
          }
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}