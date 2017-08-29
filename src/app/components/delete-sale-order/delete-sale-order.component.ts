import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SaleOrder } from './../../models/sale-order';

import { SaleOrderService } from './../../services/sale-order.service';

@Component({
  selector: 'app-delete-sale-order',
  templateUrl: './delete-sale-order.component.html',
  styleUrls: ['./delete-sale-order.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteSaleOrderComponent implements OnInit {

  @Input() saleOrder: SaleOrder;
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _saleOrderService: SaleOrderService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteSaleOrder(): void {

    this.loading = true;

    this._saleOrderService.deleteSaleOrder(this.saleOrder._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}
