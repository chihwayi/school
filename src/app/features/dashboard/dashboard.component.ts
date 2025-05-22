import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Student } from '../../models/student.model';
import { Teacher } from '../../models/teacher.model';
import { ClassGroup } from '../../models/class.model';
import { Subject } from '../../models/subject.model';
import { TeacherSubjectClass } from '../../models/teacher.model';
import { Assessment } from '../../models/assessment.model';
import { forkJoin, catchError, of } from 'rxjs';
import { AssessmentService } from '../../core/services/assessment.service';
import { ClassService } from '../../core/services/class.service';
import { StudentService } from '../../core/services/student.service';
import { SubjectService } from '../../core/services/subject.service';
import { TeacherService } from '../../core/services/teacher.service';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  oLevelStudents: number;
  aLevelStudents: number;
  recentAssessments: Assessment[];
  assignedClasses?: TeacherSubjectClass[];
  supervisedClasses?: ClassGroup[];
}

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  currentUser: any;
  schoolInfo: any;
  stats: DashboardStats = {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    oLevelStudents: 0,
    aLevelStudents: 0,
    recentAssessments: []
  };
currentDate!: string|number|Date;

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private classService: ClassService,
    private subjectService: SubjectService,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.schoolInfo = this.authService.getSchoolInfo();
    this.loadDashboardData();
    this.currentDate = new Date(); 
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    if (this.hasRole('ADMIN') || this.hasRole('CLERK')) {
      this.loadAdminClerkDashboard();
    } else if (this.hasRole('TEACHER') || this.hasRole('CLASS_TEACHER')) {
      this.loadTeacherDashboard();
    } else {
      this.loading = false;
      this.error = 'Unauthorized access';
    }
  }

  private loadAdminClerkDashboard(): void {
    forkJoin({
      students: this.studentService.getAllStudents().pipe(catchError(err => of([]))),
      teachers: this.teacherService.getAllTeachers().pipe(catchError(err => of([]))),
      classes: this.classService.getAllClassGroups().pipe(catchError(err => of([]))),
      subjects: this.subjectService.getAllSubjects().pipe(catchError(err => of([])))
    }).subscribe({
      next: (data) => {
        this.stats.totalStudents = data.students.length;
        this.stats.totalTeachers = data.teachers.length;
        this.stats.totalClasses = data.classes.length;
        this.stats.totalSubjects = data.subjects.length;
        
        // Calculate O-Level and A-Level students
        this.stats.oLevelStudents = data.students.filter(s => s.level === 'O-LEVEL').length;
        this.stats.aLevelStudents = data.students.filter(s => s.level === 'A-LEVEL').length;
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
        console.error('Dashboard error:', error);
      }
    });
  }

  private loadTeacherDashboard(): void {
    forkJoin({
      assignedClasses: this.teacherService.getAssignedSubjectsAndClasses().pipe(catchError(err => of([]))),
      supervisedClasses: this.teacherService.getSupervisedClasses().pipe(catchError(err => of([])))
    }).subscribe({
      next: (data) => {
        this.stats.assignedClasses = data.assignedClasses;
        this.stats.supervisedClasses = data.supervisedClasses;
        this.stats.totalClasses = data.assignedClasses.length;
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load teacher dashboard data';
        this.loading = false;
        console.error('Teacher dashboard error:', error);
      }
    });
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(`ROLE_${role}`);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isClerk(): boolean {
    return this.hasRole('CLERK');
  }

  isTeacher(): boolean {
    return this.hasRole('TEACHER') || this.hasRole('CLASS_TEACHER');
  }

  getWelcomeMessage(): string {
    const user = this.currentUser;
    if (!user) return 'Welcome to the School Management System';
    
    const roles = user.roles || [];
    if (roles.includes('ROLE_ADMIN')) {
      return `Welcome back, Administrator ${user.username}`;
    } else if (roles.includes('ROLE_CLERK')) {
      return `Welcome back, ${user.username}`;
    } else if (roles.includes('ROLE_CLASS_TEACHER')) {
      return `Welcome back, Class Teacher ${user.username}`;
    } else if (roles.includes('ROLE_TEACHER')) {
      return `Welcome back, Teacher ${user.username}`;
    }
    
    return `Welcome back, ${user.username}`;
  }

  retry(): void {
    this.loadDashboardData();
  }
}