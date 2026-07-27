import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-leave-list',
  imports: [MatTableModule],
  standalone: true,
  templateUrl: './leave-list.html',
  styleUrl: './leave-list.scss',
})
export class LeaveList { }
