import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyFields } from './../../models/company-fields';
import { CompanyField, CompanyFieldType } from './../../models/company-field';

import { CompanyFieldService } from './../../services/company-field.service';

@Component({
  selector: 'app-add-company-fields',
  templateUrl: './add-company-fields.component.html',
  styleUrls: ['./add-company-fields.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCompanyFieldsComponent implements OnInit {

  public field: CompanyFields;
  public companyFields: CompanyField[];
  @Input() fields: CompanyFields[];
  public companyFieldsForm: FormGroup;
  public alertMessage: string = '';
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  @Output() eventAddCompanyFields: EventEmitter<CompanyFields[]> = new EventEmitter<CompanyFields[]>();

  public formErrors = {
    'companyField': '',
    'name': '',
    'datatype': '',
    'value': '',
  };

  public validationMessages = {
    'companyField': {
      'required': 'Este campo es requerido.'
    },
    'name': {
      'required': 'Este campo es requerido.'
    },
    'datatype': {
      'required': 'Este campo es requerido.'
    },
    'value': {
      'required': 'Este campo es requerido.'
    },
  };

  constructor(
    public _companyFieldService: CompanyFieldService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    this.field = new CompanyFields();
    this.companyFields = new Array();
    if(!this.fields) {
      this.fields = new Array();
    }
    this.getCompanyFields();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.companyFieldsForm = this._fb.group({
      'companyField': [this.field.companyField, [
          Validators.required
        ]
      ],
      'name': [this.field.name, [
          Validators.required
        ]
      ],
      'datatype': [this.field.datatype, [
          Validators.required
        ]
      ],
      'value': [this.field.value, [
        ]
      ]
    });

    this.companyFieldsForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.companyFieldsForm) { return; }
    const form = this.companyFieldsForm;

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

  public changeValues(): void {

    this.field.companyField = this.companyFieldsForm.value.companyField;
    this.field.name = this.field.companyField.name;
    this.field.datatype = this.field.companyField.datatype;
    this.field.value = this.field.companyField.value;

    this.setValueForm();
  }

  public setValueForm(): void {

    if(!this.field.companyField) { null }
    if(!this.field.name) { this.field.name = '' }
    if(!this.field.datatype) { this.field.datatype = CompanyFieldType.String }
    if(!this.field.value) { this.field.value = '' }

    const values = {
      'companyField': this.field.companyField,
      'name': this.field.name,
      'datatype': this.field.datatype,
      'value' : this.field.value
    };

    this.companyFieldsForm.setValue(values);
  }

  public getCompanyFields(): void {

    this.loading = true;

    this._companyFieldService.getCompanyFields().subscribe(
      result => {
        if (!result.companyFields) {
          this.hideMessage();
        } else {
          this.hideMessage();
          this.companyFields = result.companyFields;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addCompanyFields(): void {
    this.field = this.companyFieldsForm.value;
    this.fields.push(this.field);
    this.eventAddCompanyFields.emit(this.fields);
    this.field = new CompanyFields();
  }

  public deleteArticlField(companyField: CompanyFields): void {

    let i: number = 0;
    let companyTaxToDelete: number = -1;

    if (this.fields && this.fields.length > 0) {
      for (var companyTaxAux of this.fields) {
        if (companyField.companyField._id === companyTaxAux.companyField._id &&
            companyField.value === companyTaxAux.value) {
          companyTaxToDelete = i;
        }
        i++;
      }
    }

    if (companyTaxToDelete !== -1) {
      this.fields.splice(companyTaxToDelete, 1);
    }

    this.eventAddCompanyFields.emit(this.fields);
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
