import { Component, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { Subscription, Subject, Observable, merge } from 'rxjs';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FormField } from 'app/util/formField.interface';
import * as $ from 'jquery';
import { Config } from 'app/app.config';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Category } from '../category';
import { CategoryService } from '../category.service';
import { Application } from 'app/components/application/application.model';
import { ApplicationService } from 'app/components/application/application.service';
import Resulteable from 'app/util/Resulteable';


@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class CategoryComponent implements OnInit {

    public objId: string;
    public readonly: boolean;
    public operation: string;
    public obj: Category;
    public objForm: FormGroup;
    public loading: boolean = false;
    public schedule: FormArray;
    public focusEvent = new EventEmitter<boolean>();
    public title: string = 'category';
    private subscription: Subscription = new Subscription();
    private capitalizePipe: CapitalizePipe = new CapitalizePipe();
    public focus$: Subject<string>[] = new Array();
    public stateId: number;
    public filesToUpload: any[] = new Array();
    public filename: any[] = new Array();
    public typeFile: any[] = new Array();
    public oldFiles: any[];
    public apiURL: string = Config.apiV8URL;
    public database: string = Config.database;
    public selectedFile: File = null;
    public src: any;
    public imageURL: string;
    public applications: Application[];


    public searchCategories = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['parent'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getCategories(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterCategories = (x: { name: string }) => x.name;

    public formFields: FormField[] = [
        {
            name: 'order',
            tag: 'input',
            tagType: 'number',
            class: 'form-group col-md-2'
        },
        {
            name: 'description',
            tag: 'input',
            tagType: 'text',
            validators: [Validators.required],
            class: 'form-group col-md-10'
        },
        {
            name: 'parent',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchCategories,
            format: this.formatterCategories,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        },
        {
            name: 'favourite',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            default: 'false',
            class: 'form-group col-md-4'
        },
        {
            name: 'picture',
            tag: 'input',
            tagType: 'file',
            search: null,
            format: 'image',
            class: 'form-group col-md-12'
        },
        {
            name: 'visibleOnSale',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            default: 'true',
            class: 'form-group col-md-3'
        },
        {
            name: 'visibleOnPurchase',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            default: 'true',
            class: 'form-group col-md-3'
        },
        {
            name: 'visibleInvoice',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            default: 'false',
            class: 'form-group col-md-3'
        },
        {
            name: 'isRequiredOptional',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            default: 'false',
            class: 'form-group col-md-3'
        },
        {
            name: 'E-Commerce',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        },
        {
            name: 'ecommerceEnabled',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            default: 'false',
            class: 'form-group col-md-3'
        },
        {
            name: 'observation',
            tag: 'input',
            tagType: 'text',
            class: 'form-group col-md-4'
        }

    ];
    public formErrors: {} = {};
    public validationMessages = {
        'required': 'Este campo es requerido.',
    };

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

    constructor(
        private _objService: CategoryService,
        private _toastr: ToastrService,
        private _title: Title,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _applicationService: ApplicationService,
        public translatePipe: TranslateMePipe,
        private _router: Router,
    ) {
        this.obj = new Category();
        for (let field of this.formFields) {
            if (field.tag !== 'separator') {
                this.formErrors[field.name] = '';
                if (field.tag === 'autocomplete') {
                    this.focus$[field.name] = new Subject<string>();
                }
                if (field.default) {
                    this.obj[field.name] = field.default;
                }
            }
        }
    }

    public async ngOnInit() {
        let pathUrl: string[] = this._router.url.split('/');
        this.operation = pathUrl[2];
        if (this.operation !== 'add' && this.operation !== 'update') this.readonly = false;
        this.title = this.translatePipe.transform(this.operation) + " " + this.translatePipe.transform(this.title);
        this.title = this.capitalizePipe.transform(this.title);
        this._title.setTitle(this.title);
        this.buildForm();
        this.objId = pathUrl[3];
        if (this.objId && this.objId !== '') {

            let project = {
                _id: 1,
                operationType: 1,
                description: 1,
                ecommerceEnabled: 1,
                visibleInvoice: 1,
                picture: 1,
                order: 1,
                visibleOnPurchase: 1,
                visibleOnSale: 1,
                isRequiredOptional: 1,
                favourite: 1,
                'parent._id': 1,
                'parent.name':'$parent.description',
                'applications._id': 1,
                'applications.name': 1,
                'observation': 1
            }

            this.subscription.add(this._objService.getAll({
                project,
                match: {
                    operationType: { $ne: "D" },
                    _id: { $oid: this.objId }
                }
            }).subscribe(
                result => {
                    this.loading = false;
                    if (result.status === 200) {
                        this.obj = result.result[0];
                        this.setValuesForm();
                    } else {
                        this.showToast(result);
                    }
                },
                error => this.showToast(error)
            ));
        }

        await this.getAllApplications({})
            .then((result: Application[]) => {
                this.applications = result;
                this.setValuesForm();
            })
            .catch((error: Resulteable) => this.showToast(error));
    }

    public ngAfterViewInit(): void {
        this.focusEvent.emit(true);
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public getFiles(fieldName) {
        return eval('this.obj?.' + fieldName.split('.').join('?.'));
    }

    public onFileSelected(event, model: string) {
        this.filesToUpload[model] = event.target.files;
        this.filename[model] = '';
        let i: number = 0;
        for (let file of this.filesToUpload[model]) {
            if (i != 0) this.filename[model] += ', ';
            this.filename[model] += file.name;
            i++;
        }
        this.typeFile[model] = this.filesToUpload[model][0].type.split("/")[0];
    }

    public buildForm(): void {

        let fields: {} = {
            _id: [this.obj._id],
            applications: this._fb.array([])
        };
        for (let field of this.formFields) {
            if (field.tag !== 'separator') fields[field.name] = [this.obj[field.name], field.validators]
        }
        this.objForm = this._fb.group(fields);
        this.objForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.focusEvent.emit(true);
    }

    public onValueChanged(fieldID?: any): void {
        if (!this.objForm) { return; }
        const form = this.objForm;
        for (const field in this.formErrors) {
            if (!fieldID || field === fieldID) {
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && !control.valid) {
                    const messages = this.validationMessages;
                    for (const key in control.errors) {
                        this.formErrors[field] += messages[key] + ' ';
                    }
                }
            }
        }
    }

    public validateAutocomplete(c: FormControl) {
        let result = (c.value && Object.keys(c.value)[0] === '0') ? {
            validateAutocomplete: {
                valid: false
            }
        } : null;
        return result;
    }

    public setValuesForm(): void {

        let values: {} = {
            _id: this.obj._id
        }
        for (let field of this.formFields) {
            if (field.tag !== 'separator') {
                if (field.name.split('.').length > 1) {
                    let sumF: string = '';
                    let entro: boolean = false;
                    for (let f of field.name.split('.')) {
                        sumF += `['${f}']`;
                        if (eval(`this.obj${sumF}`) == null || eval(`this.obj${sumF}`) == undefined) {
                            entro = true;
                            eval(`this.obj${sumF} = {}`);
                        }
                    }
                    if (entro) eval(`this.obj${sumF} = null`);
                }
                switch (field.tagType) {
                    case 'date':
                        values[field.name] = (eval("this.obj." + field.name) !== undefined) ? moment(eval("this.obj." + field.name)).format('YYYY-MM-DD') : null
                        break;
                    case 'file':
                        if (!this.oldFiles || !this.oldFiles[field.name]) {
                            this.oldFiles = new Array();
                            this.oldFiles[field.name] = eval("this.obj?." + field.name);
                        }
                        break;
                    default:
                        if (field.tag !== 'separator') values[field.name] = (eval("this.obj." + field.name) !== undefined) ? eval("this.obj." + field.name) : null
                        break;
                }
            }
        }
        if (this.applications && this.applications.length > 0) {
            this.applications.forEach(x => {
                let exists: boolean = false;
                if (this.obj && this.obj.applications && this.obj.applications.length > 0) {
                    this.obj.applications.forEach(y => {
                        if (x._id === y._id) {
                            exists = true;
                            const control = new FormControl(y);
                            (this.objForm.controls.applications as FormArray).push(control);
                        }
                    })
                }
                if (!exists) {
                    const control = new FormControl(false);
                    (this.objForm.controls.applications as FormArray).push(control);
                }
            })
        }

        this.objForm.patchValue(values);
    }

    public async addObj() {

        let isValid: boolean = true;

        if (isValid) {
            this.obj = Object.assign(this.obj, this.objForm.value);
            const selectedOrderIds = this.objForm.value.applications
                .map((v, i) => (v ? this.applications[i] : null))
                .filter(v => v !== null);
            this.obj.applications = selectedOrderIds;
        } else {
            this.onValueChanged();
        }

        if (isValid) {
            for (let field of this.formFields) {
                switch (field.tagType) {
                    case 'date':
                        this.obj[field.name] = (moment(this.obj[field.name]).isValid()) ? moment(this.obj[field.name]).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ') : null;
                        break;
                    case 'number':
                        this.obj[field.name] = parseFloat(this.obj[field.name]);
                        break;
                    case 'file':
                        if (this.filesToUpload && this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
                            this.loading = true;
                            this._objService.deleteFile(this.typeFile[field.name], field.name.split('.')[field.name.split('.').length - 1], this.obj[field.name]);
                            if (this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
                                this.obj[field.name] = this.oldFiles[field.name];
                                if (field.multiple && (!this.obj || !this.obj[field.name] || this.obj[field.name].length === 0)) {
                                    this.obj[field.name] = new Array();
                                }
                                for (let file of this.filesToUpload[field.name]) {
                                    await this._objService.uploadFile(this.typeFile[field.name], field.name.split('.')[field.name.split('.').length - 1], file)
                                        .then(result => {
                                            this.loading = false;
                                            if (result['result']) {
                                                if (!field.multiple) {
                                                    this.obj[field.name] = result['result'];
                                                } else {
                                                    this.obj[field.name].push(result['result']);
                                                }
                                            } else {
                                                this.showToast(result['error'].message, 'info');
                                                isValid = false;
                                            }
                                        })
                                        .catch(error => { this.loading = false; isValid = false; this.showToast(error.message, 'danger'); });
                                }
                            }
                            this.loading = false;
                        } else {
                            if (this.oldFiles) this.obj[field.name] = this.oldFiles[field.name];
                        }
                        break;
                    case 'boolean':
                        this.obj[field.name] = this.obj[field.name] == 'true';
                    default:
                        break;
                }
            }
        }

        if (isValid) {
            switch (this.operation) {
                case 'add':
                    this.saveObj();
                    break;
                case 'update':
                    this.updateObj();
                    break;
                case 'delete':
                    this.deleteObj();
                    break;
            }
        } else {
            this.showToast(null, 'info', 'Revise los errores marcados en el formulario');
        }
    }

    public deleteFile(typeFile: string, fieldName: string, filename: string) {
        this._objService.deleteFile(typeFile, fieldName.split('.')[fieldName.split('.').length - 1], filename).subscribe(
            result => {
                if (result.status === 200) {
                    try {
                        eval('this.obj.' + fieldName + ' = this.obj.' + fieldName + '.filter(item => item !== filename)');
                    } catch (error) {
                        eval('this.obj.' + fieldName + ' = null');
                    }
                    this.loading = true;
                    this.subscription.add(
                        this._objService.update(this.obj).subscribe(
                            result => {
                                this.showToast(result);
                                this.setValuesForm();
                            },
                            error => this.showToast(error)
                        )
                    );
                } else {
                    this.showToast(result);
                }
            },
            error => this.showToast(error)
        )
    }

    public saveObj() {
        this.loading = true;
        this.subscription.add(
            this._objService.save(this.obj).subscribe(
                result => {
                    this.showToast(result);
                    if (result.status === 200) this._router.navigate(['/categories']);
                },
                error => this.showToast(error)
            )
        );
    }

    public updateObj() {
        this.loading = true;
        this.subscription.add(
            this._objService.update(this.obj).subscribe(
                result => {
                    this.showToast(result);
                    if (result.status === 200) this._router.navigate(['/categories']);
                },
                error => this.showToast(error)
            )
        );
    }

    public deleteObj() {
        this.loading = true;
        this.subscription.add(
            this._objService.delete(this.obj._id).subscribe(
                async result => {
                    this.showToast(result);
                    if (result.status === 200) {
                        this._router.navigate(['/categories']);
                    }
                },
                error => this.showToast(error)
            )
        );
    }

    public getAllApplications(match: {}): Promise<Application[]> {
        return new Promise<Application[]>((resolve, reject) => {
            this.subscription.add(this._applicationService.getAll({
                match,
                sort: { name: 1 },
            }).subscribe(
                result => {
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            ));
        });
    }

    public getCategories(match: {}): Promise<Category[]> {
        return new Promise<Category[]>((resolve, reject) => {
            this.subscription.add(this._objService.getAll({
                project : {
                    name: "$description",
                    operationType: 1
                },
                match,
                sort: { description: 1 },
                limit: 10,
            }).subscribe(
                result => {
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            ));
        });
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
