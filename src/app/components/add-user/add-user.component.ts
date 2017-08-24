import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User, UserState } from './../../models/user';
import { Employee } from './../../models/employee';

import { UserService } from './../../services/user.service';
import { EmployeeService } from './../../services/employee.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  providers: [NgbAlertConfig]
})

export class AddUserComponent  implements OnInit {

  public user: User;
  public userForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public states: UserState[] = [UserState.Enabled, UserState.Disabled];
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'password': '',
    'state': '',
    'employee': '',
    'tokenExpiration': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    },
    'password': {
      'required':       'Este campo es requerido.'
    },
    'state': {
    },
    'employee': {
      'required':       'Este campo es requerido.'
    },
    'tokenExpiration': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _userService: UserService,
    public _employeeService: EmployeeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.user = new User ();
    this.buildForm();
    this.getEmployees();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.userForm = this._fb.group({
      'name': [this.user.name, [
          Validators.required
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
          Validators.required
        ]
      ],
      'tokenExpiration': [this.user.tokenExpiration, [
          Validators.required
        ]
      ]
    });

    this.userForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.userForm) { return; }
    const form = this.userForm;

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

  public getEmployees(): void {  

    this._employeeService.getEmployees().subscribe(
        result => {
					if(!result.employees) {
						this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
					  this.employees = null;
					} else {
            this.alertMessage = null;
					  this.employees = result.employees;
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

  public addUser(): void {
    
    this.loading = true;
    this.user = this.userForm.value;
    this.saveUser();
  }

  public saveUser(): void {
    
    this._userService.saveUser(this.user).subscribe(
    result => {
        if (!result.user) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.user = result.user;
          this.alertMessage = "El usuario se ha añadido con éxito.";  
          this.alertConfig.type = 'success';    
          this.user = new User ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
        this.loading = false;
      }
    );
  }
}