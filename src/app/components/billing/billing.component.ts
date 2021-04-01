import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { Config } from './../../app.config';
import { DateFormatPipe } from '../../main/pipes/date-format.pipe';
import { ToastrService } from 'ngx-toastr';
import { ConfigService } from '../config/config.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  providers: [NgbAlertConfig, DateFormatPipe],
  encapsulation: ViewEncapsulation.None
})

export class BillingComponent implements OnInit {

  public config: Config;
  public showTransferData: boolean = false;
  public showPaymentType: boolean = false;

  constructor(
    public _router: Router,
    public _configService: ConfigService,
    public _toastr: ToastrService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
  }

  async ngOnInit() {
    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );
  }

  public paymentSelect(paymentType: string): void {

    switch (paymentType) {
      case 'mp':
        this.showTransferData = false;
        this._configService.generateLicensePayment().subscribe(
          result => {
            if (!result.paymentLink) {
              if (result.message && result.message !== "") this.showToast(result.message, "danger");
            } else {
              window.open(result.paymentLink, '_blank')
            }
          },
          error => {
            this.showToast(error.message, 'danger');
          }
        )
        break;
      case 'tf':
        this.showTransferData = true;
        break;
    }
  }

  public showToast(message: string, type: string): void {
    switch (type) {
      case 'success':
        this._toastr.success('', message);
        break;
      case 'info':
        this._toastr.info('', message);
        break;
      case 'warning':
        this._toastr.warning('', message);
        break;
      case 'danger':
        this._toastr.error('', message);
        break;
      default:
        this._toastr.success('', message);
        break;
    }
  }
}
