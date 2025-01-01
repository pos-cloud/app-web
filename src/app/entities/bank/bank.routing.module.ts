import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'app/core/guards/auth.guard';
import { BankComponent } from './crud/bank.component';
import { ListBankComponent } from './list/list-bank.component';

const routes: Routes = [
  {
    path: '',
    component: ListBankComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'add',
    component: BankComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'view/:id',
    component: BankComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update/:id',
    component: BankComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'delete/:id',
    component: BankComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankRoutingModule {}
