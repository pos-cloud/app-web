import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ApiResponse, IAttribute, MovementOfCash } from '@types';
import { Config } from 'app/app.config';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { PrintTransactionTypeComponent } from 'app/components/print/print-transaction-type/print-transaction-type.component';
import { PrintComponent } from 'app/components/print/print/print.component';
import { Printer, PrinterPrintIn } from 'app/components/printer/printer';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';
import {
  Transaction,
  TransactionState,
} from 'app/components/transaction/transaction';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/core/services/auth.service';
import { ConfigService } from 'app/core/services/config.service';
import { DatatableService } from 'app/core/services/datatable.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { PrinterService } from 'app/core/services/printer.service';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { UserService } from 'app/core/services/user.service';
import { CancelComponent } from 'app/modules/sales/tienda-nube/tienda-nube-cancel/cancel.component';
import { DateFromToComponent } from 'app/modules/sales/tienda-nube/tienda-nube-date-from-to/date-from-to.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import * as moment from 'moment';
import { NgxPaginationModule } from 'ngx-pagination';
import * as printJS from 'print-js';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FulfilledComponent } from '../tienda-nube-fulfilled/fulfilled.component';

@Component({
  selector: 'app-web-transactions',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    NgbModule,
    DatatableModule,
    PipesModule,
    TranslateModule,
    FormsModule,
    NgxPaginationModule,
    ProgressbarModule,
  ],
})
export class WebComponent implements OnInit {
  public loading: boolean = false;
  public transactions = new Array();
  public transaction: Transaction;
  public transactionMovement: TransactionMovement = TransactionMovement.Sale;
  public _datatableService: DatatableService;
  public user: User;
  private subscription: Subscription = new Subscription();
  public columns: IAttribute[];
  public printers: Printer[];
  public config: Config;
  private sort: {};
  public filters: any;
  private destroy$ = new Subject<void>();
  public movOfCash: MovementOfCash[];

  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    private _transactionService: TransactionService,
    private _modalService: NgbModal,
    private _printerService: PrinterService,
    private _tiendaNubeService: TiendaNubeService,
    private _movementOfCash: MovementOfCashService,
    private _toastService: ToastService,
    public _userService: UserService,
    private _configService: ConfigService,
    private _authService: AuthService
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
        name: 'state',
        visible: true,
        disabled: false,
        filter: false,
        datatype: 'string',
        project: null,
        defaultFilter: `{ "$nin": ["Anulado"] }`,
        align: 'left',
        required: true,
      },
      {
        name: 'deliveryAddress.shippingStatus',
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
        name: 'deliveryAddress.state',
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
        name: 'estado del pago',
        visible: true,
        disabled: false,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
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
        defaultFilter: `{ "$eq": "tiendanube" }`,
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
        name: 'tiendaNubeId',
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
    this._configService.getConfig.subscribe((config) => {
      this.config = config;
    });

    this._authService.getIdentity.subscribe(async (identity) => {
      this.user = identity;
    });

    this._datatableService = new DatatableService(
      this._transactionService,
      this.columns
    );

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
                this.getMovementCash();
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

  async openModal(
    op: string,
    state: TransactionState = TransactionState.Closed,
    transaction?
  ) {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        this.getTransaction(transaction._id, () => {
          if (this.transaction) {
            modalRef = this._modalService.open(ViewTransactionComponent, {
              size: 'lg',
              backdrop: 'static',
            });
            modalRef.componentInstance.transactionId = this.transaction._id;
          }
        });
        break;
      case 'print':
        this.getTransaction(transaction._id, () => {
          if (this.transaction) {
            if (
              transaction.type.transactionMovement ===
              TransactionMovement.Production
            ) {
              this.printTransaction(this.transaction);
            } else {
              if (
                this.transaction.type.expirationDate &&
                moment(this.transaction.type.expirationDate).diff(
                  moment(),
                  'days'
                ) <= 0
              ) {
                // this.showMessage('El documento esta vencido', 'danger', true);
              } else {
                if (this.transaction.type.readLayout) {
                  modalRef = this._modalService.open(
                    PrintTransactionTypeComponent
                  );
                  modalRef.componentInstance.transactionId =
                    this.transaction._id;
                } else {
                  let printer: Printer;

                  if (
                    this.user &&
                    this.user.printers &&
                    this.user.printers.length > 0
                  ) {
                    for (const element of this.user.printers) {
                      if (
                        element &&
                        element.printer &&
                        element.printer.printIn === PrinterPrintIn.Counter
                      ) {
                        printer = element.printer;
                      }
                    }
                  } else {
                    if (this.transaction.type.defectPrinter) {
                      printer = this.transaction.type.defectPrinter;
                    } else {
                      if (this.printers && this.printers.length > 0) {
                        for (let printer of this.printers) {
                          if (printer.printIn === PrinterPrintIn.Counter) {
                            printer = printer;
                          }
                        }
                      }
                    }
                  }

                  modalRef = this._modalService.open(PrintComponent);
                  modalRef.componentInstance.company = transaction.company;
                  modalRef.componentInstance.transactionId =
                    this.transaction._id;
                  modalRef.componentInstance.typePrint = 'invoice';
                  modalRef.componentInstance.printer = printer;

                  modalRef.result.then(
                    (result) => {
                      if (
                        this.transaction.taxes &&
                        this.transaction.taxes.length > 0
                      ) {
                        for (const tax of this.transaction.taxes) {
                          if (tax.tax.printer) {
                            modalRef = this._modalService.open(
                              PrintTransactionTypeComponent
                            );
                            modalRef.componentInstance.transactionId =
                              this.transaction._id;
                            modalRef.componentInstance.printerID =
                              tax.tax.printer;
                          }
                        }
                      }
                    },
                    (reason) => {
                      if (
                        this.transaction.taxes &&
                        this.transaction.taxes.length > 0
                      ) {
                        for (const tax of this.transaction.taxes) {
                          if (tax.tax.printer) {
                            modalRef = this._modalService.open(
                              PrintTransactionTypeComponent
                            );
                            modalRef.componentInstance.transactionId =
                              this.transaction._id;
                            modalRef.componentInstance.printerID =
                              tax.tax.printer;
                          }
                        }
                      }
                    }
                  );
                }
              }
            }
          }
        });
        break;
      case 'canceledTn':
        this.getTransaction(transaction._id, () => {
          if (this.transaction) {
            modalRef = this._modalService.open(CancelComponent, {
              size: 'lg',
              backdrop: 'static',
            });
            modalRef.componentInstance.transaction = this.transaction;
            modalRef.componentInstance.config = this.config;
            modalRef.componentInstance.state = state;
            modalRef.result.then(() => {
              this.refresh();
            });
          }
        });
        break;
      case 'fulfilledTn':
        this.getTransaction(transaction._id, () => {
          if (this.transaction) {
            this.loading = true;
            modalRef = this._modalService.open(FulfilledComponent, {
              size: 'lg',
              backdrop: 'static',
            });
            modalRef.componentInstance.transaction = this.transaction;
            modalRef.componentInstance.config = this.config;
            modalRef.componentInstance.state = state;
            modalRef.result.then(() => {
              setTimeout(() => {
                this.refresh();
                this.loading = false;
              }, 3000);
            });
          }
        });
        break;
      case 'dateTn':
        this.loading = true;
        modalRef = this._modalService.open(DateFromToComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.result.then(() => {
          setTimeout(() => {
            this.refresh();
            this.loading = false;
          }, 3000);
        });
        break;
    }
  }

  getTransaction(transactionId, callback) {
    this._transactionService
      .getById(transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.transaction = result.result;
          if (callback) {
            callback();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {},
      });
  }

  getMovementCash() {
    const transactionId = this.transactions.map((transaction) => ({
      $oid: transaction._id,
    }));
    let project = {
      status: 1,
      transaction: 1,
      _id: 1,
    };

    const match = {
      transaction: { $in: transactionId },
    };

    this._movementOfCash
      .getAll({ project, match })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.movOfCash = result.result;

          const mergedData = this.transactions.map((movo) => {
            const matchedTransaction = this.movOfCash.find(
              (item) => item.transaction === movo._id
            );
            return { ...movo, movOfCash: matchedTransaction || null };
          });
          this.transactions = mergedData;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {},
      });
  }

  isLastTransaction(transaction: any): boolean {
    const index = this.transactions.findIndex((t) => t === transaction);
    return index === this.transactions.length - 1;
  }

  changeStateOfTransaction(transaction: Transaction, state: TransactionState) {
    this.loading = true;
    this.getTransaction(transaction._id, () => {
      if (
        this.transaction &&
        this.transaction.tiendaNubeId &&
        this.config.tiendaNube.userID
      ) {
        this._tiendaNubeService
          .updateTransactionStatus(
            transaction.tiendaNubeId,
            this.config.tiendaNube.userID,
            state
          )
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
    });
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
    this.getTransactions();
  }

  printTransaction(transaction: Transaction) {
    this.loading = true;
    this._printerService
      .printTransaction(transaction._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: Blob) => {
          if (res) {
            const blobUrl = URL.createObjectURL(res);
            printJS(blobUrl);
          } else {
            this._toastService.showToast({
              message: 'Error al cargar el PDF',
            });
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getTransactions();
  }
  public changeItemsPerPage(): void {
    this.getTransactions();
  }
}
