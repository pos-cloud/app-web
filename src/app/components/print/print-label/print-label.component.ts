import { Component, OnInit, Input } from '@angular/core';

//Paquetes de terceros
import * as jsPDF from 'jspdf';
import { ArticleStock } from 'app/models/article-stock';
import { DomSanitizer } from '@angular/platform-browser';
import { Printer } from 'app/models/printer';
import { Article } from 'app/models/article';
import { ConfigService } from 'app/services/config.service';
import { Config } from 'app/app.config';
import { PrintService } from 'app/services/print.service';
import { NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-print-label',
  templateUrl: './print-label.component.html',
  styleUrls: ['./print-label.component.css']
})
export class PrintLabelComponent implements OnInit {

  @Input() articleStock : ArticleStock;
  @Input() printer: Printer;
  @Input() article: Article;
  public config: Config;
  public barcode64: string;
  public loading: boolean;
  public alertMessage: string = '';
  public doc;
  public pdfURL;
  
  constructor(
    private domSanitizer: DomSanitizer,
    public _configService: ConfigService,
    public _printService : PrintService,
    public alertConfig: NgbAlertConfig,
  ) {}

  async ngOnInit() {

    let units = 'mm';
    let pageWidth = this.printer.pageWidth * 100 / 35.27751646284102;
    let pageHigh = this.printer.pageHigh * 100 / 35.27751646284102;


    this.doc = new jsPDF('l', units, [pageWidth, pageHigh]);

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    let code;
    if (this.articleStock && this.articleStock.article[this.config.article.printLabel.value]) {
      code = this.articleStock.article[this.config.article.printLabel.value];
      this.getBarcode64('code128?value=' + code);
    } else if (this.article && this.article[this.config.article.printLabel.value]) {
      code = this.article[this.config.article.printLabel.value];
      this.getBarcode64('code128?value=' + code);
    } else {
      this.showMessage('Debe completar el código del producto a imprimir.', 'info', true);
    }
  }

  public getBarcode64(barcode): void {

    this._printService.getBarcode(barcode).subscribe(
      result => {
        this.barcode64 = result.bc64;
        this.toPrintBarcode();
      },
      error => {

      }
    );
  }


  public toPrintBarcode(): void {

    if (this.articleStock) {
      this.doc.text(this.articleStock.article.description.slice(0,19), 0 , 5);
      this.doc.text(this.articleStock.article.description.slice(19,38), 0 , 10);
      this.doc.text(this.articleStock.article.description.slice(38,100), 0 , 15);      
      let imgdata = 'data:image/png;base64,' + this.barcode64;
      this.doc.addImage(imgdata, 'PNG', 1, 15, (this.printer.pageHigh) -2, (this.printer.pageWidth) -17 );
      for (let index = 0; index < this.articleStock.realStock -1 ; index++) {
        this.doc.addPage();
        this.doc.text(this.articleStock.article.description.slice(0,19), 0 , 5);
        this.doc.text(this.articleStock.article.description.slice(19,38), 0 , 10);
        this.doc.text(this.articleStock.article.description.slice(38,100), 0 , 15);        
        let imgdata = 'data:image/png;base64,' + this.barcode64;
        this.doc.addImage(imgdata, 'PNG', 1, 15, (this.printer.pageHigh) -2, (this.printer.pageWidth) -17 );
      }
      this.finishImpression();
    }  else if (this.article) {
      this.doc.text(this.article.description.slice(0,19), 0 , 5);
      this.doc.text(this.article.description.slice(19,38), 0 , 10);
      this.doc.text(this.article.description.slice(38,100), 0 , 15);
      let imgdata = 'data:image/png;base64,' + this.barcode64;
      this.doc.addImage(imgdata, 'PNG', 1, 15, (this.printer.pageHigh ) -2, (this.printer.pageWidth) -17 );
      this.finishImpression();
    }
  }

  public finishImpression(): void {
    
    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));

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
