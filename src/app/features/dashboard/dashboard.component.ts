import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

interface DashboardStat {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  route: string;
}

interface UserInfo {
  name: string;
  roles: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userInfo: UserInfo = { name: '', roles: [] };
  dashboardStats: DashboardStat[] = [];
  recentActivities: any[] = [];
  upcomingEvents: any[] = [];
  isLoading = true;
  userRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserInfo();
    
    // Wait a moment to simulate loading data
    setTimeout(() => {
      this.loadDashboardData();
      this.isLoading = false;
    }, 500);
  }

  loadUserInfo(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRoles = user.roles || [];
        this.userInfo.name = user.username;
        this.userInfo.roles = user.roles;
      }
    });
  }

  loadDashboardData(): void {
    // Show different stats based on user role
    if (this.userRoles.includes('ROLE_ADMIN') || this.userRoles.includes('ROLE_CLERK')) {
      this.loadAdminDashboard();
    } else if (this.userRoles.includes('ROLE_TEACHER')) {
      this.loadTeacherDashboard();
    }

    // Load activities and events (common for all roles)
    this.loadActivitiesAndEvents();
  }

  loadAdminDashboard(): void {
    // Example stats for admin/clerk
    this.dashboardStats = [
      {
        icon: 'school',
        label: 'Total Students',
        value: 582,
        color: '#3f51b5',
        route: '/students'
      },
      {
        icon: 'person',
        label: 'Teachers',
        value: 47,
        color: '#f50057',
        route: '/teachers'
      },
      {
        icon: 'groups',
        label: 'Classes',
        value: 24,
        color: '#ff9800',
        route: '/classes'
      },
      {
        icon: 'book',
        label: 'Subjects',
        value: 35,
        color: '#4caf50',
        route: '/subjects'
      }
    ];
  }

  loadTeacherDashboard(): void {
    // Example stats for teachers
    this.dashboardStats = [
      {
        icon: 'class',
        label: 'My Classes',
        value: 4,
        color: '#3f51b5',
        route: '/my-classes'
      },
      {
        icon: 'group',
        label: 'My Students',
        value: 120,
        color: '#f50057',
        route: '/my-classes'
      },
      {
        icon: 'assignment',
        label: 'Pending Assessments',
        value: 12,
        color: '#ff9800',
        route: '/assessments'
      },
      {
        icon: 'event',
        label: 'Upcoming Events',
        value: 3,
        color: '#4caf50',
        route: '/events'
      }
    ];
  }

  loadActivitiesAndEvents(): void {
    // Fake recent activities for demo purposes
    this.recentActivities = [
      {
        id: 1,
        type: 'assessment',
        description: 'Mathematics Assessment scores uploaded',
        timestamp: new Date(new Date().getTime() - 30 * 60000), // 30 minutes ago
        user: 'John Smith'
      },
      {
        id: 2,
        type: 'attendance',
        description: 'Attendance marked for Form 3A',
        timestamp: new Date(new Date().getTime() - 2 * 3600000), // 2 hours ago
        user: 'Sarah Johnson'
      },
      {
        id: 3,
        type: 'report',
        description: 'End of term reports generated for Form 4',
        timestamp: new Date(new Date().getTime() - 1 * 86400000), // 1 day ago
        user: 'Admin'
      },
      {
        id: 4,
        type: 'student',
        description: 'New student registered: Alice Walker',
        timestamp: new Date(new Date().getTime() - 2 * 86400000), // 2 days ago
        user: 'Jane Doe'
      }
    ];

    // Fake upcoming events
    this.upcomingEvents = [
      {
        id: 1,
        title: 'End of Term Exams',
        date: new Date(new Date().getTime() + 7 * 86400000), // 7 days from now
        location: 'All Classes'
      },
      {
        id: 2,
        title: 'Parent-Teacher Meeting',
        date: new Date(new Date().getTime() + 14 * 86400000), // 14 days from now
        location: 'School Hall'
      },
      {
        id: 3,
        title: 'Staff Development Day',
        date: new Date(new Date().getTime() + 21 * 86400000), // 21 days from now
        location: 'Conference Room'
      }
    ];
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return `${diffSec} seconds ago`;
    } else if (diffMin < 60) {
      return `${diffMin} minutes ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hours ago`;
    } else {
      return `${diffDay} days ago`;
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}
