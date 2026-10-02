import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

const currencyPipe = new CurrencyPipe('es-Ar');

@Pipe({
  name: 'dynamicFormat',
})
export class DynamicFormatPipe implements PipeTransform {
  transform(value: any, dataType: string): any {
    if (dataType === 'currency') {
      return currencyPipe.transform(value, 'USD', 'symbol-narrow', '1.2-2');
    } else if (dataType === 'number') {
      if (value === null || value === undefined || value === '') {
        return value;
      }
      return Number(value).toLocaleString('es-AR');
    } else if (dataType === 'string') {
      return value?.toString();
    } else if (dataType === 'date') {
      return value
        ? new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';
    }
    return value;
  }
}
