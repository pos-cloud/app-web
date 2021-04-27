import { Component, OnInit, EventEmitter } from '@angular/core';
import { ShipmentMethodService } from 'app/components/shipment-method/shipment-method.service';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShipmentMethod } from '../shipment-method.model';
import Resulteable from 'app/util/Resulteable';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-select-shipment-method',
  templateUrl: './select-shipment-method.component.html',
  styleUrls: ['./select-shipment-method.component.scss'],
  providers: [TranslateMePipe]
})
export class SelectShipmentMethodComponent implements OnInit {

  public shipmentMethods: ShipmentMethod[] = new Array();
  public shipmentMethodSelected: ShipmentMethod;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public alertConfig: NgbAlertConfig,
    public _shipmentMethodService: ShipmentMethodService,
    public activeModal: NgbActiveModal,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
  ) {
    this.shipmentMethods = new Array();
    this.shipmentMethodSelected = new ShipmentMethod();
  }

  ngOnInit() {
    this.getShipmentMethods();
  }

  public getShipmentMethods(): void {
    this._shipmentMethodService.getAll({
      project: {
        _id: 1,
        name: 1,
        operationType: 1
      },
      match: {
        operationType: { $ne: "D" }
      }
    }).subscribe(
      (result: Resulteable) => {
        if (result.status === 200) {
          this.shipmentMethods = result.result;
        } else this.showToast(result)
      },
      error => this.showToast(error)
    )
  }

  public selectShipmentMethod(): void {
    this.activeModal.close({ shipmentMethod: this.shipmentMethodSelected });
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
