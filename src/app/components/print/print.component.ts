//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Turn, TurnState } from './../../models/turn';
import { Print } from './../../models/print';
import { Printer, PrinterType } from './../../models/printer';
import { Config } from './../../app.config';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';

//Servicios
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';
import { PrintService } from './../../services/print.service';
import { TransactionService } from './../../services/transaction.service';
import { MovementOfArticleService } from './../../services/movement-of-article.service';

//Pipes
import { DecimalPipe } from '@angular/common';
import { DateFormatPipe } from './../../pipes/date-format.pipe';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css']
})
export class PrintComponent implements OnInit {

  @Input() transaction: Transaction;
  @Input() movementsOfArticles: MovementOfArticle[];
  @Input() turn: Turn;
  @Input() typePrint;
  public loading: boolean;
  public alertMessage: string = "";
  public shiftClosingTransaction;
  public shiftClosingMovementOfArticle;
  public shiftClosingMovementOfCash;
  public companyName: string = Config.companyName;
  public printers: Printer[];
  public printersAux: Printer[];
  public movementsOfArticles2: MovementOfArticle[];
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  @ViewChild('contentTicket') contentTicket: ElementRef;
  public pdfURL;
  public doc;

  constructor(
    public _turnService: TurnService,
    public _printService: PrintService,
    public _printerService: PrinterService,
    public _transactionService: TransactionService,
    public _movementOfArticle: MovementOfArticleService,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    private domSanitizer: DomSanitizer
  ) {
    this.doc = new jsPDF();
  }

  ngOnInit() {
    this.printers = new Array();
    this.printersAux = new Array();
    this.getPrinters();
    if (this.typePrint === "turn") {
      this.getShiftClosingByTransaccion();
      this.getShiftClosingByMovementOfArticle();
      this.getShiftClosingByMovementOfCash();
    } else if (this.typePrint === "invoice") {
      this.getTransaction();
      this.getMovementOfArticle();
      this.toPrintInvoice();

    }
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
        } else {
          this.hideMessage();
          this.printers = result.printers;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByTransaccion(): void {

    this.loading = true;

    this._turnService.getShiftClosingByTransaccion(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingTransaction = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfArticle(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfArticle(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfArticle = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfCash(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfCash(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfCash = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransaction(): void {
    this.loading = true;
    
        this._transactionService.getTransaction(this.transaction._id).subscribe(
          result => {
            if (!result.transaction) {
              this.showMessage(result.message, "info", true);
              this.loading = false;
            } else {
              this.hideMessage();
              this.transaction = result.transaction;
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, "danger", false);
            this.loading = false;
          }
        );
  }

  public getMovementOfArticle(): void {
    this.loading = true;

        this._movementOfArticle.getMovementsOfTransaction(this.transaction._id).subscribe(
          result => {
            if (!result.movementsOfArticles) {
              this.showMessage(result.message, "info", true);
              this.loading = false;
            } else {
              this.hideMessage();
              this.movementsOfArticles2 = result.movementsOfArticles;
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, "danger", false);
            this.loading = false;
          }
        );
  }

  public print(): void {

    let modalRef;
    this.toPrintTurn(null);
    // if (this.countPrinters() > 1) {
    //   modalRef = this._modalService.open(this.contentPrinters, { size: 'lg' }).result.then((result) => {
    //     if (result !== "cancel" && result !== "") {
    //       this.distributeImpressions(result);
    //     }
    //   }, (reason) => {

    //   });
    // } else if (this.countPrinters() !== 0) {
    //   this.distributeImpressions(this.printersAux[0]);
    // } else {
    //   this.showMessage("No se encontraron impresoras","info",true);
    // }
  }

  public countPrinters(): number {

    let numberOfPrinters: number = 0;
    this.printersAux = new Array();

    if (this.printers != undefined) {
      for (let printer of this.printers) {
        if (this.typePrint === 'charge' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'bill' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'bar' && printer.type === PrinterType.Bar) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'kitchen' && printer.type === PrinterType.Kitchen) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'turn' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    return numberOfPrinters;
  }

  public distributeImpressions(printer: Printer) {

    switch (this.typePrint) {
      case 'charge':
        break;
      case 'bill':
        break;
      case 'bar':
        break;
      case 'kitchen':
        break;
      case 'turn':
        this.toPrintTurn(printer);
        break;
      default:
        this.showMessage("No se reconoce la operación de impresión.", "danger", false);
        break;
    }
  }

  public toPrintTurn(printerSelected: Printer): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);

    this.typePrint = 'turn';
    let dateFormat = new DateFormatPipe();
    let decimalPipe = new DecimalPipe('ARS');
    let content: string;

    content =
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="12" align="center"><b><font face="Courier">CIERRE DE TURNO</font></b><td></tr>';
    if (Config.companyName) { content += '<tr><td colspan="12" align="center"><b><font face="Courier">' + Config.companyName + '</font></b><td></tr>' };
    if (this.turn.employee) { content += '<tr><td colspan="12"><font face="Courier" size="2">Mozo: ' + this.turn.employee.name + '</font></td></tr>' };
    if (this.turn.startDate) { content += '<tr><td colspan="12"><font face="Courier" size="2">Apertura: ' + dateFormat.transform(this.turn.startDate, 'DD/MM/YYYY HH:mm') + '</font></td></tr>' };
    if (this.turn.endDate) { content += '<tr><td colspan="12"><font face="Courier" size="2">Cierre: ' + dateFormat.transform(this.turn.endDate, 'DD/MM/YYYY HH:mm') + '</font></td></tr>' };
    if (this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Facturado: ' + decimalPipe.transform(this.shiftClosingTransaction.invoicedAmount, '1.2-2') + '</font></td></tr>' };
    if (!this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Facturado: $0.00</font></td></tr>' };
    if (this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tickets: ' + this.shiftClosingTransaction.amountOrders + '</font></td></tr>' };
    if (!this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tickets: 0</font></td></tr>' };
    if (this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tiques Anulados: ' + this.shiftClosingTransaction.amountOrdersCanceled + '</font></td></tr>' };
    if (!this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tickets Anulados: 0</font></td></tr>' };
    if (this.shiftClosingTransaction && this.shiftClosingTransaction.detailCanceled !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2"><b>Detalle de Tickets Anulados:</b></font></td></tr>' };
    if (this.shiftClosingTransaction && this.shiftClosingTransaction.detailCanceled !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2">' + this.shiftClosingTransaction.detailCanceled + '</font></td></tr>' };
    // if (this.shiftClosingMovementOfArticle.deletedItems !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2"><b>Detalle de Productos Anulados:</b></font></td></tr>' };
    // if (this.shiftClosingMovementOfArticle.deletedItems !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2">' + this.shiftClosingMovementOfArticle.deletedItems + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2"><b>Detalle de Medios de Pago</b></font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.cash !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Efectivo: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.cash, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.currentAccount !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Cuenta Corriente: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.currentAccount, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.creditCard !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tarjeta de Crédito: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.creditCard, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.debitCard !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tarjeta de Débito: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.debitCard, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.thirdPartyCheck !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Cheque de Terceros: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.thirdPartyCheck, '1.2-2') + '</font></td></tr>' };
    content +=
      '</tbody>' +
      '</table>';

    this.doc.fromHTML(content, 15, 15, {
      'width': 170,
      'elementHandlers': {}
    });
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));

    // let print = new Print();
    // print.content = content;
    // print.printer = printerSelected;

    // this._printService.toPrint(print).subscribe(
    //   result => {
    //     if (result.message !== "ok") {
    //       this.showMessage(result.message, "info", true);
    //     } else {
    //       this.activeModal.close(this.turn);
    //     }
    //     this.loading = false;
    //   },
    //   error => {
    //     this.showMessage(error._body, "danger", false);
    //     this.loading = false;
    //   }
    // );
    this.loading = false;
    // this.activeModal.close(this.turn);
  }

  public toPrintInvoice(): void {

  let content: string;

  console.log(this.movementsOfArticles2[0].description);

  content='<table>'+
          '<p aling=right>Factura</p>'+
            '<tbody>'+
              '<tr>'+
                '<th>Cantidad</th>'+
                '<th>Producto</th>'+
                '<th>Precio</th>'+
                '<th>Total</th>'+
              '</tr>'+
            '</tbody'+
          '</table>';


    this.doc.fromHTML(content, 30, 30, {
      'width': 170,
      'elementHandlers': {}
    });


    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));

    //this.loading = false;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}