//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

//Modelos
import { Transaction } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { MovementOfCash } from './../../models/movement-of-cash';
import { Turn } from './../../models/turn';
import { Printer, PrinterPrintIn, PrinterType } from './../../models/printer';
import { Company } from './../../models/company';
import { Config } from './../../app.config';
import { TransactionType, TransactionMovement } from './../../models/transaction-type';
import { ArticleStock } from './../../models/article-stock';
import { Article, ArticleType } from './../../models/article';


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
import { MovementOfCashService } from './../../services/movement-of-cash.service';

//Pipes
import { DeprecatedDecimalPipe } from '@angular/common';
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { CashBox } from '../../models/cash-box';
import { CashBoxService } from '../../services/cash-box.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css'],
  providers: [RoundNumberPipe]
})

export class PrintComponent implements OnInit {

  @Input() company: Company;
  public transaction: Transaction;
  public transactions: Transaction[];
  @Input() items: any[];
  @Input() movementsOfArticles: MovementOfArticle[];
  @Input() turn: Turn;
  @Input() cashBox: CashBox;
  @Input() typePrint;
  @Input() balance;
  @Input() params;
  @Input() articleStock : ArticleStock;
  @Input() article: Article;
  @Input() articles: Article[];
  @Input() printer: Printer;
  @Input() transactionId: string;
  public loading: boolean;
  public alertMessage: string = '';
  public shiftClosingTransaction;
  public shiftClosingMovementOfArticle;
  public shiftClosingMovementOfCash;
  public bookVAT;
  public companyName: string = Config.companyName;
  public movementsOfArticles2: MovementOfArticle[];
  public movementsOfCashes: MovementOfCash[];
  public config: Config;
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  @ViewChild('contentTicket') contentTicket: ElementRef;
  public pdfURL;
  public doc;
  public roundNumber = new RoundNumberPipe();
  public dateFormat = new DateFormatPipe();
  public barcode64: string;
  public transactionTypes: TransactionType[] = new Array();
  public transactionMovement: TransactionMovement;
  public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

  constructor(
    public _turnService: TurnService,
    public _cashBoxService: CashBoxService,
    public _transactionTypeService: TransactionTypeService,
    public _printService: PrintService,
    public _printerService: PrinterService,
    public _movementOfCash: MovementOfCashService,
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

    if (!this.printer) {
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

    if (!this.printer.pageHigh || this.printer.pageHigh === 0) {
      this.printer.pageHigh = 297;
    }

    let orientation = "p";
    if (this.typePrint === "label") {
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
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.config = result.configs;
          if (this.transactionId) {
            this.getTransaction(this.transactionId);
          } else {
            if (this.typePrint === "turn") {
              this.getShiftClosingByTransaction();
            } else if (this.typePrint === "invoice") {
              if (this.transaction.type.requestArticles) {
                this.getMovementOfArticle();
              } else {
                this.getMovementOfCash();
              }
            } else if (this.typePrint === "current-account") {
              this.toPrintCurrentAccount();
            } else if (this.typePrint === "cash-box") {
              this.getClosingCashBox();
            } else if (this.typePrint === "label") {
              let code;
              if (this.articleStock) {
                code = this.articleStock.article.code;
              } else if (this.article) {
                code = this.article.code;
              }
              this.getBarcode64('code128?value=' + code, this.typePrint);
            } else if (this.typePrint === "kitchen") {
              this.toPrintKitchen();
            } else if (this.typePrint === "IVA") {
              this.getVATBook();
            } else if (this.typePrint === "price-list") {
              this.getArticles();
            }
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

  public getTransaction( transactionId : string) : void {

    this.loading = true;

    this._transactionService.getTransaction(transactionId).subscribe(
      result => {
        if (result && result.transaction) {
            this.transaction = result.transaction;
            if(this.transaction && this.transaction.type && this.transaction.type.defectPrinter) {
              this.printer = this.transaction.type.defectPrinter;
              let orientation = "p";
              if (this.typePrint === "label") {
                orientation = "l";
              }
              this.doc = new jsPDF(orientation, 'mm', [this.printer.pageWidth, this.printer.pageHigh]);
            }
            this.company = this.transaction.company;
            if (this.typePrint === "turn") {
              this.getShiftClosingByTransaction();
            } else if (this.typePrint === "invoice") {
              if (this.transaction.type.requestArticles) {
                this.getMovementOfArticle();
              } else {
                this.getMovementOfCash();
              }
            } else if (this.typePrint === "current-account") {
              this.toPrintCurrentAccount();
            } else if (this.typePrint === "cash-box") {
              this.getClosingCashBox();
            } else if (this.typePrint === "label") {
              let code;
              if (this.articleStock) {
                code = this.articleStock.article.code;
              } else if (this.article) {
                code = this.article.code;
              }
              this.getBarcode64('code128?value=' + code, this.typePrint);
            } else if (this.typePrint === "kitchen") {
              this.toPrintKitchen();
            } else if (this.typePrint === "IVA"){
              this.getVATBook();
            } else if (this.typePrint === "price-list") {
              this.getArticles();
            }
        } else {
            this.transaction = null;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      });
  }

  public getVATBook() {


    this._transactionService.getVATBook(this.params).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.getShiftClosingByMovementOfArticle();
          } else {
            this.hideMessage();
            this.bookVAT = result;

            this.toPrintVAT();
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
    );

  }

  public toPrintVAT() {

    this.doc = new jsPDF('l', 'mm', [this.printer.pageWidth, this.printer.pageHigh]);
    var folio = 1;

    if (this.params.split("&")[2] && !isNaN(this.params.split("&")[2])) {
      parseInt(this.params.split("&")[2]);
    }

    var row = 10;
    this.doc.setFontType('bold');

    this.doc.setFontSize(12);
    if(this.companyName) {
      this.doc.text(this.companyName, 5, row);
    }

    this.doc.setFontType('normal');
    row += 5;

    if (this.config && this.config[0] && this.config[0].identificationType) {
      this.doc.text(this.config[0].identificationType.name + ":", 5, row);
      this.doc.text(this.config[0].identificationValue, 25, row);
    }

    this.doc.setFontType('bold');
    this.doc.text("N° DE FOLIO:"+folio.toString(),240,row);
    this.centerText(5, 5, 300, 0, row, "LIBRO DE IVA " + this.params.split("&")[0].toString().toUpperCase() + "S - PERÍODO " + this.params.split("&")[1].toString().toUpperCase());

    row += 3;
    this.doc.line(0, row, 400, row);
    row += 5;

    this.doc.setFontSize(9);
    this.doc.text("FECHA", 5, row);
    this.doc.text("RAZÓN SOCIAL", 25, row);
    this.doc.text("IDENTIFICADOR", 65, row);
    this.doc.text("TIPO COMP.", 95, row);
    this.doc.text("NRO COMP.", 120, row);
    this.doc.text("GRAV.", 150, row);
    this.doc.text("EXENTO", 170, row);
    this.doc.text("% IVA", 190, row);
    this.doc.text("IVA", 210, row);
    this.doc.text("PERC. IVA", 230, row);
    this.doc.text("PERC. IIBB", 250, row);
    this.doc.text("TOTAL", 270, row);
    this.doc.setFontSize(8);
    this.doc.setFontType('normal');

    row += 3;
    this.doc.line(0, row, 400, row);
    row += 5;


    let montoTotal = 0
    let totalGravado = 0;
    let totalIVA = 0;
    let totalExento = 0;

    for (let i = 0; i < this.bookVAT.length; i++) {

      let total = 0
      let gravado = 0;
      let porcentajeIVA = 0;
      let iva = 0;
      let exento = 0;
      if (!this.bookVAT[i].GRAVADO) this.bookVAT[i].GRAVADO = 0;
      if (!this.bookVAT[i].IVA_PORCENTAJE) {
        this.bookVAT[i].IVA_PORCENTAJE = 0;
      } else {
        porcentajeIVA = this.bookVAT[i].IVA_PORCENTAJE;
      }
      if (!this.bookVAT[i].IVA) this.bookVAT[i].IVA = 0;
      if (!this.bookVAT[i].EXENT_NOGRAV) this.bookVAT[i].EXENT_NOGRAV = 0;

      if (this.params.split("&")[0].toString() == "Venta") {
        if (this.bookVAT[i].movement === "Entrada") {
          gravado = this.bookVAT[i].GRAVADO;
          iva = this.bookVAT[i].IVA;
          exento = this.bookVAT[i].EXENT_NOGRAV;
        } else {
          gravado = -this.bookVAT[i].GRAVADO;
          iva = iva -this.bookVAT[i].IVA;
          exento = -this.bookVAT[i].EXENT_NOGRAV;
        }
      } else {
        if (this.bookVAT[i].movement === "Entrada") {
          gravado = -this.bookVAT[i].GRAVADO;
          iva = -this.bookVAT[i].IVA;
          exento = -this.bookVAT[i].EXENT_NOGRAV;
        } else {
          gravado = +this.bookVAT[i].GRAVADO;
          iva = +this.bookVAT[i].IVA;
          exento = +this.bookVAT[i].EXENT_NOGRAV;
        }
      }

      totalGravado += gravado;
      totalExento += exento;
      totalIVA += iva;
      total = gravado + iva + exento;
      montoTotal += total;

      this.doc.setFontSize(8);
      this.doc.setFontType('normal');

      this.doc.text(this.dateFormat.transform(this.bookVAT[i].endDate, 'DD/MM/YYYY'), 5, row);

      if (this.bookVAT[i].nameCompany) {
        this.doc.text(this.bookVAT[i].nameCompany.substr(0,25), 25, row);
      } else {
        this.doc.text("CONSUMIDOR FINAL".substr(0, 25), 25, row);
      }

      if(this.bookVAT[i].identificationValue && this.bookVAT.identificationValue != '' ) {
        this.doc.text(this.bookVAT[i].identificationValue.toString(), 70, row);
      } else {
        this.doc.text("00000000000", 70, row);
      }

      if (this.bookVAT[i].labelPrint && this.bookVAT[i].labelPrint !== "") {
         this.doc.text((this.bookVAT[i].labelPrint).toString(), 95, row);
      } else {
        this.doc.text((this.bookVAT[i].typeName).toString(), 95, row);
      }

      this.doc.text(this.padString((this.bookVAT[i].origin).toString(), 5)+"-"+this.bookVAT[i].letter+"-"+this.padString((this.bookVAT[i].number).toString(), 8), 120, row);

      let printGravado = "0,00";
      let printExento = "0,00";
      let printPorcentajeIVA = "0,00";
      let printIVA = "0,00";
      let printTotal = "0,00";
      if ((this.roundNumber.transform(gravado)).toString().split(".")[1]) {
        if (this.roundNumber.transform(gravado).toString().split(".")[1].length === 1) {
          printGravado = gravado.toLocaleString('de-DE') + "0";
        } else {
          printGravado = gravado.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(gravado)) {
        printGravado = gravado.toLocaleString('de-DE') + ",00";
      }

      if ((this.roundNumber.transform(exento)).toString().split(".")[1]) {
        if (this.roundNumber.transform(exento).toString().split(".")[1].length === 1) {
          printExento = exento.toLocaleString('de-DE') + "0";
        } else {
          printExento = exento.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(exento)) {
        printExento = exento.toLocaleString('de-DE') + ",00";
      }

      if ((this.roundNumber.transform(porcentajeIVA)).toString().split(".")[1]) {
        if (this.roundNumber.transform(porcentajeIVA).toString().split(".")[1].length === 1) {
          printPorcentajeIVA = porcentajeIVA.toLocaleString('de-DE') + "0";
        } else {
          printPorcentajeIVA = porcentajeIVA.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(porcentajeIVA)) {
        printPorcentajeIVA = porcentajeIVA.toLocaleString('de-DE') + ",00";
      }

      if ((this.roundNumber.transform(iva)).toString().split(".")[1]) {
        if (this.roundNumber.transform(iva).toString().split(".")[1].length === 1) {
          printIVA = iva.toLocaleString('de-DE') + "0";
        } else {
          printIVA = iva.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(iva)) {
        printIVA = iva.toLocaleString('de-DE') + ",00";
      }

      if ((this.roundNumber.transform(total)).toString().split(".")[1]) {
        if (this.roundNumber.transform(total).toString().split(".")[1].length === 1) {
          printTotal = total.toLocaleString('de-DE') + "0";
        } else {
          printTotal = total.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(total)) {
        printTotal = total.toLocaleString('de-DE') + ",00";
      }

      this.doc.text(printGravado, 152, row);
      this.doc.text(printExento, 172, row);
      this.doc.text(printPorcentajeIVA, 192, row);
      this.doc.text(printIVA, 212, row);
      this.doc.text("0,00", 232, row);
      this.doc.text("0,00", 252, row);
      this.doc.text(printTotal, 272, row);

      row += 5;

      if (row >= 190 ) {

        row += 3;
        this.doc.line(0, row, 400, row);
        row += 5;

        this.doc.addPage();

        var row = 10;
        this.doc.setFontType('bold');

        this.doc.setFontSize(12);
        if (this.companyName) {
          this.doc.text(this.companyName, 5, row);
        }

        this.doc.setFontType('normal');
        row += 5;
        if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
          this.doc.text(this.config[0].companyIdentificationType.name + ":", 5, row);
          this.doc.text(this.config[0].companyIdentificationValue, 25, row);
        }

        this.doc.setFontType('bold');
        folio = folio + 1;
        this.doc.text("N° DE FOLIO:"+folio.toString(),240,row);
        this.centerText(5, 5, 300, 0, row, "LIBRO DE IVA " + this.params.split("&")[0].toString().toUpperCase() + "S - PERÍODO " + this.params.split("&")[1].toString().toUpperCase());

        row += 3;
        this.doc.line(0, row, 400, row);
        row += 5;

        this.doc.setFontSize(9);
        this.doc.text("FECHA", 5, row);
        this.doc.text("RAZÓN SOCIAL", 25, row);
        this.doc.text("IDENTIFICADOR", 65, row);
        this.doc.text("TIPO COMP.", 95, row);
        this.doc.text("NRO COMP.", 120, row);
        this.doc.text("GRAV.", 150, row);
        this.doc.text("EXENTO", 170, row);
        this.doc.text("% IVA", 190, row);
        this.doc.text("IVA", 210, row);
        this.doc.text("PERC. IVA", 230, row);
        this.doc.text("PERC. IIBB", 250, row);
        this.doc.text("TOTAL", 270, row);
        this.doc.setFontSize(8);
        this.doc.setFontType('normal');

        row += 3;
        this.doc.line(0, row, 400, row);
        row += 5;
      }
    }


    this.doc.line(0, row, 400, row);
    row += 5;
    this.doc.setFontType('bold');

    let printGravado = "0,00";
    let printExento = "0,00";
    let printIVA = "0,00";
    let printTotal = "0,00";
    if ((this.roundNumber.transform(totalGravado)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalGravado).toString().split(".")[1].length === 1) {
        printGravado = this.roundNumber.transform(totalGravado).toLocaleString('de-DE') + "0";
      } else {
        printGravado = this.roundNumber.transform(totalGravado).toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalGravado)) {
      printGravado = this.roundNumber.transform(totalGravado).toLocaleString('de-DE') + ",00";
    }

    if ((this.roundNumber.transform(totalExento)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalExento).toString().split(".")[1].length === 1) {
        printExento = this.roundNumber.transform(totalExento).toLocaleString('de-DE') + "0";
      } else {
        printExento = this.roundNumber.transform(totalExento).toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalExento)) {
      printExento = this.roundNumber.transform(totalExento).toLocaleString('de-DE') + ",00";
    }

    if ((this.roundNumber.transform(totalIVA)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalIVA).toString().split(".")[1].length === 1) {
        printIVA = this.roundNumber.transform(totalIVA) + "0";
      } else {
        printIVA = this.roundNumber.transform(totalIVA).toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalIVA)) {
      printIVA = this.roundNumber.transform(totalIVA).toLocaleString('de-DE') + ",00";
    }

    if ((this.roundNumber.transform(montoTotal)).toString().split(".")[1]) {
      if (this.roundNumber.transform(montoTotal).toString().split(".")[1].length === 1) {

        printTotal = this.roundNumber.transform(montoTotal).toLocaleString('de-DE') + "0";
      } else {

        printTotal = this.roundNumber.transform(montoTotal).toLocaleString('de-DE');

      }
    } else if (this.roundNumber.transform(montoTotal)) {

      printTotal = this.roundNumber.transform(montoTotal).toLocaleString('de-DE') + ",00";
    }

    this.doc.text(printGravado, 152, row);
    this.doc.text(printExento, 172, row);
    this.doc.text(printIVA, 212, row);
    this.doc.text("0,00", 232, row);
    this.doc.text("0,00", 252, row);
    this.doc.text(printTotal, 272, row);


    this.doc.setFontType('normal');
    row += 3;
    this.doc.line(0, row, 400, row);
    this.finishImpression();
  }

  public printPriceList(): void {
    
    var row = 15;
    var margin = 5;
    this.doc.setFontType('bold');

    this.doc.setFontSize(12);
    if (this.companyName) {
      this.doc.text(this.companyName, 5, row);
    }

    this.doc.setFontType('normal');
    row += 5;
    if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
      this.doc.text(this.config[0].companyIdentificationType.name + ":", margin, row);
      this.doc.text(this.config[0].companyIdentificationValue, 25, row);
    }

    this.doc.setFontType('bold');
    this.centerText(margin, margin, this.printer.pageWidth, 0, row, "LISTA DE PRECIOS AL " + this.dateFormat.transform(new Date(), 'DD/MM/YYYY'));

    row += 3;
    this.doc.line(0, row, 400, row);
    row += 5;

    // Encabezado de la tabla de Detalle de Productos
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Código", 5, row);
    this.doc.text("Descripción", 25, row);
    this.doc.text("Marca", 90, row);
    this.doc.text("Rubro", 130, row);
    this.doc.text("Precio", 185, row);
    this.doc.setFontType('normal');

    row += 3;
    this.doc.line(0, row, 400, row);
    row += 5;

    let page = 1;

    // // Detalle de productos
    if(this.articles && this.articles.length > 0) {
      for(let article of this.articles) {

        if(article.code) {
          this.doc.text(article.code, 5, row);
        }
        if (article.description) {
          this.doc.text(article.description, 25, row);
        }
        if (article.make && article.make.description) {
          this.doc.text(article.make.description, 90, row);
        }
        if (article.category && article.category.description) {
          this.doc.text(article.category.description, 130, row);
        }
        if (article.salePrice) {
          this.doc.text("$" + article.salePrice.toString(), 185, row);
        }
        row += 5;

        if (row >= (this.printer.pageHigh - 20)) {

          if(page === 120) {
            break;
          }
          this.doc.addPage();

          var row = 15;
          var margin = 5;
          this.doc.setFontType('bold');

          this.doc.setFontSize(12);
          if (this.companyName) {
            this.doc.text(this.companyName, 5, row);
          }

          this.doc.setFontType('normal');
          row += 5;
          if (this.config && this.config[0] && this.config[0].companyIdentificationType) {
            this.doc.text(this.config[0].companyIdentificationType.name + ":", margin, row);
            this.doc.text(this.config[0].companyIdentificationValue, 25, row);
          }

          this.doc.setFontType('bold');
          this.centerText(margin, margin, this.printer.pageWidth, 0, row, "LISTA DE PRECIOS AL " + this.dateFormat.transform(new Date(), 'DD/MM/YYYY'));

          row += 3;
          this.doc.line(0, row, 400, row);
          row += 5;

          // Encabezado de la tabla de Detalle de Productos
          this.doc.setFontType('bold');
          this.doc.setFontSize(this.fontSizes.normal);
          this.doc.text("Código", 5, row);
          this.doc.text("Descripción", 25, row);
          this.doc.text("Marca", 90, row);
          this.doc.text("Rubro", 130, row);
          this.doc.text("Precio", 185, row);
          this.doc.setFontType('normal');

          row += 3;
          this.doc.line(0, row, 400, row);
          row += 5;
        }
      }
    }
    this.finishImpression();
  }

  public getArticles(): void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sort = {};

    // FILTRAMOS LA CONSULTA
    let match = { type: ArticleType.Final, operationType: { $ne: "D" } };

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      type:1,
      code:1,
      description:1,
      salePrice:1,
      "category.description": 1,
      "make.description": 1,
      operationType: 1,
    }

    // AGRUPAMOS EL RESULTADO
    let group = { };
    let skip = 0;
    let limit = 0;
    
    this._articleService.getArticlesV2(
        project, // PROJECT
        match, // MATCH
        sort, // SORT
        group, // GROUP
        limit, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        if (result && result.articles) {
            this.articles = result.articles;
        } else {
            this.articles = null;
        }
        this.loading = false;
        this.printPriceList();
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.printPriceList();
      }
    );
  }

  public getClosingCashBox(): void {

    this.loading = true;

    this._cashBoxService.getClosingCashBox(this.cashBox._id).subscribe(
      result => {
        if (!result || result.length <= 0) {
          if (this.printer.pageWidth < 150) {
            this.toPrintCashBox(undefined);
          } else if (this.printer.pageHigh > 150) {
            this.toPrintCashBoxReport(undefined);
          } else {
            this.toPrintCashBoxReport(undefined);
          }
        } else {
          if (this.printer.pageWidth < 150) {
            this.toPrintCashBox(result);
          } else if (this.printer.pageHigh > 150) {
            this.toPrintCashBoxReport(result);
          } else {
            this.toPrintCashBoxReport(result);
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

  public getShiftClosingByTransaction(): void {

    this.loading = true;

    this._turnService.getShiftClosingByTransaction(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.getShiftClosingByMovementOfArticle();
        } else {
          this.hideMessage();
          this.shiftClosingTransaction = result.shiftClosing;
          this.getShiftClosingByMovementOfArticle();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfArticle(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfArticle(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.getShiftClosingByMovementOfCash();
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfArticle = result.shiftClosing;
          this.getShiftClosingByMovementOfCash();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfCash(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfCash(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.toPrintTurn();
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfCash = result.shiftClosing;
          this.toPrintTurn();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticle.getMovementsOfTransaction(this.transactionId).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          this.showMessage("No se encontraron productos en la transacción", 'info', false);
          this.loading = false;
        } else {
          this.hideMessage();
          this.movementsOfArticles = result.movementsOfArticles;

          if(!this.transaction.type.requestPaymentMethods) {
            if (this.transaction.type.electronics) {
              if( Config.country === 'AR' &&
                  this.transaction.CAE &&
                  this.transaction.CAEExpirationDate) {
                  this.calculateBarcodeAR();
              } else if ( Config.country === 'MX' &&
                          this.transaction.stringSAT &&
                          this.transaction.SATStamp &&
                          this.transaction.CFDStamp) {
                  this.calculateBarcodeMX();
              } else {
                if (this.printer.pageWidth < 150) {
                  this.toPrintRoll();
                } else if (this.printer.pageHigh > 150) {
                  this.toPrintInvoice();
                } else {
                  this.toPrintInvoice();
                }
              }
            } else {
              if (this.printer.pageWidth < 150) {
                this.toPrintRoll();
              } else if (this.printer.pageHigh > 150) {
                this.toPrintInvoice();
              } else {
                this.toPrintInvoice();
              }
            }
          } else {
            this.getMovementOfCash();
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

  public getMovementOfCash(): void {
    this.loading = true;

    console.log(this.transactionId);

    this._movementOfCash.getMovementOfCashesByTransaction(this.transactionId).subscribe(
      result => {
        if (!result.movementsOfCashes) {
          this.showMessage("No se encontraron movimientos en la transacción", 'info', false);
          this.loading = false;
        } else {
          this.hideMessage();
          this.movementsOfCashes = result.movementsOfCashes;
          if(!this.transaction.type.requestArticles) {
            this.toPrintPayment();
          } else {
            if (Config.country === 'AR' &&
                this.transaction.CAE &&
                this.transaction.CAEExpirationDate) {
              this.calculateBarcodeAR();
            } else if (Config.country === 'MX' &&
                      this.transaction.stringSAT &&
                      this.transaction.CFDStamp &&
                      this.transaction.SATStamp) {
              this.calculateBarcodeMX();
            } else {
              if (this.printer.pageWidth < 150) {
                this.toPrintRoll();
              } else if (this.printer.pageHigh > 150) {
                this.toPrintInvoice();
              } else {
                this.toPrintInvoice();
              }
            }
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

  public toPrintPayment(): void {

    // Encabezado de la transacción
    this.getHeader(true);
    this.getClient();

    // Numeración de la transacción
    this.doc.setFontSize(this.fontSizes.extraLarge);

    if (this.transaction.type.labelPrint &&
      this.transaction.type.labelPrint !== '') {
      this.centerText(5, 5, 105, 105, 10, this.transaction.type.labelPrint);
    } else {
      this.centerText(5, 5, 105, 105, 10, this.transaction.type.name);
    }
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.setFontType('bold');
    this.doc.text("Comp. Nº:", 110, 20);
    this.doc.setFontType('normal');
    if(Config.country === 'AR') {
      this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 10), 130, 20);
    } else {
      this.doc.text(this.padString(this.transaction.number, 10), 130, 20);
    }
    this.doc.setFontType('bold');
    this.doc.text("Fecha:", 110, 25);
    this.doc.setFontType('normal');
    if (this.transaction.endDate) {
      this.doc.text(this.dateFormat.transform(this.transaction.endDate, 'DD/MM/YYYY'), 125, 25);
    } else {
      this.doc.text(this.dateFormat.transform(this.transaction.startDate, 'DD/MM/YYYY'), 125, 25);
    }

    // Letra de transacción
    // Letra de transacción
    if (this.transaction.letter && this.transaction.letter !== "") {
      // Dibujar la linea cortada para la letra
      this.doc.line(105, 16, 105, 50); //vertical letra
      this.doc.setFontSize(this.fontSizes.extraLarge);
      this.doc.setFontType('bold');
      this.doc.setDrawColor("Black");
      this.doc.rect(100, 3, 10, 10);
      this.centerText(5, 5, 210, 0, 10, this.transaction.letter);
      if (this.transaction.type.codes && Config.country === 'AR') {
        for (let i = 0; i < this.transaction.type.codes.length; i++) {
          if (this.transaction.letter === this.transaction.type.codes[i].letter) {
            this.doc.setFontSize('8');
            this.doc.text("Cod:" + this.padString((this.transaction.type.codes[i].code).toString(), 2), 101, 16);
          }
        }
      }
    } else {
      // Dibujar la linea cortada para la letra
      this.doc.line(105, 0, 105, 50); //vertical letra
    }
    this.doc.setFontType('normal');
    this.doc.setFontSize(this.fontSizes.normal);

    // Encabezado de la tabla de Detalle de Productos
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Detalle", 25, 77);
    if (this.transaction.type && this.transaction.type.showPrices) {
      this.doc.text("Total", 185, 77);
      this.doc.setFontType('normal');
    }

    // Detalle de productos
    var row = 85;

    if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {

      for (var i = 0; i < this.movementsOfCashes.length; i++) {

        if (this.movementsOfCashes[i].type.name) {
          this.doc.text(this.movementsOfCashes[i].type.name, 25, row);
        }

        if (this.movementsOfCashes[i].amountPaid) {
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfCashes[i].amountPaid), 185, row);
        }

        if (this.movementsOfCashes[i].number) {
          row += 4;
          this.doc.text("Comprobante: " + this.movementsOfCashes[i].number, 27, row);
        }

        if (this.movementsOfCashes[i].expirationDate) {
          row += 4;
          this.doc.text("Vencimiento: " + this.dateFormat.transform(this.movementsOfCashes[i].expirationDate, 'DD/MM/YYYY'), 27, row);
        }

        if (this.movementsOfCashes[i].bank){
          row += 4;
          this.doc.text("Banco: "+this.movementsOfCashes[i].bank, 27, row);
        }

        if(this.movementsOfCashes[i].titular){
          row += 4;
          this.doc.text("Titular: "+this.movementsOfCashes[i].titular, 27, row);
        }

        if (this.movementsOfCashes[i].CUIT) {
          row += 4;
          this.doc.text("CUIT: " + this.movementsOfCashes[i].CUIT, 27, row);
        }

        if (this.movementsOfCashes[i].deliveredBy) {
          row += 4;
          this.doc.text("Entregado Por: " + this.movementsOfCashes[i].deliveredBy, 27, row);
        }

        if (this.movementsOfCashes[i].receiver) {
          row += 4;
          this.doc.text("Recibido Por: " + this.movementsOfCashes[i].receiver, 27, row);
        }

        if (this.movementsOfCashes[i].observation) {
          this.doc.setFontStyle("italic");
          this.doc.text(this.movementsOfCashes[i].observation, 25, row + 5);
          this.doc.setFontStyle("normal");
        }

        row += 8;
      }
    }

    if (this.transaction.type && this.transaction.type.showPrices) {

      let rowTotals = 247;
      this.doc.setFontType('bold');


      rowTotals += 8;
      this.doc.setFontSize(this.fontSizes.extraLarge);
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.large);
      this.doc.text("Total:", 147, rowTotals);
      this.doc.setFontType('normal');
      this.doc.text("$ " + this.roundNumber.transform(this.transaction.totalPrice), 180, rowTotals);
      this.doc.setFontSize(this.fontSizes.normal);
    }

    this.doc.setFontType('bold');
    this.doc.text("Observaciones: "+this.transaction.observation+" "+this.movementsOfCashes[0].observation, 10, 246);
    this.doc.setFontType('normal');
    this.doc.text('', 38, 250);

    this.getGreeting();
    this.getFooter();

    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      this.finishImpression();
    } else {
      this.getCompanyPicture(10, 5, 80, 40, true);
    }
  }

  public calculateBarcodeAR(): void {

    let codeInvoice = 0;

    if (this.transaction.type.codes && this.transaction.type.codes.length > 0) {
      for (let y: number = 0; y < this.transaction.type.codes.length; y++) {
        if (this.transaction.letter == this.transaction.type.codes[y].letter) {
          codeInvoice = this.transaction.type.codes[y].code;
        }
      }
    }

    let date = (this.transaction.CAEExpirationDate.split('T')[0].replace('-','')).replace('-','');

    let digit = ((this.config[0].companyIdentificationValue).replace('-', '')).replace('-', '') +
                  codeInvoice +
                  this.transaction.origin +
                  this.transaction.CAE + date;

    let uno = 0;
    let dos = 0;

    if(digit && digit.length > 0) {
      for (let z: number = 0; z < digit.length; z++) {
        if (z % 2 == 1) {
          uno = uno + parseInt(digit[z]);
        } else {
          dos = dos + parseInt(digit[z]);
        }
      }
    }

    let h = (uno * 3) + dos;
    let checkDigit = 0;

    while (h % 10 != 0) {
      h++;
      checkDigit++
    }

    this.getBarcode64('interleaved2of5?value=' + ((this.config[0].companyIdentificationValue).replace('-', '')).replace('-', '')
      + codeInvoice
      + this.transaction.origin
      + this.transaction.CAE
      + date
      + checkDigit,'invoice');
  }

  public calculateBarcodeMX(): void {
    let cadena = '%3Fre=' + this.config[0].companyIdentificationValue + '%26rr=' + this.company.identificationValue + '%26tt=' + this.transaction.totalPrice.toFixed(6) + '%26id=' + this.transaction.stringSAT.split('||')[1].split('||')[0];
    this.getBarcode64('qr?value=' + cadena, 'invoice');
  }

  public toPrintCashBox(close): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", 'info', false);
    let decimalPipe = new DeprecatedDecimalPipe('es-AR');

    //Cabecera del ticket
    var margin = 5;
    var row = 10;
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.centerText(margin, margin, 80, 0, row, this.config[0].companyName);
    this.doc.setFontType('normal');
    this.doc.setFontSize(this.fontSizes.normal);

    // Detalle de la caja
    row += 5;
    if (this.cashBox.employee) { this.doc.text('Cajero: ' + this.cashBox.employee.name, margin, row) };
    if (this.cashBox.openingDate) { this.doc.text('Apertura: ' + this.dateFormat.transform(this.cashBox.openingDate, 'DD/MM/YYYY HH:mm:ss'), margin, row += 5) };
    if (this.cashBox.closingDate) { this.doc.text('Cierre: ' + this.dateFormat.transform(this.cashBox.closingDate, 'DD/MM/YYYY HH:mm:ss'), margin, row += 5) };

    let openingAmounts = [];
    let closingAmounts = [];
    let inputAmounts = [];
    let amountsInput = [];
    let amountsInputCanceled = [];
    let inputAmountsCanceled = [];
    let outputAmounts = [];
    let amountsOutput = [];
    let amountsOutputCanceled = [];
    let outputAmountsCanceled = [];

    if (close && close.length > 0) {
      for (let i = 0; i < close.length; i++) {
        // SUMA MONTO APERTURA
        if (close[i].type.cashOpening && close[i].state === 'Cerrado') {
          if (openingAmounts[close[i]['movement-of-cash']['type']['name']]) {
            openingAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            openingAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO CIERRE
        if (close[i].type.cashClosing && close[i].state === 'Cerrado') {
          if (closingAmounts[close[i]['movement-of-cash']['type']['name']]) {
            closingAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            closingAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Cerrado') {
          if (inputAmounts[close[i]['movement-of-cash']['type']['name']]) {
            inputAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            inputAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Cerrado') {
          if (outputAmounts[close[i]['movement-of-cash']['type']['name']]) {
            outputAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            outputAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA CANTIDAD ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Cerrado') {
          if (amountsInput[close[i]['movement-of-cash']['type']['name']]) {
            amountsInput[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            amountsInput[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }

        // SUMA CANTIDAD SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Cerrado') {
          if (amountsOutput[close[i]['movement-of-cash']['type']['name']]) {
            amountsOutput[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            amountsOutput[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }

        // SUMA MONTO ANULADO ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Anulado') {
          if (amountsInputCanceled[close[i]['movement-of-cash']['type']['name']]) {
            amountsInputCanceled[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            amountsInputCanceled[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO ANULADO SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Anulado') {
          if (amountsOutputCanceled[close[i]['movement-of-cash']['type']['name']]) {
            amountsOutputCanceled[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            amountsOutputCanceled[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }

        // SUMA CANTIDAD ANULADO ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Anulado') {
          if (inputAmountsCanceled[close[i]['movement-of-cash']['type']['name']]) {
            inputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            inputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA CANTIDAD ANULADO SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Anulado') {
          if (outputAmountsCanceled[close[i]['movement-of-cash']['type']['name']]) {
            outputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            outputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }
      }
    }

    let input: number = 0;
    let output: number = 0;
    let openCash: number = 0;
    let closeCash: number = 0;

    this.doc.setFontType('bold');
    this.doc.text("Detalle de Apertura:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(openingAmounts).length > 0) {
      for (let k of Object.keys(openingAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(openingAmounts[k], '1.2-2'), 60, row);
        openCash += openingAmounts[k];
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(openCash, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Entradas:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(inputAmounts).length > 0) {
      for (let k of Object.keys(inputAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(inputAmounts[k], '1.2-2'), 60, row);
        input += inputAmounts[k];
        this.doc.setFontType('italic');
        if (amountsInput[k] === 1) {
          this.doc.text(amountsInput[k] + ' operación', margin + 10, row += 5);
        } else {
          this.doc.text(amountsInput[k] + ' operaciones', margin + 10, row += 5);
        }
        this.doc.setFontType('normal');
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(input, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Salidas:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(outputAmounts).length > 0) {
      for (let k of Object.keys(outputAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(outputAmounts[k], '1.2-2'), 60, row);
        output += outputAmounts[k];
        this.doc.setFontType('italic');
        if (amountsOutput[k] === 1) {
          this.doc.text(amountsOutput[k] + ' operación', margin + 10, row += 5);
        } else {
          this.doc.text(amountsOutput[k] + ' operaciones', margin + 10, row += 5);
        }
        this.doc.setFontType('normal');
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(output, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Detalle de Cierre:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(closingAmounts).length > 0) {
      for (let k of Object.keys(closingAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(closingAmounts[k], '1.2-2'), 60, row);
        closeCash += closingAmounts[k];
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(closeCash, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Diferencia de caja:", margin, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(closeCash - ((openCash + input) - output), '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    // this.doc.setFontType('italic');
    // this.doc.text("Observaciones:", margin, row += 5);
    // this.doc.setFontType('normal');

    // this.doc.setFontType('bold');
    // this.doc.text("Entradas anuladas:", margin + 5, row += 5);
    // this.doc.setFontType('normal');
    // if (Object.keys(inputAmountsCanceled).length > 0) {
    //   for (let k of Object.keys(inputAmountsCanceled)) {
    //     this.doc.text('- ' + k, margin + 5 + 5, row += 5);
    //     this.doc.text('$ ' + decimalPipe.transform(inputAmountsCanceled[k], '1.2-2'), 60, row);
    //     this.doc.setFontType('italic');
    //     if (amountsInputCanceled[k] === 1) {
    //       this.doc.text(amountsInputCanceled[k] + ' operación', margin + 5 + 10, row += 5);
    //     } else {
    //       this.doc.text(amountsInputCanceled[k] + ' operaciones', margin + 5 + 10, row += 5);
    //     }
    //     this.doc.setFontType('normal');
    //   }
    // } else {
    //   this.doc.setFontType('italic');
    //   this.doc.text('No se encontraron operaciones', margin + 5 + 10, row += 5);
    //   this.doc.setFontType('normal');
    // }

    // this.doc.setFontType('bold');
    // this.doc.text("Salidas anuladas:", margin + 5, row += 5);
    // this.doc.setFontType('normal');
    // if (Object.keys(outputAmountsCanceled).length > 0) {
    //   for (let k of Object.keys(outputAmountsCanceled)) {
    //     this.doc.text('- ' + k, margin + 5 + 5, row += 5);
    //     this.doc.text('$ ' + decimalPipe.transform(outputAmountsCanceled[k], '1.2-2'), 60, row);
    //     this.doc.setFontType('italic');
    //     if (amountsOutputCanceled[k] === 1) {
    //       this.doc.text(amountsOutputCanceled[k] + ' operación', margin + 5 + 10, row += 5);
    //     } else {
    //       this.doc.text(amountsOutputCanceled[k] + ' operaciones', margin + 5 + 10, row += 5);
    //     }
    //     this.doc.setFontType('normal');
    //   }
    // } else {
    //   this.doc.setFontType('italic');
    //   this.doc.text('No se encontraron operaciones', margin + 5 + 10, row += 5);
    //   this.doc.setFontType('normal');
    // }

    // Pie de la impresión
    this.doc.setFontStyle("normal");
    this.doc.setTextColor(164, 164, 164);
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Generado en https://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 290);
    this.doc.setTextColor(0, 0, 0);

    this.finishImpression();
  }

  public toPrintCashBoxReport(close): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", 'info', false);
    let decimalPipe = new DeprecatedDecimalPipe('es-AR');

    let margin = 8;

    this.getHeader(false);

    // Nombre del comprobante
    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.text("Cierre de Caja", 140, 10);
    this.doc.setFontSize(this.fontSizes.normal);

    // Detalle de cierre
    var row = 55;

    // Detalle de la caja
    this.doc.setFontType('bold');
    this.doc.text("Cajero:", margin, row);
    this.doc.setFontType('normal');
    if (this.cashBox.employee) this.doc.text(this.cashBox.employee.name, 40, row);
    this.doc.setFontType('bold');
    this.doc.text("Apertura:", margin, row += 5);
    this.doc.setFontType('normal');
    if (this.cashBox.openingDate) this.doc.text(this.dateFormat.transform(this.cashBox.openingDate, 'DD/MM/YYYY HH:mm:ss'), 40, row);
    this.doc.setFontType('bold');
    this.doc.text("Cierre:", margin, row += 5);
    this.doc.setFontType('normal');
    if (this.cashBox.closingDate) this.doc.text(this.dateFormat.transform(this.cashBox.closingDate, 'DD/MM/YYYY HH:mm:ss'), 40, row);

    let openingAmounts = [];
    let closingAmounts = [];
    let inputAmounts = [];
    let amountsInput = [];
    let amountsInputCanceled = [];
    let inputAmountsCanceled = [];
    let outputAmounts = [];
    let amountsOutput = [];
    let amountsOutputCanceled = [];
    let outputAmountsCanceled = [];

    if (close && close.length > 0) {
      for (let i = 0; i < close.length; i++) {
        // SUMA MONTO APERTURA
        if (close[i].type.cashOpening && close[i].state === 'Cerrado') {
          if (openingAmounts[close[i]['movement-of-cash']['type']['name']]) {
            openingAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            openingAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO CIERRE
        if (close[i].type.cashClosing && close[i].state === 'Cerrado') {
          if (closingAmounts[close[i]['movement-of-cash']['type']['name']]) {
            closingAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            closingAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Cerrado') {
          if (inputAmounts[close[i]['movement-of-cash']['type']['name']]) {
            inputAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            inputAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Cerrado') {
          if (outputAmounts[close[i]['movement-of-cash']['type']['name']]) {
            outputAmounts[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            outputAmounts[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA CANTIDAD ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Cerrado') {
          if (amountsInput[close[i]['movement-of-cash']['type']['name']]) {
            amountsInput[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            amountsInput[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }

        // SUMA CANTIDAD SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Cerrado') {
          if (amountsOutput[close[i]['movement-of-cash']['type']['name']]) {
            amountsOutput[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            amountsOutput[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }

        // SUMA MONTO ANULADO ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Anulado') {
          if (amountsInputCanceled[close[i]['movement-of-cash']['type']['name']]) {
            amountsInputCanceled[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            amountsInputCanceled[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA MONTO ANULADO SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Anulado') {
          if (amountsOutputCanceled[close[i]['movement-of-cash']['type']['name']]) {
            amountsOutputCanceled[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            amountsOutputCanceled[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }

        // SUMA CANTIDAD ANULADO ENTRADA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Entrada' && close[i].state === 'Anulado') {
          if (inputAmountsCanceled[close[i]['movement-of-cash']['type']['name']]) {
            inputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] += close[i]['movement-of-cash']['amountPaid'];
          } else {
            inputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] = close[i]['movement-of-cash']['amountPaid'];
          }
        }

        // SUMA CANTIDAD ANULADO SALIDA
        if (!close[i].type.cashClosing && !close[i].type.cashOpening && close[i].type.movement === 'Salida' && close[i].state === 'Anulado') {
          if (outputAmountsCanceled[close[i]['movement-of-cash']['type']['name']]) {
            outputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] += 1;
          } else {
            outputAmountsCanceled[close[i]['movement-of-cash']['type']['name']] = 1;
          }
        }
      }
    }

    let input: number = 0;
    let output: number = 0;
    let openCash: number = 0;
    let closeCash: number = 0;

    this.doc.setFontType('bold');
    this.doc.text("Detalle de Apertura:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(openingAmounts).length > 0) {
      for (let k of Object.keys(openingAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(openingAmounts[k], '1.2-2'), 60, row);
        openCash += openingAmounts[k];
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(openCash, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Entradas:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(inputAmounts).length > 0) {
      for (let k of Object.keys(inputAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(inputAmounts[k], '1.2-2'), 60, row);
        input += inputAmounts[k];
        this.doc.setFontType('italic');
        if (amountsInput[k] === 1) {
          this.doc.text(amountsInput[k] + ' operación', margin + 10, row += 5);
        } else {
          this.doc.text(amountsInput[k] + ' operaciones', margin + 10, row += 5);
        }
        this.doc.setFontType('normal');
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(input, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Salidas:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(outputAmounts).length > 0) {
      for (let k of Object.keys(outputAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(outputAmounts[k], '1.2-2'), 60, row);
        output += outputAmounts[k];
        this.doc.setFontType('italic');
        if (amountsOutput[k] === 1) {
          this.doc.text(amountsOutput[k] + ' operación', margin + 10, row += 5);
        } else {
          this.doc.text(amountsOutput[k] + ' operaciones', margin + 10, row += 5);
        }
        this.doc.setFontType('normal');
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(output, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Detalle de Cierre:", margin, row += 5);
    this.doc.setFontType('normal');
    if (Object.keys(closingAmounts).length > 0) {
      for (let k of Object.keys(closingAmounts)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        this.doc.text('$ ' + decimalPipe.transform(closingAmounts[k], '1.2-2'), 60, row);
        closeCash += closingAmounts[k];
      }
    } else {
      this.doc.setFontType('italic');
      this.doc.text('No se encontraron operaciones', margin + 10, row += 5);
      this.doc.setFontType('normal');
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(closeCash, '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    this.doc.setFontType('bold');
    this.doc.text("Diferencia de caja:", margin, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(closeCash - ((openCash + input) - output), '1.2-2'), 60, row);
    this.doc.setFontType('normal');

    // this.doc.setFontType('italic');
    // this.doc.text("Observaciones:", margin, row += 5);
    // this.doc.setFontType('normal');

    // this.doc.setFontType('bold');
    // this.doc.text("Entradas anuladas:", margin + 5, row += 5);
    // this.doc.setFontType('normal');
    // if (Object.keys(inputAmountsCanceled).length > 0) {
    //   for (let k of Object.keys(inputAmountsCanceled)) {
    //     this.doc.text('- ' + k, margin + 5 + 5, row += 5);
    //     this.doc.text('$ ' + decimalPipe.transform(inputAmountsCanceled[k], '1.2-2'), 60, row);
    //     this.doc.setFontType('italic');
    //     if (amountsInputCanceled[k] === 1) {
    //       this.doc.text(amountsInputCanceled[k] + ' operación', margin + 5 + 10, row += 5);
    //     } else {
    //       this.doc.text(amountsInputCanceled[k] + ' operaciones', margin + 5 + 10, row += 5);
    //     }
    //     this.doc.setFontType('normal');
    //   }
    // } else {
    //   this.doc.setFontType('italic');
    //   this.doc.text('No se encontraron operaciones', margin + 5 + 10, row += 5);
    //   this.doc.setFontType('normal');
    // }

    // this.doc.setFontType('bold');
    // this.doc.text("Salidas anuladas:", margin + 5, row += 5);
    // this.doc.setFontType('normal');
    // if (Object.keys(outputAmountsCanceled).length > 0) {
    //   for (let k of Object.keys(outputAmountsCanceled)) {
    //     this.doc.text('- ' + k, margin + 5 + 5, row += 5);
    //     this.doc.text('$ ' + decimalPipe.transform(outputAmountsCanceled[k], '1.2-2'), 60, row);
    //     this.doc.setFontType('italic');
    //     if (amountsOutputCanceled[k] === 1) {
    //       this.doc.text(amountsOutputCanceled[k] + ' operación', margin + 5 + 10, row += 5);
    //     } else {
    //       this.doc.text(amountsOutputCanceled[k] + ' operaciones', margin + 5 + 10, row += 5);
    //     }
    //     this.doc.setFontType('normal');
    //   }
    // } else {
    //   this.doc.setFontType('italic');
    //   this.doc.text('No se encontraron operaciones', margin + 5 + 10, row += 5);
    //   this.doc.setFontType('normal');
    // }

    // Pie de la impresión
    this.doc.setFontStyle("normal");
    this.doc.setTextColor(164, 164, 164);
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Generado en https://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 290);
    this.doc.setTextColor(0, 0, 0);

    this.finishImpression();
  }

  public toPrintTurn(): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", 'info', false);

    this.getHeader(false);

    let decimalPipe = new DeprecatedDecimalPipe('es-AR');

    // Título
    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.text("Cierre de Turno", 140, 10);
    this.doc.setFontSize(this.fontSizes.large);
    this.doc.setFontType('normal');

    // Detalle del turno
    let row = 70;
    if (this.turn.employee) { this.doc.text('Mozo: ' + this.turn.employee.name, 15, row) };
    if (this.turn.startDate) { this.doc.text('Apertura: ' + this.dateFormat.transform(this.turn.startDate, 'DD/MM/YYYY HH:mm'), 15, row += 8) };
    if (this.turn.endDate) { this.doc.text('Cierre: ' + this.dateFormat.transform(this.turn.endDate, 'DD/MM/YYYY HH:mm'), 15, row += 8) };
    if (this.shiftClosingTransaction) { this.doc.text('Facturado: $ ' + decimalPipe.transform(this.shiftClosingTransaction.invoicedAmount, '1.2-2'), 15, row += 8) };
    if (!this.shiftClosingTransaction) { this.doc.text('Facturado: $0.00', 15, row += 8) };
    if (this.shiftClosingTransaction) { this.doc.text('Tickets: ' + this.shiftClosingTransaction.amountOrders, 15, row += 8) };
    if (!this.shiftClosingTransaction) { this.doc.text('Tickets: 0', 15, row += 8) };
    if (this.shiftClosingTransaction) { this.doc.text('Tiques Anulados: ' + this.shiftClosingTransaction.amountOrdersCanceled, 15, row += 8) };
    if (!this.shiftClosingTransaction) { this.doc.text('Tickets Anulados: 0', 15, row += 8) };
    if (this.shiftClosingTransaction && this.shiftClosingTransaction.detailCanceled && this.shiftClosingTransaction.detailCanceled.length > 0) {
      this.doc.text('Detalle de Tickets Anulados:', 15, row += 8)
      for (let i = 0; i < this.shiftClosingTransaction.detailCanceled.length; i++) {
        let transaction = this.shiftClosingTransaction.detailCanceled[i];
        if(Config.country === 'AR') {
          this.doc.text("TK " + this.padString(transaction.origin, 4) + "-" + transaction.letter + "-" + this.padString(transaction.number, 10) + " por $" + transaction.totalPrice, 30, row += 8);
        } else {
          this.doc.text("TK " + transaction.letter + "-" + this.padString(transaction.number, 10) + " por $" + transaction.totalPrice, 30, row += 8);
        }
      }
    }
    if (this.shiftClosingMovementOfArticle && this.shiftClosingMovementOfArticle.deletedItems.length > 0) {
      this.doc.text('Detalle de Productos Anulados:', 15, row += 8)
      for (let i = 0; i < this.shiftClosingMovementOfArticle.deletedItems.length; i++) {
        let movementOfArticle = this.shiftClosingMovementOfArticle.deletedItems[i];
        if(Config.country === 'AR') {
          this.doc.text('' + movementOfArticle.amount + " " + movementOfArticle.description + " anulado en TK " + this.padString(movementOfArticle.transaction.origin, 4) + "-" + movementOfArticle.transaction.letter + "-" + this.padString(movementOfArticle.transaction.number, 10), 30, row += 8);
        } else {
          this.doc.text('' + movementOfArticle.amount + " " + movementOfArticle.description + " anulado en TK " + movementOfArticle.transaction.letter + "-" + this.padString(movementOfArticle.transaction.number, 10), 30, row += 8);
        }
      }
    }
    if (this.shiftClosingMovementOfCash && this.shiftClosingTransaction) { this.doc.text('Detalle de Medios de Pago', 15, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.cash !== 0) { this.doc.text('Efectivo: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.cash, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.currentAccount !== 0) { this.doc.text('Cuenta Corriente: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.currentAccount, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.creditCard !== 0) { this.doc.text('Tarjeta de Crédito: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.creditCard, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.debitCard !== 0) { this.doc.text('Tarjeta de Débito: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.debitCard, '1.2-2'), 30, row += 8) };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.thirdPartyCheck !== 0) { this.doc.text('Cheque de Terceros: $' + decimalPipe.transform(this.shiftClosingMovementOfCash.thirdPartyCheck, '1.2-2'), 30, row += 8) };

    this.getFooter();
    this.finishImpression();
  }

  public getHeader(logoPrint: boolean = false): void {

    this.doc.setDrawColor(110, 110, 110);

    // Dibujar lineas horizontales
    this.doc.line(0, 50, 240, 50);

    // Detalle Emisor
    if (this.config && this.config[0]) {
      this.doc.setFontSize(this.fontSizes.normal);

      if (this.config[0].companyIdentificationType) {
        this.doc.setFontType('bold');
        this.doc.text(this.config[0].companyIdentificationType.name + ":", 110, 35);
        this.doc.setFontType('normal');
        this.doc.text(this.config[0].companyIdentificationValue, 122, 35);
      }

      if(this.config[0].country === 'AR') {
        this.doc.setFontType('bold');
        this.doc.text("Ingresos Brutos:", 110, 40);
        this.doc.setFontType('normal');
        if (this.config[0].companyGrossIncome) {
          this.doc.text(this.config[0].companyGrossIncome, 140, 40);
        }
      }

      this.doc.setFontType('bold');
      this.doc.text("Inicio de Actividades:", 110, 45);
      this.doc.setFontType('normal');
      if (this.config[0].companyStartOfActivity) {
        this.doc.text(this.dateFormat.transform(this.config[0].companyStartOfActivity, 'DD/MM/YYYY'), 149, 45);
      }

      // DATOS DE LA EMPRESA O IMAGEN
      if (!logoPrint || !this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
        this.getCompanyData();
      }
    }
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.setFontType('normal');
  }

  public getCompanyData(): void {

    let margin: number = 5;

    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.setFontType('bold');
    if (this.config[0].companyFantasyName) {
      if (this.config[0].companyFantasyName.length > 23) {
        this.doc.setFontSize(this.fontSizes.normal);
        this.centerText(margin, margin, 105, 0, 20, this.config[0].companyFantasyName);
      } else {
        this.centerText(margin, margin, 105, 0, 20, this.config[0].companyFantasyName);
      }
    } else {
      if (this.config[0].companyName.length > 23) {
        this.doc.setFontSize(this.fontSizes.normal);
        this.centerText(margin, margin, 105, 0, 20, this.config[0].companyName);
      } else {
        this.centerText(margin, margin, 105, 0, 20, this.config[0].companyName);
      }
    }
    this.doc.setFontSize(this.fontSizes.normal);

    this.doc.setFontType('bold');
    this.doc.text("Razón Social:", margin, 30);
    this.doc.setFontType('normal');
    if (this.config[0].companyName) {
      this.doc.text(this.config[0].companyName.slice(0, 34), 30, 30);
    }

    this.doc.setFontType('bold');
    this.doc.text("Teléfono:", margin, 35);
    this.doc.setFontType('normal');
    if (this.config[0].companyPhone) {
      this.doc.text(this.config[0].companyPhone, 23, 35);
    }

    this.doc.setFontType('bold');
    this.doc.text("Domicilio Comercial:", margin, 40);
    this.doc.setFontType('normal');
    if (this.config[0].companyAddress) {
      this.doc.text(this.config[0].companyAddress, 42, 40);
    }

    this.doc.setFontType('bold');
    if(Config.country === 'AR') {
      this.doc.text("Condición de IVA:", margin, 45);
    } else {
      this.doc.text("Condición de IVA:", margin, 45);
    }
    this.doc.setFontType('normal');
    if (this.config[0].companyVatCondition) {
      this.doc.text(this.config[0].companyVatCondition.description.slice(0, 31), 36, 45);
    }
  }

  public getCompanyPicture(lmargin, rmargin, width, height, finish: boolean = false): void {

    this.loading = true;
    this._configService.getCompanyPicture(this.config[0]['companyPicture']).subscribe(
      result => {
        if (!result.imageBase64) {
          this.getCompanyData();
          if (finish) {
            this.finishImpression();
          }
          this.loading = false;
        } else {
          this.hideMessage();
          let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
          this.doc.addImage(imageURL, 'jpeg', lmargin, rmargin, width, height);
          if (finish) {
            this.finishImpression();
          }
        }
        this.loading = false;
      },
      error => {
        this.getCompanyData();
        if (finish) {
          this.finishImpression();
        }
        this.loading = false;
      }
    );
  }

  public getClient() {

    let margin = 5;

    // Lineas divisorias horizontales para el receptor
    this.doc.line(0, 72, 240, 72);
    this.doc.line(0, 80, 240, 80);

    // Detalle receptor
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.setFontType('bold');
    this.doc.text("Nombre y Apellido:", margin, 55);
    if (Config.country === 'AR') {
      this.doc.text("Condición de IVA:", margin, 65);
    } else {
      this.doc.text("Régimen Fiscal:", margin, 65);
    }
    if (this.config[0].country === 'AR') {
      this.doc.text("Ingresos Brutos:", margin, 70);
    }
    this.doc.text("Dirección:", 110, 55);
    this.doc.text("Teléfono:", 110, 60);
    this.doc.text("Localidad:", 110, 65);
    this.doc.setFontType('normal');

    if (this.company) {
      if(this.company.name) {
        this.doc.text(this.company.name.slice(0, 32), 42, 55);
      }
      if (this.company.identificationValue && this.company.identificationValue !== '') {
        this.doc.setFontType('bold');
        this.doc.text(this.company.identificationType.name + ":", margin, 60);
        this.doc.setFontType('normal');
        this.doc.text(this.company.identificationValue, 42, 60);
      }
      this.doc.setFontType('normal');
      if (this.company.vatCondition && this.company.vatCondition.description) {
        this.doc.text(this.company.vatCondition.description, 42, 65);
      }
      if (this.company.grossIncome) {
        this.doc.text(this.company.grossIncome, 42, 70);
      }
      if (this.company.address) {
        this.doc.text(this.company.address, 130, 55);
      }
      if (this.company.phones) {
        this.doc.text(this.company.phones, 130, 60);
      }
      if (this.company.city) {
        this.doc.text(this.company.city, 130, 65);
      }
    } else {
      this.doc.setFontType('bold');
      this.doc.text("CUIT:", 8, 60);
      this.doc.setFontType('normal');
      this.doc.text("Consumidor Final", 40, 65);
    }
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.setFontType('normal');
  }

  public centerText(lMargin, rMargin, pdfInMM, startPdf, height, text): void {

    if (text) {
      var pageCenter = pdfInMM / 2;

      var lines = this.doc.splitTextToSize(text, (pdfInMM - lMargin - rMargin));
      var dim = this.doc.getTextDimensions(text);
      var lineHeight = dim.h;
      if(lines && lines.length > 0) {
        for (var i = 0; i < lines.length; i++) {
          let lineTop = (lineHeight / 2) * i;
          this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center')
        }
      }
    }
  }

  public toPrintCurrentAccount(): void {

    let margin = 5;

    this.getHeader(false);
    this.getClient();

    // Encabezado de la tabla de Detalle de transacciones
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Fecha", margin, 77);
    this.doc.text("Tipo Comp.", 25, 77);
    this.doc.text("Nro Comprobante", 53, 77);
    this.doc.text("Monto", 90, 77);
    this.doc.text("Método", 110, 77);
    this.doc.text("Debe", 145, 77);
    this.doc.text("Haber", 165, 77);
    this.doc.text("Saldo", 185, 77);
    this.doc.setFontType('normal');

    // Nombre del comprobante
    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.text("Cuenta Corriente", 140, 10);

    // Detalle de comprobantes
    var row = 85;

    this.doc.setFontSize(this.fontSizes.normal);
    if (this.items && this.items.length > 0) {
      let i = 0;
      for (let item of this.items) {
        if (item.transactionEndDate) {
          this.doc.text(this.dateFormat.transform(item.transactionEndDate, 'DD/MM/YYYY'), margin, row);
        } else {
          this.doc.text(this.dateFormat.transform(item.transactionStartDate, 'DD/MM/YYYY'), margin, row);
        }
        if (item.transactionTypeLabelPrint &&
            item.transactionTypeLabelPrint !== '') {
          this.doc.text(item.transactionTypeLabelPrint.slice(0, 15), 25, row);
        } else {
          this.doc.text(item.transactionTypeName.slice(0, 15), 25, row);
        }
        if(Config.country === 'AR') {
          this.doc.text(this.padString(item.transactionOrigin, 4) + "-" + item.transactionLetter + "-" + this.padString(item.transactionNumber, 10), 53, row);
        } else {
          this.doc.text(item.transactionLetter + "-" + this.padString(item.transactionNumber, 10), 53, row);
        }
        this.doc.text("$ " + this.roundNumber.transform(item.transactionTotalPrice), 90, row);
        this.doc.text(item.paymentMethodName.slice(0, 22), 110, row);
        this.doc.text("$ " + this.roundNumber.transform(item.debe), 145, row);
        this.doc.text("$ " + this.roundNumber.transform(item.haber), 165, row);
        this.doc.setFontType('bold');
        this.doc.text("$ " + this.roundNumber.transform(item.balance), 185, row);
        this.doc.setFontType('normal');

        row += 8;
        i++;

        if (i == 20) {

          i = 0;

          this.getGreeting();
          this.getFooter();
          row = 85;
          this.doc.addPage();
          this.getHeader(false);
          this.getClient();

          // Encabezado de la tabla de Detalle de transacciones
          this.doc.setFontType('bold');
          this.doc.setFontSize(this.fontSizes.normal);
          this.doc.text("Fecha", margin, 77);
          this.doc.text("Tipo Comp.", 25, 77);
          this.doc.text("Nro Comprobante.", 53, 77);
          this.doc.text("Monto", 90, 77);
          this.doc.text("Método", 110, 77);
          this.doc.text("Debe", 145, 77);
          this.doc.text("Haber", 165, 77);
          this.doc.text("Saldo", 185, 77);
          this.doc.setFontType('normal');

          // Nombre del comprobante
          this.doc.setFontSize(this.fontSizes.extraLarge);
          this.doc.text("Cuenta Corriente", 140, 10);

          // Detalle de comprobantes
          var row = 85;

          this.doc.setFontSize(this.fontSizes.normal);
        }
      }
    }

    // Mostrar total de cuenta corriente
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.doc.text("Saldo de la Cuenta Corriente", margin, 246);
    this.doc.text("$ " + this.roundNumber.transform(this.balance), 175, 246);
    this.doc.line(0, 250, 240, 250);

    this.getGreeting();
    this.getFooter();

    this.finishImpression();
  }

  public toPrintInvoice(): void {

    var transport =0;

    // Encabezado de la transacción
    this.getHeader(true);
    this.getClient();

    // Numeración de la transacción
    this.doc.setFontSize(this.fontSizes.extraLarge);

    if (this.transaction.type.labelPrint &&
      this.transaction.type.labelPrint !== '') {
      this.centerText(5, 5, 105, 105, 10, this.transaction.type.labelPrint);
    } else {
      this.centerText(5, 5, 105, 105, 10, this.transaction.type.name);
    }
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.setFontType('bold');
    this.doc.text("Comp. Nº:", 110, 25);
    this.doc.setFontType('normal');
    if(Config.country === 'AR') {
      this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 8), 130, 25);
    } else {
      this.doc.text(this.padString(this.transaction.number, 8), 130, 25);
    }
    this.doc.setFontType('bold');
    this.doc.text("Fecha:", 110, 30);
    this.doc.setFontType('normal');
    if (this.transaction.endDate) {
      this.doc.text(this.dateFormat.transform(this.transaction.endDate, 'DD/MM/YYYY'), 125, 30);
    } else {
      this.doc.text(this.dateFormat.transform(this.transaction.startDate, 'DD/MM/YYYY'), 125, 30);
    }

    // Letra de transacción
    if (this.transaction.letter && this.transaction.letter !== "") {
      // Dibujar la linea cortada para la letra
      this.doc.line(105, 16, 105, 50); //vertical letra
      this.doc.setFontSize(this.fontSizes.extraLarge);
      this.doc.setFontType('bold');
      this.doc.setDrawColor("Black");
      this.doc.rect(100, 3, 10, 10);
      this.centerText(5, 5, 210, 0, 10, this.transaction.letter);
      if (this.transaction.type.codes && Config.country === 'AR') {
        for (let i = 0; i < this.transaction.type.codes.length; i++) {
          if(this.transaction.letter === this.transaction.type.codes[i].letter){
            this.doc.setFontSize('8');
            this.doc.text("Cod:"+this.padString((this.transaction.type.codes[i].code).toString(),2),101,16);
          }
        }
      }
    } else {
      // Dibujar la linea cortada para la letra
      this.doc.line(105, 0, 105, 50); //vertical letra
    }

    this.doc.setFontType('normal');
    this.doc.setFontSize('normal');
    // Encabezado de la tabla de Detalle de Productos
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Cant.", 5, 77);
    this.doc.text("Código", 18, 77);
    this.doc.text("Detalle", 45, 77);
    if (this.transaction.type && this.transaction.type.showPrices) {
      this.doc.text("Precio U.", 155, 77);
      this.doc.text("Total", 185, 77);
    }
    this.doc.setFontType('normal');

    // Detalle de productos
    var row = 85;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (var i = 0; i < this.movementsOfArticles.length; i++) {
        if (this.movementsOfArticles[i].amount) {
          this.doc.text((this.movementsOfArticles[i].amount).toString(), 6, row);
        }
        if (this.movementsOfArticles[i].code) {
          this.doc.text((this.movementsOfArticles[i].code).toString(), 19, row);
        }
        if (this.movementsOfArticles[i].description) {
          if( this.movementsOfArticles[i].category &&
              this.movementsOfArticles[i].category.visibleInvoice &&
              this.movementsOfArticles[i].make &&
              this.movementsOfArticles[i].make.visibleSale) {
            if (this.movementsOfArticles[i].category.visibleInvoice &&
                this.movementsOfArticles[i].make.visibleSale) {
              this.doc.text((this.movementsOfArticles[i].description + ' - ' +
                            this.movementsOfArticles[i].category.description + ' - ' +
                            this.movementsOfArticles[i].make.description).slice(0, 49), 46, row);
            } else if ( this.movementsOfArticles[i].category.visibleInvoice &&
                        !this.movementsOfArticles[i].make.visibleSale) {
              this.doc.text((this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].category.description).slice(0, 49), 46, row);
            } else if (this.movementsOfArticles[i].make.visibleSale && !this.movementsOfArticles[i].category.visibleInvoice) {
              this.doc.text((this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].make.description).slice(0, 49), 46, row);
            }
          } else {
            if (this.movementsOfArticles[i].category &&
                this.movementsOfArticles[i].category.visibleInvoice &&
                this.movementsOfArticles[i].category.visibleInvoice){
              this.doc.text((this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].category.description).slice(0, 49), 46, row);
            }else if (this.movementsOfArticles[i].make && this.movementsOfArticles[i].make.visibleSale && this.movementsOfArticles[i].make.visibleSale) {
              this.doc.text((this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].make.description).slice(0, 49), 46, row);
            } else
              this.doc.text((this.movementsOfArticles[i].description).slice(0, 49), 46, row);
          }

        }
        if (this.transaction.type && this.transaction.type.showPrices) {
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice / this.movementsOfArticles[i].amount), 155, row);
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice), 185, row);
        }
        if (this.movementsOfArticles[i].notes) {
          this.doc.setFontStyle("italic");
          this.doc.text(this.movementsOfArticles[i].notes.slice(0, 49), 46, row + 5);
          this.doc.setFontStyle("normal");
          row += 5;
        }

        transport = transport + this.movementsOfArticles[i].salePrice;

        row += 8;

        if((i+1)%19 === 0) {
          this.doc.setFontType("bold");
          this.doc.text("TRANSPORTE:".toString(),25, row);
          this.doc.text(this.roundNumber.transform(transport).toString(),185, row);
          this.getCompanyPicture(10, 5, 80, 40);
          row = 95;
          this.doc.addPage();

          this.doc.setFontType("bold");

          this.doc.text("TRANSPORTE:".toString(),25,85);
          this.doc.text(this.roundNumber.transform(transport).toString(),185,85);

          this.getHeader(true);
          this.getClient();

          // Dibujar la linea cortada para la letra
          this.doc.line(105, 13, 105, 50); //vertical letra

          // Numeración de la transacción
          this.doc.setFontSize(this.fontSizes.extraLarge);

          if (this.transaction.type.labelPrint &&
            this.transaction.type.labelPrint !== '') {
            this.centerText(5, 5, 105, 105, 10, this.transaction.type.labelPrint);
          } else {
            this.centerText(5, 5, 105, 105, 10, this.transaction.type.name);
          }
          this.doc.setFontSize(this.fontSizes.normal);
          this.doc.setFontType('bold');
          this.doc.text("Comp. Nº:", 110, 20);
          this.doc.setFontType('normal');
          if (Config.country === 'AR') {
            this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 10), 130, 20);
          } else {
            this.doc.text(this.padString(this.transaction.number, 10), 130, 20);
          }
          this.doc.setFontType('bold');
          this.doc.text("Fecha:", 110, 25);
          this.doc.setFontType('normal');
          if (this.transaction.endDate) {
            this.doc.text(this.dateFormat.transform(this.transaction.endDate, 'DD/MM/YYYY'), 125, 25);
          } else {
            this.doc.text(this.dateFormat.transform(this.transaction.startDate, 'DD/MM/YYYY'), 125, 25);
          }

          // Letra de transacción
          this.doc.setFontSize(this.fontSizes.extraLarge);
          this.doc.setFontType('bold');
          this.doc.setDrawColor("Black");
          this.doc.rect(100, 3, 10, 10);
          this.centerText(5, 5, 210, 0, 10, this.transaction.letter);
          this.doc.setFontType('normal');

          // Encabezado de la tabla de Detalle de Productos
          this.doc.setFontType('bold');
          this.doc.setFontSize(this.fontSizes.normal);
          this.doc.text("Cant", 5, 77);
          this.doc.text("Detalle", 25, 77);
          if (this.transaction.type && this.transaction.type.showPrices) {
            this.doc.text("Precio", 155, 77);
            this.doc.text("Total", 185, 77);
            this.doc.setFontType('normal');
          }
        }
      }
    }

    if (this.transaction.type && this.transaction.type.showPrices) {

      let rowTotals = 247;
      this.doc.setFontType('bold');
      this.doc.text("Subtotal:", 140, rowTotals);
      rowTotals +=8;
      this.doc.text("Descuento:", 140, rowTotals);
      this.doc.setFontType('normal');
      this.doc.text("$ (" + this.roundNumber.transform(this.transaction.discountAmount) + ")", 173, rowTotals);
      let subtotal = this.transaction.totalPrice;

      if (this.transaction.company &&
          this.transaction.company.vatCondition &&
          this.transaction.company.vatCondition.discriminate &&
          this.transaction.type.requestTaxes) {

            if(this.transaction.taxes && this.transaction.taxes.length > 0) {
              for (let tax of this.transaction.taxes) {
                rowTotals += 8;
                this.doc.setFontType('bold');
                this.doc.text(tax.tax.name + ":", 140, rowTotals);
                this.doc.setFontType('normal');
                this.doc.text("$ " + this.roundNumber.transform(tax.taxAmount), 173, rowTotals);
                subtotal -= this.roundNumber.transform(tax.taxAmount);
              }
            }

            if (this.transaction.exempt && this.transaction.exempt > 0) {
              rowTotals += 8;
              this.doc.setFontType('bold');
              this.doc.text("Exento:", 140, rowTotals);
              this.doc.setFontType('normal');
              this.doc.text("$ " + this.roundNumber.transform(this.transaction.exempt), 173, rowTotals);
              subtotal -= this.transaction.exempt;
            }
      }

      if (this.transaction.discountAmount) {
        subtotal += this.transaction.discountAmount;
      }
      this.doc.text("$ " + this.roundNumber.transform((subtotal)).toString(), 173, 247);
      rowTotals += 8;
      this.doc.setFontSize(this.fontSizes.extraLarge);
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.large);
      this.doc.text("Total:", 140, rowTotals);
      this.doc.setFontType('normal');
      this.doc.text("$ " + this.roundNumber.transform(this.transaction.totalPrice), 173, rowTotals);
      this.doc.setFontSize(this.fontSizes.normal);
    }

    if (this.movementsOfCashes && this.movementsOfCashes.length > 0 && this.movementsOfCashes[0].observation) {
      if(Config.country !== 'MX') {
        this.doc.setFontType('bold');
        this.doc.text("Observaciones: ", 10, 246);
        this.doc.setFontType('normal');
        this.doc.text(this.movementsOfCashes[0].observation.slice(0, 53) + " -", 37, 246);
        this.doc.text(this.movementsOfCashes[0].observation.slice(53, 105) + " -", 37, 249);
        this.doc.text(this.movementsOfCashes[0].observation.slice(105, 157) + " -", 37, 252);
        this.doc.text(this.movementsOfCashes[0].observation.slice(157, 210), 37, 255);
      } else {
        this.doc.setFontType('bold');
        this.doc.text("Observaciones: ", 35, 246);
        this.doc.setFontType('normal');
        this.doc.text(this.movementsOfCashes[0].observation.slice(0, 40) + " -", 62, 246);
        this.doc.text(this.movementsOfCashes[0].observation.slice(40, 78) + " -", 62, 249);
        this.doc.text(this.movementsOfCashes[0].observation.slice(78, 122) + " -", 62, 252);
        this.doc.text(this.movementsOfCashes[0].observation.slice(122, 160), 62, 255);
      }
    }

    this.doc.setFontType('normal');
    this.doc.text('', 38, 250);

    if (Config.country === 'AR' &&
        this.transaction.CAE &&
        this.transaction.CAEExpirationDate) {
      this.doc.setFontType('bold');
      this.doc.text("CAE:", 10, 272);
      this.doc.text("Fecha Vto:", 10, 275);
      this.doc.setFontType('normal');
      this.doc.text(this.transaction.CAE, 20, 272);
      this.doc.text(this.dateFormat.transform(this.transaction.CAEExpirationDate, "DD/MM/YYYY"), 32, 275);

      let imgdata = 'data:image/png;base64,' + this.barcode64;

      this.doc.addImage(imgdata, 'PNG', 10, 250, 125, 15);
    } else if (Config.country === 'MX' &&
              this.transaction.stringSAT &&
              this.transaction.SATStamp &&
              this.transaction.CFDStamp) {
                this.doc.setFontSize(this.fontSizes.small);
                let row = 270;
                this.doc.setFontType('bold');
                this.doc.text("Sello SAT:", 10, row);
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.SATStamp.slice(0, 130), 23, row);
                row += 3;
                this.doc.text(this.transaction.SATStamp.slice(130, 265), 10, row);
                row += 3;
                this.doc.text(this.transaction.SATStamp.slice(265, 400), 10, row);
                row += 3;
                this.doc.setFontType('bold');
                this.doc.text("Cadena Original SAT:", 10, row);
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.stringSAT.slice(0, 118), 37, row);
                row += 3;
                this.doc.text(this.transaction.stringSAT.slice(118, 255), 10, row);
                row += 3;
                this.doc.text(this.transaction.stringSAT.slice(255, 390), 10, row);
                row += 3;
                this.doc.text(this.transaction.stringSAT.slice(390, 500), 10, row);
                this.doc.setFontSize(this.fontSizes.normal);

        let imgdata = 'data:image/png;base64,' + this.barcode64;

        this.doc.addImage(imgdata, 'PNG', 10, 245, 20, 20);
    }

    this.getGreeting();
    this.getFooter();

    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      this.finishImpression();
    } else {
      this.getCompanyPicture(10, 5, 80, 40, true);
    }
  }

  public finishImpression(): void {
    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
  }

  public toPrintKitchen() {

    //Cabecera del ticket
    var margin = 5;
    var row = 5;
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.centerText(3, 5, 60, 0, row, "COCINA");
    this.doc.setFontType('normal');
    this.doc.setFontSize(this.fontSizes.normal);

    row += 8;
    this.doc.setFontType('bold');
    this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
    this.doc.setFontType('normal');
    this.doc.text("Fecha: " + this.dateFormat.transform(this.transaction.startDate, 'DD/MM'), 30, row);
    row+= 5;
    this.doc.text("Hora: " + this.dateFormat.transform(this.transaction.startDate, 'hh:ss'), 30, row);

    if (this.transaction.table) {
      row += 5;
      this.doc.setFontType('bold');
      if (this.transaction.employeeOpening) {
        this.doc.text("Mozo: " + this.transaction.employeeOpening.name, margin, row);
      }
      this.doc.text("Mesa: " + this.transaction.table.description, 30, row);
      this.doc.setFontType('normal');
    } else if (this.transaction.employeeOpening) {
      row += 5;
      this.doc.setFontType('bold');
      this.doc.text("Empleado: " + this.transaction.employeeOpening.name, margin, row);
      this.doc.setFontType('normal');
    }

    //Cabecera de la tala de productos
    row += 3;
    this.doc.line(0, row, 80, row);
    row += 5;
    this.doc.text("Cant.", 5, row);
    this.doc.text("Desc.", 30, row);
    row += 3;
    this.doc.line(0, row, 80, row);

    //Cuerpo de la tabla de productos
    row + 5;
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
          row += 5;
          this.centerText(3, 5, 15, 0, row, (movementOfArticle.amount-movementOfArticle.printed
            ).toString());
          if (movementOfArticle.article) {
            this.doc.text(movementOfArticle.article.posDescription, 20, row);
          } else {
            this.doc.text(movementOfArticle.description, 20, row);
          }

          if (movementOfArticle.notes && movementOfArticle.notes !== '') {
            row += 5;
            this.doc.setFontStyle("italic");
            this.doc.text(movementOfArticle.notes, 20, row);
            this.doc.setFontStyle("normal");
          }

      }
    }
    this.finishImpression();
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

    //Cabecera de la tala de productos
    row += 3;
    this.doc.line(0, row, 80, row);
    row += 5;
    this.doc.text("Cant.", 5, row);
    this.doc.text("Desc.", 30, row);
    row += 3;
    this.doc.line(0, row, 80, row);

    //Cuerpo de la tabla de productos
    row + 5;
    this.doc.setFontSize(this.fontSizes.normal);
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (movementOfArticle.printed === 0) {
          row += 5;
          this.centerText(3, 5, 15, 0, row, movementOfArticle.amount.toString());
          if (movementOfArticle.article) {
            this.doc.text(movementOfArticle.article.posDescription, 20, row);
          } else {
            this.doc.text(movementOfArticle.description, 20, row);
          }

          if (movementOfArticle.notes && movementOfArticle.notes !== '') {
            row += 5;
            this.doc.setFontStyle("italic");
            this.doc.text(movementOfArticle.notes, 20, row);
            this.doc.setFontStyle("normal");
          }
        }
      }
    }
    this.finishImpression();
  }

  public toPrintRoll() {

    //Cabecera del ticket
    var margin = 5;
    var row = 5;

    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.large);
      if(this.config[0].companyFantasyName)  {
        this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.config[0].companyFantasyName);
      } else {
        this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.config[0].companyName);
      }
      this.doc.setFontType('normal');
      this.doc.setFontSize(this.fontSizes.normal);
      row +=5;
      this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.config[0].companyAddress);
      row += 5;
      this.centerText(margin, margin, this.printer.pageWidth, 0, row, "tel: " + this.config[0].companyPhone);
      row += 8;
    } else {
      row += 30;
      this.doc.setFontType('normal');
      this.doc.setFontSize(this.fontSizes.normal);
    }

    this.doc.setFontType('bold');
    this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
    this.doc.setFontType('normal');
    this.doc.text(this.dateFormat.transform(this.transaction.startDate, 'DD/MM hh:ss'), (this.printer.pageWidth/1.6), row);
    this.doc.setFontType('normal');

    if(this.transaction.company) {
      if(this.transaction.madein == 'resto' || this.transaction.madein == 'mostrador') {
        row += 5;
        this.doc.setFontType('bold');
        this.doc.text("Cliente : " + this.transaction.company.name, margin, row);
        this.doc.setFontType('normal');
      }
      if(this.transaction.madein == 'delivery') {
        row += 5;
        this.doc.setFontType('bold');
        this.doc.text("Entregar a: " + this.transaction.company.address, margin, row);
        this.doc.setFontType('normal');
      }
    } else {
      if(this.transaction.madein == 'resto' || this.transaction.madein == 'mostrador') {
        row += 5;
        this.doc.setFontType('bold');
        this.doc.text("Cliente : " + "Consumidor Final", margin, row);
        this.doc.setFontType('normal');
      }
    }

    if (this.transaction.madein == 'resto') {
      row += 5;
      this.doc.setFontType('bold');
      if (this.transaction.employeeOpening) {
        this.doc.text("Mozo: " + this.transaction.employeeOpening.name, margin, row);
      }
      if (this.transaction.table){
        this.doc.text("Mesa: " + this.transaction.table.description, 40, row);
      }
      this.doc.setFontType('normal');
    } else if (this.transaction.employeeOpening) {
      row += 5;
      this.doc.setFontType('bold');
      this.doc.text("Empleado: " + this.transaction.employeeOpening.name, margin, row);
      this.doc.setFontType('normal');
    }

    //Cabecera de la tala de productos
    row += 3;
    this.doc.line(0, row, this.printer.pageWidth, row);
    row += 5;
    this.doc.text("Cant.", margin, row);
    this.doc.text("Desc.", this.printer.pageWidth/3, row);
    this.doc.text("Monto", this.printer.pageWidth/1.3, row);
    row += 3;
    this.doc.line(0, row, this.printer.pageWidth, row);

    //Cuerpo de la tabla de productos
    row +5;
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        row += 5;
        this.centerText(margin, margin, 15, 0, row, movementOfArticle.amount.toString());
        if (movementOfArticle.article) {
          if(movementOfArticle.article.posDescription){
            this.doc.text(movementOfArticle.article.posDescription.slice(0, 18), 13, row);
          } else {
          this.doc.text(movementOfArticle.description.slice(0, 18), 13, row);
          }
        } 

        this.doc.text("$ " + this.roundNumber.transform(movementOfArticle.salePrice).toString(), this.printer.pageWidth/1.3, row);

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

    //Pie de la tabla de productos
    row += 5;
    this.doc.line(0, row, 240, row);
    this.doc.setFontStyle('bold');
    row += 5;
    this.doc.setFontSize(15);
    this.centerText(margin, margin, this.printer.pageWidth, 2, row, "TOTAL $ "+ this.transaction.totalPrice);
    //this.doc.text("$ " + this.transaction.totalPrice, this.printer.pageWidth/1.4, row);
    this.doc.setFontStyle("normal");

    // if (this.config[0].footerInvoice) {
    //   this.doc.setFontStyle("italic");
    //   row += 10;
    //   this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.config[0].footerInvoice);
    //   this.doc.setFontStyle("normal");
    // }

    //Pie del ticket
    this.doc.setFontSize(this.fontSizes.xsmall);
    row += 5;
    this.centerText(margin, margin, this.printer.pageWidth, 0, row, "Generado en POSCLOUD.com.ar");
    this.doc.setTextColor(0, 0, 0);

    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      this.finishImpression();
    } else {
      this.getCompanyPicture(3, 3, 40, 26, true);
    }
  }

  public toPrintBarcode(): void {

    if (this.articleStock) {

      this.doc.text(this.articleStock.article.description, 0 , 5);

      let imgdata = 'data:image/png;base64,' + this.barcode64;

      this.doc.addImage(imgdata, 'PNG', 1, 5, this.printer.pageHigh -2, this.printer.pageWidth -5 );

      for (let index = 0; index < this.articleStock.realStock -1 ; index++) {


        this.doc.addPage();

        this.doc.text(this.articleStock.article.description, 0 , 5);

        let imgdata = 'data:image/png;base64,' + this.barcode64;

        this.doc.addImage(imgdata, 'PNG', 1, 5, this.printer.pageHigh -2, this.printer.pageWidth -5 );

      }
      this.finishImpression();
    }  else if (this.article) {

      this.doc.text(this.article.description, 0 , 5);

      let imgdata = 'data:image/png;base64,' + this.barcode64;

      this.doc.addImage(imgdata, 'PNG', 1, 5, this.printer.pageHigh -2, this.printer.pageWidth -5 );
      this.finishImpression();
    }
  }

  public getGreeting() {

    this.doc.setFontStyle("italic");
    this.doc.setFontSize(this.fontSizes.normal);
    // if (this.config[0] && this.config[0].footerInvoice) {
    //   this.doc.text(this.config[0].footerInvoice, 9, 280);
    // } else {
    //   this.doc.text("Gracias por su visita!", 9, 280);
    // }
    this.doc.setFontStyle("normal");
  }

  public getFooter() {

    // Pie de la impresión
    this.doc.line(0, 240, 240, 240);
    this.doc.setFontStyle("normal");
    this.doc.setTextColor(164, 164, 164);
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Generado en https://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 293);
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
    this.alertMessage = '';
  }
}
