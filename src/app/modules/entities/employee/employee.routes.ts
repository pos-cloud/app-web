import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-employee.component').then((m) => m.ListEmployeeComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/employee.component').then((m) => m.EmployeeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/employee.component').then((m) => m.EmployeeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/employee.component').then((m) => m.EmployeeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/employee.component').then((m) => m.EmployeeComponent),
  },
];
