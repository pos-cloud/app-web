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

	public categories: Category[] = new Array();
	public areCategoriesEmpty: boolean = true;
	public alertMessage: string = '';
	public userType: string;
	public orderTerm: string[] = ['order'];
	public propertyTerm: string;
	public areFiltersVisible: boolean = false;
	@Output() eventAddItem: EventEmitter<Category> = new EventEmitter<Category>();
	@Output() eventSelectCategory: EventEmitter<Category> = new EventEmitter<Category>();
	@Input() areCategoriesVisible: boolean = true;
	@Input() transactionMovement: TransactionMovement;
	public apiURL = Config.apiURL;
	public loading: boolean = false;
	public itemsPerPage = 10;
	public totalItems = 0;
	public database: string;
	constructor(
		public _categoryService: CategoryService,
		public _router: Router,
		public _modalService: NgbModal,
		public alertConfig: NgbAlertConfig
	) { }

	ngOnInit(): void {
		this.database = Config.database;
		this.getCategories();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if(changes.transactionMovement.currentValue) {
		  this.getCategories();
		}
	}

	public getBadge(term: string): boolean {

		return true;
	}

	public getCategories(): void {

		this.loading = true;

		let query = 'sort="order":-1';

		if(this.transactionMovement === TransactionMovement.Sale) {
			query += `&where="visibleOnSale":true`;
		} else if(this.transactionMovement === TransactionMovement.Purchase) {
			query += `&where="visibleOnPurchase":true`;
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
		this.eventSelectCategory.emit(categorySelected);
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
