import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyField, CompanyFieldType } from './../../models/company-field';

import { CompanyFieldService } from './../../services/company-field.service';

@Component({
  selector: 'app-add-company-field',
  templateUrl: './add-company-field.component.html',
  styleUrls: ['./add-company-field.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCompanyFieldComponent  implements OnInit {

  public companyField: CompanyField;
  public companyFieldForm: FormGroup;
  public alertMessage: string = '';
  public datatypes: CompanyFieldType[] = [ CompanyFieldType.Number, CompanyFieldType.String ];
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public resultUpload;

  public formErrors = {
    'name': '',
    'value': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _companyFieldService: CompanyFieldService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.companyField = new CompanyField ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.companyFieldForm = this._fb.group({
      'name': [this.companyField.name, [
          Validators.required
        ]
      ],
      'datatype': [this.companyField.datatype, [
        ]
      ],
      'value': [this.companyField.value, [
        ]
      ]
    });

    this.companyFieldForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.companyFieldForm) { return; }
    const form = this.companyFieldForm;

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

  public addCompanyField(): void {
    this.loading = true;
    this.companyField = this.companyFieldForm.value;
    this.saveCompanyField();
  }

  public saveCompanyField(): void {

    this.loading = true;

    this._companyFieldService.saveCompanyField(this.companyField).subscribe(
      result => {
        if (!result.companyField) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.companyField = result.companyField;
          this.showMessage("El campo de empresa se ha añadido con éxito.", 'success', false);
          this.companyField = new CompanyField();
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
