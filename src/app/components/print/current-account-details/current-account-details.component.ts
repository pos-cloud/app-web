import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import * as jsPDF from 'jspdf';

import { DateFormatPipe } from './../../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../../pipes/round-number.pipe';
import { TransactionService } from 'app/services/transaction.service';
import { Config } from './../../../app.config';
import { CompanyType } from 'app/models/company';

@Component({
  selector: 'app-current-account-details',
  templateUrl: './current-account-details.component.html',
  styleUrls: ['./current-account-details.component.css']
})

export class CurrentAccountDetailsComponent implements OnInit {

  @Input() companyType: CompanyType;
  @Input() employee: string;
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
    public _router: Router,
    private domSanitizer: DomSanitizer
  ) { 
    this.pageWidth = 210 * 100 / 35.27751646284102;
    this.pageHigh = 297 * 100 / 35.27751646284102;
  }

  public ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.doc = new jsPDF('l', 'mm', [this.pageWidth, this.pageHigh]);
    this.getTransactions()
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getTransactions():void {

    this.loading = true;

    let match = `{`;

    if(this.employee ){
      match += `"company.employee.name" : "${this.employee}",`
    }
    
    match += `"company.type" : "${this.companyType}",
              "balance" : { "$ne" : 0 },
              "state" : "Cerrado",
              "company.operationType" : { "$ne" : "D" }
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
      "company.type" : 1,
      "company.identificationType.name" : 1,
      "company.identificationValue": 1,
      "company.vatCondition.description":1,
      "company.employee.name" :1,
      "company.operationType" : 1,
      "endDate" :{ $dateToString: { date: "$endDate", format: "%d/%m/%Y", timezone: timezone }},
      "type.name" :1,
      "number" : 1,
      "letter" : 1,
      "origin" :1,
      "expirationDate" : { $dateToString: { date: "$expirationDate", format: "%d/%m/%Y", timezone: timezone }},
      "totalPrice" : 1,
      "balance" :1 ,
      "state" : 1
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
        { endDate: 1 }, // SORT
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

    let row = 15;
    this.doc.setFontSize(this.fontSizes.extraLarge)
    this.doc.text(5, row, 'Resumen de cuenta')
    row += 5;
    for(var i = 0; i < this.items.length; i++){
      this.doc.setFontSize(this.fontSizes.large)
      this.doc.setLineWidth(1)
      this.doc.line(0, row, 1000, row)
      row += 5;
      this.doc.text(5,row,this.items[i]._id.company.name)
      row += 5;
      this.doc.setFontSize(this.fontSizes.normal)
      if(this.items[i]._id.company.address){
        this.doc.text(5,row,"Dirección:"+this.items[i]._id.company.address)
      }
      if(this.items[i]._id.company.city){
        this.doc.text(100,row,"Ciudad:"+this.items[i]._id.company.city)
      }
      if(this.items[i]._id.company.phones){
        this.doc.text(200,row,"Teléfono:"+this.items[i]._id.company.phones)
      }
      row += 5;
      if(this.items[i]._id.company.identificationType && this.items[i]._id.company.identificationValue) {
        this.doc.text(5,row,this.items[i]._id.company.identificationType.name+":"+this.items[i]._id.company.identificationValue);
      }
      if(this.items[i]._id.company.vatCondition){
        this.doc.text(100,row,"Condición de IVA:"+this.items[i]._id.company.vatCondition.description);
      }
      row += 5;
      this.doc.setLineWidth(0.5);
      this.doc.line(0, row, 1000, row);
      row += 5;
      this.doc.text(5,row,"Fecha");
      this.doc.text(30,row,"Tipo");
      this.doc.text(75,row,"Comprobante");
      this.doc.text(120,row,"Fecha Ven");
      this.doc.text(155,row,"Importe");
      this.doc.text(180,row,"Saldo");
      row += 3;
      this.doc.setLineWidth(0.5)
      this.doc.line(0, row, 1000, row)
      row += 5
      let totalPrice = 0;
      let balance = 0;
      let total;
      for(let transaction of this.items[i].transactions) {
        this.doc.text(5,row,transaction.endDate);
        this.doc.text(30,row,transaction.type.name);
        this.doc.text(75,row,this.padString(transaction.origin, 4) + "-" + transaction.letter + "-" + this.padString(transaction.number, 8));
        if(transaction.expirationDate){
          this.doc.text(120,row,transaction.expirationDate);
        }
        this.doc.text(155,row, "$" + this.roundNumber.transform(transaction.totalPrice).toString());
        if(!transaction.balance) transaction.balance = 0;
        this.doc.text(180,row, "$" + this.roundNumber.transform(transaction.balance).toString());
        row += 5;

        totalPrice = totalPrice + transaction.totalPrice;
        balance = balance + transaction.balance;
      }

      this.doc.setFontType("bold");
      this.doc.text(120,row,"Total");
      this.doc.text(155,row,"$" +this.roundNumber.transform(totalPrice).toString());
      this.doc.text(180,row,"$" +this.roundNumber.transform(balance).toString());
      this.doc.setFontType("normal");
      row += 5;
      if(row > 150){
        this.doc.addPage();
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
