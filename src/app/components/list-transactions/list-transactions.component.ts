import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction } from './../../models/transaction';
import { TransactionMovement, Movements } from './../../models/transaction-type';
import { Config } from './../../app.config';

import { TransactionService } from './../../services/transaction.service';
import { ConfigService } from './../../services/config.service'

import { DeleteTransactionComponent } from './../../components/delete-transaction/delete-transaction.component';
import { ViewTransactionComponent } from './../../components/view-transaction/view-transaction.component';
import { ExportCitiComponent } from './../../components/export-citi/export-citi.component';
import { ExportIvaComponent } from './../../components/export-iva/export-iva.component';

//Pipes
import { PrintComponent } from 'app/components/print/print.component';
import { PrinterService } from '../../services/printer.service';
import { Printer, PrinterPrintIn } from '../../models/printer';
import { RoundNumberPipe } from '../../pipes/round-number.pipe';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.css'],
  providers: [NgbAlertConfig]
})

export class ListTransactionsComponent implements OnInit {

  public transactions: Transaction[] = new Array();
  public config: Config;
  public timezone;
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
      'origin',
      'letter',
      'number',
      'endDate',
      'company.name',
      'employeeClosing.name',
      'turnClosing.endDate',
      'madein',
      'state',
      'observation',
      'discountAmount',
      'totalPrice',
      'operationType',
      'CAE'
  ];
  public filters: any[];
  public filterValue: string;

  constructor(
    public _transactionService: TransactionService,
    public _configService: ConfigService,
    public _router: Router,
    public _modalService: NgbModal,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService
  ) {
    this.filters = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
  }

  ngOnInit(): void {

    this.getConfig();

  }

  public getConfig(): void {
    this._configService.getConfigApi().subscribe(
      result => {
        if(!result.configs){
          this.showMessage("No se encontro la configuracion", 'danger', false);
          this.loading = false;
        } else {
          this.config = result.configs;
          this.allowResto = this.config[0].modules.sale.resto

          if(this.config[0].timezone) {
            this.timezone = this.config[0].timezone.split('C')
          } else {
            this.timezone = "-03:00"
          }


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

          this.getTransactions();

        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    )
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

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = '{}';
        if (this.displayedColumns && this.displayedColumns.length > 0) {
            project = '{';
            for (let i = 0; i < this.displayedColumns.length; i++) {
                let field = this.displayedColumns[i];
                project += `"${field}":{"$cond":[{"$eq":[{"$type":"$${field}"},"date"]},{"$dateToString":{"date":"$${field}","format":"%d/%m/%Y","timezone":"${this.timezone[1]}"}},{"$cond":[{"$ne":[{"$type":"$${field}"},"array"]},{"$toString":"$${field}"},"$${field}"]}]}`;
                if (i < this.displayedColumns.length - 1) {
                    project += ',';
                }
            }
            project += '}';
        }
        project = JSON.parse(project);

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            transactions: { $push: "$$ROOT" }
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
            if (result && result.transactions) {
                this.transactions = result.transactions;
                this.totalItems = result.count;
            } else {
                this.loading = false;
                this.transactions = null;
                this.totalItems = 0;
            }
            this.loading = false;
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
        modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        break;
      case 'edit':
        modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg' });
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
        break;
      case 'cancel':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg' });
        modalRef.componentInstance.transaction = transaction;
        modalRef.result.then((result) => {
          if (result === 'delete_close') {
              this.getTransactions();
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
              this.getTransactions();
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
