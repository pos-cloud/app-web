import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType } from './../../models/company';

import { CompanyService } from './../../services/company.service';

@Component({
  selector: 'app-update-company',
  templateUrl: './update-company.component.html',
  styleUrls: ['./update-company.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateCompanyComponent implements OnInit {

  @Input() company: Company;
  private types: CompanyType[] = [CompanyType.Client, CompanyType.Provider];
  private companyForm: FormGroup;
  private alertMessage: any;
  private userType: string;
  private loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  private formErrors = {
    'code': 1,
    'name': '',
    'fantasyName': '',
    'type': '',
    'CUIT': '',
    'address': '',
    'city': '',
    'phones': '',
    'emails': ''

  };

  private validationMessages = {
    'code': {
      'required':       'Este campo es requerido.'
    },
    'name': {
      'required':       'Este campo es requerido.'
    },
    'fantasyName': {
      'required':       'Este campo es requerido.'
    },
    'type': {
      'required':       'Este campo es requerido.'
    },
    'CUIT': {
      'required':       'Este campo es requerido.'
    },
    'address': {
    },
    'city': {
    },
    'phones': {
    },
    'emails': {
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
      '_id':this.company._id,
      'code': this.company.code,
      'name': this.company.name,
      'fantasyName': this.company.fantasyName,
      'type': this.company.type,
      'CUIT': this.company.CUIT,
      'address': this.company.address,
      'city': this.company.city,
      'phones': this.company.phones,
      'emails': this.company.emails
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
      'code': [this.company.code, [
          Validators.required
        ]
      ],
      'name': [this.company.name, [
          Validators.required
        ]
      ],
      'fantasyName': [this.company.fantasyName, [
        ]
      ],
      'type': [this.company.type, [
          Validators.required
        ]
      ],
      'CUIT': [this.company.CUIT, [
          Validators.required
        ]
      ],
      'address': [this.company.address, [
        ]
      ],
      'city': [this.company.city, [
        ]
      ],
      'phones': [this.company.phones, [
        ]
      ],
      'emails': [this.company.emails, [
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