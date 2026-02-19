import { Routes } from '@angular/router';

export const CASH_BOX_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-cash-box.component').then((m) => m.ListCashBoxComponent),
  },
];
