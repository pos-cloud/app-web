//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { AuthService } from '../../../services/auth.service';

//Modelos
import { Transaction } from '../../../models/transaction';
import { MovementOfArticle } from '../../../models/movement-of-article';
import { MovementOfCash } from '../../../models/movement-of-cash';
import { Turn } from '../../../models/turn';
import { Printer, PrinterPrintIn, PrinterType } from '../../../models/printer';
import { Company } from '../../../models/company';
import { Config } from '../../../app.config';
import { TransactionType, TransactionMovement, Movements, DescriptionType } from '../../../models/transaction-type';
import { ArticleStock } from '../../../models/article-stock';
import { Article } from '../../../models/article';


//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as jsPDF from 'jspdf';

//Servicios
import { TurnService } from '../../../services/turn.service';
import { PrinterService } from '../../../services/printer.service';
import { PrintService } from '../../../services/print.service';
import { TransactionService } from '../../../services/transaction.service';
import { MovementOfArticleService } from '../../../services/movement-of-article.service';
import { ConfigService } from '../../../services/config.service';
import { TransactionTypeService } from '../../../services/transaction-type.service';
import { ArticleService } from '../../../services/article.service';
import { MovementOfCashService } from '../../../services/movement-of-cash.service';

//Pipes
import { DeprecatedDecimalPipe } from '@angular/common';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { RoundNumberPipe } from '../../../pipes/round-number.pipe';
import { CashBox } from '../../../models/cash-box';
import { CashBoxService } from '../../../services/cash-box.service';
import { TaxClassification } from 'app/models/tax';
import { Taxes } from 'app/models/taxes';
import { ClaimService } from 'app/services/claim.service';
import { MovementOfCancellationService } from 'app/services/movement-of-cancellation.service';

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
  @Input() source : string;
  public loading: boolean;
  public pathLocation: string[];
  public alertMessage: string = '';
  public shiftClosingTransaction;
  public shiftClosingMovementOfArticle;
  public shiftClosingMovementOfCash;
  public companyName: string = Config.companyName;
  public movementsOfArticles2: MovementOfArticle[];
  public movementsOfCashes: MovementOfCash[];
  public config: Config;
  @ViewChild('contentPrinters', {static: true}) contentPrinters: ElementRef;
  @ViewChild('contentTicket', {static: true}) contentTicket: ElementRef;
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
    public _movementOfCashService: MovementOfCashService,
    public _transactionService: TransactionService,
    public _movementOfArticleService: MovementOfArticleService,
    public _configService: ConfigService,
    public _movementOfCancellation : MovementOfCancellationService,
    public _articleService: ArticleService,
    public alertConfig: NgbAlertConfig,
    public _claimService : ClaimService,
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
    
    let units = 'mm';
    let pageWidth = this.printer.pageWidth * 100 / 35.27751646284102;
    let pageHigh = this.printer.pageHigh * 100 / 35.27751646284102;


    this.doc = new jsPDF(orientation, units, [pageWidth, pageHigh]);

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
            } else if (this.typePrint === "kitchen") {
              this.toPrintKitchen();
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
            } else if (this.typePrint === "kitchen") {
              this.toPrintKitchen();
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

    let query = 'where="transaction":"' + this.transaction._id + '"';

    this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
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
    let query = 'where="transaction":"' + this.transaction._id + '"';

    this._movementOfCashService.getMovementsOfCashes(query).subscribe(
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

  public async toPrintPayment() {

    var transport = 0;

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
    this.doc.text("Detalle", 10, 77);
    this.doc.text("Vencimiento",45,77);
    this.doc.text("Número",80,77);
    this.doc.text("Banco", 105,77);
    if (this.transaction.type && this.transaction.type.showPrices) {
      this.doc.text("Total", 185, 77);
      this.doc.setFontType('normal');
    }

    // Detalle de productos
    var row = 85;

    if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {

      for (var i = 0; i < this.movementsOfCashes.length; i++) {

        if (this.movementsOfCashes[i].type.name) {
          this.doc.text(this.movementsOfCashes[i].type.name, 10, row);
        }

        if (this.movementsOfCashes[i].amountPaid) {
          this.doc.text("$ " + this.roundNumber.transform(this.movementsOfCashes[i].amountPaid), 185, row);
        }

        if (this.movementsOfCashes[i].expirationDate) {
          this.doc.text(this.dateFormat.transform(this.movementsOfCashes[i].expirationDate, 'DD/MM/YYYY'), 45, row);
        } else {
          this.doc.text("-",45,row)
        }

        if (this.movementsOfCashes[i].number) {
          this.doc.text(this.movementsOfCashes[i].number, 80, row);
        } else {
          this.doc.text("-", 80, row);
        }
        
        if (this.movementsOfCashes[i].bank) {
          this.doc.text(this.movementsOfCashes[i].bank.name, 105, row);
        } else {
          this.doc.text("-", 105, row);
        }

        if (this.movementsOfCashes[i].observation) {
          this.doc.setFontStyle("italic");
          this.doc.text(this.movementsOfCashes[i].observation, 25, row + 5);
          this.doc.setFontStyle("normal");
        }

        row += 8;

        transport = transport + this.movementsOfCashes[i].amountPaid;


        if(i%21 == 0 && i != 0 ) {

          this.doc.setFontType("bold");
          this.doc.text("TRANSPORTE:".toString(),25, row);
          this.doc.text(this.roundNumber.transform(transport).toString(), 185, row);

          this.doc.addPage();
  
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
          this.doc.text("Detalle", 10, 77);
          this.doc.text("Vencimiento",45,77);
          this.doc.text("Numero",80,77);
          this.doc.text("Banco", 105,77);
          if (this.transaction.type && this.transaction.type.showPrices) {
            this.doc.text("Total", 185, 77);
            this.doc.setFontType('normal');
          }
  
          // Detalle de productos
          var row = 85;

          this.doc.setFontType("bold");
          this.doc.text("TRANSPORTE:".toString(),25, row);
          this.doc.text(this.roundNumber.transform(transport).toString(), 185, row);
          this.doc.setFontType("normal");

          row = 95;
        }
      }
      
    }

    this.doc.setFontSize(this.fontSizes.extraLarge);
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.large);
    this.doc.text("Total:", 147, row);
    this.doc.setFontType('normal');
    this.doc.text("$ " + this.roundNumber.transform(this.transaction.totalPrice), 180, row);
    this.doc.setFontSize(this.fontSizes.normal);
    row += 5;


    await this.getCancellationsOfMovements(this.transactionId)
    
    if(this.transactions) {
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.normal);
      this.doc.line(0, row, 100, row)
      row +=5
      this.doc.text("Comprobantes cancelados",10,row);
      this.doc.text("Total",80,row);
      row +=3
      this.doc.line(0, row, 100, row)
      row +=5
      for (let index = 0; index < this.transactions.length; index++) {
        this.doc.setFontType('normal');
        this.doc.text(this.transactions[index].type.name +"   "+ this.padString(this.transactions[index].origin, 4) + "-" + this.padString(this.transactions[index].number, 8), 10, row);
        this.doc.text("$ " + this.roundNumber.transform(this.transactions[index].totalPrice), 80, row);
        row += 8;
      }
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

  async getCancellationsOfMovements(transactionDestinationViewId) {

    return new Promise((resolve, reject) => {
    
      this.loading = true;

      let match;
  
      match = { "transactionDestination": { $oid: transactionDestinationViewId} , "operationType": { "$ne": "D" } };
      
  
      // CAMPOS A TRAER
      let project = {
        "transactionOrigin": 1,
        "transactionDestination": 1,
        "operationType" : 1
      };
  
      this._movementOfCancellation.getMovementsOfCancellations(
        project, // PROJECT
        match, // MATCH
        { order: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(async result => {
        if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
          this.transactions = new Array();
          for (let index = 0; index < result.movementsOfCancellations.length; index++) {
            let transaction = new Transaction;
            transaction = await this.getTransaction2(result.movementsOfCancellations[index].transactionOrigin)
            
            if(transaction) {
              this.transactions.push(transaction);
            } else {
              resolve(null)
            }
          }
          resolve(true)
        } else {
          resolve(null)
          this.loading = false;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      });
    });
  
   
  }

  public getTransaction2(transactionId: string): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this.loading = true;

      this._transactionService.getTransaction(transactionId).subscribe(
        result => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            this.loading = false;
            resolve(null);
          } else {
            this.hideMessage();
            this.loading = false;
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
          resolve(null);
        }
      );
    });
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
    this.doc.setFontType('normal');

    let max = 0;
    let arrayMax = [];
    if(Object.keys(openingAmounts).length > max) { max = Object.keys(openingAmounts).length; arrayMax = openingAmounts };
    if(Object.keys(inputAmounts).length > max) { max = Object.keys(inputAmounts).length; arrayMax = inputAmounts };
    if(Object.keys(outputAmounts).length > max) { max = Object.keys(outputAmounts).length; arrayMax = outputAmounts };
    if(Object.keys(closingAmounts).length > max) { max = Object.keys(closingAmounts).length; arrayMax = closingAmounts };

    if(Object.keys(arrayMax).length > 0) {
      for (let k of Object.keys(arrayMax)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        if(!openingAmounts[k]) openingAmounts[k] = 0; 
        if(!inputAmounts[k]) inputAmounts[k] = 0; 
        if(!outputAmounts[k]) outputAmounts[k] = 0; 
        if(!closingAmounts[k]) closingAmounts[k] = 0; 
        this.doc.text('$ ' + decimalPipe.transform(closingAmounts[k] - ((openingAmounts[k] + inputAmounts[k]) - outputAmounts[k]), '1.2-2'), 60, row);
      }
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(closeCash - ((openCash + input) - output), '1.2-2'), 60, row);
    this.doc.setFontType('normal');

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
    this.doc.setFontType('normal');

    let max = 0;
    let arrayMax = [];
    if(Object.keys(openingAmounts).length > max) { max = Object.keys(openingAmounts).length; arrayMax = openingAmounts };
    if(Object.keys(inputAmounts).length > max) { max = Object.keys(inputAmounts).length; arrayMax = inputAmounts };
    if(Object.keys(outputAmounts).length > max) { max = Object.keys(outputAmounts).length; arrayMax = outputAmounts };
    if(Object.keys(closingAmounts).length > max) { max = Object.keys(closingAmounts).length; arrayMax = closingAmounts };

    if(Object.keys(arrayMax).length > 0) {
      for (let k of Object.keys(arrayMax)) {
        this.doc.text('- ' + k, margin + 5, row += 5);
        if(!openingAmounts[k]) openingAmounts[k] = 0; 
        if(!inputAmounts[k]) inputAmounts[k] = 0; 
        if(!outputAmounts[k]) outputAmounts[k] = 0; 
        if(!closingAmounts[k]) closingAmounts[k] = 0; 
        this.doc.text('$ ' + decimalPipe.transform(closingAmounts[k] - ((openingAmounts[k] + inputAmounts[k]) - outputAmounts[k]), '1.2-2'), 60, row);
      }
    }
    this.doc.setFontType('bold');
    this.doc.text("Total:", margin + 10, row += 5);
    this.doc.text('$ ' + decimalPipe.transform(closeCash - ((openCash + input) - output), '1.2-2'), 60, row);
    this.doc.setFontType('normal');

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

  async getHeader(logoPrint: boolean = false) {

    return new Promise (async (resolve, reject) => {

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
        } else {
          await this.getCompanyPicture(10, 5, 80, 40);
        }
      }
      this.doc.setFontSize(this.fontSizes.normal);
      this.doc.setFontType('normal');
      resolve(true)

    });

   
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
      this.doc.text("Régimen Fiscal:", margin, 45);
    }
    this.doc.setFontType('normal');
    if (this.config[0].companyVatCondition) {
      this.doc.text(this.config[0].companyVatCondition.description.slice(0, 31), 36, 45);
    }
  }

  async getCompanyPicture(lmargin, rmargin, width, height, finish: boolean = false) {

    return new Promise ((resolve, reject) => {
      this.loading = true;
      this._configService.getCompanyPicture(this.config[0].companyPicture).subscribe(
        result => {
          if (!result.imageBase64) {
            this.getCompanyData();
            if (finish) {
              this.finishImpression();
            }
            this.loading = false;
            resolve(true)
          } else {
            this.hideMessage();
            let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
            this.doc.addImage(imageURL, 'jpeg', lmargin, rmargin, width, height);
            if (finish) {
              this.finishImpression();
              resolve(true)
            }
            resolve(true)
          }
          this.loading = false;
        }
      );
    });
    
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

    let transport = 0;
    let margin = 5;

    this.getHeader(false);
    this.getClient();

    // Encabezado de la tabla de Detalle de transacciones
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Fecha", margin, 77);
    this.doc.text("Tipo Comp.", 25, 77);
    this.doc.text("Nro Comprobante", 53, 77);
    if(this.params.detailsPaymentMethod) {
      this.doc.text("Monto", 90, 77);
      this.doc.text("Método", 110, 77);
    } else {
      this.doc.text("Monto", 110, 77);
    }
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
        if(this.params.detailsPaymentMethod) {
          this.doc.text("$ " + this.roundNumber.transform(item.transactionTotalPrice), 90, row);
          this.doc.text(item.paymentMethodName.slice(0, 22), 110, row);
        } else {
          this.doc.text("$ " + this.roundNumber.transform(item.transactionTotalPrice), 110, row);
        }
        this.doc.text("$ " + this.roundNumber.transform(item.debe), 145, row);
        this.doc.text("$ " + this.roundNumber.transform(item.haber), 165, row);
        this.doc.setFontType('bold');
        this.doc.text("$ " + this.roundNumber.transform(item.balance), 185, row);
        this.doc.setFontType('normal');

        row += 8;
        i++;

        if (i == 20) {

          i = 0;

          this.doc.setFontType("bold");
          this.doc.text("TRANSPORTE:".toString(),25, row);
          this.doc.text("$"+this.roundNumber.transform(item.balance).toString(), 185, row);

          this.getGreeting();
          this.getFooter();
          row = 85;
          this.doc.addPage();

          
          this.doc.setFontType("bold");
          this.doc.text("TRANSPORTE:".toString(),25, row);
          this.doc.text("$"+this.roundNumber.transform(item.balance).toString(), 185, row);
          row += 5;

          this.getHeader(false);
          this.getClient();

          // Encabezado de la tabla de Detalle de transacciones
          this.doc.setFontType('bold');
          this.doc.setFontSize(this.fontSizes.normal);
          this.doc.text("Fecha", margin, 77);
          this.doc.text("Tipo Comp.", 25, 77);
          this.doc.text("Nro Comprobante.", 53, 77);
          this.doc.text("Monto", 110, 77);
          this.doc.text("Debe", 145, 77);
          this.doc.text("Haber", 165, 77);
          this.doc.text("Saldo", 185, 77);
          this.doc.setFontType('normal');

          // Nombre del comprobante
          this.doc.setFontSize(this.fontSizes.extraLarge);
          this.doc.text("Cuenta Corriente", 140, 10);

          // Detalle de comprobantes
          var row = 95;

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

  async toPrintInvoice() {

    var transport =0;

    // Encabezado de la transacción
    if(!this.transaction.type.isPreprinted) {


      if(this.config[0].companyPicture && this.config[0].companyPicture !== 'default.jpg') {
        await this.getCompanyPicture(10, 5, 80, 40);
      } else {
        this.getCompanyData()
      }

      // Detalle Emisor
      this.doc.setDrawColor(110, 110, 110);

      // Dibujar lineas horizontales
      this.doc.line(0, 50, 240, 50);
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
      }
     
      this.doc.setFontSize(this.fontSizes.normal);
      this.doc.setFontType('normal');

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
      this.doc.text("Comp. Nº:", 110, 25);//
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
            if(this.transaction.letter === this.transaction.type.codes[i].letter) {
              this.doc.setFontSize('8');
              this.doc.text("Cod:"+this.padString((this.transaction.type.codes[i].code).toString(),2),101,16);
            }
          }
        }
      } else {
        // Dibujar la linea cortada para la letra
        this.doc.line(105, 0, 105, 50); //vertical letra
      }
    }
    this.getClient();

    

    this.doc.setFontType('normal');
    this.doc.setFontSize('normal');
    // Encabezado de la tabla de Detalle de Productos
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Cant.", 5, 77);
    this.doc.text("Código", 16, 77);
    this.doc.text("Detalle", 45, 77);
    if (this.transaction.type && this.transaction.type.showPrices) {
      this.doc.text("Precio U.", 145, 77);
      if(this.transaction.type.requestTaxes && 
        this.transaction.company &&
        this.transaction.company.vatCondition.discriminate) {
          let col = 165
          this.transaction.taxes.forEach(element => {
            this.doc.text(element.tax.name, col, 77);
            col = col + 10;
          });
      }
      this.doc.text("Total", 192, 77);
    }
    this.doc.setFontType('normal');

    // Detalle de productos
    var row = 85;
    var margin = 5;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (var i = 0; i < this.movementsOfArticles.length; i++) {
        if (this.movementsOfArticles[i].amount) {
          this.doc.text((this.movementsOfArticles[i].amount).toString(), 6, row);
        }
        if (this.movementsOfArticles[i].code) {
          this.doc.text((this.movementsOfArticles[i].code).toString().slice(0,15), 15, row);
        }

        let detalle = ''

        if(this.transaction && this.transaction.type && this.transaction.type.printDescriptionType && this.transaction.type.printDescriptionType === DescriptionType.Description) {
          if (this.movementsOfArticles[i].description) {
            if( this.movementsOfArticles[i].category &&
                this.movementsOfArticles[i].category.visibleInvoice &&
                this.movementsOfArticles[i].make &&
                this.movementsOfArticles[i].make.visibleSale) {
              if (this.movementsOfArticles[i].category.visibleInvoice &&
                  this.movementsOfArticles[i].make.visibleSale) {
                detalle = this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].category.description + ' - ' + this.movementsOfArticles[i].make.description
              } else if ( this.movementsOfArticles[i].category.visibleInvoice &&
                          !this.movementsOfArticles[i].make.visibleSale) {
                detalle = this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].category.description;
              } else if (this.movementsOfArticles[i].make.visibleSale && !this.movementsOfArticles[i].category.visibleInvoice) {
                detalle = this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].make.description;
              }
            } else {
              if (this.movementsOfArticles[i].category &&
                  this.movementsOfArticles[i].category.visibleInvoice &&
                  this.movementsOfArticles[i].category.visibleInvoice) {
                detalle = this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].category.description;
              }else if (this.movementsOfArticles[i].make && this.movementsOfArticles[i].make.visibleSale && this.movementsOfArticles[i].make.visibleSale) {
                detalle = this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].make.description;
              } else
                detalle = this.movementsOfArticles[i].description;
            }
  
          }
        } else {
          if (this.movementsOfArticles[i].article.posDescription) {
            if( this.movementsOfArticles[i].category &&
                this.movementsOfArticles[i].category.visibleInvoice &&
                this.movementsOfArticles[i].make &&
                this.movementsOfArticles[i].make.visibleSale) {
              if (this.movementsOfArticles[i].category.visibleInvoice &&
                  this.movementsOfArticles[i].make.visibleSale) {
                detalle = this.movementsOfArticles[i].article.posDescription + ' - ' +
                              this.movementsOfArticles[i].category.description + ' - ' +
                              this.movementsOfArticles[i].make.description;
              } else if ( this.movementsOfArticles[i].category.visibleInvoice &&
                          !this.movementsOfArticles[i].make.visibleSale) {
                detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].category.description;
              } else if (this.movementsOfArticles[i].make.visibleSale && !this.movementsOfArticles[i].category.visibleInvoice) {
                detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].make.description;
              }
            } else {
              if (this.movementsOfArticles[i].category &&
                  this.movementsOfArticles[i].category.visibleInvoice ) {
                detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].category.description;
              }else if (this.movementsOfArticles[i].make && 
                        this.movementsOfArticles[i].make.visibleSale ) {
                detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].make.description;
              } else
                detalle = this.movementsOfArticles[i].article.posDescription;
            }
  
          }
        }

        if(this.movementsOfArticles[i].otherFields && this.movementsOfArticles[i].otherFields !== null && this.transaction.type.printDescriptionType === DescriptionType.PosDescription) {
          let temp = this.movementsOfArticles[i].article.description.split(' ');
          detalle += " Talle:" + temp.pop();
        }
        
        this.doc.text(detalle.slice(0, 45), 46, row);


        if (this.transaction.type && this.transaction.type.showPrices) {
          if(this.transaction.type.requestTaxes  && 
            this.transaction.company &&
            this.transaction.company.vatCondition.discriminate) {
              let prUnit = 0;
              let colum = 165;
            for(let tax of this.movementsOfArticles[i].taxes) {
                prUnit = prUnit + (tax.taxBase/this.movementsOfArticles[i].amount)
                if(tax.percentage != 0) {
                  this.doc.text("%" + this.roundNumber.transform(tax.percentage,2), colum, row);
                } else {
                  this.doc.text("$" + this.roundNumber.transform(tax.taxAmount,2), colum, row);
                }
                colum = colum + 13;
            }
            this.doc.text("$ " + this.roundNumber.transform(prUnit,2), 145, row);
            this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice, 2), 192, row);
          } else {
            this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice/this.movementsOfArticles[i].amount,2), 145, row);
            this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice,2), 192, row);
          }
          
        }
        if (this.movementsOfArticles[i].notes) {
          this.doc.setFontStyle("italic");
          this.doc.text(this.movementsOfArticles[i].notes.slice(0, 55), 46, row + 5);
          if(this.movementsOfArticles[i].notes.slice(55, 110) != '') {
            row += 5;
            this.doc.text(this.movementsOfArticles[i].notes.slice(55, 110), 46, row + 5);
          }
          if(this.movementsOfArticles[i].notes.slice(110, 165) != '') {
            row += 5;
            this.doc.text(this.movementsOfArticles[i].notes.slice(110, 165), 46, row + 5);
          }
          this.doc.setFontStyle("normal");
          row += 5;
        }

        transport = transport + this.movementsOfArticles[i].salePrice;

        row += 8;

        if(row > 240) {
          this.doc.setFontType("bold");
          this.doc.text("TRANSPORTE:".toString(),25, row);
          this.doc.text(this.roundNumber.transform(transport).toString(), 185, row);
          row = 95;
          this.doc.addPage();

          this.doc.setFontType("bold");

          this.doc.text("TRANSPORTE:".toString(),25,85);
          this.doc.text(this.roundNumber.transform(transport).toString(), 185, 85);

          if(!this.transaction.type.isPreprinted) {

            //this.getHeader(true);
          
            // Detalle Emisor
            this.doc.setDrawColor(110, 110, 110);

            // Dibujar lineas horizontales
            this.doc.line(0, 50, 240, 50);
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
            }
            
            this.doc.setFontSize(this.fontSizes.normal);
            this.doc.setFontType('normal');

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
          this.getClient();
        }
      }
    }

    if (this.transaction.type && this.transaction.type.showPrices) {

      let space;
      if(Config.country === 'MX') {
        space = 6;
      } else {
        space = 8;
      }
      let rowTotals = 247;
      this.doc.setFontType('bold');
      this.doc.text("Subtotal:", 140, rowTotals);
      rowTotals +=space;
      this.doc.text("Descuento:", 140, rowTotals);
      this.doc.setFontType('normal');
      this.doc.text("$ (" + this.roundNumber.transform(this.transaction.discountAmount,2) + ")", 173, rowTotals);
      let subtotal = this.transaction.totalPrice;

      if (this.transaction.company &&
          this.transaction.company.vatCondition &&
          this.transaction.company.vatCondition.discriminate &&
          this.transaction.type.requestTaxes) {

            if(this.transaction.taxes && this.transaction.taxes.length > 0) {
              for (let tax of this.transaction.taxes) {
                rowTotals += space;
                this.doc.setFontType('bold');
                this.doc.text(tax.tax.name + ":", 140, rowTotals);
                this.doc.setFontType('normal');
                this.doc.text("$ " + this.roundNumber.transform(tax.taxAmount), 173, rowTotals);
                subtotal -= this.roundNumber.transform(tax.taxAmount);
              }
            }

            if (this.transaction.exempt && this.transaction.exempt > 0) {
              rowTotals += space;
              this.doc.setFontType('bold');
              this.doc.text("Exento:", 140, rowTotals);
              this.doc.setFontType('normal');
              this.doc.text("$ " + this.roundNumber.transform(this.transaction.exempt,2), 173, rowTotals);
              subtotal -= this.transaction.exempt;
            }
      }

      if (this.transaction.discountAmount) {
        subtotal += this.transaction.discountAmount;
      }
      this.doc.text("$ " + this.roundNumber.transform((subtotal),2).toString(), 173, 247);
      rowTotals += space;
      this.doc.setFontSize(this.fontSizes.extraLarge);
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.large);
      this.doc.text("Total:", 140, rowTotals);
      this.doc.setFontType('normal');
      this.doc.text("$ " + parseFloat(this.roundNumber.transform(this.transaction.totalPrice,2)).toFixed(2), 173, rowTotals);
      this.doc.setFontSize(this.fontSizes.normal);
    }

    row = 246;

    // FORMA DE PAGO
    if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {

      if(Config.country === 'MX' &&
        this.transaction.stringSAT &&
        this.transaction.SATStamp &&
        this.transaction.CFDStamp) {
          this.doc.setFontType('bold');
          this.doc.text("Forma de pago: ", 35, row);
          this.doc.setFontType('normal');
      
          row += 5;

          for(let movementOfCash of this.movementsOfCashes) {
            this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid)).toFixed(2)}`, 35, row);
            this.doc.text(`${movementOfCash.type.name}.`, 65, row);
            row += 5;
          }
      } else {
        this.doc.setFontType('bold');
        this.doc.text("Forma de pago: ", margin, row);
        this.doc.setFontType('normal');
    
        row += 5;

        for(let movementOfCash of this.movementsOfCashes) {
          this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid)).toFixed(2)}`, margin, row);
          this.doc.text(`${movementOfCash.type.name}.`, 28, row);
          row += 5;
        }
      }
    }

    // FIN FORMA DE PAGO

    // OBSERVATION
    
    let observation: string = '';

    if(this.transaction.observation) {
      observation += this.transaction.observation + '.- ';
    }

    if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
      for(let movementOfCash of this.movementsOfCashes) {
        if(movementOfCash.observation) {
          observation += movementOfCash.observation + '.- ';
        }
      }
    }

    if(observation && observation !== '' && !this.transaction.type.requestTransport) {

      if(Config.country === 'MX' &&
        this.transaction.stringSAT &&
        this.transaction.SATStamp &&
        this.transaction.CFDStamp) {
          this.doc.setFontType('bold');
          this.doc.text("Observaciones: ", 35, row);
          this.doc.setFontType('normal');
          
          this.doc.text(observation.slice(0, 45) + "-", 65, row);
          this.doc.text(observation.slice(45, 105) + "-", 35, row += 4);
      } else {
        this.doc.setFontType('bold');
        this.doc.text("Observaciones: ", margin, row);
        this.doc.setFontType('normal');
        
        this.doc.text(observation.slice(0, 60) + "-", 37, row);
        this.doc.text(observation.slice(60, 140) + "-", margin, row += 4);
      }
    } else {
      if(this.transaction.transport) {
        this.doc.setFontType('bold');
        this.doc.text("TRANSPORTE:", margin, row);
        this.doc.text("DOMICILIO:", margin, row + 4);
        this.doc.text("LOCAIDAD:", margin, row + 8);
        this.doc.text("CUIT:", margin, row + 12);
        this.doc.text("CANTIDAD DE BULTOS:", margin, row + 16);
        this.doc.setFontType('normal');
        this.doc.text(this.transaction.transport.name, margin +30, row);
        this.doc.text(this.transaction.transport.address, margin+30, row + 4);
        this.doc.text(this.transaction.transport.city, margin+30, row + 8);
        this.doc.text(this.transaction.transport.identificationValue, margin+30, row + 12);
        row += 16; 
      }
      
    }

    if(this.transaction.type.printSign) {
      row += 10
      this.doc.line(70, row, 120, row)
      this.doc.text("FIRMA CONFORME", 80, row + 5)
    }


    // FIN OBSERVATION

    if (Config.country === 'AR' &&
        this.transaction.CAE &&
        this.transaction.CAEExpirationDate) {
      this.doc.setFontType('bold');
      this.doc.text("CAE:", 10, 282);
      this.doc.text("Fecha Vto:", 10, 287);
      this.doc.setFontType('normal');
      this.doc.text(this.transaction.CAE, 20, 282);
      this.doc.text(this.dateFormat.transform(this.transaction.CAEExpirationDate, "DD/MM/YYYY"), 32, 287);

      let imgdata = 'data:image/png;base64,' + this.barcode64;

      this.doc.addImage(imgdata, 'PNG', margin, 263, 125, 14);
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

  public toPrintInvoiceRoll(): void {

     //Cabecera del ticket
    var margin = 5;
    var row = 5;
    let width = this.printer.pageWidth;
 
    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.large);
      if(this.config[0].companyFantasyName)  {
        this.centerText(margin, margin, width, 0, row, this.config[0].companyFantasyName);
      } else {
        this.centerText(margin, margin, width, 0, row, this.config[0].companyName);
      }
      this.doc.setFontType('small');
      this.doc.setFontSize(this.fontSizes.small);
      row +=3;
      this.centerText(margin, margin, width, 0, row, this.config[0].companyAddress);
      row += 3;
      this.centerText(margin, margin, width, 0, row, "Tel: " + this.config[0].companyPhone);
      row += 3;
      this.centerText(margin,margin,width,0,row, this.config[0].companyVatCondition.description + " - " + this.config[0].companyIdentificationType.name + ":" + this.config[0].companyIdentificationValue)
      row += 3;
      this.centerText(margin,margin,width,0,row, "Ingresos Brutos: " + this.config[0].companyGrossIncome)
      row += 3;
    } else {
      row += 15;
      this.doc.setFontType('small');
      this.doc.setFontSize(this.fontSizes.small);
    }



    //LADO IZQUIERDO
    this.doc.line(0, row, width, row);
    row += 10;
    this.doc.setFontType('blod')
    this.doc.setFontSize(30)
    this.doc.text(20, row, this.transaction.letter)
    row +=3;
    this.doc.setFontSize(5)
    if (this.transaction.type.codes && Config.country === 'AR') {
      for (let i = 0; i < this.transaction.type.codes.length; i++) {
        if (this.transaction.letter === this.transaction.type.codes[i].letter) {
          this.doc.text("Cod:" + this.padString((this.transaction.type.codes[i].code).toString(), 2) , 20, row);
        }
      }
    }
    row +=3;
    this.doc.setFontSize(10)
    this.doc.text("ORIGINAL", 15,row)
    //LADO DERECHO
    this.doc.setFontSize(15)
    this.doc.setFontType('blod')
    if(this.transaction.type.labelPrint) {
      this.doc.text(this.transaction.type.labelPrint,45,25)
    } else {
      this.doc.text(this.transaction.type.name,45,25)
    }
    this.doc.setFontSize(8)
    if(Config.country === 'AR') {
      this.doc.text("N°:" + this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 8), 45, 30);
    } else {
      this.doc.text("N°:" +this.padString(this.transaction.number, 8), 45, 30);
    }
    this.doc.text("Fecha:" +this.dateFormat.transform(this.transaction.endDate, 'DD/MM/YYYY'), 45, 35);
  
    row += 3;
    this.doc.line(0, row, width, row);
    row += 3;

    if(this.transaction.company) {
      this.doc.setFontType('bold');
      this.doc.text("Razón Social : " + this.transaction.company.name, margin, row);
      row += 3;
      this.doc.text( this.transaction.company.identificationType.name + " :" + this.transaction.company.identificationValue, margin, row);
      row += 3;
      this.doc.text("Condición de IVA : " + this.transaction.company.vatCondition.description, margin, row);
      row += 3;
      this.doc.text("Dirección : " + this.transaction.company.address +" " + this.transaction.company.addressNumber, margin, row);
      row += 3;
      this.doc.text("Telefono : " + this.transaction.company.phones, margin, row);
      row += 3;
      this.doc.text("Localidad : " + this.transaction.company.city, margin, row);
      this.doc.setFontType('normal');

    } else {
      if(this.transaction.madein == 'resto' || this.transaction.madein == 'mostrador') {
        this.doc.setFontType('bold');
        this.doc.text("Cliente : " + "Consumidor Final", margin, row);
        this.doc.setFontType('normal');
      }
    }


    row += 3;
    this.doc.line(0, row, width, row);
    row += 3;

    if(this.transaction.cashBox) {
      this.doc.text("Caja : " + this.transaction.cashBox.number, margin, row);
      row += 3;
      this.doc.line(0, row, width, row);
      row += 3;
    }

    this.doc.text("Cant.", margin, row);
    this.doc.text("Descipción", width/3, row);
    this.doc.text("P. unitario", 50, row);
    this.doc.text("Total", width/1.17, row);

    row += 2
    this.doc.line(0, row, width, row);


    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        row += 3;
        this.centerText(margin, margin, 15, 0, row, movementOfArticle.amount.toString());
        this.doc.text(movementOfArticle.description.slice(0, 20), 13, row);
        //this.doc.text("$" + this.roundNumber.transform(movementOfArticle.salePrice/movementOfArticle.amount).toString(), 50, row);

        if (this.transaction.type && this.transaction.type.showPrices) {
          if(this.transaction.type.requestTaxes  && 
            this.transaction.company &&
            this.transaction.company.vatCondition.discriminate) {
              let prUnit = 0;
            for(let tax of movementOfArticle.taxes) {
                prUnit = prUnit + (tax.taxBase/movementOfArticle.amount)
            }
            this.doc.text("$ " + this.roundNumber.transform(prUnit,2), 50, row);
          } else {
            this.doc.text("$ " + this.roundNumber.transform(movementOfArticle.salePrice/movementOfArticle.amount,2), 50, row);
          }
          
        }

        this.doc.text("$" + this.roundNumber.transform(movementOfArticle.salePrice).toString(), width/1.18, row);
        row +=3;
        movementOfArticle.article.taxes.forEach(element => {
          if(element.percentage >= 0) {
            this.doc.text("( IVA: " + this.roundNumber.transform(movementOfArticle.article.taxes[0].percentage).toFixed(2) + " %)",13,row)
          }
        });

        if(movementOfArticle.notes && movementOfArticle.notes !== "") {
          row += 3;
          this.doc.setFontStyle("italic");
          this.doc.setTextColor(90, 90, 90);
          this.doc.text(movementOfArticle.notes, 20, row);
          this.doc.setFontStyle("normal");
          this.doc.setTextColor(0, 0, 0);
        }
      }
    }

    if(this.transaction.company && this.transaction.company.vatCondition && this.transaction.company.vatCondition.discriminate) {
      row += 3;
      this.doc.line(0, row, width, row);
      row += 3;
      this.doc.text("Impuestos: ", 5, row);
      this.doc.setFontType('small');
      this.transaction.taxes.forEach(element => {
        row +=3;
        this.doc.text(element.tax.name +": " + "$" + this.roundNumber.transform(element.taxAmount).toString(), 5, row)
      });
    }

    row += 3;
    this.doc.line(0, row, width, row);
    row += 3;
    this.doc.setFontStyle('bold');
    this.doc.setFontSize(10);
    this.doc.text( "TOTAL $ "+ this.transaction.totalPrice, 50, row);
    this.doc.setFontStyle("small");
    row += 3;

    
    // FORMA DE PAGO
    if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {

      if(Config.country === 'MX' &&
        this.transaction.stringSAT &&
        this.transaction.SATStamp &&
        this.transaction.CFDStamp) {
          this.doc.text("Forma de pago: ", 5, row);
          this.doc.setFontType('small');
      
          row += 5;

          for(let movementOfCash of this.movementsOfCashes) {
            this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid)).toFixed(2)}`, 5, row);
            this.doc.text(`${movementOfCash.type.name}.`, 5, row);
            row += 5;
          }
      } else {
        this.doc.text("Forma de pago: ", margin, row);
        this.doc.setFontType('small');
    
        row += 5;

        for(let movementOfCash of this.movementsOfCashes) {
          this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid)).toFixed(2)}`, margin, row);
          this.doc.text(`${movementOfCash.type.name}.`, 28, row);
          row += 5;
        }
      }
    }

    // FIN FORMA DE PAGO

    row += 3;
    this.doc.line(0, row, width, row);
    row += 4;


    if (Config.country === 'AR' &&
        this.transaction.CAE &&
        this.transaction.CAEExpirationDate) {
      this.doc.setFontType('bold');
      this.doc.text("CAE: " + this.transaction.CAE, margin, row);
      row += 4;
      this.doc.text("Fecha Vto: " + this.dateFormat.transform(this.transaction.CAEExpirationDate, "DD/MM/YYYY"), margin, row);
      let imgdata = 'data:image/png;base64,' + this.barcode64;
      row += 4;
      this.doc.addImage(imgdata, 'PNG', margin, row, width - 10, 10);

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

        this.doc.addImage(imgdata, 'PNG', margin, row, width - 10, 10);
      }

    //Pie del ticket
    this.doc.setFontSize(this.fontSizes.xsmall);
    row += 15;
    this.centerText(margin, margin, width, 0, row, "Generado en POSCLOUD.com.ar");
    this.doc.setTextColor(0, 0, 0);

    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      this.finishImpression();
    } else {
      this.getCompanyPicture(1, 1, width - 2, 18, true);
    }
    

    
  }

  public finishImpression(): void {
    
    if(!this.source) {
      this.doc.autoPrint();
      this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));
    }
    

    if(this.transaction && this.transaction.type && this.transaction.type.electronics) {
      this._printService.saveFile(this.doc.output('blob'),'invoice',this.transactionId).then(
        result =>{
        },
        error =>{
        }
      )
    } else {
      if(this.source === "mail") {
        this._printService.saveFile(this.doc.output('blob'),'others',this.transactionId).then(
          result =>{
          },
          error =>{
          }
        )
      }
    }
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
    let width = this.printer.pageWidth;

    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      
      this.doc.setFontType('bold');
      this.doc.setFontSize(this.fontSizes.large);
      if(this.config[0].companyFantasyName)  {
        this.centerText(margin, margin, width, 0, row, this.config[0].companyFantasyName);
      } else {
        this.centerText(margin, margin, width, 0, row, this.config[0].companyName);
      }
      this.doc.setFontType('normal');
      this.doc.setFontSize(this.fontSizes.normal);
      row +=5;
      this.centerText(margin, margin, width, 0, row, this.config[0].companyAddress);
      row += 5;
      this.centerText(margin, margin, width, 0, row, "tel: " + this.config[0].companyPhone);
      row += 8;
    } else {
      row += 30;
      this.doc.setFontType('normal');
      this.doc.setFontSize(this.fontSizes.normal);
    }

    this.doc.setFontType('bold');
    this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
    this.doc.setFontType('normal');
    this.doc.text(this.dateFormat.transform(this.transaction.startDate, 'DD/MM hh:ss'), (width/1.6), row);
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
      if (this.transaction.table) {
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
    this.doc.line(0, row, width, row);
    row += 5;
    this.doc.text("Desc.", margin, row);
    this.doc.text("Total", width - 13, row);
    row += 3;
    this.doc.line(0, row, width, row);

    //Cuerpo de la tabla de productos
    row +5;
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        row += 6;
        this.doc.text(movementOfArticle.description.slice(0, 20), margin, row);
        this.doc.text(this.roundNumber.transform(movementOfArticle.amount) + " x " + this.roundNumber.transform((movementOfArticle.salePrice+this.transaction.discountAmount)/movementOfArticle.amount).toString(), margin, row +3);
        this.doc.text("$" + this.roundNumber.transform(movementOfArticle.salePrice+this.transaction.discountAmount).toString(), width - 15, row);

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
    if(this.transaction.discountAmount > 0) {
      row += 5;
      this.doc.text("DESCUENTO", margin, row);
      this.doc.text("- $" + this.roundNumber.transform(this.transaction.discountAmount).toString(), width - 15, row)
    }
    this.doc.setFontStyle('bold');
    row += 5;
    this.doc.setFontSize(15);
    this.centerText(margin, margin, width, 2, row, "TOTAL $ "+ this.transaction.totalPrice);
    //this.doc.text("$ " + this.transaction.totalPrice, width/1.4, row);
    this.doc.setFontStyle("normal");

    // if (this.config[0].footerInvoice) {
    //   this.doc.setFontStyle("italic");
    //   row += 10;
    //   this.centerText(margin, margin, width, 0, row, this.config[0].footerInvoice);
    //   this.doc.setFontStyle("normal");
    // }

    //Pie del ticket
    this.doc.setFontSize(this.fontSizes.xsmall);
    row += 5;
    this.centerText(margin, margin, width, 0, row, "Generado en POSCLOUD.com.ar");
    this.doc.setTextColor(0, 0, 0);

    if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
      this.finishImpression();
    } else {
      this.getCompanyPicture(3, 3, this.printer.pageWidth - 5, 26, true);
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
          
          case 'invoice':
              if (this.printer.pageWidth < 150) {
                this.toPrintInvoiceRoll();
              } else {
                this.toPrintInvoice();
              }
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
