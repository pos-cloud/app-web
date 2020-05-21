import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, Input, ViewChild, ɵConsole } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MovementOfCash } from '../movement-of-cash';
import { MovementOfCashService } from '../movement-of-cash.service';
import { ViewTransactionComponent } from '../../transaction/view-transaction/view-transaction.component';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { Subscription } from 'rxjs';
import { EditCheckComponent } from '../edit-check/edit-check.component';

@Component({
    selector: 'app-list-checks',
    templateUrl: './list-checks.component.html',
    styleUrls: ['./list-checks.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ListChecksComponent implements OnInit {

    @Input() transactionAmount: number;
    @Input() paymentMethod: PaymentMethod;
    public movementsOfCashes: MovementOfCash[] = new Array();
    public movementsOfCashesSelected: MovementOfCash[] = new Array();
    public areMovementOfCashesEmpty = true;
    public userType: string;
    public alertMessage = '';
    public propertyTerm: string;
    public areFiltersVisible = false;
    public loading = false;
    @Output() eventAddItem: EventEmitter<MovementOfCash> = new EventEmitter<MovementOfCash>();
    public itemsPerPage = 10;
    public totalItems = 0;
    public transactionMovement: string;
    public pathLocation: string[]
    public totalAmount: number = 0;
    public title: string = "Cartera de cheques"
    public currentPage: number = 0;
    public filters: any[];
    public filterValue: string;
    private subscription: Subscription = new Subscription();

    public columns = [
        {
            name: 'number',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'deliveredBy',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'receiver',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'titular',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'CUIT',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'bank.name',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'expirationDate',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'date',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'amountPaid',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'currency',
            project: null,
            align: 'right',
            required: false,
        },
        {
            name: 'totalAmount',
            visible: false,
            disabled: true,
            filter: false,
            datatype: 'currency',
            project: '"$amountPaid"',
            align: 'right',
            required: true,
        },
        {
            name: 'transaction.type.name',
            visible: false,
            disabled: false,
            filter: true,
            datatype: 'string',
            project: null,
            align: 'left',
            required: false,
        },
        {
            name: 'operationType',
            visible: false,
            disabled: true,
            filter: false,
            datatype: 'string',
            defaultFilter: `{ "$ne": "D" }`,
            project: null,
            align: 'left',
            required: true,
        },
        {
            name: 'transaction.operationType',
            visible: false,
            disabled: true,
            filter: true,
            defaultFilter: `{ "$ne": "D" }`,
            datatype: 'string',
            project: null,
            align: 'left',
            required: true,
        },
        {
            name: 'transaction._id',
            visible: false,
            disabled: true,
            filter: true,
            defaultFilter: null,
            datatype: 'string',
            project: null,
            align: 'left',
            required: true,
        },
        {
            name: 'statusCheck',
            visible: false,
            disabled: true,
            filter: true,
            defaultFilter: null,
            datatype: 'string',
            project: null,
            align: 'left',
            required: true,
        },
        {
            name: 'type.inputAndOuput',
            visible: false,
            disabled: true,
            filter: true,
            defaultFilter: null,
            datatype: 'string',
            project: null,
            align: 'left',
            required: true,
        },
    ];
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
    public sort = { "expirationDate": 1 };
    public timezone = "-03:00";
    @ViewChild(ExportExcelComponent, { static: false }) exportExcelComponent: ExportExcelComponent;
    public items: any[] = new Array();

    constructor(
        public _movementOfCashService: MovementOfCashService,
        public _router: Router,
        public _modalService: NgbModal,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
    ) {
        this.filters = new Array();
        for (let field of this.columns) {
            if (field.defaultFilter) {
                this.filters[field.name] = field.defaultFilter;
            } else {
                this.filters[field.name] = "";
            }
        }
    }

    public ngOnInit(): void {
        this.pathLocation = this._router.url.split('/');
        this.transactionMovement = this.pathLocation[2].charAt(0).toUpperCase() + this.pathLocation[2].slice(1);
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

        match += `"statusCheck": "Disponible","type.inputAndOuput" : true`;
        if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

        match += `}`;

        match = JSON.parse(match);

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = `{`;
        let j = 0;
        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].visible || this.columns[i].required) {
                if (j > 0) {
                    project += `,`;
                }
                j++;
                if (!this.columns[i].project) {
                    if (this.columns[i].datatype !== "string") {
                        if (this.columns[i].datatype === "date") {
                            project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`
                        } else {
                            project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`
                        }
                    } else {
                        project += `"${this.columns[i].name}": 1`;
                    }
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
            totalAmount: { $sum: '$totalAmount' },
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
                        this.totalAmount = result[0].totalAmount;
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

    public openModal(op: string, movementOfCash: MovementOfCash): void {

        let modalRef;

        switch (op) {
            case 'view':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = movementOfCash.transaction._id;
                modalRef.componentInstance.readonly = true;
                break;
            case 'edit':
                modalRef = this._modalService.open(EditCheckComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.movementOfCashId = movementOfCash._id;
                modalRef.componentInstance.readonly = true;
                modalRef.result.then((result) => {
                    this.getItems();
                }, (reason) => {
                    this.getItems();
                });
            default: ;
        }
    };

    public addItem(movementOfCashSelected) {
        this.eventAddItem.emit(movementOfCashSelected);
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
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
