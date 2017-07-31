import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { Config } from './../app.config';

@Injectable()
export class ClockService {

  public clock: Observable<Date>;

  constructor() {
    this.clock = Observable.interval(1000).map(tick => new Date()).share();
  }

  getClock(): Observable<Date> {
    return this.clock;
  }
}
