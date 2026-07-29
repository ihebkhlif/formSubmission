import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-employee.html',
  styleUrl: './add-employee.scss'
})
export class AddEmployee implements OnInit {
  form!: FormGroup;
  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  workTeams = [
    { value: 'DEV', label: 'Development' },
    { value: 'DEVOPS', label: 'DevOps' },
    { value: 'TESTING', label: 'Testing' },
    { value: 'MARKETING', label: 'Marketing' }
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      workTeam: ['', Validators.required],
      annualCredit: [25, [Validators.required, Validators.min(1), Validators.max(365)]]
    });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.successMessage = '';
    this.errorMessage = '';
    this.isSubmitting = true;

    const employee: Employee = this.form.value as Employee;

    this.employeeService.createEmployee(employee).subscribe({
      next: (created) => {
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to add employee. Please try again.';
      }
    });
  }
}
