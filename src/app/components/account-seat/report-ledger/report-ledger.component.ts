import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AccountSeatService } from '../account-seat.service';
import { Config } from 'app/app.config';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { TranslatePipe } from '@ngx-translate/core';
import { ExportExcelComponent } from 'app/components/export/export-excel/export-excel.component';
import * as moment from 'moment';

@Component({
    selector: 'app-report-ledger',
    templateUrl: './report-ledger.component.html',
    styleUrls: ['./report-ledger.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe, TranslatePipe],
    encapsulation: ViewEncapsulation.None
})

export class ReportLedgerComponent implements OnInit {

    public title: string = 'report-ledger';
    public items = [];
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
        private _router: Router,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public translatePipe: TranslateMePipe,
    ) {
        this.items = new Array()
        this.startDate = moment().startOf('month').format('YYYY-MM-DD');
        this.endDate = moment().endOf('month').format('YYYY-MM-DD');
    }

    async ngOnInit() {

        this.getItems();
    }

    public getItems(): void {

        let timezone = "-03:00";
        if (Config.timezone && Config.timezone !== '') {
            timezone = Config.timezone.split('UTC')[1];
        }

        let query = [];

        query.push(

            { $unwind: "$items" },

            { $unwind: { path: "$account", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "accounts",
                    localField: "items.account",
                    foreignField: "_id",
                    as: "items.account"
                }
            },
            {
                $match: {
                    date : {
                        "$gte" : { "$date" : this.startDate + "T00:00:00" + timezone },
                        "$lte" : { "$date" : this.endDate + "T23:59:59" + timezone }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        account: "$items.account",
                    },
                    totalDebit: { $sum: "$items.debit" },
                    totalCredit: { $sum: "$items.credit" },
                }
            },
            {
                $project: {
                    account: "$_id.account",
                    codigo: { $arrayElemAt: [ "$_id.account.code", 0 ] },
                    description: { $arrayElemAt: [ "$_id.account.description", 0 ] },
                    totalDebit: "$totalDebit",
                    totalCredit: "$totalCredit",
                    total : { $subtract : [ "$totalDebit","$totalCredit" ] }
                }
            },
            {
                $sort : {
                    codigo : 1
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