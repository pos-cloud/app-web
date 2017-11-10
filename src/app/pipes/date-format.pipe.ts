import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';
import 'moment/locale/es';

@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
	transform(value:any, format:string):any {
		if (value) {
			return moment(value, 'DD/MM/YYYY HH:mm:ss', true).format(format);
		}
	}
}