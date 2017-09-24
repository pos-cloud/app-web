import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Employee } from './../../models/employee';
import { EmployeeType } from './../../models/employee-type';

import { EmployeeService } from './../../services/employee.service';
import { EmployeeTypeService } from './../../services/employee-type.service';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  providers: [NgbAlertConfig]
})

export class AddEmployeeComponent  implements OnInit {

  public employee: Employee;
  public employeeTypes: EmployeeType[];
  public employeeForm: FormGroup;
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'code': '',
    'name': '',
    'type': ''
  };

  public validationMessages = {
    'code': {
      'required':       'Este campo es requerido.',
      'pattern':        'No puede exceder los 5 dígitos.'
    },
    'name': {
      'required':       'Este campo es requerido.'
    },
    'type': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _employeeService: EmployeeService,
    public _employeeTypeService: EmployeeTypeService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.employee = new Employee();
    this.employeeTypes = [];
    this.getEmployeeTypes();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getEmployeeTypes(): void {  

    this.loading = true;

    this._employeeTypeService.getEmployeeTypes().subscribe(
      result => {
        if (!result.employeeTypes) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.loading = false;
          this.employeeTypes = result.employeeTypes;
          this.getLastEmployee();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getLastEmployee(): void {  

    this.loading = true;

    this._employeeService.getLastEmployee().subscribe(
        result => {
          let code = 1;
          let employeeType: EmployeeType = new EmployeeType();
          if(result.employees){
            if(result.employees[0] !== undefined) {
              code = result.employees[0].code + 1;
            }
          }
          if(this.employeeTypes[0] !== undefined) {
            employeeType = this.employeeTypes[0];
          }
          
          this.employeeForm.setValue({  
            'code': code,
            'name': '',
            'type': employeeType
          });
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
   }

  public buildForm(): void {

    this.employeeForm = this._fb.group({
      'code': [this.employee.code, [
          Validators.required,
          Validators.pattern("[0-9]{1,5}")
        ]
      ],
      'name': [this.employee.name, [
          Validators.required
        ]
      ],
      'type': [this.employee.type, [
          Validators.required
        ]
      ]
    });

    this.employeeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.employeeForm) { return; }
    const form = this.employeeForm;

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

  public addEmployee(): void {
    
    this.loading = true;
    this.employee = this.employeeForm.value;
    this.saveEmployee();
  }

  public saveEmployee(): void {
    
    this.loading = true;
    
    this._employeeService.saveEmployee(this.employee).subscribe(
    result => {
        if (!result.employee) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.employee = result.employee;
          this.showMessage("El empleado se ha añadido con éxito.", "success", false);
          this.employee = new Employee();
          this.buildForm();
          this.getEmployeeTypes();
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