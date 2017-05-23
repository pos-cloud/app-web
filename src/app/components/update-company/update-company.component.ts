import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Company } from './../../models/company';

import { CompanyService } from './../../services/company.service';

@Component({
  selector: 'app-update-company',
  templateUrl: './update-company.component.html',
  styleUrls: ['./update-company.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateCompanyComponent implements OnInit {

  @Input() company: Company;
  private companyForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'name': ''
  };

  private validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    private _companyService: CompanyService,
    private _fb: FormBuilder,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let locationPathURL: string;
    this._router.events.subscribe((data:any) => { 
      locationPathURL = data.url.split('/');
      this.userType = locationPathURL[1];
    });
    this.buildForm();
    this.companyForm.setValue({
      '_id': this.company._id,
      'name': this.company.name
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

    this.companyForm = this._fb.group({
      '_id': [this.company._id, [
        ]
      ],
      'name': [this.company.name, [
          Validators.required
        ]
      ]
    });

    this.companyForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  private onValueChanged(data?: any): void {

    if (!this.companyForm) { return; }
    const form = this.companyForm;

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

  private updateCompany (): void {

    this.loading = true;
    this.company = this.companyForm.value;
    this.saveChanges();
  }

  private saveChanges(): void {
    
    this._companyService.updateCompany(this.company).subscribe(
    result => {
        if (!result.company) {
          this.alertMessage = result.message;
        } else {
          this.company = result.company;
          this.alertConfig.type = 'success';
          this.alertMessage = "La empresa se ha actualizado con éxito.";
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}