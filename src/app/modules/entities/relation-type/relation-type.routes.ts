import { Routes } from '@angular/router';

export const RELATION_TYPE_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-relation-type.component').then((m) => m.ListRelationTypesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/relation-type.component').then((m) => m.RelationTypeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/relation-type.component').then((m) => m.RelationTypeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/relation-type.component').then((m) => m.RelationTypeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/relation-type.component').then((m) => m.RelationTypeComponent),
  },
];
