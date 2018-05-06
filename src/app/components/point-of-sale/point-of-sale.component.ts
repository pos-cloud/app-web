import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Employee } from './../../models/employee';
import { Turn, TurnState } from './../../models/turn';
import { Room } from './../../models/room';
import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionType, Movements, CurrentAcount, CodeAFIP, RequestArticles, DefectOrders, TransactionMovement } from './../../models/transaction-type';
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
import { CompanyType } from '../../models/company';

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
    this.transactionTypes = new Array();
  }

  ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    if (pathLocation[3] === "venta") {
      this.transactionMovement = TransactionMovement.Sale;
    } else if (pathLocation[3] === "compra") {
      this.transactionMovement = TransactionMovement.Purchase;
    } else if (pathLocation[3] === "stock") {
      this.transactionMovement = TransactionMovement.Stock;
    }

    this.getTransactionTypesByMovement();

    if (this.posType === "resto") {
      this.roomSelected._id = pathLocation[4];
      this.getRooms();
    } else if (this.posType === "delivery") {
      this.getOpenTransactions();
    } else if (this.posType === "mostrador") {
      this.getOpenTransactionsByMovement(this.transactionMovement);
    }
  }

  public getTransactionTypesByMovement(): void {
    
    this.loading = true;

    this._transactionTypeService.getTransactionTypesByMovement(this.transactionMovement).subscribe(
      result => {
        if (!result.transactionTypes) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.transactionTypes = result.transactionTypes;
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
            if(result.message && result.message !== "") this.showMessage(result.message, "info", true); 
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
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
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

  public getOpenTransactionsByMovement(transactionMovement: TransactionMovement): void {

    this.loading = true;

    this._transactionService.getOpenTransactionsByMovement(transactionMovement).subscribe(
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
        this.showMessage(error._body, "danger", false);
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

  public addSaleOrder(posType: string): void {
    this.getDefectOrder(posType);
  }

  public getDefectOrder(posType: string): void {

    this.loading = true;

    this._transactionTypeService.getDefectOrder().subscribe(
      result => {
        if (!result.transactionTypes) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
          this.transactionTypes = null;
        } else {
          this._router.navigate(['/pos/' + posType + '/agregar-transaccion/' + result.transactionTypes[0]._id]);
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
  
  public addTransaction(type: TransactionType): void {
    if(type.requestArticles === RequestArticles.Yes) {
      this._router.navigate(['/pos/' + this.posType + '/agregar-transaccion/' + type._id]);
    } else {
      this.openModal('company', type);
    }
  }

  public openModal(op: string, typeTransaction?: TransactionType, transaction: Transaction = undefined): void {

    let modalRef;

    switch (op) {
      case 'company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        if (typeTransaction.transactionMovement === TransactionMovement.Purchase) {
          modalRef.componentInstance.type = CompanyType.Provider;
        } else if (typeTransaction.transactionMovement === TransactionMovement.Sale) {
          modalRef.componentInstance.type = CompanyType.Client;
        }
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
        transaction.type = typeTransaction;
        modalRef.componentInstance.transaction = transaction;
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
    
    if(transaction.type.requestArticles === RequestArticles.Yes) {
      this._router.navigate(['/pos/' + this.posType + '/editar-transaccion/' + transaction._id]);
    } else {
      this.openModal('transaction', transaction.type, transaction);
    }   
  }

  public updateTransaction(transaction: Transaction): void {
    
    this.loading = true;
    
    this._transactionService.updateTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
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