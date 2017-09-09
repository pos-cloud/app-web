import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';
import { Room } from './../../models/room';
import { Transaction } from './../../models/transaction';
import { TransactionType, TransactionTypeState, TransactionTypeMovements, CurrentAcount } from './../../models/transaction-type';
import { PaymentMethod } from './../../models/payment-method';

import { CashBoxService } from './../../services/cash-box.service';
import { RoomService } from './../../services/room.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { PaymentMethodService } from './../../services/payment-method.service';

import { AddTransactionComponent } from './../add-transaction/add-transaction.component';

@Component({
  selector: 'app-point-of-sale',
  templateUrl: './point-of-sale.component.html',
  styleUrls: ['./point-of-sale.component.css'],
  providers: [NgbAlertConfig]
})

export class PointOfSaleComponent implements OnInit {

  public cashBox: CashBox;
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

  constructor(
    public _cashBoxService: CashBoxService,
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

    this._transactionService.getOpenTransaction().subscribe(
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
    this._router.navigate(['/pos/mostrador/agregar-pedido']);
  } 
  
  public addTransaction(type: string): void {
    this.openModal('transaction', type);
  }

  public openModal(op: string, typeTransaction?: string): void {

    let modalRef;

    switch (op) {
      case 'transaction':
        modalRef = this._modalService.open(AddTransactionComponent , { size: 'lg' });
        modalRef.componentInstance.type = typeTransaction;
        modalRef.result.then((result) => {
          if (result === "transaction") {
            this.showMessage("La transacción se ha añadido con éxito.", "success", true);
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  }

  public updateTransaction(transactionId: string): void {
    this._router.navigate(['/pos/mostrador/editar-pedido/' + transactionId]);
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