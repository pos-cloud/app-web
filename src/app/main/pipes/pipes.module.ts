import { NgModule } from '@angular/core';
import { CapitalizePipe } from './capitalize';
import { DateFormatPipe } from './date-format.pipe';
import { FilterPipe } from './filter.pipe';
import { OrderByPipe } from './order-by.pipe';
import { RoundNumberPipe } from './round-number.pipe';
import { TotalPipe } from './total.pipe';
import { TranslateMePipe } from './translate-me';
import { JsonDiffPipe } from './json-diff';

@NgModule({
	declarations: [
		CapitalizePipe,
		DateFormatPipe,
		FilterPipe,
    JsonDiffPipe,
    OrderByPipe,
		RoundNumberPipe,
    TotalPipe,
    TranslateMePipe
	],
	exports: [
		CapitalizePipe,
		DateFormatPipe,
		FilterPipe,
    JsonDiffPipe,
    OrderByPipe,
		RoundNumberPipe,
    TotalPipe,
    TranslateMePipe
	]
})

export class PipesModule { }
