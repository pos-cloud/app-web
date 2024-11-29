import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';

import { ToastService } from 'app/shared/components/toast/toast.service';
import { ConfigService } from '../../core/services/config.service';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { Config } from './../../app.config';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  providers: [NgbAlertConfig, DateFormatPipe],
  encapsulation: ViewEncapsulation.None,
})
export class BillingComponent implements OnInit {
  public config: Config;
  public showTransferData: boolean = false;
  public showPaymentType: boolean = false;

  constructor(
    public _router: Router,
    public _configService: ConfigService,
    public _toastService: ToastService,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {}

  async ngOnInit() {
    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
    });
  }

  public paymentSelect(paymentType: string): void {
    switch (paymentType) {
      case 'mp':
        this.showTransferData = false;
        this._configService.generateLicensePayment().subscribe(
          (result) => {
            if (!result.paymentLink) {
              if (result.message && result.message !== '')
                this._toastService.showToast({
                  message: result.message,
                  type: 'danger',
                });
            } else {
              window.open(result.paymentLink, '_blank');
            }
          },
          (error) => {
            this._toastService.showToast({
              message: error.message,
              type: 'danger',
            });
          }
        );
        break;
      case 'tf':
        this.showTransferData = true;
        break;
    }
  }
}
