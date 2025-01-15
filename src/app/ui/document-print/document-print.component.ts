import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-document-print',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-print.component.html',
  styleUrls: ['./document-print.component.css']
})
export class DocumentPrintComponent {
  constructor(
    public dialogRef: MatDialogRef<DocumentPrintComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
