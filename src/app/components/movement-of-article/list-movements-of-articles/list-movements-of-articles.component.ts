import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import 'moment/locale/es';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Config } from 'app/app.config';
import { MovementOfArticleService } from 'app/components/movement-of-article/movement-of-article.service';
import { attributes, MovementOfArticle } from 'app/components/movement-of-article/movement-of-article'
import { ViewTransactionComponent } from '../../transaction/view-transaction/view-transaction.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-list-movements-of-articles',
    templateUrl: './list-movements-of-articles.component.html',
    styleUrls: ['./list-movements-of-articles.component.scss'],
    encapsulation: ViewEncapsulation.None

})
export class ListMovementsOfArticlesComponent implements OnInit {

    public totalItems: number = 0;
    public title: string = "Movimiento de Productos"
    public items: any[] = new Array();
    public alertMessage: string = '';
    public loading: boolean = false;
    public itemsPerPage = 10;
    public currentPage: number = 1;
    public sort = { "transaction.endDate": -1 };
    public transactionMovement: string;
    public filters: any[];
    public scrollY: number = 0;
    public timezone: string = "-03:00";
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
    @ViewChild(ExportExcelComponent, { static: false }) exportExcelComponent: ExportExcelComponent;
    public columns = attributes;
    public pathLocation: string[];
    private subscription: Subscription = new Subscription();

    constructor(
        public _movementOfArticleService: MovementOfArticleService,
        public _router: Router,
        public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig
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

    async ngOnInit() {

        if (Config.timezone && Config.timezone !== '') {
            this.timezone = Config.timezone.split('UTC')[1];
        }

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

    public drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }

    async openModal(op: string, movementOfArticle: MovementOfArticle) {

        this.scrollY = window.scrollY;

        let modalRef;
        switch (op) {
            case 'transaction':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = movementOfArticle.transaction._id;
                modalRef.componentInstance.readonly = true;
                break;
            default: ;
        }
    };

    public pageChange(page): void {
        this.currentPage = page;
        this.getItems();
    }

    public exportItems(): void {
        this.itemsPerPage = 0;
        this.getItems();
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

        match += `"transaction.type.transactionMovement": "${this.transactionMovement}"`;
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
                if (this.columns[i].datatype !== "string") {
                    if (this.columns[i].datatype === "date") {
                        project += `"${this.columns[i].name}": { "$dateToString": { "date": "$${this.columns[i].name}", "format": "%d/%m/%Y", "timezone": "${this.timezone}" }}`
                    } else {
                        project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`
                    }
                } else {
                    project += `"${this.columns[i].name}": 1`;
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

        this.subscription.add(this._movementOfArticleService.getMovementsOfArticlesV2(
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
