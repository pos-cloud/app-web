import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UnitOfMeasurement } from './../../models/unit-of-measurement';

import { UnitOfMeasurementService } from './../../services/unit-of-measurement.service';

@Component({
  selector: 'app-add-unit-of-measurement',
  templateUrl: './add-unit-of-measurement.component.html',
  styleUrls: ['./add-unit-of-measurement.component.css'],
  providers: [NgbAlertConfig]
})

export class AddUnitOfMeasurementComponent implements OnInit {

  public unitOfMeasurement: UnitOfMeasurement;
  @Input() unitOfMeasurementId: string;
  @Input() operation: string;
  @Input() readonly: boolean;
  public unitOfMeasurementForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': '',
    'name': ''
  };

  public validationMessages = {
    'code': {
    },
    'name': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _unitOfMeasurementService: UnitOfMeasurementService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.unitOfMeasurement = new UnitOfMeasurement();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    if (this.unitOfMeasurementId) {
      this.getUnitOfMeasurement();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.unitOfMeasurementForm = this._fb.group({
      '_id': [this.unitOfMeasurement._id, [
        ]
      ],
      'code': [this.unitOfMeasurement.code, [
        ]
      ],
      'name': [this.unitOfMeasurement.name, [
          Validators.required
        ]
      ]
    });

    this.unitOfMeasurementForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.unitOfMeasurementForm) { return; }
    const form = this.unitOfMeasurementForm;

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

  public getUnitOfMeasurement(): void {

    this.loading = true;

    this._unitOfMeasurementService.getUnitOfMeasurement(this.unitOfMeasurementId).subscribe(
      result => {
        if (!result.unitOfMeasurement) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.unitOfMeasurement = result.unitOfMeasurement;
          this.setValuesForm();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValuesForm(): void {

    if (!this.unitOfMeasurement._id) { this.unitOfMeasurement._id = ''; }
    if (!this.unitOfMeasurement.code) { this.unitOfMeasurement.code = '1'; }
    if (!this.unitOfMeasurement.name) { this.unitOfMeasurement.name = ''; }

    const values = {
      '_id': this.unitOfMeasurement._id,
      'code': this.unitOfMeasurement.code,
      'name': this.unitOfMeasurement.name,
    };

    this.unitOfMeasurementForm.setValue(values);
  }

  public addUnitOfMeasurement(): void {

    if (!this.readonly) {
      this.unitOfMeasurement = this.unitOfMeasurementForm.value;
      if (this.operation === 'add') {
        this.saveUnitOfMeasurement();
      } else if (this.operation === 'update') {
        this.updateUnitOfMeasurement();
      }
    }
  }

  public saveUnitOfMeasurement(): void {

    this.loading = true;

    this._unitOfMeasurementService.saveUnitOfMeasurement(this.unitOfMeasurement).subscribe(
      result => {
        if (!result.unitOfMeasurement) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.unitOfMeasurement = result.unitOfMeasurement;
          this.showMessage("La unidad de medida se ha añadido con éxito.", 'success', true);
          this.unitOfMeasurement = new UnitOfMeasurement ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateUnitOfMeasurement(): void {

    this.loading = true;

    this._unitOfMeasurementService.updateUnitOfMeasurement(this.unitOfMeasurement).subscribe(
      result => {
        if (!result.unitOfMeasurement) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.unitOfMeasurement = result.unitOfMeasurement;
          this.showMessage("La unidad de medida se ha actualizado con éxito.", 'success', true);
        }
        this.loading = false;
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

  public hideMessage():void {
    this.alertMessage = '';
  }
}
