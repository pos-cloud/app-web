import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import * as moment from 'moment';
import 'moment/locale/es';

@Injectable()
export class ClockService {

  public clock: Observable<string>;

  constructor() {
    this.clock = Observable.interval(1000).map(tick => moment().format('YYYY-MM-DDTHH:mm:ssZ')).share();
  }

  getClock(): Observable<string> {
    return this.clock;
  }
}
