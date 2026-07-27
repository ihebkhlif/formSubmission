import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';


import { SubmissionService }
  from '../../services/SubmissionService';

import { Submission } from '../../models/submission';

import { dateRangeValidator }
  from '../../validators/date.validator';

import { minDateValidator }
  from '../../validators/min-date.validator';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule, CommonModule, MatSelectModule, MatInputModule, MatFormFieldModule, MatDatepickerModule, MatIconModule, MatDividerModule, MatButtonModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form {

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private submissionService: SubmissionService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeName: ['', Validators.required],
      startDate: ['', [Validators.required, minDateValidator]],
      endDate: ['', Validators.required],
      leaveType: ['', Validators.required],
      reason: ['', Validators.required]
    }, {
      validators: dateRangeValidator
    });
  }

  onSubmit() {



    this.submissionService
      .createSubmission(this.form.value as Submission)
      .subscribe({

        next: response => {

          console.log(response);

        },

        error: err => {

          console.error(err);

        }

      });

  }
}

