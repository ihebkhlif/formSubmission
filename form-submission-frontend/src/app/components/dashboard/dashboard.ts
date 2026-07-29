import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { SubmissionService } from '../../services/SubmissionService';
import { EmployeeService } from '../../services/employee.service';
import { Submission } from '../../models/submission';
import { Employee } from '../../models/employee';
import { ReasonDialog } from '../reason-dialog/reason-dialog';

export interface LeaveEvent {
  submission: Submission;
  employeeName: string;
  workTeam: string;
  leaveType: string;
  status: string;
  isStartDay: boolean;
  isEndDay: boolean;
}

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateString: string; // yyyy-MM-dd
  events: LeaveEvent[];
}

@Component({
  selector: 'app-dashboard',
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
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  currentDate: Date = new Date();
  monthLabel = '';

  calendarDays: CalendarDay[] = [];
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  allSubmissions: Submission[] = [];
  employeesMap: Map<string, Employee> = new Map();

  // Filters
  selectedTeam = '';
  selectedStatus = '';
  searchQuery = '';

  // KPI Metrics
  totalActiveLeavesThisMonth = 0;
  pendingApprovalsCount = 0;
  totalEmployeesCount = 0;

  constructor(
    private submissionService: SubmissionService,
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.buildCalendar();
    this.loadData();
  }

  loadData(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.totalEmployeesCount = employees.length;
        employees.forEach(emp => this.employeesMap.set(emp.name.toLowerCase(), emp));

        this.submissionService.getAllSubmissions().subscribe({
          next: (submissions) => {
            this.allSubmissions = submissions;
            this.calculateKpis();
            this.buildCalendar();
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Failed to load submissions', err)
        });
      },
      error: (err) => console.error('Failed to load employees', err)
    });
  }

  calculateKpis(): void {
    this.pendingApprovalsCount = this.allSubmissions.filter(s => s.status === 'Waiting_For_Approval').length;
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    this.monthLabel = `${monthNames[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday-based day index: Mon=0, Tue=1, ..., Sun=6
    let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const days: CalendarDay[] = [];
    const todayStr = this.toDateString(new Date());

    // 1. Padding days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push(this.createCalendarDay(d, false, todayStr));
    }

    // 2. Days of current month
    for (let dayNum = 1; dayNum <= lastDayOfMonth.getDate(); dayNum++) {
      const d = new Date(year, month, dayNum);
      days.push(this.createCalendarDay(d, true, todayStr));
    }

    // 3. Padding days for next month to complete grid row (multiple of 7)
    let nextMonthDay = 1;
    while (days.length % 7 !== 0 || days.length < 35) {
      const d = new Date(year, month + 1, nextMonthDay++);
      days.push(this.createCalendarDay(d, false, todayStr));
    }

    this.calendarDays = days;
    this.updateActiveLeavesCount();
  }

  private createCalendarDay(date: Date, isCurrentMonth: boolean, todayStr: string): CalendarDay {
    const dateStr = this.toDateString(date);
    const dayEvents = this.getEventsForDate(date, dateStr);

    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: dateStr === todayStr,
      dateString: dateStr,
      events: dayEvents
    };
  }

  private getEventsForDate(date: Date, dateStr: string): LeaveEvent[] {
    const events: LeaveEvent[] = [];

    for (const sub of this.allSubmissions) {
      if (!sub.startDate || !sub.endDate) continue;

      const startStr = this.normalizeDateStr(sub.startDate);
      const endStr = this.normalizeDateStr(sub.endDate);

      // Skip rejected requests — they should not appear on the calendar
      if (sub.status === 'Rejected') continue;

      // Filter check
      if (this.selectedStatus && sub.status !== this.selectedStatus) continue;

      const emp = this.employeesMap.get(sub.employeeName.toLowerCase());
      const team = emp ? emp.workTeam : 'DEV';

      if (this.selectedTeam && team !== this.selectedTeam) continue;
      if (this.searchQuery && !sub.employeeName.toLowerCase().includes(this.searchQuery.toLowerCase())) continue;

      // Check if date falls within range
      if (dateStr >= startStr && dateStr <= endStr) {
        events.push({
          submission: sub,
          employeeName: sub.employeeName,
          workTeam: team,
          leaveType: sub.leaveType,
          status: sub.status || 'Waiting_For_Approval',
          isStartDay: dateStr === startStr,
          isEndDay: dateStr === endStr
        });
      }
    }

    return events;
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

  updateActiveLeavesCount(): void {
    let count = 0;
    const currentMonthDays = this.calendarDays.filter(d => d.isCurrentMonth);
    currentMonthDays.forEach(d => {
      count += d.events.length;
    });
    this.totalActiveLeavesThisMonth = count;
  }

  applyFilters(): void {
    this.buildCalendar();
  }

  prevMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.buildCalendar();
  }

  openReasonDialog(event: MouseEvent, sub: Submission): void {
    event.stopPropagation();
    this.dialog.open(ReasonDialog, {
      width: '500px',
      data: {
        reason: sub.reason || 'No detailed reason provided.',
        employeeName: sub.employeeName
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      default: return 'status-waiting';
    }
  }

  private toDateString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
