import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from "rxjs";
import {ClockService} from "./clock.service";

import * as moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit, OnDestroy {

  public _clockSubscription: Subscription;
  @Input() startTime: string;
  @Input() endTime: string;
  @Input() format: string;
  public difference: any;

  constructor(
    public clockSubscription: ClockService
  ) {
    if (!this.startTime) {
      this.startTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if (!this.endTime) {
      this.endTime = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    }
  }

  ngOnInit() {
    this._clockSubscription = this.clockSubscription.getClock().subscribe(
      time => {
        this.endTime = time;
        this.calculateDiff();
      }
    );
  }

  ngOnDestroy(): void {
    this._clockSubscription.unsubscribe();
  }

  public calculateDiff() {
    let secs = moment(this.endTime).diff(this.startTime, "seconds");
    this.difference = moment.utc(secs*1000).format(this.format);
  }
}
