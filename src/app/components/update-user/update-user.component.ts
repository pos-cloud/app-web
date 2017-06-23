import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User, UserTypes, UserState } from './../../models/user';
import { Employee } from './../../models/employee';

import { UserService } from './../../services/user.service';
import { EmployeeService } from './../../services/employee.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateUserComponent implements OnInit {

  @Input() user: User;
  public userForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public states: UserState[] = [UserState.Enabled, UserState.Disabled];
  public types: UserTypes[] = [UserTypes.Supervisor, UserTypes.Employee];
  public employees: Employee[] = new Array();
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'password': '',
    'type': '',
    'state': '',
    'employee': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    },
    'password': {
      'required':       'Este campo es requerido.'
    },
    'type': {
    },
    'state': {
    },
    'employee': {
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
    this.buildForm();
    this.getEmployees();
    this.loadData(this.user);
  }

  public loadData(user: User):void {
    
    let employeeId: string = "";
    if(user.employee !== null) {
      employeeId = user.employee._id;
    }
    this.userForm.setValue({
      '_id': user._id,
      'name': user.name,
      'password': user.password,
      'type': user.type,
      'state': user.state,
      'employee': employeeId
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.userForm = this._fb.group({
      '_id': [this.user._id, [
        ]
      ],
      'name': [this.user.name, [
          Validators.required
        ]
      ],
      'password': [this.user.password, [
          Validators.required
        ]
      ],
      'type': [this.user.type, [
        ]
      ],
      'state': [this.user.state, [
        ]
      ],
      'employee': [this.user.employee, [
        ]
      ]
    });

    this.userForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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
					this.alertMessage = error;
					if(!this.alertMessage) {
						this.alertMessage = "Error en la petición.";
					}
				}
      );
   }

  public updateUser (): void {

    this.loading = true;
    this.user = this.userForm.value;
    this.getEmployee();
  }

  public getEmployee(): void {  
    
    this._employeeService.getEmployee(this.userForm.value.employee).subscribe(
        result => {
          if(!result.employee) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
          } else {
            this.alertMessage = null;
            this.user.employee = result.employee;
            this.saveChanges();
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  public saveChanges(): void {
    
    this._userService.updateUser(this.user).subscribe(
    result => {
        if (!result.user) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.user = result.user;
          this.alertConfig.type = 'success';
          this.alertMessage = "El usuario se ha actualizado con éxito.";
          this.activeModal.close('save_close');
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