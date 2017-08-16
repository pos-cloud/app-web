import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User } from './../../models/user';
import { Turn } from './../../models/turn';
import { Employee } from './../../models/employee';

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
  public alertMessage: any;
  public userType: string = "admin";
  public loading: boolean = false;
  @Input() employeeSelected: Employee;
  @Input() routeRequired: Employee;
  public employees: Employee[] = new Array();

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
    public _userservice: UserService,
    public _employeeService: EmployeeService,
    public _turnService: TurnService,
    public _tableService: TableService,
    public _fb: FormBuilder,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _router: Router
    ) { 
      alertConfig.type = 'danger';
      alertConfig.dismissible = true;
    }

  ngOnInit() {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.user = new User();
    if(this.employeeSelected !== undefined){
      this.getUserOfEmployee();
    }
    this.buildForm();
  }

  public getUserOfEmployee(): void {  
    
    this._userservice.getUserOfEmployee(this.employeeSelected._id).subscribe(
      result => {
        if(!result.users) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
          this.user = null;
        } else {
          this.alertMessage = null;
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
        this.alertMessage = error._body;
        if(!this.alertMessage) {
          this.alertMessage = "Ha ocurrido un error en el servidor";
        }
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
    
    this.user = this.loginForm.value;
    this.loading = true;
    this._userservice.login(this.user).subscribe(
      result => {
        if (!result.user) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
            this.loading = false;
        } else {
          this.alertMessage = null;
          this.user = result.user;
          if(this.employeeSelected){
            this.activeModal.close(this.employeeSelected);
          } else {
            localStorage.setItem('session_token',JSON.stringify(this.user.token));
            this._router.navigate(['/pos']);
          }
          this.loading = false;
        }
      },
      error => {
        this.alertMessage = "Usuario o contraseña incorrecta" ;
        this.loading = false;
      }
    )
  }
}
