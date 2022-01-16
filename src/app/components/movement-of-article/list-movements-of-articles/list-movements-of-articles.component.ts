import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import * as moment from 'moment';
import { Branch } from 'app/components/branch/branch';
import { BranchService } from 'app/components/branch/branch.service';
import { AuthService } from 'app/components/login/auth.service';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { Category } from 'app/components/category/category';
import { CategoryService } from 'app/components/category/category.service';

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
    @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
    public columns = attributes;
    public pathLocation: string[];
    private subscription: Subscription = new Subscription();

    //cabecera
    public startDate: string;
    public endDate: string;
    public dateSelect: string;
    public stateSelect: string = "Cerrado";

    public branches: Branch[];
    @Input() branchSelectedId: String;
    public allowChangeBranch: boolean;

    public selectedItems;
    public transactionTypes: TransactionType[];
    public transactionTypesSelect;
    public categories: Category[];
    public categoriesSelect;
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

    public dropdownSettingsCategory = {
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

    constructor(
        public _movementOfArticleService: MovementOfArticleService,
        public _branchService: BranchService,
        public _transactionTypeService: TransactionTypeService,
        public _categoryService: CategoryService,
        private _authService: AuthService,
        public _router: Router,
        public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig
    ) {

        this.transactionTypesSelect = new Array();
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

        if (Config.timezone && Config.timezone !== '') {
            this.timezone = Config.timezone.split('UTC')[1];
        }

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

        this.pathLocation = this._router.url.split('/');
        this.transactionMovement = this.pathLocation[2].charAt(0).toUpperCase() + this.pathLocation[2].slice(1);

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

        //this.getItems();
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
                        if (value.includes('$')) {
                            match += `"${this.columns[i].name}": { ${value} }`;
                        } else {
                            match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
                        }
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
                transactionTypes.push({ "$oid": element._id });
            });
            match['transaction.type._id'] = { "$in": transactionTypes }
        }

        var categories = []

        if (this.categoriesSelect) {
            this.categoriesSelect.forEach(element => {
                categories.push({ "$oid": element._id });
            });
            match['category._id'] = { "$in": categories }
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

    public getSum(): any {
        var total = 0
        this.columns.forEach(elementC => {
            if (elementC.datatype === 'number' || elementC.datatype === 'currency') {
                this.items.forEach(elementI => {
                    Object.keys(elementI).forEach(elementK => {
                        if (elementK === elementC.name) {
                            total = total + elementI[elementK];
                        }
                    });
                });
            }
            elementC['sum'] = total;
            total = 0;
        });
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


            this._categoryService.getAll({
                project: {
                    _id: 1,
                    description: 1,
                    operationType: 1,
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

    onItemSelect(item: any) {
    }

    onSelectAll(items: any) {
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
