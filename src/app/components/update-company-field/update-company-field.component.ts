import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyField, CompanyFieldType } from './../../models/company-field';

import { CompanyFieldService } from './../../services/company-field.service';

@Component({
  selector: 'app-update-company-field',
  templateUrl: './update-company-field.component.html',
  styleUrls: ['./update-company-field.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateCompanyFieldComponent implements OnInit {

  @Input() companyField: CompanyField;
  @Input() readonly: boolean;
  public companyFieldForm: FormGroup;
  public alertMessage: string = '';
  public datatypes: CompanyFieldType[] = [ CompanyFieldType.Number, CompanyFieldType.String ];
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'value':''
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
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.setValueForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.companyFieldForm = this._fb.group({
      '_id': [this.companyField._id, [
        ]
      ],
      'name': [this.companyField.name, [
          Validators.required
        ]
      ],
      'datatype' : [this.companyField.datatype, [
        ]
      ],
      'value' : [this.companyField.value, [
        ]
      ]
    });

    this.companyFieldForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public setValueForm(): void {

    if(!this.companyField._id) { this.companyField._id = '' }
    if(!this.companyField.name) { this.companyField.name = '' }
    if(!this.companyField.datatype) { this.companyField.datatype = CompanyFieldType.String }

    this.companyFieldForm.setValue({
      '_id':this.companyField._id,
      'name': this.companyField.name,
      'datatype': this.companyField.datatype,
      'value': this.companyField.value,
    });
  }

  public updateCompanyField (): void {
    if (!this.readonly) {
      this.loading = true;
      this.companyField = this.companyFieldForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {

    this.loading = true;

    this._companyFieldService.updateCompanyField(this.companyField).subscribe(
      result => {
        if (!result.companyField) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.companyField = result.companyField;
          this.showMessage("El campo de producto se ha actualizado con éxito.", 'success', false);
          this.activeModal.close('save_close');
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
