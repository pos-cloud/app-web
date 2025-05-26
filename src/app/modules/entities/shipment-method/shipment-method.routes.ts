import { Routes } from '@angular/router';
export const SHIPMENT_METHOD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-shipment-method.component').then((m) => m.ListShipmentMethodsComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/shipment-method.component').then((m) => m.ShipmentMethodComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/shipment-method.component').then((m) => m.ShipmentMethodComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/shipment-method.component').then((m) => m.ShipmentMethodComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/shipment-method.component').then((m) => m.ShipmentMethodComponent),
  },
];
