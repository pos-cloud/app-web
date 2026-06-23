import { Routes } from '@angular/router';

export const MOVEMENT_OF_CANCELLATION_ROUTES: Routes = [
  {
    path: ':type',
    loadComponent: () =>
      import('./list/list-movements-of-cancellation.component').then((m) => m.ListMovementOfCancellationsComponent),
  },
];
