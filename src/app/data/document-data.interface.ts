export interface DocumentData {
    id?: number;
    regNumber: string;
    regDate: Date;
    docNumber?: string;
    docDate?: Date;
    deliveryType?: string;
    correspondent: string;
    subject: string;
    description?: string;
    dueDate?: Date;
    isAccessible: boolean;
    isUnderControl: boolean;
    fileName?: string;
    fileUrl?: string;    // full URL if stored somewhere accessible
  }