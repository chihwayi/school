import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AttendanceService } from '../../../core/services/attendance.service';
import { AuthService } from '../../../core/services/auth.service';
import { ClassService } from '../../../core/services/class.service';
import { StudentService } from '../../../core/services/student.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ClassGroup } from '../../../models/class.model';
import { Student } from '../../../models/student.model';
import { TeacherSubjectClass } from '../../../models/teacher.model';

interface StudentAttendanceRecord {
  student: Student;
  present: boolean;
  marked: boolean;
}

@Component({
  selector: 'app-mark-attendance',
  standalone: false,
  templateUrl: './mark-attendance.component.html',
  styleUrl: './mark-attendance.component.scss'
})
export class MarkAttendanceComponent implements OnInit {
  classes: ClassGroup[] = [];
  teacherClasses: TeacherSubjectClass[] = [];
  selectedClass: ClassGroup | null = null;
  students: StudentAttendanceRecord[] = [];
  attendanceDate: string = '';
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;
  
  // Bulk actions
  allPresent = false;
  searchTerm = '';

  constructor(
    private attendanceService: AttendanceService,
    private classService: ClassService,
    private studentService: StudentService,
    private teacherService: TeacherService,
    private authService: AuthService,
    private router: Router
  ) {
    // Set default date to today
    this.attendanceDate = new Date().toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.loading = true;
    
    if (this.authService.hasRole('TEACHER')) {
      // Load classes assigned to the current teacher
      this.teacherService.getAssignedSubjectsAndClasses().subscribe({
        next: (assignments) => {
          this.teacherClasses = assignments;
          // Extract unique classes from assignments
          const uniqueClasses = new Map<string, ClassGroup>();
          
          assignments.forEach(assignment => {
            const key = `${assignment.form}-${assignment.section}-${assignment.academicYear}`;
            if (!uniqueClasses.has(key)) {
              uniqueClasses.set(key, {
                id: 0, // Will be fetched when needed
                form: assignment.form,
                section: assignment.section,
                academicYear: assignment.academicYear
              });
            }
          });
          
          this.classes = Array.from(uniqueClasses.values());
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading teacher classes:', error);
          this.error = 'Failed to load your assigned classes';
          this.loading = false;
        }
      });
    } else {
      // Load all classes for admin/clerk
      this.classService.getAllClassGroups().subscribe({
        next: (classes) => {
          this.classes = classes;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading classes:', error);
          this.error = 'Failed to load classes';
          this.loading = false;
        }
      });
    }
  }

  onClassChange(event: any): void {
    const selectedValue = event.target.value;
    if (selectedValue) {
      const [form, section] = selectedValue.split('-');
      this.selectedClass = this.classes.find(c => c.form === form && c.section === section) || null;
      this.loadStudents();
    } else {
      this.selectedClass = null;
      this.students = [];
    }
  }

  loadStudents(): void {
    if (!this.selectedClass) return;

    this.loading = true;
    this.studentService.getStudentsByClass(this.selectedClass.form, this.selectedClass.section).subscribe({
      next: (students) => {
        this.students = students.map(student => ({
          student,
          present: true, // Default to present
          marked: false
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.error = 'Failed to load students for the selected class';
        this.loading = false;
      }
    });
  }

  toggleAllAttendance(): void {
    this.students.forEach(record => {
      record.present = this.allPresent;
    });
  }

  updateAllPresentStatus(): void {
    this.allPresent = this.students.every(record => record.present);
  }

  markAttendance(): void {
    if (!this.selectedClass || !this.attendanceDate) {
      this.error = 'Please select a class and date';
      return;
    }

    this.saving = true;
    this.error = null;
    this.success = null;

    const attendancePromises = this.students.map(record => 
      this.attendanceService.markAttendance(
        record.student.id,
        this.attendanceDate,
        record.present
      ).toPromise()
    );

    Promise.all(attendancePromises)
      .then(() => {
        this.success = 'Attendance marked successfully for all students';
        this.students.forEach(record => record.marked = true);
        this.saving = false;
        
        // Auto-navigate back after success
        setTimeout(() => {
          this.router.navigate(['/attendance']);
        }, 2000);
      })
      .catch((error) => {
        console.error('Error marking attendance:', error);
        this.error = 'Failed to mark attendance. Please try again.';
        this.saving = false;
      });
  }

  getFilteredStudents(): StudentAttendanceRecord[] {
    if (!this.searchTerm) return this.students;
    
    return this.students.filter(record => 
      record.student.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      record.student.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      record.student.studentId.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  getPresentCount(): number {
    return this.students.filter(record => record.present).length;
  }

  getAbsentCount(): number {
    return this.students.filter(record => !record.present).length;
  }

  canMarkAttendance(): boolean {
    return this.students.length > 0 && this.selectedClass !== null && this.attendanceDate !== '';
  }

  goBack(): void {
    this.router.navigate(['/attendance']);
  }

  getMaxDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  trackByStudentId(index: number, record: StudentAttendanceRecord): string {
  return record.student.studentId;
}
}
