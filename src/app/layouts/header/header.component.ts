import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SchoolService } from '../../core/services/school.service';
import { Subscription } from 'rxjs';
import { SchoolConfig } from '../../models/school-config.model';
import { environment } from '../../../environments/environment';
import { initBootstrapDropdowns } from '../../shared/utils/bootstrap-utils';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() sidebarExpanded: boolean = false; // New input property to track sidebar state
  
  isLoggedIn = false;
  username: string = '';
  userRoles: string[] = [];
  schoolInfo: Partial<SchoolConfig> | null = null;
  private subscription = new Subscription();
  apiBaseUrl: string = environment.apiUrl;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    private schoolService: SchoolService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user) {
          this.username = user.username;
          this.userRoles = user.roles || [];
        }
      })
    );

    // Subscribe to school info changes
    this.subscription.add(
      this.authService.schoolInfo$.subscribe(info => {
        this.schoolInfo = info;
      })
    );
  }

  ngAfterViewInit(): void {
    initBootstrapDropdowns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle sidebar expanded state changes
    if (changes['sidebarExpanded']) {
      // You can add any additional logic here if needed when sidebar state changes
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(`ROLE_${role.toUpperCase()}`);
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
  
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}