import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../../service/document-registry.service';
import { MaterialModule } from '../../shared-components/material.module';
import { CommonModule } from '@angular/common';

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
  protected readonly documentService = inject(DocumentService);
  protected readonly formBuilder = inject(FormBuilder);
  currentDate!: Date;

  ngOnInit(): void {
    this.initForm();
    this.currentDate = new Date();
  }
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

  initForm() {
    this.form = this.formBuilder.group({
      regNumber: new FormControl('', Validators.required),
      regDate: new FormControl(this.currentDate, Validators.required),
      docNumber: new FormControl(),
      docDate: new FormControl(),
      deliveryType: new FormControl(),
      correspondent: new FormControl('', Validators.required),
      subject: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      description: new FormControl('', Validators.maxLength(1000)),
      dueDate: new FormControl(),
      isAccessible: new FormControl(false),
      isUnderControl: new FormControl(false),
      file: new FormControl(null)
    });
  }

  fileError: string | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const validFormats = ['application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const isValidFormat = validFormats.includes(file.type);
    const isValidSize = file.size <= 1024 * 1024; // 1 MB

    if (!isValidFormat && !isValidSize) {
      this.fileError = 'Недопустимый формат и размер файла';
    } else if (!isValidFormat) {
      this.fileError = 'Недопустимый формат';
    } else if (!isValidSize) {
      this.fileError = 'Размер файла превышает 1Мб';
    } else {
      this.fileError = null;
      // this.form.patchValue({ file });
    }
  }

  onSave() {
    console.log('Form submitted', this.form.value);
  }

  onClose() {
    this.closeEmitter.emit(true);
  }

}
