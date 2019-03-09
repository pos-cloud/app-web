import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Modelos
import { Company, CompanyType, GenderType } from './../../models/company';
import { VATCondition } from 'app/models/vat-condition';
import { CompanyGroup } from 'app/models/company-group';
import { Employee } from "app/models/employee";

//Terceros
import * as moment from 'moment';
import 'moment/locale/es';

//SERVICE
import { CompanyService } from './../../services/company.service';
import { VATConditionService } from './../../services/vat-condition.service';
import { CompanyGroupService } from "./../../services/company-group.service";
import { EmployeeService } from "./../../services/employee.service";

//PIPE
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { IdentificationType } from 'app/models/identification-type';
import { IdentificationTypeService } from 'app/services/identification-type.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCompanyComponent  implements OnInit {

  public company: Company;
  @Input() companyId: string;
  @Input() companyType: CompanyType;
  @Input() operation: string;
  @Input() readonly: boolean;
  public types: CompanyType[];
  public vatConditions: VATCondition[];
  public companiesGroup: CompanyGroup[];
  public employees: Employee[];
  public dateFormat = new DateFormatPipe();
  public identificationTypes: IdentificationType[];
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
    'identificationType': '',
    'identificationValue': '',
    'address': '',
    'city': '',
    'phones': '',
    'emails': '',
    'gender':'',
    'birthday':'',
    'observation':'',
    'allowCurrentAccount':'',
    'group':'',
    'employee':''
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
    'group':{},
    'employee': {}
  };

  constructor(
    public _companyService: CompanyService,
    public _vatConditionService: VATConditionService,
    public _companyGroupService: CompanyGroupService,
    public _employeeService: EmployeeService,
    public _identificationTypeService: IdentificationTypeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.company = new Company();
    this.types = new Array();
    this.vatConditions = new Array();
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

    this.buildForm();
    this.getVATConditions();
    this.getIdentificationTypes();
    this.getCompaniesGroup();
    this.getEmployees();

    if(this.companyId) {
      this.getCompany();
    } else {
      this.getLastCompany();
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getCompany(): void {

    this.loading = true;

    this._companyService.getCompany(this.companyId).subscribe(
      result => {
        if (!result.company) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.company = result.company;

          if (this.company.birthday) {
            this.company.birthday = moment(this.company.birthday, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
          } else {
            this.company.birthday = null;
          }
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

  public getIdentificationTypes(): void {

    this.loading = true;

    this._identificationTypeService.getIdentificationTypes().subscribe(
      result => {
        if (!result.identificationTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.identificationTypes = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.identificationTypes = result.identificationTypes;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getEmployees(): void {

    this.loading = true;

    this._employeeService.getEmployees().subscribe(
      result => {
        if (!result.employees) {
          this.employees = null;
        } else {
          this.employees = result.employees;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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
      'identificationType': [this.company.identificationType, [
        ]
      ],
      'identificationValue': [this.company.identificationValue, [
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
      'group': [this.company.group,[]],
      'employee' : [this.company.employee,[]]
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
  }

  public setValueForm(): void {

    if (!this.company._id) this.company._id = '';
    if (!this.company.code) this.company.code = 1;
    if (!this.company.name) this.company.name = '';
    if (!this.company.fantasyName) this.company.fantasyName = '';
    if (!this.company.type) CompanyType.Client;
    if (!this.company.address) this.company.address = '';
    if (!this.company.city) this.company.city = '';
    if (!this.company.phones) this.company.phones = '';
    if (!this.company.emails) this.company.emails = '';
    if (!this.company.identificationValue) this.company.identificationValue = '';
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

    let employee;
    if (!this.company.employee) {
      employee = null;
    } else {
      if (this.company.employee._id) {
        employee = this.company.employee._id;
      } else {
        employee = this.company.employee;
      }
    }

    let identificationType;
    if (!this.company.identificationType) {
      identificationType = null;
    } else {
      if (this.company.identificationType._id) {
        identificationType = this.company.identificationType._id;
      } else {
        identificationType = this.company.identificationType;
      }
    }

    const values = {
      '_id': this.company._id,
      'code': this.company.code,
      'name': this.company.name,
      'fantasyName': this.company.fantasyName,
      'type': this.company.type,
      'vatCondition': vatCondition,
      'identificationType': identificationType,
      'identificationValue': this.company.identificationValue,
      'grossIncome': this.company.grossIncome,
      'address': this.company.address,
      'city': this.company.city,
      'phones': this.company.phones,
      'emails': this.company.emails,
      'gender': this.company.gender,
      'birthday': this.company.birthday,
      'observation': this.company.observation,
      'allowCurrentAccount': this.company.allowCurrentAccount,
      'group': group,
      'employee' : employee
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
          if (this.vatConditions && this.vatConditions.length > 0) {
            this.company.vatCondition = this.vatConditions[0];
          }
          this.company.identificationType = result.companies[0].identificationType;
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

     if (!this.readonly) {
       this.company = this.companyForm.value;

       if (this.company.birthday) {
         this.company.birthday = moment(this.company.birthday, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
       }
       if(this.isValid()) {
         if (this.operation === 'add') {
           this.saveCompany();
         } else if (this.operation === 'update') {
           this.updateCompany();
         }
       }
     }
  }

  public isValid(): boolean {

    let valid: boolean = true;

    // if (this.identityTypeSelected === "" && this.company.vatCondition.description !== "Consumidor Final") {
    //   valid = false;
    //   this.showMessage("Al ingresar una condición de IVA distinta de Consumidor Final, debe ingresar el  de la empresa", "info", true);
    // }

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
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateCompany(): void {

    this.loading = true;

    this._companyService.updateCompany(this.company).subscribe(
      result => {
        if (!result.company) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.company = result.company;
          this.showMessage("La empresa se ha actualizado con éxito.", 'success', false);
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
