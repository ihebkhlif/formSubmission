import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

import { SubmissionService } from '../../services/SubmissionService';
import { EmployeeService } from '../../services/employee.service';
import { Submission } from '../../models/submission';
import { Employee } from '../../models/employee';
import { dateRangeValidator } from '../../validators/date.validator';
import { minDateValidator } from '../../validators/min-date.validator';

@Component({
  selector: 'app-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form implements OnInit {

  form!: FormGroup;
  employees: Employee[] = [];
  existingSubmissions: Submission[] = [];
  selectedEmployee: Employee | null = null;

  requestedDays = 0;
  creditLimitExceeded = false;
  hasOverlap = false;
  overlapMessage = '';
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private submissionService: SubmissionService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeName: ['', Validators.required],
      startDate: ['', [Validators.required, minDateValidator]],
      endDate: ['', Validators.required],
      leaveType: ['', Validators.required],
      reason: ['',]
    }, {
      validators: dateRangeValidator
    });

    this.loadEmployees();
    this.loadSubmissions();

    this.form.valueChanges.subscribe(() => {
      this.checkLeaveCreditLimit();
    });
  }

  loadEmployees() {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to load employees', err);
      }
    });
  }

  loadSubmissions() {
    this.submissionService.getAllSubmissions().subscribe({
      next: (subs) => {
        this.existingSubmissions = subs.filter(s => s.status !== 'Rejected');
        this.checkLeaveCreditLimit();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load submissions', err)
    });
  }

  onEmployeeSelect(employeeName: string) {
    this.selectedEmployee = this.employees.find(e => e.name === employeeName) || null;
    this.checkLeaveCreditLimit();
  }

  checkLeaveCreditLimit() {
    this.errorMessage = '';
    this.creditLimitExceeded = false;
    this.hasOverlap = false;
    this.overlapMessage = '';

    const startDateVal = this.form.get('startDate')?.value;
    const endDateVal = this.form.get('endDate')?.value;

    if (startDateVal && endDateVal) {
      const start = new Date(startDateVal);
      const end = new Date(endDateVal);

      if (end >= start) {
        const diffTime = end.getTime() - start.getTime();
        this.requestedDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1;

        if (this.selectedEmployee && this.selectedEmployee.remainingCredit !== undefined) {
          if (this.requestedDays > this.selectedEmployee.remainingCredit) {
            this.creditLimitExceeded = true;
          }
        }

        // Overlap Check
        if (this.selectedEmployee) {
          const startStr = this.normalizeDateStr(startDateVal);
          const endStr = this.normalizeDateStr(endDateVal);
          const empName = this.selectedEmployee.name.toLowerCase();

          for (const sub of this.existingSubmissions) {
            if (sub.employeeName && sub.employeeName.toLowerCase() === empName) {
              const subStart = this.normalizeDateStr(sub.startDate);
              const subEnd = this.normalizeDateStr(sub.endDate);

              if (startStr <= subEnd && endStr >= subStart) {
                this.hasOverlap = true;
                this.overlapMessage = `Overlapping Leave Request! ${this.selectedEmployee.name} already has an active leave from ${subStart} to ${subEnd}.`;
                break;
              }
            }
          }
        }
      } else {
        this.requestedDays = 0;
      }
    } else {
      this.requestedDays = 0;
    }
  }

  private normalizeDateStr(val: any): string {
    if (!val) return '';
    if (typeof val === 'string' && val.length >= 10) {
      return val.substring(0, 10);
    }
    const d = new Date(val);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit() {
    if (this.isSubmitting) return;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.hasOverlap) {
      this.errorMessage = this.overlapMessage;
      return;
    }

    if (this.creditLimitExceeded) {
      this.errorMessage = `Cannot submit: Requested ${this.requestedDays} day(s) exceeds ${this.selectedEmployee?.name}'s remaining annual credit (${this.selectedEmployee?.remainingCredit} day(s) left).`;
      return;
    }

    this.isSubmitting = true;

    // Convert dates to yyyy-MM-dd strings to prevent UTC timezone shift
    const formValue = { ...this.form.value };
    if (formValue.startDate) {
      formValue.startDate = this.normalizeDateStr(formValue.startDate);
    }
    if (formValue.endDate) {
      formValue.endDate = this.normalizeDateStr(formValue.endDate);
    }

    this.submissionService
      .createSubmission(formValue as Submission)
      .subscribe({
        next: response => {
          console.log(response);
          this.router.navigate(['/request-list']);
        },
        error: err => {
          console.error(err);
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || "Error submitting leave request. Please check limits.";
        }
      });
  }
}

