import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MovementOfCash, attributes } from '../movement-of-cash';
import { MovementOfCashService } from '../movement-of-cash.service';
import { ViewTransactionComponent } from '../../transaction/view-transaction/view-transaction.component';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { Branch } from 'app/components/branch/branch';
import { AuthService } from 'app/components/login/auth.service';
import { BranchService } from 'app/components/branch/branch.service';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';

@Component({
    selector: 'app-list-movement-of-cash',
    templateUrl: './list-movements-of-cashes.component.html',
    styleUrls: ['./list-movements-of-cashes.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class ListMovementOfCashesComponent implements OnInit {

    @Input() transactionAmount: number;
    @Input() paymentMethod: PaymentMethod;
    public movementsOfCashes: MovementOfCash[] = new Array();
    public movementsOfCashesSelected: MovementOfCash[] = new Array();
    public areMovementOfCashesEmpty = true;
    public userType: string;
    public alertMessage = '';
    public orderTerm: string[] = ['expirationDate'];
    public propertyTerm: string;
    public areFiltersVisible = false;
    public loading = false;
    @Output() eventAddItem: EventEmitter<MovementOfCash> = new EventEmitter<MovementOfCash>();
    public itemsPerPage = 10;
    public totalItems = 0;
    public transactionMovement: string;
    public pathLocation: string[]
    public totalAmountSelected: number = 0;
    public totalAmount: number = 0;
    public title: string = "Movimiento de medios"
    public currentPage: number = 0;
    public filters: any[];
    public filterValue: string;
    private subscription: Subscription = new Subscription();
    public branches: Branch[];
    @Input() branchSelectedId: String;
    public allowChangeBranch: boolean;

    //columns
    public columns = attributes;
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
    public sort = {
        "transaction.endDate": 1
    };
    public timezone = "-03:00";
    @ViewChild(ExportExcelComponent, { static: false }) exportExcelComponent: ExportExcelComponent;
    public items: any[] = new Array();

    //cabecera
    public startDate: string;
    public endDate: string;
    public dateSelect: string;
    public stateSelect: string = "Cerrado";

    public selectedItems;
    public transactionTypes: TransactionType[];
    public transactionTypesSelect;
    public dropdownSettings = {
        "singleSelection": false,
        "defaultOpen": false,
        "idField": "_id",
        "textField": "name",
        "selectAllText": "Select All",
        "unSelectAllText": "UnSelect All",
        "enableCheckAll": true,
        "itemsShowLimit": 3,
        "allowSearchFilter": true
    }


    constructor(
        public _movementOfCashService: MovementOfCashService,
        private _authService: AuthService,
        public _transactionTypeService: TransactionTypeService,
        private _branchService: BranchService,
        public _router: Router,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
    ) {

        this.startDate = moment().format('YYYY-MM-DD');
        this.endDate = moment().format('YYYY-MM-DD');
        this.dateSelect = "endDate2";

        this.filters = new Array();
        for (let field of this.columns) {
            if (field.defaultFilter) {
                this.filters[field.name] = field.defaultFilter;
            } else {
                this.filters[field.name] = "";
            }
        }
    }

    async ngOnInit() {

        this.pathLocation = this._router.url.split('/');
        this.transactionMovement = this.pathLocation[2].charAt(0).toUpperCase() + this.pathLocation[2].slice(1);

        if (!this.branchSelectedId) {
            await this.getBranches({ operationType: { $ne: 'D' } }).then(
                branches => {
                    this.branches = branches;
                    if (this.branches && this.branches.length > 1) {
                        this.branchSelectedId = this.branches[0]._id;
                    }
                }
            );
            this._authService.getIdentity.subscribe(
                async identity => {
                    if (identity && identity.origin) {
                        this.allowChangeBranch = false;
                        this.branchSelectedId = identity.origin.branch._id;
                    } else {
                        this.allowChangeBranch = true;
                        this.branchSelectedId = null;
                    }
                }
            );
        }

        await this.getTransactionTypes().then(
            result => {
                if (result) {
                    this.transactionTypes = result
                }
            }
        )

        this.getItems();
        this.initDragHorizontalScroll();
    }

    public initDragHorizontalScroll(): void {
        const slider = document.querySelector('.table-responsive');
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e['pageX'] - slider['offsetLeft'];
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mouseup', () => {
            isDown = false;
            slider.classList.remove('active');
        });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e['pageX'] - slider['offsetLeft'];
            const walk = (x - startX) * 0.7; //scroll-fast
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    public getItems(): void {

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
                        match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
                    }
                    if (i < this.columns.length - 1) {
                        match += ',';
                    }
                }
            }
        }

        match += `"transaction.type.transactionMovement": "${this.transactionMovement}",`;
        match += `"transaction.state": "${this.stateSelect}",`;
        if (this.branchSelectedId) {
            match += `"transaction.branchDestination._id": { "$oid" : "${this.branchSelectedId}" },`;
        }
        match += `"${this.dateSelect}" : {
                        "$gte" : { "$date" : "${this.startDate}T00:00:00${this.timezone}" },
                        "$lte" : { "$date" : "${this.endDate}T23:59:59${this.timezone}" }
                    }`


        if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

        match += `}`;

        match = JSON.parse(match);

        var transactionTypes = [];
        
        if (this.transactionTypesSelect) {
            this.transactionTypesSelect.forEach(element => {
                transactionTypes.push({ "$oid" : element._id});
            });
            match['transaction.type._id'] = { "$in": transactionTypes }
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

        this.subscription.add(this._movementOfCashService.getMovementsOfCashesV2(
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
                        this.exportExcelComponent.items = result[0].items;
                        this.exportExcelComponent.export();
                        this.itemsPerPage = 10;
                        this.getItems();
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
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
                this.totalItems = 0;
            }
        ));
    }

    public exportItems(): void {
        this.itemsPerPage = 0;
        this.getItems();
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
                default:
                    value = eval(val);
                    break;
            }
        }
        return value;
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

    public drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }

    public pageChange(page): void {
        this.currentPage = page;
        this.getItems();
    }

    public calculateTotal(): void {
        this.totalAmount = 0;
        for (let movementofCash of this.movementsOfCashes) {
            this.totalAmount = this.totalAmount + parseFloat(movementofCash.amountPaid.toString());
        }
    }

    public orderBy(term: string): void {

        if (this.sort[term]) {
            this.sort[term] *= -1;
        } else {
            this.sort = JSON.parse('{"' + term + '": 1 }');
        }

        this.getItems();
    }

    public refresh(): void {
        this.getItems();
    }

    public getBranches(match: {} = {}): Promise<Branch[]> {

        return new Promise<Branch[]>((resolve, reject) => {

            this._branchService.getBranches(
                {}, // PROJECT
                match, // MATCH
                { number: 1 }, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(
                result => {
                    if (result && result.branches) {
                        resolve(result.branches);
                    } else {
                        resolve(null);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public getTransactionTypes(): Promise<TransactionType[]> {

        return new Promise<TransactionType[]>((resolve, reject) => {

            this._transactionTypeService.getAll({
                project: {
                    _id: 1,
                    transactionMovement: 1,
                    operationType: 1,
                    name: 1,
                },
                match: {
                    transactionMovement: this.transactionMovement,
                    operationType: { "$ne": "D" }
                }
            }).subscribe(
                result => {
                    if (result) {
                        resolve(result.result);
                    } else {
                        resolve(null);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public openModal(op: string, movementOfCash: MovementOfCash): void {

        let modalRef;

        switch (op) {
            case 'view':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = movementOfCash.transaction._id;
                modalRef.componentInstance.readonly = true;
                break;
            default: ;
        }
    };

    public addItem(movementOfCashSelected) {
        this.eventAddItem.emit(movementOfCashSelected);
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onItemSelect(item: any) {
    }
    onSelectAll(items: any) {
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
