import { NgModule } from '@angular/core';

import { EntitiesModule } from '../entities.module';
import { CurrencyValueComponent } from './crud/currency-value.component';
import { CurrencyValueRoutingModule } from './currency-value-routing.module';
import { ListCurrencyValueComponent } from './list/list-currency-value.component';

@NgModule({
  declarations: [CurrencyValueComponent, ListCurrencyValueComponent],
  imports: [EntitiesModule, CurrencyValueRoutingModule],
})
export class CurrencyValueModule {}
