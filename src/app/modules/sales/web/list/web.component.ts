import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse } from '@types';
import { Config } from 'app/app.config';
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
import { PrinterService } from 'app/core/services/printer.service';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { UserService } from 'app/core/services/user.service';
import { CancelComponent } from 'app/modules/sales/web/tienda-nube-cancel/cancel.component';
import { DateFromToComponent } from 'app/modules/sales/web/tienda-nube-date-from-to/date-from-to.component';
import { DeleteTransactionComponent } from 'app/shared/components/delete-transaction/delete-transaction.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import * as moment from 'moment';
import * as printJS from 'print-js';
import { Subscription } from 'rxjs';
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
  public transaction: Transaction;
  public transactionMovement: TransactionMovement = TransactionMovement.Sale;
  public user: User;
  private subscription: Subscription = new Subscription();
  public orderTerm: string[] = ['startDate'];
  public propertyTerm: string;
  public itemsPerPage = 10;
  public printers: Printer[];
  public config: Config;

  public filterEndDate;
  public filterType;
  public filterNumber;
  public filterCompany;
  public filterOrderNumber;
  public filterState;
  filterBalance;
  filterObservation;
  filterTotalPrice;
  p;

  constructor(
    private _transactionService: TransactionService,
    private _modalService: NgbModal,
    private _printerService: PrinterService,
    private _tiendaNubeService: TiendaNubeService,
    private _toastService: ToastService,
    public _userService: UserService
  ) {}

  async ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.getTransactions();
  }

  public getTransactions(): Promise<Transaction[]> {
    return new Promise<Transaction[]>((resolve, reject) => {
      this.loading = true;

      let project = {
        _id: 1,
        startDate: 1,
        endDate: 1,
        origin: 1,
        number: 1,
        orderNumber: 1,
        observation: 1,
        totalPrice: 1,
        balance: 1,
        state: 1,
        madein: 1,
        operationType: 1,
        taxes: 1,
        CAE: 1,
        creationUser: 1,
        tiendaNubeId: 1,
        'company.name': 1,
        'type._id': 1,
        'type.allowEdit': 1,
        'type.name': 1,
        'type.level': 1,
        'type.transactionMovement': 1,
        'type.electronics': 1,
        'type.paymentMethods': 1,
        branchOrigin: 1,
        'deliveryAddress.name': 1,
        'deliveryAddress.number': 1,
        'deliveryAddress.floor': 1,
        'deliveryAddress.flat': 1,
        'deliveryAddress.city': 1,
        'deliveryAddress.state': 1,
        'deliveryAddress.observation': 1,
        'deliveryAddress.shippingStatus': 1,
        'shipmentMethod.name': 1,
        paymentMethodEcommerce: 1,
      };
      let match = {
        state: { $nin: [TransactionState.Canceled] },
        madein: {
          $in: ['pedidos-web', 'mercadolibre', 'woocommerce', 'tiendanube'],
        },
        operationType: { $ne: 'D' },
        balance: { $gt: 0 },
        'type.transactionMovement': this.transactionMovement,
      };

      if (this.transactionMovement !== TransactionMovement.Stock) {
        project['company._id'] = 1;
        project['company.name'] = 1;
      }

      if (this.transactionMovement === TransactionMovement.Sale) {
        project['employeeClosing._id'] = 1;
        project['employeeClosing.name'] = 1;
      }

      let sort: {} = { startDate: -1 };

      this.orderTerm = ['-orderNumber'];

      if (
        this.user &&
        this.user.permission &&
        this.user.permission.transactionTypes &&
        this.user.permission.transactionTypes.length > 0
      ) {
        let transactionTypes = [];
        this.user.permission.transactionTypes.forEach((element) => {
          transactionTypes.push({ $oid: element });
        });
        match['type._id'] = { $in: transactionTypes };
      }

      this.subscription.add(
        this._transactionService
          .getAll({
            project,
            match,
            sort,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              this.transactions = result.result;
              resolve(result.result);
            },
            (error) => {
              this._toastService.showToast(error);
              this.loading = false;
              resolve(new Array());
            }
          )
      );
    });
  }

  async openModal(
    op: string,
    state: TransactionState = TransactionState.Closed,
    transaction?
  ) {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
          modalRef = this._modalService.open(ViewTransactionComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transactionId = this.transaction._id;
        }
        break;
      case 'print':
        this.transaction = await this.getTransaction(transaction._id);
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

        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
          modalRef = this._modalService.open(DeleteTransactionComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.result.then(
            (result) => {
              if (result === 'delete_close') {
                this.refresh();
              }
            },
            (reason) => {}
          );
        }
        break;
      case 'canceledTn':
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
          modalRef = this._modalService.open(CancelComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transaction = this.transaction;
          modalRef.componentInstance.config = this.config;
          modalRef.componentInstance.state = state;
        }
        break;
      case 'fulfilledTn':
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
          modalRef = this._modalService.open(FulfilledComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.transaction = this.transaction;
          modalRef.componentInstance.config = this.config;
          modalRef.componentInstance.state = state;
        }
        break;
      case 'dateTn':
        modalRef = this._modalService.open(DateFromToComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.result.then(() => {
          this.refresh();
        });
        break;
    }
  }

  public getTransaction(transactionId: string): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.getById(transactionId).subscribe(
        async (result) => {
          if (!result.result) {
            this._toastService.showToast(result);
            //  this.showMessage(result.message, 'danger', false);
            resolve(null);
          } else {
            resolve(result.result);
          }
        },
        (error) => {
          this._toastService.showToast(error);
          resolve(null);
        }
      );
    });
  }

  async changeStateOfTransaction(
    transaction: Transaction,
    state: TransactionState
  ) {
    this.transaction = await this.getTransaction(transaction._id);
    if (
      this.transaction &&
      this.transaction.tiendaNubeId &&
      this.config.tiendaNube.userID
    ) {
      return new Promise<Transaction>((resolve, reject) => {
        this._tiendaNubeService
          .updateTransactionStatus(
            transaction.tiendaNubeId,
            this.config.tiendaNube.userID,
            state
          )
          .subscribe(
            (result: ApiResponse) => {
              if (result.status === 201) {
                this.refresh();
                resolve(result.result);
              } else {
                this.refresh();
                reject(result);
              }
              this.refresh();
            },
            (error) => {
              this._toastService.showToast(error);
              reject(error);
            }
          );
      });
    }
  }

  public orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public printTransaction(transaction: Transaction) {
    this.loading = true;
    this._printerService.printTransaction(transaction._id).subscribe(
      (res: Blob) => {
        if (res) {
          const blobUrl = URL.createObjectURL(res);
          printJS(blobUrl);
          this.loading = false;
        } else {
          this.loading = false;
          this._toastService.showToast({
            message: 'Error al cargar el PDF',
          });
        }
      },
      (error) => {
        this.loading = false;
        this._toastService.showToast(error);
      }
    );
  }

  public getUser(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      let identity: User = JSON.parse(sessionStorage.getItem('user'));
      let user;

      if (identity) {
        this._userService.getUser(identity._id).subscribe(
          (result) => {
            if (result && result.user) {
              resolve(result.user);
            } else {
              this._toastService.showToast({
                message: 'Debe volver a iniciar sesión',
              });
            }
          },
          (error) => {
            this._toastService.showToast(error);
          }
        );
      }
    });
  }
}
