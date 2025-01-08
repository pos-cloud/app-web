import { NgModule } from '@angular/core';
import { EntitiesModule } from '../entities.module';
import { CurrencyComponent } from './crud/currency.component';
import { CurrencyRoutingModule } from './currency-routing.module';
import { ListCurrencyComponent } from './list/list-currency.component';

@NgModule({
  declarations: [CurrencyComponent, ListCurrencyComponent],
  imports: [EntitiesModule, CurrencyRoutingModule],
})
export class CurrencyModule {}
