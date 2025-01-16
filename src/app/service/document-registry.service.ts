import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { DocumentData } from "../data/document-data.interface";

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentsInMemory: DocumentData[] = [];
  private nextId = 1;

  constructor() { /* ...existing code... */ }

  getDocuments(): Observable<DocumentData[]> {
    return of(this.documentsInMemory);
  }

  getDocumentById(id: number): Observable<DocumentData> {
    const doc = this.documentsInMemory.find(d => d.id === id);
    return of(doc as DocumentData);
  }

  addDocument(doc: DocumentData): Observable<DocumentData> {
    doc.id = this.nextId++;
    this.documentsInMemory.push(doc);
    return of(doc);
  }

  updateDocument(id: number, updatedDoc: DocumentData): Observable<{ message: string }> {
    const index = this.documentsInMemory.findIndex(d => d.id === id);
    if (index !== -1) {
      this.documentsInMemory[index] = { ...updatedDoc, id };
    }
    return of({ message: 'Document updated in memory.' });
  }

  deleteDocument(id: number): Observable<{ message: string }> {
    this.documentsInMemory = this.documentsInMemory.filter(d => d.id !== id);
    return of({ message: 'Document deleted in memory.' });
  }

  uploadFile(file: File): Observable<{ fileName: string; filePath: string }> {
    return new Observable<{ fileName: string; filePath: string }>(observer => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result?.toString() || '';
        observer.next({
          fileName: file.name,
          filePath: base64Data // the Base64 string
        });
        observer.complete();
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsDataURL(file);
    });
  }
}