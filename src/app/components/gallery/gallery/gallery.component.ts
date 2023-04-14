import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Gallery } from 'app/components/gallery/gallery';
import { UntypedFormGroup, UntypedFormArray, UntypedFormBuilder, Validators, NgForm } from '@angular/forms';
import { Resource } from 'app/components/resource/resource';
import { GalleryService } from 'app/components/gallery/gallery.service';
import { ResourceService } from 'app/components/resource/resource.service';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-gallery',
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() galleryId: string;

    public gallery: Gallery;
    public galleryForm: UntypedFormGroup;

    public resourcesForm: UntypedFormArray;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public galleries: Gallery[];
    public percentageSelected: number;
    public orientation: string = 'horizontal';
    public resources: Resource[];

    public formErrors = {
        'name': '',
    };

    public validationMessages = {
        'name': {
            'required': 'Este campo es requerido.'
        }
    };

    constructor(
        public _galleryService: GalleryService,
        public _resourceService: ResourceService,
        public _fb: UntypedFormBuilder,
        public _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.getResources()
    }

    ngOnInit() {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.gallery = new Gallery();
        this.buildForm();

        if (this.galleryId) {
            this.getGallery();
        }

    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }


    public buildForm(): void {

        this.galleryForm = this._fb.group({
            '_id': [this.gallery._id, []],
            'name': [this.gallery.name, [
                Validators.required
            ]],
            'colddown': [this.gallery.colddown, []],
            'speed': [this.gallery.speed, []],
            'barcode' : [this.gallery.barcode,[]],
            'resources': this._fb.array([])
        });

        this.galleryForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public addNewResource(e: any): void {
        if (this.galleryForm.value.resources.lenght <= 0 && e) {
            const resources = this.galleryForm.controls.resources as UntypedFormArray;
            resources.push(
                this._fb.group({
                    _id: null,
                    resource: null,
                    order: 0,
                    transition: 0,
                    colddown: 0
                })
            );
        }
    }

    public addResource(resourceForm: NgForm): void {

        let valid = true;
        const resources = this.galleryForm.controls.resources as UntypedFormArray;

        if (valid) {
            resources.push(
                this._fb.group({
                    _id: null,
                    resource: resourceForm.value.resource || null,
                    order: resourceForm.value.order || 1,
                })
            );
            resourceForm.resetForm();
        }

    }

    deleteResource(index) {
        let control = <UntypedFormArray>this.galleryForm.controls.resources;
        control.removeAt(index)
    }



    public onValueChanged(data?: any): void {

        if (!this.galleryForm) { return; }
        const form = this.galleryForm;

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

    public getGallery() {

        this.loading = true;

        this._galleryService.getGallery(this.galleryId).subscribe(
            result => {
                if (!result.gallery) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.hideMessage();
                    this.gallery = result.gallery;
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

        if (!this.gallery._id) { this.gallery._id = ''; }
        if (!this.gallery.name) { this.gallery.name = ''; }
        if (!this.gallery.colddown) { this.gallery.colddown = 6000; }
        if (!this.gallery.speed) { this.gallery.speed = 400; }

        const values = {
            '_id': this.gallery._id,
            'name': this.gallery.name,
            'colddown': this.gallery.colddown,
            'speed': this.gallery.speed,
            'barcode' : this.gallery.barcode ? this.gallery.barcode : false

        };

        if (this.gallery.resources && this.gallery.resources.length > 0) {
            let resources = <UntypedFormArray>this.galleryForm.controls.resources;
            this.gallery.resources.forEach(x => {

                let resourceId;
                if (x.resource && x.resource._id) {
                    resourceId = x.resource._id;
                }


                resources.push(this._fb.group({
                    '_id': null,
                    'resource': resourceId,
                    'order': x.order
                }))
            })
        }


        this.galleryForm.patchValue(values);

    }

    public addGallery() {

        switch (this.operation) {
            case 'add':
                this.saveGallery();
                break;
            case 'update':
                this.updateGallery();
                break;
            case 'delete':
                this.deleteGallery();
            default:
                break;
        }
    }

    async updateGallery() {

        this.loading = true;

        this.gallery = this.galleryForm.value;

        if (await this.isValid()) {
            this._galleryService.updateGallery(this.gallery).subscribe(
                result => {
                    if (!result.gallery) {
                        this.loading = false;
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        this.loading = false;
                        this.showMessage('La galeria se ha actualizado con éxito.', 'success', false);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        } else {
            this.loading = false;
        }
    }

    async saveGallery() {

        this.loading = true;

        this.gallery = this.galleryForm.value;

        if (await this.isValid()) {
            this._galleryService.saveGallery(this.gallery).subscribe(
                result => {
                    if (!result.gallery) {
                        this.loading = false;
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        this.loading = false;
                        this.showMessage('La galeria se ha añadido con éxito.', 'success', false);
                        this.gallery = new Gallery();
                        this.buildForm();
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        } else {
            this.loading = false;
        }
    }

    public deleteGallery() {

        this.loading = true;

        this._galleryService.deleteGallery(this.gallery._id).subscribe(
            result => {
                this.loading = false;
                if (!result.gallery) {
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

    public getResources(): void {

        let match = `{ "operationType": { "$ne": "D" } }`;

        match = JSON.parse(match);

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = {
            name: 1,
            type: 1,
            file: 1,
            operationType: 1
        };

        let group = {
            _id: null,
            count: { $sum: 1 },
            resources: { $push: "$$ROOT" }
        };

        this._resourceService.getResources(project, match, {}, group).subscribe(
            result => {
                if (result && result[0] && result[0].resources) {
                    this.loading = false;
                    this.resources = result[0].resources;
                } else {
                    this.resources = new Array();
                    this.loading = false;
                }
            }
        )
    }

    public isValid(): Promise<boolean> {

        return new Promise((resolve, reject) => {

            if (this.galleryForm.value.colddown === 0 ||
                this.gallery.colddown === 0 ||
                this.gallery.colddown === null ||
                this.gallery.colddown < 0 ||
                this.galleryForm.value.colddown < 0) {
                this.showMessage("El intervalo no puede ser 0 o negativo", 'info', true)
                resolve(false)
            }

            if (this.galleryForm.value.speed === 0 ||
                this.gallery.speed === 0 ||
                this.gallery.speed === null ||
                this.gallery.speed < 0 ||
                this.galleryForm.value.speed < 0) {
                this.showMessage("La velocidad no puede ser 0 o negativo", 'info', true)
                resolve(false)
            }

            resolve(true)
        })
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
