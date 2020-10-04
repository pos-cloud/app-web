import { Component, OnInit, EventEmitter } from '@angular/core';
import { ShipmentMethodService } from 'app/components/shipment-method/shipment-method.service';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShipmentMethod } from '../shipment-method.model';

@Component({
  selector: 'app-select-shipment-method',
  templateUrl: './select-shipment-method.component.html',
  styleUrls: ['./select-shipment-method.component.scss']
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
    public activeModal: NgbActiveModal
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
      result => {
        if (result && result.shipmentMethods) {
          this.shipmentMethods = result.shipmentMethods;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  public selectShipmentMethod(): void {
    this.activeModal.close({ shipmentMethod: this.shipmentMethodSelected });
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
