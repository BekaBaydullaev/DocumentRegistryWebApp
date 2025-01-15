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


@Component({
    selector: "app-document-list",
    imports: [
        CommonModule,
        MaterialModule],
    templateUrl: "./document-list.component.html",
})
export class DocumentListComponent implements OnInit, AfterViewInit {
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    protected readonly documentService = inject(DocumentService);
    protected readonly dialog = inject(MatDialog);
    
    clickedRows = new Set<DocumentData>();
    dataSource = new MatTableDataSource<DocumentData>([]);
    displayedColumns: string[] = [
        'file',
        'regNumber',
        'regDate',
        'docNumber',
        'docDate',
        'correspondent',
        'subject',
    ]

    constructor() {
        console.log("DocumentListComponent created");
    }
    ngOnInit() {
        
        this.loadDocuments();
    }

    ngAfterViewInit(): void {
        // debugger;
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
    
    printRegistry(): void {

        console.log('Printing...');

        window.open('/print-registry', '_blank');

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
          alert('No file attached or file URL not set.');
        }
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
}