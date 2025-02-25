import { Routes } from '@angular/router';

export const VARIANT_TYPE_ROUTES: Routes = [
  {
    path: 'add',
    loadComponent: () => import('./list/list-variant-types.component').then((m) => m.ListVariantTypesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/variant-type.component').then((m) => m.VariantTypeComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/variant-type.component').then((m) => m.VariantTypeComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/variant-type.component').then((m) => m.VariantTypeComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/variant-type.component').then((m) => m.VariantTypeComponent),
  },
];
