import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';

import { ResourceService } from '../resource.service';

import { Resource } from '../resource';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Config } from 'app/app.config';
import { ORIGINMEDIA } from 'app/types';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';

@Component({
    selector: 'app-resource',
    templateUrl: './resource.component.html',
    styleUrls: ['./resource.component.css'],
    providers: [NgbAlertConfig, TranslateMePipe],

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
    public resourceForm: UntypedFormGroup;
    public orientation: string = 'horizontal';

    public selectedFile: File = null;
    public typeSelectFile: string;
    public message: string;
    public src: any;
    public typeFile;

    public filesToUpload: Array<File>;

    public fileCtrl = new UntypedFormControl();

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
        private _fb: UntypedFormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _toastr: ToastrService,
        public translatePipe: TranslateMePipe,

    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.resource = new Resource();
    }

    ngOnInit() {
        this.userCountry = Config.country;
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
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
                    this.src = this.resource.file;

                    console.log(this.resource)
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

        this.resource = {...this.resource, ...this.resourceForm.value}

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

    async updateResource() {

        this.loading = true;

        console.log(this.resource)

        if(this.selectedFile) {
            this.resource.file = await this.uploadFile(this.resource.file);
        } 

        this._resourceService.updateResource(this.resource).subscribe(
            result => {
                if (!result.resource) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El recurso se ha actualizado con éxito.', 'success', false);
                    this.activeModal.close()
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    async saveResource() {

        this.loading = true;

        if (this.selectedFile) {

            if(this.selectedFile) this.resource.file = await this.uploadFile(this.resource.file);

            this._resourceService.addResource(this.resource).subscribe(
                result => {
                    if (!result.resource) {
                        this.loading = false;
                        if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                    } else {
                        this.resource = result.resource;
                        this.activeModal.close();
                        //this.onUpload();
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

    async deleteResource() {

        this.loading = true;

        await this.deleteFile(this.resource.file)

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

        let reader = new FileReader();
        reader.readAsDataURL(this.selectedFile);
        reader.onload = (_event) => {
            this.src = reader.result;
            this.typeSelectFile = reader.result.toString().substring(5, 10)
        }

    }

    // public onUpload() {
    //     this._resourceService.makeFileRequest(this.selectedFile)
    //         .then(
    //             (result) => {
    //                 if (result['file']) {
    //                     this.resource.type = result['file']['mimetype'].split('/')[0]
    //                     this.resource.file = result['file']['filename']
    //                     this.updateResource();
    //                 } else {
    //                     this.showMessage("Error al guardar el archivo", 'danger', false);
    //                     this.loading = false;
    //                 }
    //             },
    //             (error) => {
    //                 this.showMessage(error._body, 'danger', false);
    //                 this.loading = false;
    //             }
    //         );
    // }

    public getFile(): void {
        if (this.resource.file) {
            this.src = `${this.resource.file}`
        } else {
            this.showMessage("No se encontro el archivo", 'danger', false)
            this.loading = true;
        }
    }

    async uploadFile(pictureDelete: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
          if(pictureDelete && pictureDelete.includes('https://storage.googleapis')) {
            await this.deleteFile(pictureDelete);
          }
    
          this._resourceService
              .makeFileRequest(ORIGINMEDIA.RESOURCES, this.selectedFile)
              .then(
                (result: string) => {
                  console.log(result);
                  this.resource.file = result;
                  resolve(result);
              },
              (error) => this.showToast(error),
            );
        })
    }

    async deleteFile(pictureDelete: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
          this._resourceService.deleteImageGoogle(pictureDelete).subscribe(
            (result) => {
              resolve(true)
            },
            (error) => {
              console.log(error)
              this.showToast(error.messge)
              resolve(true)
            }
          )
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

    showToast(result, type?: string, title?: string, message?: string): void {
        if (result) {
          if (result.status === 200) {
            type = 'success';
            title = result.message;
          } else if (result.status >= 400) {
            type = 'danger';
            title =
              result.error && result.error.message ? result.error.message : result.message;
          } else {
            type = 'info';
            title = result.message;
          }
        }
        switch (type) {
          case 'success':
            this._toastr.success(
              this.translatePipe.translateMe(message),
              this.translatePipe.translateMe(title),
            );
            break;
          case 'danger':
            this._toastr.error(
              this.translatePipe.translateMe(message),
              this.translatePipe.translateMe(title),
            );
            break;
          default:
            this._toastr.info(
              this.translatePipe.translateMe(message),
              this.translatePipe.translateMe(title),
            );
            break;
        }
        this.loading = false;
      }

}
