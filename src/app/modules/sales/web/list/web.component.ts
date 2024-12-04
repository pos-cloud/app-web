import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse, IAttribute } from '@types';
import { Config } from 'app/app.config';
import { DatatableController } from 'app/components/datatable/datatable.controller';
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
import { ConfigService } from 'app/core/services/config.service';
import { PrinterService } from 'app/core/services/printer.service';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { UserService } from 'app/core/services/user.service';
import { CancelComponent } from 'app/modules/sales/web/tienda-nube-cancel/cancel.component';
import { DateFromToComponent } from 'app/modules/sales/web/tienda-nube-date-from-to/date-from-to.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import * as moment from 'moment';
import * as printJS from 'print-js';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FulfilledComponent } from '../tienda-nube-fulfilled/fulfilled.component';

@Component({
  selector: 'app-web-transactions',
  templateUrl: './web.component.html',
  styleUrls: ['./web.component.scss'],
  providers: [NgbAlertConfig, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class WebComponent implements OnInit {
  public loading: boolean = false;
  public transactions: Transaction[] = new Array();
  public transaction;
  public transactionMovement: TransactionMovement = TransactionMovement.Sale;
  public datatableController: DatatableController;
  public user: User;
  private subscription: Subscription = new Subscription();
  public columns: IAttribute[];
  public printers: Printer[];
  public config: Config;
  private sort: {};
  public filters: any;
  private identifier: string;
  private title: string = 'TiendaNube';
  private destroy$ = new Subject<void>();

  public currentPage: number = 0;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    private _transactionService: TransactionService,
    private _modalService: NgbModal,
    private _printerService: PrinterService,
    private _tiendaNubeService: TiendaNubeService,
    private _toastService: ToastService,
    public _userService: UserService,
    private _configService: ConfigService
  ) {
    this.columns = [
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
        name: 'type.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
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
        filter: false,
        datatype: 'string',
        project: null,
        defaultFilter: `{ "$nin": ["Anulado"] }`,
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
    ];
  }

  async ngOnInit() {
    this.identifier = this.title.replace(/\s+/g, '-').toLowerCase();
    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
    });

    this.datatableController = new DatatableController(
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
    // Recupera los filtros desde localStorage
    const storedFilters = JSON.parse(
      localStorage.getItem(`${this.identifier}_datatableFilters`) || '{}'
    );
    this.filters = {};

    for (let field of this.columns) {
      this.filters[field.name] =
        storedFilters[field.name] || field.defaultFilter || '';
    }

    // Recupera currentPage e itemsPerPage desde localStorage
    this.currentPage = parseInt(
      localStorage.getItem(`${this.identifier}_currentPage`) || '0',
      10
    );
    this.itemsPerPage = parseInt(
      localStorage.getItem(`${this.identifier}_itemsPerPage`) || '10',
      10
    );

    this.sort = JSON.parse(
      localStorage.getItem(`${this.identifier}_sort`) || '{}'
    );

    this.getTransactions();
  }

  public async getTransactions() {
    this.loading = true;
    this.subscription.add(
      await this.datatableController
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

  async openModal(
    op: string,
    state: TransactionState = TransactionState.Closed,
    transaction?
  ) {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        this.getTransaction(transaction._id);
        if (this.transaction) {
          modalRef = this._modalService.open(ViewTransactionComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transactionId = this.transaction._id;
        }
        break;
      case 'print':
        this.getTransaction(transaction._id);
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
                modalRef.componentInstance.transactionId = this.transaction._id;
              } else {
                let printer: Printer;

                await this.getUser().then(async (user) => {
                  if (user && user.printers && user.printers.length > 0) {
                    for (const element of user.printers) {
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
                });

                modalRef = this._modalService.open(PrintComponent);
                modalRef.componentInstance.company = transaction.company;
                modalRef.componentInstance.transactionId = this.transaction._id;
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
        break;
      case 'canceledTn':
        this.getTransaction(transaction._id);
        if (this.transaction) {
          modalRef = this._modalService.open(CancelComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transaction = this.transaction;
          modalRef.componentInstance.config = this.config;
          modalRef.componentInstance.state = state;
          modalRef.result.then(() => {
            this.getTransactions();
          });
        }
        break;
      case 'fulfilledTn':
        this.getTransaction(transaction._id);
        if (this.transaction) {
          modalRef = this._modalService.open(FulfilledComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transaction = this.transaction;
          modalRef.componentInstance.config = this.config;
          modalRef.componentInstance.state = state;
          modalRef.result.then(() => {
            this.getTransactions();
          });
        }
        break;
      case 'dateTn':
        modalRef = this._modalService.open(DateFromToComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.result.then(() => {
          this.getTransactions();
        });
        break;
    }
  }

  getTransaction(transactionId) {
    this._transactionService
      .getById(transactionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.transaction = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  changeStateOfTransaction(transaction: Transaction, state: TransactionState) {
    this.getTransaction(transaction._id);
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
            this.refresh();
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

    localStorage.setItem(`${this.identifier}_sort`, JSON.stringify(this.sort));

    this.getTransactions();
  }

  public addFilters(): void {
    localStorage.setItem(
      `${this.identifier}_datatableFilters`,
      JSON.stringify(this.filters)
    );
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

  public getUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let identity: User = JSON.parse(sessionStorage.getItem('user'));
      let user;

      if (identity) {
        this._userService
          .getById(identity._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (result) => {
              resolve(result.result);
            },
            error: (error) => {
              this._toastService.showToast(error);
            },
          });
      }
    });
  }

  public pageChange(page): void {
    this.currentPage = page;
    // Guarda la página actual en localStorage
    localStorage.setItem(
      `${this.identifier}_currentPage`,
      this.currentPage.toString()
    );
    this.getTransactions();
  }

  public changeItemsPerPage(): void {
    // Guarda itemsPerPage en localStorage
    localStorage.setItem(
      `${this.identifier}_itemsPerPage`,
      this.itemsPerPage.toString()
    );
    this.getTransactions();
  }
}
