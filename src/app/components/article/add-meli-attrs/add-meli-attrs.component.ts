import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { Article } from 'app/components/article/article';
import { TaxService } from 'app/components/tax/tax.service';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MeliService } from 'app/main/services/meli.service';
import { FormField } from 'app/util/formField.interface';
import * as $ from 'jquery';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';

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
    public formFields: FormField[] = new Array();
    public categorySelected: any;

    public searchCategories = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(async term =>
                await this._meliService.getCategories(term, 10).toPromise().then(
                    result => {
                        return result.result;
                    }
                )
            ),
            tap(() => this.loading = false)
        )

    public formErrors = {
    };

    public validationMessages = {
    }

    public formatterCategories = (x: { category_name: string }) => x.category_name;

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
        if (!this.article.meliAttrs)
            this.article.meliAttrs = {
                category: null,
                description: {
                    plain_text: ''
                },
                listing_type_id: 'free',
                attributes: []
            }
        this.buildForm();
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        let fields: {} = {
            'category': [this.article.meliAttrs.category],
            'description.plain_text': [this.article.meliAttrs.description.plain_text],
            'listing_type_id': [this.article.meliAttrs.listing_type_id],
        };
        for (let field of this.formFields) {
            if (field.tag !== 'separator') fields[field.id] = [this.article.meliAttrs[field.id], field.validators]
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
            'category': this.article.meliAttrs.category,
            'description.plain_text': this.article.meliAttrs.description.plain_text,
            'listing_type_id': this.article.meliAttrs.listing_type_id,
        };

        this.meliAttrs.setValue(values);
    }

    async close() {
        if ((!this.categorySelected && this.meliAttrs.value.category && this.meliAttrs.value.category.category_id) || 
        (this.categorySelected && this.meliAttrs.value.category && this.categorySelected.category_id && this.meliAttrs.value.category.category_id && this.categorySelected.category_id !== this.meliAttrs.value.category.category_id)) {
            this.categorySelected = this.meliAttrs.value.category;
            await this._meliService.loadAttrsByCategory(this.meliAttrs.value.category.category_id).toPromise()
                .then(result => {
                    if (result.status === 200) {
                        let fields: FormField[] = new Array();
                        this.formFields = new Array();
                        for (let field of result.result) {
                            let tag = 'input';
                            let values = new Array();
                            if (field.value_type == 'list') {
                                tag = 'select';
                                for (let value of field.values) {
                                    values.push(value.name);
                                }
                            }

                            let tagType = 'text';
                            if (field.value_type === 'number_unit') {
                                tagType = 'number';
                            } else if (field.value_type === 'boolean') {
                                tag = 'select';
                                tagType = 'boolean';
                                values = ['true', 'false'];
                            }

                            let validators: Validators[];
                            if(field.required) {
                                validators.push(Validators.required);
                            }
                            fields.push(
                                {
                                    id: `attrs-${field.id}`,
                                    name: field.name,
                                    tag,
                                    tagType,
                                    values,
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
        this.article.meliAttrs.category = this.meliAttrs.value.category;
        this.article.meliAttrs.description.plain_text = this.meliAttrs.value['description.plain_text'];
        this.article.meliAttrs.listing_type_id = this.meliAttrs.value.listing_type_id;
        this.article.meliAttrs.attributes = new Array();
        for(let field of this.formFields) {
            if(this.meliAttrs.value[field.id]) {
                this.article.meliAttrs.attributes.push({
                    id: field.id.split('attrs-')[1],
                    value_name: this.meliAttrs.value[field.id]
                });
            }
        }
        console.log(this.article.meliAttrs);
        this.eventAddMeliAttrs.emit(this.article);
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
    }

    public hideMessage(): void {
        this.alertMessage = '';
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
