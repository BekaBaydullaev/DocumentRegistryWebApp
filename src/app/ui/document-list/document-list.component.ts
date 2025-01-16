import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from "@angular/core";
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
            error: (err) => console.error('Failed to load documents', err)
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
            if (doc.filePath.startsWith('data:')) {
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(
                        '<iframe width="100%" height="100%" src="' + doc.filePath + '"></iframe>'
                    );
                }
            } else {
                window.open(doc.filePath, '_blank');
            }
        } else {
            alert('No file attached or file URL not set.');
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
      

    deleteDocument(id: number | undefined) {
        if (!id) return;
        if (confirm('Are you sure you want to delete this document?')) {
            this.documentService.deleteDocument(id).subscribe({
            next: (res) => {
                console.log('Delete success', res);
                // reload the list
                this.loadDocuments();
            },
            error: (err) => console.error('Delete error', err)
            });
        }
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