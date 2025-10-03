import { Routes } from '@angular/router';

export const APPLICATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./applications.component').then((m) => m.ListApplicationsComponent),
  },
];
