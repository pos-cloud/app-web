import { Injectable } from "@angular/core";
import { interval as observableInterval } from "rxjs";
import { Observable } from "rxjs/Observable";
import { map, share } from "rxjs/operators";

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
