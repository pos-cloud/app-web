import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { CurrencyComponent } from './crud/currency.component';
import { ListCurrencyComponent } from './list/list-currency.component';

const routes: Routes = [
  {
    path: '',
    component: ListCurrencyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: CurrencyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: CurrencyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: CurrencyComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: CurrencyComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencyRoutingModule {}
