import { Routes } from '@angular/router';

export const PAYMENT_METHOD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-payment-method.component').then((m) => m.ListPaymentMethodComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/payment-method.component').then((m) => m.PaymentMethodComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/payment-method.component').then((m) => m.PaymentMethodComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/payment-method.component').then((m) => m.PaymentMethodComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/payment-method.component').then((m) => m.PaymentMethodComponent),
  },
];
