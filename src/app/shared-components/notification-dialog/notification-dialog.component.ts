import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificationDialogData, NotificationType } from '../../data/notification-dialog.interface';
import { MaterialModule } from '../material.module';

@Component({
  selector: 'app-notification-dialog',
  imports: [CommonModule, MaterialModule],
  templateUrl: './notification-dialog.component.html',
  styleUrl: './notification-dialog.component.scss'
})
export class NotificationDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NotificationDialogData,
    private dialogRef: MatDialogRef<NotificationDialogComponent>
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  // Optional: A small helper for icon or color logic based on "type"
  getIconName(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'error':   return 'error';
      case 'warning': return 'warning';
      default:        return 'info';
    }
  }

  getTypeColor(): string {
    switch (this.data.type) {
      case 'success': return '#4caf50';
      case 'error':   return '#f44336';
      case 'warning': return '#ff9800';
      default:        return '#2196f3';
    }
  }

  getBackgroundColor(): string {
    switch (this.data.type) {
      case 'success': return '#e8f5e9';
      case 'error': return '#ffebee';
      case 'warning': return '#fff3e0';
      default: return '#e3f2fd';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  showConfirmButtons(): boolean {
    return this.data.type === NotificationType.Confirm;
  }
}