import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { SubjectService } from '../../../core/services/subject.service';
import { Student, StudentRegistration, StudentUpdate, StudentLevel } from '../../../models/student.model';
import { Subject } from '../../../models/subject.model';

@Component({
  selector: 'app-student-form',
  standalone: false,
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  studentForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  studentId: number | null = null;
  availableSubjects: Subject[] = [];
  selectedSubjects: Subject[] = [];
  currentStudent: Student | null = null;

  // Form options
  studentLevels = Object.values(StudentLevel);
  oLevelForms = ['Form 1', 'Form 2', 'Form 3', 'Form 4'];
  aLevelForms = ['Form 5', 'Form 6'];
  sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private subjectService: SubjectService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadSubjects();
    this.checkEditMode();
    this.setupFormSubscriptions();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      studentId: ['', [Validators.required]],
      level: ['', [Validators.required]],
      form: ['', [Validators.required]],
      section: ['', [Validators.required]]
    });
  }

  private setupFormSubscriptions(): void {
    // Watch level changes to update available forms
    this.studentForm.get('level')?.valueChanges.subscribe(level => {
      this.studentForm.get('form')?.setValue('');
      this.filterSubjectsByLevel(level);
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.studentId = parseInt(id, 10);
      this.loadStudentData();
    }
  }

  private loadStudentData(): void {
    if (!this.studentId) return;

    this.isLoading = true;
    this.studentService.getStudentById(this.studentId).subscribe({
      next: (student) => {
        this.currentStudent = student;
        this.populateForm(student);
        this.loadStudentSubjects();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.isLoading = false;
      }
    });
  }

  private populateForm(student: Student): void {
    this.studentForm.patchValue({
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId,
      level: student.level,
      form: student.form,
      section: student.section
    });
  }

  private loadStudentSubjects(): void {
    if (!this.studentId) return;

    this.studentService.getStudentSubjects(this.studentId).subscribe({
      next: (subjects) => {
        this.selectedSubjects = subjects;
      },
      error: (error) => {
        console.error('Error loading student subjects:', error);
      }
    });
  }

  private loadSubjects(): void {
    this.subjectService.getAllSubjects().subscribe({
      next: (subjects) => {
        this.availableSubjects = subjects;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
      }
    });
  }

  private filterSubjectsByLevel(level: string): void {
    if (level) {
      this.subjectService.getSubjectsByLevel(level).subscribe({
        next: (subjects) => {
          this.availableSubjects = subjects;
        },
        error: (error) => {
          console.error('Error filtering subjects:', error);
        }
      });
    }
  }

  get availableForms(): string[] {
    const level = this.studentForm.get('level')?.value;
    return level === StudentLevel.OLEVEL ? this.oLevelForms : this.aLevelForms;
  }

  get filteredAvailableSubjects(): Subject[] {
    return this.availableSubjects.filter(subject => 
      !this.selectedSubjects.some(selected => selected.id === subject.id)
    );
  }

  onSubjectSelect(subject: Subject): void {
    if (!this.selectedSubjects.some(s => s.id === subject.id)) {
      this.selectedSubjects.push(subject);
    }
  }

  removeSubject(subject: Subject): void {
    this.selectedSubjects = this.selectedSubjects.filter(s => s.id !== subject.id);
  }

  onSubmit(): void {
    if (this.studentForm.valid) {
      this.isLoading = true;
      
      if (this.isEditMode) {
        this.updateStudent();
      } else {
        this.createStudent();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createStudent(): void {
    const formValue = this.studentForm.value;
    const studentData: StudentRegistration = {
      ...formValue,
      subjectIds: this.selectedSubjects.map(s => s.id)
    };

    this.studentService.createStudent(studentData).subscribe({
      next: (student) => {
        console.log('Student created successfully:', student);
        this.router.navigate(['/students']);
      },
      error: (error) => {
        console.error('Error creating student:', error);
        this.isLoading = false;
      }
    });
  }

  private updateStudent(): void {
    if (!this.studentId) return;

    const formValue = this.studentForm.value;
    const studentData: StudentUpdate = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      form: formValue.form,
      section: formValue.section,
      level: formValue.level
    };

    this.studentService.updateStudent(this.studentId, studentData).subscribe({
      next: (student) => {
        console.log('Student updated successfully:', student);
        this.updateSubjectAssignments();
      },
      error: (error) => {
        console.error('Error updating student:', error);
        this.isLoading = false;
      }
    });
  }

  private updateSubjectAssignments(): void {
    if (!this.studentId) return;

    // Get current student subjects first
    this.studentService.getStudentSubjects(this.studentId).subscribe({
      next: (currentSubjects) => {
        const currentSubjectIds = currentSubjects.map(s => s.id);
        const selectedSubjectIds = this.selectedSubjects.map(s => s.id);

        // Find subjects to add and remove
        const subjectsToAdd = selectedSubjectIds.filter(id => !currentSubjectIds.includes(id));
        const subjectsToRemove = currentSubjectIds.filter(id => !selectedSubjectIds.includes(id));

        // Process removals and additions
        this.processSubjectChanges(subjectsToAdd, subjectsToRemove);
      },
      error: (error) => {
        console.error('Error getting current subjects:', error);
        this.isLoading = false;
      }
    });
  }

  private processSubjectChanges(toAdd: number[], toRemove: number[]): void {
    const removePromises = toRemove.map(subjectId => 
      this.studentService.removeSubjectFromStudent(this.studentId!, subjectId)
    );

    const addPromises = toAdd.map(subjectId => 
      this.studentService.assignSubjectToStudent(this.studentId!, subjectId)
    );

    // Execute all promises
    Promise.all([...removePromises, ...addPromises]).then(() => {
      this.isLoading = false;
      this.router.navigate(['/students']);
    }).catch(error => {
      console.error('Error updating subject assignments:', error);
      this.isLoading = false;
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.studentForm.controls).forEach(key => {
      const control = this.studentForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.studentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }
}
