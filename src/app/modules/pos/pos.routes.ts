import { Routes } from '@angular/router';

export const POS_ROUTES: Routes = [
  {
    path: 'counter',
    loadComponent: () => import('./counter/counter.component').then((m) => m.CounterComponent),
  },
  {
    path: 'purchase',
    loadComponent: () => import('./purchase/purchase.component').then((m) => m.PurchaseComponent),
  },
  {
    path: 'stock',
    loadComponent: () => import('./stock/stock.component').then((m) => m.StockComponent),
  },
  {
    path: 'money',
    loadComponent: () => import('./money/money.component').then((m) => m.MoneyComponent),
  },
  {
    path: 'production',
    loadComponent: () => import('./production/production.component').then((m) => m.ProductionComponent),
  },
  {
    path: 'appointments',
    loadComponent: () =>
      import('./appointments/appointments-calendar.component').then((m) => m.AppointmentsCalendarComponent),
  },
  {
    path: 'tienda-nube',
    loadComponent: () => import('./tienda-nube/list/web.component').then((m) => m.WebComponent),
  },
  {
    path: 'woo-commerce',
    loadComponent: () => import('./woo-commerce/list-orders.component').then((m) => m.ListOrdersWooCommerceComponent),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./app/list-transactions.component').then((m) => m.ListAppTransactionsComponent),
  },
  {
    path: 'subscription',
    loadComponent: () => import('./subscription/subscription.component').then((m) => m.SubscriptionComponent),
  },
];
