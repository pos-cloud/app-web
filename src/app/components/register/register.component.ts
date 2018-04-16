import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User, UserState } from './../../models/user';
import { Employee } from './../../models/employee';
import { EmployeeType } from './../../models/employee-type';
import { Company } from '../../models/company';

import { UserService } from './../../services/user.service';
import { EmployeeService } from './../../services/employee.service';
import { EmployeeTypeService } from './../../services/employee-type.service';
import { CompanyService } from './../../services/company.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [NgbAlertConfig]
})

export class RegisterComponent implements OnInit {

  public registerForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public states: UserState[] = [UserState.Enabled, UserState.Disabled];
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();
  public categories: string[] = ["Restaurante", "Delivery", "Bar", "Tienda de ropa", "Cafetería", "Kiosco", "Venta de artículos","Otro"];

  public formErrors = {
    'employeeName': '',
    'companyName': '',
    'category': '',
    'email': '',
    'phone': '',
    'counter': '',
    'resto': '',
    'delivery': '',
    'electronicTransaction': ''
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
      'required': 'Este campo es requerido.'
    },
    'phone': {
      'required': 'Este campo es requerido.'
    },
    'counter': {
    },
    'resto': {
    },
    'delivery': {
    },
    'electronicTransaction': {
    }
  };

  constructor(
    public _companyService: CompanyService,
    public _userService: UserService,
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
          Validators.required
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
      'electronicTransaction': [false, [
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
      case "Venta de artículos":
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
      'electronicTransaction': this.registerForm.value.electronicTransaction,
    });
  }

  public register(): void {

    this.loading = true;
    this._userService.register(this.registerForm.value).subscribe(
      result => {
        if(!result.user) {
          this.showMessage(result.message, "info", true);
        } else {
          this.login(result.user);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public login(user): void {

    this.showMessage("Comprobando usuario...", "info", false);
    this.loading = true;
    
    localStorage.setItem('database', this.registerForm.value.companyName.replace(/ /g, '_').toLocaleLowerCase());

    //Obtener el token del usuario
    this._userService.login(user).subscribe(
      result => {
        if (!result.user) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.showMessage("Ingresando...", "success", false);
          user = result.user;
          let userStorage = new User();
          userStorage._id = user._id;
          userStorage.name = user.name;
          if (user.employee) {
            userStorage.employee = new Employee();
            userStorage.employee._id = user.employee._id;
            userStorage.employee.name = user.employee.name;
            userStorage.employee.type = new EmployeeType();
            userStorage.employee.type._id = user.employee.type._id;
            userStorage.employee.type.description = user.employee.type.description;
          }
          sessionStorage.setItem('user', JSON.stringify(userStorage));
          sessionStorage.setItem('session_token', user.token);
          this._router.navigate(['/']);
          location.reload();

          this.loading = false;
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}