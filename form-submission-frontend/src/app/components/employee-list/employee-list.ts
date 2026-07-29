import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.scss'
})
export class EmployeeList implements OnInit {

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];

  searchQuery = '';
  selectedTeam = '';

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Failed to load employees', err)
    });
  }

  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      const matchesSearch = !this.searchQuery ||
        emp.name.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesTeam = !this.selectedTeam ||
        emp.workTeam === this.selectedTeam;

      return matchesSearch && matchesTeam;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedTeam = '';
    this.applyFilters();
  }

  confirmDelete(emp: Employee): void {
    const ref = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to permanently delete <strong>${emp.name}</strong>? This action cannot be undone.`,
        confirmLabel: 'Delete',
        isDanger: true
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed && emp.id) {
        this.employeeService.deleteEmployee(emp.id).subscribe({
          next: () => this.loadEmployees(),
          error: (err) => console.error('Failed to delete employee', err)
        });
      }
    });
  }

  getTeamClass(team: string): string {
    switch (team.toUpperCase()) {
      case 'DEV': return 'team-dev';
      case 'DEVOPS': return 'team-devops';
      case 'TESTING': return 'team-testing';
      case 'MARKETING': return 'team-marketing';
      default: return 'team-dev';
    }
  }

  getCreditPercent(emp: Employee): number {
    if (!emp.annualCredit || emp.annualCredit === 0) return 0;
    const remaining = emp.remainingCredit ?? emp.annualCredit;
    return Math.min(100, Math.max(0, Math.round((remaining / emp.annualCredit) * 100)));
  }
}
