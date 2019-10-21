import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';


import * as jsPDF from 'jspdf';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { RoundNumberPipe } from '../../../pipes/round-number.pipe';

//model
import { Make } from "../../../models/make";
import { Category } from "../../../models/category";
import { IdentificationType } from "../../../models/identification-type"

//service
import { ArticleService } from "../../../services/article.service";
import { MakeService } from '../../../services/make.service';
import { CategoryService } from '../../../services/category.service';
import { Article } from 'app/models/article';
import { ConfigService } from 'app/services/config.service';
import { Config } from 'app/app.config';
import { VariantService } from 'app/services/variant.service';
import { VariantValue } from 'app/models/variant-value';
import { Variant} from 'app/models/variant';
import { TransactionService } from 'app/services/transaction.service';
import { Transaction } from 'app/models/transaction';
import { Taxes } from 'app/models/taxes';
import { TransactionMovement, Movements } from 'app/models/transaction-type';
import { TaxClassification } from 'app/models/tax';
import { IdentificationTypeService } from 'app/services/identification-type.service';
import { VATConditionService } from 'app/services/vat-condition.service';
import { VATCondition } from 'app/models/vat-condition';


@Component({
  selector: 'app-print-vat-book',
  templateUrl: './print-vat-book.component.html',
  styleUrls: ['./print-vat-book.component.css']
})
export class PrintVatBookComponent implements OnInit {

  @Input() params;

  public dataIVA: any = [];
  public transactions: Transaction[];
  public printPriceListForm: FormGroup;
  public alertMessage: string = '';
  public vatConditions : VATCondition[];
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public dateFormat = new DateFormatPipe();
  public doc;
  public pdfURL;
  public config;
  public roundNumber = new RoundNumberPipe();
  public pageWidth;
  public pageHigh;
  public companyName: string = Config.companyName;

  public withImage = false;

  public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

  constructor(
    public _transactionService : TransactionService,
    public _vatConditionService : VATConditionService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,   
    public _configService: ConfigService,
    private domSanitizer: DomSanitizer
  ) {
    this.pageWidth = 210 * 100 / 35.27751646284102;
    this.pageHigh = 297 * 100 / 35.27751646284102;
    this.getVATConditions();
   }

  async ngOnInit() {
    
    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    this.doc = new jsPDF('l', 'mm', [this.pageWidth, this.pageHigh]);
    this.getVATBook();
  }

  public getVATConditions(): void {

    this.loading = true;

    this._vatConditionService.getVATConditions().subscribe(
      result => {
        if (!result.vatConditions) {
        } else {
          this.vatConditions = result.vatConditions;
          for (let index = 0; index < this.vatConditions.length; index++) {
            this.dataIVA[index] = {};
            this.dataIVA[index]['_id'] = this.vatConditions[index]._id 
            this.dataIVA[index]['description'] = this.vatConditions[index].description 
            this.dataIVA[index]['total'] = 0;
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

  public getVATBook() {

    this._transactionService.getVATBook(this.params).subscribe(
      result => {
        if (!result) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          } else {
            this.transactions = result;
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

    // ENCABEZADO
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

    // TITULOS TABLA
    this.doc.setFontSize(9);
    this.doc.text("FECHA", 5, row);
    this.doc.text("RAZÓN SOCIAL", 25, row);
    this.doc.text("IDENTIFICADOR", 65, row);
    this.doc.text("TIPO COMP.", 95, row);
    this.doc.text("NRO COMP.", 120, row);
    this.doc.text("GRAVADO", 150, row);
    this.doc.text("EXENTO", 175, row);
    this.doc.text("MONTO IVA", 195, row);
    this.doc.text("MONTO PERCEP.", 225, row);
    this.doc.text("MONTO TOTAL", 260, row);
    this.doc.setFontSize(8);
    this.doc.setFontType('normal');

    row += 3;
    this.doc.line(0, row, 400, row);
    row += 5;

    // CUERPO TABLA
    let totalTaxBase = 0;
    let totalExempt = 0;
    let totalTaxAmountIVA = 0;
    let totalTaxAmountPercep = 0;
    let totalAmount = 0;
    let totalTaxes: Taxes[] = new Array();

    for (let transaction of this.transactions) {
      
      //DATOS PRINCIPALES
      this.doc.text(this.dateFormat.transform(transaction.endDate, 'DD/MM/YYYY'), 5, row);
      if(transaction.company) {
        this.doc.text(transaction.company.name.toUpperCase().slice(0, 22), 25, row);
        this.doc.text(transaction.company.identificationValue.replace(/-/g, ""), 65, row);
      } else {
        this.doc.text('CONSUMIDOR FINAL', 25, row);
        this.doc.text('00000000000', 65, row);
      }
      if(transaction.type.labelPrint && transaction.type.labelPrint !== "") {
        this.doc.text(transaction.type.labelPrint, 95, row);
      } else {
        this.doc.text(transaction.type.name, 95, row);
      }
      this.doc.text(
        this.padString(transaction.origin, 4) + "-" +
        transaction.letter + "-" +
        this.padString(transaction.number, 8)
        , 120, row);

      if(transaction.type.transactionMovement === TransactionMovement.Sale && transaction.type.movement === Movements.Outflows ||
        transaction.type.transactionMovement === TransactionMovement.Purchase && transaction.type.movement === Movements.Inflows) {
        transaction.exempt *= -1;
        transaction.totalPrice *= -1;
      }
      totalExempt += transaction.exempt;
      totalAmount += transaction.totalPrice;

      
      for (let index = 0; index < this.dataIVA.length; index++) {
        if(transaction.company && transaction.company.vatCondition && this.dataIVA[index]['_id'] === transaction.company.vatCondition) {
          this.dataIVA[index]['total'] = this.dataIVA[index]['total'] + transaction.totalPrice;
        }
      }



      let partialTaxBase: number = 0;
      let partialTaxAmountIVA: number = 0;
      let partialTaxAmountPercep: number = 0;
      
      if(transaction.taxes && transaction.taxes.length > 0 && transaction.taxes[0].tax) {
        for(let transactionTax of transaction.taxes) {

          // DATOS NUMÉRICOS
          if(transaction.type.transactionMovement === TransactionMovement.Sale && transaction.type.movement === Movements.Outflows ||
            transaction.type.transactionMovement === TransactionMovement.Purchase && transaction.type.movement === Movements.Inflows) {
            transactionTax.taxAmount *= -1;
            transactionTax.taxBase *= -1;
          }

          let exists: boolean = false;
          for (let transactionTaxAux of totalTaxes) {
            if (transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()) {
              transactionTaxAux.taxAmount += transactionTax.taxAmount;
              transactionTaxAux.taxBase += transactionTax.taxBase;
              exists = true;
            }
          }
          if (!exists) {
            totalTaxes.push(transactionTax);
          }

          if(transactionTax.tax.classification === TaxClassification.Tax) {
            totalTaxBase += transactionTax.taxBase;
            partialTaxAmountIVA += transactionTax.taxAmount;
            partialTaxBase += transactionTax.taxBase;
            totalTaxAmountIVA += transactionTax.taxAmount;
          } else {
            partialTaxAmountPercep += transactionTax.taxAmount;
            totalTaxAmountPercep += transactionTax.taxAmount;
          }
        }
      }

      let printGravado = "0,00";
      if ((this.roundNumber.transform(partialTaxBase)).toString().split(".")[1]) {
        if (this.roundNumber.transform(partialTaxBase).toString().split(".")[1].length === 1) {
          printGravado = partialTaxBase.toLocaleString('de-DE') + "0";
        } else {
          printGravado = partialTaxBase.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(partialTaxBase)) {
        printGravado = partialTaxBase.toLocaleString('de-DE') + ",00";
      }

      let printExempt = "0,00";
      if ((this.roundNumber.transform(transaction.exempt)).toString().split(".")[1]) {
        if (this.roundNumber.transform(transaction.exempt).toString().split(".")[1].length === 1) {
          printExempt = transaction.exempt.toLocaleString('de-DE') + "0";
        } else {
          printExempt = transaction.exempt.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(transaction.exempt)) {
        printExempt = transaction.exempt.toLocaleString('de-DE') + ",00";
      }

      let printTaxAmountÌVA = "0,00";
      if ((this.roundNumber.transform(partialTaxAmountIVA)).toString().split(".")[1]) {
        if (this.roundNumber.transform(partialTaxAmountIVA).toString().split(".")[1].length === 1) {
          printTaxAmountÌVA = partialTaxAmountIVA.toLocaleString('de-DE') + "0";
        } else {
          printTaxAmountÌVA = partialTaxAmountIVA.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(partialTaxAmountIVA)) {
        printTaxAmountÌVA = partialTaxAmountIVA.toLocaleString('de-DE') + ",00";
      }

      let printTaxAmountPercep = "0,00";
      if ((this.roundNumber.transform(partialTaxAmountPercep)).toString().split(".")[1]) {
        if (this.roundNumber.transform(partialTaxAmountPercep).toString().split(".")[1].length === 1) {
          printTaxAmountPercep = partialTaxAmountPercep.toLocaleString('de-DE') + "0";
        } else {
          printTaxAmountPercep = partialTaxAmountPercep.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(partialTaxAmountPercep)) {
        printTaxAmountPercep = partialTaxAmountPercep.toLocaleString('de-DE') + ",00";
      }

      let printTotal = "0,00";
      if ((this.roundNumber.transform((partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt))).toString().split(".")[1]) {
        if (this.roundNumber.transform((partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt)).toString().split(".")[1].length === 1) {
          printTotal = (partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt).toLocaleString('de-DE') + "0";
        } else {
          printTotal = (partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt).toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform((partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt))) {
        printTotal = (partialTaxBase + partialTaxAmountIVA + partialTaxAmountPercep + transaction.exempt).toLocaleString('de-DE') + ",00";
      }

      

      this.doc.text(printGravado, 150, row);
      this.doc.text(printExempt, 175, row);
      this.doc.text(printTaxAmountÌVA, 195, row);
      this.doc.text(printTaxAmountPercep, 225, row);
      this.doc.text((printTotal), 260, row);

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
        this.doc.text("GRAVADO", 150, row);
        this.doc.text("EXENTO", 175, row);
        this.doc.text("MONTO IVA", 195, row);
        this.doc.text("MONTO PERCEP.", 225, row);
        this.doc.text("MONTO TOTAL", 260, row);
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

    let printTaxBase = "0,00";
    if ((this.roundNumber.transform(totalTaxBase)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalTaxBase).toString().split(".")[1].length === 1) {
        printTaxBase = totalTaxBase.toLocaleString('de-DE') + "0";
      } else {
        printTaxBase = totalTaxBase.toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalTaxBase)) {
      printTaxBase = totalTaxBase.toLocaleString('de-DE') + ",00";
    }

    let printExempt = "0,00";
    if ((this.roundNumber.transform(totalExempt)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalExempt).toString().split(".")[1].length === 1) {
        printExempt = totalExempt.toLocaleString('de-DE') + "0";
      } else {
        printExempt = totalExempt.toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalExempt)) {
      printExempt = totalExempt.toLocaleString('de-DE') + ",00";
    }

    let printTaxAmountIVA = "0,00";
    if ((this.roundNumber.transform(totalTaxAmountIVA)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalTaxAmountIVA).toString().split(".")[1].length === 1) {
        printTaxAmountIVA = totalTaxAmountIVA.toLocaleString('de-DE') + "0";
      } else {
        printTaxAmountIVA = totalTaxAmountIVA.toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalTaxAmountIVA)) {
      printTaxAmountIVA = totalTaxAmountIVA.toLocaleString('de-DE') + ",00";
    }

    let printTaxAmountPercep = "0,00";
    if ((this.roundNumber.transform(totalTaxAmountPercep)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalTaxAmountPercep).toString().split(".")[1].length === 1) {
        printTaxAmountPercep = totalTaxAmountPercep.toLocaleString('de-DE') + "0";
      } else {
        printTaxAmountPercep = totalTaxAmountPercep.toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalTaxAmountPercep)) {
      printTaxAmountPercep = totalTaxAmountPercep.toLocaleString('de-DE') + ",00";
    }

    let printAmount = "0,00";
    if ((this.roundNumber.transform(totalAmount)).toString().split(".")[1]) {
      if (this.roundNumber.transform(totalAmount).toString().split(".")[1].length === 1) {
        printAmount = totalAmount.toLocaleString('de-DE') + "0";
      } else {
        printAmount = totalAmount.toLocaleString('de-DE');
      }
    } else if (this.roundNumber.transform(totalAmount)) {
      printAmount = totalAmount.toLocaleString('de-DE') + ",00";
    }

    this.doc.text(printTaxBase, 150, row);
    this.doc.text(printExempt, 175, row);
    this.doc.text(printTaxAmountIVA, 195, row);
    this.doc.text(printTaxAmountPercep, 225, row);
    this.doc.text(printAmount, 260, row);

    this.doc.setFontType('normal');
    row += 3;
    this.doc.line(0, row, 400, row);

    // IMPRIMIR CUADRO DE IMPUESTOS
    if(row + 56 > 190) {

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
      this.doc.setFontType('normal');

      row += 3;
      this.doc.line(0, row, 400, row);
      row += 5;
    }
    row += 10;
    let rowInitial = row;
    let rowFinal;
    // LINEA HORIZONTAL ARRIBA ENCABEZADO
    this.doc.line(10, row, 105, row);
    row += 5;

    this.doc.setFontType('bold');
    this.doc.setFontSize(9);
    this.doc.text("TOTALES POR IMPUESTO", 35, row);
    this.doc.setFontSize(8);
    this.doc.setFontType('normal');

    row += 3;
    // LINEA HORIZONTAL DEBAJO ENCABEZADO
    this.doc.line(10, row, 105, row);
    row += 5;

    this.doc.setFontType('bold');
    this.doc.setFontSize(9);
    this.doc.text("IMPUESTO", 15, row);
    this.doc.text("GRAVADO", 55, row);
    this.doc.text("MONTO", 85, row);
    this.doc.setFontSize(8);
    this.doc.setFontType('normal');

    row += 3;
    // LINEA HORIZONTAL DEBAJO ENCABEZADO

    this.doc.line(10, row, 105, row);
    row += 5;

    for(let tax of totalTaxes) {

      let printTaxBase = "0,00";
      if ((this.roundNumber.transform(tax.taxBase)).toString().split(".")[1]) {
        if (this.roundNumber.transform(tax.taxBase).toString().split(".")[1].length === 1) {
          printTaxBase = tax.taxBase.toLocaleString('de-DE') + "0";
        } else {
          printTaxBase = tax.taxBase.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(tax.taxBase)) {
        printTaxBase = tax.taxBase.toLocaleString('de-DE') + ",00";
      }

      let printTaxAmount = "0,00";
      if ((this.roundNumber.transform(tax.taxAmount)).toString().split(".")[1]) {
        if (this.roundNumber.transform(tax.taxAmount).toString().split(".")[1].length === 1) {
          printTaxAmount = tax.taxAmount.toLocaleString('de-DE') + "0";
        } else {
          printTaxAmount = tax.taxAmount.toLocaleString('de-DE');
        }
      } else if (this.roundNumber.transform(tax.taxAmount)) {
        printTaxAmount = tax.taxAmount.toLocaleString('de-DE') + ",00";
      }

        this.doc.text(tax.tax.name, 15, row);
        this.doc.text(printTaxBase, 55, row);
        this.doc.text(printTaxAmount, 85, row);
        row += 5;
    }
  
    // LINEA HORIZONTAL FINAL
    this.doc.line(10, row, 105, row);
    // LINEA VERTICAL IZQUIERDA
    rowFinal = row;
    this.doc.line(10, rowInitial, 10, rowFinal);
    // LINEA VERTICAL DERECHA
    this.doc.line(105, rowInitial, 105, rowFinal);

    row +=5;

    //TOTALES POR REGIMEN
    row = rowInitial;
    // LINEA HORIZONTAL ARRIBA ENCABEZADO
    this.doc.line(140, row, 245, row);
    row += 5;

    this.doc.setFontType('bold');
    this.doc.setFontSize(9);
    this.doc.text("TOTALES POR REGIMEN", 175, row);
    this.doc.setFontSize(8);
    this.doc.setFontType('normal');

    row += 3;
    // LINEA HORIZONTAL DEBAJO ENCABEZADO
    this.doc.line(140, row, 245, row); 
    row += 5;

    this.doc.setFontType('bold');
    this.doc.setFontSize(9);
    this.doc.text("REGIMEN", 145, row);
    this.doc.text("MONTO", 225, row);
    this.doc.setFontSize(8);
    this.doc.setFontType('normal');

    row += 3;
    // LINEA HORIZONTAL DEBAJO ENCABEZADO

    this.doc.line(140, row, 245, row); 
    row += 5;

    this.dataIVA.forEach(element => {
      
      this.doc.text(element['description'], 145, row);
      this.doc.text(element['total'].toLocaleString('de-DE'), 225, row);
      row += 5;

    });
  
    // LINEA HORIZONTAL FINAL
    this.doc.line(140, row, 245, row);
    // LINEA VERTICAL IZQUIERDA
    rowFinal = row;
    this.doc.line(140, rowInitial, 140, rowFinal);
    // LINEA VERTICAL DERECHA
    this.doc.line(245, rowInitial, 245, rowFinal);


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

  public padString(n, length) {
    var n = n.toString();
    while (n.length < length)
      n = "0" + n;
    return n;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }

}
