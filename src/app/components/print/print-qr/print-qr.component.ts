import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';

//servicios

//modelos
import { HttpClient } from '@angular/common/http';
import { ApiResponse, Table } from '@types';
import { Config } from 'app/app.config';
import { Application } from 'app/components/application/application.model';
import {
  Printer,
  PrinterPrintIn,
  PrinterType,
} from 'app/components/printer/printer';
import { ApplicationService } from 'app/core/services/application.service';
import { ConfigService } from 'app/core/services/config.service';
import { PrintService } from 'app/core/services/print.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { DateFormatPipe } from 'app/shared/pipes/date-format.pipe';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';

let splitRegex = /\r\n|\r|\n/g;
jsPDF.API['textEx'] = function (
  text: any,
  x: number,
  y: number,
  hAlign?: string,
  vAlign?: string
) {
  let fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

  // As defined in jsPDF source code
  let lineHeightProportion = 1.15;

  let splittedText: string[];
  let lineCount: number = 1;
  if (
    vAlign === 'middle' ||
    vAlign === 'bottom' ||
    hAlign === 'center' ||
    hAlign === 'right'
  ) {
    splittedText = typeof text === 'string' ? text.split(splitRegex) : text;

    lineCount = splittedText.length || 1;
  }

  // Align the top
  y += fontSize * (2 - lineHeightProportion);

  if (vAlign === 'middle') y -= (lineCount / 2) * fontSize;
  else if (vAlign === 'bottom') y -= lineCount * fontSize;

  if (hAlign === 'center' || hAlign === 'right') {
    let alignSize = fontSize;
    if (hAlign === 'center') alignSize *= 0.5;

    if (lineCount > 1) {
      for (let iLine = 0; iLine < splittedText.length; iLine++) {
        this.text(
          splittedText[iLine],
          x - this.getStringUnitWidth(splittedText[iLine]) * alignSize,
          y
        );
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
  providers: [TranslateMePipe],
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
    private _toastService: ToastService,
    public translatePipe: TranslateMePipe
  ) {}

  async ngOnInit() {
    const orientation = 'p';
    const units = 'mm';
    let margin = 5;

    if (!this.printer) {
      this.printer = new Printer();
      this.printer.name = 'PDF';
      this.printer.printIn = PrinterPrintIn.Counter;
      this.printer.type = PrinterType.PDF;
      this.printer.pageWidth = 216;
      this.printer.pageHigh = 279;
    }
    this.doc = new jsPDF(orientation, units, [
      this.printer.pageWidth,
      this.printer.pageHigh,
    ]);

    this.config = await this.getConfig();
    let applications: Application[];

    await this._applicationService
      .getAll({ sort: { name: 1 } })
      .toPromise()
      .then((result: ApiResponse) => {
        if (result.status === 200 && result.result.length > 0) {
          applications = result.result;
        } else this._toastService.showToast(result);
      })
      .catch((error) => this._toastService.showToast(error));
    let imgLogo = await this.getBase64();

    if (applications && applications.length > 0) {
      for (let application of applications) {
        for (let table of this.tables) {
          let row = 10;
          this.doc.setTextColor(255);
          this.doc.setFontSize(this.fontSizes.large);
          this.doc.setDrawColor(0);
          this.doc.setFillColor(2, 117, 216);
          this.doc.ellipse(0, 5, 77, 50, 'F');

          this.centerText(
            margin,
            margin,
            77,
            0,
            row,
            this.config['companyFantasyName']
              ? this.config['companyFantasyName']
              : this.config['companyName']
          );
          row += 10;

          this.doc.setFontSize(this.fontSizes.normal);
          this.centerText(margin, margin, 77, 0, row, '!Escaneá el código');
          row += 4;
          this.centerText(margin, margin, 77, 0, row, 'y mira la carta¡');

          row += 7;

          this.centerText(
            margin,
            margin,
            77,
            0,
            row,
            'Mesa ' + table.description
          );

          row += 3;

          this.doc.setTextColor(0);
          this.doc.setFillColor(255, 255, 255);
          this.doc.setDrawColor(255, 255, 255);
          this.doc.roundedRect(23, row - 1, 32, 32, 2, 2, 'FD');
          let url = `${application.url}/%23/?table=${table.description}`;
          let imgdata =
            'data:image/png;base64,' +
            (await this.getBarcode64(`qr?value=${url}`));
          this.doc.addImage(imgdata, 'PNG', 24, row, 30, 30);
          row += 33;

          this.doc.setFontSize(this.fontSizes.xsmall);
          this.centerText(margin, margin, 77, 0, row, 'o ingresá a');
          row += 4;
          this.doc.setTextColor(2, 117, 216);
          this.doc.setFontSize(this.fontSizes.normal);
          this.centerText(
            margin,
            margin,
            77,
            0,
            row,
            `${application.url}/#/?table=${table.description}`
          );

          this.doc.setTextColor(0);
          this.doc.setFontSize(this.fontSizes.small);

          row += 7;
          this.centerText(
            margin,
            margin,
            77,
            0,
            row,
            '1 - Abrí tu cámara o lector.'
          );

          row += 5;
          this.centerText(
            margin,
            margin,
            77,
            0,
            row,
            '2 - Escaneá el código QR.'
          );

          row += 5;
          this.centerText(margin, margin, 77, 0, row, '3 - Realizá tu pedido.');

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
      this._toastService.showToast({
        type: 'info',
        message: 'No se encontraron aplicaciones cargadas.',
      });
    }
    this.finishImpression();
  }

  getBase64() {
    return new Promise((resolve, reject) => {
      this._http
        .get('/assets/img/logo.png', { responseType: 'blob' })
        .subscribe((res) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            let base64data = reader.result;
            resolve(base64data);
          };

          reader.readAsDataURL(res);
        });
    });
  }

  public centerText(lMargin, rMargin, pdfInMM, startPdf, height, text): void {
    if (text) {
      let pageCenter = pdfInMM / 2;

      let lines = this.doc.splitTextToSize(text, pdfInMM - lMargin - rMargin);
      let dim = this.doc.getTextDimensions(text);
      let lineHeight = dim.h;
      if (lines && lines.length > 0) {
        for (let i = 0; i < lines.length; i++) {
          let lineTop = (lineHeight / 2) * i;
          this.doc.text(text, pageCenter + startPdf, height, lineTop, 'center');
        }
      }
    }
  }

  public finishImpression(): void {
    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(
      this.doc.output('bloburl')
    );
  }

  public getConfig(): Promise<Config> {
    return new Promise<Config>((resolve, reject) => {
      this._configService.getConfigApi().subscribe(
        (result) => {
          if (!result.configs) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
            reject(null);
          } else {
            this.hideMessage();
            resolve(result.configs[0]);
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          reject(error);
        }
      );
    });
  }

  async getCompanyPicture(
    lmargin,
    rmargin,
    width,
    height,
    finish: boolean = false
  ) {
    return new Promise((resolve, reject) => {
      this._configService
        .getCompanyPicture(this.config['companyPicture'])
        .subscribe((result) => {
          this.hideMessage();
          let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
          this.doc.addImage(imageURL, 'jpeg', lmargin, rmargin, width, height);
          if (finish) {
            this.finishImpression();
          }
          resolve(true);
        });
    });
  }

  async getBarcode64(barcode) {
    return new Promise((resolve, reject) => {
      this._printService.getBarcode(barcode).subscribe((result) => {
        if (!result.bc64) {
          resolve(null);
        } else {
          resolve(result.bc64);
        }
      });
    });
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
