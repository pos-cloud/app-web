import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'roundNumber'
})
export class RoundNumberPipe implements PipeTransform {
	transform(value: any, numberOfDecimals: number = 2): any {
		if (value) {
      if (!isNaN(value)) {
        switch (numberOfDecimals) {
          case 1:
            return Math.round(value * 10) / 10;
          case 2:
            return (Math.round(value * 100) / 100).toFixed(2);
          case 3:
            return Math.round(value * 1000) / 1000;
          case 4:
            return Math.round(value * 1000) / 1000;
          default:
            return Math.round(value * 100) / 100;
        }
      } else {
        return parseFloat(value.toFixed(numberOfDecimals));
      }
		} else {
			if (value === 0) {
				return 0;
			}
		}
	}
}
