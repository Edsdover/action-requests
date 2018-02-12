import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-close-confirmation',
  templateUrl: './close-confirmation.component.html',
  styleUrls: ['./close-confirmation.component.css']
})
export class CloseConfirmationComponent {

  constructor(
    public dialogRef: MatDialogRef<CloseConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  cancel(): void {
    this.dialogRef.close();
  }

}
