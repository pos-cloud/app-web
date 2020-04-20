import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { EmailTemplate } from 'app/components/email-template/email-template';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';
import { EmailTemplateService } from '../email-template.service';

@Component({
    selector: 'app-email-template',
    templateUrl: './email-template.component.html',
    styleUrls: ['./email-template.component.css']
})
export class EmailTemplateComponent implements OnInit {

    @Input() operation: string;
    @Input() readonly: boolean;
    @Input() emailTemplateId: string;
    public alertMessage: string = '';
    public userType: string;
    public emailTemplate: EmailTemplate;
    public orderTerm: string[] = ['name'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public userCountry: string;
    public emailTemplateForm: FormGroup;
    public orientation: string = 'horizontal';

    public formErrors = {
        'name': '',
    };

    public validationMessages = {
        'name': {
            'required': 'Este campo es requerido.'
        }
    };

    //tiny
    public html = '';

    public tinyMCEConfigBody = {
        selector: "textarea",
        theme: "modern",
        paste_data_images: true,
        plugins: [
            "advlist autolink lists link image charmap print preview hr anchor pagebreak",
            "searchreplace wordcount visualblocks visualchars code fullscreen",
            "insertdatetime media nonbreaking table contextmenu directionality",
            "emoticons template paste textcolor colorpicker textpattern"
        ],
        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | forecolor backcolor emoticons | print preview fullscreen",
        image_advtab: true,
        height: 250,
        file_picker_types: 'file image media',
        images_dataimg_filter: function(img) {
            return img.hasAttribute('internal-blob');
          },
        /*file_picker_callback: function (callback, value, meta) {
            if (meta.filetype == 'image') {
                $('#upload').trigger('click');
                $('#upload').on('change', function () {
                    var file = this.files[0];
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        callback(e.target['result'], {
                            alt: ''
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }
        },*/
        file_picker_callback: function(callback, value, meta) {
            if (meta.filetype == 'image') {
              $('#upload').trigger('click');
              $('#upload').on('change', function() {
                var file = this.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
            
                  callback(e.target['result'], {
                    alt: ''
                  });
                };
                reader.readAsDataURL(file);
              });
            }
          },
    }

    constructor(
        public alertConfig: NgbAlertConfig,
        public _emailTemplateService: EmailTemplateService,
        public _router: Router,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
        this.emailTemplate = new EmailTemplate();
    }

    ngOnInit() {
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];;
        this.buildForm();

        if (this.emailTemplateId) {
            this.getEmailTemplate();
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getEmailTemplate() {

        this.loading = true;

        let match = `{
            "_id": { "$oid": "${this.emailTemplateId}" }
        }`

        match = JSON.parse(match)

        let project = {
            name: 1,
            design : 1,
            operationType : 1,
            creationDate : { "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } },
            "updateUser.name" : 1,
            "creationUser.name" : 1,
            updateDate : { "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }
        }

        this._emailTemplateService.getEmailTemplates(project,match,{},{},1,0).subscribe(
            result => {
                if (!result.emailTemplates) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'susses', true);
                } else {
                    this.hideMessage();
                    this.emailTemplate = result.emailTemplates[0];
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


        if (!this.emailTemplate._id) { this.emailTemplate._id = ''; }
        if (!this.emailTemplate.name) { this.emailTemplate.name = ''; }
        if (!this.emailTemplate.design) { this.emailTemplate.design = ''; }


        const values = {
            '_id': this.emailTemplate._id,
            'name': this.emailTemplate.name,
            'design': this.emailTemplate.design,
        };
        this.emailTemplateForm.setValue(values);
    }

    public buildForm(): void {

        this.emailTemplateForm = this._fb.group({
            '_id': [this.emailTemplate._id, []],
            'name': [this.emailTemplate.name, [ Validators.required]],
            'design': [this.emailTemplate.design, [Validators.required]]
        });

        this.emailTemplateForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.emailTemplateForm) { return; }
        const form = this.emailTemplateForm;

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

    public addEmailTemplate() {

        this.emailTemplate = this.emailTemplateForm.value;


        switch (this.operation) {
            case 'add':
                this.saveEmailTemplate();
                break;
            case 'edit':
                this.updateEmailTemplate();
                break;
            case 'delete':
                this.deleteEmailTemplate();
            default:
                break;
        }
    }

    public updateEmailTemplate() {

        this.loading = true;

        this.emailTemplate = this.emailTemplateForm.value;

        this._emailTemplateService.updateEmailTemplate(this.emailTemplate).subscribe(
            result => {
                if (!result.emailTemplate) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El template se ha actualizado con éxito.', 'success', false);
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public saveEmailTemplate() {

        this.loading = true;

        this.emailTemplate = this.emailTemplateForm.value;

        this._emailTemplateService.saveEmailTemplate(this.emailTemplate).subscribe(
            result => {
                if (!result.emailTemplate) {
                    this.loading = false;
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'success', true); }
                } else {
                    this.loading = false;
                    this.showMessage('El template se ha añadido con éxito.', 'success', false);
                    this.emailTemplate = new EmailTemplate();
                    this.buildForm();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public deleteEmailTemplate() {

        this.loading = true;

        this._emailTemplateService.deleteEmailTemplate(this.emailTemplate._id).subscribe(
            result => {
                this.loading = false;
                if (!result.emailTemplate) {
                    if (result.message && result.message !== '') { this.showMessage(result.message, 'danger', true); }
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

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }

}
