import { Routes } from '@angular/router';

export const CONFIG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./config.component').then((m) => m.ConfigsComponent),
  },
];
