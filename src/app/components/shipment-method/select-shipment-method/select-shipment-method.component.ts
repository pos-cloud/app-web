import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse, Company } from '@types';
import { Address } from 'app/components/address/address.model';
import { AddressService } from 'app/core/services/address.service';
import { ShipmentMethodService } from 'app/core/services/shipment-method.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subscription } from 'rxjs';
import { ShipmentMethod } from '../shipment-method.model';

@Component({
  selector: 'app-select-shipment-method',
  templateUrl: './select-shipment-method.component.html',
  styleUrls: ['./select-shipment-method.component.scss'],
  providers: [TranslateMePipe],
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
  @Input('company') company: Company;
  showFormAddress: boolean = false;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _shipmentMethodService: ShipmentMethodService,
    public activeModal: NgbActiveModal,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService,
    private _addressService: AddressService
  ) {
    this.shipmentMethods = new Array();
    this.shipmentMethodSelected = new ShipmentMethod();
  }

  ngOnInit() {
    this.getShipmentMethods();
  }

  public getShipmentMethods(): void {
    this._shipmentMethodService
      .getAll({
        project: {
          _id: 1,
          name: 1,
          operationType: 1,
          requireAddress: 1,
          zones: 1,
        },
        match: {
          operationType: { $ne: 'D' },
        },
      })
      .subscribe(
        (result: ApiResponse) => {
          if (result.status === 200) {
            this.shipmentMethods = result.result;
          } else this._toastService.showToast(result);
        },
        (error) => this._toastService.showToast(error)
      );
  }

  public selectShipmentMethod(): void {
    if (!this.shipmentMethodSelected) {
      this._toastService.showToast({
        type: 'info',
        message: 'Debe seleccionar un método de entrega.',
      });
    } else if (this.shipmentMethodSelected.requireAddress && !this.addressSelected) {
      this._toastService.showToast({
        type: 'info',
        message: 'Debe seleccionar una dirección.',
      });
    } else {
      this.activeModal.close({
        shipmentMethod: this.shipmentMethodSelected,
        address: this.addressSelected,
      });
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
    this.subscription.add(
      this._addressService.getAll({ match: { company: { $oid: this.company._id } } }).subscribe(
        (result) => {
          this.loading = false;
          if (result.status === 200) {
            this.addresses = result.result;
          } else this._toastService.showToast(result);
        },
        (error) => this._toastService.showToast(error)
      )
    );
  }
}
