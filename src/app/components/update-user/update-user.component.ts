import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User, UserState } from './../../models/user';
import { Employee } from './../../models/employee';
import { EmployeeType } from './../../models/employee-type';

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
  public alertMessage: string = "";
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
  ) { }

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
      'state': user.state,
      'employee': employeeId,
      'tokenExpiration': user.tokenExpiration
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
      'state': [this.user.state, [
        ]
      ],
      'employee': [this.user.employee, [
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
            this.showMessage(result.message, "info", true); 
            this.loading = false;
					  this.employees = null;
					} else {
            this.hideMessage();
            this.loading = false;
					  this.employees = result.employees;
          }
				},
				error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
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
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.user.employee = result.employee;
            this.saveChanges();
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public saveChanges(): void {
    
    this._userService.updateUser(this.user).subscribe(
    result => {
        if (!result.user) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.user = result.user;
          this.showMessage("El usuario se ha actualizado con éxito.", "success", false);
          if(this._userService.getIdentity()._id === this.user._id){
            let userStorage = new User();
            userStorage._id = result.user._id;
            userStorage.name = result.user.name;
            userStorage.employee = new Employee();
            userStorage.employee._id = result.user.employee._id;
            userStorage.employee.name = result.user.employee.name;
            userStorage.employee.type = new EmployeeType();
            userStorage.employee.type._id = result.user.employee.type._id;
            userStorage.employee.type.description = result.user.employee.type.description;
            localStorage.setItem('user', JSON.stringify(userStorage));
          }
          this.activeModal.close('save_close');
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