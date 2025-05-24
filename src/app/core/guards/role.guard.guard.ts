import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, take, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredRoles = route.data['roles'] as string[];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }

        // Check if user has any of the required roles
        // Handle both with and without ROLE_ prefix
        const hasRequiredRole = requiredRoles.some(role => {
          const roleWithPrefix = `ROLE_${role.toUpperCase()}`;
          const roleWithoutPrefix = role.toUpperCase();
          
          return user.roles.includes(roleWithPrefix) || 
                 user.roles.includes(roleWithoutPrefix) ||
                 user.roles.includes(role);
        });

        if (!hasRequiredRole) {
          console.log('Access denied. User roles:', user.roles, 'Required roles:', requiredRoles);
          this.router.navigate(['/unauthorized']);
          return false;
        }

        return true;
      })
    );
  }
}