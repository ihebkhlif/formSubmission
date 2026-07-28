import { Component, Inject } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-reason-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './reason-dialog.html',
  styleUrl: './reason-dialog.scss',
})
export class ReasonDialog {
constructor(
    public dialogRef: MatDialogRef<ReasonDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
