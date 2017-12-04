import { Pipe, PipeTransform } from '@angular/core';

import * as moment from 'moment';
import 'moment/locale/es';

@Pipe({
    name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
	transform(value:any, format:string, formatDefecto?:string):any {
		if (value) {
			if(!formatDefecto) {
				formatDefecto = 'DD/MM/YYYY HH:mm:ss';
			}
			return moment(value, formatDefecto, true).format(format);
		}
	}
}