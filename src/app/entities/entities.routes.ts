import { Routes } from '@angular/router';
import { BANK_ROUTES } from './bank/bank.routes';
import { CATEGORY_ROUTES } from './category/category.routes';
import { CURRENCY_VALUE_ROUTES } from './currency-value/currency-value.routes';
import { CURRENCY_ROUTES } from './currency/currency.routes';
import { EMPLOYEE_TYPES_ROUTES } from './employee-type/employee-type.routes';
import { EMPLOYEE_ROUTES } from './employee/employee.routes';
import { GALLERY_ROUTES } from './gallery/gallery.routes';
import { MAKE_ROUTES } from './make/make.routes';
import { RESOURCE_ROUTES } from './resource/resource.routes';
import { ROOM_ROUTES } from './room/room.routes';
import { TABLE_ROUTES } from './table/table.routes';

export const ENTITIES_ROUTES: Routes = [
  {
    path: 'banks',
    children: BANK_ROUTES,
  },
  {
    path: 'categories',
    children: CATEGORY_ROUTES,
  },
  {
    path: 'currencies',
    children: CURRENCY_ROUTES,
  },
  {
    path: 'currency-values',
    children: CURRENCY_VALUE_ROUTES,
  },
  {
    path: 'employees',
    children: EMPLOYEE_ROUTES,
  },
  {
    path: 'employee-types',
    children: EMPLOYEE_TYPES_ROUTES,
  },
  {
    path: 'galleries',
    children: GALLERY_ROUTES,
  },
  {
    path: 'makes',
    children: MAKE_ROUTES,
  },
  {
    path: 'resources',
    children: RESOURCE_ROUTES,
  },
  {
    path: 'rooms',
    children: ROOM_ROUTES,
  },
  {
    path: 'tables',
    children: TABLE_ROUTES,
  },
];
