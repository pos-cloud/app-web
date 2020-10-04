import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from '../cash-box';
import { CashBoxService } from '../cash-box.service';

import { PrintComponent } from '../../print/print/print.component';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { Printer } from 'app/components/printer/printer';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';

@Component({
	selector: 'app-list-cash-boxes',
	templateUrl: './list-cash-boxes.component.html',
	styleUrls: ['./list-cash-boxes.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.None
})

export class ListCashBoxesComponent implements OnInit {

	public cashBoxes: CashBox[] = new Array();
	public areCashBoxesEmpty: boolean = true;
	public alertMessage: string = '';
	public userType: string;
	public orderTerm: string[] = ['-openingDate'];
	public propertyTerm: string;
	public areFiltersVisible: boolean = false;
	public loading: boolean = false;
	public itemsPerPage = 10;
	public totalItems = 0;
	public filterNumber; filterOpeningDate; filterClosingDate; filterState; filterEmployee; p; filterType;

	constructor(
		public _cashBoxService: CashBoxService,
		public _router: Router,
		public _modalService: NgbModal,
        public alertConfig: NgbAlertConfig,
        public translatePipe: TranslateMePipe,
        private _toastr: ToastrService,
		public activeModal: NgbActiveModal,
		public _transactionTypeService: TransactionTypeService
	) { }

	ngOnInit(): void {

		let pathLocation: string[] = this._router.url.split('/');
		this.userType = pathLocation[1];
		this.getCashBoxes();
	}

	public getBadge(term: string): boolean {

		return true;
	}

	public selectCashBox(cashBoxSelected: CashBox): void {
		this.activeModal.close({ cashBoxId: cashBoxSelected._id });
	}

	public getCashBoxes(): void {

		this.loading = true;

		this._cashBoxService.getCashBoxes().subscribe(
			result => {
				if (!result.cashBoxes) {
					if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
					this.loading = false;
					this.cashBoxes = new Array();
					this.areCashBoxesEmpty = true;
				} else {
					this.hideMessage();
					this.loading = false;
					this.cashBoxes = result.cashBoxes;
					this.totalItems = this.cashBoxes.length;
					this.areCashBoxesEmpty = false;
				}
				this.loading = false;
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
		this.getCashBoxes();
	}

	public printBoxClosure(cashBox: CashBox): void {
		this.getTransactionTypes(cashBox);
	}

	public getTransactionTypes(cashBox: CashBox): void {

		this.loading = true;

		this._transactionTypeService.getAll({
			project: {
				name: 1,
				cashClosing: 1,
				cashBoxImpact: 1,
				defectPrinter: 1
			}, match: {
				cashClosing: true,
				cashBoxImpact: true,
				operationType: { $ne: "D" }
			}
		}).subscribe(
			result => {

                this.loading = false;
                if (result.status === 200) {
                    if(result.result[0].defectPrinter){
                        this.openModal('print', cashBox, result.result[0].defectPrinter);
                    } else {
                        this.openModal('print', cashBox);
                    }
                } else {
                    this.showToast(result);
                }


				if (result.status != 200) {
					if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
					this.loading = false;
					this.openModal('print', cashBox);
				} else {
					this.hideMessage();
					this.loading = false;
					this.openModal('print', cashBox, result.result[0].defectPrinter);
				}
			},
			error => {
				this.showMessage(error._body, 'danger', false);
				this.loading = false;
			}
		);
	}

	public openModal(op: string, cashBox: CashBox, printer: Printer = null): void {

		let modalRef;
		switch (op) {
			case 'print':
				let modalRef = this._modalService.open(PrintComponent);
				modalRef.componentInstance.cashBox = cashBox;
				modalRef.componentInstance.printer = printer;
				modalRef.componentInstance.typePrint = 'cash-box';
				modalRef.result.then((result) => {

				}, (reason) => {

				});
				break;
			default: ;
		}
	};

	public showMessage(message: string, type: string, dismissible: boolean): void {
		this.alertMessage = message;
		this.alertConfig.type = type;
		this.alertConfig.dismissible = dismissible;
	}

	public hideMessage(): void {
		this.alertMessage = '';
    }
    
    public showToast(result, type?: string, title?: string, message?: string): void {
        if (result) {
            if (result.status === 200) {
                type = 'success';
                title = result.message;
            } else if (result.status >= 400) {
                type = 'danger';
                title = (result.error && result.error.message) ? result.error.message : result.message;
            } else {
                type = 'info';
                title = result.message;
            }
        }
        switch (type) {
            case 'success':
                this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            case 'danger':
                this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            default:
                this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
        }
        this.loading = false;
    }
}
