import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeType } from './../../models/employee-type';

import { EmployeeTypeService } from './../../services/employee-type.service';

@Component({
  selector: 'app-update-employee-type',
  templateUrl: './update-employee-type.component.html',
  styleUrls: ['./update-employee-type.component.css'],
  providers: [NgbAlertConfig]
})

export class UpdateEmployeeTypeComponent implements OnInit {

  @Input() employeeType: EmployeeType;
  public employeeTypeForm: FormGroup;
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
    this.buildForm();
    this.employeeTypeForm.setValue({
      '_id': this.employeeType._id,
      'name': this.employeeType.name
    });
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.employeeTypeForm = this._fb.group({
      '_id': [this.employeeType._id, [
        ]
      ],
      'name': [this.employeeType.name, [
          Validators.required
        ]
      ]
    });

    this.employeeTypeForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
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

  public updateEmployeeType (): void {

    this.loading = true;
    this.employeeType = this.employeeTypeForm.value;
    this.saveChanges();
  }

  public saveChanges(): void {
    
    this._employeeTypeService.updateEmployeeType(this.employeeType).subscribe(
    result => {
        if (!result.employeeType) {
          this.alertMessage = result.message;
          this.alertConfig.type = 'danger';
        } else {
          this.employeeType = result.employeeType;
          this.alertConfig.type = 'success';
          this.alertMessage = "El tipo de empleado se ha actualizado con éxito.";
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