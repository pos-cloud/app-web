import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Category } from '../category';
import { CategoryService } from '../category.service';

import { Config } from '../../../app.config';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';

@Component({
    selector: 'app-list-categories-pos',
    templateUrl: './list-categories-pos.component.html',
    styleUrls: ['./list-categories-pos.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class ListCategoriesPosComponent implements OnInit {

    @Output() eventAddItem: EventEmitter<Category> = new EventEmitter<Category>();
    @Output() eventSelectCategory: EventEmitter<Category> = new EventEmitter<Category>();
    @Input() areCategoriesVisible: boolean = true;
    @Input() transactionMovement: TransactionMovement;
    @Input() loading: boolean = false;
    categories: Category[] = new Array();
    areCategoriesEmpty: boolean = true;
    alertMessage: string = '';
    userType: string;
    orderTerm: string[] = ['order'];
    propertyTerm: string;
    areFiltersVisible: boolean = false;
    apiURL = Config.apiURL;
    itemsPerPage = 10;
    totalItems = 0;
    database: string;
    
    constructor(
        public _categoryService: CategoryService,
        public _router: Router,
        public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig
    ) {
     }

    ngOnInit(): void {
        this.categories = new Array()
        this.database = Config.database;
        this.getCategories();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.transactionMovement.currentValue) {
            this.getCategories();
        }
    }

    public getBadge(term: string): boolean {

        return true;
    }

    public getCategories(): void {

        this.loading = true;

        let query = 'sort="order":-1';

        if (this.transactionMovement === TransactionMovement.Sale) {
            query += `&where="visibleOnSale":true,"parent":null`;
        } else if (this.transactionMovement === TransactionMovement.Purchase) {
            query += `&where="visibleOnPurchase":true,"parent":null`;
        }

        this._categoryService.getCategories(query).subscribe(
            result => {
                if (!result.categories) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                    this.categories = new Array();
                    this.areCategoriesEmpty = true;
                } else {
                    this.hideMessage();

                    this.loading = false;
                    this.categories = result.categories;
                    this.totalItems = this.categories.length;
                    this.areCategoriesEmpty = false;

                    
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public orderBy(term: string, property?: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = "-" + term;
        } else {
            this.orderTerm[0] = term;
        } 
        this.propertyTerm = property;
    }


    public addItem(categorySelected) {
        this.eventAddItem.emit(categorySelected);
    }

    public selectCategory(categorySelected) {
        this.getCategoriesChild(categorySelected['_id']).then(
            categories => {
                if (categories.length === 0) {
                    this.eventSelectCategory.emit(categorySelected);
                } else {
                    this.hideMessage();
                    this.loading = false;
                    this.categories = categories;
                    this.totalItems = categories.length;
                    this.areCategoriesEmpty = false;
                }
            }
        )
    }

    getCategoriesChild(categoryId: string): Promise<Category[]> {

        return new Promise<Category[]>((resolve, reject) => {

            let project = {
                "_id": 1,
                "visibleOnSale": 1,
                "visibleOnPurchase": 1,
                "operationType": 1,
                "description": 1,
                "picture": 1,
                "parent": 1,
                "order": 1
            }

            let match = `{`;

            if (this.transactionMovement === TransactionMovement.Sale) {
                match += `"visibleOnSale":true,"parent": { "$oid" : "${categoryId}"},`;
            } else if (this.transactionMovement === TransactionMovement.Purchase) {
                match += `"visibleOnPurchase":true,"parent": { "$oid" : "${categoryId}"},`;
            } else {
                match += `"parent": { "$oid" : "${categoryId}"},`;
            }

            match += `"operationType": { "$ne" : "D"} }`

            match = JSON.parse(match);

            let sort = {
                order: -1
            }

            this._categoryService.getCategoriesV2(project, match, sort, {}, 0).subscribe(
                result => {
                    if (!result.categories) {
                        resolve(null);
                    } else {
                        resolve(result.categories);
                    }
                },
                error => {
                    resolve(null);
                }
            );

        });
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
