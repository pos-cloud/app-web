import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UserState } from '../user/user';

import { EmployeeService } from '../employee/employee.service';
import { EmployeeTypeService } from '../employee-type/employee-type.service';
import { CompanyService } from '../company/company.service';
import { AuthService } from 'app/components/login/auth.service';
import { Employee } from '../employee/employee';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [NgbAlertConfig]
})

export class RegisterComponent implements OnInit {

  public registerForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public states: UserState[] = [UserState.Enabled, UserState.Disabled];
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();
  public categories: string[] = ["Restaurante", "Delivery", "Bar", "Tienda de ropa", "Cafetería", "Kiosco", "Venta de productos","Otro"];

  public formErrors = {
    'employeeName': '',
    'companyName': '',
    'category': '',
    'email': '',
    'phone': ''
  };

  public validationMessages = {
    'employeeName': {
      'required': 'Este campo es requerido.'
    },
    'companyName': {
      'required': 'Este campo es requerido.'
    },
    'category': {
      'required': 'Este campo es requerido.'
    },
    'email': {
      'required': 'Este campo es requerido.',
      'pattern': 'El email ingresado no es válido'
    },
    'phone': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _companyService: CompanyService,
    public _authService: AuthService,
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.registerForm = this._fb.group({
      'employeeName': ['', [
          Validators.required
        ]
      ],
      'companyName': ['', [
          Validators.required
        ]
      ],
      'category': ['', [
          Validators.required
        ]
      ],
      'email': ['', [
          Validators.required,
          Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")
        ]
      ],
      'phone': ['', [
          Validators.required
        ]
      ],
      'counter': [true, [
        ]
      ],
      'resto': [false, [
        ]
      ],
      'delivery': [false, [
        ]
      ],
      'purchase': [false, [
        ]
      ],
      'stock': [false, [
        ]
      ],
      'money': [false, [
      ]
    ]
    });

    this.registerForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {
 
    if (!this.registerForm) { return; }
    const form = this.registerForm;

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

  public checkModules(category: string) {

    switch(category) {
      case "Restaurante": 
        this.registerForm.value.resto = true;
        this.registerForm.value.delivery = false;
        break;
      case "Delivery":
        this.registerForm.value.resto = false;
        this.registerForm.value.delivery = true;
        break;
      case "Bar":
        this.registerForm.value.resto = true;
        this.registerForm.value.delivery = false;
        break;
      case "Tienda de ropa":
        this.registerForm.value.resto = false;
        this.registerForm.value.delivery = false;
        break;
      case "Cafetería":
        this.registerForm.value.resto = true;
        this.registerForm.value.delivery = false;
        break;
      case "Kiosco":
        this.registerForm.value.resto = false;
        this.registerForm.value.delivery = false;
        break;
      case "Venta de productos":
        this.registerForm.value.resto = false;
        this.registerForm.value.delivery = false;
        break;
      case "Otro":
        this.registerForm.value.resto = false;
        this.registerForm.value.delivery = false;
        break;
    }

    this.setValueForm();
  }

  public setValueForm(): void {

    this.registerForm.setValue({
      'employeeName': this.registerForm.value.employeeName,
      'companyName': this.registerForm.value.companyName,
      'category': this.registerForm.value.category,
      'email': this.registerForm.value.email,
      'phone': this.registerForm.value.phone,
      'counter': this.registerForm.value.counter,
      'resto': this.registerForm.value.resto,
      'delivery': this.registerForm.value.delivery,
      'purchase': this.registerForm.value.purchase,
      'stock': this.registerForm.value.stock,
      'money' : this.registerForm.value.money
    });
  }

  public register(): void {

    if (this.isDBNameValid(this.registerForm.value.companyName)) {

      this.loading = true;
      
      this._authService.register(this.registerForm.value).subscribe(
        result => {
          if (!result.user) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          } else {
            this.showMessage("Ha sido registrado correctamente, le enviamos a la casilla de correo los datos necesarios para ingresar POS Cloud.", 'success', false);
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.showMessage("No se aceptan los siguientes caractéres en el nombre de negocio: '.', '&', '@'", 'info', true);
    }
  }

  public isDBNameValid(dbName: string): boolean {

    let isValid: boolean = false;

    if (dbName.indexOf('.') === -1 &&
        dbName.indexOf('&') === -1 &&
        dbName.indexOf('@') === -1) {
      isValid = true;
    }

    return isValid;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}