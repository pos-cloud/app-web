import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';


import { CurrencyValueService } from '../currency-value.service';

import { CurrencyValue } from '../currency-value';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';

@Component({
    selector: 'app-currency-value',
    templateUrl: './currency-value.component.html',
    styleUrls: ['./currency-value.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class CurrencyValueComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() currencyValueId: string;
    public alertMessage: string = '';
    public userType: string;
    public currencyValue: CurrencyValue;
    public areCurrencyValueEmpty: boolean = true;
    public orderTerm: string[] = ['name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public userCountry: string;
    public currencyValueForm: FormGroup;
    public orientation: string = 'horizontal';

    public formErrors = {
        'name': '',
        'value': ''
    };

    public validationMessages = {
        'name': {
            'required': 'Este campo es requerido.'
        },
        'value': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public alertConfig: NgbAlertConfig,
        public _currencyValueService: CurrencyValueService,
        public _router: Router,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.currencyValue = new CurrencyValue();
    }

    ngOnInit() {
        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();

        if (this.currencyValueId) {
            this.getCurrencyValue();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getCurrencyValue() {

        this.loading = true;

        this._currencyValueService.getCurrencyValue(this.currencyValueId).subscribe(
            result => {
                if (!result.currencyValue) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.currencyValue = result.currencyValue;
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


        if (!this.currencyValue._id) { this.currencyValue._id = ''; }
        if (!this.currencyValue.name) { this.currencyValue.name = ''; }
        if (!this.currencyValue.value) { this.currencyValue.value = 0; }


        const values = {
            '_id': this.currencyValue._id,
            'name': this.currencyValue.name,
            'value': this.currencyValue.value,
        };
        this.currencyValueForm.setValue(values);
    }

    public buildForm(): void {

        this.currencyValueForm = this._fb.group({
            '_id': [this.currencyValue._id, []],
            'name': [this.currencyValue.name, [
                Validators.required
            ]
            ],
            'value': [this.currencyValue.value, [
                Validators.required
            ]
            ]
        });

        this.currencyValueForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.currencyValueForm) { return; }
        const form = this.currencyValueForm;

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

    public addCurrencyValue() {

        switch (this.operation) {
            case 'add':
                this.saveCurrencyValue();
                break;
            case 'edit':
                this.updateCurrencyValue();
                break;
            case 'delete':
                this.deleteCurrencyValue();
            default:
                break;
        }
    }

    public updateCurrencyValue() {

        this.loading = true;

        this.currencyValue = this.currencyValueForm.value;

        this._currencyValueService.updateCurrencyValue(this.currencyValue).subscribe(
            result => {
                if (!result.currencyValue) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El valor se ha actualizado con éxito.', 'success', false);
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public saveCurrencyValue() {

        this.loading = true;

        this.currencyValue = this.currencyValueForm.value;

        this._currencyValueService.saveCurrencyValue(this.currencyValue).subscribe(
            result => {
                if (!result.currencyValue) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El valor se ha añadido con éxito.', 'success', false);
                    this.currencyValue = new CurrencyValue();
                    this.buildForm();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteCurrencyValue() {

        this.loading = true;

        this._currencyValueService.deleteCurrencyValue(this.currencyValue._id).subscribe(
            result => {
                this.loading = false;
                if (!result.currencyValue) {
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    this.activeModal.close();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public showMessage(message: string, value: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = value;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }

}
