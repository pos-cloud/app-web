import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';
import 'moment/locale/es';

@Pipe({
	name: 'roundNumber'
})
export class RoundNumberPipe implements PipeTransform {
	transform(value: any, numberOfDecimals: number): any {
		if (value) {
			return parseFloat(value.toFixed(numberOfDecimals));
		} else {
			if(value === 0) {
				return 0;
			}
		}
	}
}