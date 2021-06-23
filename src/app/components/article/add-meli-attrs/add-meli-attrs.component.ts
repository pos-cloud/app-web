import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { Article } from 'app/components/article/article';
import { TaxService } from 'app/components/tax/tax.service';
import { MeliService } from 'app/main/services/meli.service';
import { FormField } from 'app/util/formField.interface';
import * as $ from 'jquery';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import Resulteable from 'app/util/Resulteable';

@Component({
    selector: 'app-add-meli-attrs',
    templateUrl: './add-meli-attrs.component.html',
    styleUrls: ['./add-meli-attrs.component.scss'],
})

export class AddMeliAttrsComponent implements OnInit {

    public meliAttrs: FormGroup;
    public alertMessage: string = '';
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public roundNumber: RoundNumberPipe = new RoundNumberPipe();
    @Input() article: Article;
    @Input() readonly: boolean;
    @Output() eventAddMeliAttrs: EventEmitter<Article> = new EventEmitter<Article>();
    public formFields: FormField[];
    public categorySelected: any;
    public categories: any[];
    public rootCategory: string = '';

    public formErrors = {
    };

    public validationMessages = {
    }

    constructor(
        public _taxService: TaxService,
        public _fb: FormBuilder,
        public _router: Router,
        public _meliService: MeliService,
        public translatePipe: TranslateMePipe,
        private _toastr: ToastrService,
    ) {
    }

    async ngOnInit() {
        if (!this.article.meliAttrs) {
            await this.loadCategories();
            this.article.meliAttrs = {
                category: null,
                description: {
                    plain_text: ''
                },
                listing_type_id: 'free',
                attributes: []
            }
        } else {
            this.rootCategory = this.article.meliAttrs.category.name;
        }
        this.categorySelected = this.article.meliAttrs.category;
        this.buildForm();
        this.loadAttrs();
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        let fields: {} = {
            'meliId': [this.article.meliId],
            'category': [this.categorySelected],
            'description.plain_text': [this.article.meliAttrs.description.plain_text],
            'listing_type_id': [this.article.meliAttrs.listing_type_id],
        };

        if (this.formFields) {
            for (let field of this.formFields) {
                let exists: boolean = false;
                for (let attr of this.article.meliAttrs.attributes) {
                    if (`attrs-${attr.id}` === field.id) {
                        exists = true;
                        if (field.tag !== 'separator') fields[field.id] = [attr.value_name, field.validators];
                    }
                }
                if (!exists) if (field.tag !== 'separator') fields[field.id] = ['', field.validators];
            }
        }
        this.meliAttrs = this._fb.group(fields);
        this.focusEvent.emit(true);
        this.meliAttrs.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public onValueChanged(data?: any): void {
        if (!this.meliAttrs) { return; }
        const form = this.meliAttrs;

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

        this.close();
    }

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
        height: 150,
        file_picker_types: 'file image media',
        images_dataimg_filter: function (img) {
            return img.hasAttribute('internal-blob');
        },
        file_picker_callback: function (callback, value, meta) {
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
        },
    }

    public setValueForm(): void {

        const values = {
            'meliId': this.article.meliId,
            'category': this.article.meliAttrs.category,
            'description.plain_text': this.article.meliAttrs.description.plain_text,
            'listing_type_id': this.article.meliAttrs.listing_type_id,
        };

        this.meliAttrs.patchValue(values);
    }

    async close() {
        this.article.meliId = this.meliAttrs.value.meliId;
        this.article.meliAttrs.category = this.meliAttrs.value.category;
        this.article.meliAttrs.description.plain_text = this.meliAttrs.value['description.plain_text'];
        this.article.meliAttrs.listing_type_id = this.meliAttrs.value.listing_type_id;
        if (this.formFields) {
            this.article.meliAttrs.attributes = new Array();
            for (let field of this.formFields) {
                if (this.meliAttrs.value[field.id] && this.meliAttrs.value[field.id] !== 'null') {
                    this.article.meliAttrs.attributes.push({
                        id: field.id.split('attrs-')[1],
                        value_name: this.meliAttrs.value[field.id]
                    });
                }
            }
        }
        this.eventAddMeliAttrs.emit(this.article);
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }

    public loadCategories() {
        return new Promise((resolve, reject) => {
            this._meliService.getCategories().toPromise().then(
                (result: Resulteable) => {
                    if (result.status === 200) {
                        this.categories = result.result;
                        this.categories.unshift(null);
                        this.setValueForm();
                        this.rootCategory = '';
                        this.article.meliAttrs.attributes = new Array();
                        this.formFields = new Array();
                        this.close();
                    }
                }
            )
            resolve(this.categories);
        });
    }

    public getSubcategories(category: any) {
        if (category) {
            this._meliService.getSubcategories(category.id).toPromise().then(
                (result: Resulteable) => {
                    if (result.status === 200 && result.result && result.result.children_categories && result.result.children_categories.length > 0) {
                        this.categories = result.result.children_categories;
                        this.categories.unshift(null);
                        this.rootCategory += ' / ' + category.name;
                    } else {
                        this.loadAttrs();
                    }
                }
            )
        }
    }

    public async loadAttrs() {
        if (this.meliAttrs.value.category && ((!this.formFields) || (!this.categorySelected && this.meliAttrs.value.category && this.meliAttrs.value.category.id) ||
            (this.categorySelected && this.meliAttrs.value.category && this.categorySelected.id && this.meliAttrs.value.category.id && this.categorySelected.id !== this.meliAttrs.value.category.id))) {
            this.categorySelected = this.meliAttrs.value.category;
            let fields: FormField[] = new Array();
            this.formFields = new Array();
            await this._meliService.loadAttrsByCategory(this.meliAttrs.value.category.id).toPromise()
                .then(result => {
                    if (result.status === 200) {
                        let tagType = 'text';
                        for (let field of result.result) {
                            let tag = 'input';
                            let values = new Array();
                            if (field.values && field.values.length > 0) {
                                tag = 'select';
                                values.push(null);
                                for (let value of field.values) {
                                    values.push(value.name);
                                }
                            } else {
                                if (field.value_type === 'number_unit') {
                                    tagType = 'text';
                                } else if (field.value_type === 'boolean') {
                                    tag = 'select';
                                    tagType = 'boolean';
                                    values = ['true', 'false'];
                                }
                            }

                            let validators: Validators[] = new Array();
                            if (field.tags && field.tags.required) {
                                validators.push(Validators.required);
                            }
                            fields.push(
                                {
                                    id: `attrs-${field.id}`,
                                    name: field.name,
                                    tag,
                                    tagType,
                                    values,
                                    hint: field.hint,
                                    validators,
                                    class: 'form-group col-md-12'
                                }
                            );
                        }
                        this.formFields = fields;
                        this.buildForm();
                    } else {
                        this.showToast(result);
                    }
                }).catch(error => this.showToast(error));
        }
        this.close();
    }

    public showToast(result, type?: string, title?: string, message?: string): void {
        if (result) {
            if (result.status === 200) {
                type = 'success';
                title = result.message;
            } else if (result.status >= 400) {
                type = 'danger';
                title = (result.error && result.error.message) ? result.error.message : result.message;
            } else {
                type = 'info';
                title = result.message;
            }
        }
        switch (type) {
            case 'success':
                this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            case 'danger':
                this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            default:
                this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
        }
        this.loading = false;
    }
}
