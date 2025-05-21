import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SchoolService } from '../services/school.service';


@Injectable({
  providedIn: 'root'
})
export class SchoolConfigGuard implements CanActivate {
  
  constructor(private schoolService: SchoolService, private router: Router) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    
    return this.schoolService.checkSchoolConfiguration().pipe(
      map(response => {
        if (response.configured) {
          return true;
        } else {
          this.router.navigate(['/setup']);
          return false;
        }
      }),
      catchError(error => {
        if (error.status === 412) {
          this.router.navigate(['/setup']);
          return of(false);
        }
        return of(true);
      })
    );
  }
}
