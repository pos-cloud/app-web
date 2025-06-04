import { Routes } from '@angular/router';

export const STRUCTURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-structure.component').then((m) => m.ListStructureComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/structure.component').then((m) => m.StructureComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/structure.component').then((m) => m.StructureComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/structure.component').then((m) => m.StructureComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/structure.component').then((m) => m.StructureComponent),
  },
];
