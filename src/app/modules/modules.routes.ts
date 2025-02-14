import { Routes } from '@angular/router';

export const MODULES_ROUTES: Routes = [
  {
    path: 'sales',
    loadChildren: () => import('./sales/sales.routes').then((m) => m.SALES_ROUTES),
  },
  //   {
  //     path: 'purchase',
  //   },
  //   {
  //     path: 'stock',
  //   },
  //   {
  //     path: 'fondos',
  //   },
  //   {
  //     path: 'production',
  //   },
];
