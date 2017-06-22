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
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': '',
    'type': ''
  };

  public validationMessages = {
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
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.employee = new Employee();
    this.getEmployeeTypes();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getEmployeeTypes(): void {  

    this._employeeTypeService.getEmployeeTypes().subscribe(
      result => {
        if(!result.employeeTypes) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
          this.employeeTypes = null;
        } else {
          this.alertMessage = null;
          this.employeeTypes = result.employeeTypes;
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

  public buildForm(): void {

    this.employeeForm = this._fb.group({
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
    
    this._employeeService.saveEmployee(this.employee).subscribe(
    result => {
        if (!result.employee) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.employee = result.employee;
          this.alertConfig.type = 'success';
          this.alertMessage = "El tipo de empleado se ha añadido con éxito.";      
          this.employee = new Employee();
          this.buildForm();
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