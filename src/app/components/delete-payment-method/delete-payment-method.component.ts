import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { PaymentMethod } from './../../models/payment-method';

import { PaymentMethodService } from './../../services/payment-method.service';

@Component({
  selector: 'app-delete-payment-method',
  templateUrl: './delete-payment-method.component.html',
  styleUrls: ['./delete-payment-method.component.css'],
  providers: [NgbAlertConfig]
})

export class DeletePaymentMethodComponent implements OnInit {

  @Input() paymentMethod: PaymentMethod;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deletePaymentMethod(): void {

    this.loading = true;

    this._paymentMethodService.deletePaymentMethod(this.paymentMethod._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}