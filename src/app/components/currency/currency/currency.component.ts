import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Currency } from '../currency';

import { CurrencyService } from '../currency.service';

@Component({
    selector: 'app-currency',
    templateUrl: './currency.component.html',
    styleUrls: ['./currency.component.css'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class CurrencyComponent implements OnInit {

    public currency: Currency;
    @Input() currencyId: string;
    @Input() operation: string;
    @Input() readonly: boolean;
    public currencyForm: UntypedFormGroup;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();

    public formErrors = {
        'code': '',
        'sign': '',
        'name': '',
        'quotation': '',
    };

    public validationMessages = {
        'code': {
            'required': 'Este campo es requerido.'
        },
        'sign': {
            'required': 'Este campo es requerido.'
        },
        'name': {
            'required': 'Este campo es requerido.'
        },
        'quotation': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public _currencyService: CurrencyService,
        public _fb: UntypedFormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig
    ) {
        this.currency = new Currency();
    }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();
        if (this.currencyId) {
            this.getCurrency();
        } else {
            this.getLastCurrency();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.currencyForm = this._fb.group({
            '_id': [this.currency._id, [
            ]
            ],
            'code': [this.currency.code, [
                Validators.required
            ]
            ],
            'sign': [this.currency.sign, [
                Validators.required
            ]
            ],
            'name': [this.currency.name, [
                Validators.required
            ]
            ],
            'quotation': [this.currency.quotation, [
                Validators.required
            ]
            ]
        });

        this.currencyForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public onValueChanged(data?: any): void {

        if (!this.currencyForm) { return; }
        const form = this.currencyForm;

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

    public getLastCurrency(): void {

        this.loading = true;

        let query = 'sort="code":-1&limit=1';

        this._currencyService.getCurrencies(query).subscribe(
            result => {
                if (!result.currencies) {
                    this.loading = false;
                    this.currency.code = '1';
                } else {
                    this.loading = false;
                    try {
                        this.currency.code = (parseInt(result.currencies[0].code) + 1).toString();
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

    public getCurrency(): void {

        this.loading = true;

        this._currencyService.getCurrency(this.currencyId).subscribe(
            result => {
                if (!result.currency) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.currency = result.currency;
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

        if (!this.currency._id) { this.currency._id = ''; }
        if (!this.currency.code) { this.currency.code = '1'; }
        if (!this.currency.sign) { this.currency.code = '$'; }
        if (!this.currency.name) { this.currency.name = ''; }

        const values = {
            '_id': this.currency._id,
            'code': this.currency.code,
            'sign': this.currency.sign,
            'name': this.currency.name,
            'quotation': this.currency.quotation,
        };

        this.currencyForm.setValue(values);
    }

    public addCurrency(): void {

        if (!this.readonly) {
            this.currency = this.currencyForm.value;
            if (this.operation === 'add') {
                this.saveCurrency();
            } else if (this.operation === 'update') {
                this.updateCurrency();
            }
        }
    }

    public saveCurrency(): void {

        this.loading = true;

        this._currencyService.saveCurrency(this.currency).subscribe(
            result => {
                if (!result.currency) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.currency = result.currency;
                    this.showMessage("La moneda se ha añadido con éxito.", 'success', true);
                    this.currency = new Currency();
                    this.buildForm();
                    this.getLastCurrency();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public updateCurrency(): void {

        this.loading = true;

        this._currencyService.updateCurrency(this.currency).subscribe(
            result => {
                if (!result.currency) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.currency = result.currency;
                    this.showMessage("La moneda se ha actualizado con éxito.", 'success', true);
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteCurrency(): void {

        this.loading = true;

        this._currencyService.deleteCurrency(this.currency._id).subscribe(
            result => {
                if (!result.currency) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.currency = result.currency;
                    this.activeModal.close('delete_close');
                }
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
