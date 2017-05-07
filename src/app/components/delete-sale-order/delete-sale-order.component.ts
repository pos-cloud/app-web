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
  private alertMessage: any;
  public focusEvent = new EventEmitter<boolean>();

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

  private deleteSaleOrder(): void {

    this._saleOrderService.deleteSaleOrder(this.saleOrder._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }
}
