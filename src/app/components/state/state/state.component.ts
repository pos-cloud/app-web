import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { StateService } from '../../../core/services/state.service';

import { State } from '../state';

import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Country } from '@types';
import { Config } from 'app/app.config';
import { CountryService } from 'app/core/services/country.service';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.css'],
  providers: [NgbAlertConfig],
})
export class StateComponent implements OnInit {
  @Input() operation: string;
  @Input() readonly: boolean;
  @Input() stateId: string;
  public alertMessage: string = '';
  public userType: string;
  public state: State;
  public areStateEmpty: boolean = true;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public countries: Country[];
  public userCountry: string;
  public orientation: string = 'horizontal';

  public formErrors = {
    code: '',
    name: '',
  };

  public validationMessages = {
    code: {
      required: 'Este campo es requerido.',
    },
    name: {
      required: 'Este campo es requerido.',
    },
  };

  public stateForm: UntypedFormGroup;

  constructor(
    public alertConfig: NgbAlertConfig,
    public _stateService: StateService,
    public _countryService: CountryService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    public activeModal: NgbActiveModal
  ) {
    if (window.screen.width < 1000) this.orientation = 'vertical';
    this.state = new State();
  }

  ngOnInit() {
    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getCountries();
    this.buildForm();

    if (this.stateId) {
      this.getState();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCountries(): void {
    this.loading = true;

    this._countryService
      .getCountries(
        { name: 1, operationType: 1 }, // PROJECT
        { operationType: { $ne: 'D' } }, // MATCH
        { name: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      )
      .subscribe(
        (result) => {
          this.loading = false;
          if (result && result.countries) {
            this.countries = result.countries;
          } else {
            this.countries = new Array();
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getState() {
    this.loading = true;

    this._stateService.getState(this.stateId).subscribe(
      (result) => {
        if (!result.state) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          this.state = result.state;
          this.setValueForm();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {
    if (!this.state._id) {
      this.state._id = '';
    }

    let code;
    if (!this.state.code) {
      code = null;
    } else {
      code = this.state.code;
    }

    let name;
    if (!this.state.name) {
      name = null;
    } else {
      name = this.state.name;
    }

    let country;
    if (!this.state.country) {
      country = null;
    } else {
      if (this.state.country._id) {
        country = this.state.country._id;
      } else {
        country = this.state.country;
      }
    }

    const values = {
      _id: this.state._id,
      code: code,
      name: name,
      country: country,
    };
    this.stateForm.setValue(values);
  }

  public buildForm(): void {
    this.stateForm = this._fb.group({
      _id: [this.state._id, []],
      code: [this.state.code, [Validators.required]],
      name: [this.state.name, [Validators.required]],
      country: [this.state.country, [Validators.required]],
    });

    this.stateForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {
    if (!this.stateForm) {
      return;
    }
    const form = this.stateForm;

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

  public addState() {
    switch (this.operation) {
      case 'add':
        this.saveState();
        break;
      case 'edit':
        this.updateState();
        break;
      case 'delete':
        this.deleteState();
      default:
        break;
    }
  }

  public updateState() {
    this.loading = true;

    this.state = this.stateForm.value;

    this._stateService.updateState(this.state).subscribe(
      (result) => {
        if (!result.state) {
          this.loading = false;
          if (result.message && result.message !== '') {
            this.showMessage(result.message, 'info', true);
          }
        } else {
          this.loading = false;
          this.showMessage('El estado se ha actualizado con éxito.', 'success', false);
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveState() {
    this.loading = true;

    this.state = this.stateForm.value;

    this._stateService.saveState(this.state).subscribe(
      (result) => {
        if (!result.state) {
          this.loading = false;
          if (result.message && result.message !== '') {
            this.showMessage(result.message, 'info', true);
          }
        } else {
          this.loading = false;
          this.showMessage('El estado se ha añadido con éxito.', 'success', false);
          this.state = new State();
          this.buildForm();
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteState() {
    this.loading = true;

    this._stateService.deleteState(this.state._id).subscribe(
      (result) => {
        if (!result.state) {
          if (result.message && result.message !== '') {
            this.showMessage(result.message, 'info', true);
          }
        } else {
          this.activeModal.close();
        }
      },
      (error) => {
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
