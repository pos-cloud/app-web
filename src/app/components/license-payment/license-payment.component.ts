import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// SERVICES
import { ConfigService } from './../../services/config.service';

import { Config } from 'app/app.config';
import { RoundNumberPipe } from '../../pipes/round-number.pipe';

@Component({
  selector: 'app-license-payment',
  templateUrl: './license-payment.component.html',
  styleUrls: ['./license-payment.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class LicensePaymentComponent implements OnInit {

  public toggleButton: boolean = false;
  public alertMessage: string = '';
  public showTransferData: boolean = false;
  public licenseCost: number;
  public paymentTotal: number;
  public loading: boolean = false;

  constructor(
    public _configService: ConfigService,
    public activeModal: NgbActiveModal,
    public _router: Router,
    public alertConfig: NgbAlertConfig,
    public roundNumber: RoundNumberPipe,
  ) { }

  ngOnInit() {

    this.licenseCost = Config.licenseCost;
    this.paymentTotal = this.licenseCost;
  }

  public changePrice(numberOfMonths) {
    
    this.toggleButton = true;
    
    if(this.licenseCost) {
      switch (numberOfMonths) {
        case '1':
           this.paymentTotal = this.licenseCost;
           this.toggleButton = true;
          break;
        case '6':
          this.paymentTotal = this.roundNumber.transform((this.licenseCost*numberOfMonths) - ((10*(this.licenseCost*numberOfMonths))/100));
          this.toggleButton = true;
          break;
        case '12':
          this.paymentTotal = this.roundNumber.transform((this.licenseCost*numberOfMonths) - ((20*(this.licenseCost*numberOfMonths))/100));   
          break;
      }
    }
  }

  public paymentSelect(paymentType: string): void {

    switch (paymentType) {
      case 'mp':

          this.showTransferData = false;

          this._configService.generateLicensePayment(this.paymentTotal).subscribe(
            result => {
              if (!result.paymentLink) {
                if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
              } else {
                window.open(result.paymentLink, '_blank')
              }
              this.loading = false;
            },
            error => {
              this.showMessage(error._body, "danger", false);
              this.loading = false;
            }
          )
        break;
      case 'tf':
            this.showTransferData = true;
        break;
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
