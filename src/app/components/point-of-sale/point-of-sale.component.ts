import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/pt-br';

import { Employee } from './../../models/employee';
import { Turn, TurnState } from './../../models/turn';
import { Room } from './../../models/room';
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType, TransactionTypeState, TransactionTypeMovements, CurrentAcount } from './../../models/transaction-type';
import { PaymentMethod } from './../../models/payment-method';

import { RoomService } from './../../services/room.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { PaymentMethodService } from './../../services/payment-method.service';
import { TurnService } from './../../services/turn.service';

import { AddTransactionComponent } from './../add-transaction/add-transaction.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { SelectEmployeeComponent } from './../select-employee/select-employee.component';

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
          transactionType.movement = TransactionTypeMovements.Outflows;
          transactionType.name = "Orden de Pedido";
          transactionType.state = TransactionTypeState.Enabled;
          this._transactionTypeService.saveTransactionType(transactionType).subscribe(
            result => {
              if (!result.transactionType) {
                this.showMessage(result.message, "info", true);
              } else {
                let transactionType = new TransactionType();
                transactionType.currentAccount = CurrentAcount.Cobra;
                transactionType.movement = TransactionTypeMovements.Inflows;
                transactionType.name = "Cobro";
                transactionType.state = TransactionTypeState.Enabled;
                this._transactionTypeService.saveTransactionType(transactionType).subscribe(
                  result => {
                    if (!result.transactionType) {
                      this.showMessage(result.message, "info", true);
                    } else {
                      let transactionType = new TransactionType();
                      transactionType.currentAccount = CurrentAcount.Yes;
                      transactionType.movement = TransactionTypeMovements.Inflows;
                      transactionType.name = "Nota de Crédito";
                      transactionType.state = TransactionTypeState.Enabled;
                      this._transactionTypeService.saveTransactionType(transactionType).subscribe(
                        result => {
                          if (!result.transactionType) {
                            this.showMessage(result.message, "info", true);
                          } else {
                            let transactionType = new TransactionType();
                            transactionType.currentAccount = CurrentAcount.Yes;
                            transactionType.movement = TransactionTypeMovements.Inflows;
                            transactionType.name = "Saldo Inicial";
                            transactionType.state = TransactionTypeState.Enabled;
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
          paymentMethod.name = "Efectivo";
          this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
            result => {
              if (!result.paymentMethod) {
                this.showMessage(result.message, "info", true);
              } else {
                let paymentMethod = new PaymentMethod();
                paymentMethod.name = "Cuenta Corriente";
                this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
                  result => {
                    if (!result.paymentMethod) {
                      this.showMessage(result.message, "info", true);
                    } else {
                      let paymentMethod = new PaymentMethod();
                      paymentMethod.name = "Tarjeta de Crédito";
                      this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
                        result => {
                          if (!result.paymentMethod) {
                            this.showMessage(result.message, "info", true);
                          } else {
                            let paymentMethod = new PaymentMethod();
                            paymentMethod.name = "Tarjeta de Débito";
                            this._paymentMethodService.savePaymentMethod(paymentMethod).subscribe(
                              result => {
                                if (!result.paymentMethod) {
                                  this.showMessage(result.message, "info", true);
                                } else {
                                  let paymentMethod = new PaymentMethod();
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
  
  public addSaleOrder(): void {
    this._router.navigate(['/pos/' + this.posType + '/agregar-pedido']);
  } 
  
  public addTransaction(type: string): void {
    this.openModal('transaction', type);
  }

  public openModal(op: string, typeTransaction?: string, transaction: Transaction = undefined): void {

    let modalRef;

    switch (op) {
      case 'transaction':
        modalRef = this._modalService.open(AddTransactionComponent , { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.componentInstance.type = typeTransaction;
        modalRef.result.then(
          (result) => {
            if (typeof(result) === "object") {
              this.openModal('movement-of-cash', typeTransaction, result);
            }
          }, (reason) => {

          }
        );
        break;
      case 'movement-of-cash':
        modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result === "add-movement-of-cash") {
            transaction.state = TransactionState.Closed;
            this.updateTransaction(transaction);
          }
        }, (reason) => {

        });
        break;
      case 'open-turn':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = true;
        modalRef.componentInstance.op = 'open';
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
        modalRef.componentInstance.op = 'close';
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

    if(transaction.type.name === "Orden de Pedido") {
      this._router.navigate(['/pos/' + this.posType + '/editar-pedido/' + transaction._id]);
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

    if(state === "Enviado") {
      transaction.state = TransactionState.Sent;
    } else if (state === "Entregado") {
      transaction.state = TransactionState.Delivered;
    }

    transaction.endDate = moment().locale('es').format('YYYY/MM/DD') + " " + moment().locale('es').format('LTS');
    
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