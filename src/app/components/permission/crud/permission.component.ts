import { Component, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl, UntypedFormArray, NgForm } from '@angular/forms';
import * as moment from 'moment';
import 'moment/locale/es';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Permission } from '../permission.model';
import { PermissionService } from '../permission.service';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { Subscription, Subject } from 'rxjs';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { FormField } from 'app/util/formField.interface';
import { Config } from 'app/app.config';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import Resulteable from 'app/util/Resulteable';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';

@Component({
    selector: 'app-permission',
    templateUrl: './permission.component.html',
    styleUrls: ['./permission.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class PermissionComponent implements OnInit {

    public objId: string;
    public readonly: boolean;
    public operation: string;
    public obj: Permission;
    public objForm: UntypedFormGroup;
    public colecctions: UntypedFormArray;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public title: string = 'permission';
    private subscription: Subscription = new Subscription();
    private capitalizePipe: CapitalizePipe = new CapitalizePipe();
    public focus$: Subject<string>[] = new Array();
    public stateId: number;
    public filesToUpload: any[] = new Array();
    public filename: any[] = new Array();
    public typeFile: any[] = new Array();
    public tables: string[] = ["empresas", "transacciones"];
    public oldFiles: any[];
    public apiURL: string = Config.apiV8URL;
    public database: string = Config.database;
    public transactionTypes: TransactionType[];

    public formFields: FormField[] = [{
        name: 'Datos de los permisos',
        tag: 'separator',
        tagType: null,
        class: 'form-group col-md-12'
    }, {
        name: 'name',
        tag: 'input',
        tagType: 'string',
        validators: [Validators.required],
        focus: true,
        class: 'form-group col-md-2'
    },
    {
        name: 'filterTransaction',
        tag: 'select',
        tagType: "boolean",
        default: ['false'],
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'filterCompany',
        tag: 'select',
        tagType: "boolean",
        default: ['false'],
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'editArticle',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        default: ['true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'allowDiscount',
        tag: 'select',
        tagType: "boolean",
        default: ['true'],
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'Menu',
        tag: 'separator',
        tagType: null,
        class: 'form-group col-md-12'
    },
    {
        name: 'menu.sales.counter',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.sales.webOrders',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.sales.delivery',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.sales.voucherReader',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.sales.resto',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.purchases',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.stock',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.money',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.production',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.articles',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.companies.client',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.companies.provider',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.resto',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.gallery',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.report',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    },
    {
        name: 'menu.config',
        tag: 'select',
        tagType: "boolean",
        values: ['false', 'true'],
        class: 'form-group col-md-2'
    }];
    public formErrors: {} = {};
    public validationMessages = {
        'required': 'Este campo es requerido.',
    };

    constructor(
        private _objService: PermissionService,
        private _transactionType : TransactionTypeService,
        private _toastr: ToastrService,
        private _title: Title,
        public _fb: UntypedFormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public translatePipe: TranslateMePipe,
        private _router: Router,
    ) {
        this.obj = new Permission();
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
                "name" : 1,
                "filterTransaction":1,
                "filterCompany": 1,
                "editArticle": 1,
                "allowDiscount": 1,
                "menu": 1,
                "collections": 1,
                "transactionTypes._id": 1,
                "transactionTypes.name": 1,
                "transactionTypes.transactionMovement" : 1
            }
            this.subscription.add(this._objService.getAll({
                project: project,
                match: {
                    operationType: { $ne: "D" },
                    _id: { $oid: this.objId }
                }
            }).subscribe(
                async result => {
                    this.loading = false;
                    if (result.status === 200) {
                        this.obj = result.result[0];
                        
                    }
                    else this.showToast(result);
                },
                error => this.showToast(error)
            ));
        }
        
        await this.getAllTransactionTypes()
            .then((result: TransactionType[]) => {
                this.transactionTypes = result;
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
            'collections': this._fb.array([]),
            'transactionTypes': this._fb.array([])
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

    public validateAutocomplete(c: UntypedFormControl) {
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

        if (this.obj.collections && this.obj.collections.length > 0) {
            let collections = <UntypedFormArray>this.objForm.controls.collections;
            this.obj.collections.forEach(x => {

                collections.push(this._fb.group({
                    '_id': null,
                    'name': x.name,
                    'actions': x.actions
                }))
            })
        }

        if (this.transactionTypes && this.transactionTypes.length > 0) {
            this.transactionTypes.forEach(x => {
                let exists: boolean = false;
                if (this.obj && this.obj.transactionTypes && this.obj.transactionTypes.length > 0) {
                    this.obj.transactionTypes.forEach(y => {
                        if (x._id === y._id) {
                            exists = true;
                            const control = new UntypedFormControl(y);
                            (this.objForm.controls.transactionTypes as UntypedFormArray).push(control);
                        }
                    })
                }
                if (!exists) {
                    const control = new UntypedFormControl(false);
                    (this.objForm.controls.transactionTypes as UntypedFormArray).push(control);
                }
            })
        }

        this.objForm.patchValue(values);
    }

    public addCollection(collectionForm: NgForm): void {

        let valid = true;
        const collections = this.objForm.controls.collections as UntypedFormArray;

        this.objForm.controls.collections.value.forEach(element => {
            if (collectionForm.value.name == element.name) {
                this.showToast("", "warning", "Esta regla ya existe")
                valid = false;
            }
        });

        if (collectionForm.value.add === "" || collectionForm.value.edit === "" || collectionForm.value.delete === "" || collectionForm.value.export === "") {
            this.showToast("", "warning", "Debe completar todos los campos")
            valid = false;
        }

        if (valid) {
            collections.push(
                this._fb.group({
                    _id: null,
                    name: collectionForm.value.name,
                    actions: {
                        add: collectionForm.value.add,
                        edit: collectionForm.value.edit,
                        delete: collectionForm.value.delete,
                        export: collectionForm.value.export
                    }
                })
            );
            collectionForm.resetForm();
        }

    }

    deleteCollection(index) {
        let control = <UntypedFormArray>this.objForm.controls.collections;
        control.removeAt(index)
    }

    public async addObj() {

        let isValid: boolean = true;

        isValid = (this.operation === 'delete') ? true : this.objForm.valid;

        if (isValid) {
            this.obj = this.objForm.value;
        } else {
            this.onValueChanged();
        }

        //this.obj = Object.assign(this.obj, this.objForm.value);
            const selectedOrderIds = this.objForm.value.transactionTypes
                .map((v, i) => (v ? this.transactionTypes[i] : null))
                .filter(v => v !== null);
            this.obj.transactionTypes = selectedOrderIds;



        if (isValid) {
            for (let field of this.formFields) {
                switch (field.tagType) {
                    case 'date':
                        this.obj[field.name] = moment(this.obj[field.name]).format('YYYY-MM-DD') + moment().format('THH:mm:ssZ');
                        break;
                    case 'number':
                        this.obj[field.name] = parseFloat(this.obj[field.name]);
                        break;
                    case 'file':
                        if (this.filesToUpload && this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
                            this.loading = true;
                            this._objService.deleteFile(this.obj[field.name]);
                            if (this.filesToUpload[field.name] && this.filesToUpload[field.name].length > 0) {
                                this.obj[field.name] = this.oldFiles[field.name];
                                if (field.multiple && (!this.obj || !this.obj[field.name] || this.obj[field.name].length === 0)) {
                                    this.obj[field.name] = new Array();
                                }
                                for (let file of this.filesToUpload[field.name]) {
                                    await this._objService.uploadFile(null, file)
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
                        this.obj[field.name] = this.obj[field.name] == 'true' || this.obj[field.name] == true;
                        break;
                    case 'text':
                        if(field.tag === 'autocomplete' && (this.obj[field.name] == "" || (this.obj[field.name] && !this.obj[field.name]['_id']))){
                            this.obj[field.name] = null;
                        }
                        break;
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
        this._objService.deleteFile(filename).subscribe(
            result => {
                if (result.status === 200) {
                    eval('this.obj.' + fieldName + ' = this.obj.' + fieldName + '.filter(item => item !== filename)');
                    this.loading = true;
                    this.subscription.add(
                        this._objService.update(this.obj).subscribe(
                            result => {
                                this.showToast(result);
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
                    if (result.status === 200) this._router.navigate(['/permissions']);
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
                    if (result.status === 200) this._router.navigate(['/permissions']);
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
                        this._router.navigate(['/permissions']);
                    }
                },
                error => this.showToast(error)
            )
        );
    }

    public getAllTransactionTypes(): Promise<TransactionType[]> {
        return new Promise<TransactionType[]>((resolve, reject) => {
            this.subscription.add(this._transactionType.getAll({
                match: { operationType: { "$ne": "D" } },
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
