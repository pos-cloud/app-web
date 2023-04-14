import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { Article, IMeliAttrs } from 'app/components/article/article';
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

    @Input() article: Article;
    @Input() meliAttrs: IMeliAttrs;
    @Input() readonly: boolean;
    @Output() eventAddMeliAttrs: EventEmitter<any> = new EventEmitter<any>();
    meliAttrsForm: UntypedFormGroup;
    alertMessage: string = '';
    loading: boolean = false;
    focusEvent = new EventEmitter<boolean>();
    roundNumber: RoundNumberPipe = new RoundNumberPipe();
    formFields: FormField[];
    categorySelected: any;
    categories: any[];
    rootCategory: string = '';
    finishLoad: boolean = false;
    plans: string[] = ['free','bronze','silver','gold','gold_special','gold_premium','gold_pro'];
    formErrors = {};
    validationMessages = {}

    constructor(
        public _taxService: TaxService,
        public _fb: UntypedFormBuilder,
        public _router: Router,
        public _meliService: MeliService,
        public translatePipe: TranslateMePipe,
        private _toastr: ToastrService,
    ) {
    }

    async ngOnInit() {
        if (!this.meliAttrs) {
            this.loadCategories();
            this.meliAttrs = {
                category: null,
                description: {
                    plain_text: ''
                },
                listing_type_id: 'free',
                sale_terms: [],
                attributes: []
            }
        } else {
            if (!this.meliAttrs.category || !this.meliAttrs.category.id) {
                this.loadCategories();
            } else {
                this.rootCategory = (this.meliAttrs.category) ? this.meliAttrs.category.name : '';
            }
        }
        this.categorySelected = this.meliAttrs.category;
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
            'description.plain_text': [this.meliAttrs.description.plain_text],
            'listing_type_id': [this.meliAttrs.listing_type_id],
        };
        if (this.formFields) {
            for (let field of this.formFields) {
                let exists: boolean = false;
                if (this.meliAttrs.attributes) {
                    for (let attr of this.meliAttrs.attributes) {
                        if (`attrs-${attr.id}` === field.id) {
                            exists = true;
                            if (field.tag !== 'separator') fields[field.id] = [attr.value_name, field.validators];
                        }
                    }
                }
                if (this.meliAttrs.sale_terms) {
                    for (let term of this.meliAttrs.sale_terms) {
                        if (`saleterms-${term.id}` === field.id) {
                            exists = true;
                            if (field.tag !== 'separator') fields[field.id] = [term.value_name, field.validators];
                        }
                    }
                }
                if (!exists) if (field.tag !== 'separator') fields[field.id] = ['', field.validators];
            }
        }
        this.meliAttrsForm = this._fb.group(fields);
        this.focusEvent.emit(true);
        this.meliAttrsForm.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged();
        this.focusEvent.emit(true);
    }

    public onValueChanged(data?: any): void {
        if (!this.meliAttrsForm) { return; }
        const form = this.meliAttrsForm;

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

        if(this.finishLoad) this.close();
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
                    let file = this.files[0];
                    let reader = new FileReader();
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
            'category': this.meliAttrs.category,
            'description.plain_text': this.meliAttrs.description.plain_text,
            'listing_type_id': this.meliAttrs.listing_type_id,
        };

        this.meliAttrsForm.patchValue(values);
    }

    async close() {
        this.article.meliId = this.meliAttrsForm.value.meliId;
        this.meliAttrs.category = this.meliAttrsForm.value.category;
        this.meliAttrs.description.plain_text = this.meliAttrsForm.value['description.plain_text'];
        this.meliAttrs.listing_type_id = this.meliAttrsForm.value.listing_type_id;
        if (this.formFields) {
            this.meliAttrs.attributes = new Array();
            this.meliAttrs.sale_terms = new Array();
            for (let field of this.formFields) {
                if (this.meliAttrsForm.value[field.id] && this.meliAttrsForm.value[field.id] !== 'null') {
                    if (field.id.includes('attrs-')) {
                        this.meliAttrs.attributes.push({
                            id: field.id.split('attrs-')[1],
                            value_name: this.meliAttrsForm.value[field.id]
                        });
                    } else if (field.id.includes('saleterms-')) {
                        this.meliAttrs.sale_terms.push({
                            id: field.id.split('saleterms-')[1],
                            value_name: this.meliAttrsForm.value[field.id]
                        });
                    }
                }
            }
        }
        this.eventAddMeliAttrs.emit({ article: this.article, meliAttrs: this.meliAttrs});
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
                        this.meliAttrs.attributes = new Array();
                        this.meliAttrs.sale_terms = new Array();
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
        this.finishLoad = false;
        if (this.meliAttrsForm.value.category && ((!this.formFields) || (!this.categorySelected && this.meliAttrsForm.value.category && this.meliAttrsForm.value.category.id) ||
            (this.categorySelected && this.meliAttrsForm.value.category && this.categorySelected.id && this.meliAttrsForm.value.category.id && this.categorySelected.id !== this.meliAttrsForm.value.category.id))) {
            this.categorySelected = this.meliAttrsForm.value.category;
            let fields: FormField[] = new Array();
            this.formFields = new Array();
            fields.push(
                {
                    name: 'Atributos',
                    tag: 'separator',
                    tagType: null,
                    class: 'form-group col-md-12'
                }
            );
            await this._meliService.loadAttrsByCategory(this.meliAttrsForm.value.category.id).toPromise()
                .then(result => {
                    if (result.status === 200) {
                        let tagType = 'text';
                        for (let field of result.result) {
                            let tag = 'input';
                            let values = new Array();
                            if (field.values && field.values.length > 0) {
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
                                    class: 'form-group col-md-6'
                                }
                            );
                        }
                        this.formFields = fields;
                        this.buildForm();
                    } else {
                        this.showToast(result);
                    }
                }).catch(error => this.showToast(error));

            fields.push(
                {
                    name: 'Términos de venta',
                    tag: 'separator',
                    tagType: null,
                    class: 'form-group col-md-12'
                }
            );
            await this._meliService.loadSalesTermByCategory(this.meliAttrsForm.value.category.id).toPromise()
                .then(result => {
                    if (result.status === 200) {
                        let tagType = 'text';
                        for (let field of result.result) {
                            let tag = 'input';
                            let values = new Array();
                            if (field.values && field.values.length > 0) {
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
                                    id: `saleterms-${field.id}`,
                                    name: field.name,
                                    tag,
                                    tagType,
                                    values,
                                    hint: field.hint,
                                    validators,
                                    class: 'form-group col-md-6'
                                }
                            );
                        }
                        this.formFields.concat(fields);
                        this.buildForm();
                    } else {
                        this.showToast(result);
                    }
                }).catch(error => this.showToast(error));
        }
        this.finishLoad = true;
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
