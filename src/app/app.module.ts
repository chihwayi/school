import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SchoolSetupComponent } from './features/auth/school-setup/school-setup.component';
import { LoginComponent } from './features/auth/login/login.component';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SubjectListComponent } from './features/subjects/subject-list/subject-list.component';
import { SubjectFormComponent } from './features/subjects/subject-form/subject-form.component';
import { StudentListComponent } from './features/students/student-list/student-list.component';
import { StudentFormComponent } from './features/students/student-form/student-form.component';
import { StudentDetailComponent } from './features/students/student-detail/student-detail.component';
import { SubjectDetailComponent } from './features/subjects/subject-detail/subject-detail.component';
import { TeacherListComponent } from './features/teachers/teacher-list/teacher-list.component';
import { TeacherFormComponent } from './features/teachers/teacher-form/teacher-form.component';
import { TeacherDetailComponent } from './features/teachers/teacher-detail/teacher-detail.component';
import { ClassListComponent } from './features/classes/class-list/class-list.component';
import { ClassFormComponent } from './features/classes/class-form/class-form.component';
import { ClassDetailComponent } from './features/classes/class-detail/class-detail.component';
import { AssessmentListComponent } from './features/assessments/assessment-list/assessment-list.component';
import { AssessmentFormComponent } from './features/assessments/assessment-form/assessment-form.component';
import { AssessmentDetailComponent } from './features/assessments/assessment-detail/assessment-detail.component';
import { ReportListComponent } from './features/reports/report-list/report-list.component';
import { StudentReportComponent } from './features/reports/student-report/student-report.component';
import { AttendanceListComponent } from './features/attendance/attendance-list/attendance-list.component';
import { MarkAttendanceComponent } from './features/attendance/mark-attendance/mark-attendance.component';
import { StudentAttendanceComponent } from './features/attendance/student-attendance/student-attendance.component';
import { ClassReportComponent } from './features/reports/class-report/class-report.component';
import { UserProfileComponent } from './features/profile/user-profile/user-profile.component';
import { UnauthorizedComponent } from './features/unauthorized/unauthorized/unauthorized.component';

@NgModule({
  declarations: [
    AppComponent,
    SchoolSetupComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    MainLayoutComponent,
    DashboardComponent,
    SubjectListComponent,
    SubjectFormComponent,
    StudentListComponent,
    StudentFormComponent,
    StudentDetailComponent,
    SubjectDetailComponent,
    TeacherListComponent,
    TeacherFormComponent,
    TeacherDetailComponent,
    ClassListComponent,
    ClassFormComponent,
    ClassDetailComponent,
    AssessmentListComponent,
    AssessmentFormComponent,
    AssessmentDetailComponent,
    ReportListComponent,
    StudentReportComponent,
    AttendanceListComponent,
    MarkAttendanceComponent,
    StudentAttendanceComponent,
    ClassReportComponent,
    UserProfileComponent,
    UnauthorizedComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
  ],
  providers: [
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    {provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useValue: errorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
