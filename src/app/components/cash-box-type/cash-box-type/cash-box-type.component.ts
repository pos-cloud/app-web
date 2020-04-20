import { Component, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CashBoxType } from '../cash-box-type';

import { CashBoxTypeService } from '../cash-box-type.service';

@Component({
    selector: 'app-cash-box-type',
    templateUrl: './cash-box-type.component.html',
    styleUrls: ['./cash-box-type.component.scss'],
    providers: [NgbAlertConfig]
})

export class CashBoxTypeComponent {

    @Input() cashBoxTypeId: string;
    @Input() operation: string;
    @Input() readonly: boolean;

    public cashBoxType: CashBoxType;
    public cashBoxTypeForm: FormGroup;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();

    public formErrors = {
        'name': ''
    };

    public validationMessages = {
        'name': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public _cashBoxTypeService: CashBoxTypeService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
    ) {
        this.cashBoxType = new CashBoxType();
    }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();
        if (this.cashBoxTypeId) {
            this.getCashBoxType();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.cashBoxTypeForm = this._fb.group({
            '_id': [this.cashBoxType._id],
            'name': [this.cashBoxType.name, [Validators.required]]
        });

        this.focusEvent.emit(true);
        this.cashBoxTypeForm.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.cashBoxTypeForm) { return; }
        const form = this.cashBoxTypeForm;

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

    public getCashBoxType() {

        this.loading = true;

        this._cashBoxTypeService.getCashBoxType(this.cashBoxTypeId).subscribe(
            result => {
                if (!result.cashBoxType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.cashBoxType = result.cashBoxType;
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

    public setValueForm(): void {

        this.cashBoxTypeForm.setValue({
            '_id': this.cashBoxType._id,
            'name': this.cashBoxType.name
        });
    }

    public addCashBoxType(): void {

        this.cashBoxType = this.cashBoxTypeForm.value;

        switch (this.operation) {
            case 'add':
                this.saveCashBoxType();
                break;
            case 'update':
                this.updateCashBoxType();
                break;
            case 'delete':
                this.deleteCashBoxType();
            default:
                break;
        }
    }

    public saveCashBoxType(): void {

        this.loading = true;

        this._cashBoxTypeService.saveCashBoxType(this.cashBoxType).subscribe(
            result => {
                if (!result.cashBoxType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.cashBoxType = result.cashBoxType;
                    this.showMessage("El tipo de caja se ha añadido con éxito.", 'success', false);
                    this.cashBoxType = new CashBoxType();
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

    public updateCashBoxType(): void {

        this.loading = true;

        this._cashBoxTypeService.updateCashBoxType(this.cashBoxType).subscribe(
            result => {
                if (!result.cashBoxType) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.cashBoxType = result.cashBoxType;
                    this.showMessage("El tipo de caja se ha actualizado con éxito.", 'success', false);
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteCashBoxType(): void {

        this.loading = true;

        this._cashBoxTypeService.deleteCashBoxType(this.cashBoxType._id).subscribe(
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