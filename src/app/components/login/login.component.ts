import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { Turn } from './../../models/turn';
import { Employee } from './../../models/employee';
import { EmployeeType } from './../../models/employee-type';

import { UserService } from './../../services/user.service';
import { TurnService } from './../../services/turn.service';
import { EmployeeService } from './../../services/employee.service';
import { TableService } from './../../services/table.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [NgbAlertConfig]
})

export class LoginComponent implements OnInit {

  public user: User;
  public database: string;
  public loginForm: FormGroup;
  public alertMessage: string;
  public loading: boolean = false;
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'password': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    },
    'password': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _userService: UserService,
    public _employeeService: EmployeeService,
    public _turnService: TurnService,
    public _tableService: TableService,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _router: Router,
    private _route: ActivatedRoute
    ) { 
      this.alertMessage = '';
      this.database = this._userService.getDatabase();
    }

  ngOnInit() {

    this.user = new User();    
    this.buildForm();
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.loginForm = this._fb.group({
      '_id': [this.user._id, [
        ]
      ],
      'name': [this.user.name, [
        ]
      ],
      'password': [this.user.password, [
        Validators.required
        ]
      ],
      'state': [this.user.state, [
        ]
      ]
    });

    this.loginForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.loginForm) { return; }
    const form = this.loginForm;

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

  public login(): void {
    
    this.isDatabaseValid();
  }

  public isDatabaseValid(): void {
    
    let isValid: boolean = true;

    if (this.database || this.loginForm.value.name.indexOf('@') !== -1) {
      if (this.loginForm.value.name.indexOf('@') !== -1 &&
          this.loginForm.value.name.split("@")[1] !== '') {
        let dbName = this.loginForm.value.name.split("@")[1];
            if (this.isDBNameValid(dbName)) {
              localStorage.setItem('database', this.loginForm.value.name.split("@")[1].toLowerCase());
            } else {
              isValid = false;
              this.showMessage("El usuario y/o contraseña son incorrectos", 'info', true);  
            }
      } else if (!this.database) {
        isValid = false;
        this.showMessage("El usuario y/o contraseña son incorrectos", 'info', true);  
      }
    } else {
      isValid = false;
      this.showMessage("El usuario y/o contraseña son incorrectos", 'info', true);
    }

    if (isValid) {
      this.login2();
    }
  }

  public isDBNameValid(dbName: string): boolean {

    let isValid: boolean = false;

    if ( dbName.indexOf('.') === -1 &&
        dbName.indexOf('&') === -1 &&
        dbName.indexOf('@') === -1) {
          isValid = true;
    }

    return isValid;
  }

  public login2() : void {

    if (this.database && this.loginForm.value.name.indexOf('@') === -1) {
      this.user.name = this.loginForm.value.name;
    } else {
      this.user.name = this.loginForm.value.name.split("@")[0];
    }
    this.user.password = this.loginForm.value.password;

    this.showMessage("Comprobando usuario...", 'info', false);
    this.loading = true;

    //Obtener el token del usuario
    this._userService.login(this.user).subscribe(
      result => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.showMessage("Ingresando...", 'success', false);
          this.user = result.user;
          let userStorage = new User();
          userStorage._id = this.user._id;
          userStorage.name = this.user.name;
          if (this.user.employee) {
            userStorage.employee = new Employee();
            userStorage.employee._id = this.user.employee._id;
            userStorage.employee.name = this.user.employee.name;
            userStorage.employee.type = new EmployeeType();
            userStorage.employee.type._id = this.user.employee.type._id;
            userStorage.employee.type.description = this.user.employee.type.description;
          }
          sessionStorage.setItem('user', JSON.stringify(userStorage));
          sessionStorage.setItem('session_token', this.user.token);
          this.activeModal.close({ user: this.user });
          this.loading = false;
        }
      },
      error => {
        if (error.status === 0) {
          this.showMessage("Error de conexión con el servidor. Comunicarse con Soporte.", 'danger', false);
        } else {
          this.showMessage(error._body, 'danger', false);
        }
        this.loading = false;
      }
    )
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
