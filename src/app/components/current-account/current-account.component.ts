//Paquetes Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { Company } from './../../models/company';
import { MovementOfCash } from './../../models/movement-of-cash';

//Services
import { CompanyService } from './../../services/company.service';
import { TransactionService } from './../../services/transaction.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { MovementOfCashService } from './../../services/movement-of-cash.service';

//Componentes
import { AddTransactionComponent } from './../add-transaction/add-transaction.component';
import { AddMovementOfCashComponent } from './../add-movement-of-cash/add-movement-of-cash.component';
import { ListCompaniesComponent } from 'app/components/list-companies/list-companies.component';
import { PrintComponent } from 'app/components/print/print.component';
import { Printer, PrinterPrintIn } from '../../models/printer';
import { PrinterService } from '../../services/printer.service';
import { ViewTransactionComponent } from '../view-transaction/view-transaction.component';
import { RoundNumberPipe } from 'app/pipes/round-number.pipe';

@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.css'],
  providers: [NgbAlertConfig]
})

export class CurrentAccountComponent implements OnInit {

  public transactions: Transaction[];
  public companySelected: Company;
  public movementsOfCashes: MovementOfCash[];
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[] = new Array();
  public balance: number = 0;
  public currentPage: number = 1;
  public roundNumber: RoundNumberPipe;
  public startDate: string;
  public endDate: string;
  public printers: Printer[];

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfCashService: MovementOfCashService,
    public _companyService: CompanyService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
  ) {
    this.movementsOfCashes = new Array();
    this.roundNumber = new RoundNumberPipe();
    this.startDate = moment('1990-01-01').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (pathLocation[4]) {
      this.getCompany(pathLocation[4]);
    } else {
      this.openModal('company');
    }
  }

  public getSummary(): void {

    this.loading = true;

    let query = {
      company: this.companySelected._id,
      startDate: this.startDate,
      endDate: this.endDate
    }

    this._companyService.getSummaryOfAccountsByCompany(JSON.stringify(query)).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.items = null;
          this.totalItems = 0;
        } else {
          this.hideMessage();
          this.items = result;
          this.totalItems = this.items.length;
          this.currentPage = this.roundNumber.transform(this.totalItems / this.itemsPerPage + 0.5, 0);
          this.getBalance();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCompany(companyId: string): void {

    this.loading = true;

    this._companyService.getCompany(companyId).subscribe(
      result => {
        if (!result.company) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.companySelected = result.company;
          this.getSummary();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {

    if (this.companySelected) {
      this.getSummary();
    } else {
      this.showMessage("Debe seleccionar una empresa", 'info', true);
    }
  }

  public getBalance(): void {

    this.balance = 0;

    for(let i = 0; i < this.items.length; i++) {
      if (this.items[i].isCurrentAccount || this.items[i].typeCurrentAccount !== "No") {
        this.balance += this.items[i].debe;
        this.balance -= this.items[i].haber;
        this.items[i].balance = (this.items[i].debe - this.items[i].haber);
        if(this.items[i-1]) {
          this.items[i].balance += this.items[i-1].balance;
        }
      }
    }
  }

  public openModal(op: string, transaction?: Transaction): void {

    
      
    let modalRef;
    switch (op) {
      case 'transaction':
        modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg' });
        if(this.balance < 0) {
          transaction.totalPrice = this.balance * (-1);
        }
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then(
          (result) => {
            if (result.transaction) {
              this.openModal('movement-of-cash', result.transaction);
            }
          }, (reason) => {

          }
        );
        break;
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
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

        });
        break;
      case 'company':
        modalRef = this._modalService.open(ListCompaniesComponent, { size: 'lg' });
        let pathLocation: string[] = this._router.url.split('/');
        let companyType = pathLocation[3].charAt(0).toUpperCase() + pathLocation[3].slice(1);
        modalRef.componentInstance.type = companyType;
        modalRef.componentInstance.userType = 'pos';
        modalRef.result.then(
          (result) => {
            if (result.company) {
              this.companySelected = result.company;
              this.getSummary();
            }
          }, (reason) => {
          }
        );
        break;
      case 'print':
        if (this.companySelected) {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.items = this.items;
          modalRef.componentInstance.company = this.companySelected;
          modalRef.componentInstance.typePrint = 'current-account';
          modalRef.componentInstance.balance = this.balance;
        } else {
          this.showMessage("Debe seleccionar una empresa",'info', true);
        }
        break;
      case 'printTransaction':

        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transaction = transaction;
        modalRef.componentInstance.company = this.companySelected;
        if(!transaction.type.requestArticles){
          modalRef.componentInstance.typePrint = 'cobro';
        } else {
          modalRef.componentInstance.typePrint = 'invoice';
        }
        if (transaction.type.defectPrinter) {
          modalRef.componentInstance.printer = transaction.type.defectPrinter;
        } else {
          if (this.printers && this.printers.length > 0) {
            for(let printer of this.printers) {
              if (printer.printIn === PrinterPrintIn.Counter) {
                modalRef.componentInstance.printer = printer;
              }
            }
          }
        }
       break;
      default: ;
    }
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

  public getTransaction(transactionId: string, op: string): void {

    this.loading = true;

    this._transactionService.getTransaction(transactionId).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, 'danger', false);
          this.loading = false;
        } else {
          this.hideMessage();
          if (op === 'view'){
            this.openModal('view-transaction', result.transaction);
          } else if (op === 'print'){
            this.openModal('printTransaction',result.transaction);
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

  public addTransaction(type: string): void {
    if (this.companySelected) {
      this.getTransactionTypeByName(type);
    } else {
      this.showMessage("Debe seleccionar una empresa", 'info', true);
    }
  }

  public getTransactionTypeByName(name: string): void {

    this._transactionTypeService.getTransactionTypeByName(name).subscribe(
      result => {
        if (!result.transactionTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          let transaction = new Transaction();
          transaction.company = this.companySelected;
          transaction.type = result.transactionTypes[0];
          this.openModal('transaction', transaction);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateTransaction(transaction: Transaction): void {

    this.loading = true;

    this._transactionService.updateTransaction(transaction).subscribe(
      result => {
        if (!result.transaction) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.refresh();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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
