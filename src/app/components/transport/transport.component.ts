import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { Transport } from '../../models/transport';
import { IdentificationType } from '../../models/identification-type';
import { VATCondition } from "../../models/vat-condition";
import { Country } from "../../models/country";
import { Config } from 'app/app.config';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VATConditionService } from 'app/services/vat-condition.service';
import { IdentificationTypeService } from 'app/services/identification-type.service';
import { CountryService } from 'app/services/country.service';
import { TransportService } from '../../services/transport.service';
import { ConfigService } from 'app/services/config.service';

@Component({
  selector: 'app-transport',
  templateUrl: './transport.component.html',
  styleUrls: ['./transport.component.scss'],
  providers: [NgbAlertConfig]
})
export class TransportComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() transportId : string;
  public alertMessage: string = '';
  public userType: string;
  public transport: Transport;
  public areTransportEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public userCountry: string;
  public transportForm: FormGroup;
  public identificationTypes: IdentificationType[];
  public vatConditions: VATCondition[];
  public countries: Country[];
  public config : Config;
  public orientation: string = 'horizontal';

  public formErrors = {
    'name': '',
  };

  public validationMessages = {
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public alertConfig: NgbAlertConfig,
    public _transportService: TransportService,
    public _vatConditionService: VATConditionService,
    public _identificationTypeService: IdentificationTypeService,
    public _countryService : CountryService,
    public _configService : ConfigService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.transport = new Transport();
    this.getVATConditions();
    this.getIdentificationTypes();
    this.getCountries();
  }

  async ngOnInit() {

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];;
    this.buildForm();
    
    if (this.transportId) {
      this.getTransport();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getTransport() {

    this.loading = true;

    this._transportService.getTransport(this.transportId).subscribe(
      result => {
        if (!result.transport) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.transport = result.transport;
          this.setValueForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

   
    if (!this.transport._id) { this.transport._id = ''; }
    if (!this.transport.name) { this.transport.name = ''; }
    
    let vatCondition;
    if (!this.transport.vatCondition) {
      vatCondition = null;
    } else {
      if (this.transport.vatCondition._id) {
        vatCondition = this.transport.vatCondition._id;
      } else {
        vatCondition = this.transport.vatCondition;
      }
    }

    let identificationType;
    if (!this.transport.identificationType) {
      identificationType = null;
    } else {
      if (this.transport.identificationType._id) {
        identificationType = this.transport.identificationType._id;
      } else {
        identificationType = this.transport.identificationType;
      }
    }


    if (!this.transport.identificationValue) { this.transport.identificationValue = ''; }
    if (!this.transport.address) { this.transport.address = ''; }
    if (!this.transport.addressNumber) { this.transport.addressNumber = ''; }
    
    let country;
    if (!this.transport.country) {
      country = null;
    } else {
      if (this.transport.country._id) {
        country = this.transport.country._id;
      } else {
        country = this.transport.country;
      }
    }

    
    let state;
    if (!this.transport.state) {
      state = null;
    } else {
      if (this.transport.state._id) {
        state = this.transport.state._id;
      } else {
        state = this.transport.state;
      }
    }
    
    if (!this.transport.city) { this.transport.city = ''; }
    if (!this.transport.phones) { this.transport.phones = ''; }
    if (!this.transport.emails) { this.transport.emails = ''; }
    if (!this.transport.observation) { this.transport.observation = ''; }



    const values = {
      '_id': this.transport._id,
      'name': this.transport.name,
      'vatCondition' : vatCondition,
      'identificationType' : identificationType,
      'identificationValue' : this.transport.identificationValue,
      'address' : this.transport.address,
      'addressNumber' : this.transport.addressNumber,
      'country' : country,
      'state' : state,
      'city' : this.transport.city,
      'phones' : this.transport.phones,
      'emails' : this.transport.emails,
      'observation' : this.transport.observation
    };
    this.transportForm.setValue(values);
  }

  public buildForm(): void {

    this.transportForm = this._fb.group({
      '_id' : [this.transport._id, []],
      'name': [this.transport.name, [
        Validators.required
        ]
      ],
      'vatCondition': [this.transport.vatCondition, []],
      'identificationType' : [this.transport.identificationType,[]],
      'identificationValue' : [this.transport.identificationValue,[]],
      'address' : [this.transport.address,[]],
      'addressNumber' : [this.transport.addressNumber,[]],
      'country' : [this.transport.country,[]],
      'state' : [this.transport.state,[]],
      'city' : [this.transport.city,[]],
      'phones' : [this.transport.phones,[]],
      'emails' : [this.transport.emails,[]],
      'observation' : [this.transport.observation,[]]


    });

    this.transportForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.transportForm) { return; }
    const form = this.transportForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public addTransport() {

    switch (this.operation) {
      case 'add':
        this.saveTransport();
        break;
      case 'edit':
        this.updateTransport();
        break;
      case 'delete' :
        this.deleteTransport();
      default:
        break;
    }
  }

  public updateTransport() {

    this.loading = true;

    this.transport = this.transportForm.value;

    this._transportService.updateTransport(this.transport).subscribe(
      result => {
        if (!result.transport) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.loading = false;
          this.showMessage('El transporte se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveTransport() {

    this.loading = true;

    this.transport = this.transportForm.value;

    this._transportService.saveTransport(this.transport).subscribe(
      result => {
        if (!result.transport) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El transporte se ha añadido con éxito.', 'success', false);
            this.transport = new Transport();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteTransport() {

    this.loading = true;

    this._transportService.deleteTransport(this.transport._id).subscribe(
      result => {
        this.loading = false;
        if (!result.transport) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.activeModal.close();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getVATConditions(): void {

    this.loading = true;

    this._vatConditionService.getVATConditions().subscribe(
      result => {
        if (!result.vatConditions) {
        } else {
          this.vatConditions = result.vatConditions;
          this.transport.vatCondition = this.vatConditions[0];
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getIdentificationTypes(): void {

    this.loading = true;

    let query = 'sort="name":1';

    this._identificationTypeService.getIdentificationTypes(query).subscribe(
      result => {
        if (!result.identificationTypes) {
          this.loading = false;
          this.identificationTypes = new Array();
        } else {
          this.hideMessage();
          this.loading = false;
          this.identificationTypes = result.identificationTypes;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }
  
  public getCountries() : void {
    
    this.loading = true;

    // ORDENAMOS LA CONSULTA
    let sortAux = { name: 1 };
    
    // FILTRAMOS LA CONSULTA
    let match = { operationType: { $ne: "D" } };
    
    // CAMPOS A TRAER
    let project = {
      name: 1,
      operationType: 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {};

    let limit = 0;

    let skip = 0;

    this._countryService.getCountries(
      project, // PROJECT
      match, // MATCH
      sortAux, // SORT
      group, // GROUP
      limit, // LIMIT
      skip // SKIP
    ).subscribe(result => {
      if (result && result.countries && result.countries.length > 0) {
        this.countries = result.countries;
        //this.company.country = this.countries[0];
      }
      this.loading = false;
    },
    error => {
      this.showMessage(error._body, 'danger', false);
      this.loading = false;
    });
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


