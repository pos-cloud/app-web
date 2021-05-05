import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as jsPDF from 'jspdf';

//servicios
import { MovementOfCancellationService } from 'app/components/movement-of-cancellation/movement-of-cancellation.service';
import { MovementOfArticleService } from 'app/components/movement-of-article/movement-of-article.service';
import { MovementOfCashService } from 'app/components/movement-of-cash/movement-of-cash.service';
import { TransactionService } from 'app/components/transaction/transaction.service';

//modelos
import { Printer, PositionPrint } from 'app/components/printer/printer';
import { Config } from 'app/app.config';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { Company } from 'app/components/company/company';
import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';
import { Transaction } from 'app/components/transaction/transaction';
import { PrintService } from 'app/components/print/print.service';
import { ArticleService } from 'app/components/article/article.service';
import { Article } from 'app/components/article/article';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { PriceListService } from 'app/components/price-list/price-list.service';
import { ConfigService } from 'app/components/config/config.service';
import { PriceList } from 'app/components/price-list/price-list';


@Component({
    selector: 'app-print-transaction-type',
    templateUrl: './print-transaction-type.component.html',
    styleUrls: ['./print-transaction-type.component.css']
})
export class PrintTransactionTypeComponent implements OnInit {

    @Input() transactionId: string;
    @Input() articleId: string;
    @Input() priceListId: string;
    @Input() movementOfArticles : MovementOfArticle[];
    @Input() quantity: number;
    @Input() origin: string;
    @Input() printer: Printer;
    @Input() source: string;
    public imageURL: any;
    public transaction: Transaction;
    public movementOfCash: MovementOfCash[];
    public movementOfArticle: MovementOfArticle[];
    public movementOfCancellation: MovementOfCancellation[];
    public article: Article;
    public company: Company;
    public config: Config;
    public doc;
    public pdfURL;
    public alertMessage: string;
    public roundNumber = new RoundNumberPipe();

    constructor(
        public _transactionService: TransactionService,
        public _movementOfCashService: MovementOfCashService,
        public _movementOfArticleService: MovementOfArticleService,
        public _movementOfCancellationService: MovementOfCancellationService,
        public _priceListService: PriceListService,
        public _articeService: ArticleService,
        public _printService: PrintService,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _configService: ConfigService,
        private domSanitizer: DomSanitizer
    ) { }

    async ngOnInit() {

        await this.getConfigApi().then(
            config => {
                if (config) {
                    this.config = config
                }
            }
        );

        if (this.transactionId) {
            this.getTransaction();
        }

        if (this.articleId) {
            this.getArticle();
        }

        if(this.movementOfArticle && this.movementOfArticles.length > 0){
            this.buildPrint();
        }

        if (this.origin === 'view') {
            this.buildPrint();
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.printer.currentValue) {
            this.buildPrint();
        }
    }

    public getConfigApi(): Promise<Config> {

        return new Promise<Config>((resolve, reject) => {
            this._configService.getConfigApi().subscribe(
                result => {
                    if (!result.configs) {
                        resolve(null);
                    } else {
                        resolve(result.configs[0]);
                    }
                },
                error => {
                    resolve(null);
                }
            );
        });
    }

    async getArticle() {
        this._articeService.getArticle(this.articleId).subscribe(
            async result => {
                if (result && result.article) {
                    this.article = result.article
                    if (this.priceListId) {
                        this.getPriceList();
                    } else {
                        this.buildPrint();
                    }
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
            }
        )
    }

    async getPriceList() {
        this._priceListService.getPriceList(this.priceListId).subscribe(
            result => {
                if (result && result.priceList) {
                    let priceList: PriceList = result.priceList;
                    let increasePrice;
                    if (priceList) {
                        if (priceList.allowSpecialRules) {
                            priceList.rules.forEach(rule => {
                                if (rule) {
                                    if (rule.category && this.article.category && rule.make && this.article.make && rule.category._id === this.article.category._id && rule.make._id === this.article.make._id) {
                                        increasePrice = rule.percentage + priceList.percentage
                                    }
                                    if (rule.make && this.article.make && rule.category == null && rule.make._id === this.article.make._id) {
                                        increasePrice = rule.percentage + priceList.percentage
                                    }
                                    if (rule.category && this.article.category && rule.make == null && rule.category._id === this.article.category._id) {
                                        increasePrice = rule.percentage + priceList.percentage
                                    }
                                }
                            });
                            if (increasePrice === 0) {
                                increasePrice = priceList.percentage;
                            }
                        } else {
                            increasePrice = priceList.percentage
                        }

                        if (priceList.exceptions && priceList.exceptions.length > 0) {
                            priceList.exceptions.forEach(exception => {
                                if (exception) {
                                    if (this.article && exception.article && exception.article._id === this.article._id) {
                                        increasePrice = exception.percentage
                                    }
                                }
                            })
                        }
                    }

                    if (increasePrice != 0) {
                        this.article.salePrice = this.roundNumber.transform(this.article.salePrice + (this.article.salePrice * increasePrice / 100));
                        this.buildPrint()
                    } else {
                        this.buildPrint()
                    }
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
            }
        )
    }

    async getTransaction() {

        this._transactionService.getTransaction(this.transactionId).subscribe(
            async result => {
                if (!result.transaction) {
                    this.showMessage(result.message, 'danger', false);
                } else {
                    this.transaction = result.transaction;
                    if (this.transaction.type &&
                        this.transaction.type.defectPrinter &&
                        this.transaction.type.defectPrinter.fields &&
                        this.transaction.type.readLayout &&
                        this.transaction.type.defectPrinter.fields.length > 0) {

                        await this.getMovementOfCashes();
                        await this.getMovementofArticle();
                        await this.getMovementofCancellation();

                        this.printer = this.transaction.type.defectPrinter
                        this.company = this.transaction.company;

                        this.buildPrint();

                    } else {
                        this.showMessage("Debe seleccionar Impresora defecto y Lee diseño? en el Tipo de Transaccion:" + this.transaction.type.name, 'danger', false);
                    }
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
            }
        );
    }

    async getMovementofCancellation() {

        return new Promise((resolve, reject) => {

            let match;

            match = { "transactionDestination": { $oid: this.transactionId }, "operationType": { "$ne": "D" } };


            // CAMPOS A TRAER
            let project = {
                "transactionDestination": 1,
                "operationType": 1,
                'transactionOrigin.origin': 1,
                'transactionOrigin.letter': 1,
                'transactionOrigin.number': 1,
                'transactionOrigin.date': 1,
                'transactionOrigin.startDate': 1,
                'transactionOrigin.endDate': 1,
                'transactionOrigin.expirationDate': 1,
                'transactionOrigin.VATPeriod': 1,
                'transactionOrigin.observation': 1,
                'transactionOrigin.basePrice': 1,
                'transactionOrigin.exempt': 1,
                'transactionOrigin.discountAmount': 1,
                'transactionOrigin.discountPercent': 1,
                'transactionOrigin.taxes': 1,
                'transactionOrigin.totalPrice': 1,
                'transactionOrigin.roundingAmount': 1,
                'transactionOrigin.diners': 1,
                'transactionOrigin.state': 1,
                'transactionOrigin.madein': 1,
                'transactionOrigin.balance': 1,
                'transactionOrigin.CAE': 1,
                'transactionOrigin.CAEExpirationDate': 1,
                'transactionOrigin.stringSAT': 1,
                'transactionOrigin.CFDStamp': 1,
                'transactionOrigin.SATStamp': 1,
                'transactionOrigin.UUID': 1,
                'transactionOrigin.currency': 1,
                'transactionOrigin.quotation': 1,
                'transactionOrigin.relationType': 1,
                'transactionOrigin.useOfCFDI': 1,
                'transactionOrigin.type': 1,
                'transactionOrigin.cashBox': 1,
                'transactionOrigin.table': 1,
                'transactionOrigin.employeeOpening': 1,
                'transactionOrigin.employeeClosing': 1,
                'transactionOrigin.branchOrigin': 1,
                'transactionOrigin.branchDestination': 1,
                'transactionOrigin.depositOrigin': 1,
                'transactionOrigin.depositDestination': 1,
                'transactionOrigin.company': 1,
                'transactionOrigin.transport': 1,
                'transactionOrigin.turnOpening': 1,
                'transactionOrigin.turnClosing': 1,
                'transactionOrigin.priceList': 1,
                'transactionOrigin.creationUser': 1,
                'transactionOrigin.creationDate': 1,
                'transactionOrigin.operationType': 1,
                'transactionOrigin.updateUser': 1,
                'transactionOrigin.updateDate': 1,
                'transactionOrigin._id': 1,
            };

            this._movementOfCancellationService.getMovementsOfCancellations(
                project, // PROJECT
                match, // MATCH
                { order: 1 }, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(async result => {
                if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
                    this.movementOfCancellation = new Array();
                    this.movementOfCancellation = result.movementsOfCancellations
                    resolve(true)
                } else {
                    resolve(false)
                }
            },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(false)
                });
        });


    }

    async getMovementOfCashes(): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {
            let query = 'where="transaction":"' + this.transaction._id + '"';

            this._movementOfCashService.getMovementsOfCashes(query).subscribe(
                async result => {
                    if (!result.movementsOfCashes) {
                        this.movementOfCash = new Array();
                        resolve(true)
                    } else {
                        this.movementOfCash = result.movementsOfCashes;
                        resolve(true)
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(false)
                }
            );
        });

    }

    async getMovementofArticle(): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {

            let query = 'where="transaction":"' + this.transaction._id + '"';

            this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
                async result => {
                    if (!result.movementsOfArticles) {
                        this.movementOfArticle = new Array();
                        resolve(true)
                    } else {
                        this.movementOfArticle = result.movementsOfArticles;
                        resolve(true)
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(false)
                }
            );
        });
    }

    async buildPrint() {


        let pageWidth = this.printer.pageWidth * 100 / 35.27751646284102;
        let pageHigh = this.printer.pageHigh * 100 / 35.27751646284102;

        this.doc = new jsPDF({
            orientation: this.printer.orientation,
            unit: 'mm',
            format: [pageWidth, pageHigh]
        })

        if (this.quantity) {
            await this.buildLayout(PositionPrint.Header);
            for (let index = 0; index < this.quantity - 1; index++) {
                this.doc.addPage();
                await this.buildLayout(PositionPrint.Header);
            }
        } else {
            await this.buildLayout(PositionPrint.Header);
            await this.buildBody();
            await this.buildLayout(PositionPrint.Footer);
        }

        this.finishImpression();

    }

    async buildLayout(position: PositionPrint): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            for (const field of this.printer.fields) {
                if (position && position === field.position) {
                    switch (field.type) {
                        case 'label':
                            if (field.font !== 'default') {
                                this.doc.setFont(field.font)
                            }
                            this.doc.setFontType(field.fontType)
                            this.doc.setFontSize(field.fontSize)
                            this.doc.text(field.positionStartX, field.positionStartY, field.value)
                            break;
                        case 'line':
                            this.doc.setLineWidth(field.fontSize)
                            this.doc.line(field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY)
                            break;
                        case 'image':
                            try {
                                await this.getCompanyPicture(eval("this." + field.value))
                                this.doc.addImage(this.imageURL, 'jpeg', field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY);
                            } catch (e) {

                            }
                            break;
                        case 'barcode':
                            try {
                                await this.getBarcode64('code128?value=' + eval("this." + field.value))
                                this.doc.addImage(this.imageURL, 'png', field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY);
                            } catch (error) {

                            }
                            break;
                        case 'data':
                            if (field.font !== 'default') {
                                this.doc.setFont(field.font)
                            }
                            this.doc.setFontType(field.fontType)
                            this.doc.setFontSize(field.fontSize)

                            try {
                                if (field.positionEndX || field.positionEndY) {
                                    this.doc.text(field.positionStartX, field.positionStartY, eval("this." + field.value).toString().slice(field.positionEndX, field.positionEndY))
                                } else {
                                    this.doc.text(field.positionStartX, field.positionStartY, eval("this." + field.value).toString())
                                }
                            } catch (e) {
                                this.doc.text(field.positionStartX, field.positionStartY, " ")
                            }
                            break;
                        case 'dataSum':
                            var sum = 0;
                            if (field.font !== 'default') {
                                this.doc.setFont(field.font)
                            }
                            this.doc.setFontType(field.fontType)
                            this.doc.setFontSize(field.fontSize)

                            if (field.value.split('.')[0] === "movementOfArticle" && this.movementOfArticle) {
                                this.movementOfArticle.forEach(async movementOfArticle => {
                                    sum = sum + eval(field.value);
                                });
                                try {
                                    this.doc.text(field.positionStartX, field.positionStartY, this.roundNumber.transform(sum).toString())
                                } catch (e) {
                                    this.doc.text(field.positionStartX, field.positionStartY, " ")
                                }
                            } else if (field.value.split('.')[0] === "movementOfCash" && this.movementOfCash) {
                                this.movementOfCash.forEach(async movementOfCash => {
                                    let sum = 0;
                                    if (typeof eval("this." + field.value) === "number") {
                                        sum = sum + eval("this." + field.value);
                                    }
                                    try {
                                        this.doc.text(field.positionStartX, field.positionStartY, sum.toString())
                                    } catch (e) {
                                        this.doc.text(field.positionStartX, field.positionStartY, " ")
                                    }
                                });
                            } else if (field.value.split('.')[0] === "movementOfCancellation" && this.movementOfCancellation) {
                                this.movementOfCancellation.forEach(async movementOfCancellation => {
                                    let sum = 0;
                                    if (typeof eval("this." + field.value) === "number") {
                                        sum = sum + eval("this." + field.value);
                                    }
                                    try {
                                        this.doc.text(field.positionStartX, field.positionStartY, this.roundNumber.transform(sum).toString())
                                    } catch (e) {
                                        this.doc.text(field.positionStartX, field.positionStartY, "")
                                    }
                                });
                            } else {
                                try {
                                    this.doc.text(field.positionStartX, field.positionStartY, eval(field.value))
                                } catch (error) {
                                    this.doc.text(field.positionStartX, field.positionStartY, '')
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
            resolve(true)
        });

    }

    async buildBody(): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            var row = 0;
            if (this.movementOfArticle && this.movementOfArticle.length > 0) {
                for (const movementOfArticle of this.movementOfArticle) {

                    for (const field of this.printer.fields) {
                        if (field.position === PositionPrint.Body && field.value.split('.')[0] === "movementOfArticle") {

                            if (field.font !== 'default') {
                                this.doc.setFont(field.font)
                            }
                            this.doc.setFontType(field.fontType)
                            this.doc.setFontSize(field.fontSize)
                            if (row < field.positionStartY) {
                                row = field.positionStartY
                            }

                            try {
                                this.doc.text(field.positionStartX, row, (eval(field.value)).toString().slice(field.positionEndX, field.positionEndY))
                            } catch (e) {
                                this.doc.text(field.positionStartX, row, " ")
                            }
                        }
                    }
                    row = row + this.printer.row;
                    if (row > this.printer.addPag) {
                        row = 0;
                        this.doc.addPage()
                        await this.buildLayout(PositionPrint.Header);
                    }
                }
            }
            if (this.movementOfCash && this.movementOfCash.length > 0) {
                for (const movementOfCash of this.movementOfCash) {

                    for (const field of this.printer.fields) {
                        if (field.position === PositionPrint.Body && field.value.split('.')[0] === "movementOfCash") {

                            if (field.font !== 'default') {
                                this.doc.setFont(field.font)
                            }
                            this.doc.setFontType(field.fontType)
                            this.doc.setFontSize(field.fontSize)
                            if (row < field.positionStartY) {
                                row = field.positionStartY
                            }

                            try {
                                this.doc.text(field.positionStartX, row, (eval(field.value)).toString().slice(field.positionEndX, field.positionEndY))
                            } catch (e) {
                                this.doc.text(field.positionStartX, row, " ")
                            }
                        }
                    }
                    row = row + this.printer.row;
                    if (row > this.printer.addPag) {
                        row = 0;
                        this.doc.addPage()
                        await this.buildLayout(PositionPrint.Header);
                    }
                }
            }
            resolve(true)
        });
    }

    public finishImpression(): void {

        this.doc.autoPrint();
        this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));

        if (this.transaction && this.transaction.type && this.transaction.type.electronics) {
            this._printService.saveFile(this.doc.output('blob'), 'invoice', this.transactionId).then(
                result => {
                },
                error => {
                }
            )
        } else if (this.source === "mail") {

            this._printService.saveFile(this.doc.output('blob'), 'others', this.transactionId).then(
                result => {
                },
                error => {
                }
            )
        }
    }

    async getCompanyPicture(img) {

        return new Promise((resolve, reject) => {
            this._configService.getCompanyPicture(img).subscribe(
                result => {
                    if (!result.imageBase64) {
                        resolve(false)
                    } else {
                        let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
                        this.imageURL = imageURL;
                        resolve(true)
                    }
                }
            );
        });

    }

    async getBarcode64(barcode) {

        return new Promise((resolve, reject) => {
            this._printService.getBarcode(barcode).subscribe(
                result => {
                    if (!result.bc64) {
                        resolve(false)
                    } else {
                        let barcode64 = result.bc64;
                        this.imageURL = 'data:image/png;base64,' + barcode64;
                        resolve(true)
                    }
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

}
