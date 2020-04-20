import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CompanyGroup } from '../company-group';

import { CompanyGroupService } from '../company-group.service';

@Component({
    selector: 'app-company-group',
    templateUrl: './company-group.component.html',
    styleUrls: ['./company-group.component.css'],
    providers: [NgbAlertConfig]
})
export class CompanyGroupComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() companyGroupId: string;
    public companyGroup: CompanyGroup;
    public companyGroupForm: FormGroup;
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
        public _companyGroupService: CompanyGroupService,
        public _fb: FormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig
    ) {
        this.companyGroup = new CompanyGroup();
    }

    ngOnInit(): void {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.buildForm();

        if (this.companyGroupId) {
            this.getCompanyGroup();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.companyGroupForm = this._fb.group({
            '_id': [this.companyGroup._id, []],
            'description': [this.companyGroup.description, [
                Validators.required
            ]
            ],
        });

        this.companyGroupForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public getCompanyGroup() {

        this.loading = true;

        this._companyGroupService.getCompanyGroup(this.companyGroupId).subscribe(
            result => {
                if (!result.companyGroup) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.companyGroup = result.companyGroup;
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

    public setValueForm() {

        if (!this.companyGroup._id) { this.companyGroup._id = '' }
        if (!this.companyGroup.description) { this.companyGroup.description = '' }

        this.companyGroupForm.setValue({
            '_id': this.companyGroup._id,
            'description': this.companyGroup.description
        });
    }

    public onValueChanged(data?: any): void {

        if (!this.companyGroupForm) { return; }
        const form = this.companyGroupForm;

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

    public addCompanyGroup() {

        this.loading = true;
        this.companyGroup = this.companyGroupForm.value;

        switch (this.operation) {
            case 'add':
                this.saveCompanyGroup();
                break;
            case 'edit':
                this.updateCompanyGroup();
                break;
            case 'delete':
                this.deleteCompanyGroup();
            default:
                break;
        }
    }


    public saveCompanyGroup(): void {

        this.loading = true;

        this._companyGroupService.saveCompanyGroup(this.companyGroup).subscribe(
            result => {
                if (!result.companyGroup) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.companyGroup = result.companyGroup;
                    this.showMessage("El grupo se ha añadido con éxito.", 'success', false);
                    this.companyGroup = new CompanyGroup();
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

    public updateCompanyGroup(): void {

        this._companyGroupService.updateCompanyGroup(this.companyGroup).subscribe(
            result => {
                if (!result.companyGroup) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.companyGroup = result.companyGroup;
                    this.showMessage("El grupo se ha actualizado con éxito.", 'success', false);
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

    public deleteCompanyGroup(): void {

        this.loading = true;

        this._companyGroupService.deleteCompanyGroup(this.companyGroup._id).subscribe(
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
