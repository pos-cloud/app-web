import { Routes } from '@angular/router';

export const CLASSIFICATION_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-classification.component').then((m) => m.ListIdentificationTypesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/classification.component').then((m) => m.ClassificationComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/classification.component').then((m) => m.ClassificationComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/classification.component').then((m) => m.ClassificationComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/classification.component').then((m) => m.ClassificationComponent),
  },
];
