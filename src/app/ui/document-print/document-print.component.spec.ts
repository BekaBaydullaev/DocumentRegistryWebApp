import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPrintComponent } from './document-print.component';

describe('DocumentPrintComponent', () => {
  let component: DocumentPrintComponent;
  let fixture: ComponentFixture<DocumentPrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentPrintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
