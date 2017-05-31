import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from "rxjs";
import {ClockService} from "./../../services/clock.service";

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit, OnDestroy {

  private _clockSubscription: Subscription;
  private endTime: Date;
  @Input() startTime: Date;
  private difference: Number;

  constructor(private clockSubscription: ClockService) {
    // if(this.startTime === undefined) {
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

  // private calc() {
  //   // this.difference = this.endTime.getMilliseconds() - this.startTime.getMilliseconds();
  //   this.endTime.diff(this.startTime, 'h');
  //   console.log("hora");
  //   console.log(this.difference); 
  // }

  private calcularDiasDiferencia() {

    let horasDif = this.endTime.getTime() - this.startTime.getTime();
    let horas = Math.round(horasDif/(1000 * 60 * 60));

    this.difference = horas + 1;
  }

}
