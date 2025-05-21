import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SchoolSetupComponent } from './features/auth/school-setup/school-setup.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { RoleGuard } from './core/guards/role.guard.guard';

const routes: Routes = [
  // Public routes
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'setup',
    component: SchoolSetupComponent
  },
  
  // Protected routes inside the main layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      
      // Student routes
      {
        path: 'students',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'CLERK', 'TEACHER'] },
        children: [
          { 
            path: '', 
            // component: StudentListComponent // Add this when created
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: StudentFormComponent // Add this when created
          },
          { 
            path: ':id', 
            // component: StudentDetailComponent // Add this when created
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: StudentFormComponent // Add this when created
          }
        ]
      },
      
      // Teacher routes
      {
        path: 'teachers',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'CLERK', 'TEACHER'] },
        children: [
          { 
            path: '', 
            // component: TeacherListComponent // Add this when created
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: TeacherFormComponent // Add this when created
          },
          { 
            path: ':id', 
            // component: TeacherDetailComponent // Add this when created
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: TeacherFormComponent // Add this when created
          }
        ]
      },
      
      // Class routes
      {
        path: 'classes',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'CLERK', 'TEACHER'] },
        children: [
          { 
            path: '', 
            // component: ClassListComponent // Add this when created
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: ClassFormComponent // Add this when created
          },
          { 
            path: ':id', 
            // component: ClassDetailComponent // Add this when created
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: ClassFormComponent // Add this when created
          }
        ]
      },
      
      // Subject routes
      {
        path: 'subjects',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'CLERK', 'TEACHER'] },
        children: [
          { 
            path: '', 
            // component: SubjectListComponent // Add this when created 
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: SubjectFormComponent // Add this when created
          },
          { 
            path: ':id', 
            // component: SubjectDetailComponent // Add this when created
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            // component: SubjectFormComponent // Add this when created
          }
        ]
      },
      
      // Assessment routes
      {
        path: 'assessments',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'CLERK', 'TEACHER'] },
        children: [
          { 
            path: '', 
            // component: AssessmentListComponent // Add this when created
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['TEACHER'] },
            // component: AssessmentFormComponent // Add this when created
          },
          { 
            path: ':id', 
            // component: AssessmentDetailComponent // Add this when created
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['TEACHER'] },
            // component: AssessmentFormComponent // Add this when created
          }
        ]
      },
      
      // Reports routes
      {
        path: 'reports',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'CLERK', 'TEACHER'] },
        children: [
          { 
            path: '', 
            // component: ReportListComponent // Add this when created
          },
          { 
            path: 'student/:id', 
            // component: StudentReportComponent // Add this when created
          },
          { 
            path: 'class/:id', 
            // component: ClassReportComponent // Add this when created
          }
        ]
      },
      
      // Attendance routes
      {
        path: 'attendance',
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'CLERK', 'TEACHER'] },
        children: [
          { 
            path: '', 
            // component: AttendanceListComponent // Add this when created
          },
          { 
            path: 'mark', 
            // component: MarkAttendanceComponent // Add this when created
          },
          { 
            path: 'student/:id', 
            // component: StudentAttendanceComponent // Add this when created
          }
        ]
      },
      
      // Profile routes
      {
        path: 'profile',
        canActivate: [AuthGuard],
        // component: UserProfileComponent // Add this when created
      },
      
      // Unauthorized route
      {
        path: 'unauthorized',
        // component: UnauthorizedComponent // Add this when created
      },
      
      // Default route
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  
  // Fallback route
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
