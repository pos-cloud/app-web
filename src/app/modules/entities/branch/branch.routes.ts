import { Routes } from '@angular/router';

export const BRANCH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-branch.component').then((m) => m.ListBranchComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/branch.component').then((m) => m.BranchComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/branch.component').then((m) => m.BranchComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/branch.component').then((m) => m.BranchComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/branch.component').then((m) => m.BranchComponent),
  },
];
