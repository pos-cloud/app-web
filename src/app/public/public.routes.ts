import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: 'menu/:database',
    data: { public: true },
    loadComponent: () => import('./menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'armar/:database',
    data: { public: true },
    loadComponent: () => import('./armar/armar.component').then((m) => m.ArmarComponent),
  },
  {
    path: 'login-ext/:database',
    data: { public: true },
    loadComponent: () => import('./login-ext/login-ext.component').then((m) => m.LoginExtComponent),
  },
];

export function isPublicExperienceUrl(url: string): boolean {
  const segment = url.split('?')[0].split('#')[0].split('/').filter(Boolean)[0] ?? '';
  return PUBLIC_ROUTES.some((route) => (route.path ?? '').split('/')[0] === segment);
}
