import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';

import { Submission } from '../../models/submission';
import { SubmissionService } from '../../services/SubmissionService';


@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule
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


  constructor(
    private submissionService: SubmissionService
  ) { }


  ngOnInit(): void {

    this.submissionService.getAllSubmissions()
      .subscribe({

        next: (data) => {

          console.log(data);

          this.dataSource.data = data;

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

}