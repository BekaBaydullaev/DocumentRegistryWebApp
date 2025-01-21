import { AfterViewInit, Component, inject, OnInit, ViewChild } from "@angular/core";
import { DocumentService } from "../../service/document-registry.service";
import { DocumentData } from "../../data/document-data.interface";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../shared-components/material.module";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { DocumentFormComponent } from "../document-form/document-form.component";
import { DocumentPrintComponent } from "../document-print/document-print.component";
import { NotificationType } from "../../data/notification-dialog.interface";
import { NotificationService } from "../../service/notification-dialog.service";


@Component({
    selector: "app-document-list",
    imports: [
        CommonModule,
        MaterialModule],
    templateUrl: "./document-list.component.html",
    styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    protected readonly documentService = inject(DocumentService);
    protected readonly dialog = inject(MatDialog);
    protected readonly notificationService = inject(NotificationService);
    
    clickedRows = new Set<DocumentData>();
    dataSource = new MatTableDataSource<DocumentData>([]);
    selectedRowIndex: number | null = null;
    displayedColumns: string[] = [
        'file',
        'regNumber',
        'regDate',
        'docNumber',
        'docDate',
        'correspondent',
        'subject',
        'actions'
    ]

    currentRowIndex = -1;

    ngOnInit() {
        this.loadDocuments();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }
    
    loadDocuments() {
        this.documentService.getDocuments()
        .subscribe({
            next: (docs) => {
                this.dataSource.data = docs;
              }, 
            error: (err) => 
                this.notificationService.showNotification(
                    NotificationType.Error,
                    'Ошибка при загрузке документов: ' + err,
                    'Ошибка'
                  )
        });
    }

    addDocument(): void {
        this.openDialogWindow(0);
    }
    
    
    editDocument(doc: DocumentData): void {
        this.openDialogWindow(1, doc);
    }

    openDialogWindow(popupMode: number, doc?: DocumentData): void {
        // popupMode: 0 - Add, 1 - Edit
        const dialogWindow = this.dialog.open(DocumentFormComponent,
        {
            width: '600px',
            height: '600px',
        });
        dialogWindow.componentInstance.popupMode = popupMode;
        dialogWindow.componentInstance.documentId = doc?.id ?? null;
        dialogWindow.afterClosed().subscribe((result: boolean) => {
          if (result) {
            this.loadDocuments();
          }
        });
    }
    
    openFile(doc: DocumentData): void {
        if (doc.filePath) {
          // Construct the full URL to the file
          const fileUrl = `http://localhost:3000${doc.filePath}`; 
          window.open(fileUrl, '_blank'); // Opens the file in a new browser tab
        } else {
            this.notificationService.showNotification(
                NotificationType.Error,
                'Нет соответствующего документа: ',
                'Ошибка'
              );
        }
    }

    openPrintDialog(doc: DocumentData): void {
        const documentData = this.prepareDocumentDataForPrint(doc);
    
        this.dialog.open(DocumentPrintComponent, {
        width: '800px',
        height: '800px',
        data: documentData
        });
    }
      

    deleteDocument(doc: DocumentData) {
        if (!doc.id) return;
      
        this.notificationService.showConfirmation(
          `Вы уверены, что хотите удалить документ "${doc.subject}"?`,
          'Подтвердите удаление'
        ).subscribe((confirmed: boolean) => {
          if (!confirmed) return;
      
          this.documentService.deleteDocument(doc.id!).subscribe({
            next: () => {
              this.notificationService.showNotification(
                NotificationType.Success,
                `Документ "${doc.subject}" успешно удалён.`,
                'Успех'
              );
              this.loadDocuments();
            },
            error: (err) => {
              this.notificationService.showNotification(
                NotificationType.Error,
                `Ошибка при удалении документа "${doc.subject}": ` + err,
                'Ошибка'
              );
            }
          });
        });
      }
      

    prepareDocumentDataForPrint(doc: DocumentData): any {
        const formValues = doc;
      
        return {
          regNumber: formValues.regNumber,
          regDate: this.formatDate(formValues.regDate),
          docNumber: formValues.docNumber || '—',
          docDate: this.formatDate(formValues.docDate),
          deliveryType: formValues.deliveryType || 'Не указан',
          correspondent: formValues.correspondent || 'Не указан',
          subject: formValues.subject,
          description: formValues.description || 'Нет описания',
          dueDate: this.formatDate(formValues.dueDate),
          isAccessible: formValues.isAccessible ? 'Да' : 'Нет',
          isUnderControl: formValues.isUnderControl ? 'Да' : 'Нет',
          filePath: formValues.filePath
        };
    }
      
    formatDate(date: any): string {
        if (!date) {
            return '—'; // Default for missing dates
        }
        
        const parsedDate = new Date(date);
        return parsedDate.toLocaleDateString('en-EN', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.dataSource.data?.length) return;

        // Initialize selection if none exists
        if (this.currentRowIndex === -1) {
            this.currentRowIndex = 0; // Select first row
            event.preventDefault();
            return;
        }
        if (event.key === 'ArrowDown') {
            this.currentRowIndex =
                (this.currentRowIndex + 1) % this.dataSource.data.length;
            event.preventDefault();
        } else if (event.key === 'ArrowUp') {
            this.currentRowIndex =
                (this.currentRowIndex - 1 + this.dataSource.data.length) %
                this.dataSource.data.length;
            event.preventDefault();
        }
    }

    isRowSelected(row: DocumentData): boolean {
        return this.dataSource.data.indexOf(row) === this.currentRowIndex;
    }
}