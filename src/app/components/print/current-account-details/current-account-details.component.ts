import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import * as jsPDF from 'jspdf';

import { DateFormatPipe } from './../../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../../pipes/round-number.pipe';
import { TransactionService } from 'app/services/transaction.service';
import { Config } from './../../../app.config';
import { CompanyType } from 'app/models/company';
import { ConfigService } from 'app/services/config.service';
import { CurrentAccount, Movements } from 'app/models/transaction-type';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Employee } from 'app/models/employee';
import { EmployeeService } from 'app/services/employee.service';

import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CompanyService } from 'app/services/company.service';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { MovementOfCashService } from 'app/services/movement-of-cash.service';

var splitRegex = /\r\n|\r|\n/g;
jsPDF.API.textEx = function (text: any, x: number, y: number, hAlign?: string, vAlign?: string) {
    var fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

    // As defined in jsPDF source code
    var lineHeightProportion = 1.5;

    var splittedText: string[];
    var lineCount: number = 1;
    if (vAlign === 'middle' || vAlign === 'bottom'
        || hAlign === 'center' || hAlign === 'right') {

        splittedText = typeof text === 'string'
            ? text.split(splitRegex)
            : text;

        lineCount = splittedText.length || 1;
    }

    // Align the top
    y += fontSize * (2 - lineHeightProportion);

    if (vAlign === 'middle') y -= (lineCount / 2) * fontSize;
    else if (vAlign === 'bottom') y -= lineCount * fontSize;


    if (hAlign === 'center'
        || hAlign === 'right') {

        var alignSize = fontSize;
        if (hAlign === 'center') alignSize *= 0.5;

        if (lineCount > 1) {
            for (var iLine = 0; iLine < splittedText.length; iLine++) {
                this.text(splittedText[iLine],
                    x - this.getStringUnitWidth(splittedText[iLine]) * alignSize,
                    y);
                y += fontSize;
            }
            return this;
        }
        x -= this.getStringUnitWidth(text) * alignSize;
    }

    this.text(text, x, y);
    return this;
};

@Component({
    selector: 'app-current-account-details',
    templateUrl: './current-account-details.component.html',
    styleUrls: ['./current-account-details.component.css']
})

export class CurrentAccountDetailsComponent implements OnInit {

    @Input() companyType: CompanyType;
    @Input() filterCompanyType;
    @Input() startDate;
    @Input() endDate;


    public searchCompanies = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(term =>
                this.getCompanies(term).then(
                    makes => {
                        return makes;
                    }
                )
            ),
            tap(() => this.loading = false)
        )

    public formatterCompanies = (x: { name: string }) => x.name;

    public companyForm: FormGroup;
    public alertMessage: string = '';
    public userType: string;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public dateFormat = new DateFormatPipe();
    public doc;
    public pdfURL;
    public config;
    public hasChanged = false;
    public roundNumber = new RoundNumberPipe();
    public pageWidth: number;
    public pageHigh: number;
    public withImage: boolean = false;
    public items = [];
    public employees: Employee[];
    public Client
    public Provider

    public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);


    public formErrors = {};

    public validationMessages = {
    };

    constructor(
        public _transactionService: TransactionService,
        public _movementOfCashService: MovementOfCashService,
        public _configService: ConfigService,
        public _employeeService: EmployeeService,
        public _fb: FormBuilder,
        public _router: Router,
        public _companyService: CompanyService,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        private domSanitizer: DomSanitizer
    ) {
        this.pageWidth = 210 * 100 / 35.27751646284102;
        this.pageHigh = 297 * 100 / 35.27751646284102;
        this.getEmployees();
    }

    async ngOnInit() {

        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
            }
        );

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.doc = new jsPDF('p', 'mm', [this.pageWidth, this.pageHigh]);
        this.buildForm();
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public buildForm(): void {

        this.companyForm = this._fb.group({
            'address': ['', []],
            'emails': ['', []],
            'company': ['', []],
            'employee': ['', []],
            'withDetails': ['', [
                Validators.required
            ]]

        });

        this.companyForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.companyForm) { return; }
        const form = this.companyForm;

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

    public getTransactions(): void {

        this.loading = true;

        let timezone = "-03:00";
        if (Config.timezone && Config.timezone !== '') {
            timezone = Config.timezone.split('UTC')[1];
        }

        let query = [];

        query.push(
            {
                "$lookup": {
                    "from": "transaction-types",
                    "foreignField": "_id",
                    "localField": "type",
                    "as": "type"
                }
            }, {
            "$unwind": {
                "path": "$type",
                "preserveNullAndEmptyArrays": true
            }
        }, {
            "$lookup": {
                "from": "companies",
                "foreignField": "_id",
                "localField": "company",
                "as": "company"
            }
        }, {
            "$unwind": {
                "path": "$company",
                "preserveNullAndEmptyArrays": true
            }
        }, {
            "$lookup": {
                "from": "vat-conditions",
                "foreignField": "_id",
                "localField": "company.vatCondition",
                "as": "company.vatCondition"
            }
        }, {
            "$unwind": {
                "path": "$company.vatCondition",
                "preserveNullAndEmptyArrays": true
            }
        }, {
            "$lookup": {
                "from": "identification-types",
                "foreignField": "_id",
                "localField": "company.identificationType",
                "as": "company.identificationType"
            }
        }, {
            "$unwind": {
                "path": "$company.identificationType",
                "preserveNullAndEmptyArrays": true
            }
        }, {
            "$lookup": {
                "from": "employees",
                "foreignField": "_id",
                "localField": "company.employee",
                "as": "company.employee"
            }
        }, {
            "$unwind": {
                "path": "$company.employee",
                "preserveNullAndEmptyArrays": true
            }
        }, {
            "$lookup": {
                "from": "states",
                "foreignField": "_id",
                "localField": "company.state",
                "as": "company.state"
            }
        }, {
            "$unwind": {
                "path": "$company.state",
                "preserveNullAndEmptyArrays": true
            }
        }, {
            "$project": {
                "_id": 1,
                "company._id": 1,
                "company.name": 1,
                "company.address": 1,
                "company.city": 1,
                "company.phones": 1,
                "company.emails": 1,
                "company.type": 1,
                "company.identificationType.name": 1,
                "company.identificationValue": 1,
                "company.vatCondition.description": 1,
                "company.employee._id": 1,
                "company.employee.name": 1,
                "company.operationType": 1,
                "company.state.name": 1,
                "endDate": 1,
                "endDate2": {
                    "$dateToString": {
                        "date": "$endDate",
                        "format": "%d/%m/%Y",
                        "timezone": timezone
                    }
                },
                "type.name": 1,
                "type.currentAccount": 1,
                "type.movement": 1,
                "number": 1,
                "letter": 1,
                "origin": 1,
                "expirationDate": {
                    "$dateToString": {
                        "date": "$expirationDate",
                        "format": "%d/%m/%Y",
                        "timezone": timezone
                    }
                },
                "state": 1,
                "balance": 1,
                "operationType": 1,
                "type.labelPrint": 1,
                "totalPrice": {
                    "$switch": {
                        "branches": [{
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                }, {
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                }, {
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                }, {
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                }, {
                                    "$eq": [this.companyType, "Cliente"]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProviderlse, false]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, false]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, false]
                                }, {
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, false]
                                }, {
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Si"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                }, {
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": ["$type.movement", "Entrada"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", -1]
                            }
                        }, {
                            "case": {
                                "$and": [{
                                    "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                }, {
                                    "$eq": [this.companyType, "Proveedor"]
                                }, {
                                    "$eq": ["$type.movement", "Salida"]
                                }, {
                                    "$eq": ["$type.currentAccount", "Cobra"]
                                }]
                            },
                            "then": {
                                "$multiply": ["$totalPrice", 1]
                            }
                        }],
                        "default": 0
                    }
                }
            }
        });

        let match = `{`;


        if (this.companyForm.value.company) {
            match += `"company._id": { "$oid" : "${this.companyForm.value.company._id}"},`
        }
        if (this.companyForm.value.employee) {
            match += `"company.employee._id": { "$oid" : "${this.companyForm.value.employee}"},`
        }

        /*if (this.startDate && this.endDate) {

            let timezone = "-03:00";
            if (Config.timezone && Config.timezone !== '') {
                timezone = Config.timezone.split('UTC')[1];
            }

            match += `"endDate" : { "$gte": {"$date": "${this.startDate}T00:00:00${timezone}"},
                                    "$lte": {"$date": "${this.endDate}T00:00:00${timezone}"}
                                },`
        }*/


        match += `  "balance" : { "$gt" : 0 },`
        match += `  "company.type" : "${this.companyType}",
                    "state" : "Cerrado",       
                    "type.currentAccount" : { "$ne" : "No"},   
                    "company.operationType" : { "$ne" : "D" },
                    "operationType" : { "$ne" : "D" } }`;

        match = JSON.parse(match);

        query.push({ "$match": match })

        query.push({
            "$group": {
                "_id": {
                    "company": "$company"
                },
                "transactions": {
                    "$push": "$$ROOT"
                },
                "count": {
                    "$sum": 1
                },
                "price": {
                    "$sum": "$totalPrice"
                },
                "balance": {
                    "$sum": "$balance"
                }
            }
        }, {
            "$sort": {
                "_id.company.name": 1,
                "transactions.endDate": 1
            }
        });

        this._transactionService.getTransactionsV3(
            query
        ).subscribe(
            result => {
                if (result) {
                    this.items = result;
                    this.print();
                    this.loading = false;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );

    }

    public print(): void {
        let page = 1;
        let row = 15;
        this.doc.setFontSize(this.fontSizes.extraLarge)
        this.doc.text(5, row, 'Resumen de cuenta de ' + this.companyType)
        row += 5;
        this.doc.setFontSize(this.fontSizes.large)
        this.doc.text(180, 280, "Hoja:" + page)
        for (var i = 0; i < this.items.length; i++) {
            this.doc.setLineWidth(1)
            this.doc.line(0, row, 1000, row)
            row += 5;
            this.doc.setFontSize(this.fontSizes.large)
            this.doc.text(5, row, this.items[i]._id.company.name)
            row += 5;
            this.doc.setFontSize(this.fontSizes.normal)
            if (this.items[i]._id.company.identificationType && this.items[i]._id.company.identificationValue) {
                this.doc.text(5, row, this.items[i]._id.company.identificationType.name + ":" + this.items[i]._id.company.identificationValue);
            }
            if (Config.country === 'AR') {
                this.doc.text(100, row, "Condición de IVA:")
                if (this.items[i]._id.company.vatCondition) {
                    this.doc.text(100 + 30, row, this.items[i]._id.company.vatCondition.description);
                }
            } else {
                this.doc.text(100, row, "Régimen Fiscal:")
                if (this.items[i]._id.company.vatCondition) {
                    this.doc.text(100 + 30, row, +this.items[i]._id.company.vatCondition.description);
                }
            }
            row += 5;
            this.doc.text(5, row, "Dirección:")
            if (this.items[i]._id.company.address) {
                this.doc.text(5 + 20, row, this.items[i]._id.company.address)
            }
            this.doc.text(100, row, "Ciudad:")
            if (this.items[i]._id.company.city) {
                this.doc.text(100 + 20, row, this.items[i]._id.company.city)
            }
            row += 5;
            this.doc.text(5, row, "Provincia:")
            if (this.items[i]._id.company.state) {
                this.doc.text(5 + 20, row, this.items[i]._id.company.state.name)
            }
            this.doc.text(100, row, "Teléfono:")
            if (this.items[i]._id.company.phones) {
                this.doc.text(100 + 20, row, this.items[i]._id.company.phones)
            }

            row += 5;
            this.doc.setLineWidth(0.5);
            this.doc.line(0, row, 1000, row);
            row += 5;
            if (this.companyForm.value.withDetails === 'true') {

                this.doc.text(5, row, "Fecha");
                this.doc.text(30, row, "Tipo");
                this.doc.text(75, row, "Comprobante");
                this.doc.text(110, row, "Vencimiento");
                this.doc.text(140, row, "Importe");
                this.doc.text(165, row, "Saldo");
                this.doc.text(190, row, "Saldo Acum.");
                row += 3;
                this.doc.setLineWidth(0.5)
                this.doc.line(0, row, 1000, row)
                row += 5
            }

            let acumulado = 0;
            for (let transaction of this.items[i].transactions) {

                if (this.companyForm.value.withDetails === 'true') {
                    this.doc.text(5, row, transaction['endDate2']);
                    if (transaction.type.labelPrint) {
                        this.doc.text(30, row, transaction.type.labelPrint);
                    } else {
                        this.doc.text(30, row, transaction.type.name);
                    }
                    let comprobante = '';
                    if (transaction.origin) {
                        comprobante += this.padString(transaction.origin, 4) + "-"
                    }
                    if (transaction.letter) {
                        comprobante += transaction.letter + "-"
                    }
                    if (transaction.number) {
                        comprobante += this.padString(transaction.number, 8)
                    }
                    this.doc.text(75, row, comprobante);
                    if (transaction.expirationDate) {
                        this.doc.text(110, row, transaction.expirationDate);
                    }
                    this.doc.textEx("$ " + this.roundNumber.transform(transaction.totalPrice).toFixed(2).toString(), 155, row, 'right', 'middle');
                    this.doc.textEx("$ " + this.roundNumber.transform(transaction.balance * Math.sign(transaction.totalPrice)).toFixed(2).toString(), 180, row, 'right', 'middle');
                    acumulado = acumulado + transaction.balance * Math.sign(transaction.totalPrice);
                    this.doc.textEx("$ " + this.roundNumber.transform(acumulado).toFixed(2).toString(), 205, row, 'right', 'middle');
                    row += 5;
                } else {
                    acumulado = acumulado + transaction.balance * Math.sign(transaction.totalPrice);
                }

                if (row > 200) {
                    page += 1;
                    this.doc.addPage();
                    this.doc.setFontSize(this.fontSizes.large)
                    this.doc.text(180, 280, "Hoja:" + page)
                    this.doc.setFontSize(this.fontSizes.normal)
                    row = 15;
                }

            }

            this.doc.setFontType("bold");
            this.doc.text(120, row, "Total");
            this.doc.textEx("$ " + this.roundNumber.transform(acumulado).toFixed(2).toString(), 180, row, 'right', 'middle');


            this.doc.setFontType("normal");
            row += 5;
            if (row > 220) {
                page += 1;
                this.doc.addPage();
                this.doc.setFontSize(this.fontSizes.large)
                this.doc.text(180, 280, "Hoja:" + page)
                this.doc.setFontSize(this.fontSizes.normal)

                row = 15;
            }
        }
        this.finishImpression();
    }

    public getMovementOfCash(): Promise<[]> {

        return new Promise<[]>((resolve, reject) => {

            this.loading = true;

            let timezone = "-03:00";
            if (Config.timezone && Config.timezone !== '') {
                timezone = Config.timezone.split('UTC')[1];
            }

            var fullQuery = []

            fullQuery.push(
                { "$lookup": { "from": "payment-methods", "foreignField": "_id", "localField": "type", "as": "type" } },
                { "$unwind": { "path": "$type" } },
                { "$lookup": { "from": "transactions", "foreignField": "_id", "localField": "transaction", "as": "transaction" } },
                { "$unwind": { "path": "$transaction" } },
                { "$lookup": { "from": "transaction-types", "foreignField": "_id", "localField": "transaction.type", "as": "transaction.type" } },
                { "$unwind": { "path": "$transaction.type" } },
                { "$lookup": { "from": "companies", "foreignField": "_id", "localField": "transaction.company", "as": "transaction.company" } },
                { "$unwind": { "path": "$transaction.company", "preserveNullAndEmptyArrays": true } },
                { $lookup: { from: "states", foreignField: "_id", localField: "transaction.company.state", as: "transaction.company.state" } },
                { $unwind: { path: "$transaction.company.state", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "employees", foreignField: "_id", localField: "transaction.company.employee", as: "transaction.company.employee" } },
                { $unwind: { path: "$transaction.company.employee", preserveNullAndEmptyArrays: true } },
                { "$lookup": { "from": "identification-types", "foreignField": "_id", "localField": "transaction.company.identificationType", "as": "transaction.company.identificationType" } },
                { "$unwind": { "path": "$transaction.company.identificationType", "preserveNullAndEmptyArrays": true } },
                { $lookup: { from: "vat-conditions", foreignField: "_id", localField: "transaction.company.vatCondition", as: "transaction.company.vatCondition" } },
                { $unwind: { path: "$transaction.company.vatCondition", preserveNullAndEmptyArrays: true } },
                {
                    "$project": {
                        "_id": 1,
                        "type.isCurrentAccount": 1,
                        "transaction._id": 1,
                        "transaction.company._id": 1,
                        "transaction.company.name": 1,
                        "transaction.company.type": 1,
                        "transaction.company.address": 1,
                        "transaction.company.city": 1,
                        "transaction.company.phones": 1,
                        "transaction.company.emails": 1,
                        "transaction.company.identificationType.name": 1,
                        "transaction.company.identificationValue": 1,
                        "transaction.company.vatCondition.description": 1,
                        "transaction.company.employee._id": 1,
                        "transaction.company.employee.name": 1,
                        "transaction.company.operationType": 1,
                        "transaction.company.state.name": 1,
                        "transaction.type.currentAccount": 1,
                        "transaction.type.movement": 1,
                        "transaction.type.labelPrint": 1,
                        "transaction.type.name": 1,
                        "transaction.state": 1,
                        "transaction.operationType": 1,
                        "transaction.number": 1,
                        "transaction.origin": 1,
                        "transaction.letter": 1,
                        "trasaction.expirationDate": 1,
                        "transaction.endDate2": { $dateToString: { date: "$transaction.endDate", format: "%d/%m/%Y", timezone: timezone } },
                        "operationType": 1,
                        "transaction.totalPrice": {
                            "$switch": {
                                "branches": [{
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                        }, {
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, false]
                                        }, {
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                        }, {
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewClient, true]
                                        }, {
                                            "$eq": [this.companyType, "Cliente"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProviderlse, false]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, false]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, false]
                                        }, {
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, false]
                                        }, {
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Si"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                        }, {
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Entrada"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", -1]
                                    }
                                }, {
                                    "case": {
                                        "$and": [{
                                            "$eq": [this.config.reports.summaryOfAccounts.invertedViewProvider, true]
                                        }, {
                                            "$eq": [this.companyType, "Proveedor"]
                                        }, {
                                            "$eq": ["$transaction.type.movement", "Salida"]
                                        }, {
                                            "$eq": ["$transaction.type.currentAccount", "Cobra"]
                                        }]
                                    },
                                    "then": {
                                        "$multiply": ["$transaction.totalPrice", 1]
                                    }
                                }],
                                "default": 0
                            }
                        }
                    }
                });

            let match = `{`;


            if (this.companyForm.value.company) {
                match += `"transaction.company._id": { "$oid" : "${this.companyForm.value.company._id}"},`
            }
            if (this.companyForm.value.employee) {
                match += `"transaction.company.employee._id": { "$oid" : "${this.companyForm.value.employee}"},`
            }

            /*if (this.startDate && this.endDate) {
    
                let timezone = "-03:00";
                if (Config.timezone && Config.timezone !== '') {
                    timezone = Config.timezone.split('UTC')[1];
                }
    
                match += `"endDate" : { "$gte": {"$date": "${this.startDate}T00:00:00${timezone}"},
                                        "$lte": {"$date": "${this.endDate}T00:00:00${timezone}"}
                                    },`
            }*/


            match += `      "$or": [{ "type.isCurrentAccount": true }, { "transaction.type.currentAccount": "Cobra" }],
                            "transaction.state": "Cerrado",
                            "transaction.company.type": "${this.companyType}",
                            "transaction.operationType": { "$ne": "D" },
                            "operationType" : { "$ne" : "D" } }`;

            match = JSON.parse(match);

            fullQuery.push({ "$match": match })

            fullQuery.push(
                {
                    "$group": {
                        "_id": { "transactions": "$transaction" },
                        "transactions": { $push: "$transaction" }
                    }
                },
                {
                    "$group": {
                        "_id": { "company": "$_id.transactions.company" },
                        "transactions": { $push: "$_id.transactions" },
                        "price": { "$sum": "$_id.transactions.totalPrice" }
                    }
                },
                {
                    "$sort": {
                        "_id.company.name": 1,
                        "transactions.endDate" : 1 
                    }
                }
            );

            this._movementOfCashService.getMovementsOfCashesV3(
                fullQuery
            ).subscribe(
                result => {
                    if (result && result.length > 0) {
                        resolve(result)
                        this.loading = false;
                    } else {
                        this.showMessage("No se encontraron transacciones", 'info', true);
                    }
                },
                error => {
                    resolve(null)
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        });


    }

    async print2() {

        this.items = await this.getMovementOfCash()

        //this.items = this.items['movementsOfCashes'];


        let page = 1;
        let row = 15;
        this.doc.setFontSize(this.fontSizes.extraLarge)
        this.doc.text(5, row, 'Resumen de cuenta de ' + this.companyType)
        row += 5;
        this.doc.setFontSize(this.fontSizes.large)
        this.doc.text(180, 280, "Hoja:" + page)
        var total = 0;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].price !== 0) {

                this.doc.setLineWidth(1)
                this.doc.line(0, row, 1000, row)
                row += 5;
                this.doc.setFontSize(this.fontSizes.large)
                this.doc.text(5, row, this.items[i]._id.company.name)
                row += 5;
                this.doc.setFontSize(this.fontSizes.normal)
                if (this.items[i]._id.company.identificationType && this.items[i]._id.company.identificationValue) {
                    this.doc.text(5, row, this.items[i]._id.company.identificationType.name + ":" + this.items[i]._id.company.identificationValue);
                }
                if (Config.country === 'AR') {
                    this.doc.text(100, row, "Condición de IVA:")
                    if (this.items[i]._id.company.vatCondition) {
                        this.doc.text(100 + 30, row, this.items[i]._id.company.vatCondition.description);
                    }
                } else {
                    this.doc.text(100, row, "Régimen Fiscal:")
                    if (this.items[i]._id.company.vatCondition) {
                        this.doc.text(100 + 30, row, +this.items[i]._id.company.vatCondition.description);
                    }
                }
                row += 5;
                this.doc.text(5, row, "Dirección:")
                if (this.items[i]._id.company.address) {
                    this.doc.text(5 + 20, row, this.items[i]._id.company.address)
                }
                this.doc.text(100, row, "Ciudad:")
                if (this.items[i]._id.company.city) {
                    this.doc.text(100 + 20, row, this.items[i]._id.company.city)
                }
                row += 5;
                this.doc.text(5, row, "Provincia:")
                if (this.items[i]._id.company.state) {
                    this.doc.text(5 + 20, row, this.items[i]._id.company.state.name)
                }
                this.doc.text(100, row, "Teléfono:")
                if (this.items[i]._id.company.phones) {
                    this.doc.text(100 + 20, row, this.items[i]._id.company.phones)
                }

                row += 5;
                this.doc.setLineWidth(0.5);
                this.doc.line(0, row, 1000, row);
                row += 5;
                if (this.companyForm.value.withDetails === 'true') {

                    this.doc.text(5, row, "Fecha");
                    this.doc.text(30, row, "Tipo");
                    this.doc.text(75, row, "Comprobante");
                    this.doc.text(110, row, "Vencimiento");
                    this.doc.text(140, row, "Importe");
                    row += 3;
                    this.doc.setLineWidth(0.5)
                    this.doc.line(0, row, 1000, row)
                    row += 5
                }

                let acumulado = 0;
                if (this.companyForm.value.withDetails === 'true') {
                    for (let transaction of this.items[i].transactions) {

                        if (this.companyForm.value.withDetails === 'true') {
                            this.doc.text(5, row, transaction['endDate2']);
                            if (transaction.type.labelPrint) {
                                this.doc.text(30, row, transaction.type.labelPrint);
                            } else {
                                this.doc.text(30, row, transaction.type.name);
                            }
                            let comprobante = '';
                            if (transaction.origin) {
                                comprobante += this.padString(transaction.origin, 4) + "-"
                            }
                            if (transaction.letter) {
                                comprobante += transaction.letter + "-"
                            }
                            if (transaction.number) {
                                comprobante += this.padString(transaction.number, 8)
                            }
                            this.doc.text(75, row, comprobante);
                            if (transaction.expirationDate) {
                                this.doc.text(110, row, transaction.expirationDate);
                            }
                        }

                        this.doc.textEx("$ " + this.roundNumber.transform(transaction.totalPrice).toFixed(2).toString(), 155, row, 'right', 'middle');
                        row += 5;

                        if (row > 200) {
                            page += 1;
                            this.doc.addPage();
                            this.doc.setFontSize(this.fontSizes.large)
                            this.doc.text(180, 280, "Hoja:" + page)
                            this.doc.setFontSize(this.fontSizes.normal)
                            row = 15;
                        }

                    }
                }

                this.doc.setFontType("bold");
                this.doc.text(120, row, "Total");
                this.doc.textEx("$ " + this.roundNumber.transform(this.items[i].price).toFixed(2).toString(), 155, row, 'right', 'middle');
                total = total + this.items[i].price

                this.doc.setFontType("normal");
                row += 5;
                if (row > 220) {
                    page += 1;
                    this.doc.addPage();
                    this.doc.setFontSize(this.fontSizes.large)
                    this.doc.text(180, 280, "Hoja:" + page)
                    this.doc.setFontSize(this.fontSizes.normal)

                    row = 15;
                }
            }
        }

        row += 8;
        this.doc.setFontSize(this.fontSizes.extraLarge)
        this.doc.text(120, row, "Total : $ " + this.roundNumber.transform(total).toFixed(2).toString());

        this.finishImpression();


    }

    public finishImpression(): void {
        this.doc.autoPrint();
        this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));
        this.doc = new jsPDF('l', 'mm', [this.pageWidth, this.pageHigh]);
    }

    public centerText(lMargin, rMargin, pdfInMM, startPdf, height, text): void {

        if (text) {
            var pageCenter = pdfInMM / 2;

            var lines = this.doc.splitTextToSize(text, (pdfInMM - lMargin - rMargin));
            var dim = this.doc.getTextDimensions(text);
            var lineHeight = dim.h;
            if (lines && lines.length > 0) {
                for (var i = 0; i < lines.length; i++) {
                    let lineTop = (lineHeight / 2) * i;
                    this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center')
                }
            }
        }
    }

    public closeModal() {
        this.activeModal.close(this.hasChanged);
    }

    public padString(n, length) {
        var n = n.toString();
        while (n.length < length)
            n = "0" + n;
        return n;
    }

    public getEmployees(): void {
        this._employeeService.getEmployees().subscribe(
            result => {
                if (result && result.employees) {
                    this.employees = result.employees;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }

        )
    }

    public getCompanies(term: string) {

        let project = {
            name: 1,
            type: 1,
            operationType: 1
        }

        let match =
            `{
            "name" : { "$regex": "${term}", "$options": "i" },
            "type" : "${this.companyType}",
            "operationType" : { "$ne": "D" }
        }`

        match = JSON.parse(match)

        return new Promise((resolve, reject) => {
            this._companyService.getCompaniesV2(
                project,
                match,
                { name: 1 },
                {},
                10
            ).subscribe(
                result => {
                    if (result.companies) {
                        resolve(result.companies)
                    } else {
                        resolve(null)
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            )
        });
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }
}
