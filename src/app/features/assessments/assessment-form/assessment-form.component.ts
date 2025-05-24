import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AssessmentService } from '../../../core/services/assessment.service';
import { StudentService } from '../../../core/services/student.service';
import { TeacherService } from '../../../core/services/teacher.service';
import { AssessmentDTO, AssessmentType, AssessmentUpdate } from '../../../models/assessment.model';
import { Student } from '../../../models/student.model';
import { TeacherSubjectClass } from '../../../models/teacher.model';

@Component({
  selector: 'app-assessment-form',
  standalone: false,
  templateUrl: './assessment-form.component.html',
  styleUrl: './assessment-form.component.scss'
})
export class AssessmentFormComponent implements OnInit, OnDestroy {
  assessmentForm!: FormGroup;
  isEditMode = false;
  loading = true;
  submitting = false;
  error: string | null = null;
  assessmentId: number | null = null;
  
  teacherSubjectClasses: TeacherSubjectClass[] = [];
  studentsInClass: Student[] = [];
  selectedSubjectClass: TeacherSubjectClass | null = null;
  availableYears: string[] = [];
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private assessmentService: AssessmentService,
    private teacherService: TeacherService,
    private studentService: StudentService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.initializeYears();
    this.checkIfEditMode();
    this.loadTeacherSubjectClasses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.assessmentForm = this.fb.group({
      subjectClass: ['', Validators.required],
      studentSubjectId: ['', Validators.required],
      title: ['', Validators.required],
      type: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      score: ['', [Validators.required, Validators.min(0)]],
      maxScore: ['', [Validators.required, Validators.min(1)]],
      term: ['', Validators.required],
      academicYear: [new Date().getFullYear().toString(), Validators.required]
    });

    // Add cross-field validation for score vs maxScore
    this.assessmentForm.get('score')?.valueChanges.subscribe(() => {
      this.validateScore();
    });
    this.assessmentForm.get('maxScore')?.valueChanges.subscribe(() => {
      this.validateScore();
    });
  }

  private validateScore(): void {
    const scoreControl = this.assessmentForm.get('score');
    const maxScoreControl = this.assessmentForm.get('maxScore');
    
    if (scoreControl && maxScoreControl && scoreControl.value > maxScoreControl.value) {
      scoreControl.setErrors({ max: true });
    } else if (scoreControl?.errors?.['max']) {
      const errors = { ...scoreControl.errors };
      delete errors['max'];
      scoreControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }

  private initializeYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.availableYears.push((currentYear - i).toString());
    }
  }

  private checkIfEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.assessmentId = Number(id);
      this.loadAssessment();
    } else {
      this.loading = false;
    }
  }

  private loadTeacherSubjectClasses(): void {
    this.teacherService.getAssignedSubjectsAndClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.teacherSubjectClasses = classes;
        },
        error: (error) => {
          console.error('Failed to load teacher subject classes:', error);
        }
      });
  }

  private loadAssessment(): void {
    // This would need to be implemented in the backend
    // For now, we'll just set loading to false
    this.loading = false;
  }

  onSubjectClassChange(): void {
    const subjectClassId = this.assessmentForm.get('subjectClass')?.value;
    this.selectedSubjectClass = this.teacherSubjectClasses.find(sc => sc.id === Number(subjectClassId)) || null;
    
    if (this.selectedSubjectClass) {
      this.loadStudentsInClass();
    } else {
      this.studentsInClass = [];
    }
    
    // Reset student selection
    this.assessmentForm.patchValue({ studentSubjectId: '' });
  }

  private loadStudentsInClass(): void {
    if (!this.selectedSubjectClass) return;
    
    this.studentService.getStudentsByClass(
      this.selectedSubjectClass.form,
      this.selectedSubjectClass.section
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (students) => {
          this.studentsInClass = students;
        },
        error: (error) => {
          console.error('Failed to load students:', error);
        }
      });
  }

  getStudentSubjectId(student: Student): number {
    // This would need to be implemented properly
    // For now, return a placeholder
    return student.id;
  }

  getPercentage(): number {
    const score = this.assessmentForm.get('score')?.value;
    const maxScore = this.assessmentForm.get('maxScore')?.value;
    
    if (score !== null && maxScore && maxScore > 0) {
      return Math.round((score / maxScore) * 100);
    }
    return 0;
  }

  onSubmit(): void {
    if (this.assessmentForm.valid) {
      this.submitting = true;
      this.error = null;
      
      const formValue = this.assessmentForm.value;
      
      if (this.isEditMode) {
        this.updateAssessment(formValue);
      } else {
        this.createAssessment(formValue);
      }
    }
  }

  private createAssessment(formValue: any): void {
    const assessmentDTO: AssessmentDTO = {
      studentSubjectId: formValue.studentSubjectId,
      title: formValue.title,
      date: formValue.date,
      score: formValue.score,
      maxScore: formValue.maxScore,
      type: formValue.type as AssessmentType,
      term: formValue.term,
      academicYear: formValue.academicYear
    };

    this.assessmentService.recordAssessment(assessmentDTO)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/assessments']);
        },
        error: (error) => {
          this.error = 'Failed to record assessment: ' + error.message;
          this.submitting = false;
        }
      });
  }

  private updateAssessment(formValue: any): void {
    if (!this.assessmentId) return;
    
    const assessmentUpdate: AssessmentUpdate = {
      title: formValue.title,
      date: formValue.date,
      score: formValue.score,
      maxScore: formValue.maxScore
    };

    this.assessmentService.updateAssessment(this.assessmentId, assessmentUpdate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/assessments']);
        },
        error: (error) => {
          this.error = 'Failed to update assessment: ' + error.message;
          this.submitting = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/assessments']);
  }
}
