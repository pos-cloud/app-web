import { Routes } from '@angular/router';

export const HOLIDAY: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-holiday.component').then((m) => m.ListHolidaysComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/holiday.component').then((m) => m.HolidayComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/holiday.component').then((m) => m.HolidayComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/holiday.component').then((m) => m.HolidayComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/holiday.component').then((m) => m.HolidayComponent),
  },
];
