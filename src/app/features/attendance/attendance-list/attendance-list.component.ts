import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClassService } from '../../../core/services/class.service';
import { Attendance } from '../../../models/attendance.model';
import { ClassGroup } from '../../../models/class.model';

@Component({
  selector: 'app-attendance-list',
  standalone: false,
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.scss'
})
export class AttendanceListComponent implements OnInit {
  attendanceRecords: Attendance[] = [];
  classes: ClassGroup[] = [];
  selectedDate: string = '';
  selectedClass: string = '';
  loading = false;
  error: string | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private classService: ClassService,
    private authService: AuthService,
    private router: Router
  ) {
    // Set default date to today
    this.selectedDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadTodayAttendance();
  }

  loadClasses(): void {
    this.classService.getAllClassGroups().subscribe({
      next: (classes) => {
        this.classes = classes;
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        this.error = 'Failed to load classes';
      }
    });
  }

  loadTodayAttendance(): void {
    if (this.selectedDate) {
      this.loading = true;
      this.attendanceService.getAttendanceByDate(this.selectedDate).subscribe({
        next: (records) => {
          this.attendanceRecords = records;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading attendance:', error);
          this.error = 'Failed to load attendance records';
          this.loading = false;
        }
      });
    }
  }

  onDateChange(): void {
    this.loadTodayAttendance();
  }

  navigateToMarkAttendance(): void {
    this.router.navigate(['/attendance/mark']);
  }

  viewStudentAttendance(studentId: number): void {
    this.router.navigate(['/attendance/student', studentId]);
  }

  getAttendanceRate(): number {
    if (this.attendanceRecords.length === 0) return 0;
    const presentCount = this.attendanceRecords.filter(record => record.present).length;
    return Math.round((presentCount / this.attendanceRecords.length) * 100);
  }

  getPresentCount(): number {
    return this.attendanceRecords.filter(record => record.present).length;
  }

  getAbsentCount(): number {
    return this.attendanceRecords.filter(record => !record.present).length;
  }

  canMarkAttendance(): boolean {
    return this.authService.hasRole('TEACHER') || this.authService.hasRole('ADMIN') || this.authService.hasRole('CLERK');
  }

  trackByRecordId(index: number, record: Attendance): number {
    return record.id;
  }
}
