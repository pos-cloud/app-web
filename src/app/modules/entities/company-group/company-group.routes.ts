import { Routes } from '@angular/router';

export const COMPANY_GROUP_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-company-group.component').then((m) => m.CompanyGroupComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/company-group.component').then((m) => m.CompanyGroupComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/company-group.component').then((m) => m.CompanyGroupComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/company-group.component').then((m) => m.CompanyGroupComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/company-group.component').then((m) => m.CompanyGroupComponent),
  },
];
