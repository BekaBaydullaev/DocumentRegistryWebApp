import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MaterialModule } from '../../shared-components/material.module';

@Component({
  selector: 'app-document-print',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule,
    MatDialogModule
  ],
  templateUrl: './document-print.component.html',
  styleUrls: ['./document-print.component.css']
})
export class DocumentPrintComponent implements OnInit {
  fileUrl: SafeResourceUrl | null = null;

  constructor(
    private dialogRef: MatDialogRef<DocumentPrintComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
  }

  onPrint(): void {
    window.print();
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
