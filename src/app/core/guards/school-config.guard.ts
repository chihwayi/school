import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SchoolService } from '../services/school.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const schoolConfigGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const schoolService = inject(SchoolService);
  const router = inject(Router);

  return schoolService.checkSchoolConfiguration().pipe(
    map(response => {
      if (response.configured) {
        return true;
      } else {
        router.navigate(['/setup']);
        return false;
      }
    }),
    catchError(error => {
      if (error.status === 412) {
        router.navigate(['/setup']);
        return of(false);
      }
      return of(true); // allow route if other error (fallback)
    })
  );
};
