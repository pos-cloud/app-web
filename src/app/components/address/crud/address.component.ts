import { Component, ViewEncapsulation, NgZone, Input, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AddressService } from '../address.service';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { Company } from 'app/components/company/company';
import { CompanyService } from 'app/components/company/company.service';
import { Address } from '../address.model';
import { ShipmentMethod } from 'app/components/shipment-method/shipment-method.model';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    AddressService,
    TranslateMePipe
  ]
})

export class AddressComponent {

  public addressForm: UntypedFormGroup;
  public address: Address;
  public loading: boolean = false;
  private subscription: Subscription = new Subscription();
  private subscriptionCompany: Subscription = new Subscription();
  public stateId: string;
  public states: any[];
  public cities: any[];
  public addressAutocomplete: string;
  public addressStr: Object;
  public place: Object;
  public establishmentAddress: Object;
  public formattedAddress: string;
  public formattedEstablishmentAddress: string;
  public phone: string;
  @Output() eventAddAddress = new EventEmitter<Address>();
  @Input() company: Company;
  @Input() shipmentMethod: ShipmentMethod;
  public lastValues: {} = {
    'email': '',
    'password': '',
    'confirmPass': '',
    'name': '',
    'vatCondition': '',
    'dni': '',
    'visitedByTraveler': '',
    'observation': '',
    'identificationType': '',
    'phone': '',
    'contactCompanyName': '',
    'contactCompanyPosition': '',
    'contactCompanyPhone': '',
  };

  public formErrors = {
    'type': '',
    'floor': '',
    'flat': '',
    'observation': '',
    'company': '',
    'forBilling': '',
    'forShipping': ''
  };

  public validationMessages = {
    'type': { 'required': 'Este campo es requerido' },
    'floor': {},
    'flat': {},
    'observation': {},
    'company': {},
    'forBilling': {},
    'forShipping': {}
  };

  constructor(
    public _fb: UntypedFormBuilder,
    private _addressService: AddressService,
    private _route: ActivatedRoute,
    private _companyService: CompanyService,
    private _toastr: ToastrService,
    private translatePipe: TranslateMePipe,
    public zone: NgZone
  ) {
    window.scrollTo(0, 0);
    this.address = new Address();
  }

  public async ngOnInit() {
    this.address.forBilling = false;
    this.address.forShipping = false;
    this.buildForm();
  }

  public paintAddress(address: Address) {
    this.addressAutocomplete = '';
    (address.name) ? this.addressAutocomplete += address.name : '';
    (address.number) ? this.addressAutocomplete += ' ' + address.number : '';
    (address.city) ? this.addressAutocomplete += ', ' + address.city : '';
    (address.state) ? this.addressAutocomplete += ', ' + address.state : '';
    (address.country) ? this.addressAutocomplete += ', ' + address.country : '';
  }

  public getAddress(params: any) {
    if (params.place) {
      this.addressAutocomplete = params.autocompleteInput;
      this.place = params.place;
      this.addressStr = params.place['formatted_address'];
      this.formattedAddress = params.place['formatted_address'];
      this.zone.run(() => this.formattedAddress = params.place['formatted_address']);
    } else {
      this.place = null;
      this.addressStr = null;
      this.formattedAddress = null;
    }
  }

  private buildForm(): void {
    this.addressForm = this._fb.group({
      '_id': [this.lastValues['_id'], []],
      'type': [this.lastValues['type'], [Validators.required]],
      'floor': [this.lastValues['floor'], []],
      'flat': [this.lastValues['flat'], []],
      'observation': [this.lastValues['observation'], []],
      'company': [this.lastValues['company'], []],
      'forBilling': [this.lastValues['forBilling'], []],
      'forShipping': [this.lastValues['forShipping'], []]
    });

    this.addressForm.valueChanges.subscribe(data => this.onValueChanged(data));
  }

  private onValueChanged(data?: any): void {
    if (!this.addressForm) { return; }
    const form = this.addressForm;

    this.lastValues = this.addressForm.value;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && (control.dirty || !data) && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public setValueForm(): void {

    if (!this.address._id) this.address._id = '';
    if (!this.address.type) this.address.type = '';
    if (!this.address.floor) this.address.floor = '';
    if (!this.address.flat) this.address.flat = '';
    if (!this.address.observation) this.address.observation = '';
    if (!this.address.company) this.address.company = null;
    if (this.address.forBilling === undefined) this.address.forBilling = false;
    if (this.address.forShipping === undefined) this.address.forShipping = false;

    const values = {
      '_id': this.address._id,
      'type': this.address.type,
      'floor': this.address.floor,
      'flat': this.address.flat,
      'observation': this.address.observation,
      'company': this.address.company,
      'forBilling': this.address.forBilling,
      'forShipping': this.address.forShipping,
    };

    this.addressForm.setValue(values);
  }

  public getCompany(id: string): Promise<Company> {

    return new Promise<Company>((resolve, reject) => {

      this._companyService.getCompany(id).subscribe(
        result => {
          if (!result.company) {
            resolve(null);
          } else {
            resolve(result.company);
          }
        },
        error => {
          resolve(null);
        }
      );
    });
  }

  public back(): void {
    this.eventAddAddress.emit(this.address);
  }

  public async addAddress() {

    let isValid: boolean = true;

    if (!this.addressForm.valid) {
      isValid = false;
      this.onValueChanged();
    }

    if (isValid && !this.place) {
      isValid = false;
      this.showToast(null, 'info', 'Debe ingresar una dirección correcta');
    }

    if (isValid) {
      this.address = Object.assign(this.address, this.addressForm.value);
      this.address.company = this.company;

      this.address.type = this.addressForm.value.type;
      this.address.flat = this.addressForm.value.flat;
      this.address.floor = this.addressForm.value.floor;
      this.address.observation = this.addressForm.value.observation;
      this.address.name = null;
      this.address.number = null;
      this.address.city = null;
      this.address.state = null;
      this.address.country = null;
      this.address.postalCode = null;
      this.address.latitude = null;
      this.address.longitude = null;
      this.address.latitude = this.place['geometry'].location.lat().toString();
      this.address.longitude = this.place['geometry'].location.lng().toString();

      for (let d of this.place['address_components']) {
        switch (d.types[0]) {
          case 'route':
            this.address.name = d.long_name;
            break;
          case 'street_number':
            this.address.number = d.long_name;
            break;
          case 'locality':
            this.address.city = d.long_name;
            break;
          case 'administrative_area_level_1':
            this.address.state = d.long_name;
            break;
          case 'country':
            this.address.country = d.long_name;
            break;
          case 'postal_code':
            this.address.postalCode = d.long_name;
            break;
        }
      }


      if (isValid && !this.address.name) {
        isValid = false;
        this.showToast(null, 'info', 'Debe indiciar el nombre de la dirección');
      }

      if (isValid && !this.address.number) {
        try {
          this.address.number = parseInt(this.address.name.split(',')[0].split(' ')[this.address.name.split(',')[0].split(' ').length - 1]).toString();
          if (this.address.number !== 'NaN') {
            this.address.name = this.address.name.replace(this.address.name.split(',')[0].split(' ')[this.address.name.split(',')[0].split(' ').length - 1], '');
          }
        } catch (error) {
        }
      }

      if (isValid && !this.address.city) {
        this.address.city = this.address.state;
      }

      if (isValid && !this.address.state) {
        isValid = false;
        this.showToast(null, 'info', 'Debe indiciar la provincia de la dirección');
      }

      if (isValid && !this.address.country) {
        isValid = false;
        this.showToast(null, 'info', 'Debe indiciar el país de la dirección');
      }
    }

    if (isValid) {
      this.loading = true;
      this.subscription.add(this._addressService.save(this.address).subscribe(
        async result => {
          this.showToast(result);
          if (result.status === 200) {
            this.address = result.result;
            this.back();
          }
        },
        error => this.showToast(error)
      ));
    }
  }

  cancel() {
    this.address = null;
    this.back();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscriptionCompany.unsubscribe();
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
