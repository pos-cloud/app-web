import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

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
