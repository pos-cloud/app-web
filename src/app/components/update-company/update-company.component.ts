import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType } from './../../models/company';
import { VATCondition } from 'app/models/vat-condition';

import { CompanyService } from './../../services/company.service';
import { VATConditionService } from './../../services/vat-condition.service';

@Component({
  selector: 'app-update-company',
  templateUrl: './update-company.component.html',
  styleUrls: ['./update-company.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateCompanyComponent implements OnInit {

  @Input() company: Company;
  @Input() readonly: boolean;
  public types: CompanyType[];
  public vatConditions: VATCondition[];
  public identityTypes: string[] = ["CUIT", "DNI"];
  public identityTypeSelected: string;
  public companyForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': 1,
    'name': '',
    'fantasyName': '',
    'type': '',
    'vatCondition': '',
    'CUIT': '',
    'DNI': '',
    'address': '',
    'city': '',
    'phones': '',
    'emails': ''

  };

  public validationMessages = {
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
    'vatCondition': {
      'required': 'Este campo es requerido.'
    },
    'CUIT': {
      'minlength': 'El CUIT debe contener 13 díguitos.',
      'maxlength': 'El CUIT debe contener 13 díguitos.',
      'pattern': ' Ingrese el CUIT con formato con guiones'
    },
    'DNI': {
      'minlength': 'El DNI debe contener 8 díguitos.',
      'maxlength': 'El DNI debe contener 8 díguitos.'
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
    public _companyService: CompanyService,
    public _vatCondition: VATConditionService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    this.types = new Array();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (pathLocation[2] === "clientes") {
      this.types.push(CompanyType.Client);
    } else if (pathLocation[2] === "proveedores") {
      this.types.push(CompanyType.Provider);
    } else {
      this.types.push(CompanyType.Client);
      this.types.push(CompanyType.Provider);
    }

    this.vatConditions = new Array();
    
    this.buildForm();
    this.getVATConditions();

    if (this.company.DNI && this.company.DNI !== "") {
      this.identityTypeSelected = "DNI";
    } else {
      this.identityTypeSelected = "CUIT";
    }

    this.setValueForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

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
      'vatCondition': [this.company.vatCondition, [
          Validators.required
        ]
      ],
      'identityType': [this.identityTypeSelected, [
        ]
      ],
      'CUIT': [this.company.CUIT, [
          Validators.maxLength(13),
          Validators.minLength(13),
          Validators.pattern('^[0-9]{2}-[0-9]{8}-[0-9]$')
        ]
      ],
      'DNI': [this.company.DNI, [
          Validators.maxLength(8),
          Validators.minLength(8)
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

  public setValueForm(): void {

    if (!this.company._id) this.company._id = "";
    if (!this.company.code) this.company.code = 0;
    if (!this.company.name) this.company.name = "";
    if (!this.company.fantasyName) this.company.fantasyName = "";
    if (!this.company.type) CompanyType.Client;
    if (!this.identityTypeSelected) this.company.DNI = "";
    if (!this.company.CUIT) this.company.CUIT = "";
    if (!this.company.DNI) this.company.DNI = "";
    if (!this.company.address) this.company.address = "";
    if (!this.company.city) this.company.city = "";
    if (!this.company.phones) this.company.phones = "";
    if (!this.company.emails) this.company.emails = "";
    
    if (this.company.DNI && this.company.DNI !== "") {
      this.identityTypeSelected = "DNI";
    } else {
      this.identityTypeSelected = "CUIT";
    }
    
    this.companyForm.setValue({
      '_id': this.company._id,
      'code': this.company.code,
      'name': this.company.name,
      'fantasyName': this.company.fantasyName,
      'type': this.company.type,
      'vatCondition': this.company.vatCondition._id,
      'identityType': this.identityTypeSelected,
      'CUIT': this.company.CUIT,
      'DNI': this.company.DNI,
      'address': this.company.address,
      'city': this.company.city,
      'phones': this.company.phones,
      'emails': this.company.emails
    });
  }

  public getVATConditions(): void {

    this.loading = true;

    this._vatCondition.getVATConditions().subscribe(
      result => {
        if (!result.vatConditions) {
          this.showMessage(result.message, "info", true);
        } else {
          this.vatConditions = result.vatConditions;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public onValueChanged(data?: any): void {

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

    this.identityTypeSelected = this.companyForm.value.identityType;
    if (this.identityTypeSelected === "CUIT") {
      this.companyForm.value.DNI = "";
    } else {
      this.companyForm.value.CUIT = "";
    }
  }

  public updateCompany (): void {
    if(!this.readonly) {
      if (this.identityTypeSelected === "CUIT") {
        this.companyForm.value.DNI = "";
      } else {
        this.companyForm.value.CUIT = "";
      }
      this.company = this.companyForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {
    
    this.loading = true;
    
    this._companyService.updateCompany(this.company).subscribe(
    result => {
        if (!result.company) {
          this.showMessage(result.message, "info", true);
        } else {
          this.company = result.company;
          this.showMessage("La empresa se ha actualizado con éxito.", "success", false);
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}