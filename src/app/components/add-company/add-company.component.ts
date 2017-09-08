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

  public company: Company;
  public types: CompanyType[] = [CompanyType.Client];
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
    'CUIT': '',
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
    'CUIT': {
      'minlength':      'El CUIT debe contener 13 díguitos.',
      'maxlength':      'El CUIT debe contener 13 díguitos.',
      'pattern':        ' Ingrese el CUIT con formato con guiones'
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
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.company = new Company ();
    this.getLastCompany();
    this.buildForm();
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
      'CUIT': [this.company.CUIT, [
          Validators.maxLength(13),
          Validators.minLength(13),
          Validators.pattern('^[0-9]{2}-[0-9]{8}-[0-9]$')
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
            'CUIT': '',
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
    
    this.loading = true;
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