import { Routes } from '@angular/router';

export const VARIANT_VALUE_ROUTES: Routes = [
  {
    path: 'add',
    loadComponent: () => import('./list/list-variant-values.component').then((m) => m.ListVariantValuesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/variant-value.component').then((m) => m.VariantValueComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/variant-value.component').then((m) => m.VariantValueComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/variant-value.component').then((m) => m.VariantValueComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/variant-value.component').then((m) => m.VariantValueComponent),
  },
];
