//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild, transition  } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Turn, TurnState } from './../../models/turn';
import { Print } from './../../models/print';
import { Printer, PrinterType } from './../../models/printer';
import { Company } from './../../models/company';
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
import { ConfigService } from './../../services/config.service';

//Pipes
import { DecimalPipe } from '@angular/common';
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css'],
  providers: [RoundNumberPipe]
})
export class PrintComponent implements OnInit {

  @Input() company: Company;
  @Input() transaction: Transaction;
  @Input() transactions: Transaction[];
  @Input() movementsOfArticles: MovementOfArticle[];
  @Input() turn: Turn;
  @Input() typePrint;
  @Input() balance;
  public loading: boolean;
  public alertMessage: string = "";
  public shiftClosingTransaction;
  public shiftClosingMovementOfArticle;
  public shiftClosingMovementOfCash;
  public companyName: string = Config.companyName;
  public printers: Printer[];
  public printersAux: Printer[];
  public movementsOfArticles2: MovementOfArticle[];
  public config: Config;
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  @ViewChild('contentTicket') contentTicket: ElementRef;
  public pdfURL;
  public doc;
  public roundNumber = new RoundNumberPipe();
  public dateFormat = new DateFormatPipe();

  public fontSizes = JSON.parse(`{"small" : 5,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

  constructor(
    public _turnService: TurnService,
    public _printService: PrintService,
    public _printerService: PrinterService,
    public _transactionService: TransactionService,
    public _movementOfArticle: MovementOfArticleService,
    public _configService: ConfigService,
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
    this.getConfig();
    // if (this.typePrint === "turn") {
    //   this.getShiftClosingByTransaccion();
    //   this.getShiftClosingByMovementOfArticle();
    //   this.getShiftClosingByMovementOfCash();
    // } else if (this.typePrint === "invoice") {
    //   this.getTransaction();
    // } else if (this.typePrint === "current-account") {
    //   this.getConfig();
    //   this.toPrintCurrentAccount();
    // }
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
              this.getMovementOfArticle();
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
              this.toPrintInvoice();
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, "danger", false);
            this.loading = false;
          }
        );
  }

  public getConfig(): void {
    
    this.loading = true;
        this._configService.getConfigApi().subscribe(
          result => {
            if (!result.configs) {
              this.showMessage(result.message, "info", true);
              this.loading = false;
            } else {
              this.hideMessage();
              this.config = result.configs;
              if (this.typePrint === "turn") {
                this.getShiftClosingByTransaccion();
                this.getShiftClosingByMovementOfArticle();
                this.getShiftClosingByMovementOfCash();
              } else if (this.typePrint === "invoice") {
                this.getTransaction();
              } else if (this.typePrint === "current-account") {
                this.toPrintCurrentAccount();
              }
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
    let decimalPipe = new DecimalPipe('ARS');
    let content: string;

    content =
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="12" align="center"><b><font face="Courier">CIERRE DE TURNO</font></b><td></tr>';
    if (Config.companyName) { content += '<tr><td colspan="12" align="center"><b><font face="Courier">' + Config.companyName + '</font></b><td></tr>' };
    if (this.turn.employee) { content += '<tr><td colspan="12"><font face="Courier" size="2">Mozo: ' + this.turn.employee.name + '</font></td></tr>' };
    if (this.turn.startDate) { content += '<tr><td colspan="12"><font face="Courier" size="2">Apertura: ' + this.dateFormat.transform(this.turn.startDate, 'DD/MM/YYYY HH:mm') + '</font></td></tr>' };
    if (this.turn.endDate) { content += '<tr><td colspan="12"><font face="Courier" size="2">Cierre: ' + this.dateFormat.transform(this.turn.endDate, 'DD/MM/YYYY HH:mm') + '</font></td></tr>' };
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

  public getHeader(): void {

    // Inicializar impresión
    this.doc = new jsPDF();

    this.doc.setDrawColor(110, 110, 110)

    // Dibujar lineas horizontales
    this.doc.line(0, 50, 240, 50)
    this.doc.line(0, 70, 240, 70) 
    this.doc.line(0, 80, 240, 80) 
    this.doc.line(0, 240, 240, 240) 
    
    // Detalle Emisor
    this.doc.setFontSize(this.fontSizes.normal)
    if (this.config[0].companyCUIT) {
      this.doc.setFontType('bold')
      this.doc.text("CUIT:", 110, 30)
      this.doc.setFontType('normal')
      this.doc.text(this.config[0].companyCUIT, 125, 30)
    }
    // this.doc.text("Ingresos Brutos:",110,35)
    // this.doc.text("Fecha Inicio de Actividad:",110,40)

    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.setFontType('bold')
    this.doc.text(this.config[0].companyName, 23, 20)
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.setFontType('normal')
    this.doc.text(this.config[0].companyAddress, 20, 30)
    this.doc.text("(" + this.config[0].companyPhone + ")", 35, 35)

    // Detalle Receptor
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.setFontType('bold')
    this.doc.text("Nombre y Apellido:", 8, 55)
    this.doc.text("Condición de IVA:", 8, 65)
    this.doc.text("Dirección:", 120, 55)
    this.doc.text("Teléfono:", 120, 60)
    this.doc.text("Localidad:", 120, 65)
    this.doc.setFontType('normal')

    if (this.company) {
      this.doc.text(this.company.name, 42, 55)
      if (this.company.DNI) {
        this.doc.setFontType('bold')
        this.doc.text("DNI:", 8, 60)
        this.doc.setFontType('normal')
        this.doc.text(this.company.DNI, 17, 60)
      } else if (this.company.DNI) {
        this.doc.setFontType('bold')
        this.doc.text("CUIT:", 8, 60)
        this.doc.setFontType('normal')
        this.doc.text(this.company.CUIT, 17, 60)
      }
      this.doc.setFontType('normal')
      this.doc.text(this.company.vatCondition.description, 40, 65)
      this.doc.text(this.company.address, 140, 55)
      this.doc.text(this.company.phones, 138, 60)
      this.doc.text(this.company.city, 140, 65)
    } else {
      this.doc.setFontType('bold')
      this.doc.text("CUIT:", 8, 60)
      this.doc.setFontType('normal')
      this.doc.text("Consumidor Final", 40, 65)
    }
  }

  public toPrintCurrentAccount(): void {
    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);

    this.getHeader();

    // Encabezado de la tabla de Detalle de transacciones
    this.doc.setFontType('bold')
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.text("Fecha", 20, 77)
    this.doc.text("Tipo", 70, 77)
    this.doc.text("Comprobante", 120, 77)
    this.doc.text("Monto", 180, 77)
    this.doc.setFontType('normal')

    // Nombre del comprobante
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.text("Cuenta Corriente", 140, 10)

    // Detalle de comprobantes
    var fila = 85;

    this.doc.setFontSize(this.fontSizes.normal)
    if (this.transactions.length > 0) {
      let amount = 0;
      for (let transaction of this.transactions) {
        if (amount < 20) {
          if(transaction.endDate) {
            this.doc.text(this.dateFormat.transform(transaction.endDate, 'DD/MM/YYYY'), 15, fila)
          } else {
            this.doc.text(this.dateFormat.transform(transaction.startDate, 'DD/MM/YYYY'), 15, fila)
          }
          this.doc.text(transaction.type.name, 55, fila)
          this.doc.text(this.padString(transaction.origin, 4) + "-" + transaction.letter + "-" + this.padString(transaction.number, 10), 115, fila)
          this.doc.setFontType('bold')
          this.doc.text("$ " + this.roundNumber.transform(transaction.totalPrice, 2), 175, fila)
          this.doc.setFontType('normal')

          fila += 8;
        }
        amount ++;
      }
    }

    // Mostrar total de cuenta corriente
    this.doc.setFontType('bold')
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.text("Total de la Cuenta Corriente", 5, 246)
    this.doc.text("$ " + this.roundNumber.transform(this.balance, 2), 175, 246)
    this.doc.line(0, 250, 240, 250)

    this.getFooter();

    // Abrir PDF a imprimir
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public toPrintInvoice(): void {

    // Encabezado de la transacción
    this.getHeader();

    // Dibujar la linea cortada para la letra
    this.doc.line(100, 13, 100, 50) //vertical letra

    // Numeración de la transacción
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.text(this.transaction.type.name, 140, 10)
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.setFontType('bold')
    this.doc.text("Comp. Nº:", 110, 20)
    this.doc.setFontType('normal')
    this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 10), 130, 20)
    this.doc.setFontType('bold')
    this.doc.text("Fecha:", 110, 25)
    this.doc.setFontType('normal')
    if (this.transaction.endDate) {
      this.doc.text(this.dateFormat.transform(this.transaction.endDate, 'DD/MM/YYYY'), 125, 25)
    } else {
      this.doc.text(this.dateFormat.transform(this.transaction.startDate, 'DD/MM/YYYY'), 125, 25)
    }

    // Letra de transacción
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.setFontType('bold')
    this.doc.setDrawColor("Black")
    this.doc.rect(95, 3, 10, 10)
    this.doc.text(this.transaction.letter, 98, 10)
    this.doc.setFontType('normal')

    // Encabezado de la tabla de Detalle de Artículos
    this.doc.setFontType('bold')
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.text("Cant",5,77)
    this.doc.text("Detalle",25,77)
    this.doc.text("Precio",155,77)
    this.doc.text("Total", 185, 77)
    this.doc.setFontType('normal')

    // Detalle de artículos
    var fila = 85;

    if (this.movementsOfArticles2.length > 0) {
      for (var i = 0; i < this.movementsOfArticles2.length; i++) { 
        this.doc.text((this.movementsOfArticles2[0].amount).toString(),6,fila)
        this.doc.text(this.movementsOfArticles2[i].description,25,fila)
        if (this.movementsOfArticles2[i].article) {
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].article.salePrice,2),155,fila)
        } else {
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].salePrice, 2), 155, fila)
        }
        this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].salePrice,2),185,fila)
        
        fila += 8;
      }
    }

    // Totales de la transacción
    var iva21 = 0.00;
    var iva10 = 0.00;
    var iva27 = 0.00;

    if (this.transaction.taxes) {
      for (var x = 0; x < this.transaction.taxes.length; x++) {
        if (this.transaction.taxes[x].percentage == 21) {
          iva21 = (this.transaction.taxes[x].taxAmount)
        }
        if (this.transaction.taxes[x].percentage == 10.5) {
          iva10 = (this.transaction.taxes[x].taxAmount)
        }
        if (this.transaction.taxes[x].percentage == 27) {
          iva27 = (this.transaction.taxes[x].taxAmount)
        }
      }
    }

    this.doc.setFontType('bold')
    this.doc.text("Subtotal:", 147, 247)
    this.doc.setFontType('normal')
    this.doc.text("$ " + this.roundNumber.transform((this.transaction.totalPrice + this.transaction.discountAmount), 2).toString(), 180, 247)
    this.doc.setFontType('bold')
    this.doc.text("IVA 21%:", 147, 254)
    this.doc.setFontType('normal')
    this.doc.text("$ " + this.roundNumber.transform(iva21, 2), 180, 254)
    this.doc.setFontType('bold')
    this.doc.text("IVA 10.5%:", 147, 261)
    this.doc.setFontType('normal')
    this.doc.text("$ " + this.roundNumber.transform(iva10, 2), 180, 261)
    this.doc.setFontType('bold')
    this.doc.text("Exento:", 147, 268)
    this.doc.setFontType('normal')
    this.doc.text("$ " + this.roundNumber.transform(this.transaction.exempt, 2), 180, 268)
    this.doc.setFontType('bold')
    this.doc.text("Descuento:", 147, 275)
    this.doc.setFontType('normal')
    this.doc.text("$ (" + this.roundNumber.transform(this.transaction.discountAmount, 2) + ")", 180, 275)
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.setFontType('bold')
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.text("Total:", 147, 282)
    this.doc.setFontType('normal')
    this.doc.text("$ " + this.roundNumber.transform(this.transaction.totalPrice, 2), 180, 282)
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.setFontType('bold')
    this.doc.text("Observaciones:", 10, 250)
    this.doc.setFontType('normal')
    this.doc.text("", 38, 250)

    this.getFooter();

    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public getFooter() {

    // Pie de la impresión
    this.doc.setFontStyle("italic")
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.text("Gracias por su visita!", 80, 280)
    this.doc.setFontStyle("normal")
    this.doc.setTextColor(164, 164, 164)
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.text("Generado en https://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 290)
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }

  public padString (n, length) {
    var  n = n.toString();
    while(n.length < length)
         n = "0" + n;
    return n;
  }

}