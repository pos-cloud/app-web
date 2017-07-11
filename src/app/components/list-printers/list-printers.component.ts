import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';

import { Printer } from './../../models/printer';
import { PrinterService } from './../../services/printer.service';

import { AddPrinterComponent } from './../../components/add-printer/add-printer.component';
import { UpdatePrinterComponent } from './../../components/update-printer/update-printer.component';
import { DeletePrinterComponent } from './../../components/delete-printer/delete-printer.component';

@Component({
  selector: 'app-list-printers',
  templateUrl: './list-printers.component.html',
  styleUrls: ['./list-printers.component.css'],
  providers: [NgbAlertConfig]
})

export class ListPrintersComponent implements OnInit {

  public printers: Printer[] = new Array();
  public arePrintersEmpty: boolean = true;
  public alertMessage: any;
  public userType: string;
  public orderTerm: string[] = ['description'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  @Output() eventAddItem: EventEmitter<Printer> = new EventEmitter<Printer>();

  constructor(
    public _printerService: PrinterService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
    
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getPrinters();
  }

  public getBadge(term: string): boolean {

    return true;
  }

  public getPrinters(): void {  

    this._printerService.getPrinters().subscribe(
        result => {
          if(!result.printers) {
            this.alertMessage = result.message;
            this.alertConfig.type = 'danger';
            this.printers = null;
            this.arePrintersEmpty = true;
          } else {
            this.alertMessage = null;
            this.printers = result.printers;
            this.arePrintersEmpty = false;
          }
        },
        error => {
          this.alertMessage = error;
          if(!this.alertMessage) {
            this.alertMessage = "Error en la petición.";
          }
        }
      );
   }

  public orderBy (term: string, property?: string): void {

    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = "-"+term;  
    } else {
      this.orderTerm[0] = term; 
    }
    this.propertyTerm = property;
  }
  
  public openModal(op: string, printer:Printer): void {

      let modalRef;
      switch(op) {
        case 'add' :
          modalRef = this._modalService.open(AddPrinterComponent, { size: 'lg' }).result.then((result) => {
            this.getPrinters();
          }, (reason) => {
            this.getPrinters();
          });
          break;
        case 'update' :
            modalRef = this._modalService.open(UpdatePrinterComponent, { size: 'lg' });
            modalRef.componentInstance.printer = printer;
            modalRef.result.then((result) => {
              if(result === 'save_close') {
                this.getPrinters();
              }
            }, (reason) => {
              
            });
          break;
        case 'delete' :
            modalRef = this._modalService.open(DeletePrinterComponent, { size: 'lg' })
            modalRef.componentInstance.printer = printer;
            modalRef.result.then((result) => {
              if(result === 'delete_close') {
                this.getPrinters();
              }
            }, (reason) => {
              
            });
          break;
        default : ;
      }
    };

    public addItem(printerSelected) {
      this.eventAddItem.emit(printerSelected);
    }
}