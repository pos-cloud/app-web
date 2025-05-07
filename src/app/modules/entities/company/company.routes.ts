import { Routes } from '@angular/router';

export const COMPANY_ROUTES: Routes = [
  {
    path: ':type',
    loadComponent: () => import('./list/list-company.company').then((m) => m.ListCompanyComponent),
  },
  {
    path: 'add/:type',
    loadComponent: () => import('./crud/company.component').then((m) => m.CompanyComponent),
  },
  {
    path: 'view/:type/:id',
    loadComponent: () => import('./crud/company.component').then((m) => m.CompanyComponent),
  },
  {
    path: 'update/:type/:id',
    loadComponent: () => import('./crud/company.component').then((m) => m.CompanyComponent),
  },
  {
    path: 'delete/:type/:id',
    loadComponent: () => import('./crud/company.component').then((m) => m.CompanyComponent),
  },
];
