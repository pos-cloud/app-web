import { NgModule } from '@angular/core';

import { EntitiesModule } from '../entities.module';
import { BankRoutingModule } from './bank.routing.module';
import { BankComponent } from './crud/bank.component';
import { ListBankComponent } from './list/list-bank.component';

@NgModule({
  declarations: [BankComponent, ListBankComponent],
  imports: [BankRoutingModule, EntitiesModule],
})
export class BankModule {}
