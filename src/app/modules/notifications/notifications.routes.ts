import { Routes } from '@angular/router';

export const NOTIFICATIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-notifications.component').then((m) => m.ListNotificationsComponent),
  },
];
