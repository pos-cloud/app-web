import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { CurrencyValueComponent } from './crud/currency-value.component';
import { ListCurrencyValueComponent } from './list/list-currency-value.component';

const routes: Routes = [
  {
    path: '',
    component: ListCurrencyValueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: CurrencyValueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: CurrencyValueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: CurrencyValueComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: CurrencyValueComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrencyValueRoutingModule {}
