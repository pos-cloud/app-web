import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeType } from '../employee-type';

import { EmployeeTypeService } from '../employee-type.service';

@Component({
    selector: 'app-employee-type',
    templateUrl: './employee-type.component.html',
    styleUrls: ['./employee-type.component.css'],
    providers: [NgbAlertConfig]
})

export class EmployeeTypeComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() employeeTypeId: string;
    public employeeType: EmployeeType;
    public employeeTypeForm: FormGroup;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();

    public formErrors = {
        'description': ''
    };

    public validationMessages = {
        'description': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public _employeeTypeService: EmployeeTypeService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
    ) {
        this.employeeType = new EmployeeType();
    }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();

        if (this.employeeTypeId) {
            this.getEmployeeType();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getEmployeeType() {

        this.loading = true;

        this._employeeTypeService.getEmployeeType(this.employeeTypeId).subscribe(
            result => {
                if (!result.employeeType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.employeeType = result.employeeType;
                    this.setValueForm();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public setValueForm() : void {

        if(!this.employeeType._id) { this.employeeType._id = '' }
        if(!this.employeeType.description) { this.employeeType.description = ''}

        this.employeeTypeForm.setValue({
            '_id': this.employeeType._id,
            'description': this.employeeType.description
          });
    }

    public buildForm(): void {

        this.employeeTypeForm = this._fb.group({
            '_id': [this.employeeType._id, []],
            'description': [this.employeeType.description, [Validators.required]]
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


    public addEmployeeType() {


        this.loading = true;
        this.employeeType = this.employeeTypeForm.value;

        switch (this.operation) {
            case 'add':
                this.saveEmployeeType();
                break;
            case 'update':
                this.updateEmployeeType();
                break;
            case 'delete':
                this.deleteEmployeeType();
            default:
                break;
        }
    }

    public saveEmployeeType(): void {

        this.loading = true;

        this._employeeTypeService.saveEmployeeType(this.employeeType).subscribe(
            result => {
                if (!result.employeeType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.employeeType = result.employeeType;
                    this.showMessage("El tipo de empleado se ha añadido con éxito.", 'success', false);
                    this.employeeType = new EmployeeType();
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

    public updateEmployeeType(): void {

        this.loading = true;

        this._employeeTypeService.updateEmployeeType(this.employeeType).subscribe(
            result => {
                if (!result.employeeType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.employeeType = result.employeeType;
                    this.showMessage("El tipo de empleado se ha actualizado con éxito.", 'success', false);
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

    public deleteEmployeeType(): void {

        this.loading = true;

        this._employeeTypeService.deleteEmployeeType(this.employeeType._id).subscribe(
            result => {
                this.activeModal.close('delete_close');
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

    public hideMessage(): void {
        this.alertMessage = '';
    }
}