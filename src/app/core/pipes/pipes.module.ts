import { NgModule } from '@angular/core';
import { CapitalizePipe } from './capitalize';
import { DateFormatPipe } from './date-format.pipe';
import { FilterPipe } from './filter.pipe';
import { JsonDiffPipe } from './json-diff';
import { OrderByPipe } from './order-by.pipe';
import { RoundNumberPipe } from './round-number.pipe';
import { TranslateMePipe } from './translate-me';

@NgModule({
  declarations: [
    CapitalizePipe,
    DateFormatPipe,
    FilterPipe,
    JsonDiffPipe,
    OrderByPipe,
    RoundNumberPipe,
    TranslateMePipe,
  ],
  exports: [
    CapitalizePipe,
    DateFormatPipe,
    FilterPipe,
    JsonDiffPipe,
    OrderByPipe,
    RoundNumberPipe,
    TranslateMePipe,
  ],
  providers: [JsonDiffPipe, RoundNumberPipe],
})
export class PipesModule {}
