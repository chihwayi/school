import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { StudentService } from '../../../core/services/student.service';
import { Attendance } from '../../../models/attendance.model';
import { Student } from '../../../models/student.model';

@Component({
  selector: 'app-student-attendance',
  standalone: false,
  templateUrl: './student-attendance.component.html',
  styleUrls: ['./student-attendance.component.scss']
})
export class StudentAttendanceComponent implements OnInit {
  student: Student | null = null;
  attendanceRecords: Attendance[] = [];
  filteredAttendance: Attendance[] = [];
  attendanceSummary = {
    present: 0,
    absent: 0,
    percentage: 0
  };
  
  selectedMonth: string = '';
  selectedYear: string = '';
  selectedStatus: string = '';
  
  months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];
  
  availableYears: string[] = [];
  loading = false;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  recordsPerPage = 10;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attendanceService: AttendanceService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const now = new Date();
      this.selectedMonth = '';
      this.selectedYear = now.getFullYear().toString();
      this.getStudent(+id);
      this.getAttendance(+id);
    } else {
      this.error = 'Invalid student ID';
    }
  }

  getStudent(id: number): void {
    this.loading = true;
    this.studentService.getStudentById(id).subscribe({
      next: (student) => {
        this.student = student;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load student details';
        this.loading = false;
      }
    });
  }

  getAttendance(id: number): void {
    this.loading = true;
    this.attendanceService.getAttendanceByStudent(id).subscribe({
      next: (records) => {
        this.attendanceRecords = records;
        this.extractYears();
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load attendance records';
        this.loading = false;
      }
    });
  }

  extractYears(): void {
    const years = this.attendanceRecords.map(r => new Date(r.date).getFullYear().toString());
    this.availableYears = Array.from(new Set(years)).sort((a, b) => +b - +a);
  }

  applyFilters(): void {
    let filtered = [...this.attendanceRecords];

    if (this.selectedMonth) {
      filtered = filtered.filter(r => new Date(r.date).getMonth() + 1 === +this.selectedMonth);
    }
    if (this.selectedYear) {
      filtered = filtered.filter(r => new Date(r.date).getFullYear().toString() === this.selectedYear);
    }
    if (this.selectedStatus) {
      filtered = filtered.filter(r => this.selectedStatus === 'present' ? r.present : !r.present);
    }

    this.filteredAttendance = filtered;
    this.calculateSummary();
    this.totalPages = Math.ceil(this.filteredAttendance.length / this.recordsPerPage);
    this.goToPage(1);
  }

  clearFilters(): void {
    this.selectedMonth = '';
    this.selectedYear = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  calculateSummary(): void {
    const total = this.filteredAttendance.length;
    const present = this.filteredAttendance.filter(r => r.present).length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    this.attendanceSummary = { present, absent, percentage };
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;

    const start = (page - 1) * this.recordsPerPage;
    const end = start + this.recordsPerPage;
    this.filteredAttendance = [...this.attendanceRecords]
      .filter(r => this.passesFilters(r))
      .slice(start, end);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  passesFilters(record: Attendance): boolean {
    const date = new Date(record.date);
    return (!this.selectedMonth || date.getMonth() + 1 === +this.selectedMonth) &&
           (!this.selectedYear || date.getFullYear().toString() === this.selectedYear) &&
           (!this.selectedStatus || (this.selectedStatus === 'present') === record.present);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  }

  getDayName(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long' });
  }

  getMonthName(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'long' });
  }

  getYear(dateStr: string): string {
    return new Date(dateStr).getFullYear().toString();
  }

  exportAttendance(): void {
    const data = this.filteredAttendance.map(r => ({
      Date: this.formatDate(r.date),
      Day: this.getDayName(r.date),
      Status: r.present ? 'Present' : 'Absent',
      Month: this.getMonthName(r.date),
      Year: this.getYear(r.date)
    }));

    const csvContent = [
      ['Date', 'Day', 'Status', 'Month', 'Year'],
      ...data.map(r => [r.Date, r.Day, r.Status, r.Month, r.Year])
    ]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'attendance.csv';
    link.click();
  }
}
