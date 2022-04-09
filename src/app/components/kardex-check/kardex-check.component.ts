import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { of as observableOf, Observable, Subscription } from 'rxjs';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MovementOfCash } from '../movement-of-cash/movement-of-cash';
import { MovementOfCashService } from '../movement-of-cash/movement-of-cash.service';

import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

import { TransactionService } from '../transaction/transaction.service';
import { Transaction, attributes } from '../transaction/transaction';
import { ViewTransactionComponent } from '../transaction/view-transaction/view-transaction.component';
import { AddTransactionComponent } from '../transaction/add-transaction/add-transaction.component';
import { TransactionMovement, TransactionType } from '../transaction-type/transaction-type';
import { RoundNumberPipe } from '../../main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { DateFormatPipe } from 'app/main/pipes/date-format.pipe';
import { AuthService } from 'app/components/login/auth.service';


@Component({
    selector: 'app-kardex-check',
    templateUrl: './kardex-check.component.html',
    styleUrls: ['./kardex-check.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class KardexCheckComponent implements OnInit {
    public numberCheck: number;
    public check: MovementOfCash;
    public transactionMovement: TransactionMovement;
    public transactions: Transaction[] = []
    public startDate: string;
    public endDate: string;
    public timezone: string = "-03:00";
    public items: any[] = new Array();
    public itemsPerPage = 10;
    private subscription: Subscription = new Subscription();
    public stateSelect: string = "";
    public sort = { "endDate": -1 };
    public dateSelect: string;
    public filters: any[];
    public currentPage: number = 1;
    public transactionTypesSelect;
    public employeeClosingId: string;
    public totalItems: number = 0;
    public origin: string;
    public columns = attributes;
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
    public dateFormat = new DateFormatPipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
    public title: string = "Listado de Transacciones"
    loading: boolean;
    private _authService: AuthService

    constructor(
        public _movementOfCashService: MovementOfCashService,
        public _modalService: NgbModal,
        public _transactionService: TransactionService,

    ) { 
        this.transactionTypesSelect = new Array();
        this.filters = new Array();
        for (let field of this.columns) {
            if (field.defaultFilter) {
                this.filters[field.name] = field.defaultFilter;
            } else {
                this.filters[field.name] = "";
            }
        }
    }

    ngOnInit(): void {
        // this._authService.getIdentity.subscribe(
        //     async identity => {
        //         if (identity && identity.origin) {
        //             for (let index = 0; index < this.columns.length; index++) {
        //                 if (this.columns[index].name === "branchDestination") {
        //                     this.columns[index].defaultFilter = `{ "${identity.origin.branch._id}" }`;
        //                 }
        //             }
        //         }
        //     }
        // );
        // throw new Error('Method not implemented.');
    }
    
    public drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }
    public getItems(): void {
        // idTransaction
        this.loading = true;

        // FILTRAMOS LA CONSULTA
        let match = `{`;
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].visible || this.columns[i].required) {
                let value = this.filters[this.columns[i].name];
                if (value && value != "" && value !== {}) {
                    if (this.columns[i].defaultFilter) {
                        match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
                    } else {
                        if (this.columns[i].name.includes('_id')) {
                            match += `"${this.columns[i].name}": { "$oid": "${value}" }`;
                        } else {
                            if (value.includes('$')) {
                                match += `"${this.columns[i].name}": { ${value} }`;
                            } else {
                                match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
                            }
                        }
                    }
                    if (i < this.columns.length - 1) {
                        match += ',';
                    }
                }
            }
        }

        if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

        match += `}`;

        match = JSON.parse(match);

        let transactionTypes = [];


        if (this.transactionTypesSelect && this.transactionTypesSelect.length > 0) {
            this.transactionTypesSelect.forEach(element => {
                transactionTypes.push({ "$oid": element._id });
            });
            match['type._id'] = { "$in": transactionTypes }
        }

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = `{`;
        let j = 0;
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].visible || this.columns[i].required) {
                if (j > 0) {
                    project += `,`;
                }
                j++;

                if (this.columns[i].project === null) {
                    project += `"${this.columns[i].name}": 1`;
                } else {
                    project += `"${this.columns[i].name}": ${this.columns[i].project}`;
                }

            }
        }
        project += `}`;

        project = JSON.parse(project);
        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            items: { $push: "$$ROOT" }
        };

        let page = 0;
        if (this.currentPage != 0) {
            page = this.currentPage - 1;
        }
        let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
            0 // SKIP
        let limit = this.itemsPerPage;

        this.subscription.add(this._transactionService.getTransactionsV2(
            project, // PROJECT
            match, // MATCH
            this.sort, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
        ).subscribe(
            result => {
                this.loading = false;
                if (result && result[0] && result[0].items) {
                    if (this.itemsPerPage === 0) {
                        // this.itemsPerPage = 10;
                        // this.getItems();
                    } else {
                        this.items = result[0].items;
                        this.totalItems = result[0].count;
                    }
                } else {
                    this.items = new Array();
                    this.totalItems = 0;
                }
            },
            error => {
                // this.showMessage(error._body, 'danger', false);
                this.loading = false;
                this.totalItems = 0;
            }
        ));
    }

    public getColumnsVisibles(): number {
        let count: number = 0;
        for (let column of this.columns) {
            if (column.visible) {
                count++;
            }
        }
        return count;
    }

    async openModal(op: string, transaction: Transaction) {
        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = transaction._id;
                break;
            case 'edit':
                modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = transaction._id;
                modalRef.result.then((result) => {
                    if (result.transaction) {
                        this.getItems();
                    }
                }, (reason) => {

                });
                break;
        }
    }

    getCheck() {
        this.loading = true;
        let match =
            `{ 
            "number": "${this.numberCheck}",
            "operationType": { "$ne": "D"},
            "transaction.operationType": {"$ne": "D"}
        }`
        let project = {
            "number": 1,
            "transaction.company.name": 1,
            "titular": 1,
            "CUIT": 1,
            "bank.name": 1,
            "expirationDate": { "$dateToString": { "date": "$expirationDate", "format": "%d/%m/%Y", "timezone": "-03:00" } },
            "creationDate": { "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y", "timezone": "-03:00" } },
            "amountPaid": { "$toString": "$amountPaid" },
            "totalAmount": "$amountPaid",
            "operationType": 1,
            "transaction.operationType": 1,
            "transaction.branchDestination._id": 1,
            "transaction._id": 1,
            "statusCheck": 1,
            "type.inputAndOuput": 1,
            "transaction.type._id": 1,
            "transaction.type.name": 1,
            "transaction.origin": {
                "$toString": "$transaction.origin"
            },
            "transaction.letter": 1,
            "transaction.number": {
                "$toString": "$transaction.number"
            },
            // "transaction.number":1,
            "transaction.endDate": {
                "$dateToString": {
                    "date": "$transaction.endDate",
                    "format": "%d/%m/%Y",
                    "timezone": "-03:00"
                }
            },
            "transaction.updateDate": {
                "$dateToString": {
                    "date": "$transaction.updateDate",
                    "format": "%d/%m/%Y",
                    "timezone": "-03:00"
                }
            },
            "transaction.employeeClosing._id": 1,
            "transaction.updateUser._id": 1,
            "transaction.madein": 1,
            "transaction.state": 1,
            "transaction.observation": 1,
            "transaction.balance": {
                "$toString": "$transaction.balance"
            },
            "transaction.totalPrice": {
                "$toString": "$transaction.totalPrice"
            },
            "transaction.creationDate": 1,
            "transaction.type.transactionMovement": 1,
            "transaction.type.allowEdit": 1,
            "transaction.type.allowDelete": 1,
            "transaction.type.electronics": 1,
            "transaction.type.defectPrinter._id": 1,
            "transaction.type.defectPrinter.pageHigh": 1,
            "transaction.type.defectPrinter.pageWidth": 1,
            "transaction.type.readLayout": 1,
            "transaction.company.emails": 1,
            "transaction.type.expirationDate": 1,
            "transaction.endDate2": "$endDate",
            "transaction.type.defectEmailTemplate._id": 1,
            "transaction.type.defectEmailTemplate.design": 1,
            "transaction.creationUser.name": 1,
        }
        match = JSON.parse(match);

        let limit = 10
        let skip
        let sort = { "expirationDate": 1 }
        let group = {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            items: { $push: "$$ROOT" }
        };
        this._movementOfCashService.getMovementsOfCashesV2(
            project, // PROJECT
            match, // MATCH
            sort, // SORT
            group, // GROUP
            limit, // LIMIT
            skip // SKIP
        )
            .subscribe(
                res => {
                    if (res.count == 0) {
                    } else {
                        this.check = res[0].items[0]
                        this.items = res[0].items.map(r => {
                            return r.transaction
                        })
                    }
                    this.loading = false;

                },
                err => {

                }
            )
    }
    public getValue(item, column): any {
        let val: string = 'item';
        let exists: boolean = true;
        let value: any = '';
        for (let a of column.name.split('.')) {
            val += '.' + a;
            if (exists && !eval(val)) {
                exists = false;
            }
        }
        if (exists) {
            switch (column.datatype) {
                case 'number':
                    value = this.roundNumberPipe.transform(eval(val));
                    break;
                case 'currency':
                    value = this.currencyPipe.transform(this.roundNumberPipe.transform(eval(val)), 'USD', 'symbol-narrow', '1.2-2');
                    break;
                case 'percent':
                    value = this.roundNumberPipe.transform(eval(val)) + '%';
                    break;
                case 'date':
                    value = this.dateFormat.transform(eval(val), "DD/MM/YYYY")
                    break;
                default:
                    value = eval(val);
                    break;
            }
        }
        return value;
    }
}