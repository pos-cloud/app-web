import { Injectable } from '@angular/core';
import { Observable, interval as observableInterval } from 'rxjs';
import { map, share } from 'rxjs/operators';

import * as moment from 'moment';
import 'moment/locale/es';

@Injectable({
  providedIn: 'root',
})
export class ClockService {
  public clock: Observable<string>;

  constructor() {
    this.clock = observableInterval(1000).pipe(
      map((tick) => moment().format('YYYY-MM-DDTHH:mm:ssZ')),
      share()
    );
  }

  getClock(): Observable<string> {
    return this.clock;
  }
}
