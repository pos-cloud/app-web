import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Employee } from './../../models/employee';
import { EmployeeType } from './../../models/employee-type';

import { EmployeeService } from './../../services/employee.service';
import { EmployeeTypeService } from './../../services/employee-type.service';

@Component({
  selector: 'app-update-employee',
  templateUrl: './update-employee.component.html',
  styleUrls: ['./update-employee.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateEmployeeComponent implements OnInit {

  @Input() employee: Employee;
  @Input() readonly: boolean;
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
    public alertConfig: NgbAlertConfig,
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getEmployeeTypes();
    this.buildForm();
    this.employeeForm.setValue({
      '_id': this.employee._id,
      'code': this.employee.code,
      'name': this.employee.name,
      'type': this.employee.type._id
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getEmployeeTypes(): void {

    this.loading = true;

    this._employeeTypeService.getEmployeeTypes().subscribe(
      result => {
        if(!result.employeeTypes) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true); 
          this.loading = false;
          this.employeeTypes = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.employeeTypes = result.employeeTypes;
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public buildForm(): void {

    this.employeeForm = this._fb.group({
      '_id': [this.employee._id, [
        ]
      ],
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
    if(!this.readonly) {
      this.loading = true;
      this.employee = this.employeeForm.value;
      this.saveChanges();
    }
  }

  public saveChanges(): void {
    
    this.loading = true;
    
    this._employeeService.updateEmployee(this.employee).subscribe(
    result => {
        if (!result.employee) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true); 
          this.loading = false;
        } else {
          this.employee = result.employee;
          this.showMessage("El empleado se ha actualizado con éxito.", "success", false);
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