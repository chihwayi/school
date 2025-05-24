import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ClassService } from '../../../core/services/class.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { ClassGroup } from '../../../models/class.model';
import { Teacher } from '../../../models/teacher.model';

@Component({
  selector: 'app-class-form',
  standalone: false,
  templateUrl: './class-form.component.html',
  styleUrl: './class-form.component.scss'
})
export class ClassFormComponent implements OnInit, OnDestroy {
  classForm!: FormGroup;
  teachers: Teacher[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  isEditMode = false;
  classId: number | null = null;
  
  // Form options
  formOptions = ['Form 1', 'Form 2', 'Form 3', 'Form 4', 'Form 5', 'Form 6'];
  currentYear = new Date().getFullYear();
  yearOptions = [
    this.currentYear.toString(),
    (this.currentYear + 1).toString(),
    (this.currentYear - 1).toString()
  ];
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private teacherService: TeacherService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadTeachers();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.classForm = this.fb.group({
      form: ['', [Validators.required]],
      section: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9\s]+$/)]],
      academicYear: [this.currentYear.toString(), [Validators.required]],
      classTeacherId: ['']
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.classId = Number(id);
      this.loadClassForEdit();
    }
  }

  private loadTeachers(): void {
    this.teacherService.getAllTeachers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teachers) => {
          this.teachers = teachers;
        },
        error: (error) => {
          console.error('Failed to load teachers:', error);
        }
      });
  }

  private loadClassForEdit(): void {
    if (!this.classId) return;
    
    this.loading = true;
    this.classService.getClassGroupById(this.classId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classGroup) => {
          this.classForm.patchValue({
            form: classGroup.form,
            section: classGroup.section,
            academicYear: classGroup.academicYear,
            classTeacherId: classGroup.classTeacher?.id || ''
          });
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load class details: ' + error.message;
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.classForm.valid && !this.saving) {
      this.saving = true;
      this.error = null;
      
      const formData = this.classForm.value;
      const classData: Partial<ClassGroup> = {
        form: formData.form,
        section: formData.section,
        academicYear: formData.academicYear
      };

      if (this.isEditMode && this.classId) {
        this.updateClass(classData);
      } else {
        this.createClass(classData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createClass(classData: Partial<ClassGroup>): void {
    this.classService.createClassGroup(classData as ClassGroup)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdClass) => {
          if (this.classForm.value.classTeacherId) {
            this.assignClassTeacher(createdClass.id, this.classForm.value.classTeacherId);
          } else {
            this.handleSuccess('Class created successfully!');
          }
        },
        error: (error) => {
          this.error = 'Failed to create class: ' + error.message;
          this.saving = false;
        }
      });
  }

  private updateClass(classData: Partial<ClassGroup>): void {
    if (!this.classId) return;
    
    this.classService.updateClassGroup(this.classId, classData as ClassGroup)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedClass) => {
          if (this.classForm.value.classTeacherId) {
            this.assignClassTeacher(updatedClass.id, this.classForm.value.classTeacherId);
          } else {
            this.handleSuccess('Class updated successfully!');
          }
        },
        error: (error) => {
          this.error = 'Failed to update class: ' + error.message;
          this.saving = false;
        }
      });
  }

  private assignClassTeacher(classId: number, teacherId: number): void {
    this.classService.assignClassTeacher(classId, teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.handleSuccess(this.isEditMode ? 'Class updated successfully!' : 'Class created successfully!');
        },
        error: (error) => {
          this.error = 'Class saved but failed to assign teacher: ' + error.message;
          this.saving = false;
        }
      });
  }

  private handleSuccess(message: string): void {
    this.saving = false;
    // You might want to show a success message here
    this.router.navigate(['/classes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.classForm.controls).forEach(key => {
      const control = this.classForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.classForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.classForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} contains invalid characters`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      form: 'Form',
      section: 'Section',
      academicYear: 'Academic Year',
      classTeacherId: 'Class Teacher'
    };
    return labels[fieldName] || fieldName;
  }

  cancel(): void {
    this.router.navigate(['/classes']);
  }

  generateSectionSuggestions(): string[] {
    return ['A', 'B', 'C', 'D', 'E', 'Red', 'Blue', 'Green', 'Yellow', 'Orange'];
  }
}
