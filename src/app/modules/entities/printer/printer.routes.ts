import { Routes } from '@angular/router';

export const PRINTER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-printers.component').then((m) => m.ListPrintersComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/printer.component').then((m) => m.PrinterComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/printer.component').then((m) => m.PrinterComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/printer.component').then((m) => m.PrinterComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/printer.component').then((m) => m.PrinterComponent),
  },
];
