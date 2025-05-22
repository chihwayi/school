import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SchoolSetupComponent } from './features/auth/school-setup/school-setup.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { HeaderComponent } from './layouts/header/header.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { SidebarComponent } from './layouts/sidebar/sidebar.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClassesComponent } from './features/classes/classes.component';
import { AssessmentsComponent } from './features/assessments/assessments.component';
import { ReportsComponent } from './features/reports/reports.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SubjectListComponent } from './features/subjects/subject-list/subject-list.component';
import { SubjectFormComponent } from './features/subjects/subject-form/subject-form.component';
import { StudentListComponent } from './features/students/student-list/student-list.component';
import { StudentFormComponent } from './features/students/student-form/student-form.component';
import { StudentDetailComponent } from './features/students/student-detail/student-detail.component';
import { SubjectDetailComponent } from './features/subjects/subject-detail/subject-detail.component';
import { TeacherListComponent } from './features/teachers/teacher-list/teacher-list.component';
import { TeacherFormComponent } from './features/teachers/teacher-form/teacher-form.component';

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
    ClassesComponent,
    AssessmentsComponent,
    ReportsComponent,
    SubjectListComponent,
    SubjectFormComponent,
    StudentListComponent,
    StudentFormComponent,
    StudentDetailComponent,
    SubjectDetailComponent,
    TeacherListComponent,
    TeacherFormComponent
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
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
