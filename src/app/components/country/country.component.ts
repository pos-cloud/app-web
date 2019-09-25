import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { CountryService } from '../../services/country.service';

import { Country } from '../../models/country';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.css']
})
export class CountryComponent implements OnInit {

  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() countryId : string;
  public alertMessage: string = '';
  public userType: string;
  public country: Country;
  public areCountryEmpty: boolean = true;
  public orderTerm: string[] = ['-name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public orientation: string = 'horizontal';

  public formErrors = {
    'code': '',
    'name': '',
    'callingCodes' : '',
    'timezones' : '',
    'flag' : '',
    'alpha2Code' : '',
    'alpha3Code' : ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  public countryForm: FormGroup;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _countryService: CountryService,
    public _router: Router,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
  ) {
    if(window.screen.width < 1000) this.orientation = 'vertical';
    this.country = new Country();
  }

  ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm()
    
    if (this.countryId) {
      this.getCountry();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCountry() {

    this.loading = true;

    this._countryService.getCountry(this.countryId).subscribe(
      result => {
        if (!result.country) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.country = result.country;
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

    if (!this.country._id) { 
      this.country._id = ''; 
    }

    let code;
    if (!this.country.code) {
      code = null;
    } else {
        code = this.country.code;
    }
    

    let name;
    if (!this.country.name) {
      name = null;
    } else {
        name = this.country.name;
    }

    const values = {
      '_id': this.country._id,
      'code': code,
      'name': name,
      'callingCodes' : this.country.callingCodes,
      'timezones' : this.country.timezones,
      'flag' : this.country.flag,      
      'alpha2Code' : this.country.alpha2Code,
      'alpha3Code' : this.country.alpha3Code,
    };
    this.countryForm.setValue(values);
  }

  public buildForm(): void {

    this.countryForm = this._fb.group({
      '_id' : [this.country._id, []],
      'code': [this.country.code, [
        Validators.required
        ]
      ],
      'name': [this.country.name, [
        Validators.required
        ]
      ],
      'callingCodes' : [this.country.callingCodes,[]],
      'timezones' : [this.country.timezones,[]],
      'flag' : [this.country.flag,[]],
      'alpha2Code' : [this.country.alpha2Code,[]],
      'alpha3Code' : [this.country.alpha3Code,[]]
    });

    this.countryForm.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.countryForm) { return; }
    const form = this.countryForm;

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

  public addCountry() {

    switch (this.operation) {
      case 'add':
        this.saveCountry();
        break;
      case 'edit':
        this.updateCountry();
        break;
      case 'delete' :
        this.deleteCountry();
      default:
        break;
    }
  }

  public updateCountry() {

    this.loading = true;

    this.country = this.countryForm.value;

    this._countryService.updateCountry(this.country).subscribe(
      result => {
        if (!result.country) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El país se ha actualizado con éxito.', 'success', false);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveCountry() {

    this.loading = true;

    this.country = this.countryForm.value;

    this._countryService.saveCountry(this.country).subscribe(
      result => {
        if (!result.country) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
            this.loading = false;
            this.showMessage('El país se ha añadido con éxito.', 'success', false);
            this.country = new Country();
            this.buildForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteCountry() {

    this.loading = true;

    this._countryService.deleteCountry(this.country._id).subscribe(
      result => {
        if (!result.country) {
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
