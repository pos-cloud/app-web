import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation, Input } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Room } from './../../models/room';
import { Printer, PrinterPrintIn } from './../../models/printer';
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType, TransactionMovement } from './../../models/transaction-type';

import { RoomService } from './../../services/room.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { PaymentMethodService } from './../../services/payment-method.service';
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';

import { AddTransactionComponent } from './../add-transaction/add-transaction.component';
import { PrintComponent } from './../print/print.component';
import { DeleteTransactionComponent } from './../delete-transaction/delete-transaction.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';
import { ListCompaniesComponent } from 'app/components/list-companies/list-companies.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';
import { CashBoxComponent } from '../cash-box/cash-box.component';
import { EmployeeType } from 'app/models/employee-type';
import { EmployeeTypeService } from 'app/services/employee-type.service';
import { Currency } from 'app/models/currency';
import { CurrencyService } from 'app/services/currency.service';
import { Config } from 'app/app.config';
import { CashBox, CashBoxState } from 'app/models/cash-box';
import { CashBoxService } from 'app/services/cash-box.service';
import { UserService } from 'app/services/user.service';
import { Company } from 'app/models/company';
import { Table, TableState } from 'app/models/table';
import { TableService } from 'app/services/table.service';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class PointOfSaleComponent implements OnInit {

  public rooms: Room[] = new Array();
  public roomSelected: Room;
  public transactions: Transaction[] = new Array();
  public areTransactionsEmpty: boolean = true;
  public transactionTypes: TransactionType[];
  public transactionMovement: TransactionMovement;
  public userType: string;
  public propertyTerm: string;
  public orderTerm: string[] = ['startDate'];
  public posType: string;
  public alertMessage: string = '';
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public printers: Printer[];
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  public transaction: Transaction;
  public printerSelected: Printer;
  public employeeTypeSelected: EmployeeType;
  public tableSelected: Table;

  // CAMPOS TRAIDOS DE LA CUENTA CTE.
  @Input() company: Company;
  @Input() totalPrice: number;

  constructor(
    public _turnService: TurnService,
    public _roomService: RoomService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _paymentMethodService: PaymentMethodService,
    public _printerService: PrinterService,
    public _employeeTypeService: EmployeeTypeService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _currencyService: CurrencyService,
    public _cashBoxService: CashBoxService,
    public _userService: UserService,
    public _tableService: TableService,
  ) {
    this.roomSelected = new Room();
    this.transactionTypes = new Array();
    this.getPrinters();
  }

  async ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];

    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {
      await this.getTransactionTypes('where="$or":[{"cashOpening":true},{"cashClosing":true}]').then(
        transactionTypes => {
          if (transactionTypes) {
            this.transactionTypes = transactionTypes;
          }
        }
      );
      this.getOpenTransactions();
    } else if (this.posType === "mostrador") {
      if (pathLocation[3] === "venta") {
        this.transactionMovement = TransactionMovement.Sale;
      } else if (pathLocation[3] === "compra") {
        this.transactionMovement = TransactionMovement.Purchase;
      } else if (pathLocation[3] === "stock") {
        this.transactionMovement = TransactionMovement.Stock;
      } else if (pathLocation[3] === "fondo") {
        this.transactionMovement = TransactionMovement.Money;
      } 
      await this.getTransactionTypes('where="transactionMovement":"' + this.transactionMovement + '"').then(
        transactionTypes => {
          if (transactionTypes) {
            this.transactionTypes = transactionTypes;
          }
        }
      );
      this.getOpenTransactionsByMovement(this.transactionMovement);
    } else {
      if (pathLocation[3] === "cliente") {
        this.transactionMovement = TransactionMovement.Sale;
      } else if (pathLocation[3] === "proveedor") {
        this.transactionMovement = TransactionMovement.Purchase;
      }
      await this.getTransactionTypes('where="currentAccount":"Cobra","transactionMovement":"' + this.transactionMovement + '"').then(
        transactionTypes => {
          if (transactionTypes) {
            this.transactionTypes = transactionTypes;
          }
        }
      );
    }
  }

  public getCurrencies(): Promise<Currency[]> {

    return new Promise<Currency[]>((resolve, reject) => {

      this._currencyService.getCurrencies('sort="name":1').subscribe(
        result => {
          if (!result.currencies) {
            resolve(null);
          } else {
            resolve(result.currencies);
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          resolve(null);
        }
      );
    });
  }

  public getPrinters(): void {

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
        } else {
          this.printers = result.printers;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public getTransactionTypesByMovement(): void {

    this._transactionTypeService.getTransactionTypesByMovement(this.transactionMovement).subscribe(
      result => {
        if (!result.transactionTypes) {
        } else {
          this.transactionTypes = result.transactionTypes;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public getTransactionTypes(query?: string): Promise<TransactionType[]> {

    return new Promise<TransactionType[]>((resolve, reject) => {

      this.loading = true;
  
      this._transactionTypeService.getTransactionTypes(query).subscribe(
        result => {
          this.loading = false;
          if (!result.transactionTypes) {
            resolve(null);
          } else {
            resolve(result.transactionTypes);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getRooms(): void {

    this.loading = true;

    this._roomService.getRooms().subscribe(
        result => { 
          if (!result.rooms) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.rooms = result.rooms;

            if (this.roomSelected._id === undefined){
              this.roomSelected = this.rooms[0];
            } else {
              for(let room of this.rooms) {
                if (this.roomSelected._id === room._id){
                  this.roomSelected = room;
                }
              }
            }
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getOpenTransactions(): void {

    this.loading = true;

    this._transactionService.getOpenTransaction(this.posType).subscribe(
      result => {
        if (!result.transactions) {
          this.hideMessage();
          this.transactions = null;
          this.areTransactionsEmpty = true;
        } else {
          this.hideMessage();
          this.transactions = result.transactions;
          this.totalItems = this.transactions.length;
          this.areTransactionsEmpty = false;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getOpenTransactionsByMovement(transactionMovement: TransactionMovement): void {

    this.loading = true;

    this._transactionService.getOpenTransactionsByMovement(transactionMovement, this.posType).subscribe(
      result => {
        if (!result.transactions) {
          this.loading = false;
          this.transactions = null;
          this.areTransactionsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.transactions = result.transactions;
          this.totalItems = this.transactions.length;
          this.areTransactionsEmpty = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    let pathLocation: string[] = this._router.url.split('/');
    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {
      this.getOpenTransactions();
    } else if (this.posType === "mostrador") {
      this.getOpenTransactionsByMovement(this.transactionMovement);
    }
  }

  public getDefectOrder(): void {

    this._transactionTypeService.getDefectOrder().subscribe(
      async result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.transactionTypes = null;
        } else {
          this.addTransaction(result.transactionTypes[0]);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  async addTransaction(type: TransactionType) {

    this.transaction = new Transaction();
    this.transaction.type = type;
    this.transaction.table = this.tableSelected;
    this.transaction.totalPrice = this.totalPrice;
        
    if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
      this.transaction.origin = this.transaction.type.fixedOrigin;
    }

    if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
      this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
    }

    if(!type.cashOpening && !type.cashClosing) {

      if(Config.modules.money && this.transaction.type.cashBoxImpact) {
        await this.getCashBoxes('where="state":"' + CashBoxState.Open + '"&sort="number":-1&limit=1').then(
          async cashBoxes => {
            if(cashBoxes) {
              this.transaction.cashBox = cashBoxes[0];
              this.nextStepTransaction();
            } else {
              await this.getTransactionTypes('where="cashOpening":true').then(
                transactionTypes => {
                  if(transactionTypes && transactionTypes.length > 0) {
                    this.transaction.type = transactionTypes[0];
                    this.openModal('cash-box');
                  } else {
                    this.showMessage("Debe configurar un tipo de transacción para realizar la apertura de caja.", "info", true);
                  }
                }
              );
            }
          }
        );
      } else {
        this.nextStepTransaction();
      }
    } else {
      this.openModal('cash-box');
    }
  }
  
  public getCashBoxes(query?: string): Promise<CashBox[]> {

    return new Promise<CashBox[]>((resolve, reject) => {
    
      this._cashBoxService.getCashBoxes(query).subscribe(
        result => {
          if (!result.cashBoxes) {
            resolve(null);
          } else {
            resolve(result.cashBoxes);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async assignCurrency(): Promise<boolean> {

    return new Promise<boolean>(async (resolve, reject) => {

      await this.getCurrencies().then(
        currencies => {
          if(currencies && Config.currency) {
            this.transaction.currency = Config.currency;
          }
          if(this.transaction.quotation === undefined ||
            this.transaction.quotation === null) {
            if(currencies && currencies.length > 0) {
              for(let currency of currencies) {
                if(Config.currency && currency._id !== Config.currency._id) {
                  this.transaction.quotation = currency.quotation;
                }
              }
            } else {
              this.transaction.quotation = 1;
            }
          }
          resolve(true);
        }
      );
    });
  }

  async nextStepTransaction() {

    if(this.transaction && 
      (!this.transaction._id || this.transaction._id === "")) {
      await this.getLastTransactionByType().then(
        async transaction => {
          if(transaction) {
            this.transaction.number = transaction.number + 1;
          } else {
            this.transaction.number = 1;
          }
          await this.assignCurrency().then(
            async result => {
              if(result) {
                await this.saveTransaction().then(
                  async transaction => {
                    if(transaction) {
                      this.transaction = transaction;
                      if(this.posType === "resto") {
                        this.tableSelected.lastTransaction = this.transaction;
                        await this.updateTable().then(
                          table => {
                            if(table) {
                              this.tableSelected = table;
                            }
                          }
                        );
                      }
                    }
                  })
                ;
              }
            }
          );
        }
      );
    } else {
      await this.updateTransaction().then(
        transaction => {
          if(transaction) {
            this.transaction = transaction;
          }
        }
      );
    }

    if(this.transaction && this.transaction._id && this.transaction._id !== "") {
      if (!this.transaction.employeeClosing &&
          this.transaction.type.requestEmployee && 
          this.transaction.type.requestArticles &&
          this.posType !== 'delivery') {
        this.openModal('select-employee');
      } else if (!this.transaction.company &&
                  this.transaction.type.requestCompany) {
        if(!this.company) {
          this.openModal('company');
        } else {
          this.transaction.company = this.company;
          this.nextStepTransaction();
        }
      } else if (this.transaction.type.requestArticles && this.transaction.type.transactionMovement !== TransactionMovement.Purchase) {
        if (this.posType === 'resto') {
          this._router.navigate(['/pos/resto/salones/' + this.tableSelected.room._id + '/mesas/' + this.tableSelected._id + '/editar-transaccion/' + this.tableSelected.lastTransaction._id]);
        } else {
          this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + this.transaction._id]);
        }
      } else {
        this.openModal('transaction');
      }
    }
  }

  public cancelTransaction(transaction: Transaction): void {
    this.transaction = transaction;
    this.openModal('cancel-transaction');
  }

  public viewTransaction(transaction: Transaction): void {
    this.transaction = transaction;
    this.openModal('view-transaction');
  }

  public chargeTransaction(transaction: Transaction): void {
    this.transaction = transaction;
    this.openModal('charge');
  }

  public openTransaction(transaction: Transaction): void {
    
    this.transaction = transaction;
    this.nextStepTransaction();
  }

  async openModal(op: string) {

    let modalRef;

    switch (op) {
      case 'company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        modalRef.componentInstance.type = this.transaction.type.requestCompany;
        modalRef.result.then(
          async (result) => {
            if(result.company) {
              this.transaction.company = result.company;
              this.nextStepTransaction();
            } else {
              this.refresh();
            }
          }, (reason) => {
            this.refresh();
          }
        );
        break;
      case 'transaction':

        modalRef = this._modalService.open(AddTransactionComponent , { size: 'lg' });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then(
          async (result) => {
            this.transaction = result.transaction;
            if (this.transaction) {
              if (this.transaction.type && this.transaction.type.requestArticles) {
                this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + this.transaction._id]);
              } else if (this.transaction.type.requestPaymentMethods) {
                this.openModal('charge');
              } else {
                this.finishTransaction();
              }
            } else if (result === "change-company") {
              this.openModal('company');
            } else {
              this.refresh();
            }
          }, (reason) => {
            this.refresh();
          }
        );
        break;
      case 'charge':

      if (await this.isValidCharge()) {
        modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = this.transaction;
        modalRef.result.then((result) => {
          if (result.movementsOfCashes) {
            this.finishTransaction();
          } else {
            this.refresh();
          }
        }, (reason) => {
          this.refresh();
        });
        break;
      }
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.company = this.transaction.company;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'invoice';
        modalRef.result.then((result) => {
          this.refresh();
        }, (reason) => {
          this.refresh();
        });
        break;
      case 'printers':
        if (this.countPrinters() > 1) {
          modalRef = this._modalService.open(this.contentPrinters, { size: 'lg' }).result.then((result) => {
            if (result !== "cancel" && result !== '') {
              this.printerSelected = result;
              this.openModal("print");
            } else {
              this.refresh();
            }
          }, (reason) => {
            this.refresh();
          });
        } else if (this.countPrinters() === 1) {
          this.printerSelected = this.printers[0];
          this.openModal("print");
        }
        break;
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transactionId = this.transaction._id;
        break;
      case 'cancel-transaction':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then((result) => {
          if (result === "delete_close") {
            this.refresh();
          }
        }, (reason) => {

        });
        break;
      case 'open-turn':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.typeEmployee = this.employeeTypeSelected;
        modalRef.componentInstance.op = 'open-turn';
        modalRef.result.then((result) => {
          if (result.turn) {
            this.showMessage("El turno se ha abierto correctamente", 'success', true);
          }
        }, (reason) => {

        });
        break;
      case 'close-turn':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.typeEmployee = this.employeeTypeSelected;
        modalRef.componentInstance.op = 'close-turn';
        modalRef.result.then((result) => {
          if (result.turn) {
            this.showMessage("El turno se ha cerrado correctamente", 'success', true);
          }
        }, (reason) => {

        });
        break;
      case 'cash-box':
        modalRef = this._modalService.open(CashBoxComponent, { size: 'lg' });
        modalRef.componentInstance.transactionType = this.transaction.type;
        modalRef.result.then((result) => {
          if (result && result.cashBox) {
          } else {
            this.hideMessage();
          }
        }, (reason) => {
          this.hideMessage();
        });
        break;
      case 'select-employee':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        if(this.posType === 'resto') {
          modalRef.componentInstance.op = 'open-table';
          modalRef.componentInstance.table = this.tableSelected;
        } else {
          modalRef.componentInstance.op = 'select-employee';
        }
        modalRef.componentInstance.typeEmployee = this.transaction.type.requestEmployee;
        modalRef.result.then(
          async (result) => {
            if (result.employee) {
              this.transaction.employeeOpening = result.employee;
              this.transaction.employeeClosing = result.employee;
              if (this.posType === "delivery") {
                this.transaction.state = TransactionState.Sent;
                await this.updateTransaction().then(
                  transaction => {
                    if(transaction) {
                      this.transaction = transaction;
                      this.refresh();
                    }
                  }
                );
              } else if (this.posType === 'resto') {
                this.tableSelected.employee = result.employee;
                this.tableSelected.diners = result.diners;
                await this.updateTable().then(
                  table => {
                    if(table) {
                      this.tableSelected = table;
                      this.transaction.diners = this.tableSelected.diners;
                      this.nextStepTransaction();
                    }
                  }
                );
              } else {
                this.nextStepTransaction();
              }
            } else {
              this.refresh();
            }
        }, (reason) => {
          this.refresh();
        });
        break;
      default: ;
    }
  }

  public updateTable(): Promise<Table> {

    return new Promise<Table>((resolve, reject) => {

      this._tableService.updateTable(this.tableSelected).subscribe(
        result => {
          if (!result.table) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.table);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async isValidCharge(): Promise<boolean> {

    let isValid = true;

    if (isValid &&
      this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
      !this.transaction.company) {
      isValid = false;
      this.showMessage("Debe seleccionar un proveedor para la transacción.", 'info', true);
    }

    if (isValid &&
      this.transaction.type.electronics &&
      this.transaction.totalPrice > 5000 &&
      !this.transaction.company &&
      Config.country === 'AR') {
      isValid = false;
      this.showMessage("Debe indentificar al cliente para transacciones electrónicos con monto mayor a $5.000,00.", 'info', true);
    }

    if (isValid &&
        this.transaction.type.electronics &&
        this.transaction.company && (
        !this.transaction.company.identificationType ||
        !this.transaction.company.identificationValue ||
        this.transaction.company.identificationValue === '')
      ) {
      isValid = false;
      this.showMessage("El cliente ingresado no tiene nro de identificación", 'info', true);
      this.loading = false;
    }

    if (isValid &&
      this.transaction.type.fixedOrigin &&
      this.transaction.type.fixedOrigin === 0 &&
      this.transaction.type.electronics &&
      Config.country === 'MX') {
      isValid = false;
      this.showMessage("Debe configurar un punto de venta para transacciones electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción.", 'info', true);
      this.loading = false;
    }

    if (isValid &&
      this.transaction.type.electronics &&
      !Config.modules.sale.electronicTransactions) {
      isValid = false;
      this.showMessage("No tiene habilitado el módulo de factura electrónica.", 'info', true);
      this.loading = false;
    }

    return isValid;
  }

  async finishTransaction() {

    await this.updateBalance().then(
      async balance => {
        if(balance !== null) {
          this.transaction.balance = balance;
          if (this.posType === "resto" || this.posType === "delivery") {
            this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
            this.transaction.VATPeriod = moment().format('YYYYMM');
          } else {
            if (!this.transaction.endDate) {
              this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
            }
            if (this.transaction.type.transactionMovement !== TransactionMovement.Purchase || !this.transaction.VATPeriod) {
              this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
            }
          }
          this.transaction.expirationDate = this.transaction.endDate;
          this.transaction.state = TransactionState.Closed;
          await this.updateTransaction().then(
            transaction => {
              if(transaction) {
                if (this.transaction.type.printable) {
                  if (this.transaction.type.defectPrinter) {
                    this.printerSelected = this.printerSelected;
                    this.openModal("print");
                  } else {
                    this.openModal("printers");
                  }
                } else {
                  this.refresh();
                }
              }
            }
          );
        }
    });
  }

  public getLastTransactionByType(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this._transactionService.getLastTransactionByTypeAndOrigin(this.transaction.type, this.transaction.origin, this.transaction.letter).subscribe(
        result => {
          if (!result.transactions) {
            resolve(null);
          } else {
            resolve(result.transactions[0]);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public updateBalance(): Promise<number> {

    return new Promise<number>((resolve, reject) => {
      this._transactionService.updateBalance(this.transaction).subscribe(
        async result => {
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.transaction.balance);  
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          reject(null);
        }
      )
    });
  }

  public saveTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this.transaction.madein = this.posType;
  
      this._transactionService.saveTransaction(this.transaction).subscribe(
        result => {
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            this.hideMessage();
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public countPrinters(): number {

    let numberOfPrinters: number = 0;
    let printersAux = new Array();

    if (this.printers && this.printers.length > 0) {
      for (let printer of this.printers) {
        if (printer.printIn === PrinterPrintIn.Counter) {
          printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    this.printers = printersAux;

    return numberOfPrinters;
  }

  public updateTransaction(): Promise<Transaction> {
    
    return new Promise<Transaction>((resolve, reject) => {

      this._transactionService.updateTransaction(this.transaction).subscribe(
        result => {
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public selectTable(table: Table): void {

    this.tableSelected = table;

    if (this.tableSelected.state !== TableState.Disabled &&
        this.tableSelected.state !== TableState.Reserved) {
      if(this.tableSelected.state === TableState.Busy ||
         this.tableSelected.state === TableState.Pending) {
          this._router.navigate(['/pos/resto/salones/' + this.tableSelected.room._id + '/mesas/' + this.tableSelected._id + '/editar-transaccion/' + this.tableSelected.lastTransaction._id]);
      } else {
        this.getDefectOrder();
      }
    } else {
      this.showMessage("La mesa seleccionada se encuentra " + this.tableSelected.state, 'info', true);
    }
  }

  async changeStateOfTransaction(transaction: Transaction, state: string) {
    
    this.transaction = transaction;

    if(this.transaction.totalPrice > 0) {
      if (state === "Enviado") {
        if(this.transaction.type.requestEmployee) {
          this.openModal('select-employee');
        } else {
          this.transaction.state = TransactionState.Sent;
        }
      } else if (state === "Entregado") {
        this.transaction.state = TransactionState.Delivered;
      }
  
      this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      this.transaction.VATPeriod = moment().format('YYYYMM');
      this.transaction.expirationDate = this.transaction.endDate;
  
      await this.updateTransaction().then(
        transaction => {
          if(this.transaction) {
            this.transaction = transaction;
            this.refresh();
          }
        }
      );
    } else {
      this.showMessage("No se puede cambiar de estado una transacción con monto menor o igual $0,00.", "info", true);
    }
  }

  public getEmployeeType(op: string, employeeType: string): void {

    let query = 'where="description":"' + employeeType + '"';

    this._employeeTypeService.getEmployeeTypes(query).subscribe(
      result => {
        if (!result.employeeTypes) {
          this.showMessage("No existen empleados de tipo " + employeeType, "info", true);
        } else {
          this.hideMessage();
          this.employeeTypeSelected = result.employeeTypes[0];
          this.openModal(op);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public changeRoom(room: Room): void {
    this.roomSelected = room;
  }

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
