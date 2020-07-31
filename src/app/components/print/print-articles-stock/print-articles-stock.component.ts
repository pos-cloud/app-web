import { Component, OnInit, Input } from '@angular/core';
import { ArticleStockService } from 'app/components/article-stock/article-stock.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { ArticleStock } from 'app/components/article-stock/article-stock';

//terceros
import * as jsPDF from 'jspdf';
import { DomSanitizer } from '@angular/platform-browser';
import { DateFormatPipe } from 'app/main/pipes/date-format.pipe';
import { Config } from 'app/app.config';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { ConfigService } from 'app/components/config/config.service';

@Component({
  selector: 'app-print-articles-stock',
  templateUrl: './print-articles-stock.component.html',
  styleUrls: ['./print-articles-stock.component.css']
})
export class PrintArticlesStockComponent implements OnInit {

  @Input() branch;
  @Input() deposit;
  @Input() make;
  @Input() category;
  @Input() code;
  @Input() barcode;
  @Input() description;
  public loading: boolean;
  public alertMessage: string = '';
  public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

  public pageWidth: number;
  public pageHigh: number;
  public doc;
  public pdfURL;
  public roundNumber = new RoundNumberPipe();
  public dateFormat = new DateFormatPipe();
  public config: Config;

  constructor(
    public _articleStockService: ArticleStockService,
    public _configService: ConfigService,
    public alertConfig: NgbAlertConfig,
    private domSanitizer: DomSanitizer

  ) {
    this.pageWidth = 210 * 100 / 35.27751646284102;
    this.pageHigh = 297 * 100 / 35.27751646284102;
   }

  async ngOnInit() {

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    this.doc = new jsPDF('p', 'mm', [this.pageWidth, this.pageHigh]);
    this.getArticleStocksV2();
  }


  public getArticleStocksV2() : void {

    this.loading = true;

    let match = `{`;

    if(this.branch ) {
      match += `"branch.number": { "$regex": "${this.branch}", "$options": "i" }, `

    }
    if(this.deposit ) {
      match += `"deposit.name": { "$regex": "${this.deposit}", "$options": "i" }, `

    }
    if(this.make ) {
      match += `"article.make.description": { "$regex": "${this.make}", "$options": "i" }, `

    }
    if(this.category ) {
      match += `"article.category.description": { "$regex": "${this.category}", "$options": "i" }, `
    }
    if(this.code ) {
      match += `"article.code": { "$regex": "${this.code}", "$options": "i" }, `

    }
    if(this.barcode ) {
      match += `"article.barcode": { "$regex": "${this.barcode}", "$options": "i" }, `

    }
    if(this.description ) {
      match += `"article.description": { "$regex": "${this.description}", "$options": "i" }, `
    }


    match += `"article.operationType" : { "$ne" : "D" },
              "operationType" : { "$ne" : "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "realStock" : 1,
      "article.code" : 1,
      "article.description" : 1,
      "article.barcode": 1,
      "article.make.description" : 1,
      "article.category.description" : 1,
      "article.operationType" : 1,
      "branch.number" : { toString : "$branch.number"},
      "deposit.name" : 1,
      "operationType" : 1,
    }

    this._articleStockService.getArticleStocksV2(
        project, // PROJECT
        match, // MATCH
        { realStock: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        if (result && result.articleStocks) {
          this.toPrintInventario(result.articleStocks);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public toPrintInventario(articleStocks: ArticleStock[]): void {

    var row = 10;
    var margin = 5;
    this.doc.setFontType('bold');

    this.doc.setFontSize(12);
    if (this.config['companyName']) {
      this.doc.text(this.config['companyName'], 5, row);
    }

    this.doc.setFontType('normal');
    row += 5;
    if (this.config['companyIdentificationType'] && this.config['companyIdentificationValue']) {
      this.doc.text(this.config['companyIdentificationType']['name']  + ":", margin, row);
      this.doc.text(this.config['companyIdentificationValue'], 25, row);
    }

    this.doc.setFontType('bold');
    this.doc.text("INVENTARIO AL " + this.dateFormat.transform(new Date(), 'DD/MM/YYYY') ,80,row);

    row += 3;
    this.doc.line(0, row, 400, row);
    row += 5;

    // Encabezado de la tabla de Detalle de Productos
    this.doc.setFontType('bold');
    this.doc.setFontSize(this.fontSizes.normal);
    this.doc.text("Código", 5, row);
    this.doc.text("Descripción", 40, row);
    this.doc.text("Marca", 110, row);
    this.doc.text("Rubro", 165, row);
    this.doc.text("Stock", 195, row);
    this.doc.setFontType('normal');

    row += 3;
    this.doc.line(0, row, 400, row);
    row += 5;
    let count = 0;

    // Detalle de productos
    if(articleStocks && articleStocks.length > 0) {
      for(let articleStock of articleStocks) {

        if(articleStock.article.code) {
          this.doc.text(articleStock.article.code, 5, row);
        }
        if (articleStock.article.description) {
          this.doc.text(articleStock.article.description.slice(0, 30), 40, row);
        }
        if (articleStock.article.make && articleStock.article.make.description) {
          this.doc.text(articleStock.article.make.description.slice(0, 18), 110, row);
        }
        if (articleStock.article.category && articleStock.article.category.description) {
          this.doc.text(articleStock.article.category.description.slice(0, 10), 165, row);
        }
        if (articleStock.realStock) {
          this.doc.text(this.roundNumber.transform(articleStock.realStock).toString(), 195, row);
        }
        row += 5;
        count ++
        if (count === 54) {

          this.doc.addPage();

          var row = 15;
          var margin = 5;
          this.doc.setFontType('bold');

          this.doc.setFontSize(12);
          if (this.config['companyName']) {
            this.doc.text(this.config['companyName'], 5, row);
          }

          this.doc.setFontType('normal');
          row += 5;
          if (this.config['companyIdentificationType'] && this.config['companyIdentificationValue']) {
            this.doc.text(this.config['companyIdentificationType']['name']  + ":", margin, row);
            this.doc.text(this.config['companyIdentificationValue'], 25, row);
          }

          this.doc.setFontType('bold');
          this.doc.text("INVENTARIO AL " + this.dateFormat.transform(new Date(), 'DD/MM/YYYY') ,80,row);

          row += 3;
          this.doc.line(0, row, 400, row);
          row += 5;

          // Encabezado de la tabla de Detalle de Productos
          this.doc.setFontType('bold');
          this.doc.setFontSize(this.fontSizes.normal);
          this.doc.text("Código", 5, row);
          this.doc.text("Descripción", 40, row);
          this.doc.text("Marca", 110, row);
          this.doc.text("Rubro", 165, row);
          this.doc.text("Stock", 195, row);
          this.doc.setFontType('normal');

          row += 3;
          this.doc.line(0, row, 400, row);
          row += 5;
          count = 0;
        }
      }
    }
    this.finishImpression();
  }

  public finishImpression(): void {

    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));

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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

}
