import { Routes } from '@angular/router';

export const COUNTRY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-countries.component').then((m) => m.ListCountriesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/country.component').then((m) => m.CountryComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/country.component').then((m) => m.CountryComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/country.component').then((m) => m.CountryComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/country.component').then((m) => m.CountryComponent),
  },
];
