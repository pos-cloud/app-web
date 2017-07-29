import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeType } from './../../models/employee-type';

import { EmployeeTypeService } from './../../services/employee-type.service';

@Component({
  selector: 'app-add-employee-type',
  templateUrl: './add-employee-type.component.html',
  styleUrls: ['./add-employee-type.component.css'],
  providers: [NgbAlertConfig]
})

export class AddEmployeeTypeComponent  implements OnInit {

  public employeeType: EmployeeType;
  public employeeTypeForm: FormGroup;
  public alertMessage: any;
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();

  public formErrors = {
    'description': ''
  };

  public validationMessages = {
    'description': {
      'required':       'Este campo es requerido.'
    }
  };

  constructor(
    public _employeeTypeService: EmployeeTypeService,
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
    this.employeeType = new EmployeeType ();
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.employeeTypeForm = this._fb.group({
      'description': [this.employeeType.description, [
          Validators.required
        ]
      ]
    });

    this.employeeTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.employeeTypeForm) { return; }
    const form = this.employeeTypeForm;

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

  public addEmployeeType(): void {
    
    this.loading = true;
    this.employeeType = this.employeeTypeForm.value;
    this.saveEmployeeType();
  }

  public saveEmployeeType(): void {
    
    this._employeeTypeService.saveEmployeeType(this.employeeType).subscribe(
    result => {
        if (!result.employeeType) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.employeeType = result.employeeType;
          this.alertConfig.type = 'success';
          this.alertMessage = "El tipo de empleado se ha añadido con éxito.";      
          this.employeeType = new EmployeeType();
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