import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'roundNumber'
})
export class RoundNumberPipe implements PipeTransform {
	transform(value: any, numberOfDecimals: number = 2): any {
		if (value) {
			return parseFloat(value.toFixed(numberOfDecimals));
		} else {
			if (value === 0) {
				return 0;
			}
		}
	}
}