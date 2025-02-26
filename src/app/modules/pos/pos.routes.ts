import { Routes } from '@angular/router';

export const POS_ROUTES: Routes = [
  {
    path: 'tienda-nube',
    loadComponent: () => import('./tienda-nube/list/web.component').then((m) => m.WebComponent),
  },
  {
    path: 'woo-commerce',
    loadComponent: () => import('./woo-commerce/list-orders.component').then((m) => m.ListOrdersWooCommerceComponent),
  },
];
