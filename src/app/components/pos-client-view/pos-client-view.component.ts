import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse } from '@types';
import {
  Transaction,
  TransactionState,
} from 'app/components/transaction/transaction';
import { TransactionService } from 'app/core/services/transaction.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';

@Component({
  selector: 'app-pos-client-view',
  templateUrl: './pos-client-view.component.html',
  styleUrls: ['./pos-client-view.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class PosClientViewComponent {
  viewBotton: boolean = true;
  elem;
  loading: boolean = false;
  transactions: Transaction[];
  transactionStates: string[] = new Array();
  validTransactionStates: string[] = [
    TransactionState.Delivered.toString(),
    TransactionState.Pending.toString(),
    TransactionState.Packing.toString(),
    TransactionState.Sent.toString(),
    TransactionState.Preparing.toString(),
  ];
  originsToFilter: number[];
  // DISEÑO
  colors: string[] = ['orange:white', 'green:white'];
  colorNumber: number = 0;
  limit: number = 9;
  fontSize: number = 100;
  column: number = 6;

  constructor(
    private _route: ActivatedRoute,
    private _transactionService: TransactionService,
    public translatePipe: TranslateMePipe,
    private _toastService: ToastService
  ) {
    this.transactions = new Array();
  }

  public ngOnInit() {
    this.elem = document.documentElement;
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
    this._route.queryParams.subscribe((params) => {
      if (!this.loading) {
        if (params['column'] && !isNaN(params['column']))
          this.column = params['column'];
        if (params['fontSize'] && !isNaN(params['fontSize']))
          this.fontSize = params['fontSize'];
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

        //RECORRER LOS ESTADOS
        this.transactionStates = new Array();
        if (params['state']) {
          for (let state of params['state'].split(',')) {
            this.transactionStates.push(state);
          }
        }
        this.loadTransactions();
      }
    });
  }

  public async loadTransactions() {
    let query = {};

    if (this.transactionStates) {
      query['state'] = { $in: this.transactionStates };
    }

    if (this.originsToFilter && this.originsToFilter.length > 0) {
      query['origin'] = { $in: this.originsToFilter };
    }

    query['operationType'] = { $ne: 'D' };
    query['shipmentMethod'] = { $ne: { $oid: '5e6fbdd32891ec64814aa95d' } };

    this.transactions = await this.getTransactions(query);
    // CHANGE STATES PACKING TO PREPARING FOR VIEW
    if (this.transactions && this.transactions.length > 0) {
      for (let trans of this.transactions) {
        if (trans.state === TransactionState.Packing)
          trans.state = TransactionState.Preparing;
      }
    }
  }

  public async finishTransaction(transaction: Transaction) {
    if (transaction.state === TransactionState.Delivered) {
      await this.getTransaction(transaction._id).then(async (result) => {
        if (result) {
          transaction = result;
        }
      });
      transaction.state = TransactionState.Closed;
      this.updateTransaction(transaction).then(async (transaction) => {
        if (transaction) {
          this.loadTransactions();
        }
      });
    }
  }

  public updateTransaction(transaction: Transaction): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.update(transaction).subscribe(
        (result: ApiResponse) => {
          if (result.status === 200) {
            resolve(result.result);
          } else {
            this._toastService.showToast(result);
            reject(result);
          }
        },
        (error) => {
          this._toastService.showToast(error);
          reject(error);
        }
      );
    });
  }

  public getTransaction(transactionId: string): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this.loading = true;

      this._transactionService.getTransaction(transactionId).subscribe(
        async (result) => {
          this.loading = false;
          if (!result.transaction) {
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        (error) => {
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
        shipmentMethod: 1,
      };

      this._transactionService
        .getTransactionsV2(
          project, // PROJECT
          match, // MATCH
          { startDate: 1 }, // SORT
          {}, // GROUP
          this.limit, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            this.loading = false;
            resolve(result.transactions);
          },
          (error) => {
            this.loading = false;
            resolve([]);
          }
        );
    });
  }

  public openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }

    this.viewBotton = false;
  }
}
