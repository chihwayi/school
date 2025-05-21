import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from API
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        if (error.status === 412 && !request.url.includes('/setup')) {
          // School setup required
          this.router.navigate(['/setup']);
        }

        // Extract error message
        const errorMessage = error.error?.message || error.statusText || 'Unknown error';
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}