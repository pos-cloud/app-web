import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType, GenderType } from './../../models/company';
import { VATCondition } from 'app/models/vat-condition';
import { CompanyGroup } from 'app/models/company-group';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyService } from './../../services/company.service';
import { VATConditionService } from './../../services/vat-condition.service';
import { CompanyGroupService } from "./../../services/company-group.service";
import { DateFormatPipe } from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCompanyComponent  implements OnInit {

  public company: Company;
  @Input() companyType: CompanyType;
  public types: CompanyType[];
  public vatConditions: VATCondition[];
  public companiesGroup: CompanyGroup[];
  public dateFormat = new DateFormatPipe();
  public identityTypes: string[] = ["DNI","CUIT"];
  public identityTypeSelected: string;
  public companyForm: FormGroup;
  public alertMessage: string = '';
  public genders: any[] = ['', GenderType.Male, GenderType.Female];
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': '',
    'name': '',
    'fantasyName': '',
    'type': '',
    'vatCondition': '',
    'identityType' : '',
    'CUIT': '',
    'DNI': '',
    'address': '',
    'city': '',
    'phones': '',
    'emails': '',
    'gender':'',
    'birthday':'',
    'observation':'',
    'allowCurrentAccount':'',
    'group':''
  };

  public validationMessages = {
    'code': {
      'required':       'Este campo es requerido.'
    },
    'name': {
      'required':       'Este campo es requerido.'
    },
    'fantasyName': {
    },
    'type': {
      'required':       'Este campo es requerido.'
    },
    'vatCondition': {
      'required': 'Este campo es requerido.'
    },
    'identityType' : {
      'required': 'Este campo es requerido.'
    },
    'CUIT': {
      'minlength':      'El CUIT debe contener 13 díguitos.',
      'maxlength':      'El CUIT debe contener 13 díguitos.',
      'pattern':        ' Ingrese el CUIT con formato con guiones'
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
    },
    'birthday': {
      'dateValid': ' Ingrese en formato DD/MM/AAAA'
    },
    'gender': {
    },
    'observation':{},
    'allowCurrentAccount':{},
    'group':{}
  };

  constructor(
    public _companyService: CompanyService,
    public _vatConditionService: VATConditionService,
    public _companyGroupService: CompanyGroupService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.types = new Array();
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if ( pathLocation[2] === "clientes" ||
      this.companyType && this.companyType === CompanyType.Client) {
      this.types.push(CompanyType.Client);
    } else if (pathLocation[2] === "proveedores" ||
      this.companyType && this.companyType === CompanyType.Provider) {
      this.types.push(CompanyType.Provider);
    } else {
      this.types.push(CompanyType.Client);
      this.types.push(CompanyType.Provider);
    }

    this.company = new Company();
    this.vatConditions = new Array();
    this.company.type = this.types[0];
    this.buildForm();
    this.getVATConditions();
    this.getCompaniesGroup();
    this.getLastCompany();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCompaniesGroup(): void {
    this.loading = true;

    this._companyGroupService.getCompaniesGroup().subscribe(
      result => {
        if (!result.companiesGroup) {
        } else {
          this.companiesGroup = result.companiesGroup;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {

    this.companyForm = this._fb.group({
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
      'identityType': [this.identityTypes[0], [
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
      'grossIncome': [this.company.grossIncome, [
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
      ],
      'birthday': [null, [
        ]
      ],
      'gender' : [this.company.gender,[
        ]
      ],
      'observation': [this.company.observation,[]],
      'allowCurrentAccount': [this.company.observation,[]],
      'group': [this.company.group,[]]
    });

    this.companyForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
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
  }

  public setValueForm(): void {

    if (!this.company._id) this.company._id = '';
    if (!this.company.code) this.company.code = 1;
    if (!this.company.name) this.company.name = '';
    if (!this.company.fantasyName) this.company.fantasyName = '';
    if (!this.company.type) CompanyType.Client;
    if (!this.identityTypeSelected) this.company.DNI = '';
    if (!this.company.CUIT) this.company.CUIT = '';
    if (!this.company.DNI) this.company.DNI = '';
    if (!this.company.address) this.company.address = '';
    if (!this.company.city) this.company.city = '';
    if (!this.company.phones) this.company.phones = '';
    if (!this.company.emails) this.company.emails = '';
    if (this.company.birthday) {
      this.company.birthday = moment(this.company.birthday).format('YYYY-MM-DD');
    } else {
      this.company.birthday = null;
    }
    if (!this.company.gender && this.genders.length > 0) this.company.gender = null;
    if (!this.company.gender) this.company.gender = null;

    let vatCondition: VATCondition = null;

    if (!this.company.vatCondition) {
      if (!this.vatConditions || this.vatConditions.length === 0) {
        vatCondition = null;
      } else {
        vatCondition = this.vatConditions[0];
      }
    } else {
      vatCondition = this.company.vatCondition;
    }
    if(!this.company.observation) this.company.observation = '';
    if(this.company.allowCurrentAccount === undefined) {
      if(this.company.type === CompanyType.Client) {
        this.company.allowCurrentAccount = false;
      } else {
        this.company.allowCurrentAccount = true;
      }
    }
    if (!this.company.grossIncome) this.company.grossIncome = '';

    let group;
    if (!this.company.group) {
      group = null;
    } else {
      if (this.company.group._id) {
        group = this.company.group._id;
      } else {
        group = this.company.group;
      }
    }

    const values = {
      'code': this.company.code,
      'name': this.company.name,
      'fantasyName': this.company.fantasyName,
      'type': this.company.type,
      'vatCondition': vatCondition,
      'identityType': this.identityTypeSelected,
      'CUIT': this.company.CUIT,
      'DNI': this.company.DNI,
      'grossIncome': this.company.grossIncome,
      'address': this.company.address,
      'city': this.company.city,
      'phones': this.company.phones,
      'emails': this.company.emails,
      'gender': this.company.gender,
      'birthday': this.company.birthday,
      'observation': this.company.observation,
      'allowCurrentAccount': this.company.allowCurrentAccount,
      'group': group
    };

    this.companyForm.setValue(values);
  }

  public getVATConditions(): void {

    this.loading = true;

    this._vatConditionService.getVATConditions().subscribe(
      result => {
        if (!result.vatConditions) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.vatConditions = result.vatConditions;
          this.company.vatCondition = this.vatConditions[0];
          if(this.company.vatCondition && this.company.vatCondition.description === "Consumidor Final") {
            this.identityTypeSelected = "DNI";
          } else {
            this.identityTypeSelected = "CUIT";
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getLastCompany(): void {

    this.loading = true;

    this._companyService.getLastCompany().subscribe(
        result => {
          let code = 1;
          if (result.companies){
            if (result.companies[0] !== undefined) {
              code = result.companies[0].code + 1;
            }
          }

          this.company.code = code;
          this.company.vatCondition = this.vatConditions[0];
          this.identityTypeSelected = this.identityTypes[0];
          this.setValueForm();
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
   }


   public addCompany(): void {

    if (this.identityTypeSelected === "CUIT") {
      this.companyForm.value.DNI = '';
    } else {
      this.companyForm.value.CUIT = '';
    }
    this.company = this.companyForm.value;

    if (this.company.birthday) {
      this.company.birthday = moment(this.company.birthday, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if(this.isValid()) {
      this.saveCompany();
    }
  }

  public isValid(): boolean {

    let valid: boolean = true;


    if (this.identityTypeSelected === "DNI" && this.company.vatCondition.description !== "Consumidor Final") {
      valid = false;
      this.showMessage("Al ingresar una condición de IVA distinta de Consumidor Final, debe ingresar el CUIT de la empresa", "info", true);
    }

    return valid;
  }

  public saveCompany(): void {

    this.loading = true;

    this._companyService.saveCompany(this.company).subscribe(
    result => {
        if (!result.company) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.company = result.company;
          this.showMessage("La empresa se ha añadido con éxito.", 'success', false);
          this.company = new Company ();
          this.buildForm();
          this.getLastCompany();
          this.identityTypeSelected = "CUIT";
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
