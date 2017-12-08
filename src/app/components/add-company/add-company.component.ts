import { Component, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType } from './../../models/company';
import { VATCondition } from 'app/models/vat-condition';

import { CompanyService } from './../../services/company.service';
import { VATConditionService } from './../../services/vat-condition.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCompanyComponent  implements OnInit {

  public company: Company;
  public types: CompanyType[] = [CompanyType.Client];
  public vatConditions: VATCondition[];
  public identityTypes: string[] = ["CUIT","DNI"];
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
    'identityType' : '',
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
    }
  };

  constructor(
    public _companyService: CompanyService,
    public _vatCondition: VATConditionService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.vatConditions = new Array();
    this.getVATConditions();
    this.company = new Company ();
    this.getLastCompany();
    this.buildForm();
    this.identityTypeSelected = "CUIT";
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
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
    console.log(this.identityTypeSelected);
    if (this.identityTypeSelected === "CUIT") {
      this.companyForm.value.DNI = "";
    } else {
      this.companyForm.value.CUIT = "";
    }
    this.cdref.detectChanges();
  }

  public getVATConditions(): void {

    this.loading = true;

    this._vatCondition.getVATConditions().subscribe(
      result => {
        if (!result.vatConditions) {
          this.saveVATConditions();
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

  public saveVATConditions(): void {

    this.loading = true;
    let vatConditionCF = new VATCondition();
    vatConditionCF.code = 3;
    vatConditionCF.description = "Consumidor Final";
    vatConditionCF.discriminate = "No";
    vatConditionCF.transactionLetter = "B";

    this._vatCondition.saveVATCondition(vatConditionCF).subscribe(
      result => {
        if (!result.vatCondition) {
          this.showMessage(result.message, "info", true);
        } else {
          let vatConditionRI = new VATCondition();
          vatConditionRI.code = 1;
          vatConditionRI.description = "Responsable Inscripto";
          vatConditionRI.discriminate = "Si";
          vatConditionRI.transactionLetter = "A";

          this._vatCondition.saveVATCondition(vatConditionRI).subscribe(
            result => {
              if (!result.vatCondition) {
                this.showMessage(result.message, "info", true);
              } else {
                let vatConditionM = new VATCondition();
                vatConditionM.code = 2;
                vatConditionM.description = "Monotributista";
                vatConditionM.discriminate = "No";
                vatConditionM.transactionLetter = "B";

                this._vatCondition.saveVATCondition(vatConditionM).subscribe(
                  result => {
                    if (!result.vatCondition) {
                      this.showMessage(result.message, "info", true);
                    } else {
                      this.getVATConditions();
                    }
                    this.loading = false;
                  },
                  error => {
                    this.showMessage(error._body, "danger", false);
                    this.loading = false;
                  }
                );
              }
              this.loading = false;
            },
            error => {
              this.showMessage(error._body, "danger", false);
              this.loading = false;
            }
          );
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getLastCompany(): void {  

    this.loading = true;
    
    this._companyService.getLastCompany().subscribe(
        result => {
          let code = 1;
          if(result.companies){
            if(result.companies[0] !== undefined) {
              code = result.companies[0].code + 1;
            }
          }
          
          this.companyForm.setValue({
            'code': code,
            'name': '',
            'fantasyName': '',
            'type': CompanyType.Client,
            'vatCondition': this.vatConditions[0],
            'identityType': this.identityTypes[0],
            'CUIT': '',
            'DNI': '',
            'address': '',
            'city': '',
            'phones': '',
            'emails': ''
          });
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  
   public addCompany(): void {
    
    if (this.identityTypeSelected === "CUIT") {
      this.companyForm.value.DNI = "";
    } else {
      this.companyForm.value.CUIT = "";
    }
    this.company = this.companyForm.value;
    this.saveCompany();
  }

  public saveCompany(): void {
    
    this.loading = true;
    
    this._companyService.saveCompany(this.company).subscribe(
    result => {
        if (!result.company) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.company = result.company;
          this.showMessage("La empresa se ha añadido con éxito.", "success", false);
          this.company = new Company ();
          this.getLastCompany();
          this.buildForm();
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