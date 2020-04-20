import { Component, ViewEncapsulation } from '@angular/core';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Transaction, TransactionState } from 'app/components/transaction/transaction';
import { TransactionService } from 'app/components/transaction/transaction.service';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-pos-client-view',
    templateUrl: './pos-client-view.component.html',
    styleUrls: ['./pos-client-view.component.scss'],
    providers: [NgbAlertConfig],
    encapsulation: ViewEncapsulation.None
})

export class PosClientViewComponent {

    public loading: boolean = false;
    public transactions: Transaction[];
    public transactionStates: string[];
    public validTransactionStates: string[] = [
        TransactionState.Delivered.toString(),
        TransactionState.Pending.toString(),
        TransactionState.Sent.toString(),
        TransactionState.Preparing.toString(),
    ];
    public originsToFilter: number[];

    // DISEÑO
    public colors: string[] = ["orange:white", "green:white"];
    public colorNumber: number = 0;
    public limit: number = 9;
    public fontSize: number = 100;
    public column: number = 6;

    constructor(
        private _route: ActivatedRoute,
        private _transactionService: TransactionService
    ) {
        this.transactions = new Array();
    }

    public ngOnInit() {
        this.processParams();
        this.initInterval();
    }

    public initInterval() {
        setInterval(() => {
            if (!this.loading) {
                this.loadTransactions();
            }
        }, 5000);
    }

    private processParams(): void {
        this._route.queryParams.subscribe(params => {
            if (!this.loading) {
                if (params['column'] && !isNaN(params['column'])) this.column = params['column'];
                if (params['fontSize'] && !isNaN(params['fontSize'])) this.fontSize = params['fontSize'];
                if (params['limit'] && !isNaN(params['limit'])) {
                    if (params['limit'] !== this.limit) {
                        this.limit = params['limit'];
                        this.loadTransactions();
                    } else {
                        this.limit = params['limit'];
                    }
                }
                if (params['colors']) {
                    this.colors = new Array();
                    for (const color of params['colors'].split(',')) {
                        this.colors.push(color);
                    }
                }

                // RECORRER POS INSERTADOS
                this.originsToFilter = new Array();
                if (params['origins']) {
                    for (let origin of params['origins'].split(',')) {
                        this.originsToFilter.push(parseInt(origin));
                    }
                }
                this.transactionStates = new Array();
                // RECORRER ESTADOS INSERTADOS
                Object.keys(params).map(key => {
                    for (const s of params[key].split(',')) {
                        if (this.validTransactionStates.includes(s)) {
                            this.transactionStates.push(s);

                        }
                    }
                    this.loadTransactions();
                });
            }
        });
    }

    public async loadTransactions() {
        if (this.transactionStates.includes(TransactionState.Preparing.toString()) &&
            !this.transactionStates.includes(TransactionState.Packing.toString())) {
            this.transactionStates.push(TransactionState.Packing.toString());
        }
        let query = { state: { $in: this.transactionStates }, operationType: { $ne: "D" } };
        if (this.originsToFilter && this.originsToFilter.length > 0) {
            query['origin'] = { $in: this.originsToFilter };
        }
        this.transactions = await this.getTransactions(query);
        // CHANGE STATES PACKING TO PREPARING FOR VIEW
        for (let trans of this.transactions) {
            if (trans.state === TransactionState.Packing) trans.state = TransactionState.Preparing;
        }
    }

    public async finishTransaction(transaction: Transaction) {
        if (transaction.state === TransactionState.Delivered) {
            await this.getTransaction(transaction._id).then(
                async result => {
                    if (result) {
                        transaction = result;
                    }
                }
            );
            transaction.state = TransactionState.Closed;
            this.updateTransaction(transaction).then(
                async transaction => {
                    if (transaction) {
                        this.loadTransactions();
                    }
                }
            );
        }
    }

    public updateTransaction(transaction: Transaction): Promise<Transaction> {

        return new Promise<Transaction>((resolve, reject) => {

            this.loading = true;

            this._transactionService.updateTransaction(transaction).subscribe(
                result => {
                    this.loading = false;
                    if (!result.transaction) {
                        resolve(null);
                    } else {
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.loading = false;
                    resolve(null);
                }
            );
        });
    }

    public getTransaction(transactionId: string): Promise<Transaction> {

        return new Promise<Transaction>((resolve, reject) => {

            this.loading = true;

            this._transactionService.getTransaction(transactionId).subscribe(
                async result => {
                    this.loading = false;
                    if (!result.transaction) {
                        resolve(null);
                    } else {
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.loading = false;
                    resolve(null);
                }
            );
        });
    }

    public getTransactions(match: {}): Promise<Transaction[]> {

        return new Promise<Transaction[]>((resolve, reject) => {

            this.loading = true;

            let project = {
                endDate: 1,
                startDate: 1,
                origin: 1,
                number: 1,
                orderNumber: 1,
                state: 1,
                operationType: 1,
            }

            this._transactionService.getTransactionsV2(
                project, // PROJECT
                match, // MATCH
                { startDate: 1 }, // SORT
                {}, // GROUP
                this.limit, // LIMIT
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
