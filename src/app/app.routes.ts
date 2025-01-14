import { Routes } from '@angular/router';
import { DocumentListComponent } from './ui/document-list/document-list.component';

export const routes: Routes = [
    {
        path: '',
        component: DocumentListComponent,
        title: 'Document Registry'
    },

    {
        path: 'documents',
        component: DocumentListComponent,
        title: 'Document Registry'
    }
];


