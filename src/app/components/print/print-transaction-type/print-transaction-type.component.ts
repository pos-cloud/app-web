import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigService } from 'app/services/config.service';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from 'app/services/transaction.service';
import { Transaction } from 'app/models/transaction';
import * as jsPDF from 'jspdf';
import { Printer, PositionPrint } from 'app/models/printer';
import { resolve } from 'q';
@Component({
  selector: 'app-print-transaction-type',
  templateUrl: './print-transaction-type.component.html',
  styleUrls: ['./print-transaction-type.component.css']
})
export class PrintTransactionTypeComponent implements OnInit {

  @Input() transactionId : string;
  @Input() origin : string;
  @Input() printer : Printer;
  public transaction : Transaction;
  public doc;
  public pdfURL;
  public alertMessage;

  constructor(
    public _transactionService : TransactionService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,   
    public _configService: ConfigService,
    private domSanitizer: DomSanitizer
  ) { }

  async ngOnInit() {

    if(this.transactionId){
      this.getTransaction();
    }

    if(this.origin === 'view'){
      this.buildPrint();
    }
  }

  public getTransaction(): void {


      this._transactionService.getTransaction(this.transactionId).subscribe(
        async result => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
          } else {
            this.transaction = result.transaction;
            if( this.transaction.type && 
                this.transaction.type.defectPrinter && 
                this.transaction.type.defectPrinter.fields && 
                this.transaction.type.defectPrinter.fields.length > 0) {
              this.printer = this.transaction.type.defectPrinter
              this.buildPrint();
            } else {
              this.showMessage("Debe seleccionar la impresora por defecto para Tipo de Transaccion:" + this.transaction.type.name, 'danger', false);
            }
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
        }
      );
  }

  async buildPrint() {

    let pageWidth = this.printer.pageWidth * 100 / 35.27751646284102;
    let pageHigh = this.printer.pageHigh * 100 / 35.27751646284102;

    this.doc = new jsPDF({
      orientation: this.printer.orientation,
      unit: 'mm',
      format: [pageWidth,pageHigh]
    })

    await this.buildHeader();

    this.printer.fields.forEach(field => {
      if(field.position === PositionPrint.Body){
        switch (field.type) {
          case 'label':
            this.doc.setFont(field.font)
            this.doc.setFontType(field.fontType)
            this.doc.setFontSize(field.fontSize)
            this.doc.text(field.positionStartX,field.positionStartY,field.value)
            break;
          case 'line':
            this.doc.setLineWidth(field.fontSize)
            this.doc.line(field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY)
            break;
          case 'field':
            if(this.transactionId){
              this.doc.setFont(field.font)
              this.doc.setFontType(field.fontType)
              this.doc.setFontSize(field.fontSize)
              this.doc.text(field.positionStartX,field.positionStartY,field.value)
            }
            
            break;
          default:
            break;
        }
      }
    });

    await this.buildFooter();

    this.finishImpression();

  }

  async buildFooter() {
    
    this.printer.fields.forEach(field => {
      if(field.position === PositionPrint.Footer){
        switch (field.type) {
          case 'label':
            this.doc.setFont(field.font)
            this.doc.setFontType(field.fontType)
            this.doc.setFontSize(field.fontSize)
            this.doc.text(field.positionStartX,field.positionStartY,field.value)
            break;
          case 'line':
            this.doc.setLineWidth(field.fontSize)
            this.doc.line(field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY)
            break;
          case 'field':
            if(this.transactionId){
              this.doc.setFont(field.font)
              this.doc.setFontType(field.fontType)
              this.doc.setFontSize(field.fontSize)
              this.doc.text(field.positionStartX,field.positionStartY,field.value)
            }
            break;
          default:
            break;
        }
      }
    });
    resolve(true)
  }

  async buildHeader() {
    this.printer.fields.forEach(field => {
      if(field.position === PositionPrint.Header){
        switch (field.type) {
          case 'label':
            if(field.font !== 'default'){
              this.doc.setFont(field.font)
            }              
            this.doc.setFontType(field.fontType)
            this.doc.setFontSize(field.fontSize)
            this.doc.text(field.positionStartX,field.positionStartY,field.value)
            break;
          case 'line':
            this.doc.setLineWidth(field.fontSize)
            this.doc.line(field.positionStartX, field.positionStartY, field.positionEndX, field.positionEndY)
            break;
          case 'field':
            if(this.transactionId){
              this.doc.setFont(field.font)
              this.doc.setFontType(field.fontType)
              this.doc.setFontSize(field.fontSize)
              this.doc.text(field.positionStartX,field.positionStartY,field.value)
            }
            break;
          default:
            break;
        }
      }
    });
    resolve(true)
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
