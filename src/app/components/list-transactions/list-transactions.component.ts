
import {of as observableOf,  Observable } from 'rxjs';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction } from './../../models/transaction';
import { TransactionMovement, Movements } from './../../models/transaction-type';
import { Config } from './../../app.config';

import { TransactionService } from './../../services/transaction.service';
import { ConfigService } from './../../services/config.service'

import { DeleteTransactionComponent } from './../../components/delete-transaction/delete-transaction.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';
import { ExportCitiComponent } from '../export/export-citi/export-citi.component';
import { ExportIvaComponent } from '../export/export-iva/export-iva.component';

//Pipes
import { PrintComponent } from 'app/components/print/print/print.component';
import { PrinterService } from '../../services/printer.service';
import { Printer, PrinterPrintIn } from '../../models/printer';
import { RoundNumberPipe } from '../../pipes/round-number.pipe';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import { AuthService } from 'app/services/auth.service';
import { SendEmailComponent } from '../send-email/send-email.component';
import { ExportTransactionsComponent } from '../export/export-transactions/export-transactions.component';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.Emulated
})

export class ListTransactionsComponent implements OnInit {

  public transactions: Transaction[] = new Array();
  public config: Config;
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public listType: string;
  public orderTerm: string[] = ['-endDate'];
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage: number = 10;
  public totalItems: number = -1;
  public modules: Observable<{}>;
  public printers: Printer[];
  public roundNumber = new RoundNumberPipe();
  public transactionMovement: TransactionMovement;
  public allowResto: boolean;
  public currentPage: number = 0;
  public displayedColumns = [
      'type.transactionMovement',
      'type.name',
      'type.requestArticles',
      'type.allowEdit',
      'type.allowDelete',
      'type.electronics',
      'type.labelPrint',
      'origin',
      'letter',
      'number',
      'endDate',
      'company.name',
      'employeeClosing.name',
      'turnClosing.endDate',
      'cashBox.number',
      'madein',
      'state',
      'observation',
      'discountAmount',
      'totalPrice',
      'operationType',
      'CAE',
      'balance',
      'branchDestination._id',
      'branchDestination.number'
  ];
  public filters: any[];
  public filterValue: string;
  public userCountry: string;

  constructor(
    public _transactionService: TransactionService,
    public _configService: ConfigService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService,
    private _authService: AuthService
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
  }

  ngOnInit(): void {

    this.userCountry = Config.country;
    this._configService.getConfig.subscribe(
      config => {
        if(config && config.modules) {
          this.allowResto = config.modules.sale.resto;
        }
      }
    );
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.listType = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.modules = observableOf(Config.modules);
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

    this._authService.getIdentity.subscribe(
      async identity => {
        if(identity && identity.origin) {
          this.filters['branchDestination._id'] = identity.origin.branch._id;
        }
      }
    );

    this.getTransactions();
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

  public getTransactions(): void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux;
    if (this.orderTerm[0].charAt(0) === '-') {
        sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
    } else {
        sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
    }
    sortAux = JSON.parse(sortAux);

    // FILTRAMOS LA CONSULTA
    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        if (i < this.displayedColumns.length - 1) {
          match += ',';
        }
      }
    }

    if (match.charAt(match.length - 1) === '"' || match.charAt(match.length - 1) === '}')  {
      match += `,"type.transactionMovement": "${this.transactionMovement}", "operationType": { "$ne": "D" } }`;
    } else {
      match += `"type.transactionMovement": "${this.transactionMovement}", "operationType": { "$ne": "D" } }`;
    }
    match = JSON.parse(match);

    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "_id" : 1,
      origin: { $toString : "$origin" },
      letter: 1,
      number: { $toString : "$number" },
      endDate: { $dateToString: { date: "$endDate", format: "%d/%m/%Y", timezone: timezone }},
      madein: 1,
      state: 1,
      observation: 1,
      discountAmount: { $toString : '$discountAmount' },
      totalPrice: { $toString : '$totalPrice' },
      operationType: 1,
      CAE: 1,
      balance : 1,
      'company.name': 1,
      'company.emails' : 1,
      'employeeClosing.name': 1,
      'turnClosing.endDate': { $dateToString: { date: "$turnClosing.endDate", format: "%d/%m/%Y", timezone: timezone }},
      'cashBox.number': { $toString : "$cashBox.number" },
      'type.transactionMovement': 1,
      'type.name': 1,
      'type.labelPrint': 1,
      'type.requestArticles': 1,
      'type.allowEdit': 1,
      'type.allowDelete': 1,
      'type.electronics': 1,
      'type.defectPrinter': 1,
      'branchDestination._id': { $toString: '$branchDestination._id' },
      'branchDestination.number': 1
    }

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        transactions: { $push: '$$ROOT' }
    };

    let page = 0;
    if(this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ?
            (page * this.itemsPerPage) :
                0 // SKIP
    
    this._transactionService.getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        this.itemsPerPage, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result[0] && result[0].transactions) {
            this.transactions = result[0].transactions;
            this.totalItems = result[0].count;
        } else {
          this.transactions = new Array();
          this.totalItems = 0;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public pageChange(page): void {
      this.currentPage = page;
      this.getTransactions();
  }

  public orderBy(term: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-" + term;
    } else {
      this.orderTerm[0] = term;
    }

    this.getTransactions();
  }

  public refresh(): void {
      this.getTransactions();
  }

  public openModal(op: string, transaction: Transaction): void {

    let modalRef;
    switch (op) {
      case 'view':
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = transaction._id;
        break;
      case 'edit':
        modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.result.then((result) => {
          if (result.transaction) {
            this.getTransactions();
          }
        }, (reason) => {

        });
        break;
      case 'print':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.company = transaction.company;
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.componentInstance.typePrint = 'invoice';
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
        /*modalRef = this._modalService.open(PrintTransactionTypeComponent)
        modalRef.componentInstance.transactionId = transaction._id*/
        break;
      case 'delete':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.op = op;
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
              this.getTransactions();
          }
        }, (reason) => {

        });
        break;
      case 'send-email':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.company = transaction.company;
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.componentInstance.typePrint = 'invoice';
        modalRef.componentInstance.source = "mail";
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
          
        modalRef = this._modalService.open(SendEmailComponent);
        if(transaction.company && transaction.company.emails) {
          modalRef.componentInstance.emails = transaction.company.emails;
        }
        let labelPrint = transaction.type.name;
        if(transaction.type.labelPrint) {
          labelPrint = transaction.type.labelPrint;
        }
        modalRef.componentInstance.subject = `${labelPrint} ${this.padNumber(transaction.origin, 4)}-${transaction.letter}-${this.padNumber(transaction.number, 8)}`;
        if(transaction.type.electronics){
          modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente http://${Config.database}.poscloud.com.ar:300/api/print/invoice/` + transaction._id;
        } else {
          modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente http://${Config.database}.poscloud.com.ar:300/api/print/others/` + transaction._id;
        }
        
        break;
      case "export":
        
        modalRef = this._modalService.open(ExportTransactionsComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionMovement = this.transactionMovement
        break;
      default: ;
    }
  };

  public padNumber(n, length) : string{
    
    var n = n.toString();
    while (n.length < length)
        n = "0" + n;
    return n;
  }

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

  public exportIVA(): void {

    let modalRef = this._modalService.open(ExportIvaComponent);
    modalRef.componentInstance.type = this.listType;
    modalRef.result.then((result) => {
      if (result === 'export') {
      }
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
