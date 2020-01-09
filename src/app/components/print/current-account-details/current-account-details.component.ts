import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import * as jsPDF from 'jspdf';

import { DateFormatPipe } from './../../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../../pipes/round-number.pipe';
import { TransactionService } from 'app/services/transaction.service';
import { Config } from './../../../app.config';
import { CompanyType } from 'app/models/company';
import { ConfigService } from 'app/services/config.service';
import { CurrentAccount, Movements } from 'app/models/transaction-type';

var splitRegex = /\r\n|\r|\n/g;
jsPDF.API.textEx = function (text: any, x: number, y: number, hAlign?: string, vAlign?: string) {
    var fontSize = this.internal.getFontSize() / this.internal.scaleFactor;

    // As defined in jsPDF source code
    var lineHeightProportion = 1.5;

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
  selector: 'app-current-account-details',
  templateUrl: './current-account-details.component.html',
  styleUrls: ['./current-account-details.component.css']
})

export class CurrentAccountDetailsComponent implements OnInit {

  @Input() companyType: CompanyType;
  @Input() balance: boolean;
  @Input() employee: string;
  @Input() address : string;
  @Input() emails : string;
  @Input() name : string;
  @Input() identification : string;
  @Input() filterCompanyType;
  @Input() startDate;
  @Input() endDate;


  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public dateFormat = new DateFormatPipe();
  public doc;
  public pdfURL;
  public config;
  public roundNumber = new RoundNumberPipe();
  public pageWidth: number;
  public pageHigh: number;
  public withImage: boolean = false;
  public items = [];

  public fontSizes = JSON.parse(`{"xsmall" : 5,
                                  "small" : 7,
                                  "normal" : 10,
                                  "large" : 15,
                                  "extraLarge" : 20}`);

  constructor(
    public _transactionService : TransactionService,
    public _configService : ConfigService,
    public _router: Router,
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

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.doc = new jsPDF('p', 'mm', [this.pageWidth, this.pageHigh]);
    this.getTransactions()
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getTransactions():void {

    this.loading = true;

    let match = `{`;


    if(this.address ) {
      match += `"company.address": { "$regex": "${this.address}", "$options": "i" }, `
    }
    if(this.emails ) {
      match += `"company.emails": { "$regex": "${this.emails}", "$options": "i" }, `
    }
    if(this.name ) {
      match += `"company.name": { "$regex": "${this.name}", "$options": "i" }, `
    }
    if(this.identification ) {
      match += `"company.identificationValue": { "$regex": "${this.identification}", "$options": "i" }, `
    }
    if(this.employee ) {
      match += `"company.employee.name": { "$regex": "${this.employee}", "$options": "i" }, `
    }

    if(this.startDate && this.endDate){

      let timezone = "-03:00";
      if(Config.timezone && Config.timezone !== '') {
        timezone = Config.timezone.split('UTC')[1];
      }

      match +=  `"endDate" : {  "$gte": {"$date": "${this.startDate}T00:00:00${timezone}"},
                                "$lte": {"$date": "${this.endDate}T00:00:00${timezone}"}},`
    }

    if(this.balance){
      match += `"balance" : { "$gt" : 0 },`
    }
    
    match += `"company.type" : "${this.companyType}",
              "state" : "Cerrado",
              
              "$or": [{"type.currentAccount" : "Si"}, {"type.currentAccount" : "Cobra"}] ,            
              "company.operationType" : { "$ne" : "D" },
              "operationType" : { "$ne" : "D" } }`;

    match = JSON.parse(match);


    let timezone = "-03:00";
    if(Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      "_id": 1,
      "company.name" : 1,
      "company.address" : 1,
      "company.city" : 1,
      "company.phones" : 1,
      "company.emails" : 1,
      "company.type" : 1,
      "company.identificationType.name" : 1,
      "company.identificationValue": 1,
      "company.vatCondition.description":1,
      "company.employee.name" :1,
      "company.operationType" : 1,
      "company.state.name" :1,
      "endDate" : 1,
      "endDate2" : { $dateToString: { date: "$endDate", format: "%d/%m/%Y", timezone: timezone }},
      "type.name" :1,
      "type.currentAccount" : 1,
      "number" : 1,
      "letter" : 1,
      "origin" :1,
      "expirationDate" : { $dateToString: { date: "$expirationDate", format: "%d/%m/%Y", timezone: timezone }},
      "totalPrice" : 1,
      "balance" :1 ,
      "state" : 1,
      "operationType" :1,
      "type.labelPrint" : 1,
      "type.movement" :1
    }

    let group = {
      _id: {
        company : "$company"
      },
      transactions: { $push: '$$ROOT' },
      count: { $sum: 1 }
    };
    
    this._transactionService.getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        { 'company.name': -1, endDate: 1 }, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        if(result) {
          this.items = result;
          this.print();
          this.loading = false;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );

  }

  public print() : void {
    let page = 1;
    let row = 15;
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.text(5, row, 'Resumen de cuenta de ' + this.companyType)
    row += 5;
    this.doc.setFontSize(this.fontSizes.large)
    this.doc.text(180, 280, "Hoja:" + page)
    for(var i = 0; i < this.items.length; i++) {
      this.doc.setLineWidth(1)
      this.doc.line(0, row, 1000, row)
      row += 5;
      this.doc.setFontSize(this.fontSizes.large)
      this.doc.text(5,row,this.items[i]._id.company.name)
      row += 5;
      this.doc.setFontSize(this.fontSizes.normal)
      if(this.items[i]._id.company.identificationType && this.items[i]._id.company.identificationValue) {
        this.doc.text(5,row,this.items[i]._id.company.identificationType.name+":"+this.items[i]._id.company.identificationValue);
      }
      if(Config.country === 'AR') {
        this.doc.text(100,row,"Condición de IVA:")
        if(this.items[i]._id.company.vatCondition) {
          this.doc.text(100+30,row,this.items[i]._id.company.vatCondition.description);
        }
      } else {
        this.doc.text(100,row,"Régimen Fiscal:")
        if(this.items[i]._id.company.vatCondition) {
          this.doc.text(100+30,row,+this.items[i]._id.company.vatCondition.description);
        }
      }
      row += 5;
      this.doc.text(5,row,"Dirección:")
      if(this.items[i]._id.company.address) {
        this.doc.text(5+20,row,this.items[i]._id.company.address)
      }
      this.doc.text(100,row,"Ciudad:")
      if(this.items[i]._id.company.city) {
        this.doc.text(100+20,row,this.items[i]._id.company.city)
      }
      row += 5;
      this.doc.text(5,row,"Provincia:")
      if(this.items[i]._id.company.state) {
        this.doc.text(5+20,row,this.items[i]._id.company.state.name)
      }
      this.doc.text(100,row,"Teléfono:")
      if(this.items[i]._id.company.phones) {
        this.doc.text(100+20,row,this.items[i]._id.company.phones)
      }
      
      row += 5;
      this.doc.setLineWidth(0.5);
      this.doc.line(0, row, 1000, row);
      row += 5;
      this.doc.text(5,row,"Fecha");
      this.doc.text(30,row,"Tipo");
      this.doc.text(75,row,"Comprobante");
      this.doc.text(110,row,"Vencimiento");
      this.doc.text(140,row,"Importe");
      this.doc.text(165,row,"Saldo");
      this.doc.text(190,row,"Acumulado");

      row += 3;
      this.doc.setLineWidth(0.5)
      this.doc.line(0, row, 1000, row)
      row += 5
      let totalPrice = 0;
      let balance = 0;
      let acumulado = 0;
      let total;
      for(let transaction of this.items[i].transactions) {
        this.doc.text(5,row,transaction['endDate2']);
        if(transaction.type.labelPrint) {
          this.doc.text(30,row,transaction.type.labelPrint);
        } else {
          this.doc.text(30,row,transaction.type.name);
        }
        this.doc.text(75,row,this.padString(transaction.origin, 4) + "-" + transaction.letter + "-" + this.padString(transaction.number, 8));
        if(transaction.expirationDate) {
          this.doc.text(110,row,transaction.expirationDate);
        }

        var signo;

        if(this.filterCompanyType === CompanyType.Client){
         
          if( this.config && 
              this.config.reports && 
              this.config.reports.summaryOfAccounts && 
              !this.config.reports.summaryOfAccounts.invertedViewClient){
  
                if(transaction.type.currentAccount === "Si"){
                  if(transaction.type.movement === "Entrada") {
                    totalPrice = totalPrice + transaction.totalPrice;
                    balance = balance + transaction.balance;
                    signo = true;
                  } else {
                    totalPrice = totalPrice - transaction.totalPrice;
                    balance = balance - transaction.balance;
                    signo = false;
                  }
                } else {
                  if(transaction.type.movement === "Entrada") {
                    totalPrice = totalPrice - transaction.totalPrice;
                    balance = balance - transaction.balance;
                    signo = false;

                  } else {
                    totalPrice = totalPrice + transaction.totalPrice;
                    balance = balance + transaction.balance;
                    signo = true;

                  }
                }
          } else {
            if(transaction.type.currentAccount === "Si"){
              if(transaction.type.movement === "Entrada") {
                totalPrice = totalPrice - transaction.totalPrice;
                balance = balance - transaction.balance;
                signo = false;

              } else {
                totalPrice = totalPrice + transaction.totalPrice;
                balance = balance + transaction.balance;
                signo = true;

              }
            } else {
              if(transaction.type.movement === "Entrada") {
                totalPrice = totalPrice + transaction.totalPrice;
                balance = balance + transaction.balance;
                signo = true;

              } else {
                totalPrice = totalPrice - transaction.totalPrice;
                balance = balance - transaction.balance;
                signo = false;

              }
            }
          }
        } else {
          if( this.config && 
            this.config.reports && 
            this.config.reports.summaryOfAccounts && 
            !this.config.reports.summaryOfAccounts.invertedViewProvider){

              if(transaction.type.currentAccount === CurrentAccount.Yes){
                if(transaction.type.movement === Movements.Inflows) {
                  totalPrice = totalPrice - transaction.totalPrice;
                  balance = balance - transaction.balance;
                  signo = false;

                } else {
                  totalPrice = totalPrice + transaction.totalPrice;
                  balance = balance + transaction.balance;
                  signo = true;

                }
              } else {
                if(transaction.type.movement === Movements.Inflows) {
                  totalPrice = totalPrice + transaction.totalPrice;
                  balance = balance + transaction.balance;
                  signo = true;

                } else {
                  totalPrice = totalPrice - transaction.totalPrice;
                  balance = balance - transaction.balance;
                  signo = false;

                }
              }
          } else {
            if(transaction.type.currentAccount === CurrentAccount.Yes){
              if(transaction.type.movement === Movements.Inflows) {
                totalPrice = totalPrice + transaction.totalPrice;
                balance = balance + transaction.balance;
                signo = true;

              } else {
                totalPrice = totalPrice - transaction.totalPrice;
                balance = balance - transaction.balance;
                signo = false;

              }
            } else {
              if(transaction.type.movement === Movements.Inflows) {
                totalPrice = totalPrice - transaction.totalPrice;
                balance = balance - transaction.balance;
                signo = false;

              } else {
                totalPrice = totalPrice + transaction.totalPrice;
                balance = balance + transaction.balance;
                signo = true;

              }
            }
          }
        }

        if(signo){

          this.doc.textEx("$ " + this.roundNumber.transform(transaction.totalPrice).toFixed(2).toString(), 155, row, 'right', 'middle');
          if(!transaction.balance) transaction.balance = 0;
          this.doc.textEx("$ " + this.roundNumber.transform(transaction.balance).toFixed(2).toString(), 180, row, 'right', 'middle');
    
          acumulado = acumulado + transaction.balance;

          //this.doc.text(155,row, "$ " + this.roundNumber.transform(transaction.totalPrice).toString());
          //this.doc.text(180,row, "$ " + this.roundNumber.transform(transaction.balance).toString());
        } else {
          this.doc.textEx("$ -" + this.roundNumber.transform(transaction.totalPrice).toFixed(2).toString(), 155, row, 'right', 'middle');
         // this.doc.text(155,row, "$ -" + this.roundNumber.transform(transaction.totalPrice).toString());
          if(!transaction.balance) transaction.balance = 0;
          this.doc.textEx("$ " + this.roundNumber.transform(transaction.balance).toFixed(2).toString(), 180, row, 'right', 'middle');
         //this.doc.text(180,row, "$ " + this.roundNumber.transform(transaction.balance).toString());
         acumulado = acumulado - transaction.balance;

        }

        this.doc.textEx("$ " + this.roundNumber.transform(acumulado).toFixed(2).toString(), 205, row, 'right', 'middle');

        row += 5;

        if(row > 220) {
          page += 1;
          this.doc.addPage();
          this.doc.setFontSize(this.fontSizes.large)
          this.doc.text(180, 280, "Hoja:" + page)
          this.doc.setFontSize(this.fontSizes.normal)
          row = 15;
        }

      }

      this.doc.setFontType("bold");
      this.doc.text(120,row,"Total");
      //this.doc.text(155,row,"$" +this.roundNumber.transform(totalPrice).toString());
      this.doc.textEx("$ " +this.roundNumber.transform(totalPrice).toFixed(2).toString(), 155, row, 'right', 'middle');

      if(balance){
        //this.doc.text(180,row,"$" +this.roundNumber.transform(balance).toString());
        this.doc.textEx("$ " +this.roundNumber.transform(balance).toFixed(2).toString(), 180, row, 'right', 'middle');

      }
      this.doc.setFontType("normal");
      row += 5;
      if(row > 220) {
        page += 1;
        this.doc.addPage();
        this.doc.setFontSize(this.fontSizes.large)
        this.doc.text(180, 280, "Hoja:" + page)
        this.doc.setFontSize(this.fontSizes.normal)

        row = 15;
      }
    }
    this.finishImpression();
  }

  public finishImpression(): void {
    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));
    this.doc = new jsPDF('l', 'mm', [this.pageWidth, this.pageHigh]);
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
    /*this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;*/
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
