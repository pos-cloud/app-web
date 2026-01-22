import { Routes } from '@angular/router';

export const MOVEMENT_OF_CASH_ROUTES: Routes = [
  {
    path: ':type',
    loadComponent: () => import('./list/list-movement-of-cash.component').then((m) => m.ListMovementOfCashComponent),
  },
];
