import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CashBoxType } from './../../models/cash-box-type';
import { CashBoxTypeService } from './../../services/cash-box-type.service';

import { CashBoxTypeComponent } from './../../components/cash-box-type/cash-box-type.component';

@Component({
	selector: 'app-list-cash-box-types',
	templateUrl: './list-cash-box-types.component.html',
	styleUrls: ['./list-cash-box-types.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.None
})

export class ListCashBoxTypesComponent implements OnInit {

	public cashBoxTypes: CashBoxType[] = new Array();
	public areCashBoxTypesEmpty: boolean = true;
	public alertMessage: string = '';
	public userType: string;
	public orderTerm: string[] = ['description'];
	public propertyTerm: string;
	public areFiltersVisible: boolean = false;
	public loading: boolean = false;
	public itemsPerPage = 10;
	public totalItems = 0;

	constructor(
		public _cashBoxTypeService: CashBoxTypeService,
		public _router: Router,
		public _modalService: NgbModal,
		public alertConfig: NgbAlertConfig
	) { }

	ngOnInit(): void {

		let pathLocation: string[] = this._router.url.split('/');
		this.userType = pathLocation[1];
		this.getCashBoxTypes();
	}

	public getCashBoxTypes(): void {

		this.loading = true;

		this._cashBoxTypeService.getCashBoxTypes().subscribe(
			result => {
				if (!result.cashBoxTypes) {
					if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
					this.loading = false;
					this.cashBoxTypes = new Array();
					this.areCashBoxTypesEmpty = true;
				} else {
					this.hideMessage();
					this.loading = false;
					this.cashBoxTypes = result.cashBoxTypes;
					this.totalItems = this.cashBoxTypes.length;
					this.areCashBoxTypesEmpty = false;
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

	public refresh(): void {
		this.getCashBoxTypes();
	}

	public openModal(op: string, cashBoxType: CashBoxType): void {

		let modalRef;
		switch (op) {
			case 'view':
				modalRef = this._modalService.open(CashBoxTypeComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.cashBoxTypeId = cashBoxType._id;
				modalRef.componentInstance.operation = "view";
				modalRef.componentInstance.readonly = true;
				modalRef.result.then((result) => {
				}, (reason) => {
				});
				break;
			case 'add':
				modalRef = this._modalService.open(CashBoxTypeComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.operation = "add";
				modalRef.componentInstance.readonly = false;
				modalRef.result.then((result) => {
					this.getCashBoxTypes();
				}, (reason) => {
					this.getCashBoxTypes();
				});
				break;
			case 'update':
				modalRef = this._modalService.open(CashBoxTypeComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.cashBoxTypeId = cashBoxType._id;
				modalRef.componentInstance.operation = "update";
				modalRef.componentInstance.readonly = false;
				modalRef.componentInstance.cashBoxType = cashBoxType;
				modalRef.result.then((result) => {
					this.getCashBoxTypes();
				}, (reason) => {
					this.getCashBoxTypes();
				});
				break;
			case 'delete':
				modalRef = this._modalService.open(CashBoxTypeComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.cashBoxTypeId = cashBoxType._id;
				modalRef.componentInstance.operation = "delete";
				modalRef.componentInstance.readonly = true;
				modalRef.result.then((result) => {
					if (result === 'delete_close') {
						this.getCashBoxTypes();
					}
				}, (reason) => {
					this.getCashBoxTypes();
				});
				break;
			default: ;
		}
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
