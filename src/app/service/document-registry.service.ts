import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DocumentData } from "../data/document-data.interface";

@Injectable({
    providedIn: 'root'
  })
  export class DocumentService {
    private apiUrl = 'http://localhost:3000/api/documents'; // Node.js back end
  
    constructor(private http: HttpClient) {}
  
    // GET all documents
    getDocuments(): Observable<DocumentData[]> {
      return this.http.get<DocumentData[]>(this.apiUrl);
    }
  
    // GET one document by ID
    getDocumentById(id: number): Observable<DocumentData> {
      return this.http.get<DocumentData>(`${this.apiUrl}/${id}`);
    }
  
    // CREATE a new document (POST)
    addDocument(doc: DocumentData): Observable<DocumentData> {
      return this.http.post<DocumentData>(this.apiUrl, doc);
    }
  
    // UPDATE an existing document (PUT)
    updateDocument(id: number, doc: DocumentData): Observable<{ message: string }> {
      return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, doc);
    }
  
    // DELETE a document
    deleteDocument(id: number): Observable<{ message: string }> {
      return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }
  }