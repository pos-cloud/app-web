import { Routes } from '@angular/router';

export const UNIT_OF_MEASUREMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/list-unit-of-measurements.component').then((m) => m.ListUnitOfMeasurementsComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/unit-of-measurement.component').then((m) => m.UnitOfMeasurementComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/unit-of-measurement.component').then((m) => m.UnitOfMeasurementComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/unit-of-measurement.component').then((m) => m.UnitOfMeasurementComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/unit-of-measurement.component').then((m) => m.UnitOfMeasurementComponent),
  },
];
