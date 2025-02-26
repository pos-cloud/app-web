import { Routes } from '@angular/router';

export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-categories.component').then((m) => m.ListCategoriesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/category.component').then((m) => m.CategoryComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/category.component').then((m) => m.CategoryComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/category.component').then((m) => m.CategoryComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/category.component').then((m) => m.CategoryComponent),
  },
];
