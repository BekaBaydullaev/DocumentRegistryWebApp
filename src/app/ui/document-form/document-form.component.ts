import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../../service/document-registry.service';
import { MaterialModule } from '../../shared-components/material.module';
import { CommonModule } from '@angular/common';
import { mustContainDigitValidator, dueDateNotBeforeRegDateValidator } from '../../shared-components/custom-validators';
import { dateNotInFutureValidator } from '../../shared-components/custom-validators/date-not-in-future.validator';
import { DocumentPrintComponent } from '../document-print/document-print.component';
import { MatDialog } from '@angular/material/dialog';
import { DocumentData } from '../../data/document-data.interface';

@Component({
  selector: 'app-document-form',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './document-form.component.html',
  styleUrl: './document-form.component.css'
})
export class DocumentFormComponent implements OnInit {
  @Output() closeEmitter = new EventEmitter<boolean>();
  @Input() popupMode!: number;
  @Input() documentId!: number | null;

  readonly VALID_FORMATS = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  protected readonly documentService = inject(DocumentService);
  protected readonly formBuilder = inject(FormBuilder);
  protected readonly dialog = inject(MatDialog);

  isSaved?: boolean;
  currentDate!: Date;
  fileError: string | null = null;
  uploadedFilePath: string | null = null;
  uploadedFileName: string | null = null;
  form!: FormGroup;
  corresponendsList: string[] = [
    'ЦБ', 
    'ГНИ', 
    'ТСЖ'
  ];
  deliveryTypes: string[] = [
    'Почта', 
    'Курьер', 
    'Электронная почта'
  ];
  selectedFile?: File;

  constructor() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.currentDate = today;
  }

  ngOnInit(): void {
    this.initForm();
    this.patchValues();
    this.currentDate = new Date();
  }

  initForm() {
    this.form = this.formBuilder.group({
      regNumber: ['', [Validators.required, mustContainDigitValidator()]],
      regDate: [new Date(), [Validators.required]],
      docNumber: ['', mustContainDigitValidator()], 
      docDate: [null, [dateNotInFutureValidator]],
      deliveryType: [null],
      correspondent: ['', Validators.required],
      subject: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(1000)],
      dueDate: [null],
      isAccessible: [false],
      isUnderControl: [false],
      fileName: [null],
      filePath: [null],
    }, {
      validators: [dueDateNotBeforeRegDateValidator()]
    });
  }

  patchValues() {
    if (this.documentId) {
      this.documentService.getDocumentById(this.documentId).subscribe({
        next: (doc) => {
          this.form.patchValue(doc);
        },
        error: (err) => console.error('Failed to load document', err)
      });
    }
  }
  

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const isValidFormat = this.VALID_FORMATS.includes(file.type);
    const isValidSize = file.size <= 1024 * 1024; // 1 MB

    if (!isValidFormat && !isValidSize) {
      this.fileError = 'Недопустимый формат и размер файла';
    } else if (!isValidFormat) {
      this.fileError = 'Недопустимый формат';
    } else if (!isValidSize) {
      this.fileError = 'Размер файла превышает 1Мб';
    } else {
      this.fileError = null;
      this.selectedFile = file;
      this.uploadFile(file);
    }
  }

  uploadFile(file: File) {
    this.documentService.uploadFile(file).subscribe({
      next: (res) => {
        this.form.patchValue({
          fileName: res.fileName,
          filePath: res.filePath
        });
      },
      error: (err) => {
        this.fileError = 'Ошибка загрузки файла: ' + err.message;
      }
    });
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.warn('Form invalid. Errors:', this.form.errors, this.form.value);
      return;
    }

    console.log('Form submitted', this.form.value);
    // Proceed with create or update logic
    if (this.documentId) {
      this.updateDocument();
    } else {
      this.createDocument();
    }
  }

  createDocument() {
    this.documentService.addDocument(this.form.value).subscribe({
      next: (res) => {
        console.log('Document created:', res);
        this.isSaved = true;
        alert('Документ успешно сохранён!');
        this.onClose();
      },
      error: (err) => {
        console.error('Error creating document:', err);
        alert('Ошибка при сохранении документа');
      }
    });
  }

  updateDocument() {
    this.documentService.updateDocument(this.documentId!, this.form.value).subscribe({
      next: (res) => {
        console.log('Document updated:', res);
        this.isSaved = true;
        alert('Документ успешно обновлён!');
        this.onClose();
      },
      error: (err) => {
        console.error('Error updating document:', err);
        alert('Ошибка при обновлении документа');
      }
    });
  }

  onPrint(): void {
    const documentData = this.prepareDocumentDataForPrint();
  
    this.dialog.open(DocumentPrintComponent, {
      width: '800px',
      height: '800px',
      data: documentData
    });
  }

  onClose() {
    this.closeEmitter.emit(true);
  }


  prepareDocumentDataForPrint(): any {
    const formValues = this.form.value;
  
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
  
}
