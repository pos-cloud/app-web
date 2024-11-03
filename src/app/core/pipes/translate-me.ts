import { Pipe } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Pipe({
  name: 'translateMe'
})
export class TranslateMePipe extends TranslatePipe {

  translateMe(value: string) {
    if (value) {
      return this.transform(value);
    } else {
      return value;
    }
  }
}
