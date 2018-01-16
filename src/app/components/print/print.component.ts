//Paquetes de angular
import { Component, OnInit, Input, ElementRef, ViewChild, transition  } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

//Modelos
import { Transaction, TransactionState } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Turn, TurnState } from './../../models/turn';
import { Print } from './../../models/print';
import { Printer, PrinterType } from './../../models/printer';
import { Config } from './../../app.config';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';

//Servicios
import { TurnService } from './../../services/turn.service';
import { PrinterService } from './../../services/printer.service';
import { PrintService } from './../../services/print.service';
import { TransactionService } from './../../services/transaction.service';
import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { ConfigService } from './../../services/config.service';

//Pipes
import { DecimalPipe } from '@angular/common';
import { DateFormatPipe } from './../../pipes/date-format.pipe';
import { RoundNumberPipe } from './../../pipes/round-number.pipe';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css'],
  providers: [RoundNumberPipe]
})
export class PrintComponent implements OnInit {

  @Input() transaction: Transaction;
  @Input() movementsOfArticles: MovementOfArticle[];
  @Input() turn: Turn;
  @Input() typePrint;
  public loading: boolean;
  public alertMessage: string = "";
  public shiftClosingTransaction;
  public shiftClosingMovementOfArticle;
  public shiftClosingMovementOfCash;
  public companyName: string = Config.companyName;
  public printers: Printer[];
  public printersAux: Printer[];
  public movementsOfArticles2: MovementOfArticle[];
  public config: Config;
  @ViewChild('contentPrinters') contentPrinters: ElementRef;
  @ViewChild('contentTicket') contentTicket: ElementRef;
  public pdfURL;
  public doc;
  public roundNumber = new RoundNumberPipe();
  public dateFormat = new DateFormatPipe();

  constructor(
    public _turnService: TurnService,
    public _printService: PrintService,
    public _printerService: PrinterService,
    public _transactionService: TransactionService,
    public _movementOfArticle: MovementOfArticleService,
    public _configService: ConfigService,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    private domSanitizer: DomSanitizer
  ) {
    this.doc = new jsPDF();
  }

  ngOnInit() {
    this.printers = new Array();
    this.printersAux = new Array();
    this.getPrinters();
    if (this.typePrint === "turn") {
      this.getShiftClosingByTransaccion();
      this.getShiftClosingByMovementOfArticle();
      this.getShiftClosingByMovementOfCash();
    } else if (this.typePrint === "invoice") {
      this.getTransaction();
    }
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
      result => {
        if (!result.printers) {
          this.printers = undefined;
        } else {
          this.hideMessage();
          this.printers = result.printers;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByTransaccion(): void {

    this.loading = true;

    this._turnService.getShiftClosingByTransaccion(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingTransaction = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfArticle(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfArticle(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfArticle = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfCash(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfCash(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfCash = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getTransaction(): void {
    this.loading = true;
    
        this._transactionService.getTransaction(this.transaction._id).subscribe(
          result => {
            if (!result.transaction) {
              this.showMessage(result.message, "info", true);
              this.loading = false;
            } else {
              this.hideMessage();
              this.transaction = result.transaction;
              this.getMovementOfArticle();
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, "danger", false);
            this.loading = false;
          }
        );
  }

  public getMovementOfArticle(): void {
    this.loading = true;
        this._movementOfArticle.getMovementsOfTransaction(this.transaction._id).subscribe(
          result => {
            if (!result.movementsOfArticles) {
              this.showMessage(result.message, "info", true);
              this.loading = false;
            } else {
              this.hideMessage();
              this.movementsOfArticles2 = result.movementsOfArticles;
              this.getConfig();
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, "danger", false);
            this.loading = false;
          }
        );
  }

  public getConfig(): void {
    this.loading = true;
        this._configService.getConfigApi().subscribe(
          result => {
            if (!result.configs) {
              this.showMessage(result.message, "info", true);
              this.loading = false;
            } else {
              this.hideMessage();
              this.config = result.configs;
              this.toPrintInvoice();
            }
            this.loading = false;
          },
          error => {
            this.showMessage(error._body, "danger", false);
            this.loading = false;
          }
        );
  }

  public print(): void {

    let modalRef;
    this.toPrintTurn(null);
    // if (this.countPrinters() > 1) {
    //   modalRef = this._modalService.open(this.contentPrinters, { size: 'lg' }).result.then((result) => {
    //     if (result !== "cancel" && result !== "") {
    //       this.distributeImpressions(result);
    //     }
    //   }, (reason) => {

    //   });
    // } else if (this.countPrinters() !== 0) {
    //   this.distributeImpressions(this.printersAux[0]);
    // } else {
    //   this.showMessage("No se encontraron impresoras","info",true);
    // }
  }

  public countPrinters(): number {

    let numberOfPrinters: number = 0;
    this.printersAux = new Array();

    if (this.printers != undefined) {
      for (let printer of this.printers) {
        if (this.typePrint === 'charge' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'bill' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'bar' && printer.type === PrinterType.Bar) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'kitchen' && printer.type === PrinterType.Kitchen) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typePrint === 'turn' && printer.type === PrinterType.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    return numberOfPrinters;
  }

  public distributeImpressions(printer: Printer) {

    switch (this.typePrint) {
      case 'charge':
        break;
      case 'bill':
        break;
      case 'bar':
        break;
      case 'kitchen':
        break;
      case 'turn':
        this.toPrintTurn(printer);
        break;
      default:
        this.showMessage("No se reconoce la operación de impresión.", "danger", false);
        break;
    }
  }

  public toPrintTurn(printerSelected: Printer): void {

    this.loading = true;
    this.showMessage("Imprimiendo, Espere un momento...", "info", false);

    this.typePrint = 'turn';
    let decimalPipe = new DecimalPipe('ARS');
    let content: string;

    content =
      '<table>' +
      '<tbody>' +
      '<tr><td colspan="12" align="center"><b><font face="Courier">CIERRE DE TURNO</font></b><td></tr>';
    if (Config.companyName) { content += '<tr><td colspan="12" align="center"><b><font face="Courier">' + Config.companyName + '</font></b><td></tr>' };
    if (this.turn.employee) { content += '<tr><td colspan="12"><font face="Courier" size="2">Mozo: ' + this.turn.employee.name + '</font></td></tr>' };
    if (this.turn.startDate) { content += '<tr><td colspan="12"><font face="Courier" size="2">Apertura: ' + this.dateFormat.transform(this.turn.startDate, 'DD/MM/YYYY HH:mm') + '</font></td></tr>' };
    if (this.turn.endDate) { content += '<tr><td colspan="12"><font face="Courier" size="2">Cierre: ' + this.dateFormat.transform(this.turn.endDate, 'DD/MM/YYYY HH:mm') + '</font></td></tr>' };
    if (this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Facturado: ' + decimalPipe.transform(this.shiftClosingTransaction.invoicedAmount, '1.2-2') + '</font></td></tr>' };
    if (!this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Facturado: $0.00</font></td></tr>' };
    if (this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tickets: ' + this.shiftClosingTransaction.amountOrders + '</font></td></tr>' };
    if (!this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tickets: 0</font></td></tr>' };
    if (this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tiques Anulados: ' + this.shiftClosingTransaction.amountOrdersCanceled + '</font></td></tr>' };
    if (!this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tickets Anulados: 0</font></td></tr>' };
    if (this.shiftClosingTransaction && this.shiftClosingTransaction.detailCanceled !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2"><b>Detalle de Tickets Anulados:</b></font></td></tr>' };
    if (this.shiftClosingTransaction && this.shiftClosingTransaction.detailCanceled !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2">' + this.shiftClosingTransaction.detailCanceled + '</font></td></tr>' };
    // if (this.shiftClosingMovementOfArticle.deletedItems !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2"><b>Detalle de Productos Anulados:</b></font></td></tr>' };
    // if (this.shiftClosingMovementOfArticle.deletedItems !== "") { content += '<tr><td colspan="12"><font face="Courier" size="2">' + this.shiftClosingMovementOfArticle.deletedItems + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingTransaction) { content += '<tr><td colspan="12"><font face="Courier" size="2"><b>Detalle de Medios de Pago</b></font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.cash !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Efectivo: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.cash, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.currentAccount !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Cuenta Corriente: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.currentAccount, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.creditCard !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tarjeta de Crédito: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.creditCard, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.debitCard !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Tarjeta de Débito: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.debitCard, '1.2-2') + '</font></td></tr>' };
    if (this.shiftClosingMovementOfCash && this.shiftClosingMovementOfCash.thirdPartyCheck !== 0) { content += '<tr><td colspan="12"><font face="Courier" size="2">Cheque de Terceros: ' + decimalPipe.transform(this.shiftClosingMovementOfCash.thirdPartyCheck, '1.2-2') + '</font></td></tr>' };
    content +=
      '</tbody>' +
      '</table>';

    this.doc.fromHTML(content, 15, 15, {
      'width': 170,
      'elementHandlers': {}
    });
    this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));

    // let print = new Print();
    // print.content = content;
    // print.printer = printerSelected;

    // this._printService.toPrint(print).subscribe(
    //   result => {
    //     if (result.message !== "ok") {
    //       this.showMessage(result.message, "info", true);
    //     } else {
    //       this.activeModal.close(this.turn);
    //     }
    //     this.loading = false;
    //   },
    //   error => {
    //     this.showMessage(error._body, "danger", false);
    //     this.loading = false;
    //   }
    // );
    this.loading = false;
    // this.activeModal.close(this.turn);
  }

  public toPrintInvoice(): void {
    
    let doc = new jsPDF('p','mm','A5');

    // switch(this.transaction.type.name) {
    //   case "Factura": 
    //         //cuadro
            this.doc.setFont('helvetica')
            this.doc.setFontType('bold')
            this.doc.setDrawColor("Black")
            this.doc.rect(95, 3, 10, 10)
            this.doc.text(this.transaction.letter,98,10)

            // Detalle de documento
            this.doc.setFontSize(20)
            this.doc.text(this.transaction.type.name,140,10)
            this.doc.setFontSize(10)
            this.doc.text("Comp. Nº:",110,20)
            this.doc.text(this.padString(this.transaction.origin,4)+"-"+this.padString(this.transaction.number,10),130,20)
            this.doc.text("Fecha:",110,25)
            if (this.transaction.endDate) {
              this.doc.text(this.dateFormat.transform(this.transaction.endDate, 'DD/MM/YYYY'),125,25)
            } else {
              this.doc.text(this.dateFormat.transform(this.transaction.startDate, 'DD/MM/YYYY'), 125, 25)
            }
            if(this.config[0].companyCUIT) {
              this.doc.text("CUIT:",110,30)
              this.doc.text(this.config[0].companyCUIT,125,30)
            }
            // this.doc.text("Ingresos Brutos:",110,35)
            // this.doc.text("Fecha Inicio de Actividad:",110,40)

            // Detalle Emisor
            this.doc.setFontSize(15)
            this.doc.text(this.config[0].companyName,23,20)
            this.doc.setFontSize(10)
            this.doc.text(this.config[0].companyAddress,20,30)
            this.doc.text("("+this.config[0].companyPhone+")",35,35)

            // Detalle receptor
            this.doc.setFontSize(10)
            this.doc.text("Nombre y Apellido:", 8, 55)
            this.doc.text("Condición de IVA:", 8, 65)
            this.doc.text("Consumidor Final", 40, 65)
            this.doc.text("Dirección:", 120, 55)
            this.doc.text("Teléfono:", 120, 60)
            this.doc.text("Localidad:", 120, 65)

            if(this.transaction.company) {
              this.doc.text(this.transaction.company.name,42,55)
              if (this.transaction.company.DNI) {
                this.doc.text("DNI:",8,60)
                this.doc.text(this.transaction.company.DNI,17,60)
              } else if (this.transaction.company.DNI) {
                this.doc.text("CUIT:", 8, 60)
                this.doc.text(this.transaction.company.CUIT, 17, 60)
              }
              this.doc.text(this.transaction.company.vatCondition.description,40,65)
              this.doc.text(this.transaction.company.address,140,55)
              this.doc.text(this.transaction.company.phones,138,60)
              this.doc.text(this.transaction.company.city,140,65)
            } else {
              this.doc.text("CUIT:", 8, 60)
              this.doc.text("Consumidor Final", 40, 65)
            }

            var iva21 = 0.00;
            var iva10 = 0.00;
            var iva27 = 0.00;

            if( this.transaction.taxes) {
              for (var x = 0; x < this.transaction.taxes.length; x++) { 
                if(this.transaction.taxes[x].percentage == 21){
                  iva21 = (this.transaction.taxes[x].taxAmount)
                }
                if(this.transaction.taxes[x].percentage == 10.5){
                  iva10 = (this.transaction.taxes[x].taxAmount)
                }
                if(this.transaction.taxes[x].percentage == 27){
                  iva27 = (this.transaction.taxes[x].taxAmount)
                }
              }
            }

            // Detalle Items
            this.doc.setFontSize(15)
            this.doc.text("Sub-Total:",147,257)
            this.doc.text("$ " + this.roundNumber.transform((this.transaction.totalPrice+this.transaction.discountAmount),2).toString(),180,257)
            this.doc.text("IVA 21:",147,264)
            this.doc.text("$ " + this.roundNumber.transform(iva21,2),180,264)
            this.doc.text("IVA 10.5:",147,271)
            this.doc.text("$ " + this.roundNumber.transform(iva10,2),180,271)
            this.doc.text("Exento:",147,278)
            this.doc.text("$ " + this.roundNumber.transform(this.transaction.exempt,2),180,278)
            this.doc.text("Descuento:",147,285)
            this.doc.text("$ (" + this.roundNumber.transform(this.transaction.discountAmount,2) + ")",180,285)
            this.doc.setFontSize(20)
            this.doc.text("Total:",147,292)
            this.doc.text("$ " + this.roundNumber.transform(this.transaction.totalPrice,2),180,292)
            this.doc.setFontSize(10)
            this.doc.text("Observaciones:",10,260)
            this.doc.text("",38,260)

            this.doc.line(0, 50, 250, 50) //horizontal
            this.doc.line(0, 70, 250, 70) //horizontal
            this.doc.line(0, 80, 250, 80) //horizontal
            this.doc.line(100, 13, 100, 50) //vertical letra
            this.doc.line(20, 70, 20, 250) //vertical detalle
            this.doc.line(150, 70, 150, 250) // vertical detalle
            this.doc.line(175, 70, 175, 250) //vertical detalle
            this.doc.line(0, 250, 250, 250) //horizontal

            this.doc.setFontSize(11)
            this.doc.text("Cant",5,77)
            this.doc.text("Detalle",25,77)
            this.doc.text("Precio",155,77)
            this.doc.text("Total",185,77)

            var fila = 77;

            if (this.movementsOfArticles2.length > 0) {
              for (var i = 0; i < this.movementsOfArticles2.length; i++) { 
                this.doc.text((this.movementsOfArticles2[0].amount).toString(),6,fila+8)
                this.doc.text(this.movementsOfArticles2[i].description,25,fila+8)
                if (this.movementsOfArticles2[i].article) {
                  this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].article.salePrice,2),155,fila+8)
                } else {
                  this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].salePrice, 2), 155, fila + 8)
                }
                this.doc.text("$ " + this.roundNumber.transform(this.movementsOfArticles2[i].salePrice,2),185,fila+8)
                
                fila = fila+8;
              }
            }

            this.doc.setFontStyle("italic")
            this.doc.setFontSize(15)
            this.doc.text("Gracias por su compra!",20,290)

            this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
    //       break;
    //   case "Ticket":
        //   this.doc.setFontSize(20)
        //   if (this.config[0].companyName) {
        //     this.doc.text(this.config[0].companyName,80,10)
        //   }
        //   if (this.config[0].companyAddress) {
        //     this.doc.setFontSize(10)
        //     this.doc.text("Direccion:" + this.config[0].companyAddress, 30, 20)
        //   }
        // if (this.config[0].companyPhone) {
        //     this.doc.setFontSize(10)
        //     this.doc.text("Telefono:" + this.config[0].companyPhone, 30, 20)
        //   }
        //   this.doc.setFontSize(10)
        //   this.doc.text("Fecha:",5,50)
        //   this.doc.text(fecha[0], 15,50)
        //   this.doc.text("Factura Nº:",5,57)
        //   this.doc.text(this.padString(this.transaction.number, 10), 22,57)
        //   this.doc.text("Fecha:",5,50)
        //   this.doc.text(fecha[0], 15,50)
                      
        //   this.doc.line(0, 60, 250, 60) //horizontal
        //   this.doc.line(0, 70, 250, 70) //horizontal
        //   this.doc.text("Cantidad",5,66)
        //   this.doc.text("Descripcion",50,66)
        //   this.doc.text("Total",130,66)
          
        //   var fila = 70;

        //   for (var i = 0; i < this.movementsOfArticles2.length; i++) { 
        //     this.doc.text((this.movementsOfArticles2[0].amount).toString(),10,fila+8)
        //     this.doc.text(this.movementsOfArticles2[i].description,45,fila+8)
        //     this.doc.text("$ "+(this.movementsOfArticles2[i].salePrice).toString(),130,fila+8)
            
        //     fila = fila+8;
        //   }

        //   this.doc.setFontSize(15)
        //   this.doc.text("Descuento: ", 150, 220)
        //   this.doc.text("$ (" + this.transaction.discountAmount + ")", 180, 220)  
        //   this.doc.setFontSize(20)
        //   this.doc.text("Total: ",150,240)
        //   this.doc.text("$ " + this.transaction.totalPrice,170,240)  
                      
                      
        //   this.doc.setFontStyle("italic")
        //   this.doc.setFontSize(15)
        //   this.doc.text("Gracias por su compra!",75,270)
        //   this.doc.setFontSize(10)
        //   this.doc.text("Documento no válido como factura",8,290)

        //   this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
    //       break;
    //   case "Cobro":
    //       this.pdfURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.doc.output('dataurl'));
    //       break;
    //   default:
    //       break;
    // }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }

  public padString (n, length) {
    var  n = n.toString();
    while(n.length < length)
         n = "0" + n;
    return n;
  }

}