import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Employee } from './../../models/employee';

import { EmployeeService } from './../../services/employee.service';

@Component({
  selector: 'app-update-employee',
  templateUrl: './update-employee.component.html',
  styleUrls: ['./update-employee.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateEmployeeComponent implements OnInit {

  @Input() employee: Employee;
  public employeeForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'name': ''
  };

  public validationMessages = {
    'name': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
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
    this.employeeForm.setValue({
      '_id': this.employee._id,
      'name': this.employee.name
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.employeeForm = this._fb.group({
      '_id': [this.employee._id, [
        ]
      ],
      'name': [this.employee.name, [
          Validators.required
        ]
      ]
    });

    this.employeeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public updateEmployee (): void {

    this.loading = true;
    this.employee = this.employeeForm.value;
    this.saveChanges();
  }

  public saveChanges(): void {
    
    this._employeeService.updateEmployee(this.employee).subscribe(
    result => {
        if (!result.employee) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.employee = result.employee;
          this.alertConfig.type = 'success';
          this.alertMessage = "El empleado se ha actualizado con éxito.";
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