import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@shared/pipes/pipes.module';
import { Address, ApiResponse, Company, ShipmentMethod } from '@types';
import { AddressService } from 'app/core/services/address.service';
import { ShipmentMethodService } from 'app/core/services/shipment-method.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-select-shipment-method',
  templateUrl: './select-shipment-method.html',
  providers: [TranslateMePipe],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule, PipesModule, TranslateModule],
})
export class SelectShipmentMethodComponentNew implements OnInit, OnDestroy {
  public shipmentMethods: ShipmentMethod[];
  public shipmentMethodSelected: ShipmentMethod;
  public addressSelected: Address;
  public loading: boolean = false;
  public addresses: Address[];
  @Input('company') company: Company;
  showFormAddress: boolean = false;
  public addressForm: UntypedFormGroup;
  public address: Address;
  private destroy$ = new Subject<void>();

  constructor(
    public _shipmentMethodService: ShipmentMethodService,
    public activeModal: NgbActiveModal,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService,
    public _fb: UntypedFormBuilder,
    private _addressService: AddressService
  ) {
    this.addressForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      city: ['', [Validators.required]],
      type: ['', []],
      state: ['', [Validators.required]],
      street: ['', [Validators.required]],
      streetNumber: ['', [Validators.required]],
      zipCode: ['', []],
      floor: ['', []],
      flat: ['', []],
      observation: ['', []],
      company: ['', []],
      forBilling: [false, []],
      forShipping: [false, []],
    });
  }

  ngOnInit() {
    this.getShipmentMethods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status === 200) {
            this.shipmentMethods = result.result;
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => this._toastService.showToast(error),
      });
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

  public saveAddress(): void {
    this.loading = true;
    this.addressForm.markAllAsTouched();
    if (this.addressForm.invalid) {
      this.loading = false;
      return;
    }
    this.address = this.addressForm.value;
    this.address.company = this.company;
    this._addressService
      .save(this.address)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.status === 200) {
            this._toastService.showToast(result);
            this.address = result.result;
            // Agregar la dirección a la lista y seleccionarla
            if (!this.addresses) {
              this.addresses = [];
            }
            this.addresses.push(this.address);
            this.selectAddress(this.address);
            // Cerrar el formulario y resetearlo
            this.showFormAddress = false;
            this.addressForm.reset();
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  select(shipmentMethod: ShipmentMethod) {
    if (this.shipmentMethodSelected && this.shipmentMethodSelected._id === shipmentMethod._id) {
      // Si ya está seleccionado, deseleccionar
      this.shipmentMethodSelected = null;
      this.addressSelected = null;
      this.showFormAddress = false;
    } else {
      this.shipmentMethodSelected = shipmentMethod;
      if (this.shipmentMethodSelected.requireAddress) {
        this.loadAddresses();
      }
    }
  }

  selectAddress(address: Address) {
    this.addressSelected = address;
  }

  loadAddresses() {
    this.loading = true;
    this._addressService
      .getAll({ match: { company: { $oid: this.company._id } } })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.status === 200) {
            this.addresses = result.result;
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
