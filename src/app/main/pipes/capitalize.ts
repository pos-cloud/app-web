import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})

export class CapitalizePipe implements PipeTransform {

  transform(value: any, all: boolean = false): any {
    if (value) {
      value = value.replace('  ', ' ');
      let w = '';
      if (value.split(' ').length > 0 && all) {
        value.split(' ').forEach(word => {
          w += word.charAt(0).toUpperCase() + word.toString().substr(1, word.length).toLowerCase() + ' '
        });
      } else {
        w = value.charAt(0).toUpperCase() + value.toString().substr(1, value.length).toLowerCase();
      }
      return w;
    }
    return value;
  }
}
