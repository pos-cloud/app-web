import { Routes } from '@angular/router';

export const BUSINESS_RULES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/list-business-rules.component').then((m) => m.ListBusinessRulesComponent),
  },
  {
    path: 'add',
    loadComponent: () => import('./crud/business-rule.component').then((m) => m.BusinessRuleComponent),
  },
  {
    path: 'view/:id',
    loadComponent: () => import('./crud/business-rule.component').then((m) => m.BusinessRuleComponent),
  },
  {
    path: 'update/:id',
    loadComponent: () => import('./crud/business-rule.component').then((m) => m.BusinessRuleComponent),
  },
  {
    path: 'delete/:id',
    loadComponent: () => import('./crud/business-rule.component').then((m) => m.BusinessRuleComponent),
  },
];
