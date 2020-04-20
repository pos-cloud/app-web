
import { of as observableOf, Observable, Subscription } from 'rxjs';
import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction, attributes } from '../transaction';
import { TransactionMovement } from '../../transaction-type/transaction-type';
import { Config } from '../../../app.config';

import { TransactionService } from '../transaction.service';
import { ConfigService } from '../../config/config.service'

import { DeleteTransactionComponent } from '../delete-transaction/delete-transaction.component';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';
import { ExportCitiComponent } from '../../export/export-citi/export-citi.component';
import { ExportIvaComponent } from '../../export/export-iva/export-iva.component';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

//Pipes
import { PrintComponent } from 'app/components/print/print/print.component';
import { PrinterService } from '../../printer/printer.service';
import { Printer, PrinterPrintIn } from '../../printer/printer';
import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { AuthService } from 'app/components/login/auth.service';
import { SendEmailComponent } from '../../send-email/send-email.component';
import { PrintTransactionTypeComponent } from '../../print/print-transaction-type/print-transaction-type.component';
import { CurrencyPipe } from '@angular/common';
import { ExportExcelComponent } from '../../export/export-excel/export-excel.component';
import { DateFormatPipe } from 'app/main/pipes/date-format.pipe';
import * as moment from 'moment';
import 'moment/locale/es';

@Component({
	selector: 'app-list-transactions',
	templateUrl: './list-transactions.component.html',
	styleUrls: ['./list-transactions.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.Emulated
})

export class ListTransactionsComponent implements OnInit {

	public userCountry: string;
	public transactionMovement: TransactionMovement;
	public listType: string = 'statistics';
	public modules: Observable<{}>;
	public printers: Printer[];


	public totalItems: number = 0;
	public title: string = "Listado de Transacciones"
	public items: any[] = new Array();
	public alertMessage: string = '';
	public loading: boolean = false;
	public itemsPerPage = 10;
	public currentPage: number = 1;
	public sort = { "endDate": -1 };
	public filters: any[];
	public scrollY: number = 0;
	public timezone: string = "-03:00";
	private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
	private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
	@ViewChild(ExportExcelComponent, { static: false }) exportExcelComponent: ExportExcelComponent;
	public columns = attributes;
	public pathLocation: string[];
	private subscription: Subscription = new Subscription();


	public dateFormat = new DateFormatPipe();

	//cabecera
	public startDate: string;
	public endDate: string;
	public dateSelect: string;

	constructor(
		public _transactionService: TransactionService,
		public _configService: ConfigService,
		public _router: Router,
		public _modalService: NgbModal,
		public activeModal: NgbActiveModal,
		public alertConfig: NgbAlertConfig,
		public _printerService: PrinterService,

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
		this.startDate = moment().format('YYYY-MM-DD');
		this.endDate = moment().format('YYYY-MM-DD');
		this.dateSelect = "creationDate";

	}

	public ngOnInit(): void {

		this.userCountry = Config.country;

		let pathLocation: string[] = this._router.url.split('/');
		this.listType = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
		this.modules = observableOf(Config.modules);
		this.getPrinters();
		if (this.listType === "Compras") {
			this.transactionMovement = TransactionMovement.Purchase;
		} else if (this.listType === "Ventas") {
			this.transactionMovement = TransactionMovement.Sale;
		} else if (this.listType === "Stock") {
			this.transactionMovement = TransactionMovement.Stock;
		} else if (this.listType === "Fondos") {
			this.transactionMovement = TransactionMovement.Money;
		}

		this._authService.getIdentity.subscribe(
			async identity => {
				if (identity && identity.origin) {
					for (let index = 0; index < this.columns.length; index++) {
						if (this.columns[index].name === "branchDestination") {
							this.columns[index].defaultFilter = `{ "${identity.origin.branch._id}" }`;
						}
					}
				}
			}
		);

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

	public getPrinters(): void {

		this.loading = true;

		this._printerService.getPrinters().subscribe(
			result => {
				if (!result.printers) {
					this.printers = new Array();
				} else {
					this.hideMessage();
					this.printers = result.printers;
				}
				this.loading = false;
			},
			error => {
				this.showMessage(error._body, 'danger', false);
				this.loading = false;
			}
		);
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

		match += `"type.transactionMovement": "${this.transactionMovement}",`;

		match += `"${this.dateSelect}" : {
            "$gte" : { "$date" : "${this.startDate}T00:00:00${this.timezone}" },
            "$lte" : { "$date" : "${this.endDate}T23:59:59${this.timezone}" }
        }`


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

		this.subscription.add(this._transactionService.getTransactionsV2(
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

	public openModal(op: string, transaction: Transaction): void {

		let modalRef;
		switch (op) {
			case 'view':
				modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.transactionId = transaction._id;
				break;
			case 'edit':
				modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.transactionId = transaction._id;
				modalRef.result.then((result) => {
					if (result.transaction) {
						this.getItems();
					}
				}, (reason) => {

				});
				break;
			case 'print':
                if(transaction.type.expirationDate && moment(transaction.type.expirationDate).diff(moment(),'days') <= 0){
                    this.showMessage("El documento esta vencido","danger",true)
                } else {
                    if (transaction.type.readLayout) {
                        modalRef = this._modalService.open(PrintTransactionTypeComponent)
                        modalRef.componentInstance.transactionId = transaction._id;
                    } else {
                        modalRef = this._modalService.open(PrintComponent);
                        modalRef.componentInstance.company = transaction.company;
                        modalRef.componentInstance.transactionId = transaction._id;
                        modalRef.componentInstance.typePrint = 'invoice';
                        if (transaction.type.defectPrinter) {
                            modalRef.componentInstance.printer = transaction.type.defectPrinter;
                        } else {
                            if (this.printers && this.printers.length > 0) {
                                for (let printer of this.printers) {
                                    if (printer.printIn === PrinterPrintIn.Counter) {
                                        modalRef.componentInstance.printer = printer;
                                    }
                                }
                            }
                        }
                    }
                }

				break;
			case 'delete':
				modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
				modalRef.componentInstance.op = op;
				modalRef.componentInstance.transactionId = transaction._id;
				modalRef.result.then((result) => {
					if (result === 'delete_close') {
						this.getItems();
					}
				}, (reason) => {

				});
				break;
			case 'send-email':
				if (transaction.type.readLayout) {
					modalRef = this._modalService.open(PrintTransactionTypeComponent)
					modalRef.componentInstance.transactionId = transaction._id;
					modalRef.componentInstance.source = "mail";
				} else {
					modalRef = this._modalService.open(PrintComponent);
					modalRef.componentInstance.company = transaction.company;
					modalRef.componentInstance.transactionId = transaction._id;
					modalRef.componentInstance.typePrint = 'invoice';
					modalRef.componentInstance.source = "mail";
				}
				if (transaction.type.defectPrinter) {
					modalRef.componentInstance.printer = transaction.type.defectPrinter;
				} else {
					if (this.printers && this.printers.length > 0) {
						for (let printer of this.printers) {
							if (printer.printIn === PrinterPrintIn.Counter) {
								modalRef.componentInstance.printer = printer;
							}
						}
					}
				}

				modalRef = this._modalService.open(SendEmailComponent, { size: 'lg', backdrop: 'static' });
				if (transaction.company && transaction.company.emails) {
					modalRef.componentInstance.emails = transaction.company.emails;
				}
				let labelPrint = transaction.type.name;
				if (transaction.type.labelPrint) {
					labelPrint = transaction.type.labelPrint;
				}
				modalRef.componentInstance.subject = `${labelPrint} ${this.padNumber(transaction.origin, 4)}-${transaction.letter}-${this.padNumber(transaction.number, 8)}`;
				if (transaction.type.electronics) {
					modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente` + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/invoice/${transaction._id}">Su comprobante</a>`
				} else {
					modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente ` +  `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/others/${transaction._id}">Su comprobante</a>`
				}

				if (Config.country === 'MX') {
					modalRef.componentInstance.body += ` y su XML correspondiente en http://${Config.database}.poscloud.com.ar:300/api/print/xml/CFDI-33_Factura_` + transaction.number;
				}

				if (transaction.type.defectEmailTemplate) {

					if (transaction.type.electronics) {
						modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/invoice/${transaction._id}">Su comprobante</a>`
					} else {
						modalRef.componentInstance.body = transaction.type.defectEmailTemplate.design + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/others/${transaction._id}">Su comprobante</a>`
					}

					if (Config.country === 'MX') {
						modalRef.componentInstance.body += ` y su XML correspondiente en http://${Config.database}.poscloud.com.ar:300/api/print/xml/CFDI-33_Factura_` + transaction.number;
					}
				}

				break;
			default: ;
		}
	};

	public padNumber(n, length): string {

		var n = n.toString();
		while (n.length < length)
			n = "0" + n;
		return n;
	}

	public exportCiti(): void {

		let modalRef = this._modalService.open(ExportCitiComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.transactionMovement = this.transactionMovement;
		modalRef.result.then((result) => {

		}, (reason) => {

		});
	}

	public exportIVA(): void {

		let modalRef = this._modalService.open(ExportIvaComponent, { size: 'lg', backdrop: 'static' });
		modalRef.componentInstance.type = this.listType;
		modalRef.result.then((result) => {
			if (result === 'export') {
			}
		}, (reason) => {

		});
	}

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
