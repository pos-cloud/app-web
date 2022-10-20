import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'app/components/user/user';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { EmailTemplate, attributes } from '../email-template'
import { Subscription } from 'rxjs';
import { DateFormatPipe } from 'app/main/pipes/date-format.pipe';
import { EmailTemplateService } from 'app/components/email-template/email-template.service';
import { ConfigService } from 'app/components/config/config.service';
import { Router } from '@angular/router';
import { NgbModal, NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'app/components/login/auth.service';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { EmailTemplateComponent } from '../email-template/email-template.component';

@Component({
	selector: 'app-list-email-templates',
	templateUrl: './list-email-templates.component.html',
	styleUrls: ['./list-email-templates.component.scss']
})
export class ListEmailTemplatesComponent implements OnInit {

	public userCountry: string;

	public totalItems: number = 0;
	public title: string = "Listado de plantillas para correo"
	public items: any[] = new Array();
	public alertMessage: string = '';
	public loading: boolean = false;
	public itemsPerPage = 10;
	public currentPage: number = 1;
	public sort = { "name": -1 };
	public filters: any[];
	public scrollY: number = 0;
	public timezone: string = "-03:00";
	private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
	private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
	@ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
	public columns = attributes;
	public pathLocation: string[];
	private subscription: Subscription = new Subscription();


	public dateFormat = new DateFormatPipe();


	constructor(
		public _emailTemplateService: EmailTemplateService,
		public _configService: ConfigService,
		public _router: Router,
		public _modalService: NgbModal,
		public activeModal: NgbActiveModal,
		public alertConfig: NgbAlertConfig,

		private _authService: AuthService
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
		this.getItems();
		this.initDragHorizontalScroll();
	}

	public drop(event: CdkDragDrop<string[]>): void {
		moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
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

				if (this.columns[i].project !== null) {
					project += `"${this.columns[i].name}": ${this.columns[i].project}`;
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

		this.subscription.add(this._emailTemplateService.getEmailTemplates(
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
				case 'date':
					value = this.dateFormat.transform(eval(val), "DD/MM/YYYY")
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

	public openModal(op: string, emailTemplate: EmailTemplate): void {

		let modalRef;
		switch (op) {
			case 'add':
				modalRef = this._modalService.open(EmailTemplateComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.operation = "add";
				modalRef.result.then((result) => {
					this.getItems();
				}, (reason) => {
					this.getItems();
				});
				break;
			case 'view':
				modalRef = this._modalService.open(EmailTemplateComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.emailTemplateId = emailTemplate._id;
				modalRef.componentInstance.operation = "view";
				modalRef.componentInstance.readonly = true;
				modalRef.result.then((result) => {
					this.getItems();
				}, (reason) => {
					this.getItems();
				});
				break;
			case 'edit':
				modalRef = this._modalService.open(EmailTemplateComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.emailTemplateId = emailTemplate._id;
				modalRef.componentInstance.operation = "edit";
				modalRef.componentInstance.readonly = false;
				modalRef.result.then((result) => {
					this.getItems();
				}, (reason) => {
					this.getItems();
				});
				break;
			case 'delete':
				modalRef = this._modalService.open(EmailTemplateComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.operation = "delete";
				modalRef.componentInstance.readonly = true;
				modalRef.componentInstance.emailTemplateId = emailTemplate._id;
				modalRef.result.then((result) => {
					this.getItems();
				}, (reason) => {
					this.getItems();
				});
				break;
			default: ;
		}
	};

	public exportItems(): void {
		this.itemsPerPage = 0;
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
