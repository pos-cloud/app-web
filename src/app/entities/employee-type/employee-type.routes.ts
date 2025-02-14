import { Routes } from '@angular/router';

export const EMPLOYEE_TYPES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-employee-types.component').then((m) => m.ListEmployeeTypesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/employee-type.component').then((m) => m.EmployeeTypeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/employee-type.component').then((m) => m.EmployeeTypeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/employee-type.component').then((m) => m.EmployeeTypeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/employee-type.component').then((m) => m.EmployeeTypeComponent),
  },
];
