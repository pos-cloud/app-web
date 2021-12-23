//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

//Modelos
import { Transaction } from '../../transaction/transaction';
import { MovementOfArticle } from '../../movement-of-article/movement-of-article';
import { MovementOfCash } from '../../movement-of-cash/movement-of-cash';
import { Printer, PrinterPrintIn, PrinterType } from '../../printer/printer';
import { Company } from '../../company/company';
import { Config } from '../../../app.config';
import { TransactionType, TransactionMovement, DescriptionType } from '../../transaction-type/transaction-type';
import { ArticleStock } from '../../article-stock/article-stock';
import { Article } from '../../article/article';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as jsPDF from 'jspdf';

//Servicios
import { PrinterService } from '../../printer/printer.service';
import { PrintService } from '../print.service';
import { TransactionService } from '../../transaction/transaction.service';
import { MovementOfArticleService } from '../../movement-of-article/movement-of-article.service';
import { ConfigService } from '../../config/config.service';
import { TransactionTypeService } from '../../transaction-type/transaction-type.service';
import { ArticleService } from '../../article/article.service';
import { MovementOfCashService } from '../../movement-of-cash/movement-of-cash.service';

//Pipes
import { CurrencyPipe, DeprecatedDecimalPipe } from '@angular/common';
import { DateFormatPipe } from '../../../main/pipes/date-format.pipe';
import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';
import { CashBox } from '../../cash-box/cash-box';
import { CashBoxService } from '../../cash-box/cash-box.service';
import { ClaimService } from 'app/layout/claim/claim.service';
import { MovementOfCancellationService } from 'app/components/movement-of-cancellation/movement-of-cancellation.service';

import * as moment from 'moment';
import { BranchService } from 'app/components/branch/branch.service';
import { VoucherService } from 'app/components/voucher-reader/voucher.service';
import { Voucher } from 'app/components/voucher-reader/voucher';
import { UserService } from 'app/components/user/user.service';
import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';
import { CapitalizePipe } from 'app/main/pipes/capitalize';
import { TaxClassification } from 'app/components/tax/tax';

var splitRegex = /\r\n|\r|\n/g;
jsPDF.API.textEx = function (text: any, x: number, y: number, hAlign?: string, vAlign?: string) {
    var fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

    // As defined in jsPDF source code
    var lineHeightProportion = 1.15;

    var splittedText: string[];
    var lineCount: number = 1;
    if (vAlign === 'middle' || vAlign === 'bottom'
        || hAlign === 'center' || hAlign === 'right') {

        splittedText = typeof text === 'string'
            ? text.split(splitRegex)
            : text;

        lineCount = splittedText.length || 1;
    }

    // Align the top
    y += fontSize * (2 - lineHeightProportion);

    if (vAlign === 'middle') y -= (lineCount / 2) * fontSize;
    else if (vAlign === 'bottom') y -= lineCount * fontSize;


    if (hAlign === 'center'
        || hAlign === 'right') {

        var alignSize = fontSize;
        if (hAlign === 'center') alignSize *= 0.5;

        if (lineCount > 1) {
            for (var iLine = 0; iLine < splittedText.length; iLine++) {
                this.text(splittedText[iLine],
                    x - this.getStringUnitWidth(splittedText[iLine]) * alignSize,
                    y);
                y += fontSize;
            }
            return this;
        }
        x -= this.getStringUnitWidth(text) * alignSize;
    }

    this.text(text, x, y);
    return this;
};

@Component({
    selector: 'app-print',
    templateUrl: './print.component.html',
    styleUrls: ['./print.component.css'],
    providers: [RoundNumberPipe]
})

export class PrintComponent implements OnInit {

    private capitalizePipe: CapitalizePipe = new CapitalizePipe();
    private currencyPipe: CurrencyPipe = new CurrencyPipe('es-AR');
    @Input() company: Company;
    public transaction: Transaction;
    public transactions: Transaction[];
    @Input() items: any[];
    @Input() movementsOfArticles: MovementOfArticle[];
    @Input() cashBox: CashBox;
    @Input() typePrint;
    @Input() balance;
    @Input() params;
    @Input() articleStock: ArticleStock;
    @Input() article: Article;
    @Input() articles: Article[];
    @Input() printer: Printer;
    @Input() transactionId: string;
    @Input() source: string;
    public loading: boolean;
    public pathLocation: string[];
    public alertMessage: string = '';
    public branchImagen;
    public printOrigin: boolean = false;
    public printOriginCount;
    public shiftClosingTransaction;
    public movementsOfCancellation: MovementOfCancellation[];
    public shiftClosingMovementOfArticle;
    public shiftClosingMovementOfCash;
    public companyName: string = Config.companyName;
    public movementsOfArticles2: MovementOfArticle[];
    public movementsOfCashes: MovementOfCash[];
    public config: Config;
    @ViewChild('contentPrinters', { static: true }) contentPrinters: ElementRef;
    @ViewChild('contentTicket', { static: true }) contentTicket: ElementRef;
    public pdfURL;
    public doc;
    public count = 1;
    public row = 5;
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
        public _cashBoxService: CashBoxService,
        public _transactionTypeService: TransactionTypeService,
        public _printService: PrintService,
        public _printerService: PrinterService,
        public _movementOfCashService: MovementOfCashService,
        public _transactionService: TransactionService,
        public _movementOfArticleService: MovementOfArticleService,
        public _configService: ConfigService,
        public _movementOfCancellation: MovementOfCancellationService,
        public _articleService: ArticleService,
        public alertConfig: NgbAlertConfig,
        public _claimService: ClaimService,
        public activeModal: NgbActiveModal,
        public _modalService: NgbModal,
        private domSanitizer: DomSanitizer,
        public _branchService: BranchService,
        public _userService: UserService,
        private _voucherService: VoucherService
    ) {
    }

    async ngOnInit() {


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

        if (this.transactionId) {
            this.movementsOfCancellation = await this.getCancellationsOfMovements(this.transactionId);
            this.printOriginCount = 0;
        }

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
                        if (this.typePrint === "invoice") {
                            if (this.transaction.type.requestArticles) {
                                this.getMovementsOfArticles();
                            } else {
                                this.getMovementsOfCashes();
                            }
                        } else if (this.typePrint === "current-account") {
                            this.toPrintCurrentAccount();
                        } else if (this.typePrint === "cash-box") {
                            this.getClosingCashBox();
                        } else if (this.typePrint === "kitchen") {
                            this.toPrintKitchen();
                        } else if (this.typePrint === "bar") {
                            this.toPrintBar();
                        } else if (this.typePrint === "voucher") {
                            this.toPrintVoucher();
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

    public getTransaction(transactionId: string): void {

        this.loading = true;

        let project = `{
            "_id": 1,
            "endDate": { "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y %HH %MM %SS", "timezone": "${Config.timezone.split('UTC')[1]}" }},
            "endDateAFIP": { "$dateToString": { "date": "$endDate", "format": "%Y-%m-%d", "timezone": "${Config.timezone.split('UTC')[1]}" }},
            "startDate": { "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y %HH %MM", "timezone": "${Config.timezone.split('UTC')[1]}" }},
            "updateDate": { "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %HH %MM", "timezone": "${Config.timezone.split('UTC')[1]}" }},
            "balance": 1,
            "operationType": 1,
            "origin": 1,
            "letter" : 1,
            "number": 1,
            "VATPeriod" : 1,
            "taxes" : 1,
            "discountAmount" : 1,
            "discountPercent" : 1,
            "totalPrice" : 1,
            "CAE" : 1,
            "CAEExpirationDate" : 1,
            "stringSAT" :1,
            "SATStamp" : 1,
            "CFDStamp" : 1,
            "observation" : 1,
            "branchOrigin" : 1,
            "branchDestination.image" : 1,
            "madein" : 1,
            "orderNumber" : 1,
            "exempt" : 1,
            "transport.name" :1,
            "deliveryAddress.name": 1,
            "deliveryAddress.number": 1,
            "deliveryAddress.flat": 1,
            "deliveryAddress.floor": 1,
            "deliveryAddress.observation": 1,
            "transport.address" : 1,
            "transport.city" : 1,
            "transport.identificationValue" : 1,
            "type.requestPaymentMethods":1,
            "type.requestArticles" : 1,
            "type.labelPrint" : 1,
            "type.name" : 1,
            "type.codes" : 1,
            "type.requestEmployee" : 1,
            "type.employeeClosing" : 1,
            "type.requestTaxes" : 1,
            "type.printDescriptionType" : 1,
            "type.showPrices" : 1,
            "type.requestTransport" : 1,
            "type.printSign" : 1,
            "type.electronics" : 1,
            "type.printOrigin" : 1,
            "type.isPreprinted" : 1,
            "type.numberPrint" : 1,
            "company._id" : 1,
            "company.name" : 1,
            "company.vatCondition.discriminate" :1,
            "company.identificationValue" :1,
            "company.identificationType.name" :1,
            "company.vatCondition.description" : 1,
            "company.vatCondition.observation" : 1,
            "company.address" :1,
            "company.addressNumber": 1,
            "company.phones" :1,
            "company.city" :1,
            "company.fantasyName" : 1,
            "company.city" : 1,
            "company.state.name" : 1,
            "company.address" : 1,
            "company.addressNumber" : 1,
            "table.description" : 1,
            "shipmentMethod._id" : 1,
            "shipmentMethod.name" : 1,
            "employeeClosing._id" : 1,
            "employeeClosing.name" : 1,
            "employeeOpening._id" : 1,
            "employeeOpening.name" : 1,
            "declaredValue" :1,
            "package" : 1
        }`;

        project = JSON.parse(project)

        this._transactionService.getTransactionsV2(
            project, // PROJECT
            { "_id": { $oid: transactionId }, "operationType": { "$ne": "D" } }, // MATCH
            {}, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(
            async result => {
                if (result && result.transactions && result.transactions.length === 1) {

                    this.transaction = result.transactions[0];

                    if (this.transaction.type.printOrigin) {
                        this.printOrigin = true;
                    }

                    if (this.transaction.branchDestination && this.transaction.branchDestination.image) {
                        this.branchImagen = this.transaction.branchDestination.image
                    }
                    /*if (this.transaction && this.transaction.type && this.transaction.type.defectPrinter && !this.printer) {
                        this.printer = this.transaction.type.defectPrinter;
                    }*/
                    this.company = this.transaction.company;
                    if (this.typePrint === "invoice") {
                        if (this.transaction.type.requestArticles) {
                            this.getMovementsOfArticles();
                        } else {
                            this.getMovementsOfCashes();
                        }
                    } else if (this.typePrint === "current-account") {
                        this.toPrintCurrentAccount();
                    } else if (this.typePrint === "cash-box") {
                        this.getClosingCashBox();
                    } else if (this.typePrint === "kitchen") {
                        this.toPrintKitchen();
                    } else if (this.typePrint === "bar") {
                        this.toPrintBar();
                    } else if (this.typePrint === "voucher") {
                        this.toPrintVoucher();
                    }
                } else {
                    this.transaction = null;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
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

    public getMovementsOfArticles(): void {

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

                    if (!this.transaction.type.requestPaymentMethods) {
                        if (this.transaction.type.electronics) {
                            if (Config.country === 'AR' &&
                                this.transaction.CAE &&
                                this.transaction.CAEExpirationDate) {
                                //this.calculateBarcodeAR();
                                this.calculateQRAR();
                            } else if (Config.country === 'MX' &&
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
                        this.getMovementsOfCashes();
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

    public getMovementsOfCashes(): void {

        this.loading = true;
        let query = 'where="transaction":"' + this.transaction._id + '"';

        this._movementOfCashService.getMovementsOfCashes(query).subscribe(
            result => {
                this.hideMessage();
                this.movementsOfCashes = result.movementsOfCashes;
                if (!this.transaction.type.requestArticles) {
                    this.toPrintPayment();
                } else {
                    if (Config.country === 'AR' &&
                        this.transaction.CAE &&
                        this.transaction.CAEExpirationDate) {
                        //this.calculateBarcodeAR();
                        this.calculateQRAR();
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
        if (!this.transaction.type.isPreprinted) {
            this.getHeader(true);
        }
        this.doc.line(0, 50, 240, 50);
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
        if (Config.country === 'AR') {
            this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 10), 130, 20);
        } else {
            this.doc.text(this.padString(this.transaction.number, 10), 130, 20);
        }
        this.doc.setFontType('bold');
        this.doc.text("Fecha:", 110, 25);
        this.doc.setFontType('normal');
        if (this.transaction.endDate) {
            this.doc.text(this.transaction.endDate, 125, 25);
        } else {
            this.doc.text(this.transaction.startDate, 125, 25);
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
                    if (this.transaction.type.codes[i].code && this.transaction.letter === this.transaction.type.codes[i].letter) {
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
        if (!this.movementsOfCashes[0].type.allowToFinance) {
            this.doc.text("Detalle", 10, 77);
            this.doc.text("Vencimiento", 50, 77);
            this.doc.text("Número", 75, 77);
            this.doc.text("Banco", 100, 77);
        } else {
            this.doc.text("Couta", 10, 77);
            this.doc.text("Vencimiento", 30, 77);
            this.doc.text("Amort.", 80, 77);
            this.doc.text("Tasa", 110, 77);
            this.doc.text("IVA", 150, 77);
        }
        if (this.transaction.type && this.transaction.type.showPrices) {
            this.doc.text("Total", 185, 77);

        }
        this.doc.setFontType('normal');

        // Detalle de productos
        var row = 85;
        let commissionAmount: number = 0.00;
        let administrativeExpenseAmount: number = 0.00;
        let otherExpenseAmount: number = 0.00;

        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {

            for (var i = 0; i < this.movementsOfCashes.length; i++) {

                commissionAmount += this.movementsOfCashes[0].commissionAmount;
                administrativeExpenseAmount += this.movementsOfCashes[0].administrativeExpenseAmount;
                otherExpenseAmount += this.movementsOfCashes[0].otherExpenseAmount;

                if (!this.movementsOfCashes[0].type.allowToFinance) {
                    if (this.movementsOfCashes[i].type.name) {
                        this.doc.text(this.movementsOfCashes[i].type.name, 10, row);
                    }

                    if (this.movementsOfCashes[i].expirationDate) {
                        this.doc.text(this.dateFormat.transform(this.movementsOfCashes[i].expirationDate, 'DD/MM/YYYY'), 50, row);
                    } else {
                        this.doc.text("-", 50, row)
                    }

                    if (this.movementsOfCashes[i].number) {
                        this.doc.text(this.movementsOfCashes[i].number, 75, row);
                    } else {
                        this.doc.text("-", 75, row);
                    }

                    if (this.movementsOfCashes[i].bank) {
                        this.doc.text(this.movementsOfCashes[i].bank.name, 100, row);
                    } else {
                        this.doc.text("-", 100, row);
                    }
                } else {
                    this.doc.text(this.movementsOfCashes[i].quota.toString(), 10, row);

                    if (this.movementsOfCashes[i].expirationDate) {
                        this.doc.text(this.dateFormat.transform(this.movementsOfCashes[i].expirationDate, 'DD/MM/YYYY'), 30, row);
                    } else {
                        this.doc.text("-", 30, row)
                    }

                    if (this.movementsOfCashes[i].capital) {
                        this.doc.textEx("$ " + this.roundNumber.transform(this.movementsOfCashes[i].capital), 80, row, 'right', 'right');
                    } else {
                        this.doc.text("$ -", 80, row, 'right', 'right')
                    }

                    if (this.movementsOfCashes[i].interestAmount) {
                        this.doc.textEx("$ " + this.roundNumber.transform(this.movementsOfCashes[i].interestAmount), 110, row, 'right', 'right');
                    } else {
                        this.doc.text("$ -", 110, row, 'right', 'right')
                    }

                    if (this.movementsOfCashes[i].taxAmount) {
                        this.doc.textEx("$ " + this.roundNumber.transform(this.movementsOfCashes[0].taxAmount), 150, row, 'right', 'right');
                    } else {
                        this.doc.text("$ -", 150, row, 'right', 'right')
                    }
                }

                if (this.movementsOfCashes[i].amountPaid) {
                    this.doc.setFontStyle("normal");
                    this.doc.textEx("$ " + this.roundNumber.transform(this.movementsOfCashes[i].amountPaid), 200, row, 'right', 'right');
                }

                if (this.movementsOfCashes[i].observation) {
                    this.doc.setFontStyle("italic");
                    this.doc.text(this.movementsOfCashes[i].observation, 25, row + 5);
                    this.doc.setFontStyle("normal");
                }

                row += 8;

                transport = transport + this.movementsOfCashes[i].amountPaid;


                if (i % 21 == 0 && i != 0) {

                    this.doc.setFontType("bold");
                    this.doc.text("TRANSPORTE:".toString(), 25, row);
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
                    if (Config.country === 'AR') {
                        this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 10), 130, 20);
                    } else {
                        this.doc.text(this.padString(this.transaction.number, 10), 130, 20);
                    }
                    this.doc.setFontType('bold');
                    this.doc.text("Fecha:", 110, 25);
                    this.doc.setFontType('normal');
                    if (this.transaction.endDate) {
                        this.doc.text(this.transaction.endDate, 125, 25);
                    } else {
                        this.doc.text(this.transaction.startDate, 125, 25);
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
                    this.doc.text("Vencimiento", 50, 77);
                    this.doc.text("Número", 75, 77);
                    this.doc.text("Banco", 100, 77);
                    if (this.transaction.type && this.transaction.type.showPrices) {
                        this.doc.text("Total", 185, 77);
                        this.doc.setFontType('normal');
                    }

                    // Detalle de productos
                    var row = 85;

                    this.doc.setFontType("bold");
                    this.doc.text("TRANSPORTE:".toString(), 25, row);
                    this.doc.text(this.roundNumber.transform(transport).toString(), 185, row);
                    this.doc.setFontType("normal");

                    row = 95;
                }
            }

        }

        if (commissionAmount > 0) {
            row += 8;
            this.doc.setFontType('bold');
            this.doc.text("Tasa de Servicios Diaria:", 145, row);
            this.doc.setFontType('normal');
            this.doc.text("$ (" + this.roundNumber.transform(commissionAmount) + ")", 202, row, 'right', 'right');
        }
        if (administrativeExpenseAmount > 0) {
            row += 8;
            this.doc.setFontType('bold');
            this.doc.text("Gastos administrativos:", 145, row);
            this.doc.setFontType('normal');
            this.doc.text("$ (" + this.roundNumber.transform(administrativeExpenseAmount) + ")", 202, row, 'right', 'right');
        }
        if (otherExpenseAmount > 0) {
            row += 8;
            this.doc.setFontType('bold');
            this.doc.text("Otros gastos:", 145, row);
            this.doc.setFontType('normal');
            this.doc.text("$ (" + this.roundNumber.transform(otherExpenseAmount) + ")", 202, row, 'right', 'right');
        }
        row += 8;
        this.doc.setFontType('bold');
        this.doc.text("TOTAL:", 145, row);
        this.doc.setFontType('normal');
        this.doc.text("$ " + this.roundNumber.transform(this.transaction.totalPrice), 200, row, 'right', 'right');
        this.doc.setFontSize(this.fontSizes.normal);
        row += 5;

        let movCancelation: MovementOfCancellation[] = await this.getCancellationsOfMovements(this.transactionId)

        if (movCancelation) {
            this.doc.setFontType('bold');
            this.doc.setFontSize(this.fontSizes.normal);
            this.doc.line(0, row, 200, row)
            row += 5
            this.doc.text("Comprobantes cancelados", 10, row);
            this.doc.text("Total", 80, row);
            this.doc.text("Saldo Cancelado", 110, row);
            this.doc.text("Saldo Pendiente", 150, row);
            row += 3
            this.doc.line(0, row, 200, row)
            row += 5
            for (let index = 0; index < movCancelation.length; index++) {
                this.doc.setFontType('normal');
                this.doc.text(movCancelation[index].transactionOrigin.type.name + "   " + this.padString(movCancelation[index].transactionOrigin.origin, 4) + "-" + this.padString(movCancelation[index].transactionOrigin.number, 8), 10, row);
                //this.doc.text("$ " + this.roundNumber.transform(this.transactions[index].totalPrice), 80, row);
                this.doc.textEx("$ " + this.roundNumber.transform(movCancelation[index].transactionOrigin.totalPrice), 95, row, 'right', 'middle');
                this.doc.textEx("$ " + this.roundNumber.transform(movCancelation[index].balance), 130, row, 'right', 'middle');
                this.doc.textEx("$ " + this.roundNumber.transform(movCancelation[index].transactionOrigin.balance), 175, row, 'right', 'middle');

                row += 8;

                if (row > 240) {
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
                    if (Config.country === 'AR') {
                        this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 10), 130, 20);
                    } else {
                        this.doc.text(this.padString(this.transaction.number, 10), 130, 20);
                    }
                    this.doc.setFontType('bold');
                    this.doc.text("Fecha:", 110, 25);
                    this.doc.setFontType('normal');
                    if (this.transaction.endDate) {
                        this.doc.text(this.transaction.endDate, 125, 25);
                    } else {
                        this.doc.text(this.transaction.startDate, 125, 25);
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

                    row = 72;
                    this.doc.setFontType('bold');
                    this.doc.setFontSize(this.fontSizes.normal);
                    this.doc.line(0, row, 150, row);
                    row += 5;
                    this.doc.text("Comprobantes cancelados", 10, row);
                    this.doc.text("Total", 80, row);
                    this.doc.text("Saldo Cancelado", 110, row);
                    this.doc.text("Saldo Pendiente", 150, row);

                    row += 3;
                    this.doc.line(0, row, 150, row);
                    row += 5;
                }
            }

        }

        this.doc.setFontType('bold');
        this.doc.text("Observaciones: " + this.transaction.observation, 10, 246);
        this.doc.setFontType('normal');
        this.doc.text('', 38, 250);

        this.getGreeting();
        this.getFooter();

        if (this.transaction.type.name === 'Préstamo' && Config.database === 'borita') {
            this.toPrintPagare();
            this.toPrintMutuo();
        }

        if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
            this.finishImpression();
        } else {
            if (this.branchImagen && this.branchImagen !== 'default.jpg') {
                await this.getBranchPicture(10, 5, 80, 40, true);
            } else {
                await this.getCompanyPicture(10, 5, 80, 40, true);
            }
        }
    }

    public toPrintPagare() {
        let margin: number = 5;
        this.doc.setProperties({ title: "String Splitting" });
        this.doc.addPage();
        this.doc.setFontType('bold');
        this.doc.setFontType(this.fontSizes.large);
        this.centerText(5, 5, 210, 0, 10, 'PAGARÉ');
        this.doc.text(`${this.currencyPipe.transform(this.transaction.totalPrice, 'USD', 'symbol-narrow', '1.2-2')}`, margin, 18);
        this.doc.text(`${this.transaction.company.address} (${(this.transaction.company.state) ? this.transaction.company.state.name : ''}) ${moment().format('DD [de]') + this.capitalizePipe.transform(moment().format(' MMMM [de] YYYY'))}`, margin, 26);
        this.doc.setFontType('normal');
        this.doc.setFontType(this.fontSizes.normal);
        let text = `Por igual valor recibido a mi entera satisfacción, pagare/mos incondicionalmente A LA VISTA a
    BORITA S.A. a su orden, sin protesto (Artículo 50 Decreto - Ley Nº 5.965/63), la cantidad de
    ${this.currencyPipe.transform(this.transaction.totalPrice, 'USD', 'symbol-narrow', '1.2-2')} (${this.capitalizePipe.transform(this.getNumeroALetras(this.roundNumber.transform(this.transaction.totalPrice)).toLowerCase())})
    Conforme a lo establecido por el art. 5 del Decreto 5965/63 el presente pagaré devengará a
    partir de la fecha de libramiento y hasta su efectivo pago un interés compensatorio noventa y
    nueve por ciento Nominal Anual al que se le adicionará desde la fecha de su presentación y no
    pago, un interés punitorio de hasta el cincuenta por ciento (50 %) del interés compensatorio
    antes indicado.
    En nuestro carácter de libradores hacemos constar expresamente que, de conformidad con lo
    establecido por el artículo 36 del Decreto-Ley 5.965/63, ampliamos el plazo de presentación para
    el pago de este pagaré hasta diez (10) años a contar de la fecha de libramiento.
    Lugar de pago: ${(this.transaction.company && this.transaction.company.city && this.transaction.company.city != '') ? this.transaction.company.city : '..................'}, ${(this.transaction.company.state) ? this.transaction.company.state.name : '..................'}.
    `;
        let row: number = 34;
        this.doc.text(text, margin, row);
        row += 60;
        this.doc.text(`Firma del deudor: ........................................`, margin, row);
        row += 8;
        this.doc.text(`Nombre: ......................................................`, margin, row);
        row += 8;
        this.doc.text(`D.N.I. - L.C. - L.E.: ....................................`, margin, row);
        row += 8;
        this.doc.text(`Domicilio: ...................................................`, margin, row);
        row += 8;
        this.doc.text(`Localidad: ...................................................`, margin, row);
        row += 8;
        this.doc.text(`Teléfono: .....................................................`, margin, row);

    }

    public toPrintMutuo() {
        this.doc.setProperties({ title: "String Splitting" });
        this.doc.addPage();
        this.doc.setFontType('bold');
        this.doc.setFontType(this.fontSizes.large);
        this.centerText(5, 5, 210, 0, 10, 'CONTRATO DE MUTUO');
        this.doc.setFontType('normal');
        this.doc.setFontType(this.fontSizes.normal);
        this.doc.line(0, 15, this.printer.pageWidth - 5, 15);
        let text: string =
            `En la ciudad de ${(this.transaction.company && this.transaction.company.city && this.transaction.company.city != '') ? this.transaction.company.city : '..................'}, Prov. de ${(this.transaction.company.state) ? this.transaction.company.state.name : '..................'} a los ${moment().format('DD [días del mes de]')} ${this.capitalizePipe.transform(moment().format('MMMM [de]'))} ${this.getNumeroALetras(moment().format('YYYY')).toLowerCase()} entre BORITA S.A., representada en este
    acto por su PRESIDENTE Sr. DANIEL CAFFE D.N.I. Nº 20188385, con domicilio en calle ${(Config.companyAddress) ? Config.companyAddress : '..................'}, por
    una parte y en adelante denominada LA ACREEDORA y por la otra el Sr./a ${(this.transaction.company) ? this.transaction.company.name : '..................'} L.C./L.E./D.N.I. Nº ${(this.transaction.company) ? this.transaction.company.identificationValue : '..................'}
    denominado/s en adelante EL/LOS DEUDOR/ES, han convenido en celebrar el presente contrato de mutuo oneroso sujeto a las cláusulas que a
    continuación se transcriben: PRIMERA: BORITA S.A. otorga en préstamo a ${(this.transaction.company) ? this.transaction.company.name : '..................'} y éste/estos lo acepta/n, la suma de
    Pesos ${this.capitalizePipe.transform(this.getNumeroALetras(this.roundNumber.transform(this.transaction.totalPrice)).toLowerCase())} (${this.currencyPipe.transform(this.roundNumber.transform(this.transaction.totalPrice), 'USD', 'symbol-narrow', '1.2-2')}) en billetes de esa moneda, con destino ................... ,
    que el DEUDOR/ES recibe/n en este acto de plena conformidad, sirviendo el presente de formal recibo y carta de adeudo en forma. SEGUNDA:
    El/LOS DEUDOR/ES se obliga/n a devolver a la ACREEDORA el importe del préstamo indicado en la cláusula anterior en la siguiente forma, 
    plazo y condiciones: ${this.movementsOfCashes.length} ${(this.movementsOfCashes.length <= 1) ? 'CUOTA' : 'CUOTAS'}, mensuales y consecutivas de ${this.currencyPipe.transform(this.roundNumber.transform(this.movementsOfCashes[this.movementsOfCashes.length - 1].amountPaid), 'USD', 'symbol-narrow', '1.2-2')} (Pesos ${this.capitalizePipe.transform(this.getNumeroALetras(this.movementsOfCashes[this.movementsOfCashes.length - 1].amountPaid).toLowerCase())})
    cada una venciendo la primera el día ${moment(this.movementsOfCashes[0].expirationDate, 'YYYY-MM-DDTHH:mm:ssZ').format('DD/MM/YYYY')} y las restantes el mismo día de los meses siguientes al primero, obligaciones que deberán ser
    abonadas en el domicilio de la ACREEDORA en calle ${(Config.companyAddress) ? Config.companyAddress : '..................'}, que incluye los intereses compensatorios
    pactados, como así también el ${this.movementsOfCashes[0].taxPercentage}% del IVA sobre los intereses correspondientes que poseen cada una de ellas de acuerdo al calculo del
    ${this.movementsOfCashes[0].type.name}.- TERCERA: Asimismo convienen las partes que el interés que se aplica al presente préstamo de dinero, con el carácter de 
    compensatorio será del 8,00% mensual, que se aplica sobre el capital prestado, a partir del día de la fecha, que son liquidados conjuntamente
    con cada una de las cuotas mensuales de capital, aplicando el ${this.movementsOfCashes[0].type.name} de amortización de créditos. El cálculo de los aludidos intereses
    se practica sobre la base de trescientos sesenta y cinco días corridos calendarios. Además se conviene, en caso de producirse la mora automática
    en el pago de las obligaciones asumidas por el/los DEUDOR/ES, la aplicación de un interés punitorio adicional del ${this.movementsOfCashes[0].interestPercentage}% mensual, que será
    computado sobre el saldo de capital adeudado íntegramente, incluyendo la totalidad de las cuotas vencidas y las que se encuentran pendientes
    de vencimiento en el futuro. El pago de los intereses compensatorios, como los punitorios pactados deberán ser abonados también, en el domicilio
    de la ACREEDORA. Los intereses serán capitalizados conforme a la tasa mensual pactada, tanto los compensatorios como los punitorios.-
    CUARTA: La falta de pago de cualquiera de las cuotas pactadas, con sus respectivos intereses, hará incurrir al DEUDOR/ES en mora automática,
    sin necesidad de interpelación previa de ninguna naturaleza. Tal caso dará derecho a la ACREEDORA a optar por las siguientes alternativas
    judiciales: a) Exigir el pago de las cuotas vencidas, como así también las obligaciones mensuales a vencer, considerándolas como de plazo
    vencido en su totalidad, aplicándose en tales  supuestos los intereses compensatorios y punitorios hasta el momento de la cancelación total del
    crédito otorgado.-b) Exigir el pago de las cuotas vencidas con más los intereses compensatorios y punitorios pactados. La interposición de la
    demanda judicial y/o preparación de vía ejecutiva, implicará, sin necesidad de otro recaudo, que la ACREEDORA ha ejercido su derecho a
    considerar caducos los plazos acordados.-QUINTA:: La ACREEDORA podrá exigir la cancelación anticipada total o parcial del préstamo en
    cualquiera de los siguientes casos:  a) Si el DEUDOR/ES no cumpliera con cualquier otro crédito u obligación a la ACREEDORA.-b)Si se trabare
    embargo, inhibiciones u otras medidas cautelares sobre bienes del DEUDOR/ES, y si mediare cualquier otra circunstancia que, a criterio
    de la ACREEDORA afectare la solvencia moral o comercial del DEUDOR/ES.-c)Si el DEUDOR/ES se negare a suministrar las informaciones o
    permitir las verificaciones que la ACREEDORA estimare necesarias o sí, efectuadas, resultare que los datos contenidos en esta solicitud a
    sus anexos son inexactos o ha dado a los fondos otro destino que el consignado.-d)Transferencia total o parcial del activo social o del fondo
    de comercio del DEUDOR/ES. e) En caso  de fusión, transformación o liquidación del DEUDOR/ES.-f)Para el caso de personas físicas, en caso
    de fallecimiento o incapacidad del DEUDOR/ES.-g)En caso de concurso civil, concurso preventivo o quiebra del DEUDOR/ES o esta le fuere
    solicitada por terceros.- h)En caso de ser declarado deudor moroso el DEUDOR/ES.-SEXTA: La ACREEDORA podrá solicitar el reemplazo o
    refuerzo de las garantías del préstamo solicitado dentro del plazo que a ese fin establezca, en caso de quienes las hayan otorgado incurran en
    cualquiera de los supuestos previstos en la cláusula anterior.-SEPTIMA: El incumplimiento de cualquiera de las obligaciones contraídas
    por el DEUDOR/ES en virtud de la presente facultará a la ACREEDORA a dar por vencidos los plazos de la deuda aquí constituidos y todas las
    demás obligaciones que el DEUDOR/ES tenga con la ACREEDORA, pudiendo esta reclamar el pago de las mismas como si fuesen vencidas y
    exigibles.-OCTAVA: Siempre que la cancelación anticipada no contravenga al sistema de pago de cuotas y cuotas de capital e intereses pactados
    con la ACREEDORA para este tipo de préstamo, el DEUDOR/ES, a criterio de la ACREEDORA y previo pedido del DEUDOR/ES con preaviso
    de 48 (cuarenta y ocho) horas, podrá autorizarse cancelaciones totales en cualquier momento durante la vigencia del presente préstamo
    debiendo abonarse en dicha oportunidad los intereses y reajustes correspondientes.-NOVENA: Todos los gastos, comisiones, impuestos actuales y
    futuros, etc. que graven esta operación serán a cargo del DEUDOR/ES. También serán a cargo del DEUDOR/ES los gastos que su ejecución
    judicial o extrajudicial pudiere originar por aplicación de cualquiera de sus cláusulas.-DECIMA: Las prórrogas que la ACREEDORA conceda
    eventualmente al DEUDOR/ES, para el pago de los servicios o capital, y los intereses compensatorios o punitorios, así como pagos que
    acepte en cualquier forma o condición, no importarán novación del crédito renunciando expresamente el DEUDOR/ES a hacer valer la
    presunción consagrada por el art. 746 del Código Civil, obligándose a exhibir todos los comprobantes de pago que justifiquen el
    correspondiente a cada vencimiento, de lo que no quedará relevado por tenencia del correspondiente a posteriores, que no justificarán
    haber abonado los vencimientos anteriores.-DECIMA PRIMERA: Queda convenido, para el caso de falta de pago, la ACREEDORA, podrá
    accionar contra el/los DEUDOR/ES o GARANTE/S o FIADOR/ES, por vía del juicio ejecutivo, en los términos del Código de Procedimiento
    Civil y Comercial de la Provincia de Formosa, por el importe total del préstamo, sus intereses compensatorios y punitorios, gastos
    causídicos y costas, sobre la base del presente instrumento y sin necesidad de aviso previo. A tal efecto, la liquidación que practique
    la ACREEDORA, acompañada de este instrumento será TITULO EJECUTIVO suficiente para accionar en contra del DEUDOR/ES .DECIMA
    SEGUNDA: El Sr/a. ${(this.transaction.company) ? this.transaction.company.name : '..................'} L.C./L.E./D.N.I. Nº ${(this.transaction.company) ? this.transaction.company.identificationValue : '..................'}, con domicilio en calle ........................., se constituyen en fiador/es y
    garante/s solidario/s, liso/s y llano/s principal/es pagador/es y con el carácter de codeudor solidario de todas las obligaciones asumidas
    por el/los DEUDOR/E en el presente contrato, renunciando expresamente a los beneficios de excusión y/o división que
    pudiere/n corresponderle/s.-DECIMO TERCERA: En las condiciones expresadas, la ACREEDORA y el DEUDOR/ES y GARANTE/S o
    FIADOR/ES solidarios, aceptan en todas sus partes las cláusulas que anteceden y declaran expresamente someterse a la jurisdicción de los
    Tribunales Ordinarios de la ciudad de ${(this.transaction.company && this.transaction.company.city && this.transaction.company.city != '') ? this.transaction.company.city : '..................'}, Prov. de ${(this.transaction.company.state) ? this.transaction.company.state.name : '..................'}, renunciando expresamente a cualquier otro fuero que les pudiera corresponder,
    en especial el fuero Federal, constituyendo domicilio especial para todas las notificaciones y demás efectos legales la ACREEDORA
    en calle ${(Config.companyAddress) ? Config.companyAddress : '..................'} y el DEUDOR/ES en calle , de la ciudad de ${(this.transaction.company && this.transaction.company.addressNumber && this.transaction.company.addressNumber != '') ? this.transaction.company.addressNumber + ' - ' : '............ - '} ${(this.transaction.company && this.transaction.company.city && this.transaction.company.city != '') ? this.transaction.company.city : '..................'}, Prov. de ${(this.transaction.company.state) ? this.transaction.company.state.name : '..................'}
    y el/los GARANTE/S o FIADOR/ES en calle ${(Config.companyAddress) ? Config.companyAddress : '..................'}, los que subsistirán a todos los efectos hasta que obre
    en lo de la ACREEDORA notificación fehaciente del nuevo domicilio contractural.-En prueba de conformidad suscriben las partes tres ejemplares
    de un mismo tenor en el lugar y fecha que indica más arriba.-`;
        this.doc.text(text, 0, 20);
    }

    async getCancellationsOfMovements(transactionDestinationViewId): Promise<MovementOfCancellation[]> {

        return new Promise<MovementOfCancellation[]>((resolve, reject) => {

            this.loading = true;

            let match;

            match = { "transactionDestination": { $oid: transactionDestinationViewId }, "operationType": { "$ne": "D" }, "transactionOrigin.operationType": { "$ne": "D" } };

            // CAMPOS A TRAER
            let project = {
                "transactionOrigin._id": 1,
                "transactionOrigin.type.name": 1,
                "transactionOrigin.letter": 1,
                "transactionOrigin.number": 1,
                "transactionOrigin.origin": 1,
                "transactionOrigin.totalPrice": 1,
                "transactionOrigin.company.name": 1,
                "transactionOrigin.balance": 1,
                "transactionOrigin.operationType": 1,
                "transactionDestination": 1,
                "balance": 1,
                "operationType": 1
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
                    resolve(result.movementsOfCancellations)
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

    public calculateBarcodeAR(): void {

        let codeInvoice = 0;

        if (this.transaction.type.codes && this.transaction.type.codes.length > 0) {
            for (let y: number = 0; y < this.transaction.type.codes.length; y++) {
                if (this.transaction.letter == this.transaction.type.codes[y].letter) {
                    codeInvoice = this.transaction.type.codes[y].code;
                }
            }
        }

        let date = (this.transaction.CAEExpirationDate.split('T')[0].replace('-', '')).replace('-', '');

        let digit = ((this.config[0].companyIdentificationValue).replace('-', '')).replace('-', '') +
            codeInvoice +
            this.transaction.origin +
            this.transaction.CAE + date;

        let uno = 0;
        let dos = 0;

        if (digit && digit.length > 0) {
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
            + checkDigit, 'invoice');
    }

    public calculateQRAR(): void {

        let url = "https://www.afip.gob.ar/fe/qr/?p=";
        let datos = {};

        let codeInvoice;
        if (this.transaction.type.codes && this.transaction.type.codes.length > 0) {
            for (let y: number = 0; y < this.transaction.type.codes.length; y++) {
                if (this.transaction.letter == this.transaction.type.codes[y].letter) {
                    codeInvoice = this.transaction.type.codes[y].code;
                }
            }
        }

        datos['ver'] = 1;
        datos['fecha'] = this.transaction['endDateAFIP'];
        datos['cuit'] = Config.companyIdentificationValue.replace('-', '');
        datos['ptoVta'] = this.transaction.origin;
        datos['tipoCmp'] = codeInvoice;
        datos['nroCmp'] = this.transaction.number;
        datos['importe'] = this.transaction.totalPrice;
        datos['moneda'] = 'PES';
        datos['ctz'] = 1;
        datos['tipoCodAut'] = "E";
        datos['codAut'] = this.transaction.CAE;


        var objJsonB64 = btoa(JSON.stringify(datos));
        url += objJsonB64;

        this.getBarcode64(`qr?value=${url}`, 'invoice');
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
        if (Object.keys(openingAmounts).length > max) { max = Object.keys(openingAmounts).length; arrayMax = openingAmounts };
        if (Object.keys(inputAmounts).length > max) { max = Object.keys(inputAmounts).length; arrayMax = inputAmounts };
        if (Object.keys(outputAmounts).length > max) { max = Object.keys(outputAmounts).length; arrayMax = outputAmounts };
        if (Object.keys(closingAmounts).length > max) { max = Object.keys(closingAmounts).length; arrayMax = closingAmounts };

        if (Object.keys(arrayMax).length > 0) {
            for (let k of Object.keys(arrayMax)) {
                this.doc.text('- ' + k, margin + 5, row += 5);
                if (!openingAmounts[k]) openingAmounts[k] = 0;
                if (!inputAmounts[k]) inputAmounts[k] = 0;
                if (!outputAmounts[k]) outputAmounts[k] = 0;
                if (!closingAmounts[k]) closingAmounts[k] = 0;
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
        this.doc.text("Generado en http://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 290);
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
        if (Object.keys(openingAmounts).length > max) { max = Object.keys(openingAmounts).length; arrayMax = openingAmounts };
        if (Object.keys(inputAmounts).length > max) { max = Object.keys(inputAmounts).length; arrayMax = inputAmounts };
        if (Object.keys(outputAmounts).length > max) { max = Object.keys(outputAmounts).length; arrayMax = outputAmounts };
        if (Object.keys(closingAmounts).length > max) { max = Object.keys(closingAmounts).length; arrayMax = closingAmounts };

        if (Object.keys(arrayMax).length > 0) {
            for (let k of Object.keys(arrayMax)) {
                if (!openingAmounts[k]) openingAmounts[k] = 0;
                if (!inputAmounts[k]) inputAmounts[k] = 0;
                if (!outputAmounts[k]) outputAmounts[k] = 0;
                if (!closingAmounts[k]) closingAmounts[k] = 0;
                let dif: number = this.roundNumber.transform(closingAmounts[k] - ((openingAmounts[k] + inputAmounts[k]) - outputAmounts[k]));
                if (dif != 0) {
                    this.doc.text('- ' + k, margin + 5, row += 5);
                    this.doc.text('$ ' + decimalPipe.transform(closingAmounts[k] - ((openingAmounts[k] + inputAmounts[k]) - outputAmounts[k]), '1.2-2'), 60, row);
                }
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
        this.doc.text("Generado en http://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 290);
        this.doc.setTextColor(0, 0, 0);

        this.finishImpression();
    }

    async getHeader(logoPrint: boolean = false) {

        return new Promise(async (resolve, reject) => {

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

                if (this.config[0].country === 'AR') {
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
                    if (this.branchImagen && this.branchImagen !== 'default.jpg') {
                        await this.getBranchPicture(10, 5, 80, 40);
                    } else {
                        await this.getCompanyPicture(10, 5, 80, 40);
                    }
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
        if (Config.country === 'AR') {
            this.doc.text("Condición de IVA:", margin, 45);
        } else {
            this.doc.text("Régimen Fiscal:", margin, 45);
        }
        this.doc.setFontType('normal');
        if (this.config[0].companyVatCondition) {
            this.doc.text(this.config[0].companyVatCondition.description.slice(0, 31), 36, 45);
        }
    }

    async getBranchPicture(lmargin, rmargin, width, height, finish: boolean = false) {

        return new Promise((resolve, reject) => {
            this.loading = true;
            this._branchService.getPicture(this.branchImagen).subscribe(
                result => {
                    if (!result.imageBase64) {
                        this.getCompanyData();
                        if (finish) {
                            this.finishImpression();
                        }
                        this.loading = false;
                        resolve(true);
                    } else {
                        this.hideMessage();
                        let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
                        this.doc.addImage(imageURL, 'jpeg', lmargin, rmargin, width, height);
                        if (finish) {
                            this.finishImpression();
                        }
                        resolve(true);
                    }
                    this.loading = false;
                }
            );
        });
    }

    async getCompanyPicture(lmargin, rmargin, width, height, finish: boolean = false) {

        return new Promise((resolve, reject) => {
            this.loading = true;
            this._configService.getCompanyPicture(this.config[0].companyPicture).subscribe(
                result => {
                    if (!result.imageBase64) {
                        this.getCompanyData();
                        if (finish) {
                            this.finishImpression();
                        }
                        this.loading = false;
                        resolve(true);
                    } else {
                        this.hideMessage();
                        let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
                        this.doc.addImage(imageURL, 'jpeg', lmargin, rmargin, width, height);
                        if (finish) {
                            this.finishImpression();
                        }
                        resolve(true);
                    }
                    this.loading = false;
                }
            );
        });
    }

    public getEmployee() {

        let margin = 5;

        // Lineas divisorias horizontales para el receptor
        this.doc.line(0, 67, 240, 67);
        //this.doc.line(0, 80, 240, 80);

        // Detalle receptor
        this.doc.setFontSize(this.fontSizes.normal);
        this.doc.setFontType('bold');
        this.doc.text("Empleado:", margin, 71);
        this.doc.text("Nombre de Fantasía:", 110, 71);

        this.doc.setFontType('normal');

        this.doc.text(this.transaction.employeeClosing.name, 42, 71);
        if (this.transaction.company.fantasyName) {
            this.doc.text(this.transaction.company.fantasyName, 150, 71);
        }

        this.doc.setFontSize(this.fontSizes.normal);
        this.doc.setFontType('normal');
    }

    public getTransport() {

        let margin = 5;

        // Lineas divisorias horizontales para el receptor
        this.doc.line(0, 67, 240, 67);
        //this.doc.line(0, 80, 240, 80);

        // Detalle receptor
        this.doc.setFontSize(this.fontSizes.normal);
        this.doc.setFontType('bold');
        this.doc.text("Transporte:", margin, 71);

        this.doc.setFontType('normal');

        this.doc.text(this.transaction.transport.name, 42, 71);

        this.doc.setFontSize(this.fontSizes.normal);
        this.doc.setFontType('normal');
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
            if (this.company.name) {
                this.doc.text(this.company.name.slice(0, 32), 42, 55);
            }
            if (this.company.identificationType) {
                this.doc.setFontType('bold');
                this.doc.text(this.company.identificationType.name + ":", margin, 60);
            }
            if (this.company.identificationValue && this.company.identificationValue !== '') {
                this.doc.setFontType('normal');
                this.doc.text(this.company.identificationValue, 42, 60);
            }
            if (this.company.vatCondition && this.company.vatCondition.description) {
                this.doc.setFontType('normal');
                this.doc.text(this.company.vatCondition.description, 42, 65);
            }

            if (this.company.address) {
                if (this.company.addressNumber) {
                    this.doc.text(this.company.address + " " + this.company.addressNumber, 130, 55);
                } else {
                    this.doc.text(this.company.address, 130, 55);
                }
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
            if (lines && lines.length > 0) {
                for (var i = 0; i < lines.length; i++) {
                    let lineTop = (lineHeight / 2) * i;
                    this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center')
                }
            }
        }
    }

    async toPrintCurrentAccount() {

        let transport = 0;
        let margin = 5;

        await this.getHeader(true);
        this.getClient();

        // Encabezado de la tabla de Detalle de transacciones
        this.doc.setFontType('bold');
        this.doc.setFontSize(this.fontSizes.normal);
        this.doc.text("Fecha", margin, 77);
        this.doc.text("Tipo Comp.", 25, 77);
        this.doc.text("Nro. Comprobante", 90, 77);
        /*if (this.params.detailsPaymentMethod) {
            this.doc.text("Monto", 90, 77);
            this.doc.text("Método", 110, 77);
        } else {
            this.doc.text("Monto", 110, 77);
        }*/
        this.doc.text("Debe", 145, 77);
        this.doc.text("Haber", 165, 77);
        this.doc.text("Saldo", 195, 77);
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
                if (Config.country === 'AR') {
                    this.doc.text(this.padString(item.transactionOrigin, 4) + "-" + item.transactionLetter + "-" + this.padString(item.transactionNumber, 10), 90, row);
                } else {
                    this.doc.text(item.transactionLetter + "-" + this.padString(item.transactionNumber, 10), 90, row);
                }
                item.transactionTotalPrice = this.roundNumber.transform(item.transactionTotalPrice, 2).toFixed(2);

                /*if (this.params.detailsPaymentMethod) {
                this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(item.transactionTotalPrice), 99, row, 'right', 'middle');
                    this.doc.text(item.paymentMethodName.slice(0, 22), 110, row);
                } else {
                    this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(item.transactionTotalPrice), 125, row, 'right', 'middle');
                }*/

                item.debe = this.roundNumber.transform(item.debe, 2).toFixed(2);
                item.haber = this.roundNumber.transform(item.haber, 2).toFixed(2);
                item.balance = this.roundNumber.transform(item.balance, 2).toFixed(2);

                this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(item.debe), 160, row, 'right', 'middle');
                this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(item.haber), 180, row, 'right', 'middle');
                this.doc.setFontType('bold');
                this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(item.balance), 205, row, 'right', 'middle');

                /* this.doc.text("$ " + this.roundNumber.transform(item.debe), 145, row);
                 this.doc.text("$ " + this.roundNumber.transform(item.haber), 165, row);
                 this.doc.setFontType('bold');
                 this.doc.text("$ " + this.roundNumber.transform(item.balance), 185, row);*/
                this.doc.setFontType('normal');

                row += 8;
                i++;

                if (i == 20) {

                    i = 0;

                    this.doc.setFontType("bold");
                    this.doc.text("TRANSPORTE:".toString(), 25, row);
                    this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(item.balance), 194, row, 'right', 'middle');

                    this.getGreeting();
                    this.getFooter();
                    row = 85;
                    this.doc.addPage();


                    this.doc.setFontType("bold");
                    this.doc.text("TRANSPORTE:".toString(), 25, row);
                    this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(item.balance), 194, row, 'right', 'middle');
                    row += 5;

                    this.getHeader(false);
                    this.getClient();

                    // Encabezado de la tabla de Detalle de transacciones
                    this.doc.setFontType('bold');
                    this.doc.setFontSize(this.fontSizes.normal);
                    this.doc.text("Fecha", margin, 77);
                    this.doc.text("Tipo Comp.", 25, 77);
                    this.doc.text("Nro. Comprobante.", 53, 77);
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
        this.balance = this.roundNumber.transform(this.balance, 2).toFixed(2);
        this.doc.textEx("$ " + new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2 }).format(this.balance), 175, 246, 'right', 'middle');
        this.doc.line(0, 250, 240, 250);

        this.getGreeting();
        this.getFooter();

        this.finishImpression();
    }

    async toPrintInvoice() {

        var transport = 0;

        // Encabezado de la transacción
        if (!this.transaction.type.isPreprinted) {


            if (this.config[0].companyPicture && this.config[0].companyPicture !== 'default.jpg') {
                if (this.branchImagen && this.branchImagen !== 'default.jpg') {
                    await this.getBranchPicture(10, 5, 80, 40);
                } else {
                    await this.getCompanyPicture(10, 5, 80, 40);
                }
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

                if (this.config[0].country === 'AR') {
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
            if (Config.country === 'AR') {
                this.doc.text(this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 8), 130, 25);
            } else {
                this.doc.text(this.padString(this.transaction.number, 8), 130, 25);
            }
            this.doc.setFontType('bold');
            this.doc.text("Fecha:", 110, 30);
            this.doc.setFontType('normal');
            if (this.transaction.endDate) {
                this.doc.text(this.transaction.endDate, 125, 30);
            } else {
                this.doc.text(this.transaction.startDate, 125, 30);
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
                        if (this.transaction.letter === this.transaction.type.codes[i].letter) {
                            this.doc.setFontSize('8');
                            this.doc.text("Cod:" + this.transaction.type.codes[i].code, 101, 16);
                        }
                    }
                }
            } else {
                // Dibujar la linea cortada para la letra
                this.doc.line(105, 0, 105, 50); //vertical letra
            }
        }
        if (this.transaction.company) {
            this.getClient();
        }
        if (this.transaction.type.requestEmployee && this.transaction.employeeClosing && this.transaction.employeeClosing._id) {
            this.getEmployee()
        }
        if (this.transaction.transport) {
            this.getTransport();
        }

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
            if (this.transaction.type.requestTaxes &&
                this.transaction.company &&
                this.transaction.company.vatCondition &&
                this.transaction.company.vatCondition.discriminate) {
                let col = 165
                this.doc.text("IVA", col, 77);
                this.transaction.taxes.forEach(element => {
                    if (element.tax.code === "04") {
                        col = col + 10;
                        this.doc.text("Imp Int", col, 77);
                    }
                });
            }
            this.doc.text("Desc", 175, 77);
            this.doc.text("Total", 192, 77);
        }
        this.doc.setFontType('normal');

        // Detalle de productos
        var row = 85;
        var margin = 5;
        var totalArticle = 0;

        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
            for (var i = 0; i < this.movementsOfArticles.length; i++) {
                if (this.movementsOfArticles[i].amount > 0) {

                    if (this.movementsOfArticles[i].amount) {
                        totalArticle = totalArticle + this.movementsOfArticles[i].amount;
                        this.doc.text((this.movementsOfArticles[i].amount).toString(), 6, row);
                    }
                    if (this.movementsOfArticles[i].code) {
                        this.doc.text((this.movementsOfArticles[i].code).toString().slice(0, 15), 15, row);
                    }

                    let detalle = '';

                    if (this.transaction && this.transaction.type && this.transaction.type.printDescriptionType && this.transaction.type.printDescriptionType === DescriptionType.Description) {
                        if (this.movementsOfArticles[i].description) {
                            if (this.movementsOfArticles[i].category &&
                                this.movementsOfArticles[i].category.visibleInvoice &&
                                this.movementsOfArticles[i].make &&
                                this.movementsOfArticles[i].make.visibleSale) {
                                if (this.movementsOfArticles[i].category.visibleInvoice &&
                                    this.movementsOfArticles[i].make.visibleSale) {
                                    detalle = this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].category.description + ' - ' + this.movementsOfArticles[i].make.description
                                } else if (this.movementsOfArticles[i].category.visibleInvoice &&
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
                                } else if (this.movementsOfArticles[i].make && this.movementsOfArticles[i].make.visibleSale && this.movementsOfArticles[i].make.visibleSale) {
                                    detalle = this.movementsOfArticles[i].description + ' - ' + this.movementsOfArticles[i].make.description;
                                } else
                                    detalle = this.movementsOfArticles[i].description;
                            }

                        }
                    } else {
                        if (this.movementsOfArticles[i].article.posDescription) {
                            if (this.movementsOfArticles[i].category &&
                                this.movementsOfArticles[i].category.visibleInvoice &&
                                this.movementsOfArticles[i].make &&
                                this.movementsOfArticles[i].make.visibleSale) {
                                if (this.movementsOfArticles[i].category.visibleInvoice &&
                                    this.movementsOfArticles[i].make.visibleSale) {
                                    detalle = this.movementsOfArticles[i].article.posDescription + ' - ' +
                                        this.movementsOfArticles[i].category.description + ' - ' +
                                        this.movementsOfArticles[i].make.description;
                                } else if (this.movementsOfArticles[i].category.visibleInvoice &&
                                    !this.movementsOfArticles[i].make.visibleSale) {
                                    detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].category.description;
                                } else if (this.movementsOfArticles[i].make.visibleSale && !this.movementsOfArticles[i].category.visibleInvoice) {
                                    detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].make.description;
                                }
                            } else {
                                if (this.movementsOfArticles[i].category &&
                                    this.movementsOfArticles[i].category.visibleInvoice) {
                                    detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].category.description;
                                } else if (this.movementsOfArticles[i].make &&
                                    this.movementsOfArticles[i].make.visibleSale) {
                                    detalle = this.movementsOfArticles[i].article.posDescription + ' - ' + this.movementsOfArticles[i].make.description;
                                } else
                                    detalle = this.movementsOfArticles[i].article.posDescription;
                            }

                        }
                    }

                    if (this.movementsOfArticles[i].otherFields && this.movementsOfArticles[i].otherFields !== null && this.transaction.type.printDescriptionType === DescriptionType.PosDescription) {
                        let temp = this.movementsOfArticles[i].article.description.split(' ');
                        detalle += " Talle:" + temp.pop();
                    }

                    this.doc.text((this.movementsOfArticles[i].salePrice == 0) ? detalle.slice(0, 40) : detalle.slice(0, 45), (this.movementsOfArticles[i].salePrice == 0) ? 50 : 46, row);

                    if (this.transaction.type && this.transaction.type.showPrices) {
                        if (this.transaction.type.requestTaxes &&
                            this.transaction.company &&
                            this.transaction.company.vatCondition &&
                            this.transaction.company.vatCondition.discriminate) {

                            let taxesBase = 0
                            let colum = 165;
                            for (let tax of this.movementsOfArticles[i].taxes) {
                                if (tax.percentage != 0) {
                                    this.doc.text((this.movementsOfArticles[i].salePrice == 0) ? '' : "% " + this.roundNumber.transform(tax.percentage, 2), colum, row);
                                } else {
                                    this.doc.text((this.movementsOfArticles[i].salePrice == 0) ? '' : "$ " + this.roundNumber.transform(tax.taxAmount, 2), colum, row);
                                }
                                taxesBase = taxesBase + tax.taxBase
                                colum = colum + 13;
                            }
                            try {
                                this.doc.textEx((this.movementsOfArticles[i].salePrice == 0) ? '' : "$ " + this.roundNumber.transform(taxesBase / this.movementsOfArticles[i].amount, 2).toFixed(2), 160, row, 'right', 'middle');
                            } catch (error) {
                                this.doc.textEx((this.movementsOfArticles[i].salePrice == 0) ? '' : "$ 0.00", 160, row, 'right', 'middle');
                            }

                            this.doc.textEx((this.movementsOfArticles[i].salePrice == 0) ? '' : "$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice, 2).toFixed(2), 207, row, 'right', 'middle');
                        } else {
                            this.doc.textEx((this.movementsOfArticles[i].salePrice == 0) ? '' : "$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice / this.movementsOfArticles[i].amount, 2), 160, row, 'right', 'middle');
                            this.doc.textEx((this.movementsOfArticles[i].salePrice == 0) ? '' : "$ " + this.roundNumber.transform(this.movementsOfArticles[i].salePrice, 2).toFixed(2), 207, row, 'right', 'middle');
                        }

                        if (this.movementsOfArticles[i].discountRate > 0) {
                            this.doc.text("%" + this.movementsOfArticles[i].discountRate.toString(), 175, row);
                        }

                    }
                    if (this.movementsOfArticles[i].notes) {
                        this.doc.setFontStyle("italic");
                        this.doc.text(this.movementsOfArticles[i].notes.slice(0, 55), 46, row + 5);
                        if (this.movementsOfArticles[i].notes.slice(55, 110) != '') {
                            row += 5;
                            this.doc.text(this.movementsOfArticles[i].notes.slice(55, 110), 46, row + 5);
                        }
                        if (this.movementsOfArticles[i].notes.slice(110, 165) != '') {
                            row += 5;
                            this.doc.text(this.movementsOfArticles[i].notes.slice(110, 165), 46, row + 5);
                        }
                        if (this.movementsOfArticles[i].notes.slice(165, 220) != '') {
                            row += 5;
                            this.doc.text(this.movementsOfArticles[i].notes.slice(165, 220), 46, row + 5);
                        }
                        if (this.movementsOfArticles[i].notes.slice(220, 275) != '') {
                            row += 5;
                            this.doc.text(this.movementsOfArticles[i].notes.slice(220, 275), 46, row + 5);
                        }
                        this.doc.setFontStyle("normal");
                        row += 5;
                    }

                    transport = transport + this.movementsOfArticles[i].salePrice;

                    row += 5;

                    if (row > 240) {
                        this.doc.setFontType("bold");
                        this.doc.text("TRANSPORTE:".toString(), 25, row);
                        this.doc.text(this.roundNumber.transform(transport).toString(), 185, row);
                        row = 95;
                        this.doc.addPage();

                        this.doc.setFontType("bold");

                        this.doc.text("TRANSPORTE:".toString(), 25, 85);
                        this.doc.text(this.roundNumber.transform(transport).toString(), 185, 85);

                        if (!this.transaction.type.isPreprinted) {

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

                                if (this.config[0].country === 'AR') {
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
                                this.doc.text(this.transaction.endDate.split(' ')[0], 125, 25);
                            } else {
                                this.doc.text(this.transaction.startDate.split(' ')[0], 125, 25);
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
        }

        let movCancelation: MovementOfCancellation[] = await this.getCancellationsOfMovements(this.transactionId)

        if (movCancelation && this.printOrigin) {
            this.doc.setFontType('bold');
            this.doc.setFontSize(this.fontSizes.normal);
            this.doc.line(0, row, 200, row)
            row += 5
            this.doc.text("Comprobantes cancelados", 10, row);
            this.doc.text("Total", 80, row);
            this.doc.text("Cliente", 110, row);
            row += 3
            this.doc.line(0, row, 200, row)
            row += 5
            for (let index = 0; index < movCancelation.length; index++) {
                this.doc.setFontType('normal');
                this.doc.text(movCancelation[index].transactionOrigin.type.name + "   " + this.padString(movCancelation[index].transactionOrigin.origin, 4) + "-" + this.padString(movCancelation[index].transactionOrigin.number, 8), 10, row);
                //this.doc.text("$ " + this.roundNumber.transform(this.transactions[index].totalPrice), 80, row);
                this.doc.textEx("$ " + this.roundNumber.transform(movCancelation[index].transactionOrigin.totalPrice), 95, row, 'right', 'middle');
                this.doc.text(movCancelation[index].transactionOrigin.company.name, 110, row);

                row += 5;

                if (row > 240) {
                    this.doc.setFontType("bold");
                    row = 95;
                    this.doc.addPage();

                    if (!this.transaction.type.isPreprinted) {

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

                            if (this.config[0].country === 'AR') {
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
                            this.doc.text(this.transaction.endDate.split(' ')[0], 125, 25);
                        } else {
                            this.doc.text(this.transaction.startDate.split(' ')[0], 125, 25);
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
                        this.doc.line(0, row, 200, row)
                        row += 5
                        this.doc.text("Comprobantes cancelados", 10, row);
                        this.doc.text("Total", 80, row);
                        this.doc.text("Cliente", 110, row);
                        row += 3
                        this.doc.line(0, row, 200, row)
                        row += 5
                    }
                    this.getClient();
                }
            }

        }

        if (this.transaction.type && this.transaction.type.showPrices) {

            let space;
            if (Config.country === 'MX') {
                space = 4;
            } else {
                space = 6;
            }
            let rowTotals = 247;
            this.doc.setFontType('bold');
            this.doc.text("Subtotal:", 140, rowTotals);

            rowTotals += space;

            this.doc.text("Descuento:", 140, rowTotals);
            this.doc.setFontType('normal');
            if (this.transaction.discountAmount && this.transaction.taxes && this.transaction.taxes.length > 0) {
                this.doc.text("$ (" + this.roundNumber.transform(this.transaction.discountAmount / (1 + (this.transaction.taxes[0].percentage / 100)), 2) + ")", 173, rowTotals);
            } else {
                this.doc.text("$ (" + this.roundNumber.transform(this.transaction.discountAmount, 2) + ")", 173, rowTotals);
            }
            let subtotal = this.transaction.totalPrice;
            let neto = 0;

            rowTotals += space;
            var rowNet;
            if (this.transaction.company &&
                this.transaction.company.vatCondition &&
                this.transaction.company.vatCondition.discriminate &&
                this.transaction.type.requestTaxes) {
                if (this.transaction.taxes && this.transaction.taxes.length > 0) {
                    this.doc.setFontType('bold');
                    this.doc.text("Neto Gravado:", 140, rowTotals);
                    rowNet = rowTotals;

                    this.doc.setFontType('normal');
                    for (let tax of this.transaction.taxes) {
                        rowTotals += space;
                        this.doc.setFontType('bold');
                        this.doc.text(tax.tax.name + ":", 140, rowTotals);
                        this.doc.setFontType('normal');
                        this.doc.text("$ " + this.roundNumber.transform(tax.taxAmount), 173, rowTotals);
                        subtotal -= this.roundNumber.transform(tax.taxAmount);
                        if (tax.tax.classification === TaxClassification.Tax) neto = neto + this.roundNumber.transform(tax.taxBase);
                    }
                }

                if (this.transaction.exempt && this.transaction.exempt > 0) {
                    rowTotals += space;
                    this.doc.setFontType('bold');
                    this.doc.text("Exento:", 140, rowTotals);
                    this.doc.setFontType('normal');
                    this.doc.text("$ " + this.roundNumber.transform(this.transaction.exempt, 2), 173, rowTotals);
                }
            }

            if (this.transaction.discountAmount) {
                if (this.transaction.discountAmount && this.transaction.taxes && this.transaction.taxes.length > 0) {
                    subtotal += (this.transaction.discountAmount / (1 + (this.transaction.taxes[0].percentage / 100)));
                } else {
                    subtotal += this.transaction.discountAmount;
                }
            }

            this.doc.text("$ " + this.roundNumber.transform((subtotal), 2).toString(), 173, 247);
            if (neto > 0) {
                this.doc.text("$ " + this.roundNumber.transform((neto), 2).toString(), 173, rowNet);
            }
            rowTotals += space;
            //this.doc.setFontSize(this.fontSizes.extraLarge);
            this.doc.setFontType('bold');
            //this.doc.setFontSize(this.fontSizes.large);
            this.doc.text("Total:", 140, rowTotals);
            this.doc.setFontType('normal');
            this.doc.text("$ " + parseFloat(this.roundNumber.transform(this.transaction.totalPrice, 2)), 173, rowTotals);
            this.doc.setFontSize(this.fontSizes.normal);
        }

        row = 246;

        // FORMA DE PAGO
        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {

            if (Config.country === 'MX' &&
                this.transaction.stringSAT &&
                this.transaction.SATStamp &&
                this.transaction.CFDStamp) {
                this.doc.setFontType('bold');
                this.doc.text("Forma de pago: ", 35, row);
                this.doc.setFontType('normal');

                row += 5;

                for (let movementOfCash of this.movementsOfCashes) {
                    this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid))}`, 35, row);
                    this.doc.text(`${movementOfCash.type.name}.`, 65, row);
                    row += 5;
                }
            } else {
                this.doc.setFontType('bold');
                this.doc.text("Forma de pago: ", margin, row);
                this.doc.setFontType('normal');

                row += 5;

                for (let movementOfCash of this.movementsOfCashes) {
                    this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid))}`, margin, row);
                    this.doc.text(`${movementOfCash.type.name}.`, 28, row);
                    row += 5;
                }
            }
        }

        // FIN FORMA DE PAGO
        if (totalArticle > 0) {
            this.doc.setFontType('bold');
            this.doc.text("Total de Productos: " + (this.roundNumber.transform(totalArticle)), margin + 70, 247);
            this.doc.setFontType('normal');
        }

        // OBSERVATION
        let observation: string = '';

        if (this.transaction.type.electronics && this.company && this.company.vatCondition && this.company.vatCondition.observation && this.company.vatCondition.observation != '') {
            observation += this.company.vatCondition.observation + '.- ';
        }

        if (this.transaction.observation && this.transaction.observation != '') {
            observation += this.transaction.observation + '.- ';
        }

        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
            for (let movementOfCash of this.movementsOfCashes) {
                if (movementOfCash.observation && movementOfCash.observation != '') {
                    observation += movementOfCash.observation + '.- ';
                }
            }
        }

        if (observation && observation !== '') {
            if (Config.country === 'MX' &&
                this.transaction.stringSAT &&
                this.transaction.SATStamp &&
                this.transaction.CFDStamp) {
                this.doc.setFontType('bold');
                this.doc.text("Observaciones: ", margin, row);
                this.doc.setFontType('normal');
                row += 4;

                (observation.length > 0) ? this.doc.text(observation.slice(0, 45) + "-", 65, row) : '';
                (observation.length > 45) ? this.doc.text(observation.slice(45, 105) + "-", 35, row += 4) : '';
            } else {
                row += 4
                this.doc.setFontType('bold');
                this.doc.text("Observaciones: ", margin + 35, row);
                this.doc.setFontType('normal');
                row += 4;

                (observation.length > 0) ? this.doc.text(observation.slice(0, 60) + "-", margin + 35, row) : '';
                (observation.length > 60) ? this.doc.text(observation.slice(60, 120) + "-", margin + 35, row += 4) : '';
                (observation.length > 120) ? this.doc.text(observation.slice(120, 180) + "-", margin + 35, row += 4) : '';
                (observation.length > 180) ? this.doc.text(observation.slice(180, 220) + "-", margin + 35, row += 4) : '';
                (observation.length > 220) ? this.doc.text(observation.slice(220, 260) + "-", margin + 35, row += 4) : '';
                (observation.length > 260) ? this.doc.text(observation.slice(260, 320) + "-", margin + 35, row += 4) : '';
            }
        }

        if (this.transaction.type.requestTransport && this.transaction.transport) {

            this.doc.setFontType('bold');
            this.doc.text("CANTIDAD DE BULTOS:", margin, row + 16);
            this.doc.text("VALOR DECLARADO:", margin, row + 20);
            if (this.transaction.package) {
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.package.toString(), margin + 45, row + 16);
            }
            if (this.transaction.declaredValue) {
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.declaredValue.toString(), margin + 45, row + 20);
            }
            this.doc.setFontType('normal');
            if (this.transaction.transport.name) {
                this.doc.setFontType('bold');
                this.doc.text("TRANSPORTE:", margin, row);
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.transport.name, margin + 26, row);
            }

            if (this.transaction.transport.address) {
                this.doc.setFontType('bold');
                this.doc.text("DOMICILIO:", margin, row + 4);
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.transport.address, margin + 20, row + 4);
            }
            if (this.transaction.transport.city) {
                this.doc.setFontType('bold');
                this.doc.text("LOCALIDAD:", margin, row + 8);
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.transport.city, margin + 22, row + 8);
            }
            if (this.transaction.transport.identificationValue) {
                this.doc.setFontType('bold');
                this.doc.text("CUIT:", margin, row + 12);
                this.doc.setFontType('normal');
                this.doc.text(this.transaction.transport.identificationValue, margin + 30, row + 12);
            }
            if (!this.transaction.declaredValue) {
                if (this.transaction.taxes && this.transaction.taxes.length > 0) {
                    let priceWhitoutTaxes
                    for (const iterator of this.transaction.taxes) {
                        priceWhitoutTaxes = iterator.taxBase
                    }
                    this.doc.text("$" + parseFloat(this.roundNumber.transform(priceWhitoutTaxes, 2)).toString(), margin + 40, row + 20);
                } else {
                    this.doc.text("$" + parseFloat(this.roundNumber.transform(this.transaction.totalPrice, 2)).toString(), margin + 40, row + 20);
                }
            }
            row += 16;
        }

        if (this.transaction.type.printSign) {
            row += 10
            this.doc.line(70, row, 120, row)
            this.doc.text("FIRMA CONFORME", 80, row + 5)
        }

        // FIN OBSERVATION
        if (Config.country === 'AR' &&
            this.transaction.CAE &&
            this.transaction.CAEExpirationDate) {
            this.doc.setFontType('bold');
            this.doc.text("CAE:", 50, 282);
            this.doc.text("Fecha Vto:", 50, 287);
            this.doc.setFontType('normal');
            this.doc.text(this.transaction.CAE, 60, 282);
            this.doc.text(this.transaction.CAEExpirationDate.split('T')[0], 70, 287);

            let imgdata = 'data:image/png;base64,' + this.barcode64;

            this.doc.addImage(imgdata, 'PNG', margin, 257, 30, 30);
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
            if (this.branchImagen && this.branchImagen !== 'default.jpg') {
                await this.getBranchPicture(10, 5, 80, 40, true);
            } else {
                await this.getCompanyPicture(10, 5, 80, 40, true);
            }
        }
    }

    async toPrintInvoiceRoll() {

        //Cabecera del ticket
        var margin = 5;
        var row = 5;
        let width = this.printer.pageWidth;

        if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
            this.doc.setFontType('bold');
            this.doc.setFontSize(this.fontSizes.large);
            if (this.config[0].companyFantasyName) {
                this.centerText(margin, margin, width, 0, row, this.config[0].companyFantasyName);
            } else {
                this.centerText(margin, margin, width, 0, row, this.config[0].companyName);
            }
            this.doc.setFontType('small');
            this.doc.setFontSize(this.fontSizes.small);
            row += 3;
            this.centerText(margin, margin, width, 0, row, this.config[0].companyAddress);
            row += 3;
            this.centerText(margin, margin, width, 0, row, "Tel: " + this.config[0].companyPhone);
            row += 3;
            this.centerText(margin, margin, width, 0, row, this.config[0].companyVatCondition.description + " - " + this.config[0].companyIdentificationType.name + ":" + this.config[0].companyIdentificationValue)
            row += 3;
            this.centerText(margin, margin, width, 0, row, "Ingresos Brutos: " + this.config[0].companyGrossIncome)
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
        row += 3;
        this.doc.setFontSize(5)
        if (this.transaction.type.codes && Config.country === 'AR') {
            for (let i = 0; i < this.transaction.type.codes.length; i++) {
                if (this.transaction.letter === this.transaction.type.codes[i].letter) {
                    this.doc.text("Cod:" + this.transaction.type.codes[i].code, 20, row);
                }
            }
        }
        row += 3;
        this.doc.setFontSize(10)
        this.doc.text("ORIGINAL", 15, row)

        //LADO DERECHO
        this.doc.setFontSize(15)
        this.doc.setFontType('blod')
        if (this.transaction.type.labelPrint) {
            this.doc.text(this.transaction.type.labelPrint, 45, 25)
        } else {
            this.doc.text(this.transaction.type.name, 45, 25)
        }
        this.doc.setFontSize(8)
        if (Config.country === 'AR') {
            this.doc.text("N°:" + this.padString(this.transaction.origin, 4) + "-" + this.padString(this.transaction.number, 8), 45, 30);
        } else {
            this.doc.text("N°:" + this.padString(this.transaction.number, 8), 45, 30);
        }
        this.doc.text(this.transaction.endDate.split(' ')[0], 45, 35)

        row += 3;
        this.doc.line(0, row, width, row);
        row += 3;

        if (this.transaction.company && this.transaction.company._id) {
            this.doc.setFontType('bold');
            this.doc.text("Razón Social : " + this.transaction.company.name, margin, row);
            row += 3;
            this.doc.text(this.transaction.company.identificationType.name + " :" + this.transaction.company.identificationValue, margin, row);
            row += 3;
            this.doc.text("Condición de IVA : " + this.transaction.company.vatCondition.description, margin, row);
            row += 3;
            this.doc.text("Dirección : " + this.transaction.company.address + " " + this.transaction.company.addressNumber, margin, row);
            row += 3;
            this.doc.text("Telefono : " + this.transaction.company.phones, margin, row);
            row += 3;
            this.doc.text("Localidad : " + this.transaction.company.city, margin, row);
            this.doc.setFontType('normal');

        } else {
            if (this.transaction.madein == 'resto' || this.transaction.madein == 'mostrador') {
                this.doc.setFontType('bold');
                this.doc.text("Cliente : " + "Consumidor Final", margin, row);
                this.doc.setFontType('normal');
            }
        }

        row += 3;
        this.doc.line(0, row, width, row);
        row += 3;

        if (this.transaction.cashBox) {
            this.doc.text("Caja : " + this.transaction.cashBox.number, margin, row);
            row += 3;
            this.doc.line(0, row, width, row);
            row += 3;
        }

        this.doc.text("Cant.", margin, row);
        this.doc.text("Descipción", width / 3, row);
        this.doc.text("P. unitario", 50, row);
        this.doc.text("Total", width / 1.17, row);

        row += 2;
        this.doc.line(0, row, width, row);

        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
            for (let movementOfArticle of this.movementsOfArticles) {
                if (movementOfArticle.salePrice > 0) {

                    row += 3;
                    this.centerText(margin, margin, 15, 0, row, movementOfArticle.amount.toString());
                    this.doc.text(movementOfArticle.description.slice(0, 20), 13, row);

                    if (this.transaction.type && this.transaction.type.showPrices) {
                        if (this.transaction.type.requestTaxes &&
                            this.transaction.company &&
                            this.transaction.company._id &&
                            this.transaction.company.vatCondition.discriminate) {
                            let prUnit = 0;
                            for (let tax of movementOfArticle.taxes) {
                                prUnit = prUnit + (tax.taxBase / movementOfArticle.amount)
                            }
                            this.doc.text("$ " + this.roundNumber.transform(prUnit, 2), 50, row);
                        } else {
                            this.doc.text("$ " + this.roundNumber.transform(movementOfArticle.salePrice / movementOfArticle.amount, 2), 50, row);
                        }
                    }

                    this.doc.text("$" + this.roundNumber.transform(movementOfArticle.salePrice).toString(), width / 1.18, row);
                    row += 3;
                    movementOfArticle.article.taxes.forEach(element => {
                        if (element.percentage >= 0) {
                            this.doc.text("( IVA: " + this.roundNumber.transform(movementOfArticle.article.taxes[0].percentage).toFixed(2) + " %)", 13, row)
                        }
                    });

                    if (movementOfArticle.notes && movementOfArticle.notes !== "") {
                        row += 3;
                        this.doc.setFontStyle("italic");
                        this.doc.setTextColor(90, 90, 90);
                        this.doc.text(movementOfArticle.notes, 20, row);
                        this.doc.setFontStyle("normal");
                        this.doc.setTextColor(0, 0, 0);
                    }
                }
            }
        }

        if (this.transaction.company && this.transaction.company.vatCondition && this.transaction.company.vatCondition.discriminate) {
            row += 3;
            this.doc.line(0, row, width, row);
            row += 3;
            this.doc.text("Impuestos: ", 5, row);
            this.doc.setFontType('small');
            this.transaction.taxes.forEach(element => {
                row += 3;
                this.doc.text(element.tax.name + ": " + "$" + this.roundNumber.transform(element.taxAmount).toString(), 5, row)
            });
        }

        row += 3;
        this.doc.line(0, row, width, row);
        row += 3;
        this.doc.setFontStyle('bold');
        this.doc.setFontSize(10);
        this.doc.text("TOTAL $ " + this.transaction.totalPrice, 50, row);
        this.doc.setFontStyle("small");
        row += 3;

        // FORMA DE PAGO
        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {

            if (Config.country === 'MX' &&
                this.transaction.stringSAT &&
                this.transaction.SATStamp &&
                this.transaction.CFDStamp) {
                this.doc.text("Forma de pago: ", 5, row);
                this.doc.setFontType('small');

                row += 5;

                for (let movementOfCash of this.movementsOfCashes) {
                    this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid))}`, 5, row);
                    this.doc.text(`${movementOfCash.type.name}.`, 5, row);
                    row += 5;
                }
            } else {
                this.doc.text("Forma de pago: ", margin, row);
                this.doc.setFontType('small');

                row += 5;

                for (let movementOfCash of this.movementsOfCashes) {
                    this.doc.text(`$ ${parseFloat(this.roundNumber.transform(movementOfCash.amountPaid))}`, margin, row);
                    this.doc.text(`${movementOfCash.type.name}.`, 28, row);
                    row += 5;
                }
            }
        }

        // FIN FORMA DE PAGO

        row += 3;
        if(this.transaction.orderNumber || this.transaction.table){
            var number = this.transaction.orderNumber ? this.transaction.orderNumber : this.transaction.table.description
            this.doc.setFontType('bold');
            this.doc.text("* * * * * * * * * * * * * * * *",margin,row)
            row += 3;
            this.doc.text("Tu Orden: " + number.toString(), margin + 10, row);
            row += 4;
            this.doc.text("* * * * * * * * * * * * * * * *",margin,row)
            row += 3;
        }


        this.doc.line(0, row, width, row);
        row += 4;


        if (Config.country === 'AR' &&
            this.transaction.CAE &&
            this.transaction.CAEExpirationDate) {
            this.doc.setFontType('bold');
            this.doc.text("CAE: " + this.transaction.CAE, margin, row);
            let imgdata = 'data:image/png;base64,' + this.barcode64;
            this.doc.addImage(imgdata, 'PNG', margin + 40, row - 3, 20, 20);
            row += 4;
            this.doc.text("Fecha Vto: " + this.transaction.CAEExpirationDate.split('T')[0], margin, row)

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
            if (this.branchImagen && this.branchImagen !== 'default.jpg') {
                await this.getBranchPicture(1, 1, width - 2, 18, true);
            } else {
                await this.getCompanyPicture(1, 1, width - 2, 18, true);
            }
        }
    }

    async finishImpression() {

        if (this.movementsOfCancellation && this.movementsOfCancellation.length !== this.printOriginCount && this.printOrigin) {
            this.transactionId = this.movementsOfCancellation[this.printOriginCount].transactionOrigin._id;
            this.printOriginCount++;
            this.doc.addPage();
            this.getConfig()
        }

        if (!this.source && (this.printer && !this.printer.url)) {
            this.doc.autoPrint();
            this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));
        }

        if (this.printer.url && this.typePrint) {
            this._printService.saveFile(this.doc.output('blob'), this.typePrint, this.transactionId).then(
                result => {
                    if (result) {
                        this._printService.toPrintURL(this.printer.url, "/home/clients/" + Config.database + "/" + this.typePrint + "/" + this.transactionId + ".pdf").subscribe();
                    }
                }
            )
        }

        if (this.transaction && this.transaction.type && this.transaction.type.electronics) {
            this._printService.saveFile(this.doc.output('blob'), 'invoice', this.transactionId);
        } else if (this.source === "mail") {
            if (this.transaction) {
                this._printService.saveFile(this.doc.output('blob'), 'others', this.transactionId);
            } else if (!this.transaction && this.typePrint === 'current-account') {
                this._printService.saveFile(this.doc.output('blob'), 'others', this.typePrint);
            }
        }
    }

    public toPrintKitchen() {

        //Cabecera del ticket
        var margin = 5;
        var row = 5;


        //jackson
        this.doc.line(0, row, 80, row);
        row += 40
        this.doc.line(0, row, 80, row);

        this.doc.setFontType('bold');
        this.doc.setFontSize(this.fontSizes.large);
        this.centerText(3, 5, 60, 0, row, "COCINA");
        this.doc.setFontType('normal');
        this.doc.setFontSize(this.fontSizes.large);

        row += 8;
        this.doc.setFontType('bold');
        if (this.transaction.orderNumber > 0) {
            this.doc.text("Pedido Nº: " + this.transaction.orderNumber, margin, row);
        } else {
            this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
        }
        row += 5;
        this.doc.setFontType('normal');
        this.doc.text("Fecha: " + this.transaction.startDate.substring(0, 5), margin, row);
        row += 5;
        if (this.transaction.updateDate) {
            this.doc.text("Hora: " + this.transaction.updateDate.substring(11, 13) + ":" + this.transaction.updateDate.substring(15, 17), margin, row);

        } else {

            this.doc.text("Hora: " + this.transaction.startDate.substring(11, 13) + ":" + this.transaction.startDate.substring(15, 17), margin, row);
        }

        if (this.transaction.table) {
            row += 5;
            this.doc.setFontType('bold');
            if (this.transaction.employeeOpening) {
                this.doc.text("Mozo: " + this.transaction.employeeOpening.name, margin, row);
                row += 5;
            }
            this.doc.text("Mesa: " + this.transaction.table.description, margin, row);
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
        this.doc.setFontType('normal');
        this.doc.setFontSize(this.fontSizes.normal);
        //jacksonburgs
        //this.doc.setFontType('bold');
        //this.doc.setFontSize(this.fontSizes.large);
        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
            for (let movementOfArticle of this.movementsOfArticles) {
                row += 5;
                this.centerText(3, 5, 15, 0, row, this.roundNumber.transform(movementOfArticle.amount - movementOfArticle.printed).toString());
                if (movementOfArticle.article) {
                    this.doc.text(movementOfArticle.article.posDescription, 15, row);
                } else {
                    this.doc.text(movementOfArticle.description, 15, row);
                }

                if (movementOfArticle.notes && movementOfArticle.notes !== '') {
                    row += 5;
                    this.doc.setFontStyle("italic");
                    var slice = 0;

                    var note = movementOfArticle.notes.split(';')

                    if (note && note.length > 0) {
                        for (const iterator of note) {
                            this.doc.text(iterator, 5, row);
                            row += 5
                        }
                    } else {
                        while (movementOfArticle.notes.length > slice) {
                            this.doc.text(movementOfArticle.notes.slice(slice, this.printer.pageWidth - 40 + slice) + "-", 5, row);
                            row += 5
                            slice = slice + this.printer.pageWidth - 40
                        }
                    }
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
        this.doc.text("Fecha: " + this.transaction.startDate.substring(11, 13) + ":" + this.transaction.startDate.substring(15, 17), 40, row);

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
                row += 5;
                this.centerText(3, 5, 15, 0, row, this.roundNumber.transform(movementOfArticle.amount - movementOfArticle.printed).toString());
                if (movementOfArticle.article) {
                    this.doc.text(movementOfArticle.article.posDescription, 20, row);
                } else {
                    this.doc.text(movementOfArticle.description, 20, row);
                }

                if (movementOfArticle.notes && movementOfArticle.notes !== '') {
                    //aca logica de nota
                    row += 5;
                    this.doc.setFontStyle("italic");
                    var slice = 0
                    while (movementOfArticle.notes.length > slice) {
                        this.doc.text(movementOfArticle.notes.slice(slice, this.printer.pageWidth - 30 + slice) + "-", 5, row);
                        row += 4
                        slice = slice + this.printer.pageWidth - 30
                    }
                }
            }
        }

        row += 3;
        this.doc.line(0, row, 80, row);
        row += 3;
        this.doc.line(0, row, 80, row);

        this.finishImpression();
    }

    public async toPrintVoucher() {

        //Cabecera del ticket
        var margin = 5;
        var row = 10;

        if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {

            this.doc.setFontType('bold');
            this.doc.setFontSize(this.fontSizes.large);
            if (this.config[0].companyFantasyName) {
                this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.config[0].companyFantasyName);
            } else {
                this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.config[0].companyName);
            }
            this.doc.setFontType('normal');
            this.doc.setFontSize(this.fontSizes.normal);
            row += 5;
            this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.config[0].companyAddress.toString().slice(0, this.roundNumber.transform(this.printer.pageWidth / 2)));
            row += 5;
            this.centerText(margin, margin, this.printer.pageWidth, 0, row, "tel: " + this.config[0].companyPhone);
        } else {
            row += 30;
            this.doc.setFontType('normal');
            this.doc.setFontSize(this.fontSizes.normal);
            if (this.branchImagen && this.branchImagen !== 'default.jpg') {
                await this.getBranchPicture(3, 3, this.printer.pageWidth - 5, 26, false);
            } else {
                await this.getCompanyPicture(3, 3, this.printer.pageWidth - 5, 26, false);
            }
        }

        row += 8;
        this.doc.setFontType('bold');
        if (this.transaction.orderNumber > 0) {
            this.doc.text("Pedido Nº: " + this.transaction.orderNumber, margin, row);
        } else {
            this.doc.text("Pedido Nº: " + this.transaction.number, margin, row);
        }
        this.doc.setFontType('normal');
        this.doc.text("Hora: " + this.transaction.startDate.substring(11, 13) + ":" + this.transaction.startDate.substring(15, 17), 40, row);

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
            let i = 0;
            for (let movementOfArticle of this.movementsOfArticles) {
                row += 5;
                this.centerText(3, 5, 15, 0, row, this.roundNumber.transform(movementOfArticle.amount - movementOfArticle.printed).toString());
                if (movementOfArticle.article) {
                    this.doc.text(movementOfArticle.description, 20, row);
                }

                if (movementOfArticle.notes && movementOfArticle.notes !== '') {
                    row += 5;
                    this.doc.setFontStyle("italic");
                    var slice = 0;
                    while (movementOfArticle.notes.length > slice) {
                        this.doc.text(movementOfArticle.notes.slice(slice, this.printer.pageWidth - 30 + slice) + "-", 5, row);
                        row += 4;
                        slice = slice + this.printer.pageWidth - 30;
                    }
                    this.doc.setFontStyle("normal");
                }
            }
        }


        // let qr: {} = {};
        // qr['type'] = 'articles';
        // qr['time'] = moment();
        // qr['transaction'] = this.transactionId;
        // qr['iat'] = moment().unix();
        // qr['exp'] = moment().add(this.config[0].voucher.minutesOfExpiration, "minutes").unix();

        // Encrypt
        // this._voucherService.generateVoucher(qr).subscribe(
        // 	async result => {
        // 		if (!result.voucher) {
        // 			if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        // 		} else {
        let voucher: Voucher = new Voucher();
        voucher.token = this.transactionId;
        voucher.date = moment().format('YYYY-MM-DDTHH:mm:ssZ');
        voucher.expirationDate = moment().add(this.config[0].voucher.minutesOfExpiration, "minutes").format('YYYY-MM-DDTHH:mm:ssZ');
        await this.saveVoucher(voucher).then(
            async voucher => {
                if (voucher) {
                    this.barcode64 = await this.getBarcode('qr?value=' + this.transactionId);

                    let imgdata = 'data:image/png;base64,' + this.barcode64;
                    let imgWidth = 50;
                    margin = this.roundNumber.transform((this.printer.pageWidth - imgWidth) / 2);
                    this.doc.addImage(imgdata, 'PNG', margin, row + 5, imgWidth, imgWidth);
                    row += 60;
                    this.doc.setFontType('bold');
                    this.centerText(margin, margin, this.printer.pageWidth, 0, row, this.transactionId);
                    this.doc.setFontType('normal');
                    this.finishImpression();
                }
            }
        );
        // 		}
        // 	}
        // );
    }

    public saveVoucher(voucher: Voucher): Promise<Voucher> {

        return new Promise<Voucher>((resolve, reject) => {

            this.loading = true;

            this._voucherService.saveVoucher(voucher).subscribe(
                async result => {
                    this.loading = false;
                    if (!result.voucher) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.voucher);
                    }
                },
                error => {
                    this.loading = false;
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    async toPrintRoll() {
        //Cabecera del ticket

        var margin = 5;

        let width = this.printer.pageWidth;

        if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {

            this.doc.setFontType('bold');
            this.doc.setFontSize(this.fontSizes.large);
            if (this.config[0].companyFantasyName) {
                this.centerText(margin, margin, width, 0, this.row, this.config[0].companyFantasyName);
            } else {
                this.centerText(margin, margin, width, 0, this.row, this.config[0].companyName);
            }
            this.doc.setFontType('normal');
            this.doc.setFontSize(this.fontSizes.normal);
            this.row += 5;
            this.centerText(margin, margin, width, 0, this.row, this.config[0].companyAddress);
            this.row += 5;
            this.centerText(margin, margin, width, 0, this.row, "tel: " + this.config[0].companyPhone);
            this.row += 8;
        } else {
            this.row += 30;
            this.doc.setFontType('normal');
            this.doc.setFontSize(this.fontSizes.normal);
        }

        this.doc.setFontType('bold');
        if (this.transaction.orderNumber && this.transaction.orderNumber > 0) {
            this.doc.text("Pedido Nº: " + this.transaction.orderNumber.toString(), margin, this.row);
        } else {
            this.doc.text("Pedido Nº: " + this.transaction.number, margin, this.row);
        }
        this.doc.setFontType('normal');

        this.doc.text("Fecha: " + this.transaction.endDate.substring(0, 5), (width / 1.6), this.row);
        this.row += 5;
        this.doc.text("Hora: " + this.transaction.endDate.substring(11, 13) + ":" + this.transaction.endDate.substring(15, 17) + ":" + this.transaction.endDate.substring(19, 21), (width / 1.6), this.row);

        this.doc.setFontType('normal');

        if (this.transaction.company) {
            if (this.transaction.madein == 'resto' || this.transaction.madein == 'mostrador' || this.transaction.madein == 'pedidos-web') {
                this.row += 5;
                this.doc.setFontType('bold');
                if (this.transaction.company.name !== undefined) {
                    this.doc.text("Cliente : " + this.transaction.company.name, margin, this.row);
                } else {
                    this.doc.text("Cliente : Consumidor Final", margin, this.row);
                }
                this.row += 5;
                if (this.transaction.company.phones) {
                    this.doc.text("Telefono : " + this.transaction.company.phones, margin, this.row);
                }

                this.doc.setFontType('normal');
            }
            if (this.transaction.madein == 'delivery') {
                this.row += 5;
                this.doc.setFontType('bold');
                this.doc.text("Entregar a: " + this.transaction.company.address, margin, this.row);
                this.doc.setFontType('normal');
            }
            if (this.transaction.madein == 'pedidos-web' && this.transaction.deliveryAddress) {
                this.row += 5;
                let direccion = "";
                this.doc.setFontType('bold');

                if (this.transaction.deliveryAddress.name) {
                    direccion = direccion + " " + this.transaction.deliveryAddress.name;
                }
                if (this.transaction.deliveryAddress.number) {
                    direccion = direccion + " N°" + this.transaction.deliveryAddress.number;
                }

                if (direccion.length > 27) {
                    this.doc.text("Entregar a: " + direccion.slice(0, 25) + "-", margin, this.row);
                    this.row += 5;
                    this.doc.text(direccion.slice(25, direccion.length), margin, this.row);
                } else {
                    this.doc.text("Entregar a: " + direccion, margin, this.row);
                }

                if (this.transaction.deliveryAddress.floor) {
                    this.row += 5;
                    this.doc.text("Piso: " + this.transaction.deliveryAddress.floor, margin + 5, this.row);
                }
                if (this.transaction.deliveryAddress.flat) {
                    this.row += 5;
                    this.doc.text(" Departamento: " + this.transaction.deliveryAddress.flat, margin + 5, this.row);
                }

                if (this.transaction.deliveryAddress && this.transaction.deliveryAddress.observation) {
                    if (this.transaction.deliveryAddress.observation.length > 30) {
                        this.row += 5;
                        this.doc.text("Obs: " + this.transaction.deliveryAddress.observation.slice(0, 29) + "-", margin, this.row);
                        this.row += 5;
                        this.doc.text(this.transaction.deliveryAddress.observation.slice(29, this.transaction.deliveryAddress.observation.length), margin, this.row);
                    } else {
                        this.row += 5;
                        this.doc.text("Obs: " + this.transaction.deliveryAddress.observation, margin, this.row);
                    }
                }

                this.doc.setFontType('normal');
            }
        } else {
            if (this.transaction.madein == 'resto' || this.transaction.madein == 'mostrador') {
                this.row += 5;
                this.doc.setFontType('bold');
                this.doc.text("Cliente : " + "Consumidor Final", margin, this.row);
                this.doc.setFontType('normal');
            }
        }

        if (this.transaction.madein == 'resto') {
            this.row += 5;
            this.doc.setFontType('bold');
            if (this.transaction.employeeOpening) {
                this.doc.text("Mozo: " + this.transaction.employeeOpening.name, margin, this.row);
            }
            if (this.transaction.table) {
                this.doc.text("Mesa: " + this.transaction.table.description, 40, this.row);
            }
            this.doc.setFontType('normal');
        } else if (this.transaction.employeeOpening) {
            this.row += 5;
            this.doc.setFontType('bold');
            this.doc.text("Empleado: " + this.transaction.employeeOpening.name, margin, this.row);
            this.doc.setFontType('normal');
        }

        /*if (this.transaction.shipmentMethod && this.transaction.shipmentMethod._id) {
          this.row += 5;
          this.doc.setFontType('bold');
          this.doc.text("Método de Envío: " + this.transaction.shipmentMethod.name, margin, this.row);
          this.doc.setFontType('normal');
        }*/

        //Cabecera de la tala de productos
        this.row += 3;
        this.doc.line(0, this.row, width, this.row);
        this.row += 5;
        this.doc.text("Desc.", margin, this.row);
        this.doc.text("Total", width - 13, this.row);
        this.row += 3;
        this.doc.line(0, this.row, width, this.row);

        //Cuerpo de la tabla de productos
        this.row + 5;
        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
            for (let movementOfArticle of this.movementsOfArticles) {
                if (movementOfArticle.salePrice > 0) {

                    this.row += 6;
                    this.doc.text(movementOfArticle.description.slice(0, 25), margin, this.row);
                    this.doc.text(this.roundNumber.transform(movementOfArticle.amount) + " x " + this.roundNumber.transform((movementOfArticle.salePrice + (movementOfArticle.transactionDiscountAmount * movementOfArticle.amount)) / movementOfArticle.amount).toString(), margin, this.row + 3);
                    this.doc.text("$" + this.roundNumber.transform(movementOfArticle.salePrice + (movementOfArticle.transactionDiscountAmount * movementOfArticle.amount)).toString(), width - 13, this.row);

                    if (movementOfArticle.notes && movementOfArticle.notes !== "") {
                        this.row += 6;
                        this.doc.setFontStyle("italic");
                        this.doc.setTextColor(0, 0, 0);
                        var slice = 0

                        var note = movementOfArticle.notes.split(';')

                        if (note && note.length > 0) {
                            for (const iterator of note) {
                                this.doc.text(iterator, 5, this.row);
                                this.row += 5
                            }
                        } else {

                            while (movementOfArticle.notes.length > slice) {
                                this.doc.text(movementOfArticle.notes.slice(slice, this.printer.pageWidth - 30 + slice) + "-", 5, this.row);
                                this.row += 4
                                slice = slice + this.printer.pageWidth - 30
                            }
                            this.doc.setFontStyle("normal");
                            this.doc.setTextColor(0, 0, 0);
                        }
                    }
                    if (movementOfArticle.article && movementOfArticle.article.containsStructure) {
                        var movArticle: MovementOfArticle[] = await this.getMovArticleChild(movementOfArticle._id)

                        if (movArticle && movArticle.length > 0) {
                            this.doc.setFontStyle("italic");
                            for (const iterator of movArticle) {
                                this.row += 6
                                this.doc.text(iterator.description, 5, this.row);
                            }
                        }
                    }
                }
            }
        }

        //Pie de la tabla de productos
        this.row += 5;
        this.doc.line(0, this.row, 240, this.row);
        if (this.transaction.discountAmount > 0) {
            this.row += 5;
            this.doc.text("DESCUENTO", margin, this.row);
            this.doc.text("- $" + this.roundNumber.transform(this.transaction.discountAmount).toString(), width - 15, this.row)
        }

        if (this.movementsOfCashes) {
            this.row += 5;
            this.doc.setFontType('bold');
            this.doc.text("Forma de Pago:", margin, this.row)

            this.movementsOfCashes.forEach(element => {
                this.row += 5;
                this.doc.setFontType('normal');
                this.doc.text(`${element.type.name} : $ ${parseFloat(this.roundNumber.transform(element.amountPaid))}`, margin, this.row);

                if (element && element.paymentChange > 0) {
                    this.row += 5;
                    this.doc.text("Paga con: $ " + (element.paymentChange + element.amountPaid).toString(), margin + 5, this.row)
                    this.row += 5;
                    this.doc.text("Su vuelto es: $ " + element.paymentChange.toString(), margin + 5, this.row)
                    this.row += 5;
                }
            });
        }

        if (this.transaction.shipmentMethod) {
            this.row += 5;
            this.doc.setFontType('bold');
            this.doc.text("Forma de Entrega:", margin, this.row)

            this.row += 5;
            this.doc.setFontType('normal');
            this.doc.text(`${this.transaction.shipmentMethod.name}`, margin, this.row);
            
        }

        this.doc.setFontStyle('bold');
        this.row += 5;

        this.doc.setFontSize(15);
        this.centerText(margin, margin, width, 2, this.row, "TOTAL $ " + this.transaction.totalPrice);
        //this.doc.text("$ " + this.transaction.totalPrice, width/1.4, this.row);
        this.doc.setFontStyle("normal");

        // if (this.config[0].footerInvoice) {
        //   this.doc.setFontStyle("italic");
        //   this.row += 10;
        //   this.centerText(margin, margin, width, 0, this.row, this.config[0].footerInvoice);
        //   this.doc.setFontStyle("normal");
        // }

        //Pie del ticket
        this.doc.setFontSize(this.fontSizes.xsmall);
        this.row += 5;
        this.centerText(margin, margin, width, 0, this.row, "Generado en POSCLOUD.com.ar");
        this.doc.setTextColor(0, 0, 0);
        if (!this.config[0].companyPicture || this.config[0].companyPicture === 'default.jpg') {
            this.finishImpression();
        } else {
            if (this.branchImagen && this.branchImagen !== 'default.jpg') {
                await this.getBranchPicture(3, 3, this.printer.pageWidth - 5, 26, false);
            } else {
                await this.getCompanyPicture(3, 3, this.printer.pageWidth - 5, 26, false);
            }
            if (this.transaction.type.numberPrint && this.count < this.transaction.type.numberPrint) {
                this.row += 5;
                this.doc.setLineWidth(1.5)
                this.doc.line(0, this.row, width, this.row);
                this.doc.setLineWidth(0)
                this.count++;
                this.toPrintRoll();
            } else {
                this.finishImpression();
            }
        }
    }

    public getMovArticleChild(movementOfArticleId) {
        return new Promise<MovementOfArticle[]>((resolve, reject) => {
            let project = {
                _id: 1,
                movementParent: 1,
                description: 1,
                "category._id": 1,
                "category.isRequiredOptional": 1,
                operationType: 1
            }

            let match = {
                movementParent: { $oid: movementOfArticleId },
                "category.isRequiredOptional": true,
                operationType: { $ne: 'D' }
            }
            this._movementOfArticleService.getMovementsOfArticlesV2(project, match, { description: 1 }, {}).subscribe(
                result => {
                    if (result && result.movementsOfArticles) {
                        resolve(result.movementsOfArticles)
                    } else {
                        resolve(null)
                    }
                },
                error => {
                    resolve(null)
                }
            )
        })
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
        this.doc.text("Generado en http://poscloud.com.ar, tu Punto de Venta en la NUBE.", 5, 293);
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

    public getBarcode64(barcode, op: string): void {

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

    public getBarcode(barcode: string): Promise<string> {

        return new Promise<string>((resolve, reject) => {
            this._printService.getBarcode(barcode).subscribe(
                result => {
                    resolve(result.bc64);
                },
                error => {
                    reject(error);
                }
            );
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

    public getUnidades(num) {

        switch (num) {
            case 1: return "UNO";
            case 2: return "DOS";
            case 3: return "TRES";
            case 4: return "CUATRO";
            case 5: return "CINCO";
            case 6: return "SEIS";
            case 7: return "SIETE";
            case 8: return "OCHO";
            case 9: return "NUEVE";
        }

        return "";
    }//getUnidades()

    public getDecenas(num) {

        let decena = Math.floor(num / 10);
        let unidad = num - (decena * 10);

        switch (decena) {
            case 1:
                switch (unidad) {
                    case 0: return "DIEZ";
                    case 1: return "ONCE";
                    case 2: return "DOCE";
                    case 3: return "TRECE";
                    case 4: return "CATORCE";
                    case 5: return "QUINCE";
                    default: return "DIECI" + this.getUnidades(unidad);
                }
            case 2:
                switch (unidad) {
                    case 0: return "VEINTE";
                    default: return "VEINTI" + this.getUnidades(unidad);
                }
            case 3: return this.getDecenasY("TREINTA", unidad);
            case 4: return this.getDecenasY("CUARENTA", unidad);
            case 5: return this.getDecenasY("CINCUENTA", unidad);
            case 6: return this.getDecenasY("SESENTA", unidad);
            case 7: return this.getDecenasY("SETENTA", unidad);
            case 8: return this.getDecenasY("OCHENTA", unidad);
            case 9: return this.getDecenasY("NOVENTA", unidad);
            case 0: return this.getUnidades(unidad);
        }
    }//getUnidades()

    public getDecenasY(strSin, numUnidades) {
        if (numUnidades > 0)
            return strSin + " Y " + this.getUnidades(numUnidades)

        return strSin;
    }//getDecenasY()

    public getCentenas(num) {
        let centenas = Math.floor(num / 100);
        let decenas = num - (centenas * 100);

        switch (centenas) {
            case 1:
                if (decenas > 0)
                    return "CIENTO " + this.getDecenas(decenas);
                return "CIEN";
            case 2: return "DOSCIENTOS " + this.getDecenas(decenas);
            case 3: return "TRESCIENTOS " + this.getDecenas(decenas);
            case 4: return "CUATROCIENTOS " + this.getDecenas(decenas);
            case 5: return "QUINIENTOS " + this.getDecenas(decenas);
            case 6: return "SEISCIENTOS " + this.getDecenas(decenas);
            case 7: return "SETECIENTOS " + this.getDecenas(decenas);
            case 8: return "OCHOCIENTOS " + this.getDecenas(decenas);
            case 9: return "NOVECIENTOS " + this.getDecenas(decenas);
        }

        return this.getDecenas(decenas);
    }

    public Seccion(num, divisor, strSingular, strPlural) {
        let cientos = Math.floor(num / divisor);
        let resto = num - (cientos * divisor);

        let letras = "";

        if (cientos > 0)
            if (cientos > 1)
                letras = this.getCentenas(cientos) + " " + strPlural;
            else
                letras = strSingular;

        if (resto > 0)
            letras += "";

        return letras;
    }//Seccion()

    public getMiles(num) {
        let divisor = 1000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMiles = this.Seccion(num, divisor, "UN MIL", "MIL");
        let strCentenas = this.getCentenas(resto);

        if (strMiles == "")
            return strCentenas;

        return strMiles + " " + strCentenas;
    }//getMiles()

    public getMillones(num) {
        let divisor = 1000000;
        let cientos = Math.floor(num / divisor)
        let resto = num - (cientos * divisor)

        let strMillones = this.Seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
        let strMiles = this.getMiles(resto);

        if (strMillones == "")
            return strMiles;

        return strMillones + " " + strMiles;
    }//getMillones()

    public getNumeroALetras(num) {
        let data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: "",
            letrasMonedaPlural: '',//"PESOS", 'Dólares', 'Bolívares', 'etcs'
            letrasMonedaSingular: '', //"PESO", 'Dólar', 'Bolivar', 'etc'

            letrasMonedaCentavoPlural: "CENTAVOS",
            letrasMonedaCentavoSingular: "CENTAVO"
        };

        if (data.centavos > 0) {
            data.letrasCentavos = "CON " + (() => {
                if (data.centavos == 1)
                    return this.getMillones(data.centavos) + " " + data.letrasMonedaCentavoSingular;
                else
                    return this.getMillones(data.centavos) + " " + data.letrasMonedaCentavoPlural;
            })();
        };

        if (data.enteros == 0)
            return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
        if (data.enteros == 1)
            return this.getMillones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos;
        else
            return this.getMillones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos;
    }
}
