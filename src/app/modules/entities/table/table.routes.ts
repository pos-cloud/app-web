import { Routes } from '@angular/router';
export const TABLE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-tables.component').then((m) => m.ListTablesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/table.component').then((m) => m.TableComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/table.component').then((m) => m.TableComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/table.component').then((m) => m.TableComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/table.component').then((m) => m.TableComponent),
  },
];
