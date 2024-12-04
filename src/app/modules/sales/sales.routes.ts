import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  {
    path: 'tienda-nube',
    loadComponent: () =>
      import('./tienda-nube/list/web.component').then((m) => m.WebComponent),
  },
];
