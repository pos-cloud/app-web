import { Component, OnInit, Input, ViewEncapsulation, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Company, CompanyType } from './../../models/company';
import { Config } from './../../app.config';

import { CompanyService } from './../../services/company.service';

import { AddCompanyComponent } from './../../components/add-company/add-company.component';
import { DeleteCompanyComponent } from './../../components/delete-company/delete-company.component';
import { User } from 'app/models/user';
import { AuthService } from 'app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-company',
  templateUrl: './select-company.component.html',
  styleUrls: ['./select-company.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectCompanyComponent implements OnInit {

	@Input() type: CompanyType;
	@Input() userType: string;
	public identity: User;
	public companies: Company[];
	public areCompaniesEmpty: boolean = true;
	public alertMessage: string = '';
	public orderTerm: string[] = ['name'];
	public propertyTerm: string;
	public areFiltersVisible: boolean = false;
	public loading: boolean = false;
	public itemsPerPage = 10;
	public totalItems = 0;
	public userCountry: string;
	private subscription: Subscription = new Subscription();
	public focusEvent = new EventEmitter<boolean>();

	constructor(
		public _companyService: CompanyService,
		public _router: Router,
		public _modalService: NgbModal,
		public activeModal: NgbActiveModal,
		public alertConfig: NgbAlertConfig,
		public _authService: AuthService
	) {
		this.companies = new Array();
	}

	ngOnInit(): void {
		this._authService.getIdentity.subscribe(
			identity => {
				this.identity = identity;
			}
		);
		this.userCountry = Config.country;
		let pathLocation: string[] = this._router.url.split('/');

		if (!this.userType) {
			this.userType = pathLocation[1];
		}
		this.getCompaniesByType();
	}

	ngAfterViewInit() {
		this.focusEvent.emit(true);
	}

	public getCompaniesByType(): void {

		this.loading = true;

		let pathLocation: string[] = this._router.url.split('/');

		if (!this.type) {
			if (pathLocation[2] === "clientes") {
				this.type = CompanyType.Client;
			} else if (pathLocation[2] === "proveedores") {
				this.type = CompanyType.Provider;
			}
		}

		let query = 'where="type":"' + this.type.toString() + '"';

		this.subscription.add(this._companyService.getCompanies(query).subscribe(
			result => {
				if (!result.companies) {
					if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
					this.loading = false;
					this.companies = new Array();
					this.areCompaniesEmpty = true;
				} else {
					this.hideMessage();
					this.loading = false;
					this.companies = result.companies;
					this.totalItems = this.companies.length;
					this.areCompaniesEmpty = false;
				}
			},
			error => {
				this.showMessage(error._body, 'danger', false);
				this.loading = false;
			}
		));
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
		this.getCompaniesByType();
	}

	public openModal(op: string, company: Company): void {

		let modalRef;
		switch (op) {
			case 'view':
				modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.companyId = company._id;
				modalRef.componentInstance.readonly = true;
				modalRef.componentInstance.operation = 'view';
				break;
			case 'add':
				modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.operation = 'add';
				modalRef.componentInstance.companyType = this.type;
				modalRef.result.then((result) => {
					if (this.userType === 'pos') {
						this.selectCompany(result.company);
					} else {
						this.getCompaniesByType();
					}
				}, (reason) => {
					this.getCompaniesByType();
				});
				break;
			case 'update':
				modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.companyId = company._id;
				modalRef.componentInstance.readonly = false;
				modalRef.componentInstance.operation = 'update';
				modalRef.result.then((result) => {
					this.getCompaniesByType();
				}, (reason) => {
					this.getCompaniesByType();
				});
				break;
			case 'delete':
				modalRef = this._modalService.open(DeleteCompanyComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.company = company;
				modalRef.result.then((result) => {
					if (result === 'delete_close') {
						this.getCompaniesByType();
					}
				}, (reason) => {

				});
				break;
			default: ;
		}
	};

	public selectCompany(companySelected: Company): void {
		this.activeModal.close({ company: companySelected });
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
