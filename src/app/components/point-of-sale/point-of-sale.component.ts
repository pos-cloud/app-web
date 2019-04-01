import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
import { Company } from 'app/models/company';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css'],
  providers: [NgbAlertConfig]
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
    public alertConfig: NgbAlertConfig
  ) {
    this.roomSelected = new Room();
    this.transactionTypes = new Array();
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];

    this.getPrinters();

    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {
      this.getTransactionTypesOfCashBox();
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
      this.getTransactionTypesByMovement();
      this.getOpenTransactionsByMovement(this.transactionMovement);
    } else {
      this._router.navigate(['/']);
    }
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
        } else {
          this.hideMessage();
          this.printers = result.printers;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getTransactionTypesByMovement(): void {

    this.loading = true;

    this._transactionTypeService.getTransactionTypesByMovement(this.transactionMovement).subscribe(
      result => {
        if (!result.transactionTypes) {
        } else {
          this.transactionTypes = result.transactionTypes;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getTransactionTypesOfCashBox(): void {

    this.loading = true;

    this._transactionTypeService.getTransactionTypesOfCashBox().subscribe(
      result => {
        if (!result.transactionTypes) {
        } else {
          this.transactionTypes = result.transactionTypes;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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

    this.loading = true;

    this._transactionTypeService.getDefectOrder().subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.transactionTypes = null;
        } else {
          let transaction = new Transaction();
          transaction.type = result.transactionTypes[0];
          this.getLastTransactionByType(transaction);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public addTransaction(type: TransactionType): void {

    if(!type.cashOpening && !type.cashClosing) {
      if (type.requestEmployee && type.requestArticles) {
        this.openModal('select-employee', type);
      } else if (type.requestCompany) {
          this.openModal('company', type);
      } else if (type.requestArticles) {
        if (this.transactionMovement !== TransactionMovement.Purchase) {
          let transaction = new Transaction();
          transaction.type = type;
          this.getLastTransactionByType(transaction);
        } else {
          this.openModal('transaction', type);
        }
      } else {
        this.openModal('transaction', type);
      }
    } else {
      this.openModal('cash-box', type);
    }
  }

  public openModal(
    op: string,
    typeTransaction?: TransactionType,
    transaction?: Transaction,
    printerSelected?: Printer,
    employeeType?: EmployeeType,
    company?: Company): void {

    let modalRef;

    switch (op) {
      case 'company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        modalRef.componentInstance.type = typeTransaction.requestCompany;
        modalRef.result.then(
          (result) => {
            if(result.company) {
              if (transaction) {
                transaction.company = result.company;
                this.updateTransaction(transaction, false);
              } else {
                transaction = new Transaction();
                transaction.type = typeTransaction;
                transaction.company = result.company;
                if (transaction.type.fixedOrigin && transaction.type.fixedOrigin !== 0) {
                  transaction.origin = transaction.type.fixedOrigin;
                }

                if (transaction.type.fixedLetter && transaction.type.fixedLetter !== '') {
                  transaction.letter = transaction.type.fixedLetter.toUpperCase();
                }
                this.getLastTransactionByType(transaction);
              }
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

        if ( !transaction ) {
          modalRef.componentInstance.transactionTypeId = typeTransaction._id;
        } else {
          modalRef.componentInstance.transactionId = transaction._id;
        }

        if(company) {
          modalRef.componentInstance.companyId = company._id;
        }

        modalRef.result.then(
          (result) => {
            transaction = result.transaction;
            if (transaction) {
              if (transaction.type && transaction.type.requestArticles) {
                this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
              } else if (transaction.type.requestPaymentMethods) {
                this.openModal('movement-of-cash', typeTransaction, transaction);
              } else {
                this.updateBalance(transaction);
              }
            } else if (result === "change-company") {
              this.openModal('company', typeTransaction, transaction);
            } else {
              this.refresh();
            }
          }, (reason) => {
            this.refresh();
          }
        );
        break;
      case 'movement-of-cash':
        modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result.movementsOfCashes) {
            this.updateBalance(transaction);
          } else {
            this.refresh();
          }
        }, (reason) => {
          this.refresh();
        });
        break;
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.componentInstance.company = transaction.company;
        modalRef.componentInstance.printer = printerSelected;
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
              this.openModal("print", transaction.type, transaction, result);
            } else {
              this.refresh();
            }
          }, (reason) => {
            this.refresh();
          });
        } else if (this.countPrinters() === 1) {
          this.openModal("print", transaction.type, transaction, this.printers[0]);
        }
        break;
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transactionId = transaction._id;
        break;
      case 'cancel-transaction':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
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
        modalRef.componentInstance.typeEmployee = employeeType;
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
        modalRef.componentInstance.typeEmployee = employeeType;
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
        modalRef.componentInstance.transactionType = typeTransaction;
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
        modalRef.componentInstance.op = 'select-employee';
        modalRef.componentInstance.typeEmployee = typeTransaction.requestEmployee;
        modalRef.result.then((result) => {
          if (result.employee) {
            if (transaction) {
              if (this.posType === "delivery") {
                transaction.state = TransactionState.Sent;
                transaction.employeeOpening = result.employee;
                this.updateTransaction(transaction, true);
              } else {
                transaction.employeeOpening = result.employee;
                this.updateTransaction(transaction, false);
              }
            } else {
              transaction = new Transaction();
              transaction.type = typeTransaction;
              transaction.employeeOpening = result.employee;
              if (transaction.type.fixedOrigin && transaction.type.fixedOrigin !== 0) {
                transaction.origin = transaction.type.fixedOrigin;
              }

              if (transaction.type.fixedLetter && transaction.type.fixedLetter !== '') {
                transaction.letter = transaction.type.fixedLetter.toUpperCase();
              }
              this.getLastTransactionByType(transaction);
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

  public getLastTransactionByType(transaction: Transaction): void {

    this.loading = true;

    this._transactionService.getLastTransactionByTypeAndOrigin(transaction.type, 0, transaction.letter).subscribe(
      result => {
        if (!result.transactions) {
          transaction.origin = 0;
          transaction.number = 1;
          this.saveTransaction(transaction);
        } else {
          transaction.origin = result.transactions[0].origin;
          transaction.number = result.transactions[0].number + 1;
          this.saveTransaction(transaction);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateBalance(transaction : Transaction){

    this.loading = true;

    this._transactionService.updateBalance(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          transaction.balance = result.transaction.balance;
          if (this.posType === "resto" || this.posType === "delivery") {
            transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
            transaction.VATPeriod = moment().format('YYYYMM');
          }
          transaction.expirationDate = transaction.endDate;
          transaction.state = TransactionState.Closed;
          this.updateTransaction(transaction);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
  }

  public saveTransaction(transaction: Transaction): void {

    this.loading = true;
    transaction.madein = this.posType;

    this._transactionService.saveTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.hideMessage();
          transaction = result.transaction;
          if (!transaction.employeeOpening &&
              transaction.type.requestEmployee &&
              transaction.type.requestArticles &&
              this.posType !== 'delivery') {
            this.openModal('select-employee', transaction.type, transaction);
          } else if (!transaction.company && transaction.type.requestCompany) {
              this.openModal('company', transaction.type, transaction);
          } else if (transaction.type.requestArticles) {
            if (this.transactionMovement !== TransactionMovement.Purchase) {
              this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
            } else {
              this.openModal('transaction', transaction.type, transaction);
            }
          } else {
            this.openModal('transaction', transaction.type, transaction);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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

  public openTransaction(transaction: Transaction): void {

    if (transaction.type && transaction.type.transactionMovement !== TransactionMovement.Purchase) {
      if (transaction.type.requestArticles) {
        this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
      } else {
        this.openModal('transaction', transaction.type, transaction);
      }
    } else {
      this.openModal('transaction', transaction.type, transaction);
    }
  }

  public updateTransaction(transaction: Transaction, close: boolean = true): void {

    this.loading = true;

    this._transactionService.updateTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          transaction = result.transaction;
          if(close) {
            if (transaction.type.printable) {
              if (transaction.type.defectPrinter) {
                this.openModal("print", transaction.type, transaction, transaction.type.defectPrinter);
              } else {
                this.openModal("printers", transaction.type, transaction);
              }
            } else {
              this.refresh();
            }
          } else {
            if (!transaction.employeeOpening &&
              transaction.type.requestEmployee &&
              transaction.type.requestArticles &&
              this.posType !== 'delivery') {
              this.openModal('select-employee', transaction.type, transaction);
            } else if (!transaction.company && transaction.type.requestCompany) {
                this.openModal('company', transaction.type, transaction);
            } else if (transaction.type.requestArticles) {
              if (this.transactionMovement !== TransactionMovement.Purchase) {
                this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
              } else {
                this.openModal('transaction', transaction.type, transaction);
              }
            } else {
              this.openModal('transaction', transaction.type, transaction);
            }
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public changeStateOfTransaction(transaction: Transaction, state: string): void {

    this.loading = true;

    if (state === "Enviado") {
      if(transaction.type.requestEmployee) {
        this.openModal('select-employee', transaction.type, transaction, null, transaction.type.requestEmployee);
      } else {
        transaction.state = TransactionState.Sent;
      }
    } else if (state === "Entregado") {
      transaction.state = TransactionState.Delivered;
    }

    transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    transaction.VATPeriod = moment().format('YYYYMM');
    transaction.expirationDate = transaction.endDate;

    this.updateTransaction(transaction);
  }

  public getEmployeeType(op: string, employeeType: string, transaction?: Transaction): void {

    this.loading = true;

    let query = 'where="description":"' + employeeType + '"';

    this._employeeTypeService.getEmployeeTypes(query).subscribe(
      result => {
        if (!result.employeeTypes) {
          this.showMessage("No existen empleados de tipo Repartidor", "info", true);
        } else {
          this.hideMessage();
          if(transaction) {
            this.openModal(op, transaction.type, transaction, null, result.employeeTypes[0]);
          } else {
            this.openModal(op, null, null, null, result.employeeTypes[0]);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
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
