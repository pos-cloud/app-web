import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction } from './../../models/transaction';
import { TransactionMovement, Movements } from './../../models/transaction-type';
import { Config } from './../../app.config';

import { TransactionService } from './../../services/transaction.service';

import { DeleteTransactionComponent } from './../../components/delete-transaction/delete-transaction.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';
import { ExportCitiComponent } from './../../components/export-citi/export-citi.component';

//Pipes
import { PrintComponent } from 'app/components/print/print.component';
import { PrinterService } from '../../services/printer.service';
import { Printer, PrinterPrintIn } from '../../models/printer';
import { RoundNumberPipe } from '../../pipes/round-number.pipe';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTransactionsComponent implements OnInit {

  public transactions: Transaction[] = new Array();
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public listType: string;
  public orderTerm: string[] = ['-endDate'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage: number = 10;
  public totalItems = 0;
  public modules: Observable<{}>;
  public printers: Printer[];
  public roundNumber = new RoundNumberPipe();
  public transactionMovement: TransactionMovement;

  constructor(
    public _transactionService: TransactionService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.listType = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.modules = Observable.of(Config.modules);
    this.getPrinters();
    if (this.listType === "Compras") {
      this.transactionMovement = TransactionMovement.Purchase;
    } else if (this.listType === "Ventas") {
      this.transactionMovement = TransactionMovement.Sale;
    } else if (this.listType === "Stock") {
      this.transactionMovement = TransactionMovement.Stock;
    } else if (this.listType === "Fondos") {
      this.transactionMovement = TransactionMovement.Money;
    }
    this.getTransactionsByMovement();
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = new Array();
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

  public getTransactionsByMovement(): void {

    this.loading = true;

    this._transactionService.getTransactionsByMovement(this.transactionMovement).subscribe(
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

  public orderBy(term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  public refresh(): void {
    this.getTransactionsByMovement();
  }

  public openModal(op: string, transaction: Transaction): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        break;
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transaction = transaction;
        modalRef.componentInstance.company = transaction.company;
        if(transaction.type.name === "Cobro"){
          modalRef.componentInstance.typePrint = 'cobro';
        } else {
          modalRef.componentInstance.typePrint = 'invoice';
        }
        if (this.printers && this.printers.length > 0) {
          for(let printer of this.printers) {
            if (printer.printIn === PrinterPrintIn.Counter) {
              modalRef.componentInstance.printer = printer;
            }
          }
        }
        break;
      case 'cancel':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getTransactionsByMovement();
          }
        }, (reason) => {

        });
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.op = op;
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
            this.getTransactionsByMovement();
          }
        }, (reason) => {

        });
        break;
      default: ;
    }
  };

  public calculateTotal(transactions: Transaction[], col, format): string {

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

    return this.roundNumber.transform(total);
  }

  public exportCiti(): void {

    let modalRef = this._modalService.open(ExportCitiComponent);
    modalRef.componentInstance.transactionMovement = this.transactionMovement;
    modalRef.result.then((result) => {

    }, (reason) => {

    });
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
