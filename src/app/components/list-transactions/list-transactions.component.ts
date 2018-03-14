import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction, TransactionState } from './../../models/transaction';
import { Movements } from './../../models/transaction-type';
import { TransactionService } from './../../services/transaction.service';
import { Config } from './../../app.config';

import { AddSaleOrderComponent } from './../../components/add-sale-order/add-sale-order.component';
import { DeleteTransactionComponent } from './../../components/delete-transaction/delete-transaction.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';
import { ExportReceComponent } from './../../components/export-rece/export-rece.component';

//Pipes
import { DecimalPipe } from '@angular/common';
import { PrintComponent } from 'app/components/print/print.component';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTransactionsComponent implements OnInit {

  public transactions: Transaction[] = new Array();
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = "";
  public userType: string;
  public posType: string;
  public orderTerm: string[] = ['-endDate'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage: number = 10;
  public totalItems = 0;
  public modules;

  constructor(
    public _transactionService: TransactionService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    this.modules = Config.modules[0];
    this.getTransactions();
  }

  public getTransactions(): void {  

    this.loading = true;
    
    this._transactionService.getTransactions().subscribe(
      result => {
        if(!result.transactions) {
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

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getTransactions();
  }
  
  public openModal(op: string, transaction:Transaction): void {

    let modalRef;
    switch(op) {
      case 'view':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        break;
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transaction = transaction;
        modalRef.componentInstance.company = transaction.company;
        modalRef.componentInstance.typePrint = 'invoice';
        break;
      case 'cancel' :
          modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
          modalRef.componentInstance.transaction = transaction;
          modalRef.result.then((result) => {
            if(result === 'delete_close') {
              this.getTransactions();
            }
          }, (reason) => {
            
          });
        break;
      default : ;
    }
  };

  public calculateTotal(transactions: Transaction[], col, format): string {

    let decimalPipe = new DecimalPipe('ARS');
    let total = 0;
    if (transactions) {
      for(let transaction of transactions) {
        if (transaction[col]) {
          if (transaction.type.movement === Movements.Outflows) {
            total -= transaction[col];
          } else {
            total += transaction[col];
          }
        }
      }
    }

    return decimalPipe.transform(total, format);
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }

  public exportRece(): void {
    
    let modalRef;

    modalRef = this._modalService.open(ExportReceComponent, { size: 'lg' });
    modalRef.result.then((result) => {
      if(result === 'export') {
      }
    }, (reason) => {
      
    });
  }
}