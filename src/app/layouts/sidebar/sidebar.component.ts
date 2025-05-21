import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface SidebarMenuItem {
  icon: string;
  label: string;
  route: string;
  roles?: string[];
}

interface SidebarMenuGroup {
  title: string;
  items: SidebarMenuItem[];
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  @Input() isExpanded = true;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  
  isLoggedIn = false;
  userRoles: string[] = [];
  menuGroups: SidebarMenuGroup[] = [];
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Listen for auth state changes
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userRoles = user.roles || [];
        this.setupMenuItems();
      }
    });
  }

  get currentUrl(): string {
  return this.router.url;
}
  
  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    this.toggleSidebar.emit(this.isExpanded);
  }
  
  hasRole(roles?: string[]): boolean {
    if (!roles || roles.length === 0) return true;
    return roles.some(role => this.userRoles.includes(`ROLE_${role.toUpperCase()}`));
  }
  
  setupMenuItems(): void {
    this.menuGroups = [
      {
        title: 'Main',
        items: [
          { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' }
        ]
      },
      {
        title: 'Management',
        roles: ['ADMIN', 'CLERK'],
        items: [
          { icon: 'school', label: 'Students', route: '/students', roles: ['ADMIN', 'CLERK'] },
          { icon: 'person', label: 'Teachers', route: '/teachers', roles: ['ADMIN', 'CLERK'] },
          { icon: 'groups', label: 'Classes', route: '/classes', roles: ['ADMIN', 'CLERK'] },
          { icon: 'book', label: 'Subjects', route: '/subjects', roles: ['ADMIN', 'CLERK'] },
          { icon: 'admin_panel_settings', label: 'Users', route: '/users', roles: ['ADMIN'] }
        ]
      },
      {
        title: 'Teacher',
        roles: ['TEACHER'],
        items: [
          { icon: 'class', label: 'My Classes', route: '/my-classes', roles: ['TEACHER'] }
        ]
      },
      {
        title: 'Academic',
        items: [
          { icon: 'assignment', label: 'Assessments', route: '/assessments' },
          { icon: 'description', label: 'Reports', route: '/reports' },
          { icon: 'event_available', label: 'Attendance', route: '/attendance' }
        ]
      },
      {
        title: 'Settings',
        items: [
          { icon: 'account_circle', label: 'Profile', route: '/profile' },
          { icon: 'settings', label: 'Settings', route: '/settings', roles: ['ADMIN'] }
        ]
      }
    ];
  }
}