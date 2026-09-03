import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PrintService } from '@core/services/print.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiResponse, IAttribute, Printer, PrintType, TransactionMovement, User } from '@types';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { Transaction } from 'app/components/transaction/transaction';
import { AuthService } from 'app/core/services/auth.service';
import { DatatableService } from 'app/core/services/datatable.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { WooCommerceService } from 'app/core/services/woocommerce.service';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import * as printJS from 'print-js';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { SyncOrderComponent } from './sync-orders/sync-orders.component';

@Component({
  selector: 'app-list-order-woo-commerce',
  templateUrl: './list-orders.component.html',
  styleUrls: ['./list-orders.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, NgbModule, DatatableModule, PipesModule, TranslateModule, FormsModule, ProgressbarModule],
})
export class ListOrdersWooCommerceComponent implements OnInit {
  public loading: boolean = false;
  public transactions: Transaction[];
  public transaction: Transaction;
  public transactionMovement: TransactionMovement = TransactionMovement.Sale;
  public _datatableService: DatatableService;
  public user: User;
  private subscription: Subscription = new Subscription();
  public columns: IAttribute[];
  public printers: Printer[];
  private sort: {};
  public filters: any;
  private destroy$ = new Subject<void>();
  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    private _transactionService: TransactionService,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private _authService: AuthService,
    private _wooCommerceService: WooCommerceService,
    public _printService: PrintService
  ) {
    this.columns = [
      {
        name: 'number',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: `{"$toString" : "$number"}`,
        align: 'right',
        required: false,
      },
      {
        name: 'startDate',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'date',
        project: `{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
        align: 'right',
        required: true,
      },
      {
        name: 'company.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'state',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        // defaultFilter: ``,
        align: 'left',
        required: true,
      },
      {
        name: 'Dirección de envio',
        visible: true,
        disabled: false,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'deliveryAddress.city',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'deliveryAddress.postalCode',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'deliveryAddress.floor',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'deliveryAddress.name',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'deliveryAddress.number',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'paymentMethodEcommerce',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'observation',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'balance',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: `{"$toString" : "$balance"}`,
        defaultFilter: `{ "$gt": "0" }`,
        align: 'right',
        required: true,
      },
      {
        name: 'totalPrice',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: `{"$toString" : "$totalPrice"}`,
        align: 'right',
        required: true,
      },

      {
        name: 'type.name',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'madein',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        defaultFilter: `{ "$eq": "woo-commerce" }`,
        align: 'left',
        required: true,
      },
      {
        name: 'orderNumber',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: null,
        align: 'right',
        required: true,
      },
      {
        name: 'origin',
        visible: false,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: `{"$toString" : "$origin"}`,
        align: 'center',
        required: true,
      },
      {
        name: 'operationType',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        defaultFilter: `{ "$ne": "D" }`,
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'wooId',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'type.transactionMovement',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'type.readLayout',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'type.expirationDate',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
    ];
  }

  async ngOnInit() {
    this._datatableService = new DatatableService(this._transactionService, this.columns);
    this._authService.getIdentity.subscribe(async (identity) => {
      this.user = identity;
    });
    this.processParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.getTransactions();
  }

  private processParams(): void {
    this.filters = {};

    for (let field of this.columns) {
      this.filters[field.name] = field.defaultFilter;
    }
    this.itemsPerPage = 10;
    this.sort = {};
    this.getTransactions();
  }

  public async getTransactions() {
    this.loading = true;
    this.subscription.add(
      await this._datatableService
        .getItems(this.filters, this.currentPage, this.itemsPerPage, this.sort)
        .then((result) => {
          if (result.status === 200) {
            if (result.result.length > 0) {
              if (this.itemsPerPage === 0) {
                this.itemsPerPage = 10;
              } else {
                this.transactions = result.result[0].items;
                this.totalItems = result.result[0].count;
              }
            } else {
              this.transactions = [];
              this.totalItems = 0;
            }
          } else this._toastService.showToast(result);
        })
        .catch((error) => this._toastService.showToast(error))
    );
    this.loading = false;
  }

  async openModal(op: string, transaction?: Transaction) {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        if (transaction) {
          modalRef = this._modalService.open(ViewTransactionComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transactionId = transaction._id;
        }
        break;
      case 'print':
        if (transaction) {
          const data = {
            transactionId: transaction._id,
          };
          this.toPrint(PrintType.Transaction, data);
        }
        break;
      case 'sync-orders':
        modalRef = this._modalService.open(SyncOrderComponent, {
          size: 'lg',
          backdrop: 'static',
        });

        modalRef.result.then(() => {
          this.getTransactions();
        });
        break;
    }
  }

  public toPrint(type: PrintType, data: {}): void {
    this.loading = true;

    this._printService
      .toPrint(type, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  isLastTransaction(transaction: any): boolean {
    const index = this.transactions.findIndex((t) => t === transaction);

    if (this.transactions.length === 1) {
      return false;
    }

    return index === this.transactions.length - 1;
  }

  changeStateOfTransaction(transaction: Transaction, status: string) {
    this.loading = true;
    if (transaction && transaction.wooId) {
      this._wooCommerceService
        .updateTransactionStatusWoo(transaction.wooId, status)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            this._toastService.showToast(result);
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            setTimeout(() => {
              this.refresh();
              this.loading = false;
            }, 3000);
          },
        });
    }
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getTransactions();
  }

  public addFilters(): void {
    this.currentPage = 1;
    this.getTransactions();
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getTransactions();
  }
}
