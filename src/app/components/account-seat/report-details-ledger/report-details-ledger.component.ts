import { Component, ViewEncapsulation, ViewChild, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AccountSeatService } from '../account-seat.service';
import { Config } from 'app/app.config';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelComponent } from 'app/components/export/export-excel/export-excel.component';
import * as moment from 'moment';
import { Transaction } from 'app/components/transaction/transaction';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';

@Component({
    selector: 'app-report-details-ledger',
    templateUrl: './report-details-ledger.component.html',
    styleUrls: ['./report-details-ledger.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class ReportDetailsLedgerComponent implements OnInit {

    public accountId : string;
    public title: string = 'report-details-ledger';
    public items = [];
    public nameAccount : string;
    public loading = true;
    public startDate: string;
    public endDate: string;
    public columns = [
        {
			name: 'codigo',
			visible: true,
			disabled: false,
			filter: true,
			datatype: 'string',
			align: 'left'
		},
		{
			name: 'description',
			visible: true,
			disabled: false,
			filter: true,
			datatype: 'string',
			align: 'left'
		},
		{
			name: 'totalDebit',
			visible: true,
			disabled: false,
			filter: true,
			datatype: 'string',
			align: 'left'
		},
		{
			name: 'totalCredit',
			visible: true,
			disabled: false,
			filter: true,
			datatype: 'string',
			align: 'left'
		},
		{
			name: 'total',
			visible: true,
			disabled: false,
			filter: true,
			datatype: 'string',
			align: 'left'
		},
	];
    // EXCEL
	@ViewChild(ExportExcelComponent, { static: false }) exportExcelComponent: ExportExcelComponent;

    constructor(
        public _service: AccountSeatService,
        private _toastr: ToastrService,
        public _modalService: NgbModal,
        private _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public translatePipe: TranslateMePipe,
    ) {
        this.items = new Array()
    }

    async ngOnInit() {

        let pathUrl: string[] = this._router.url.split('/');
        this.accountId = pathUrl[5]
        this.startDate = pathUrl[6]
        this.endDate = pathUrl[7]
        this.nameAccount = pathUrl[8].split('%20').join(' ')

        this.getItems();
    }

    public getItems(): void {

        let timezone = "-03:00";
        if (Config.timezone && Config.timezone !== '') {
            timezone = Config.timezone.split('UTC')[1];
        }

        let query = [];

        query.push(

            {
                $lookup: {
                    from: "transactions",
                    localField: "transaction",
                    foreignField: "_id",
                    as: "transaction"
                }
            },
            { $unwind: { path: "$transaction", preserveNullAndEmptyArrays: true } },

            {
                $lookup: {
                    from: "transaction-types",
                    localField: "transaction.type",
                    foreignField: "_id",
                    as: "transaction.type"
                }
            },
            { $unwind: { path: "$transaction.type", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "items" : { "$elemMatch" : { "account" : { "$oid" :  this.accountId }}},
                    date : {
                        "$gte" : { "$date" : this.startDate + "T00:00:00" + timezone },
                        "$lte" : { "$date" : this.endDate + "T23:59:59" + timezone }
                    }
                }
            },
            {
                $project : {
                    date : { "$dateToString": { "date": "$date", "format": "%d/%m/%Y", "timezone": "-03:00" } },
                    observation : 1,
                    "transaction.type.transactionMovement" : 1,
                    "transaction.type.name" : 1,
                    "transaction.origin" : 1,
                    "transaction.letter" : 1,
                    "transaction.number" : 1,
                    "items" : 1
                }
            }
            
        );

        this._service.getFullQuery(
            query
        ).subscribe(
            result => {
                if (result && result.status === 200) {
                    this.loading = false;
                    this.items = result.result;
                } else {
                    this.showToast(null, result.result);
                }
            },
            error => {
                this.showToast(error, 'danger');
            }
        );

    }


    public refresh() {
        this.getItems();
    }

    public exportItems(): void {
		this.exportExcelComponent.items = this.items;
		this.exportExcelComponent.export();
	}

    public openModal(op: string, transaction: Transaction): void {

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = transaction._id;
                break;
            default: ;
        }
    };

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