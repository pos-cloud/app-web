import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormalTransactionViewComponent } from './views/formal/formal-transaction-view.component';

const routes: Routes = [
  {
    path: 'view/formal/:id',
    component: FormalTransactionViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransactionRoutingModule {}
