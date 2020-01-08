import { Component, ViewEncapsulation } from '@angular/core';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Transaction, TransactionState } from 'app/models/transaction';
import { TransactionService } from 'app/services/transaction.service';

@Component({
	selector: 'app-pos-client-view',
	templateUrl: './pos-client-view.component.html',
	styleUrls: ['./pos-client-view.component.scss'],
	providers: [NgbAlertConfig],
	encapsulation: ViewEncapsulation.None
})

export class PosClientViewComponent {

	public loading: boolean = false;
	public transactionsInPreparation: Transaction[];
	public transactionsToRemove: Transaction[];

	constructor(
		private _transactionService: TransactionService
	) {
		this.transactionsInPreparation = new Array();
		this.transactionsToRemove = new Array();
	}

	public ngOnInit() {
		this.loadTransactions();
		this.initInterval();
	}

	public initInterval() {
		setInterval(() => {
			if(!this.loading) {
				this.loadTransactions();
			}
		}, 5000);
	}

	public async loadTransactions() {
		this.transactionsToRemove = await this.getTransactions({ state: TransactionState.Delivered, operationType: { $ne: "D" } });
		this.transactionsInPreparation = await this.getTransactions({ state: { $in: [TransactionState.Preparing, TransactionState.Packing] }, operationType: { $ne: "D" } });
	}

	public getTransactions(match: {}): Promise<Transaction[]> {

		return new Promise<Transaction[]>((resolve, reject) => {

			this.loading = true;

			let project = {
				endDate: 1,
				number: 1,
				state: 1,
				operationType: 1,
			}

			this._transactionService.getTransactionsV2(
				project, // PROJECT
				match, // MATCH
				{ startDate: -1 }, // SORT
				{}, // GROUP
				9, // LIMIT
				0 // SKIP
			).subscribe(
				result => {
					this.loading = false;
					resolve(result.transactions);
				},
				error => {
					this.loading = false;
					resolve([]);
				}
			);
		});
	}
}
