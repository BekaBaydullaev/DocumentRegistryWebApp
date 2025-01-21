export enum NotificationType {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Confirm = 'confirm'
}

export interface NotificationDialogData {
    type: NotificationType;
    message: string;
    header?: string;
}