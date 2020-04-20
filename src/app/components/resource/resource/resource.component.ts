import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { ResourceService } from '../resource.service';

import { Resource } from '../resource';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';

@Component({
    selector: 'app-resource',
    templateUrl: './resource.component.html',
    styleUrls: ['./resource.component.css']
})
export class ResourceComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() resourceId: string;
    public alertMessage: string = '';
    public userType: string;
    public resource: Resource;
    public areResourceEmpty: boolean = true;
    public orderTerm: string[] = ['name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public userCountry: string;
    public resourceForm: FormGroup;
    public orientation: string = 'horizontal';

    public selectedFile: File = null;
    public typeSelectFile: string;
    public message: string;
    public src: any;
    public typeFile;

    public filesToUpload: Array<File>;

    public fileCtrl = new FormControl();

    public formErrors = {
        'name': '',
    };

    public validationMessages = {
        'name': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        private _resourceService: ResourceService,
        private _router: Router,
        private _fb: FormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.resource = new Resource();
    }

    ngOnInit() {
        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];;
        this.buildForm();

        if (this.resourceId) {
            this.getResource();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getResource() {

        this.loading = true;

        this._resourceService.getResource(this.resourceId).subscribe(
            result => {
                if (!result.resource) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.resource = result.resource;
                    this.getFile();
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

        if (!this.resource._id) { this.resource._id = ''; }
        if (!this.resource.name) { this.resource.name = ''; }


        const values = {
            '_id': this.resource._id,
            'name': this.resource.name
        };
        this.resourceForm.setValue(values);
    }

    public buildForm(): void {

        this.resourceForm = this._fb.group({
            '_id': [this.resource._id, []],
            'name': [this.resource.name, [
                Validators.required
            ]
            ]
        });

        this.resourceForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.resourceForm) { return; }
        const form = this.resourceForm;

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

    public addResource() {

        this.resource = this.resourceForm.value;

        switch (this.operation) {
            case 'add':
                this.saveResource();
                break;
            case 'update':
                this.updateResource();
                break;
            case 'delete':
                this.deleteResource();
            default:
                break;
        }
    }

    public updateResource() {

        this.loading = true;

        this._resourceService.updateResource(this.resource).subscribe(
            result => {
                if (!result.resource) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El recurso se ha actualizado con éxito.', 'success', false);
                    this.resource = new Resource();
                    this.buildForm();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public saveResource() {

        this.loading = true;

        if (this.selectedFile) {

            this._resourceService.addResource(this.resource).subscribe(
                result => {
                    if (!result.resource) {
                        this.loading = false;
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        this.resource = result.resource;
                        this.onUpload();
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        } else {
            this.loading = false;
            this.showMessage('Debe seleccionar un archivo.', 'success', false);
        }
    }

    public deleteResource() {

        this.loading = true;

        this._resourceService.deleteResource(this.resource).subscribe(
            result => {
                this.loading = false;
                if (result.ok && result.ok != 1) {
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

    public onFileSelected(event) {

        this.selectedFile = <File>event.target.files[0];

        var reader = new FileReader();
        reader.readAsDataURL(this.selectedFile);
        reader.onload = (_event) => {
            this.src = reader.result;
            this.typeSelectFile = reader.result.toString().substring(5, 10)
        }

    }

    public onUpload() {
        this._resourceService.makeFileRequest(this.selectedFile)
            .then(
                (result) => {
                    if (result['file']) {
                        this.resource.type = result['file']['mimetype'].split('/')[0]
                        this.resource.file = result['file']['originalname']
                        this.updateResource();
                    } else {
                        this.showMessage("Error al guardar el archivo", 'danger', false);
                        this.loading = false;
                    }
                },
                (error) => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
    }

    public getFile(): void {
        if (this.resource.file) {
            this.src = `${Config.apiURL}get-resource?filename=${this.resource.file}&database=${Config.database}`
        } else {
            this.showMessage("No se encontro el archivo", 'danger', false)
            this.loading = true;
        }
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
