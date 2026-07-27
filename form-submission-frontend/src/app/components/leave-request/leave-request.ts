import { Component } from '@angular/core';
import { Form } from '../form/form';


@Component({
  selector: 'app-leave-request',
  standalone: true,
  imports: [Form],
  templateUrl: './leave-request.html',
  styleUrls: ['./leave-request.scss']
})
export class LeaveRequest {
}