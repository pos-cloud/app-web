import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigService } from 'app/services/config.service';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionService } from 'app/services/transaction.service';
import { Transaction } from 'app/models/transaction';
import * as jsPDF from 'jspdf';
import { Printer, PositionPrint } from 'app/models/printer';
import { resolve } from 'q';
import { Config } from 'app/app.config';
import { MovementOfCashService } from 'app/services/movement-of-cash.service';
import { MovementOfCash } from 'app/models/movement-of-cash';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { Company } from 'app/models/company';
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
  public movementOfCash : MovementOfCash[];
  public movementOfArticle : MovementOfArticle[];
  public company : Company;
  public config : Config;
  public doc;
  public pdfURL;
  public alertMessage;

  constructor(
    public _transactionService : TransactionService,
    public _movementOfCashService : MovementOfCashService,
    public _movementOfArticleService : MovementOfArticleService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,   
    public _configService: ConfigService,
    private domSanitizer: DomSanitizer
  ) { }

  async ngOnInit() {


    await this.getConfigApi().then(
      config => {
        if(config) {
          this.config = config
        }
      }
    );

    if(this.transactionId){
      this.getTransaction();
    }

    if(this.origin === 'view'){
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

  async getTransaction() {

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
              
              await this.getMovementOfCashes();
              await this.getMovementofArticle();
              //await this.getMovementofCancellation();
              
              this.printer = this.transaction.type.defectPrinter
              this.company = this.transaction.company;
              
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

  async getMovementOfCashes() : Promise<boolean> {

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

  async getMovementofArticle() : Promise<boolean> {

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
      format: [pageWidth,pageHigh]
    })

    await this.buildHeader();

    this.printer.fields.forEach(field => {
      if(field.position === PositionPrint.Body){
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
          case 'data':
            if(field.font !== 'default'){
              this.doc.setFont(field.font)
            }   
            this.doc.setFontType(field.fontType)
            this.doc.setFontSize(field.fontSize)

            if(field.value.split('.')[0] === "movementOfArticle"){
              this.movementOfArticle.forEach(movementOfArticle => {
                try {
                  this.doc.text(field.positionStartX,field.positionStartY,(eval(field.value)).toString())
                } catch (e){
                  this.doc.text(field.positionStartX,field.positionStartY,field.value)
                }
                field.positionStartY = field.positionStartY + this.printer.row;
              });
            } else if(field.value.split('.')[0] === "movementOfCash"){
              this.movementOfCash.forEach(movementOfCash => {
                try {
                  this.doc.text(field.positionStartX,field.positionStartY,(eval(field.value)).toString())
                } catch (e){
                  this.doc.text(field.positionStartX,field.positionStartY,field.value)
                }
                field.positionStartY = field.positionStartY + this.printer.row;
              });
            } else {
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

  async buildFooter() : Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.printer.fields.forEach(field => {
        if(field.position === PositionPrint.Footer){
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
            case 'data':
              if(field.font !== 'default'){
                this.doc.setFont(field.font)
              }   
              this.doc.setFontType(field.fontType)
              this.doc.setFontSize(field.fontSize)
              try {
                this.doc.text(field.positionStartX,field.positionStartY,eval("this."+field.value))
              } catch (e) {
                this.doc.text(field.positionStartX,field.positionStartY,field.value)
              }
              break;
            default:
              break;
          }
        }
      });
      resolve(true)
    });
   
  }

  async buildHeader() : Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
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
            case 'data':
              if(field.font !== 'default'){
                this.doc.setFont(field.font)
              }   
              this.doc.setFontType(field.fontType)
              this.doc.setFontSize(field.fontSize)
              try {
                this.doc.text(field.positionStartX,field.positionStartY,eval("this."+field.value))
              } catch (e) {
                this.doc.text(field.positionStartX,field.positionStartY,field.value)
              }
              break;
            default:
              break;
          }
        }
      });
      resolve(true)
    });
    
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
