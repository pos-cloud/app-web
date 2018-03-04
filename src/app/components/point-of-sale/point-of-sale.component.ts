import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Employee } from './../../models/employee';
import { Turn, TurnState } from './../../models/turn';
import { Room } from './../../models/room';
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType, TransactionTypeMovements, CurrentAcount, CodeAFIP } from './../../models/transaction-type';
import { PaymentMethod } from './../../models/payment-method';

import { RoomService } from './../../services/room.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { PaymentMethodService } from './../../services/payment-method.service';
import { TurnService } from './../../services/turn.service';

import { AddTransactionComponent } from './../add-transaction/add-transaction.component';
import { DeleteTransactionComponent } from './../delete-transaction/delete-transaction.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';
import { ListCompaniesComponent } from 'app/components/list-companies/list-companies.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';

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
  public userType: string;
  public propertyTerm: string;
  public orderTerm: string[] = ['number'];
  public posType: string;
  public existsCashBoxOpen: boolean = false;
  public alertMessage: string = "";
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _turnService: TurnService,
    public _roomService: RoomService,
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _paymentMethodService: PaymentMethodService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.roomSelected = new Room();
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];

    this.getTransactionTypes();
    this.getPaymentMethods();

    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {
      this.getOpenTransactions();
    } else if (this.posType === "mostrador") {
      this.getOpenTransactions();
    }
  }

  public getTransactionTypes(): void {

    this._transactionTypeService.getTransactionTypes().subscribe(
      result => {
        if (!result.transactionTypes){
          this.loading = true;
          let transactionType = new TransactionType();
          transactionType.currentAccount = CurrentAcount.Yes;
          transactionType.movement = TransactionTypeMovements.Inflows;
          transactionType.name = "Ticket";
          transactionType.electronics = "No";
          this._transactionTypeService.saveTransactionType(transactionType).subscribe(
            result => {
              if (!result.transactionType) {
                this.showMessage(result.message, "info", true);
              } else {
                let transactionType = new TransactionType();
                transactionType.currentAccount = CurrentAcount.Cobra;
                transactionType.movement = TransactionTypeMovements.Inflows;
                transactionType.name = "Cobro";
                transactionType.electronics = "No";
                transactionType.fixedLetter = "X";
                this._transactionTypeService.saveTransactionType(transactionType).subscribe(
                  result => {
                    if (!result.transactionType) {
                      this.showMessage(result.message, "info", true);
                    } else {
                      let transactionType = new TransactionType();
                      transactionType.currentAccount = CurrentAcount.Yes;
                      transactionType.movement = TransactionTypeMovements.Outflows;
                      transactionType.name = "Nota de Crédito";
                      transactionType.electronics = "No";
                      this._transactionTypeService.saveTransactionType(transactionType).subscribe(
                        result => {
                          if (!result.transactionType) {
                            this.showMessage(result.message, "info", true);
                          } else {
                            let transactionType = new TransactionType();
                            transactionType.currentAccount = CurrentAcount.Yes;
                            transactionType.movement = TransactionTypeMovements.Outflows;
                            transactionType.name = "Saldo Inicial (+)";
                            transactionType.electronics = "No";
                            transactionType.fixedLetter = "X";
                            this._transactionTypeService.saveTransactionType(transactionType).subscribe(
                              result => {
                                if (!result.transactionType) {
                                  this.showMessage(result.message, "info", true);
                                } else {
                                  let transactionType = new TransactionType();
                                  transactionType.currentAccount = CurrentAcount.Yes;
                                  transactionType.movement = TransactionTypeMovements.Inflows;
                                  transactionType.name = "Saldo Inicial (-)";
                                  transactionType.electronics = "No";
                                  transactionType.fixedLetter = "X";
                                  this._transactionTypeService.saveTransactionType(transactionType).subscribe(
                                    result => {
                                      if (!result.transactionType) {
                                        this.showMessage(result.message, "info", true);
                                      } else {
                                        let transactionType = new TransactionType();
                                        transactionType.currentAccount = CurrentAcount.Yes;
                                        transactionType.movement = TransactionTypeMovements.Inflows;
                                        transactionType.name = "Factura";
                                        transactionType.electronics = "Si";
                                        let codes = new Array();
                                        let codeA = new CodeAFIP();
                                        codeA.letter = "A";
                                        codeA.code = 1;
                                        codes.push(codeA);
                                        let codeB = new CodeAFIP();
                                        codeB.letter = "B";
                                        codeB.code = 6;
                                        codes.push(codeB);
                                        let codeC = new CodeAFIP();
                                        codeC.letter = "C";
                                        codeC.code = 11;
                                        codes.push(codeC);
                                        transactionType.codes = codes;
                                        this._transactionTypeService.saveTransactionType(transactionType).subscribe(
                                          result => {
                                            if (!result.transactionType) {
                                              this.showMessage(result.message, "info", true);
                                            } else {
                                              this.hideMessage();
                                            }
                                            this.loading = false;
                                          },
                                          error => {
                                            this.showMessage(error._body, "danger", false);
                                            this.loading = false;
                                          }
                                        );
                                      }
                                      this.loading = false;
                                    },
                                    error => {
                                      this.showMessage(error._body, "danger", false);
                                      this.loading = false;
                                    }
                                  );
                                }
                                this.loading = false;
                              },
                              error => {
                                this.showMessage(error._body, "danger", false);
                                this.loading = false;
                              }
                            );
                          }
                          this.loading = false;
                        },
                        error => {
                          this.showMessage(error._body, "danger", false);
                          this.loading = false;
                        }
                      );
                    }
                    this.loading = false;
                  },
                  error => {
                    this.showMessage(error._body, "danger", false);
                    this.loading = false;
                  }
                );
              this.loading = false;
              }
            },
            error => {
              this.showMessage(error._body, "danger", false);
              this.loading = false;
            }
          );
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getPaymentMethods(): void {

    this.loading = true;

    this._paymentMethodService.getPaymentMethods().subscribe(
      result => {
        if (!result.paymentMethods){
          let paymentMethod = new PaymentMethod();
          paymentMethod.code = 1;
          paymentMethod.name = "Efectivo";
          this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
            result => {
              if (!result.paymentMethod) {
                this.showMessage(result.message, "info", true);
              } else {
                let paymentMethod = new PaymentMethod();
                paymentMethod.code = 2;
                paymentMethod.name = "Cuenta Corriente";
                this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
                  result => {
                    if (!result.paymentMethod) {
                      this.showMessage(result.message, "info", true);
                    } else {
                      let paymentMethod = new PaymentMethod();
                      paymentMethod.code = 3;
                      paymentMethod.name = "Tarjeta de Crédito";
                      this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
                        result => {
                          if (!result.paymentMethod) {
                            this.showMessage(result.message, "info", true);
                          } else {
                            let paymentMethod = new PaymentMethod();
                            paymentMethod.code = 4;
                            paymentMethod.name = "Tarjeta de Débito";
                            this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
                              result => {
                                if (!result.paymentMethod) {
                                  this.showMessage(result.message, "info", true);
                                } else {
                                  let paymentMethod = new PaymentMethod();
                                  paymentMethod.code = 5;
                                  paymentMethod.name = "Cheque de Terceros";
                                  this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
                                    result => {
                                      if (!result.paymentMethod) {
                                        this.showMessage(result.message, "info", true);
                                      } else {
                                        this.hideMessage();
                                      }
                                      this.loading = false;
                                    },
                                    error => {
                                      this.showMessage(error._body, "danger", false);
                                      this.loading = false;
                                    }
                                  );
                                }
                                this.loading = false;
                              },
                              error => {
                                this.showMessage(error._body, "danger", false);
                                this.loading = false;
                              }
                            );
                          }
                          this.loading = false;
                        },
                        error => {
                          this.showMessage(error._body, "danger", false);
                          this.loading = false;
                        }
                      );
                    }
                    this.loading = false;
                  },
                  error => {
                    this.showMessage(error._body, "danger", false);
                    this.loading = false;
                  }
                );
              this.loading = false;
              }
            },
            error => {
              this.showMessage(error._body, "danger", false);
              this.loading = false;
            }
          );
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getRooms(): void {  

    this.loading = true;
    
    this._roomService.getRooms().subscribe(
        result => {
          if(!result.rooms) {
            this.showMessage(result.message, "info", true); 
            this.loading = false;
          } else {
            this.hideMessage();
            this.loading = false;
            this.rooms = result.rooms;
            
            if(this.roomSelected._id === undefined){
              this.roomSelected = this.rooms[0];
            } else {
              for(let room of this.rooms) {
                if(this.roomSelected._id === room._id){
                  this.roomSelected = room;
                }
              }
            }
            this.existsCashBoxOpen = true;
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          this.loading = false;
        }
      );
  }

  public getOpenTransactions(): void {

    this.loading = true;

    this._transactionService.getOpenTransaction(this.posType).subscribe(
      result => {
        if (!result.transactions) {
          this.showMessage(result.message, "info", true);
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
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    this.getOpenTransactions();
  }
  
  public addSaleOrder(type: string): void {
    this._router.navigate(['/pos/' + this.posType + '/agregar-' + type]);
  }
  
  public addTransaction(type: string): void {
    this.openModal('company', type);
  }

  public openModal(op: string, typeTransaction?: string, transaction: Transaction = undefined): void {

    let modalRef;

    switch (op) {
      case 'company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        modalRef.result.then(
          (result) => {
            if (typeof (result) === "object") {
              if(!transaction) {
                transaction = new Transaction();
              }
              transaction.company = result;
              this.openModal('transaction', typeTransaction, transaction);
            }
          }, (reason) => {

          }
        );
        break;
      case 'transaction':
        modalRef = this._modalService.open(AddTransactionComponent , { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.componentInstance.type = typeTransaction;
        modalRef.result.then(
          (result) => {
            if (typeof(result) === "object") {
              this.openModal('movement-of-cash', typeTransaction, result);
            } else if (result === "change-company") {
              this.openModal('company', typeTransaction, transaction);
            }
          }, (reason) => {

          }
        );
        break;
      case 'movement-of-cash':
        modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (typeof result == 'object') {
            if (result.amountPaid > transaction.totalPrice && result.type.name === "Tarjeta de Crédito") {
              transaction.totalPrice = result.amountPaid;
            }
            transaction.state = TransactionState.Closed;
            this.updateTransaction(transaction);
          }
        }, (reason) => {
          this.getOpenTransactions();
        });
        break;
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        break;
      case 'cancel-transaction':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result === "delete_close") {
            this.getOpenTransactions();
          }
        }, (reason) => {

        });
        break;
      case 'open-turn':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = true;
        modalRef.componentInstance.op = 'open-turn';
        modalRef.result.then((result) => {
          if (typeof result == "object") {
            this.showMessage("El turno se ha abierto correctamente", "success", true);
          }
        }, (reason) => {

        });
        break;
      case 'close-turn':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = true;
        modalRef.componentInstance.op = 'close-turn';
        modalRef.result.then((result) => {
          if (typeof result == "object") {
            this.showMessage("El turno se ha cerrado correctamente", "success", true);
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  }

  public openTransaction(transaction: Transaction): void {
    
    if(transaction.type.name === "Ticket") {
      this._router.navigate(['/pos/' + this.posType + '/editar-ticket/' + transaction._id]);
    } else if (transaction.type.name === "Factura") {
      this._router.navigate(['/pos/' + this.posType + '/editar-factura/' + transaction._id]);
    } else if (transaction.type.name === "Nota de Crédito") {
      this._router.navigate(['/pos/' + this.posType + '/editar-nota-credito/' + transaction._id]);
    } else {
      this.openModal('transaction', transaction.type.name, transaction);
    }   
  }

  public updateTransaction(transaction: Transaction): void {
    
    this.loading = true;
    
    this._transactionService.updateTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.refresh();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public changeStateOfTransaction(transaction: Transaction, state: string): void {

    this.loading = true;

    if (state === "Enviado") {
      transaction.state = TransactionState.Sent;
    } else if (state === "Entregado") {
      transaction.state = TransactionState.Delivered;
    }

    transaction.endDate = moment().format('DD/MM/YYYY HH:mm:ss');

    this.updateTransaction(transaction);
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
    this.alertMessage = "";
  }
}