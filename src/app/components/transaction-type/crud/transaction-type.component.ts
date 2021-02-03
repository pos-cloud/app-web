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
import { TransactionTypeService } from '../transaction-type.service';
import { TransactionMovement, TransactionType, CurrentAccount, Movements, EntryAmount, PriceType, DescriptionType, StockMovement } from '../transaction-type';
import { BranchService } from 'app/components/branch/branch.service';
import { Branch } from 'app/components/branch/branch';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { ApplicationService } from 'app/components/application/application.service';
import { Application } from 'app/components/application/application.model';
import { Company, CompanyType } from 'app/components/company/company';
import { EmployeeType } from 'app/components/employee-type/employee-type.model';
import { EmployeeTypeService } from 'app/components/employee-type/employee-type.service';
import { PaymentMethodService } from 'app/components/payment-method/payment-method.service';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { EmailTemplateService } from 'app/components/email-template/email-template.service';
import { EmailTemplate } from 'app/components/email-template/email-template';
import { ShipmentMethodService } from 'app/components/shipment-method/shipment-method.service';
import { ShipmentMethod } from 'app/components/shipment-method/shipment-method.model';
import { PrinterService } from 'app/components/printer/printer.service';
import { Printer } from 'app/components/printer/printer';
import { CompanyService } from 'app/components/company/company.service';
import Resulteable from 'app/util/Resulteable';


@Component({
    selector: 'app-transaction-type',
    templateUrl: './transaction-type.component.html',
    styleUrls: ['./transaction-type.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class TransactionTypeComponent implements OnInit {

    public objId: string;
    public readonly: boolean;
    public operation: string;
    public obj: TransactionType;
    public objForm: FormGroup;
    public loading: boolean = false;
    public schedule: FormArray;
    public focusEvent = new EventEmitter<boolean>();
    public title: string = 'transaction-type';
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
    public branches: Branch[];
    public paymentMethods: PaymentMethod[];

    public searchBranches = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['branch'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getBranches(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterBranches = (x: { name: string }) => x.name;

    public searchApplications = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['application'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getApplications(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterApplications = (x: { name: string }) => x.name;

    public searchEmployeeType = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['requestEmployee'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { description: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getEmployeeType(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterEmployeeType = (x: { name: string }) => x.name;

    public searchPaymentMethods = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['fastPayment'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getPaymentMethods(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterPaymentMethods = (x: { name: string }) => x.name;

    public searchEmailTemplates = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['defectEmailTemplate'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getEmailTemplates(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterEmailTemplates = (x: { name: string }) => x.name;

    public searchShipmentMethods = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['defectShipmentMethod'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getShipmentMethods(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterShipmentMethods = (x: { name: string }) => x.name;

    public searchPrinters = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['defectPrinter'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                return await this.getPrinters(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterPrinters = (x: { name: string }) => x.name;


    public searchCompanies = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const inputFocus$ = this.focus$['company'];
        return merge(debouncedText$, inputFocus$).pipe(
            tap(() => this.loading = true),
            switchMap(async term => {
                let match: {} = (term && term !== '') ? { name: { $regex: term, $options: 'i' } } : {};
                match["operationType"] = { "$ne": "D" };
                if(this.objForm.value.requestCompany !== null){
                    match["type"] = this.objForm.value.requestCompany
                }
                return await this.getCompanies(match).then(
                    result => {
                        return result;
                    }
                );
            }),
            tap(() => this.loading = false),
        )
    }

    public formatterCompanies = (x: { name: string }) => x.name;


    public formFields: FormField[] = [
        {
            name: 'order',
            tag: 'input',
            tagType: 'number',
            validators: [Validators.required],
            class: 'form-group col-md-1'
        }, {
            name: 'branch',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchBranches,
            format: this.formatterBranches,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        }, {
            name: 'name',
            tag: 'input',
            tagType: 'text',
            validators: [Validators.required],
            class: 'form-group col-md-4'
        }, {
            name: 'abbreviation',
            tag: 'input',
            tagType: 'text',
            validators: [Validators.required],
            class: 'form-group col-md-1'
        }, {
            name: 'transactionMovement',
            tag: 'select',
            tagType: 'text',
            values: [TransactionMovement.Money, TransactionMovement.Purchase, TransactionMovement.Sale, TransactionMovement.Stock],
            validators: [Validators.required],
            class: 'form-group col-md-3'
        }, {
            name: 'currentAccount',
            tag: 'select',
            tagType: 'text',
            values: [CurrentAccount.Charge, CurrentAccount.No, CurrentAccount.Yes],
            validators: [Validators.required],
            class: 'form-group col-md-3'
        }, {
            name: 'movement',
            tag: 'select',
            tagType: 'text',
            values: [Movements.Inflows, Movements.Outflows],
            validators: [Validators.required],
            class: 'form-group col-md-3'
        }, {
            name: 'Permisos',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        }, {
            name: 'level',
            tag: 'input',
            tagType: 'number',
            class: 'form-group col-md-2'
        }, {
            name: 'allowEdit',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        }, {
            name: 'allowDelete',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        }, {
            name: 'allowAPP',
            tag: 'select',
            tagType: 'boolean',
            values: ['false', 'true'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        }, {
            name: 'application',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchApplications,
            format: this.formatterApplications,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        }, {
            name: 'Numeración',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        }, {
            name: 'electronics',
            tag: 'select',
            tagType: 'boolean',
            values: ['false', 'true'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        }, {
            name: 'tax',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        }, {
            name: 'requestTaxes',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        },
        {
            name: 'automaticNumbering',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        },
        {
            name: 'fiscalCode',
            tag: 'input',
            tagType: 'text',
            class: 'form-group col-md-2'
        },
        {
            name: 'defectUseOfCFDI',
            tag: 'input',
            tagType: 'text',
            class: 'form-group col-md-2'
        },
        {
            name: 'fixedOrigin',
            tag: 'input',
            tagType: 'number',
            class: 'form-group col-md-2'
        }, {
            name: 'fixedLetter',
            tag: 'select',
            tagType: 'text',
            values: ["X", 'A', 'B', "C", "E", "M", "R", "T", " "],
            default: "X",
            class: 'form-group col-md-2'
        },
        {
            name: "expirationDate",
            tag: 'input',
            tagType: 'date',
            class: 'form-group col-md-2'
        },
        {
            name: "maxOrderNumber",
            tag: 'input',
            tagType: "number",
            class: 'form-group col-md-2'
        },
        {
            name: 'automaticCreation',
            tag: 'select',
            tagType: 'boolean',
            values: ['false', 'true'],
            validators: [Validators.required],
            class: 'form-group col-md-2'
        },
        {
            name: "orderNumber",
            tag: 'input',
            tagType: "number",
            class: 'form-group col-md-2'
        },
        {
            name: "resetOrderNumber",
            tag: 'input',
            tagType: "text",
            class: 'form-group col-md-2'
        },
        {
            name: 'Personalizado',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        },
        {
            name: 'requestCompany',
            tag: 'select',
            tagType: 'text',
            values: [CompanyType.None, CompanyType.Client, CompanyType.Provider],
            class: 'form-group col-md-4'
        },
        {
            name: 'company',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchCompanies,
            format: this.formatterCompanies,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        }, {
            name: 'allowCompanyDiscount',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            validators: [Validators.required],
            class: 'form-group col-md-4'
        },
        {
            name: 'requestEmployee',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchEmployeeType,
            format: this.formatterEmployeeType,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        },
        {
            name: 'requestCurrency',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'defectOrders',
            tag: 'select',
            tagType: 'boolean',
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        },
        {
            name: 'requestTransport',
            tag: 'select',
            tagType: 'boolean',
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'Producto',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        },
        {
            name: 'requestArticles',
            tag: 'select',
            tagType: 'boolean',
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        },
        {
            name: 'modifyArticle',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'showPrices',
            tag: 'select',
            tagType: 'boolean',
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'showPriceType',
            tag: 'select',
            tagType: 'text',
            values: [PriceType.Base, PriceType.Final, PriceType.SinTax],
            class: 'form-group col-md-2'
        },
        {
            name: 'entryAmount',
            tag: 'select',
            tagType: 'text',
            values: [EntryAmount.CostWithVAT, EntryAmount.CostWithoutVAT, EntryAmount.SaleWithVAT, EntryAmount.SaleWithoutVAT],
            class: 'form-group col-md-2'
        },
        {
            name: 'showDescriptionType',
            tag: 'select',
            tagType: 'text',
            values: [DescriptionType.Code, DescriptionType.Description, DescriptionType.PosDescription],
            class: 'form-group col-md-2'
        },
        {
            name: 'updatePrice',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        },
        {
            name: 'updateArticle',
            tag: 'select',
            tagType: "boolean",
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'groupsArticles',
            tag: 'select',
            tagType: "boolean",
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'Stock',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        },
        {
            name: 'modifyStock',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        },
        {
            name: 'stockMovement',
            tag: 'select',
            tagType: "text",
            values: [null, StockMovement.Inflows, StockMovement.Inventory, StockMovement.Outflows, StockMovement.Transfer],
            default: null,
            class: 'form-group col-md-2'
        },
        {
            name: 'Fondos',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        },

        {
            name: 'cashBoxImpact',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            default: 'true',
            class: 'form-group col-md-2'
        }, {
            name: 'cashOpening',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            default: 'false',
            class: 'form-group col-md-2'
        }, {
            name: 'cashClosing',
            tag: 'select',
            tagType: "boolean",
            default: 'false',
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        },

        {
            name: 'Correo',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        }, {
            name: 'requestEmailTemplate',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'defectEmailTemplate',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchEmailTemplates,
            format: this.formatterEmailTemplates,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        },

        {
            name: 'Método de Entrega',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        }, {
            name: 'requestShipmentMethod',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'defectShipmentMethod',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchShipmentMethods,
            format: this.formatterShipmentMethods,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        },

        {
            name: 'Impresión',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        },
        {
            name: 'labelPrint',
            tag: 'input',
            tagType: 'text',
            class: 'form-group col-md-3'
        },
        {
            name: 'defectPrinter',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchPrinters,
            format: this.formatterPrinters,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        },
        {
            name: 'isPreprinted',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'printable',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'readLayout',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        },

        {
            name: 'printSign',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'printOrigin',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'posKitchen',
            tag: 'select',
            tagType: "boolean",
            values: ['false', 'true'],
            class: 'form-group col-md-2'
        }, {
            name: 'printDescriptionType',
            tag: 'select',
            tagType: 'text',
            values: [DescriptionType.Code, DescriptionType.Description, DescriptionType.PosDescription],
            class: 'form-group col-md-2'
        }, {
            name: 'numberPrint',
            tag: 'input',
            tagType: 'number',
            class: 'form-group col-md-2'
        },
        {
            name: 'Método de Pago',
            tag: 'separator',
            tagType: null,
            class: 'form-group col-md-12'
        },
        {
            name: 'requestPaymentMethods',
            tag: 'select',
            tagType: "boolean",
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'allowZero',
            tag: 'select',
            tagType: "boolean",
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'fastPayment',
            tag: 'autocomplete',
            tagType: 'text',
            search: this.searchPaymentMethods,
            format: this.formatterPaymentMethods,
            values: null,
            focus: false,
            class: 'form-group col-md-4'
        },
        {
            name: 'finishCharge',
            tag: 'select',
            tagType: "boolean",
            values: ['true', 'false'],
            class: 'form-group col-md-2'
        },
        {
            name: 'showKeyboard',
            tag: 'select',
            tagType: "boolean",
            values: ['true', 'false'],
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
        private _objService: TransactionTypeService,
        private _toastr: ToastrService,
        private _title: Title,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _branchService: BranchService,
        public _applicationService: ApplicationService,
        public _employeeTypeService: EmployeeTypeService,
        public _paymentMethod: PaymentMethodService,
        public _emailTemplate: EmailTemplateService,
        public _shipmentMethod: ShipmentMethodService,
        public _printer: PrinterService,
        public _company: CompanyService,
        public translatePipe: TranslateMePipe,
        private _router: Router,
    ) {
        this.obj = new TransactionType();
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
                order: 1,
                name: 1,
                abbreviation: 1,
                transactionMovement: 1,
                labelPrint: 1,
                currentAccount: 1,
                movement: 1,
                electronics: 1,
                automaticCreation: 1,
                requestTaxes: 1,
                level: 1,
                tax: 1,
                allowEdit: 1,
                allowDelete: 1,
                allowAPP: 1,
                requestCompany: 1,
                requestCurrency: 1,
                defectOrders: 1,
                automaticNumbering: 1,
                requestTransport: 1,
                defectUseOfCFDI: 1,
                fiscalCode: 1,
                fixedOrigin: 1,
                fixedLetter: 1,
                expirationDate: 1,
                maxOrderNumber: 1,
                requestArticles: 1,
                modifyArticle: 1,
                entryAmount: 1,
                orderNumber : 1,
                showPrices: 1,
                showPriceType: 1,
                updatePrice: 1,
                showDescriptionType: 1,
                updateArticle: 1,
                groupsArticles: 1,
                requestPaymentMethods: 1,
                showKeyboard: 1,
                allowZero: 1,
                finishCharge: 1,
                modifyStock: 1,
                stockMovement: 1,
                cashBoxImpact: 1,
                cashOpening: 1,
                cashClosing: 1,
                requestEmailTemplate: 1,
                requestShipmentMethod: 1,
                isPreprinted: 1,
                printable: 1,
                readLayout: 1,
                posKitchen: 1,
                printOrigin: 1,
                printSign: 1,
                printDescriptionType: 1,
                numberPrint: 1,
                "branch._id": 1,
                "branch.name": 1,
                "company._id": 1,
                "company.name": 1,
                "defectShipmentMethod._id": 1,
                "defectShipmentMethod.name": 1,
                "defectPrinter._id": 1,
                "defectPrinter.name": 1,
                "defectEmailTemplate._id": 1,
                "defectEmailTemplate.name": 1,
                "fastPayment._id": 1,
                "fastPayment.name": 1,
                "application._id": 1,
                "application.name": 1,
                "requestEmployee._id": 1,
                "requestEmployee.description": 1,
                "paymentMethods._id" : 1,
                "paymentMethods.name" : 1,
                "resetOrderNumber" : 1
            }

            this.subscription.add(this._objService.getAll({
                project : project,
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

        await this.getAllPaymentMethods()
            .then((result: PaymentMethod[]) => {
                this.paymentMethods = result;
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
            paymentMethods: this._fb.array([])
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
            _id: this.obj._id,
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


        if (this.paymentMethods && this.paymentMethods.length > 0) {
            this.paymentMethods.forEach(x => {
                let exists: boolean = false;
                if (this.obj && this.obj.paymentMethods && this.obj.paymentMethods.length > 0) {
                    this.obj.paymentMethods.forEach(y => {
                        if (x._id === y._id) {
                            exists = true;
                            const control = new FormControl(y);
                            (this.objForm.controls.paymentMethods as FormArray).push(control);
                        }
                    })
                }
                if (!exists) {
                    const control = new FormControl(false);
                    (this.objForm.controls.paymentMethods as FormArray).push(control);
                }
            })
        }


        this.objForm.patchValue(values);
    }

    public async addObj() {

        let isValid: boolean = true;

        isValid = (this.operation === 'delete') ? true : this.objForm.valid;
        
        if (isValid) {
            this.obj = Object.assign(this.obj, this.objForm.value);
            const selectedOrderIds = this.objForm.value.paymentMethods
                .map((v, i) => (v ? this.paymentMethods[i] : null))
                .filter(v => v !== null);
            this.obj.paymentMethods = selectedOrderIds;
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
                        if(this.obj[field.name] === "null") this.obj[field.name] = null;
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
                    if (result.status === 200) this._router.navigate(['/transaction-types']);
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
                    if (result.status === 200) this._router.navigate(['/transaction-types']);
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
                        this._router.navigate(['/transaction-types']);
                    }
                },
                error => this.showToast(error)
            )
        );
    }

    public getBranches(match: {}): Promise<Branch[]> {
        return new Promise<Branch[]>((resolve, reject) => {
            this.subscription.add(this._branchService.getAll({
                match,
                sort: { name: 1 },
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

    public getApplications(match: {}): Promise<Application[]> {
        return new Promise<Application[]>((resolve, reject) => {
            this.subscription.add(this._applicationService.getAll({
                match,
                sort: { name: 1 },
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

    public getEmployeeType(match: {}): Promise<EmployeeType[]> {
        return new Promise<EmployeeType[]>((resolve, reject) => {
            let project = {
                name: "$description",
                operationType: 1
            }
            this.subscription.add(this._employeeTypeService.getAll({
                project,
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

    public getPaymentMethods(match: {}): Promise<PaymentMethod[]> {
        return new Promise<PaymentMethod[]>((resolve, reject) => {
            this.subscription.add(this._paymentMethod.getAll({
                project: { name: 1, operationType: 1 },
                match,
                sort: { name: 1 },
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

    public getEmailTemplates(match: {}): Promise<EmailTemplate[]> {
        return new Promise<EmailTemplate[]>((resolve, reject) => {
            this.subscription.add(this._emailTemplate.getAll({
                project: { name: 1, operationType: 1 },
                match,
                sort: { name: 1 },
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

    public getShipmentMethods(match: {}): Promise<ShipmentMethod[]> {
        return new Promise<ShipmentMethod[]>((resolve, reject) => {
            this.subscription.add(this._shipmentMethod.getAll({
                project: { name: 1, operationType: 1 },
                match,
                sort: { name: 1 },
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

    public getPrinters(match: {}): Promise<Printer[]> {
        return new Promise<Printer[]>((resolve, reject) => {
            this.subscription.add(this._printer.getAll({
                project: { name: 1, operationType: 1 },
                match,
                sort: { name: 1 },
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

    public getCompanies(match: {}): Promise<Company[]> {
        return new Promise<Company[]>((resolve, reject) => {
            this.subscription.add(this._company.getAll({
                project: { name: 1, operationType: 1, type: 1 },
                match,
                sort: { name: 1 },
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

    public getAllPaymentMethods(): Promise<PaymentMethod[]> {
        return new Promise<PaymentMethod[]>((resolve, reject) => {
            this.subscription.add(this._paymentMethod.getAll({
                match : { operationType : {"$ne": "D"}},
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
