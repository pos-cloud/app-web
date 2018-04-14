//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild, transition } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Turn, TurnState } from './../../models/turn';
import { Print } from './../../models/print';
import { Printer, PrinterType, PrinterPrintIn } from './../../models/printer';
import { Company } from './../../models/company';
import { Config } from './../../app.config';
import { TransactionType } from './../../models/transaction-type';

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
import { TransactionTypeService } from './../../services/transaction-type.service';

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
  public barcode64: string;
  public transactionTypes: TransactionType[] = new Array();

  public fontSizes = JSON.parse(`{"small" : 5,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

  constructor(
    public _turnService: TurnService,
    public _transactionTypeService: TransactionTypeService,
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
          } else if (this.typePrint === "invoice") {
            this.getMovementOfArticle();
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

  public getShiftClosingByTransaccion(): void {
    
    this.loading = true;

    this._turnService.getShiftClosingByTransaccion(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.getShiftClosingByMovementOfArticle();
        } else {
          this.hideMessage();
          this.shiftClosingTransaction = result.shiftClosing;
          this.getShiftClosingByMovementOfArticle();
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
          this.getShiftClosingByMovementOfCash();
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfArticle = result.shiftClosing;
          this.getShiftClosingByMovementOfCash();
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
          this.toPrintTurn();
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfCash = result.shiftClosing;
          this.toPrintTurn();
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
          
          if (this.transaction.CAE &&
              this.transaction.CAEExpirationDate) {
          
            this.calculateBarcode();
          } else {
            this.toPrintInvoice();
          }
        }
        this.toPrintInvoice();
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public calculateBarcode(): void {

    let codeInvoice = 0;

    if (this.transaction.type.codes.length > 0) {
      for (let y: number = 0; y < this.transaction.type.codes.length; y++) {
        if (this.transaction.letter == this.transaction.type.codes[y].letter) {
          codeInvoice = this.transaction.type.codes[y].code;
        }
      }
    }

    let date = this.transaction.CAEExpirationDate.split(' ');

    let digit = ((this.config[0].companyCUIT).replace('-', '')).replace('-', '') + codeInvoice + this.transaction.origin + this.transaction.CAE + this.convertDate(date[0]);

    let uno = 0;
    let dos = 0;

    for (let z: number = 0; z < digit.length; z++) {

      if (z % 2 == 1) {
        uno = uno + parseInt(digit[z]);
      } else {
        dos = dos + parseInt(digit[z]);
      }
    }

    let h = (uno * 3) + dos;
    let checkDigit = 0;

    while (h % 10 != 0) {
      h++;
      checkDigit++
    }

    this.getBarcode64('interleaved2of5?value=' + ((this.config[0].companyCUIT).replace('-', '')).replace('-', '')
      + codeInvoice
      + this.transaction.origin
      + this.transaction.CAE
      + this.convertDate(date[0])
      + checkDigit);
  }

  public convertDate(string): void {

    var convertDate = string.split(' ')
   
    var convertDate2 = convertDate[0].split('/');
    
    var convertDate = convertDate2.reverse();

    var string = convertDate[0]+convertDate[1]+convertDate[2];

    return string;
  }

  public toPrintTurn(): void {
    
    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);
    
    this.getHeader();

    this.typePrint = 'turn';
    let decimalPipe = new DecimalPipe('ARS');

    // Título
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.text("Cierre de Turno", 140, 10)
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.setFontType('normal')

    // Detalle del turno
    let row = 70;
    if (this.turn.employee) { this.doc.text('Mozo: ' + this.turn.employee.name, 15, row) };
    if (this.turn.startDate) { this.doc.text('Apertura: ' + this.dateFormat.transform(this.turn.startDate, 'DD/MM/YYYY HH:mm'), 15, row += 8) };
    if (this.turn.endDate) { this.doc.text('Cierre: ' + this.dateFormat.transform(this.turn.endDate, 'DD/MM/YYYY HH:mm'), 15, row += 8) };
    if (this.shiftClosingTransaction) { this.doc.text('Facturado: ' + decimalPipe.transform(this.shiftClosingTransaction.invoicedAmount, '1.2-2'), 15, row += 8) };
    if (!this.shiftClosingTransaction) { this.doc.text('Facturado: $0.00', 15, row += 8) };
    if (this.shiftClosingTransaction) { this.doc.text('Tickets: ' + this.shiftClosingTransaction.amountOrders, 15, row += 8) };
    if (!this.shiftClosingTransaction) { this.doc.text('Tickets: 0', 15, row += 8) };
    if (this.shiftClosingTransaction) { this.doc.text('Tiques Anulados: ' + this.shiftClosingTransaction.amountOrdersCanceled, 15, row += 8) };
    if (!this.shiftClosingTransaction) { this.doc.text('Tickets Anulados: 0', 15, row += 8) };
    if (this.shiftClosingTransaction && this.shiftClosingTransaction.detailCanceled.length > 0) {
      this.doc.text('Detalle de Tickets Anulados:', 15, row += 8)
      for (let i = 0; i < this.shiftClosingTransaction.detailCanceled.length; i++) {
        let transaction = this.shiftClosingTransaction.detailCanceled[i];
        this.doc.text("TK " + this.padString(transaction.origin, 4) + "-" + transaction.letter + "-" + this.padString(transaction.number, 10) + " por $" + transaction.totalPrice, 30, row += 8)
      }
    }
    if (this.shiftClosingMovementOfArticle && this.shiftClosingMovementOfArticle.deletedItems.length > 0) {
      this.doc.text('Detalle de Productos Anulados:', 15, row += 8)
      for (let i = 0; i < this.shiftClosingMovementOfArticle.deletedItems.length; i++) {
        let movementOfArticle = this.shiftClosingMovementOfArticle.deletedItems[i];
        this.doc.text("" + movementOfArticle.amount + " " + movementOfArticle.description + " anulado en TK " + this.padString(movementOfArticle.transaction.origin, 4) + "-" + movementOfArticle.transaction.letter + "-" + this.padString(movementOfArticle.transaction.number, 10), 30, row += 8)
      }
    }
    if (this.shiftClosingMovementOfCash && this.shiftClosingTransaction) { this.doc.text('Detalle de Medios de Pago', 15, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.cash !== 0) { this.doc.text('Efectivo: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.cash, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.currentAccount !== 0) { this.doc.text('Cuenta Corriente: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.currentAccount, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.creditCard !== 0) { this.doc.text('Tarjeta de Crédito: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.creditCard, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.debitCard !== 0) { this.doc.text('Tarjeta de Débito: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.debitCard, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.thirdPartyCheck !== 0) { this.doc.text('Cheque de Terceros: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.thirdPartyCheck, '1.2-2'), 30, row += 8) };

    this.getFooter();

    // Abrir PDF a imprimir
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public getHeader(): void {

    this.doc.setDrawColor(110, 110, 110)

    // Dibujar lineas horizontales
    this.doc.line(0, 50, 240, 50)
    this.doc.line(0, 240, 240, 240)

    // Detalle Emisor
    if (this.config[0]) {
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
      this.doc.setFontSize(this.fontSizes.extraLarge)
      this.doc.setFontType('bold')
      if (this.config[0].companyName) {
        this.doc.text(this.config[0].companyName, 23, 20)
      }
      this.doc.setFontSize(this.fontSizes.normal)
      this.doc.setFontType('normal')
      if (this.config[0].companyAddress) {
        this.doc.text(this.config[0].companyAddress, 20, 30)
      }
      if (this.config[0].companyPhone) {
        this.doc.text("(" + this.config[0].companyPhone + ")", 35, 35)
      }
    }
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.setFontType('normal')
  }

  public getClient() {

    // Lineas divisorias horizontales para el receptor
    this.doc.line(0, 70, 240, 70)
    this.doc.line(0, 80, 240, 80)

    // Detalle receptor
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
      if (this.company.address) {
        this.doc.text(this.company.address, 140, 55)
      }
      if (this.company.phones) {
        this.doc.text(this.company.phones, 138, 60)
      }
      if (this.company.city) {
        this.doc.text(this.company.city, 140, 65)
      }
    } else {
      this.doc.setFontType('bold')
      this.doc.text("CUIT:", 8, 60)
      this.doc.setFontType('normal')
      this.doc.text("Consumidor Final", 40, 65)
    }
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.setFontType('normal')
  }

  public toPrintCurrentAccount(): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);

    this.getHeader();
    this.getClient();

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
    var row = 85;

    this.doc.setFontSize(this.fontSizes.normal)
    if (this.transactions.length > 0) {
      let amount = 0;
      for (let transaction of this.transactions) {
        if (amount < 20) {
          if (transaction.endDate) {
            this.doc.text(this.dateFormat.transform(transaction.endDate, 'DD/MM/YYYY'), 15, row)
          } else {
            this.doc.text(this.dateFormat.transform(transaction.startDate, 'DD/MM/YYYY'), 15, row)
          }
          if (transaction.type.labelPrint && 
              transaction.type.labelPrint !== "") {
            this.doc.text(transaction.type.labelPrint, 55, row)
          } else {
            this.doc.text(transaction.type.name, 55, row)
          }
          this.doc.text(this.padString(transaction.origin, 4) + "-" + transaction.letter + "-" + this.padString(transaction.number, 10), 115, row)
          this.doc.setFontType('bold')
          this.doc.text("$ " + this.roundNumber.transform(transaction.totalPrice, 2), 175, row)
          this.doc.setFontType('normal')

          row += 8;
        }
        amount++;
      }
    }

    // Mostrar total de cuenta corriente
    this.doc.setFontType('bold')
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.text("Total de la Cuenta Corriente", 5, 246)
    this.doc.text("$ " + this.roundNumber.transform(this.balance, 2), 175, 246)
    this.doc.line(0, 250, 240, 250)

    this.getGreeting();
    this.getFooter();

    // Abrir PDF a imprimir
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public toPrintInvoice(): void {

    // Encabezado de la transacción
    this.getHeader();
    this.getClient();

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
    this.doc.text("Cant", 5, 77)
    this.doc.text("Detalle", 25, 77)
    this.doc.text("Precio", 155, 77)
    this.doc.text("Total", 185, 77)
    this.doc.setFontType('normal')

    // Detalle de artículos
    var row = 85;

    if (this.movementsOfArticles2.length > 0) {
      for (var i = 0; i < this.movementsOfArticles2.length; i++) {
        if (this.movementsOfArticles2[i].amount) {
          this.doc.text((this.movementsOfArticles2[i].amount).toString(), 6, row)
        }
        if (this.movementsOfArticles2[i].description) {
          this.doc.text(this.movementsOfArticles2[i].description, 25, row)
        }
        if (this.movementsOfArticles2[i].article) {
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].article.salePrice, 2), 155, row)
        } else {
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].salePrice, 2), 155, row)
        }
        this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].salePrice, 2), 185, row)

        row += 8;
      }
    }

    // Totales de la transacción
    let iva21 = 0.00;
    let iva10 = 0.00;
    let iva27 = 0.00;

    if (this.transaction.taxes) {
      for (let x = 0; x < this.transaction.taxes.length; x++) {
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
    if (this.transaction.company &&
        this.transaction.company.vatCondition &&
        this.transaction.company.vatCondition.discriminate === "Si") {
      this.doc.text("$ " + this.roundNumber.transform((this.transaction.totalPrice - iva21 - iva10 - iva27), 2).toString(), 180, 247)
    } else {
      this.doc.text("$ " + this.roundNumber.transform((this.transaction.totalPrice), 2).toString(), 180, 247)
      iva21 = 0;
      iva10 = 0;
      iva27 = 0;
    }
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
    if( this.transaction.CAE &&
      this.transaction.CAEExpirationDate) {
      this.doc.setFontType('bold')
      this.doc.text("CAE:", 10, 272)
      this.doc.text("Fecha Vto:", 10, 280)
      this.doc.setFontType('normal')
      this.doc.text(this.transaction.CAE, 20, 272)
      this.doc.text(this.transaction.CAEExpirationDate, 30, 280)
      
      let imgdata = 'data:image/png;base64,' + this.barcode64;

      this.doc.addImage(imgdata, 'PNG', 10, 250, 125, 15);
    }

    this.getGreeting();
    this.getFooter();

    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public getGreeting() {

    this.doc.setFontStyle("italic")
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.text("Gracias por su visita!", 80, 280)
    this.doc.setFontStyle("normal")
  }

  public toDataURL(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onload = function () {
      let reader = new FileReader();
      reader.onloadend = function () {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
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
    this.doc.setTextColor(0, 0, 0)
  }

  public padString(n, length) {
    var n = n.toString();
    while (n.length < length)
      n = "0" + n;
    return n;
  }

  public getBarcode64(barcode): void {

    this._printService.getBarcode(barcode).subscribe(
      result => {
        this.barcode64 = result.bc64;
        this.toPrintInvoice();
      },
      error => {

      }
    );
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