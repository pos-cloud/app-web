import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { ArticleStock, attributes } from '../article-stock';
import { ArticleStockService } from '../article-stock.service';

import { UpdateArticleStockComponent } from '../update-article-stock/update-article-stock.component';

import { PrinterService } from '../../printer/printer.service';
import { PrinterPrintIn, Printer } from '../../printer/printer';
import { PrintArticlesStockComponent } from '../../print/print-articles-stock/print-articles-stock.component';
import { PrintTransactionTypeComponent } from '../../print/print-transaction-type/print-transaction-type.component';
import { User } from 'app/components/user/user';
import { UserService } from 'app/components/user/user.service';
import { PriceListService } from 'app/components/price-list/price-list.service';
import { PriceList } from 'app/components/price-list/price-list';
import { ListPriceListsComponent } from '../../price-list/list-price-lists/list-price-lists.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Config } from '../../../app.config';
import { ConfigService } from 'app/components/config/config.service';
import { AddArticleStockComponent } from '../article-stock/add-article-stock.component';

@Component({
    selector: 'app-list-article-stocks',
    templateUrl: './list-article-stocks.component.html',
    styleUrls: ['./list-article-stocks.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class ListArticleStocksComponent implements OnInit {

    // TABLA
    public listTitle: string;
    public orderTerm: string[] = ["-realStock"];
    public totalItems: number = 0;
    public items: any[] = new Array();
    public itemsPerPage = 10;
    public currentPage: number = 1;
    public sort = { "realStock": -1 };
    public columns = attributes;
    @ViewChild(ExportExcelComponent, { static: false }) exportExcelComponent: ExportExcelComponent;
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
    public title = "Inventario";
    public articleStocks: ArticleStock[] = new Array();
    public priceLists: PriceList[] = new Array();
    public priceListId: string;
    public alertMessage: string = '';
    public userType: string;
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    @Output() eventAddItem: EventEmitter<ArticleStock> = new EventEmitter<ArticleStock>();
    private subscription: Subscription = new Subscription();
    public printers: Printer[];
    public database: string;

    public totalRealStock = 0;
    public totalCost = 0;
    public totalTotal = 0;

    public filters: any[];
    public filterValue: string;

    constructor(
        private _articleStockService: ArticleStockService,
        private _priceList: PriceListService,
        private _router: Router,
        public _modalService: NgbModal,
        public _userService: UserService,
        public alertConfig: NgbAlertConfig,
        private _toastr: ToastrService,
        private _configService: ConfigService,
        private _printerService: PrinterService
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

    ngOnInit(): void {

        this.database = Config.database;


        this.getPriceList()
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.getItems();
    }

    public refresh(): void {
        this.getItems();
    }

    public drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
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
                if (this.columns[i].project) {
                    project += `"${this.columns[i].name}" : ${this.columns[i].project} `
                } else {
                    if (this.columns[i].datatype !== "string") {
                        project += `"${this.columns[i].name}": { "$toString" : "$${this.columns[i].name}" }`
                    } else {
                        project += `"${this.columns[i].name}": 1`;
                    }
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

        this.subscription.add(this._articleStockService.getArticleStocksV2(
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
                        this.getSum();
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

    public getSum(): any {
        var total = 0
        this.columns.forEach(elementC => {
            if(elementC.datatype === 'number' || elementC.datatype === 'currency'){
                this.items.forEach(elementI => {
                    Object.keys(elementI).forEach(elementK => {
                        if(elementK === elementC.name){
                            total = total + elementI[elementK];
                        }
                    });
                });
            }
            elementC['sum']= total;
            total = 0;
        });
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

    async openModal(op: string, articleStock: ArticleStock) {
        let modalRef;
        switch (op) {
            case 'view':
                this._router.navigate(['/report/kardex-de-productos/'], { queryParams: { article: articleStock.article._id, branch: articleStock.branch._id, deposit: articleStock.deposit._id } });
                break;
            case 'add':
                modalRef = this._modalService.open(AddArticleStockComponent, { size: 'lg', backdrop: 'static' }).result.then((result) => {
                    this.getItems();
                }, (reason) => {
                    this.getItems();
                });
                break;
            case 'update':
                modalRef = this._modalService.open(UpdateArticleStockComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.articleStock = articleStock;
                modalRef.componentInstance.readonly = false;
                modalRef.result.then((result) => {
                    if (result === 'save_close') {
                        this.getItems();
                    }
                }, (reason) => {

                });
                break;
            case 'print-label':

                let identity: User = JSON.parse(sessionStorage.getItem('user'));
                let printer: Printer;
                if (identity) {
                    this._userService.getUser(identity._id).subscribe(
                        async result => {
                            if (result && result.user && result.user.printers && result.user.printers.length > 0) {
                                for (const element of result.user.printers) {
                                    if (element && element.printer && element.printer.printIn === PrinterPrintIn.Label) {
                                        printer = element.printer;
                                    }
                                }
                            } else {
                                await this.getPrinters().then(
                                    printers => {
                                        if (printers && printers.length > 0) {
                                            for (let printerAux of printers) {
                                                if (printerAux.printIn === PrinterPrintIn.Label) {
                                                    printer = printerAux;
                                                }
                                            }
                                        }
                                    });
                            }
                            if (printer) {
                                if (printer.fields && printer.fields.length > 0) {
                                    modalRef = this._modalService.open(PrintTransactionTypeComponent)
                                    modalRef.componentInstance.articleId = articleStock.article._id;
                                    modalRef.componentInstance.quantity = articleStock.realStock;
                                    modalRef.componentInstance.printer = printer;
                                    if (this.priceListId) {
                                        modalRef.componentInstance.priceListId = this.priceListId;
                                    }
                                } else {
                                    this.showMessage("Crear una diseño en la impresora de tipo etiqueta", 'danger', false);
                                }
                            } else {
                                this.showMessage("Debe crear una impresora de tipo etiqueta", 'danger', false);
                            }
                        },
                        error => {
                            this.showMessage(error._body, "danger", false);
                        }
                    )
                } else {
                    this.showMessage("Debe iniciar sesión", 'danger', false);
                }

                break;
            case 'price-lists':
                modalRef = this._modalService.open(ListPriceListsComponent, { size: 'lg', backdrop: 'static' });
                modalRef.result.then((result) => {
                    if (result && result.priceList) {
                        this.priceListId = result.priceList
                        this.openModal('print-label', articleStock)
                    } else {
                        this.openModal('print-label', articleStock)
                    }
                }, (reason) => {
                    this.getItems();
                });
                break;
            case 'print-inventario':
                modalRef = this._modalService.open(PrintArticlesStockComponent);
                modalRef.componentInstance.branch = this.filters['branch.number'];
                modalRef.componentInstance.deposit = this.filters['deposit.name'];
                modalRef.componentInstance.make = this.filters['article.make.description'];
                modalRef.componentInstance.category = this.filters['article.category.description'];
                modalRef.componentInstance.code = this.filters['article.code'];
                modalRef.componentInstance.barcode = this.filters['article.barcode'];
                modalRef.componentInstance.description = this.filters['article.description'];
                break;
            case 'updateArticle':
                this.loading = true;
                this._articleStockService.updateArticle().subscribe(
                    result => {
                        if (result && result.message) {
                            this.showToast(result.message, 'success')
                            this.loading = false
                        }
                    },
                    error => {
                        this.showToast(error._body, 'danger');
                        this.loading = false;
                        this.totalItems = 0;
                    }
                )
            default:
                break;
        }
    }

    public addItem(articleStockSelected) {
        this.eventAddItem.emit(articleStockSelected);
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

    public getPrinters(): Promise<Printer[]> {

        return new Promise<Printer[]>(async (resolve, reject) => {

            this.loading = true;

            this._printerService.getPrinters().subscribe(
                result => {
                    this.loading = false;
                    if (!result.printers) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.printers);
                    }
                },
                error => {
                    this.loading = false;
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public getPriceList(): void {
        this._priceList.getPriceLists().subscribe(
            result => {
                if (result && result.priceLists) {
                    this.priceLists = result.priceLists;
                } else {
                    this.priceLists = new Array();
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
            }
        )
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

    public showToast(message: string, type: string = 'success'): void {
        switch (type) {
            case 'success':
                this._toastr.success('', message);
                break;
            case 'info':
                this._toastr.info('', message);
                break;
            case 'warning':
                this._toastr.warning('', message);
                break;
            case 'danger':
                this._toastr.error('', message);
                break;
            default:
                this._toastr.success('', message);
                break;
        }
    }
}
