import { Component, OnInit, Input, ViewEncapsulation, ViewChild, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
registerLocaleData(localeEsAr, 'es-Ar');

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { ArticleService } from '../article/article.service';
import { Config } from 'app/app.config';
import { Branch } from 'app/components/branch/branch';
import { BranchService } from 'app/components/branch/branch.service';
import { AuthService } from 'app/components/login/auth.service';
import { AddArticleComponent } from '../article/article/add-article.component';
import { TransactionMovement, Movements, TransactionType } from 'app/components/transaction-type/transaction-type';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionTypeService } from '../transaction-type/transaction-type.service';
import { MovementOfArticleService } from '../movement-of-article/movement-of-article.service';
import { Category } from '../category/category';
import { CategoryService } from '../category/category.service';

@Component({
    selector: 'app-report-best-selling-article',
    templateUrl: './report-best-selling-article.component.html',
    styleUrls: ['./report-best-selling-article.component.scss'],
    providers: [NgbAlertConfig, { provide: LOCALE_ID, useValue: 'es-Ar' }],
    encapsulation: ViewEncapsulation.None
})

export class ReportBestSellingArticleComponent implements OnInit {

    public items: any[] = new Array();
    public areArticlesEmpty: boolean = true;
    public alertMessage: string = '';
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    @Input() startDate: string;
    @Input() startTime: string;
    @Input() endDate: string;
    @Input() endTime: string;
    @Input() limit: number = 0;
    public listType: string = 'statistics';
    public itemsPerPage: string = "5";
    public currentPage: number = 1;
    public sort = { "count": -1 };
    public transactionMovement: string;
    public totalAmount;
    public totalItem;
    public filters: any[];
    public branches: Branch[];
    @Input() branchSelectedId: String;
    public allowChangeBranch: boolean;
    public scrollY: number = 0;
    public title: string;
    private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
    @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
    private subscription: Subscription = new Subscription();


    public selectedItems;
    public transactionTypes: TransactionType[];
    public transactionTypesSelect;
    public dropdownSettingsTransactionType = {
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

    public categories: Category[];
    public categoriesSelect;
    public dropdownSettingsCategories = {
        "singleSelection": false,
        "defaultOpen": false,
        "idField": "_id",
        "textField": "description",
        "selectAllText": "Select All",
        "unSelectAllText": "UnSelect All",
        "enableCheckAll": true,
        "itemsShowLimit": 3,
        "allowSearchFilter": true
    }

    public columns = [
        {
            name: 'article.category.description',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            align: 'left'
        },
        {
            name: 'article.make.description',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            align: 'left'
        },
        {
            name: 'article.code',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            align: 'left'
        },
        {
            name: 'article.description',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            align: 'left'
        },
        {
            name: 'article.posDescription',
            visible: false,
            disabled: false,
            filter: true,
            datatype: 'string',
            align: 'left'
        },
        {
            name: 'article.quantityPerMeasure',
            visible: true,
            disabled: false,
            filter: false,
            datatype: 'number',
            align: 'right'
        },
        {
            name: 'article.unitOfMeasurement.abbreviation',
            visible: true,
            disabled: false,
            filter: true,
            datatype: 'string',
            align: 'center'
        },
        {
            name: 'article.taxes[0].percentage',
            visible: false,
            disabled: false,
            filter: true,
            datatype: 'number',
            align: 'left'
        },
        {
            name: 'article.costPrice',
            visible: false,
            disabled: false,
            filter: true,
            datatype: 'currency',
            align: 'left'
        },
        {
            name: 'article.markupPercentage',
            visible: false,
            disabled: false,
            filter: true,
            datatype: 'percent',
            align: 'left'
        },
        {
            name: 'article.markupPrice',
            visible: false,
            disabled: false,
            filter: true,
            datatype: 'currency',
            align: 'left'
        },
        {
            name: 'article.salePrice',
            visible: false,
            disabled: false,
            filter: true,
            datatype: 'currency',
            align: 'left'
        },
        {
            name: 'count',
            visible: true,
            disabled: false,
            filter: false,
            datatype: 'number',
            align: 'right'
        },
        {
            name: 'total',
            visible: true,
            disabled: false,
            filter: false,
            datatype: 'currency',
            align: 'right'
        }
    ];

    constructor(
        public _articleService: ArticleService,
        public _movementOfArticleService: MovementOfArticleService,
        public _router: Router,
        public _modalService: NgbModal,
        public _transactionTypeService: TransactionTypeService,
        public _categoriesService : CategoryService,
        public alertConfig: NgbAlertConfig,
        private _branchService: BranchService,
        private _authService: AuthService
    ) {
        this.startDate = moment().format('YYYY-MM-DD');
        this.startTime = moment('00:00', 'HH:mm').format('HH:mm');
        this.endDate = moment().format('YYYY-MM-DD');
        this.endTime = moment('23:59', 'HH:mm').format('HH:mm');
        this.totalAmount = 0;
        this.totalItem = 0;
        this.filters = new Array();
        for (let field of this.columns) {
            this.filters[field.name] = "";
        }
    }

    async ngOnInit() {

        let pathLocation: string[] = this._router.url.split('/');
        this.transactionMovement = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
        this.listType = pathLocation[3];

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

        await this.getCategories().then(
            result => {
                if (result) {
                    this.categories = result
                }
            }
        )


        this.getItems();
    }

    public drop(event: CdkDragDrop<string[]>): void {
        moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
    }

    async openModal(op: string, item: any[]) {

        this.scrollY = window.scrollY;

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.articleId = item['article']._id;
                modalRef.componentInstance.readonly = true;
                modalRef.componentInstance.operation = "view";
                modalRef.result.then((result) => {
                    window.scroll(0, this.scrollY);
                }, (reason) => {
                    window.scroll(0, this.scrollY);
                });
                break;
            default: ;
        }
    };

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

    public exportItems(): void {
        this.exportExcelComponent.items = this.items;
        this.exportExcelComponent.export();
    }

    public getItems(): void {

        let timezone = "-03:00";
        if (Config.timezone && Config.timezone !== '') {
            timezone = Config.timezone.split('UTC')[1];
        }


        this.loading = true;


        let movement;
        if (this.transactionMovement === TransactionMovement.Sale.toString()) {
            movement = Movements.Inflows.toString();
            this.title = 'Productos más vendidos';
        } else if (this.transactionMovement === TransactionMovement.Purchase.toString()) {
            movement = Movements.Inflows.toString();
            this.title = 'Productos más comprados'
        }
        let fullquery = [];

        fullquery.push({
            $lookup:
            {
                from: "articles",
                localField: "article",
                foreignField: "_id",
                as: "article"
            }
        });
        fullquery.push({
            $unwind: {
                path: "$article"
            }
        });
        fullquery.push({
            $lookup:
            {
                from: "categories",
                localField: "article.category",
                foreignField: "_id",
                as: "article.category"
            }
        });
        fullquery.push({
            $unwind: {
                path: "$article.category",
                preserveNullAndEmptyArrays: true
            }
        });
        fullquery.push({
            $lookup:
            {
                from: "makes",
                localField: "article.make",
                foreignField: "_id",
                as: "article.make"
            }
        });
        fullquery.push({
            $unwind: {
                path: "$article.make",
                preserveNullAndEmptyArrays: true
            }
        });
        fullquery.push({
            $lookup:
            {
                from: "unit-of-measurements",
                localField: "article.unitOfMeasurement",
                foreignField: "_id",
                as: "article.unitOfMeasurement"
            }
        });
        fullquery.push({
            $unwind: {
                path: "$article.unitOfMeasurement",
                preserveNullAndEmptyArrays: true
            }
        });
        fullquery.push({
            $lookup:
            {
                from: "transactions",
                localField: "transaction",
                foreignField: "_id",
                as: "transaction"
            }
        });
        fullquery.push({
            $unwind: "$transaction"
        });

        fullquery.push({
            $lookup:
            {
                from: "branches",
                localField: "transaction.branchDestination",
                foreignField: "_id",
                as: "transaction.branchDestination"
            }
        });
        fullquery.push({
            $unwind: "$transaction.branchDestination"
        });

        fullquery.push({
            $lookup: {
                from: "transaction-types",
                localField: "transaction.type",
                foreignField: "_id",
                as: "transaction.type"
            }
        },
            { $unwind: { path: "$transaction.type", preserveNullAndEmptyArrays: true } })

        let project = {
            "transaction.type.stockMovement": 1,
            "transaction.type._id": 1,
            "transaction.type.transactionMovement": 1,
            "transaction.type.movement": 1,
            "article.category.description": 1,
            "article.make.description": 1,
            "article.code": 1,
            "article.description": 1,
            "article.posDescription": 1,
            "article.quantityPerMeasure": 1,
            "article.unitOfMeasurement.abbreviation": 1,
            "article.taxes[0].percentage": 1,
            "article.costPrice": 1,
            "article.markupPercentage": 1,
            "article.markupPrice": 1,
            "article.salePrice": 1,
            "article.operationType": 1,
            "article.category._id" : 1,
            "transaction.operationType": 1,
            "operationType": 1,
            "transaction.endDate": 1,
            "transaction.state": 1,
            "transaction.branchDestination" : 1,
            records: { $sum: 1 },
            amount: {
                $cond: {
                    if: {
                        $or: [
                            {
                                $and: [
                                    { $eq: ["$transaction.type.stockMovement", "Salida"] },
                                    { $eq: ["$transaction.type.transactionMovement", "Venta"] }
                                ]
                            },
                            {
                                $and: [
                                    { $eq: ["$transaction.type.stockMovement", "Entrada"] },
                                    { $eq: ["$transaction.type.transactionMovement", "Compra"] }
                                ]
                            }
                        ]
                    },
                    then: { $multiply: ["$amount", "$article.quantityPerMeasure"] },
                    else: { $multiply: ["$amount", -1, "$article.quantityPerMeasure"] }
                }
            },
            salePrice: {
                $cond: {
                    if: {
                        $or: [
                            {
                                $and: [
                                    { $eq: ["$transaction.type.stockMovement", "Salida"] },
                                    { $eq: ["$transaction.type.transactionMovement", "Venta"] }
                                ]
                            },
                            {
                                $and: [
                                    { $eq: ["$transaction.type.stockMovement", "Entrada"] },
                                    { $eq: ["$transaction.type.transactionMovement", "Compra"] }
                                ]
                            }
                        ]
                    },
                    then: { $multiply: ["$salePrice", 1] },
                    else: { $multiply: ["$salePrice", -1] }
                }
            }
        }




        let match = {
            "transaction.endDate": {
                "$gte": { "$date": this.startDate + "T00:00:00" + timezone },
                "$lte": { "$date": this.endDate + "T23:59:59" + timezone }
            },
            "transaction.state": "Cerrado",
            "transaction.operationType": { "$ne": "D" },
            "operationType": { "$ne": "D" },
            "transaction.type.transactionMovement": this.transactionMovement,
            "article.operationType": { "$ne": "D" }
        }

        if(this.branchSelectedId){
            match["transaction.branchDestination._id"] = { "$oid" : this.branchSelectedId }
        }

        for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i].visible) {
                let value = this.filters[this.columns[i].name];
                if (value && value != "") {
                    match[this.columns[i].name] = { "$regex": value, "$options": "i" };
                    /*if (i < this.columns.length - 1) {
                        match += ',';
                    }*/
                }
            }
        }


        var transactionTypes = [];

        if (this.transactionTypesSelect) {
            this.transactionTypesSelect.forEach(element => {
                transactionTypes.push({ "$oid": element._id });
            });
            match['transaction.type._id'] = { "$in": transactionTypes }
        }

        var categories = [];

        if (this.categoriesSelect) {
            this.categoriesSelect.forEach(element => {
                categories.push({ "$oid": element._id });
            });
            match['article.category._id'] = { "$in": categories }
        }

        let group = {
            _id: "$article",
            count: { $sum: "$amount" },
            total: { $sum: "$salePrice" }
        }

        fullquery.push(
            { $project: project },
            { $match: match },
            { $group: group },
            {
                $project: {
                    article: "$_id",
                    count: 1,
                    total: 1
                }
            },
            { $sort: this.sort }
        )

        if (this.limit && this.limit > 0) {
            fullquery.push({ $limit: this.limit })
        }

        this.subscription.add(this._movementOfArticleService.getFullQuery(fullquery).subscribe(
            result => {

                if (result && result.status == 200) {
                    this.hideMessage();
                    this.loading = false;
                    this.items = result.result;
                    this.areArticlesEmpty = false;
                    this.calculateTotal();
                } else {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                    this.items = new Array();
                    this.areArticlesEmpty = true;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
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

    public calculateTotal(): void {

        this.totalItem = 0;
        this.totalAmount = 0;

        for (let index = 0; index < this.items.length; index++) {
            this.totalItem = this.totalItem + this.items[index]['count'];
            this.totalAmount = this.totalAmount + this.items[index]['total'];

        }
    }

    public getTransactionTypes(): Promise<TransactionType[]> {

        return new Promise<TransactionType[]>((resolve, reject) => {

            let match = {}

            match = {
                requestArticles: true,
                transactionMovement: this.transactionMovement,
                operationType: { "$ne": "D" }
            }

            this._transactionTypeService.getAll({
                project: {
                    _id: 1,
                    transactionMovement: 1,
                    requestArticles: 1,
                    operationType: 1,
                    name: 1,
                    branch: 1,
                },
                match: match
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

    public getCategories(): Promise<Category[]> {

        return new Promise<Category[]>((resolve, reject) => {

            let match = {}

            match = {
                operationType: { "$ne": "D" }
            }

            this._categoriesService.getAll({
                project: {
                    _id: 1,
                    operationType: 1,
                    description: 1,
                },
                match: match
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
