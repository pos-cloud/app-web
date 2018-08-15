//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

//Modelos
import { Transaction } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Turn } from './../../models/turn';
import { Printer, PrinterPrintIn, PrinterType } from './../../models/printer';
import { Company } from './../../models/company';
import { Config } from './../../app.config';
import { TransactionType } from './../../models/transaction-type';
import { ArticleStock } from './../../models/article-stock';
import { Article } from './../../models/article';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as jsPDF from 'jspdf';

//Servicios
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';
import { PrintService } from './../../services/print.service';
import { TransactionService } from './../../services/transaction.service';
import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { ConfigService } from './../../services/config.service';
import { TransactionTypeService } from './../../services/transaction-type.service';
import { ArticleStockService } from './../../services/article-stock.service';
import { ArticleService } from './../../services/article.service';

//Pipes
import { DeprecatedDecimalPipe } from '@angular/common';
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { THIS_EXPR } from '../../../../node_modules/@angular/compiler/src/output/output_ast';

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
  @Input() articleStock : ArticleStock;
  @Input() article: Article;
  @Input() printer: Printer;
  public loading: boolean;
  public alertMessage: string = "";
  public shiftClosingTransaction;
  public shiftClosingMovementOfArticle;
  public shiftClosingMovementOfCash;
  public companyName: string = Config.companyName;
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
    public _articleStockService: ArticleStockService,
    public _articleService: ArticleService,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    private domSanitizer: DomSanitizer
  ) {
  }

  ngOnInit() {
    
    if(!this.printer) {
      this.printer = new Printer();
      this.printer.name = "PDF";
      this.printer.printIn = PrinterPrintIn.Counter;
      this.printer.type = PrinterType.PDF;
      this.printer.pageWidth = 210;
      this.printer.pageHigh = 297;
    } 
    
    if (!this.printer.pageWidth || this.printer.pageWidth === 0) {
      this.printer.pageWidth = 210;
    }

    if(!this.printer.pageHigh || this.printer.pageHigh === 0) {
      this.printer.pageHigh = 297;
    }

    let orientation = "p";
    if(this.typePrint === "label") {
      orientation = "l";
    }
    
    this.doc = new jsPDF(orientation, 'mm', [this.printer.pageWidth, this.printer.pageHigh]);

    this.getConfig();
  }

  public getConfig(): void {
    
    this.loading = true;
    this._configService.getConfigApi().subscribe(
      result => {
        if (!result.configs) {
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
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
          } else if (this.typePrint === "label") {
            let code 
            if(this.articleStock) {
              code = this.articleStock.article.code;
            } else if(this.article) {
              code = this.article.code;
            }
            this.getBarcode64('code128?value=' + code, this.typePrint);
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
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
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
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
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
          if(result.message && result.message !== "") this.showMessage(result.message, "info", true);
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
          this.showMessage("No se encontraron artículos en la transacción", "info", false);
          this.loading = false;
        } else {
          this.hideMessage();
          this.movementsOfArticles = result.movementsOfArticles;
          
          if (this.transaction.CAE && this.transaction.CAEExpirationDate) {
            this.calculateBarcode();
          } else {
            if(this.printer.pageWidth < 150) {
              this.toPrintDelivery();
            } else if (this.printer.pageHigh > 150) {
              this.toPrintInvoice();
            } else {
              this.toPrintInvoice();
            }
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

  public calculateBarcode(): void {

    let codeInvoice = 0;

    if (this.transaction.type.codes.length > 0) {
      for (let y: number = 0; y < this.transaction.type.codes.length; y++) {
        if (this.transaction.letter == this.transaction.type.codes[y].letter) {
          codeInvoice = this.transaction.type.codes[y].code;
        }
      }
    }
    //let date = this.transaction.CAEExpirationDate.split('T');
    
    let date = (this.transaction.CAEExpirationDate.split('T')[0].replace('-','')).replace('-','');

    let digit = ((this.config[0].companyCUIT).replace('-', '')).replace('-', '') + 
                  codeInvoice + 
                  this.transaction.origin + 
                  this.transaction.CAE + date;

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
      + date 
      + checkDigit,'invoice');
  }

  public toPrintTurn(): void {
    
    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);
    
    this.getHeader();

    let decimalPipe = new DeprecatedDecimalPipe('es-AR');

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

      this.doc.setFontType('bold')
      this.doc.text("Condición de IVA:", 110, 30)
      this.doc.setFontType('normal')
      if (this.config[0].companyVatCondition) {
        this.doc.text(this.config[0].companyVatCondition.description, 145, 30)
      }

      this.doc.setFontType('bold')
      this.doc.text("CUIT:", 110, 35)
      if (this.config[0].companyCUIT) {
        this.doc.setFontType('normal')
        this.doc.text(this.config[0].companyCUIT, 122, 35)
      }

      this.doc.setFontType('bold')
      this.doc.text("Ingresos Brutos:", 110, 40)
      if (this.config[0].companyGrossIncome) {
        this.doc.setFontType('normal')
        this.doc.text(this.config[0].companyGrossIncome, 140, 40)
      }

      this.doc.setFontType('bold')
      this.doc.text("Inicio de Actividades:", 110, 45)
      if (this.config[0].companyStartOfActivity) {
        this.doc.setFontType('normal')
        this.doc.text(this.dateFormat.transform(this.config[0].companyStartOfActivity, 'DD/MM/YYYY'), 149, 45)
      }
      
      this.doc.setFontSize(this.fontSizes.extraLarge)
      this.doc.setFontType('bold')
      this.doc.setFontSize(this.fontSizes.extraLarge)
      this.doc.setFontType('bold')
      if (this.config[0].companyName) {
        this.centerText(5, 5, 105, 0, 20, this.config[0].companyName);
      }
      this.doc.setFontSize(this.fontSizes.normal)
      this.doc.setFontType('normal')
      if (this.config[0].companyAddress) {
        this.centerText(5, 5, 105, 0, 30, this.config[0].companyAddress);
      }
      if (this.config[0].companyPhone) {
        this.centerText(5, 5, 105, 0, 35, "(" + this.config[0].companyPhone + ")");
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

  public centerText(lMargin, rMargin, pdfInMM, startPdf, height, text): void {

    var pageCenter = pdfInMM / 2;

    var lines = this.doc.splitTextToSize(text, (pdfInMM - lMargin - rMargin));
    var dim = this.doc.getTextDimensions(text);
    var lineHeight = dim.h;
    for (var i = 0; i < lines.length; i++) {
      let lineTop = (lineHeight / 2) * i;
      this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center')
    }
  }

  public toPrintCurrentAccount(): void {

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
            this.centerText(5, 5, 105, 0, row, transaction.type.labelPrint);
          } else {
            this.centerText(5, 5, 105, 0, row, transaction.type.name);
          }
          this.doc.text(this.padString(transaction.origin, 4) + "-" + transaction.letter + "-" + this.padString(transaction.number, 10), 115, row)
          this.doc.setFontType('bold')
          this.doc.text("$ " + this.roundNumber.transform(transaction.totalPrice), 175, row)
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
    this.doc.text("$ " + this.roundNumber.transform(this.balance), 175, 246)
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
    this.doc.line(105, 13, 105, 50) //vertical letra

    // Numeración de la transacción
    this.doc.setFontSize(this.fontSizes.extraLarge)
    if (this.transaction.type.labelPrint &&
      this.transaction.type.labelPrint !== "") {
      this.centerText(5, 5, 105, 105, 10, this.transaction.type.labelPrint);
    } else {
      this.centerText(5, 5, 105, 105, 10, this.transaction.type.name);
    }
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
    this.doc.rect(100, 3, 10, 10)
    this.centerText(5, 5, 210, 0, 10, this.transaction.letter);
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
    
    if (this.movementsOfArticles.length > 0) {
      for (var i = 0; i < this.movementsOfArticles.length; i++) {
        if (this.movementsOfArticles[i].amount) {
          this.doc.text((this.movementsOfArticles[i].amount).toString(), 6, row)
        }
        if (this.movementsOfArticles[i].description) {
          this.doc.text(this.movementsOfArticles[i].description, 25, row)
        }
        this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice / this.movementsOfArticles[i].amount), 155, row)
        this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice), 185, row)

        row += 8;
      }
    }
    
    let rowTotals = 247;
    this.doc.setFontType('bold')
    this.doc.text("Subtotal:", 147, rowTotals)
    this.doc.setFontType('normal')
    let subtotal = 0;
    
    if (this.transaction.company &&
        this.transaction.company.vatCondition &&
        this.transaction.company.vatCondition.discriminate &&
        this.transaction.taxes.length > 0 &&
        Config.companyVatCondition.description === "Responsable Inscripto") {
        for (let tax of this.transaction.taxes) {
          rowTotals += 8;
          this.doc.setFontType('bold');
          this.doc.text(tax.tax.name + " " + this.roundNumber.transform(tax.percentage) + "%:", 147, rowTotals);
          this.doc.setFontType('normal');
          this.doc.text("$ " + this.roundNumber.transform(tax.taxAmount), 180, rowTotals);
          subtotal += this.roundNumber.transform(tax.taxBase);
        }
      
        rowTotals += 8;
        if (this.transaction.exempt && this.transaction.exempt > 0) {
          this.doc.setFontType('bold')
          this.doc.text("Exento:", 147, rowTotals);
          this.doc.setFontType('normal');
          this.doc.text("$ " + this.roundNumber.transform(this.transaction.exempt), 180, rowTotals);
          rowTotals += 8;
        }
    } else {
      rowTotals += 8;
      subtotal = this.transaction.totalPrice;
    }

    if(this.transaction.discountAmount) {
      subtotal += this.transaction.discountAmount;
    }
    this.doc.text("$ " + this.roundNumber.transform((subtotal)).toString(), 180, 247);
    this.doc.setFontType('bold')
    this.doc.text("Descuento:", 147, rowTotals)
    this.doc.setFontType('normal')
    this.doc.text("$ (" + this.roundNumber.transform(this.transaction.discountAmount) + ")", 180, rowTotals)
    rowTotals += 8;
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.setFontType('bold')
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.text("Total:", 147, rowTotals)
    this.doc.setFontType('normal')
    this.doc.text("$ " + this.roundNumber.transform(this.transaction.totalPrice), 180, rowTotals)
    this.doc.setFontSize(this.fontSizes.normal)
    this.doc.setFontType('bold')
    this.doc.text("Observaciones:", 10, 246)
    this.doc.setFontType('normal')
    this.doc.text("", 38, 250)
    if( this.transaction.CAE &&
      this.transaction.CAEExpirationDate) {
      this.doc.setFontType('bold')
      this.doc.text("CAE:", 10, 272)
      this.doc.text("Fecha Vto:", 10, 275)
      this.doc.setFontType('normal')
      this.doc.text(this.transaction.CAE, 20, 272)
      this.doc.text(this.transaction.CAEExpirationDate, 32, 275)
      
      let imgdata = 'data:image/png;base64,' + this.barcode64;

      this.doc.addImage(imgdata, 'PNG', 10, 250, 125, 15);
    }

    this.getGreeting();
    this.getFooter();

    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public toPrintKitchen() {
    
    //Cabecera del ticket
    var margin = 5;
    var row = 5;
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.centerText(3, 5, 80, 0, row, "COCINA");
    this.doc.setFontType('normal');
    this.doc.setFontSize(this.fontSizes.normal);

    row += 8;
    this.doc.setFontType('bold');
    this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
    this.doc.setFontType('normal');
    this.doc.text("Fecha: " + this.dateFormat.transform(this.transaction.startDate, 'DD/MM hh:ss'), 40, row);

    if (this.transaction.table) {
      row += 5;
      this.doc.setFontType('bold');
      if (this.transaction.employeeOpening) {
        this.doc.text("Mozo: " + this.transaction.employeeOpening.name, margin, row);
      }
      this.doc.text("Mesa: " + this.transaction.table.description, 40, row);
      this.doc.setFontType('normal');
    } else if (this.transaction.employeeOpening) {
      row += 5;
      this.doc.setFontType('bold');
      this.doc.text("Empleado: " + this.transaction.employeeOpening.name, margin, row);
      this.doc.setFontType('normal');
    }

    //Cabecera de la tala de artículos
    row += 3;
    this.doc.line(0, row, 80, row);
    row += 5;
    this.doc.text("Cant.", 5, row);
    this.doc.text("Desc.", 30, row);
    row += 3;
    this.doc.line(0, row, 80, row);

    //Cuerpo de la tabla de artículos
    row + 5;
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if(movementOfArticle.printed === 0) {
          row += 5;
          this.centerText(3, 5, 15, 0, row, movementOfArticle.amount.toString());
          if (movementOfArticle.article) {
            this.doc.text(movementOfArticle.article.posDescription, 20, row);
          } else {
            this.doc.text(movementOfArticle.description, 20, row);
          }
  
          if (movementOfArticle.notes && movementOfArticle.notes !== "") {
            row += 5;
            this.doc.setFontStyle("italic");
            this.doc.text(movementOfArticle.notes, 20, row);
            this.doc.setFontStyle("normal");
          }
        }
      }
    }

    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public toPrintBar() {

    //Cabecera del ticket
    var margin = 5;
    var row = 5;
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.centerText(3, 5, 80, 0, row, "BAR");
    this.doc.setFontType('normal');
    this.doc.setFontSize(this.fontSizes.normal);

    row += 8;
    this.doc.setFontType('bold');
    this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
    this.doc.setFontType('normal');
    this.doc.text("Fecha: " + this.dateFormat.transform(this.transaction.startDate, 'DD/MM hh:ss'), 40, row);

    if (this.transaction.table) {
      row += 5;
      this.doc.setFontType('bold');
      if (this.transaction.employeeOpening) {
        this.doc.text("Mozo: " + this.transaction.employeeOpening.name, margin, row);
      }
      this.doc.text("Mesa: " + this.transaction.table.description, 40, row);
      this.doc.setFontType('normal');
    } else if (this.transaction.employeeOpening) {
      row += 5;
      this.doc.setFontType('bold');
      this.doc.text("Empleado: " + this.transaction.employeeOpening.name, margin, row);
      this.doc.setFontType('normal');
    }

    //Cabecera de la tala de artículos
    row += 3;
    this.doc.line(0, row, 80, row);
    row += 5;
    this.doc.text("Cant.", 5, row);
    this.doc.text("Desc.", 30, row);
    row += 3;
    this.doc.line(0, row, 80, row);

    //Cuerpo de la tabla de artículos
    row + 5;
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (movementOfArticle.printed === 0) {
          row += 5;
          this.centerText(3, 5, 15, 0, row, movementOfArticle.amount.toString());
          if (movementOfArticle.article) {
            this.doc.text(movementOfArticle.article.posDescription, 20, row);
          } else {
            this.doc.text(movementOfArticle.description, 20, row);
          }

          if (movementOfArticle.notes && movementOfArticle.notes !== "") {
            row += 5;
            this.doc.setFontStyle("italic");
            this.doc.text(movementOfArticle.notes, 20, row);
            this.doc.setFontStyle("normal");
          }
        }
      }
    }

    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public toPrintDelivery() {

    //Cabecera del ticket
    var margin = 5;
    var row = 5;
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.centerText(margin, margin, 80, 0, row, this.config[0].companyName);
    this.doc.setFontType('normal');
    this.doc.setFontSize(this.fontSizes.normal);
    row +=5;
    this.centerText(margin, margin, 80, 0, row, this.config[0].companyAddress);
    row += 5;
    this.centerText(margin, margin, 80, 0, row, "tel: " + this.config[0].companyPhone);
    
    row += 8;
    this.doc.setFontType('bold');
    this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
    this.doc.setFontType('normal');
    this.doc.text("Fecha: " + this.dateFormat.transform(this.transaction.startDate, 'DD/MM hh:ss'), 40, row);

    if(this.transaction.company) {
      row += 5;
      this.doc.setFontType('bold');
      this.doc.text("Entregar a: " + this.transaction.company.address, margin, row);
      this.doc.setFontType('normal');
    }

    if (this.transaction.employeeOpening) {
      row += 5;
      this.doc.setFontType('bold');
      this.doc.text("Entregado por: " + this.transaction.employeeOpening.name, margin, row);
      this.doc.setFontType('normal');
    }

    //Cabecera de la tala de artículos
    row += 3;
    this.doc.line(0, row, 80, row);
    row += 5;
    this.doc.text("Cant.", margin, row);
    this.doc.text("Desc.", 30, row);
    this.doc.text("Monto", 60, row);
    row += 3;
    this.doc.line(0, row, 80, row);

    //Cuerpo de la tabla de artículos
    row +5;
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        row += 5;
        this.centerText(margin, margin, 15, 0, row, movementOfArticle.amount.toString());
        if (movementOfArticle.article) {
          this.doc.text(movementOfArticle.article.posDescription, 20, row);
        } else {
          this.doc.text(movementOfArticle.description, 20, row);
        }
        this.doc.text("$ " + this.roundNumber.transform(movementOfArticle.salePrice).toString(), 60, row);

        if(movementOfArticle.notes && movementOfArticle.notes !== "") {
          row += 5;
          this.doc.setFontStyle("italic");
          this.doc.setTextColor(90, 90, 90);
          this.doc.text(movementOfArticle.notes, 20, row);
          this.doc.setFontStyle("normal");
          this.doc.setTextColor(0, 0, 0);
        }
      }
    }

    //Pie de la tabla de artículos
    row += 5;
    this.doc.line(0, row, 240, row);
    this.doc.setFontStyle('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    row += 5;
    this.centerText(margin, margin, 80, 0, row, "TOTAL");
    this.doc.text("$ " + this.transaction.totalPrice, 60, row);
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.config[0].footerInvoice) {
      this.doc.setFontStyle("italic");
      row += 10;
      this.centerText(margin, margin, 80, 0, row, this.config[0].footerInvoice);
    }

    //Pie del ticket
    this.doc.setFontStyle("normal");
    this.doc.setFontSize(this.fontSizes.small);
    row += 5;
    this.centerText(margin, margin, 80, 0, row, "Generado en POSCLOUD.com.ar, tu Punto de Venta en la NUBE.");
    this.doc.setTextColor(0, 0, 0);

    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public ticketResto() {

    //Cabecera del ticket
    var margin = 5;
    var row = 5;
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.centerText(margin, margin, 80, 0, row, this.config[0].companyName);
    this.doc.setFontType('normal');
    this.doc.setFontSize(this.fontSizes.normal);
    row += 5;
    this.centerText(margin, margin, 80, 0, row, this.config[0].companyAddress);
    row += 5;
    this.centerText(margin, margin, 80, 0, row, "tel: " + this.config[0].companyPhone);

    row += 8;
    this.doc.setFontType('bold');
    this.doc.text("Cliente: ", margin, row);
    this.doc.setFontType('normal');
    if (this.transaction.company) {
      this.doc.text(this.transaction.company.name, margin + 15, row);
    } else {
      this.doc.text("Consumidor Final", margin + 15, row);
    }

    row += 5;
    this.doc.setFontType('bold');
    this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
    this.doc.setFontType('normal');
    this.doc.text("Fecha: " + this.dateFormat.transform(this.transaction.startDate, 'DD/MM hh:ss'), 40, row);


    if (this.transaction.table) {
      row += 5;
      this.doc.setFontType('bold');
      if (this.transaction.employeeOpening) {
        this.doc.text("Mozo: " + this.transaction.employeeOpening.name, margin, row);
      }
      this.doc.text("Mesa: " + this.transaction.table.description, 40, row);
      this.doc.setFontType('normal');
    } else if (this.transaction.employeeOpening) {
      row += 5;
      this.doc.setFontType('bold');
      this.doc.text("Empleado: " + this.transaction.employeeOpening.name, margin, row);
      this.doc.setFontType('normal');
    }

    //Cabecera de la tala de artículos
    row += 3;
    this.doc.line(0, row, 80, row);
    row += 5;
    this.doc.text("Cant.", margin, row);
    this.doc.text("Desc.", 30, row);
    this.doc.text("Monto", 60, row);
    row += 3;
    this.doc.line(0, row, 80, row);

    //Cuerpo de la tabla de artículos
    row + 5;
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        row += 5;
        this.centerText(margin, margin, 15, 0, row, movementOfArticle.amount.toString());
        if (movementOfArticle.article) {
          this.doc.text(movementOfArticle.article.posDescription, 20, row);
        } else {
          this.doc.text(movementOfArticle.description, 20, row);
        }
        this.doc.text("$ " + this.roundNumber.transform(movementOfArticle.salePrice).toString(), 60, row);

        if (movementOfArticle.notes && movementOfArticle.notes !== "") {
          row += 5;
          this.doc.setFontStyle("italic");
          this.doc.setTextColor(90, 90, 90);
          this.doc.text(movementOfArticle.notes, 20, row);
          this.doc.setFontStyle("normal");
          this.doc.setTextColor(0, 0, 0);
        }
      }
    }

    //Pie de la tabla de artículos
    row += 5;
    this.doc.line(0, row, 240, row);
    this.doc.setFontStyle('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    row += 5;
    this.centerText(margin, margin, 80, 0, row, "TOTAL");
    this.doc.text("$ " + this.transaction.totalPrice, 60, row);
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.config[0].footerInvoice) {
      this.doc.setFontStyle("italic");
      row += 10;
      this.centerText(margin, margin, 80, 0, row, this.config[0].footerInvoice);
    }

    //Pie del ticket
    this.doc.setFontStyle("normal");
    this.doc.setFontSize(this.fontSizes.small);
    row += 5;
    this.centerText(margin, margin, 80, 0, row, "Generado en POSCLOUD.com.ar, tu Punto de Venta en la NUBE.");
    this.doc.setTextColor(0, 0, 0);

    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public toPrintBarcode(): void {

    if (this.articleStock) {
      
      this.doc.text(this.articleStock.article.description, 10, 10);
      this.doc.text("$",42,15);
      this.doc.text(this.articleStock.article.salePrice.toString(), 45, 15);
        
      let imgdata = 'data:image/png;base64,' + this.barcode64;
  
      this.doc.addImage(imgdata, 'PNG', 10, 17, 40, 10);
      
      for (let index = 0; index < this.articleStock.realStock -1 ; index++) {
        
        
        this.doc.addPage();
        
        this.doc.text(this.articleStock.article.description, 10,10);
        this.doc.text("$",42,15);
        this.doc.text(this.articleStock.article.salePrice.toString(), 45, 15);
        
        let imgdata = 'data:image/png;base64,' + this.barcode64;
  
        this.doc.addImage(imgdata, 'PNG', 10, 17, 40, 10);
  
      }
      
      this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));

    }  else if(this.article) {
        this.doc.text(this.article.description, 10,10);
        this.doc.text("$",42,15);
        this.doc.text(this.article.salePrice.toString(), 45, 15);
        
        let imgdata = 'data:image/png;base64,' + this.barcode64;
  
        this.doc.addImage(imgdata, 'PNG', 10, 17, 40, 10);

        this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
    }
  }

  public getGreeting() {

    this.doc.setFontStyle("italic");
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.config[0] && this.config[0].footerInvoice) {
      this.doc.text(this.config[0].footerInvoice, 9, 280);
    } else {
      this.doc.text("Gracias por su visita!", 9, 280);
    }
    this.doc.setFontStyle("normal");
  }

  public getFooter() {

    // Pie de la impresión
    this.doc.setFontStyle("normal");
    this.doc.setTextColor(164, 164, 164);
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Generado en https://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 290);
    this.doc.setTextColor(0, 0, 0);
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

  public padString(n, length) {
    var n = n.toString();
    while (n.length < length)
      n = "0" + n;
    return n;
  }

  public getBarcode64(barcode, op : string): void {

    this._printService.getBarcode(barcode).subscribe(
      result => {
        this.barcode64 = result.bc64;
        switch (op) {
          case 'label':
            this.toPrintBarcode();
            break;
          case 'invoice':
            this.toPrintInvoice();
            break;

          default:
            break;
        } 
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