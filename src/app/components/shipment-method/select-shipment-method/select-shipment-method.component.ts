import { Component, OnInit, EventEmitter, ViewChild, Input } from '@angular/core';
import { ShipmentMethodService } from 'app/components/shipment-method/shipment-method.service';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ShipmentMethod } from '../shipment-method.model';
import Resulteable from 'app/util/Resulteable';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { Address } from 'app/components/address/address.model';
import { Subscription } from 'rxjs';
import { AddressService } from 'app/components/address/address.service';
import { Company } from 'app/components/company/company';

@Component({
  selector: 'app-select-shipment-method',
  templateUrl: './select-shipment-method.component.html',
  styleUrls: ['./select-shipment-method.component.scss'],
  providers: [TranslateMePipe]
})
export class SelectShipmentMethodComponent implements OnInit {

  public shipmentMethods: ShipmentMethod[] = new Array();
  public shipmentMethodSelected: ShipmentMethod;
  public addressSelected: Address;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public addresses: Address[];
  private subscription: Subscription = new Subscription();
  @Input("company") company: Company;
  showFormAddress: boolean = false;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _shipmentMethodService: ShipmentMethodService,
    public activeModal: NgbActiveModal,
    public translatePipe: TranslateMePipe,
    private _toastr: ToastrService,
    private _addressService: AddressService
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
        operationType: 1,
        requireAddress: 1,
        zones: 1,
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
    if (!this.shipmentMethodSelected) {
      this.showToast(null, 'info', 'Debe seleccionar un método de entrega.');
    } else if (this.shipmentMethodSelected.requireAddress && !this.addressSelected) {
      this.showToast(null, 'info', 'Debe seleccionar una dirección.');
    } else {
      this.activeModal.close({ shipmentMethod: this.shipmentMethodSelected, address: this.addressSelected });
    }
  }

  select(shipmentMethod: ShipmentMethod) {
    this.shipmentMethodSelected = shipmentMethod;
    if (this.shipmentMethodSelected.requireAddress) {
      this.loadAddresses();
    }
  }

  selectAddress(address: Address) {
    this.addressSelected = address;
  }

  loadAddresses() {
    this.subscription.add(this._addressService.getAll({ match: { company: { $oid: this.company._id } } }).subscribe(
      result => {
        this.loading = false;
        if (result.status === 200) {
          this.addresses = result.result;
        } else this.showToast(result)
      },
      error => this.showToast(error)
    ));
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
