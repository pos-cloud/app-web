import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Transaction, TransactionState } from './../../models/transaction';
import { TransactionService } from './../../services/transaction.service';

import { AddSaleOrderComponent } from './../../components/add-sale-order/add-sale-order.component';
import { DeleteTransactionComponent } from './../../components/delete-transaction/delete-transaction.component';

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
  public orderTerm: string[] = ['number'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage: number = 10;

  constructor(
    public _transactionService: TransactionService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getTransactions();
  }

  public getTransactions(): void {  

    this.loading = true;
    
    this._transactionService.getTransactions().subscribe(
      result => {
        if(!result.transactions) {
          this.showMessage(result.message, "info", true); 
          this.loading = false;
          this.transactions = null;
          this.areTransactionsEmpty = true;
        } else {
          this.hideMessage();
          this.loading = false;
          this.transactions = result.transactions;
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
      case 'delete' :
          modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' })
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

  public addTransaction(transactionCode: number) {
    this._router.navigate(['/pos/mesas/'+transactionCode+'/add-transaction']);
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