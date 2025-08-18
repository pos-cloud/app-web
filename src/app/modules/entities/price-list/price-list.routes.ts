import { Routes } from '@angular/router';

export const PRICE_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-price-list.component').then((m) => m.ListPriceListComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/price-list.component').then((m) => m.PriceListComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/price-list.component').then((m) => m.PriceListComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/price-list.component').then((m) => m.PriceListComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/price-list.component').then((m) => m.PriceListComponent),
  },
];
