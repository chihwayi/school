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
        let errorMessage = 'An unknown error occurred!';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = 'Bad Request: The request was invalid';
              break;
            case 401:
              // Unauthorized - auto logout
              errorMessage = 'Unauthorized: You need to log in';
              this.authService.logout();
              this.router.navigate(['/login']);
              break;
            case 403:
              // Forbidden - not enough permissions
              errorMessage = 'Forbidden: You don\'t have permission for this action';
              this.router.navigate(['/unauthorized']);
              break;
            case 404:
              errorMessage = 'Not Found: The requested resource was not found';
              break;
            case 500:
              errorMessage = 'Server Error: Please try again later';
              break;
            default:
              errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }
        
        // You can implement a notification service to show these error messages
        console.error(errorMessage);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}