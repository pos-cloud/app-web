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
  public loginForm: FormGroup;
  public alertMessage: string;
  public loading: boolean = false;
  @Input() employeeSelected: Employee;
  @Input() routeRequired: Employee;
  public employees: Employee[] = new Array();
  public token: string;
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
      this.alertMessage = "";
    }

  ngOnInit() {

    this.user = new User();

    if (this.employeeSelected !== undefined) {
      this.getUserOfEmployee();
      this.employees.push(this.employeeSelected);
    }
    
    this.buildForm();
  }

  ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public getUserOfEmployee(): void {  
    
    this.loading = true;
    
    this._userService.getUserOfEmployee(this.employeeSelected._id).subscribe(
      result => {
        if(!result.users) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
          this.user = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.user = result.users[0];
          this.loginForm.setValue({
            '_id': this.user._id,
            'name': this.user.name,
            'password': '',
            'state': this.user.state,
            'employee': this.user.employee._id
          });
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
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
      ],
      'employee': [this.user.employee, [
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
    
    if(this.employeeSelected) {
      this.loginWaiter();
    } else {
      this.loginSupervisor();
    }
  } 

  public loginWaiter(): void {

    this.user = this.loginForm.value;
    this.loading = true;

    //Obtener el usuario
    this._userService.login(this.user).subscribe(
      result => {
        if (!result.user.employee) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.activeModal.close(result.user.employee);
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    )
  }

  public loginSupervisor(): void {
    
    this.user = this.loginForm.value;
    this.loading = true;

    //Obtener el usuario
    this._userService.login(this.user).subscribe(
      result => {
        if (!result.user) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          let userStorage = new User();
          userStorage._id = result.user._id;
          userStorage.name = result.user.name;
          userStorage.employee = new Employee();
          userStorage.employee._id = result.user.employee._id;
          userStorage.employee.name = result.user.employee.name;
          userStorage.employee.type = new EmployeeType();
          userStorage.employee.type._id = result.user.employee.type._id;
          userStorage.employee.type.description = result.user.employee.type.description;
          sessionStorage.setItem('user', JSON.stringify(userStorage));

          //Obtener el token del usuario
          this._userService.login(this.user, true).subscribe(
            result => {
              if (!result.token) {
                this.showMessage(result.message, "info", true);
                this.loading = false;
              } else {
                this.hideMessage();
                if (!result.token) {
                  this.showMessage("El token no se ha generado correctamente", "info", true);
                } else {
                  this.token = result.token;
                  sessionStorage.setItem('session_token', this.token);
                  this.activeModal.close(this.user);
                }

                this.loading = false;
              }
            });
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

  public hideMessage():void {
    this.alertMessage = "";
  }
}
