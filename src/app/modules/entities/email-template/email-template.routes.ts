import { Routes } from '@angular/router';

export const EMAIL_TEMPLATE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/list-email-templates.component').then((m) => m.ListEmailTemplatesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/email-template.component').then((m) => m.EmailTemplateComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/email-template.component').then((m) => m.EmailTemplateComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/email-template.component').then((m) => m.EmailTemplateComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/email-template.component').then((m) => m.EmailTemplateComponent),
  },
];
