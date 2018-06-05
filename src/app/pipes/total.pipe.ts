import { Pipe, PipeTransform } from '@angular/core';

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