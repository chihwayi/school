import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/login']);
        return false;
      }

      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const userRoles = user.roles.map((r: string) => r.toUpperCase());

      const hasRequiredRole = requiredRoles.some(role => {
        const roleWithPrefix = `ROLE_${role.toUpperCase()}`;
        return (
          userRoles.includes(role.toUpperCase()) ||
          userRoles.includes(roleWithPrefix)
        );
      });

      if (!hasRequiredRole) {
        console.warn('Access denied. User roles:', user.roles, 'Required roles:', requiredRoles);
        router.navigate(['/unauthorized']);
        return false;
      }

      return true;
    })
  );
};
