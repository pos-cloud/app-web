import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IdentificationType } from '../identification-type';

import { IdentificationTypeService } from '../identification-type.service';

@Component({
    selector: 'app-add-identification-type',
    templateUrl: './add-identification-type.component.html',
    styleUrls: ['./add-identification-type.component.css'],
    providers: [NgbAlertConfig]
})

export class AddIdentificationTypeComponent implements OnInit {

    public identificationType: IdentificationType;
    @Input() identificationTypeId: string;
    @Input() operation: string;
    @Input() readonly: boolean;
    public identificationTypeForm: UntypedFormGroup;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();

    public formErrors = {
        'code': '',
        'name': ''
    };

    public validationMessages = {
        'code': {
            'required': 'Este campo es requerido.'
        },
        'name': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public _identificationTypeService: IdentificationTypeService,
        public _fb: UntypedFormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig
    ) {
        this.identificationType = new IdentificationType();
    }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();
        if (this.identificationTypeId) {
            this.getIdentificationType();
        } else {
            this.getLastIdentificationType();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.identificationTypeForm = this._fb.group({
            '_id': [this.identificationType._id, [
            ]
            ],
            'code': [this.identificationType.code, [
                Validators.required
            ]
            ],
            'name': [this.identificationType.name, [
                Validators.required
            ]
            ]
        });

        this.identificationTypeForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public onValueChanged(data?: any): void {

        if (!this.identificationTypeForm) { return; }
        const form = this.identificationTypeForm;

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

    public getLastIdentificationType(): void {

        this.loading = true;

        let query = 'sort="code":-1&limit=1';

        this._identificationTypeService.getIdentificationTypes(query).subscribe(
            result => {
                if (!result.identificationTypes) {
                    this.loading = false;
                } else {
                    this.hideMessage();
                    this.loading = false;
                    try {
                        this.identificationType.code = (parseInt(result.identificationTypes[0].code) + 1).toString();
                        this.setValuesForm();
                    } catch (e) {
                    }
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }


    public getIdentificationType(): void {

        this.loading = true;

        this._identificationTypeService.getIdentificationType(this.identificationTypeId).subscribe(
            result => {
                if (!result.identificationType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.identificationType = result.identificationType;
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

        if (!this.identificationType._id) { this.identificationType._id = ''; }
        if (!this.identificationType.code) { this.identificationType.code = '1'; }
        if (!this.identificationType.name) { this.identificationType.name = ''; }

        const values = {
            '_id': this.identificationType._id,
            'code': this.identificationType.code,
            'name': this.identificationType.name,
        };

        this.identificationTypeForm.setValue(values);
    }

    public addIdentificationType(): void {

        if (!this.readonly) {
            this.identificationType = this.identificationTypeForm.value;
            if (this.operation === 'add') {
                this.saveIdentificationType();
            } else if (this.operation === 'update') {
                this.updateIdentificationType();
            }
        }
    }

    public saveIdentificationType(): void {

        this.loading = true;

        this._identificationTypeService.saveIdentificationType(this.identificationType).subscribe(
            result => {
                if (!result.identificationType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.identificationType = result.identificationType;
                    this.showMessage("El tipo de identificación se ha añadido con éxito.", 'success', true);
                    this.identificationType = new IdentificationType();
                    this.buildForm();
                    this.getLastIdentificationType();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public updateIdentificationType(): void {

        this.loading = true;

        this._identificationTypeService.updateIdentificationType(this.identificationType).subscribe(
            result => {
                if (!result.identificationType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.identificationType = result.identificationType;
                    this.showMessage("El tipo de identificación se ha actualizado con éxito.", 'success', true);
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteIdentificationType(): void {

        this.loading = true;

        this._identificationTypeService.deleteIdentificationType(this.identificationType._id).subscribe(
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
