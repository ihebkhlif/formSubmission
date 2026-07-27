import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Submission } from '../../models/submission';
import { SubmissionService } from '../../services/SubmissionService';
import { MatTableModule } from '@angular/material/table';


@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './leave-request.html',
  styleUrls: ['./leave-request.scss']
})
export class LeaveRequest {

  @Input()
  request!: Submission;


  constructor(
    private submissionService: SubmissionService
  ) { }


}