import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from "rxjs";
import {ClockService} from "./../../services/clock.service";

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit, OnDestroy {

  public _clockSubscription: Subscription;
  public endTime: Date;
  @Input() startTime: Date;
  public difference: Number;

  constructor(public clockSubscription: ClockService) {
    // if (this.startTime === undefined) {
    //   this.startTime = new Date();
    //   console.log(this.startTime);
    // }
    // this.endTime = new Date();
  }

  ngOnInit() {
    this._clockSubscription = this.clockSubscription.getClock().subscribe(
      time => 
        {
          this.endTime = time;
          this.calcularDiasDiferencia();
        }
    );
  }

  ngOnDestroy(): void {
    this._clockSubscription.unsubscribe();
  }

  // public calc() {
  //   // this.difference = this.endTime.getMilliseconds() - this.startTime.getMilliseconds();
  //   this.endTime.diff(this.startTime, 'h');
  //   console.log("hora");
  //   console.log(this.difference); 
  // }

  public calcularDiasDiferencia() {

    let horasDif = this.endTime.getTime() - this.startTime.getTime();
    let horas = Math.round(horasDif/(1000 * 60 * 60));

    this.difference = horas + 1;
  }

}
