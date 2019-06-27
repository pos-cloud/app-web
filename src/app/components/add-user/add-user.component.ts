import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { User, UserState } from './../../models/user';
import { Employee } from './../../models/employee';

import { UserService } from './../../services/user.service';
import { EmployeeService } from './../../services/employee.service';
import { CompanyService } from 'app/services/company.service';
import { Company } from 'app/models/company';
import { Branch } from 'app/models/branch';
import { BranchService } from 'app/services/branch.service';
import { EmployeeType } from 'app/models/employee-type';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css'],
  providers: [NgbAlertConfig]
})

export class AddUserComponent  implements OnInit {

  @Input() userId: string;
  @Input() readonly: boolean;
  @Input() operation: string;
  public user: User;
  public identity: User;
  public userForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public states: UserState[] = [UserState.Enabled, UserState.Disabled];
  public employees: Employee[] = new Array();
  public companies: Company[] = new Array();
  public branches: Branch[] = new Array();
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'email': '',
    'password': '',
    'state': '',
    'branch': '',
    'employee': '',
    'company': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    },
    'email': {
    },
    'password': {
      'required':       'Este campo es requerido.'
    },
    'state': {
      'required': 'Este campo es requerido.'
    },
    'branch': {
    },
    'employee': {
    },
    'company': {
    }
  };

  constructor(
    private _userService: UserService,
    private _employeeService: EmployeeService,
    private _companyService: CompanyService,
    private _branchService: BranchService,
    private _authService: AuthService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];

    this._authService.getIdentity.subscribe(
      identity => {
        this.identity = identity;
      },
    );

    this.user = new User ();
    if(this.userId) {
      this.getUser();
    }
    this.buildForm();
    this.getEmployees();
    this.getCompanies();
    this.getBranches();
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
      'email': [this.user.email, [
        ]
      ],
      'password': [this.user.password, [
          Validators.required
        ]
      ],
      'state': [this.user.state, [
          Validators.required
        ]
      ],
      'branch': [this.user.branch, [
        ]
      ],
      'employee': [this.user.employee, [
        ]
      ],
      'company': [this.user.company, [
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

  public getUser(): void {

    this.loading = true;

    this._userService.getUser(this.userId).subscribe(
      result => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.user = result.user;
          this.setValuesForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValuesForm(): void {

    if(!this.user._id) this.user._id = "";
    if(!this.user.name) this.user.name = "";
    if(!this.user.email) this.user.email = "";
    if(!this.user.password) this.user.password = "";
    if(!this.user.state) this.user.state = UserState.Enabled;

    let employee;
    if (!this.user.employee) {
      employee = null;
    } else {
      if (this.user.employee._id) {
        employee = this.user.employee._id;
      } else {
        employee = this.user.employee;
      }
    }

    let company;
    if (!this.user.company) {
      company = null;
    } else {
      if (this.user.company._id) {
        company = this.user.company._id;
      } else {
        company = this.user.company;
      }
    }

    let branch;
    if (!this.user.branch) {
      branch = null;
    } else {
      if (this.user.branch._id) {
        branch = this.user.branch._id;
      } else {
        branch = this.user.branch;
      }
    }

    this.userForm.setValue({
      '_id': this.user._id,
      'name': this.user.name,
      'email': this.user.email,
      'password': this.user.password,
      'state': this.user.state,
      'employee': employee,
      'company': company,
      'branch': branch
    });
  }

  public getEmployees(): void {  

    this.loading = true;
    
    this._employeeService.getEmployees().subscribe(
      result => {
        if (!result.employees) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
          this.loading = false;
          this.employees = null;
        } else {
          this.hideMessage();
          this.employees = result.employees;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCompanies(): void {

    this.loading = true;

    let query = 'sort="name":1';
    
    this._companyService.getCompanies(query).subscribe(
        result => {
					if (!result.companies) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
            this.loading = false;
					  this.companies = null;
					} else {
            this.hideMessage();
					  this.companies = result.companies;
          }
          this.loading = false;
				},
				error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
				}
      );
   }

   public getBranches(): void {

    this.loading = true;
    
    this._branchService.getBranches(
        { number:1, name: 1, operationType: 1 }, // PROJECT
        { operationType: { $ne: 'D' } }, // MATCH
        { name: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        if (result && result.branches) {
          this.branches = result.branches;
        } else {
          this.branches = new Array();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addUser(): void {
    
    this.loading = true;
    this.user = this.userForm.value;
    this.user.tokenExpiration = 1440;
    
    if (this.operation === 'add') {
      this.saveUser();
    } else if (this.operation === 'update') {
      this.updateUser();
    }
  }

  public saveUser(): void {
    
    this.loading = true;
    
    this._userService.saveUser(this.user).subscribe(
    result => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true); 
        } else {
          this.user = result.user;
          this.showMessage("El usuario se ha añadido con éxito.", 'success', false);
          this.user = new User ();
          this.buildForm();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateUser(): void {

    this._userService.updateUser(this.user).subscribe(
    result => {
        if (!result.user) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.user = result.user;
          this.showMessage("El usuario se ha actualizado con éxito.", 'success', false);
          if (this.user._id === this.user._id){
            let userStorage = new User();
            userStorage._id = result.user._id;
            userStorage.name = result.user.name;
            userStorage.email = result.user.email;
            if (result.user.employee) {
              userStorage.employee = new Employee();
              userStorage.employee._id = result.user.employee._id;
              userStorage.employee.name = result.user.employee.name;
              userStorage.employee.type = new EmployeeType();
              userStorage.employee.type._id = result.user.employee.type._id;
              userStorage.employee.type.description = result.user.employee.type.description;
            }
            sessionStorage.setItem('user', JSON.stringify(userStorage));
          }
          this.activeModal.close('save_close');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
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
    this.alertMessage = '';
  }
}