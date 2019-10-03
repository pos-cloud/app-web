import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as jsPDF from 'jspdf';
import { Observable, Observer } from 'rxjs';

//servicios
import { MovementOfCancellationService } from 'app/services/movement-of-cancellation.service';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { MovementOfCashService } from 'app/services/movement-of-cash.service';
import { TransactionService } from 'app/services/transaction.service';
import { ConfigService } from 'app/services/config.service';

//modelos
import { Printer, PositionPrint } from 'app/models/printer';
import { Config } from 'app/app.config';
import { MovementOfCash } from 'app/models/movement-of-cash';
import { MovementOfArticle } from 'app/models/movement-of-article';
import { Company } from 'app/models/company';
import { MovementOfCancellation } from 'app/models/movement-of-cancellation';
import { Transaction } from 'app/models/transaction';
import { async } from 'q';


@Component({
  selector: 'app-print-transaction-type',
  templateUrl: './print-transaction-type.component.html',
  styleUrls: ['./print-transaction-type.component.css']
})
export class PrintTransactionTypeComponent implements OnInit {

  @Input() transactionId : string;
  @Input() origin : string;
  @Input() printer : Printer;
  public imageURL : any;
  public transaction : Transaction;
  public movementOfCash : MovementOfCash[];
  public movementOfArticle : MovementOfArticle[];
  public movementOfCancellation : MovementOfCancellation [];
  public company : Company;
  public config : Config;
  public doc;
  public pdfURL;
  public alertMessage;

  constructor(
    public _transactionService : TransactionService,
    public _movementOfCashService : MovementOfCashService,
    public _movementOfArticleService : MovementOfArticleService,
    public _movementOfCancellationService : MovementOfCancellationService,
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
  
      match = { "transactionDestination": { $oid: this.transactionId} , "operationType": { "$ne": "D" } };
      
  
      // CAMPOS A TRAER
      let project = {
        "transactionDestination": 1,
        "operationType" : 1,
        'transactionOrigin.origin':1,
        'transactionOrigin.letter':1,
        'transactionOrigin.number':1,
        'transactionOrigin.date':1,
        'transactionOrigin.startDate':1,
        'transactionOrigin.endDate':1,
        'transactionOrigin.expirationDate':1,
        'transactionOrigin.VATPeriod':1,
        'transactionOrigin.observation':1,
        'transactionOrigin.basePrice':1,
        'transactionOrigin.exempt':1,
        'transactionOrigin.discountAmount':1,
        'transactionOrigin.discountPercent':1,
        'transactionOrigin.taxes':1,
        'transactionOrigin.totalPrice':1,
        'transactionOrigin.roundingAmount':1,
        'transactionOrigin.diners':1,
        'transactionOrigin.state':1,
        'transactionOrigin.madein':1,
        'transactionOrigin.balance':1,
        'transactionOrigin.CAE':1,
        'transactionOrigin.CAEExpirationDate':1,
        'transactionOrigin.stringSAT':1,
        'transactionOrigin.CFDStamp':1,
        'transactionOrigin.SATStamp':1,
        'transactionOrigin.UUID':1,
        'transactionOrigin.currency':1,
        'transactionOrigin.quotation':1,
        'transactionOrigin.relationType':1,
        'transactionOrigin.useOfCFDI':1,
        'transactionOrigin.type':1,
        'transactionOrigin.cashBox':1,
        'transactionOrigin.table':1,
        'transactionOrigin.employeeOpening':1,
        'transactionOrigin.employeeClosing':1,
        'transactionOrigin.branchOrigin':1,
        'transactionOrigin.branchDestination':1,
        'transactionOrigin.depositOrigin':1,
        'transactionOrigin.depositDestination':1,
        'transactionOrigin.company':1,
        'transactionOrigin.transport':1,
        'transactionOrigin.turnOpening':1,
        'transactionOrigin.turnClosing':1,
        'transactionOrigin.priceList':1,
        'transactionOrigin.creationUser':1,
        'transactionOrigin.creationDate':1,
        'transactionOrigin.operationType':1,
        'transactionOrigin.updateUser':1,
        'transactionOrigin.updateDate':1,
        'transactionOrigin._id':1,
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

    await this.buildBody();

    await this.buildFooter();

    this.printer.fields.forEach(async field => {
      if(field.type === 'image'){
        this.getCompanyPicture(eval("this."+field.value),10, 5, 80, 40)
      }
    })

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
                this.doc.text(field.positionStartX,field.positionStartY,eval("this."+field.value).toString())
              } catch (e) {
                this.doc.text(field.positionStartX,field.positionStartY,field.value)
              }
              break;
            case 'dataSum':
              if(field.font !== 'default'){
                this.doc.setFont(field.font)
              }   
              this.doc.setFontType(field.fontType)
              this.doc.setFontSize(field.fontSize)
              
              if(field.value.split('.')[0] === "movementOfArticle" && this.movementOfArticle){
                this.movementOfArticle.forEach(async movementOfArticle => {
                  let sum = 0;
                  if(typeof eval("this."+field.value) === "number"){
                    sum = sum + eval("this"+field.value);
                  }
                  try {
                    this.doc.text(field.positionStartX,field.positionStartY,sum.toString())
                  } catch (e){
                    this.doc.text(field.positionStartX,field.positionStartY,field.value)
                  }
                });
              } else if(field.value.split('.')[0] === "movementOfCash" && this.movementOfCash){
                this.movementOfCash.forEach(async movementOfCash => {
                  let sum = 0;
                  if(typeof eval("this."+field.value) === "number"){
                    sum = sum + eval("this"+field.value);
                  }
                  try {
                    this.doc.text(field.positionStartX,field.positionStartY,sum.toString())
                  } catch (e){
                    this.doc.text(field.positionStartX,field.positionStartY,field.value)
                  }
                });
              } else if(field.value.split('.')[0] === "movementOfCancellation" && this.movementOfCancellation){
                this.movementOfCancellation.forEach(async movementOfCancellation => {
                  let sum = 0;
                  if(typeof eval("this."+field.value) === "number"){
                    sum = sum + eval("this"+field.value);
                  }
                  try {
                    this.doc.text(field.positionStartX,field.positionStartY,sum.toString())
                  } catch (e){
                    this.doc.text(field.positionStartX,field.positionStartY,field.value)
                  }
                });
              } else {
                try {
                  this.doc.text(field.positionStartX,field.positionStartY,eval(field.value))
                } catch (error) {
                  this.doc.text(field.positionStartX,field.positionStartY,'')
                }
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
    return new Promise<boolean>(async (resolve, reject) => {
      this.printer.fields.forEach(async field => {
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

  async buildBody() : Promise<boolean>{
    return new Promise<boolean>(async(resolve, reject)=>{
      this.printer.fields.forEach(async field => {
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
              let row = field.positionStartY
              if(field.font !== 'default'){
                this.doc.setFont(field.font)
              }   
              this.doc.setFontType(field.fontType)
              this.doc.setFontSize(field.fontSize)
  
              if(field.value.split('.')[0] === "movementOfArticle" && this.movementOfArticle){
                this.movementOfArticle.forEach(async movementOfArticle => {
                  try {
                    this.doc.text(field.positionStartX,row,(eval(field.value)).toString())
                  } catch (e){
                    this.doc.text(field.positionStartX,row,field.value)
                  }
                  row = row + this.printer.row;
                  if(row > this.printer.addPag){
                    this.doc.addPag()
                    await this.buildHeader()
                    row = field.positionStartY
                  }
                });
              } else if(field.value.split('.')[0] === "movementOfCash" && this.movementOfCash){
                this.movementOfCash.forEach(async movementOfCash => {
                  try {
                    this.doc.text(field.positionStartX,row,(eval(field.value)).toString())
                  } catch (e){
                    this.doc.text(field.positionStartX,row,field.value)
                  }
                  row = row + this.printer.row;
                  if(row > this.printer.addPag){
                    this.doc.addPag()
                    await this.buildHeader()
                    row = field.positionStartY
                  }
                });
              } else if(field.value.split('.')[0] === "movementOfCancellation" && this.movementOfCancellation){
                this.movementOfCancellation.forEach(async movementOfCancellation => {
                  try {
                    this.doc.text(field.positionStartX,row,(eval(field.value)).toString())
                  } catch (e){
                    this.doc.text(field.positionStartX,row,field.value)
                  }
                  row = row + this.printer.row;
                  if(row > this.printer.addPag){
                    this.doc.addPag()
                    await this.buildHeader()
                    row = field.positionStartY
                  }
                });
              } else {
                try {
                  this.doc.text(field.positionStartX,field.positionStartY,eval(field.value))
                } catch (error) {
                  this.doc.text(field.positionStartX,field.positionStartY,'')
                }
              }
              break;
            default:
              break;
          }
        }
      });
      resolve(true)
    })
  }

  public finishImpression(): void {

    this.doc.autoPrint();
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('bloburl'));
  }

  async getCompanyPicture(img,lmargin, rmargin, width, height) {

    return new Promise ((resolve, reject) => {
      this._configService.getCompanyPicture(img).subscribe(
        result => {
          if (!result.imageBase64) {
            resolve(false)
          } else {
            let imageURL = 'data:image/jpeg;base64,' + result.imageBase64;
            this.imageURL = imageURL;
            this.doc.addImage(imageURL, 'jpeg', lmargin, rmargin, width, height);   
            this.finishImpression()
       
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
