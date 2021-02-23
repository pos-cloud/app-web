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
import { BranchService } from 'app/components/branch/branch.service';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ApplicationService } from 'app/components/application/application.service';
import { Company, CompanyType } from 'app/components/company/company';
import { EmployeeTypeService } from 'app/components/employee-type/employee-type.service';
import { PaymentMethodService } from 'app/components/payment-method/payment-method.service';
import { EmailTemplateService } from 'app/components/email-template/email-template.service';
import { ShipmentMethodService } from 'app/components/shipment-method/shipment-method.service';
import { PrinterService } from 'app/components/printer/printer.service';
import { CompanyService } from 'app/components/company/company.service';
import { AccountSeatService } from '../account-seat.service';
import { AccountSeat } from '../account-seat';
import { AccountPeriodService } from 'app/components/account-period/account-period.service';
import { AccountService } from 'app/components/account/account.service';
import { Account } from 'app/components/account/account';
import { AccountPeriod } from 'app/components/account-period/account-period';



@Component({
    selector: 'app-account-seat',
    templateUrl: './account-seat.component.html',
    styleUrls: ['./account-seat.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class AccountSeatComponent implements OnInit {

    public objId: string;
    public readonly: boolean;
    public operation: string;
    public obj: AccountSeat;
    public objForm: FormGroup;
    public loading: boolean = false;
    public schedule: FormArray;
    public focusEvent = new EventEmitter<boolean>();
    public title: string = 'account-seat';
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
    public debit;
    public credit;

    public searchPeriods = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                return await this.getAllPeriods(match).then(
                    result => {
                        return result;
                    }
                )
            }),
            tap(() => this.loading = false)
        )
    public formatterPeriods = (x: AccountPeriod) => { return x['name'] };

    public searchAccount = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { description: { $regex: term, $options: 'i' } } : {};
                return await this.getAllAccounts(match).then(
                    result => {
                        return result;
                    }
                )
            }),
            tap(() => this.loading = false)
        )
    public formatterAccount = (x: Account) => { return x.description; };

    public formFields: FormField[] = [
        {
            name: 'date',
            tag: 'input',
            tagType: 'date',
            class: 'form-group col-md-2'
        },
        {
            name: 'período',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchPeriods,
            format: this.formatterPeriods,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        },
        {
            name: 'observation',
            tag: 'input',
            tagType: 'text',
            class: 'form-group col-md-2'
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
        private _objService: AccountSeatService,
        private _toastr: ToastrService,
        private _title: Title,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _branchService: BranchService,
        public _applicationService: ApplicationService,
        public _accountService : AccountService,
        public _periodService: AccountPeriodService,
        public _employeeTypeService: EmployeeTypeService,
        public _paymentMethod: PaymentMethodService,
        public _emailTemplate: EmailTemplateService,
        public _shipmentMethod: ShipmentMethodService,
        public _printer: PrinterService,
        public _company: CompanyService,
        public translatePipe: TranslateMePipe,
        private _router: Router,
    ) {
        this.obj = new AccountSeat();
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
                date: 1,
                observation: 1,
                period: 1,
                "items.account": 1,
                "items.debit": 1,
                "items.credit": 1
            }

            this.subscription.add(this._objService.getAll({
                project: project,
                match: {
                    operationType: { $ne: "D" },
                    _id: { $oid: this.objId }
                }
            }).subscribe(
                result => {
                    console.log(result);
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
            'items': this._fb.array([])
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


        console.log(this.obj.items);

        if(this.obj.items && this.obj.items.length > 0){
            var items = <FormArray>this.objForm.controls.items;
            this.obj.items.forEach(x => {
                console.log(x);
                items.push(this._fb.group({
                    '_id': null,
                    'account': x.account,
                    'debit': x.debit,
                    'credit': x.credit
                }))
            })
        }

        this.objForm.patchValue(values);
    }

    public async addObj() {

        let isValid: boolean = true;

        isValid = (this.operation === 'delete') ? true : this.objForm.valid;

        if (isValid) {
            this.obj = Object.assign(this.obj, this.objForm.value);
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
                        this.obj[field.name] = this.obj[field.name] == 'true' || this.obj[field.name] == true;
                        break;
                    case 'text':
                        if (this.obj[field.name] === "null") this.obj[field.name] = null;
                        if (field.tag === 'autocomplete' && (this.obj[field.name] == "" || (this.obj[field.name] && !this.obj[field.name]['_id']))) {
                            this.obj[field.name] = null;
                        }
                        break;
                    default:
                        break;
                }
            }
        }

        console.log(this.obj);

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
                    if (result.status === 200) this._router.navigate(['/account-seats']);
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
                    if (result.status === 200) this._router.navigate(['/account-seats']);
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
                        this._router.navigate(['/account-seats']);
                    }
                },
                error => this.showToast(error)
            )
        );
    }

    public getAllPeriods(match: {}): Promise<Account[]> {
        return new Promise<Account[]>((resolve, reject) => {
            this.subscription.add(this._periodService.getAll({
                project : {
                    "name" : { $concat: ["$status"," Inicio:",{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }," Fin:", { "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } } ] },
                    startDate : { "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y", "timezone": "-03:00" } },
                    endDate : { "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }
                },
                match,
                sort: { startDate: 1 },
            }).subscribe(
                result => {
                    console.log(result);
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            ));
        });
    }

    public getAllAccounts(match: {}): Promise<Account[]> {
        return new Promise<Account[]>((resolve, reject) => {
            this.subscription.add(this._accountService.getAll({
                match,
                sort: { description: 1 },
            }).subscribe(
                result => {
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            ));
        });
    }

    public addItem(itemForm: NgForm): void {

        let valid = true;
        const item = this.objForm.controls.items as FormArray;

        console.log(item.value);

        if (valid) {
            item.push(
                this._fb.group({
                    _id: null,
                    account: itemForm.value.account,
                    debit: itemForm.value.debit,
                    credit: itemForm.value.credit
                })
            );
            itemForm.resetForm();
        }
    }

    deleteItem(index) {
        let control = <FormArray>this.objForm.controls.items;
        control.removeAt(index)
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
