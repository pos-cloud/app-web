import { NgModule } from '@angular/core';
import { CapitalizePipe } from './capitalize';
import { DateFormatPipe } from './date-format.pipe';
import { DynamicFormatPipe } from './dynamic-format';
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
    DynamicFormatPipe,
  ],
  exports: [
    CapitalizePipe,
    DateFormatPipe,
    FilterPipe,
    JsonDiffPipe,
    OrderByPipe,
    RoundNumberPipe,
    TranslateMePipe,
    DynamicFormatPipe,
  ],
  providers: [JsonDiffPipe, RoundNumberPipe],
})
export class PipesModule {}
