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
import { Printer, PositionPrint, PrinterPrintIn, PrinterType } from 'app/components/printer/printer';
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
import { Table } from 'app/components/table/table';
import { DateFormatPipe } from 'app/main/pipes/date-format.pipe';
import { HttpClient } from '@angular/common/http';
import { Application } from 'app/components/application/application.model';
import { ApplicationService } from 'app/components/application/application.service';
import Resulteable from 'app/util/Resulteable';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';

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
    selector: 'app-print-qr',
    templateUrl: './print-qr.component.html',
    styleUrls: ['./print-qr.component.css'],
    providers: [TranslateMePipe]
})
export class PrintQRComponent implements OnInit {

    @Input() tables: Table[];
    public config: Config;
    public alertMessage: string;
    public doc;
    public pdfURL;
    public imageURL: any;
    public barcode64: string;
    public roundNumber = new RoundNumberPipe();
    public dateFormat = new DateFormatPipe();
    @Input() printer: Printer;
    public fontSizes = JSON.parse(`{"xsmall" : 5,
                                    "small" : 7,
                                    "normal" : 10,
                                    "large" : 15,
                                    "extraLarge" : 20}`);

    constructor(
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _configService: ConfigService,
        private domSanitizer: DomSanitizer,
        public _printService: PrintService,
        private _http: HttpClient,
        public _applicationService: ApplicationService,
        private _toastr: ToastrService,
        public translatePipe: TranslateMePipe
    ) { }

    async ngOnInit() {

        let orientation = "p";
        let units = 'mm';
        var margin = 5;

        if (!this.printer) {
            this.printer = new Printer();
            this.printer.name = "PDF";
            this.printer.printIn = PrinterPrintIn.Counter;
            this.printer.type = PrinterType.PDF;
            this.printer.pageWidth = 216;
            this.printer.pageHigh = 279;
        }
        this.doc = new jsPDF(orientation, units, [this.printer.pageWidth, this.printer.pageHigh]);

        this.config = await this.getConfig();
        let applications: Application[];

        await this._applicationService.getAll({ sort: { name: 1 } }).toPromise()
            .then((result: Resulteable) => {
                if (result.status === 200 && result.result.length > 0) {
                    applications = result.result;
                } else this.showToast(result);
            })
            .catch(error => this.showToast(error));
        let imgLogo = await this.getBase64();

        if (applications && applications.length > 0) {
            for (let application of applications) {
                for (let table of this.tables) {
                    var row = 10;
                    this.doc.setTextColor(255);
                    this.doc.setFontSize(this.fontSizes.large);
                    this.doc.setDrawColor(0);
                    this.doc.setFillColor(2, 117, 216);
                    this.doc.ellipse(0, 5, 77, 50, "F");

                    this.centerText(margin, margin, 77, 0, row, (this.config['companyFantasyName']) ? this.config['companyFantasyName'] : this.config['companyName']);
                    row += 10;

                    this.doc.setFontSize(this.fontSizes.normal);
                    this.centerText(margin, margin, 77, 0, row, "!Escaneá el código");
                    row += 4;
                    this.centerText(margin, margin, 77, 0, row, "y mira la carta¡");

                    row += 7;

                    this.centerText(margin, margin, 77, 0, row, "Mesa " + table.description);
                    
                    row += 3;

                    this.doc.setTextColor(0);
                    this.doc.setFillColor(255, 255, 255);
                    this.doc.setDrawColor(255, 255, 255);
                    this.doc.roundedRect(23, row-1, 32, 32, 2, 2, "FD");
                    let url = `${application.url}/%23/?table=${table.description}`;
                    let imgdata = 'data:image/png;base64,' + await this.getBarcode64(`qr?value=${url}`);
                    this.doc.addImage(imgdata, 'PNG', 24, row, 30, 30);
                    row += 33;

                    this.doc.setFontSize(this.fontSizes.xsmall);
                    this.centerText(margin, margin, 77, 0, row, "o ingresá a");
                    row += 4;
                    this.doc.setTextColor(2, 117, 216);
                    this.doc.setFontSize(this.fontSizes.normal);
                    this.centerText(margin, margin, 77, 0, row, `${application.url}/#/?table=${table.description}`);

                    this.doc.setTextColor(0);
                    this.doc.setFontSize(this.fontSizes.small);

                    row += 7;
                    this.centerText(margin, margin, 77, 0, row, "1 - Abrí tu cámara o lector.");

                    row += 5;
                    this.centerText(margin, margin, 77, 0, row, "2 - Escaneá el código QR.");

                    row += 5;
                    this.centerText(margin, margin, 77, 0, row, "3 - Realizá tu pedido.");
                    
                    this.doc.setFontSize(this.fontSizes.xsmall);
                    row += 3;
                    this.doc.setTextColor(2, 117, 216);
                    this.doc.text('Desarrollado por', 18, row + 4);
                    this.doc.text('www.poscloud.com.ar', 32, row + 4);
                    this.doc.setTextColor(0);
                    this.doc.addImage(imgLogo, 'PNG', 51, row, 8, 5);
                    this.doc.addPage();
                }
            }
        } else {
            this.showToast(null, 'info', 'No se encontraron aplicaciones cargadas.');
        }
        this.finishImpression();
    }

    getBase64() {
        return new Promise((resolve, reject) => {
            this._http.get('/assets/img/logo.png', { responseType: 'blob' })
                .subscribe(res => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        var base64data = reader.result;
                        resolve(base64data);
                    }

                    reader.readAsDataURL(res);
                });
        });
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

    public finishImpression(): void {
        this.doc.autoPrint();
        this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));
    }

    public getConfig(): Promise<Config> {
        return new Promise<Config>((resolve, reject) => {
            this._configService.getConfigApi().subscribe(
                result => {
                    if (!result.configs) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        reject(null);
                    } else {
                        this.hideMessage();
                        resolve(result.configs[0]);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    reject(error);
                }
            );
        });
    }


    async getCompanyPicture(lmargin, rmargin, width, height, finish: boolean = false) {
        return new Promise((resolve, reject) => {
            this._configService.getCompanyPicture(this.config['companyPicture']).subscribe(
                result => {
                    this.hideMessage();
                    let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
                    this.doc.addImage(imageURL, 'jpeg', lmargin, rmargin, width, height);
                    if (finish) {
                        this.finishImpression();
                    }
                    resolve(true);
                }
            );
        });
    }

    async getBarcode64(barcode) {
        return new Promise((resolve, reject) => {
            this._printService.getBarcode(barcode).subscribe(
                result => {
                    if (!result.bc64) {
                        resolve(null)
                    } else {
                        resolve(result.bc64);
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

    public showToast(result, type?: string, title?: string, message?: string): void {
        if (result) {
            if (result.status === 200) {
                type = 'success';
                title = result.message;
            } else if (result.status >= 400) {
                type = 'danger';
                title = (result.error && result.error.message) ? result.error.message : result.message;
            } else {
                type = 'info';
                title = result.message;
            }
        }
        switch (type) {
            case 'success':
                this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            case 'danger':
                this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
            default:
                this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
                break;
        }
    }
}
