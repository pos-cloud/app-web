
import {interval as observableInterval,  Observable } from 'rxjs';

import {share, map} from 'rxjs/operators';
import { Injectable } from '@angular/core';

import * as moment from 'moment';
import 'moment/locale/es';

@Injectable()
export class ClockService {

  public clock: Observable<string>;

  constructor() {
    this.clock = observableInterval(1000).pipe(map(tick => moment().format('YYYY-MM-DDTHH:mm:ssZ')),share(),);
  }

  getClock(): Observable<string> {
    return this.clock;
  }
}
