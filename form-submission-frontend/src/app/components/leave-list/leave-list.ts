import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { Submission } from '../../models/submission';
import { Employee } from '../../models/employee';
import { SubmissionService } from '../../services/SubmissionService';
import { EmployeeService } from '../../services/employee.service';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { ReasonDialog } from '../reason-dialog/reason-dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface LeaveFilter {
  employeeName: string;
  status: string; // '' = all
  date: string | null;
}

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
    RouterLink,
    FormsModule
],
  templateUrl: './leave-list.html',
  styleUrl: './leave-list.scss'
})
export class LeaveList implements OnInit {

  displayedColumns: string[] = [
    'employeeName',
    'leaveType',
    'startDate',
    'endDate',
    'status',
    'submittedAt',
    'reason'
  ];

  dataSource = new MatTableDataSource<Submission>([]);
  employeesMap: Map<string, Employee> = new Map();

  filter: LeaveFilter = {
    employeeName: '',
    status: '',
    date: ''
  };

  selectedDate: Date | null = null;

  constructor(
    private submissionService: SubmissionService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private ReasonDialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        employees.forEach(emp => this.employeesMap.set(emp.name.toLowerCase(), emp));
        this.cdr.markForCheck();
      }
    });

    this.submissionService.getAllSubmissions()
      .subscribe({

        next: (data) => {

          console.log(data);

          this.dataSource.data = data;
          this.cdr.markForCheck();

        },

        error: (err) => {

          console.error(err);

        }

      });

      this.dataSource.filterPredicate = (element: Submission, filterStr: string): boolean => {
      const f: LeaveFilter = JSON.parse(filterStr);

      const matchesName = !f.employeeName ||
        element.employeeName.toLowerCase().includes(f.employeeName.toLowerCase());

      const matchesStatus = !f.status || element.status === f.status;

      const matchesDate = !f.date ||
        this.toDateString(element.startDate) === f.date;
      return matchesName && matchesStatus && matchesDate;
    };
    
  }
  applyFilter() {
    this.dataSource.filter = JSON.stringify(this.filter);
  }

  // Normalizes any date-like value (string, Date) to 'yyyy-MM-dd' for exact comparison
private toDateString(value: string | Date): string {
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
onDateChange(picked: Date | null) {
  this.selectedDate = picked;
  this.filter.date = picked ? this.toDateString(picked) : '';
  this.applyFilter();
}

  clearFilters() {
    this.filter = { employeeName: '', status: '', date: '' };
    this.selectedDate = null;
    this.applyFilter();
  }


  getStatusClass(status: string | undefined): string {

    switch (status) {
      case 'Waiting_For_Approval':
        return 'waiting';
      case 'Approved':
        return 'approved';
      case 'Rejected':
        return 'rejected';
      default:
        return '';
    }
  }

  private refreshRowStatus(id: string, status: string | undefined): void {
    this.dataSource.data = this.dataSource.data.map((item) =>
      item.id === id ? { ...item, status } : item
    );
  }


  confirmStatusChange(request: Submission, newStatus: string) {

    const previousStatus = request.status;

    if (request.status === newStatus) {
        return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {

        data: {

            oldStatus: request.status,

            newStatus: newStatus

        }

    });

    dialogRef.afterClosed().subscribe(result => {

        if (!result) {

            this.refreshRowStatus(request.id!, previousStatus);
            return;

        }

        const updatedRequest: Submission = {
          ...request,
          status: newStatus
        };

        this.refreshRowStatus(request.id!, newStatus);

        this.submissionService
            .updateSubmission(request.id!, updatedRequest)
            .subscribe({
              error: () => this.refreshRowStatus(request.id!, previousStatus)
            });

    });

}
openDialog(element : Submission) {
    const dialogRef = this.dialog.open(ReasonDialog, {
      width: '500px',
      data: { reason: element.reason,
              employeeName: element.employeeName,
       }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}

