import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { PaymentMethodService } from './../../services/payment-method.service';

@Component({
  selector: 'app-report-sales-by-payment-method',
  templateUrl: './report-sales-by-payment-method.component.html',
  styleUrls: ['./report-sales-by-payment-method.component.css'],
  providers: [NgbAlertConfig]
})

export class ReportSalesByPaymentMethodComponent implements OnInit {

  public items: any[] = new Array();
  public arePaymentMethodsEmpty: boolean = true;
  public alertMessage: string = '';
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Input() startDate: string;
  @Input() startTime: string;
  @Input() endDate: string;
  @Input() endTime: string;
  @Input() limit: number = 0;
  public listType: string;
  public itemsPerPage: string = "5";
  public currentPage: number = 1;
  public totalItems = 0;
  public sort = {
    "count": -1
  };
  public transactionMovement: string;

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.startDate = moment().format('YYYY-MM-DD');
    this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
    this.endDate = moment().format('YYYY-MM-DD');
    this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
  }

  ngOnInit(): void {

    this.getSalesByPaymentMethod();
  }

  public getSalesByPaymentMethod(): void {

    this.loading = true;
    let pathLocation: string[] = this._router.url.split('/');
    this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.listType = pathLocation[3];

    let movement;
    if (this.transactionMovement === "Venta") {
      movement = "Entrada";
    } else if (this.transactionMovement === "Compra") {
      movement = "Salida";
    }

    let query = {
      type: this.transactionMovement,
      movement: movement,
      currentAccount: "Si",
      modifyStock: true,
      startDate: this.startDate + " " + this.startTime,
      endDate: this.endDate + " " + this.endTime,
      sort: this.sort,
      limit: this.limit
    }

    this._paymentMethodService.getSalesByPaymentMethod(JSON.stringify(query)).subscribe(
      result => {
        if (!result || result.length <= 0) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.items = null;
          this.arePaymentMethodsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.items = result;
          this.arePaymentMethodsEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public orderBy(term: string): void {

    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getSalesByPaymentMethod();
  }

  public refresh(): void {
    this.getSalesByPaymentMethod();
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
