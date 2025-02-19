import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicFormat',
})
export class DynamicFormatPipe implements PipeTransform {
  transform(value: any, dataType: string): any {
    if (dataType === 'currency') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    } else if (dataType === 'number') {
      return value.toLocaleString();
    } else if (dataType === 'string') {
      return value.toString();
    }
    return value;
  }
}
