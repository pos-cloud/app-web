import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';
import 'moment/locale/es';

@Pipe({
    name: 'total'
})
export class TotalPipe implements PipeTransform {
	transform(value:any):any {
		if (value) {
			return value += value;
		}
	}
}