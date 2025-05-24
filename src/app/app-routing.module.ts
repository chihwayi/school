import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SchoolSetupComponent } from './features/auth/school-setup/school-setup.component';
import { AuthGuard } from './core/guards/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { RoleGuard } from './core/guards/role.guard.guard';
import { StudentListComponent } from './features/students/student-list/student-list.component';
import { SubjectListComponent } from './features/subjects/subject-list/subject-list.component';
import { SubjectFormComponent } from './features/subjects/subject-form/subject-form.component';
import { StudentDetailComponent } from './features/students/student-detail/student-detail.component';
import { StudentFormComponent } from './features/students/student-form/student-form.component';
import { SubjectDetailComponent } from './features/subjects/subject-detail/subject-detail.component';
import { TeacherListComponent } from './features/teachers/teacher-list/teacher-list.component';
import { TeacherFormComponent } from './features/teachers/teacher-form/teacher-form.component';
import { ClassListComponent } from './features/classes/class-list/class-list.component';
import { ClassFormComponent } from './features/classes/class-form/class-form.component';
import { ClassDetailComponent } from './features/classes/class-detail/class-detail.component';
import { TeacherDetailComponent } from './features/teachers/teacher-detail/teacher-detail.component';
import { AssessmentDetailComponent } from './features/assessments/assessment-detail/assessment-detail.component';
import { AssessmentFormComponent } from './features/assessments/assessment-form/assessment-form.component';
import { AssessmentListComponent } from './features/assessments/assessment-list/assessment-list.component';
import { AttendanceListComponent } from './features/attendance/attendance-list/attendance-list.component';
import { MarkAttendanceComponent } from './features/attendance/mark-attendance/mark-attendance.component';
import { StudentAttendanceComponent } from './features/attendance/student-attendance/student-attendance.component';
import { ReportListComponent } from './features/reports/report-list/report-list.component';
import { StudentReportComponent } from './features/reports/student-report/student-report.component';
import { ClassReportComponent } from './features/reports/class-report/class-report.component';
import { UserProfileComponent } from './features/profile/user-profile/user-profile.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized/unauthorized.component';

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
            component: StudentListComponent 
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: StudentFormComponent
          },
          { 
            path: ':id', 
            component: StudentDetailComponent 
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: StudentFormComponent 
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
            component: TeacherListComponent
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: TeacherFormComponent
          },
          { 
            path: ':id', 
            component: TeacherDetailComponent
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: TeacherFormComponent
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
            component: ClassListComponent
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: ClassFormComponent
          },
          { 
            path: ':id', 
            component: ClassDetailComponent
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: ClassFormComponent
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
            component: SubjectListComponent
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: SubjectFormComponent 
          },
          { 
            path: ':id', 
            component: SubjectDetailComponent 
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['ADMIN', 'CLERK'] },
            component: SubjectFormComponent
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
            component: AssessmentListComponent 
          },
          { 
            path: 'new', 
            canActivate: [RoleGuard],
            data: { roles: ['TEACHER'] },
            component: AssessmentFormComponent 
          },
          { 
            path: ':id', 
            component: AssessmentDetailComponent 
          },
          { 
            path: ':id/edit',
            canActivate: [RoleGuard],
            data: { roles: ['TEACHER'] },
            component: AssessmentFormComponent 
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
            component: ReportListComponent
          },
          { 
            path: 'student/:id', 
            component: StudentReportComponent
          },
          { 
            path: 'class/:id', 
            component: ClassReportComponent 
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
            component: AttendanceListComponent 
          },
          { 
            path: 'mark', 
            component: MarkAttendanceComponent
          },
          { 
            path: 'student/:id', 
            component: StudentAttendanceComponent
          }
        ]
      },
      
      // Profile routes
      {
        path: 'profile',
        canActivate: [AuthGuard],
        component: UserProfileComponent 
      },
      
      // Unauthorized route
      {
        path: 'unauthorized',
        component: UnauthorizedComponent 
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
