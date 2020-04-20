import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VariantValue } from '../variant-value';
import { VariantType } from '../../variant-type/variant-type';

import { VariantValueService } from '../variant-value.service';
import { VariantTypeService } from '../../variant-type/variant-type.service';

@Component({
    selector: 'app-add-variant-value',
    templateUrl: './add-variant-value.component.html',
    styleUrls: ['./add-variant-value.component.css'],
    providers: [NgbAlertConfig]
})

export class AddVariantValueComponent implements OnInit {

    public variantValue: VariantValue;
    public variantTypes: VariantType[];
    public variantValueForm: FormGroup;
    public alertMessage: string = '';
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();

    public formErrors = {
        'type': '',
        'order': '',
        'description': ''
    };

    public validationMessages = {
        'type': {
            'required': 'Este campo es requerido.'
        },
        'order': {
            'required': 'Este campo es requerido.'
        },
        'description': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public _variantValueService: VariantValueService,
        public _variantTypeService: VariantTypeService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig
    ) { }

    ngOnInit(): void {

        this.variantValue = new VariantValue();
        this.getVariantTypes();
        this.buildForm();
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.variantValueForm = this._fb.group({
            'type': [this.variantValue.type, [
                Validators.required
            ]
            ],
            'order': [this.variantValue.order, [
                Validators.required
            ]
            ],
            'description': [this.variantValue.description, [
                Validators.required
            ]
            ],
        });

        this.variantValueForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public onValueChanged(data?: any): void {

        if (!this.variantValueForm) { return; }
        const form = this.variantValueForm;

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

    public getVariantTypes(): void {

        this.loading = true;

        this._variantTypeService.getVariantTypes().subscribe(
            result => {
                if (!result.variantTypes) {
                    this.loading = false;
                    this.variantTypes = null;
                    this.setValueForm();
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.variantTypes = result.variantTypes;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public setValueForm(): void {

        if (!this.variantValue.type) this.variantValue.type = null;
        if (!this.variantValue.description) this.variantValue.description = '';
        if (!this.variantValue.order) this.variantValue.order = 1;

        this.variantValueForm.setValue({
            'type': this.variantValue.type,
            'order': this.variantValue.order,
            'description': this.variantValue.description
        });
    }

    public addVariantValue(): void {

        this.variantValue = this.variantValueForm.value;
        this.saveVariantValue();
    }

    public saveVariantValue(): void {

        this.loading = true;

        this._variantValueService.saveVariantValue(this.variantValue).subscribe(
            result => {
                if (!result.variantValue) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.variantValue = result.variantValue;
                    this.showMessage("El valor de variante se ha añadido con éxito.", 'success', true);
                    this.variantValue = new VariantValue();
                    this.variantValue.type = this.variantValueForm.value.type;
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

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }
}