import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IAttribute } from '@types';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { PrintTransactionTypeComponent } from 'app/components/print/print-transaction-type/print-transaction-type.component';
import { PrintComponent } from 'app/components/print/print/print.component';
import { Printer, PrinterPrintIn } from 'app/components/printer/printer';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';
import { Transaction } from 'app/components/transaction/transaction';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { User } from 'app/components/user/user';
import { AuthService } from 'app/core/services/auth.service';
import { DatatableService } from 'app/core/services/datatable.service';
import { PrinterService } from 'app/core/services/printer.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import * as printJS from 'print-js';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-order-woo-commerce',
  templateUrl: './list-orders.component.html',
  standalone: true,
  providers: [TranslateService],
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
    private _printerService: PrinterService,
    private _toastService: ToastService,
    private _modalService: NgbModal,
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
        name: 'Estado del pago',
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
        name: 'tiendaNubeId',
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
          if (transaction.type.transactionMovement === TransactionMovement.Production) {
            this.printTransaction(transaction);
          } else {
            if (transaction.type.readLayout) {
              modalRef = this._modalService.open(PrintTransactionTypeComponent);
              modalRef.componentInstance.transactionId = transaction._id;
            } else {
              let printer: Printer;

              if (this.user && this.user.printers && this.user.printers.length > 0) {
                for (const element of this.user.printers) {
                  if (element && element.printer && element.printer.printIn === PrinterPrintIn.Counter) {
                    printer = element.printer;
                  }
                }
              } else {
                if (transaction.type.defectPrinter) {
                  printer = transaction.type.defectPrinter;
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
              modalRef.componentInstance.transactionId = transaction._id;
              modalRef.componentInstance.typePrint = 'invoice';
              modalRef.componentInstance.printer = printer;

              modalRef.result.then(
                (result) => {
                  if (transaction.taxes && transaction.taxes.length > 0) {
                    for (const tax of transaction.taxes) {
                      if (tax.tax.printer) {
                        modalRef = this._modalService.open(PrintTransactionTypeComponent);
                        modalRef.componentInstance.transactionId = transaction._id;
                        modalRef.componentInstance.printerID = tax.tax.printer;
                      }
                    }
                  }
                },
                (reason) => {
                  if (transaction.taxes && transaction.taxes.length > 0) {
                    for (const tax of transaction.taxes) {
                      if (tax.tax.printer) {
                        modalRef = this._modalService.open(PrintTransactionTypeComponent);
                        modalRef.componentInstance.transactionId = transaction._id;
                        modalRef.componentInstance.printerID = tax.tax.printer;
                      }
                    }
                  }
                }
              );
            }
          }
        }
        break;
    }
  }

  isLastTransaction(transaction: any): boolean {
    const index = this.transactions.findIndex((t) => t === transaction);
    return index === this.transactions.length - 1;
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

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
}
