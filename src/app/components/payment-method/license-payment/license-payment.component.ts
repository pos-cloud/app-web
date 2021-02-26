import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// SERVICES
import { ConfigService } from '../../config/config.service';

import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';
import { Config } from 'app/app.config';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-license-payment',
  templateUrl: './license-payment.component.html',
  styleUrls: ['./license-payment.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe],
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
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
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
                if (result.message && result.message !== "") this.showToast(null, "danger", result.message);
              } else {
                window.open(result.paymentLink, '_blank')
              }
              this.loading = false;
            },
            error => {
              this.showToast(error);
              this.loading = false;
            }
          )
        break;
      case 'tf':
            this.showTransferData = true;
        break;
    }
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
