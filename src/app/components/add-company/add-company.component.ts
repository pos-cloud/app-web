import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType } from './../../models/company';

import { CompanyService } from './../../services/company.service';

@Component({
  selector: 'app-add-company',
  templateUrl: './add-company.component.html',
  styleUrls: ['./add-company.component.css'],
  providers: [NgbAlertConfig]
})

export class AddCompanyComponent  implements OnInit {

  private company: Company;
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

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.company = new Company ();
    this.buildForm();
    this.getLastCompany();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  private buildForm(): void {

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
    this.focusEvent.emit(true);
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

  private getLastCompany(): void {  

    this._companyService.getLastCompany().subscribe(
        result => {
          let code = 1;
          if(result.companies){
            if(result.companies[0] !== undefined) {
              code = result.companies[0].code;
            }
          }
          // this.companyForm.setValue({
          //   'code': code,
          //   'name': '',
          //   'fantasyName': '',
          //   'type': '',
          //   'CUIT': '',
          //   'address': '',
          //   'city': '',
          //   'phones': '',
          //   'emails': ''
          // });
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  private addCompany(): void {
    
    this.loading = true;
    this.company = this.companyForm.value;
    this.saveCompany();
  }

  private saveCompany(): void {
    
    this._companyService.saveCompany(this.company).subscribe(
    result => {
        if (!result.company) {
          this.alertMessage = result.message;
        } else {
          this.company = result.company;
          this.alertConfig.type = 'success';
          this.alertMessage = "La empresa se ha añadido con éxito.";      
          this.company = new Company ();
          this.buildForm();
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