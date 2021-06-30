import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VATCondition } from '../vat-condition';

import { VATConditionService } from '../vat-condition.service';
import { Config } from 'app/app.config';

@Component({
    selector: 'app-vat-condition',
    templateUrl: './vat-condition.component.html',
    styleUrls: ['./vat-condition.component.css'],
    providers: [NgbAlertConfig]
})

export class VATConditionComponent implements OnInit {

    @Input() readonly: boolean = false;
    @Input() op: string;
    @Input() vatConditionId: string;
    public vatCondition: VATCondition;
    public vatConditionForm: FormGroup;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public letters: string[] = ["", "A", "B", "C", "E", "M", "R", "T", "X"];
    public userCountry: string;

    public formErrors = {
        'code': '',
        'description': '',
        'transactionLetter': '',
        'discriminate': '',
    };

    public validationMessages = {
        'code': {
            'required': 'Este campo es requerido.',
        },
        'description': {
            'required': 'Este campo es requerido.',
        },
        'transactionLetter': {
        },
        'discriminate': {
            'required': 'Este campo es requerido.',
        },
    };

    constructor(
        public _vatConditionService: VATConditionService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
    ) {
        this.vatCondition = new VATCondition();
    }

    ngOnInit(): void {

        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();
        if (this.vatConditionId) {
            this.getVATCondition();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.vatConditionForm = this._fb.group({
            '_id': [this.vatCondition._id, []],
            'code': [this.vatCondition.code, [Validators.required,]],
            'description': [this.vatCondition.description, [Validators.required,]],
            'transactionLetter': [this.vatCondition.transactionLetter, []],
            'discriminate': [this.vatCondition.discriminate, [Validators.required,]],
            'observation': [this.vatCondition.observation],
        });

        this.vatConditionForm.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public onValueChanged(data?: any): void {
        if (!this.vatConditionForm) { return; }
        const form = this.vatConditionForm;
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

    public getVATCondition(): void {

        this.loading = true;

        this._vatConditionService.getVATCondition(this.vatConditionId).subscribe(
            result => {
                if (!result.vatCondition) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.vatCondition = result.vatCondition;
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

        if (!this.vatCondition._id) { this.vatCondition._id = ''; }
        if (!this.vatCondition.code) { this.vatCondition.code = 5; }
        if (!this.vatCondition.description) { this.vatCondition.description = ''; }
        if (!this.vatCondition.transactionLetter) { this.vatCondition.transactionLetter = 'C'; }
        if (!this.vatCondition.discriminate) { this.vatCondition.discriminate = false; }
        if (!this.vatCondition.observation) { this.vatCondition.observation = ''; }

        const values = {
            '_id': this.vatCondition._id,
            'code': this.vatCondition.code,
            'description': this.vatCondition.description,
            'transactionLetter': this.vatCondition.transactionLetter,
            'discriminate': this.vatCondition.discriminate,
            'observation': this.vatCondition.observation,
        };
        this.vatConditionForm.setValue(values);
    }

    public addVATCondition() {

        this.loading = true;
        this.vatCondition = this.vatConditionForm.value;

        switch (this.op) {
            case 'add':
                this.saveVATCondition();
                break;
            case 'update':
                this.updateVATCondition();
                break;
            case 'delete':
                this.deleteVATCondition();
            default:
                break;
        }
    }


    public saveVATCondition(): void {

        this.loading = true;

        this._vatConditionService.saveVATCondition(this.vatCondition).subscribe(
            result => {
                if (!result.vatCondition) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.vatCondition = result.vatCondition;
                    if (Config.country) {
                        this.showMessage("La condición de IVA se ha añadido con éxito.", 'success', false);
                    } else {
                        this.showMessage("El régimen fiscal se ha añadido con éxito.", 'success', false);
                    }
                    this.vatCondition = new VATCondition();
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

    public updateVATCondition(): void {

        this.loading = true;

        this._vatConditionService.updateVATCondition(this.vatCondition).subscribe(
            result => {
                if (!result.vatCondition) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.vatCondition = result.vatCondition;
                    if (Config.country) {
                        this.showMessage("La condición de IVA se ha actualizado con éxito.", 'success', false);
                    } else {
                        this.showMessage("La régimen fiscal se ha actualizado con éxito.", 'success', false);
                    }
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteVATCondition(): void {

        this.loading = true;

        this._vatConditionService.deleteVATCondition(this.vatCondition._id).subscribe(
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
