import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
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
  styleUrls: ['./list-printers.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class ListPrintersComponent implements OnInit {

  public printers: Printer[] = new Array();
  public arePrintersEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public orderTerm: string[] = ['name'];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem: EventEmitter<Printer> = new EventEmitter<Printer>();
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    public _printerService: PrinterService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.getPrinters();
  }

  public getPrinters(): void {

    this.loading = true;

    this._printerService.getPrinters().subscribe(
        result => {
          if (!result.printers) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            this.loading = false;
            this.printers = new Array();
            this.arePrintersEmpty = true;
          } else {
            this.hideMessage();
            this.loading = false;
            this.printers = result.printers;
            this.totalItems = this.printers.length;
            this.arePrintersEmpty = false;
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
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

  public refresh(): void {
    this.getPrinters();
  }

  public openModal(op: string, printer:Printer): void {

    let modalRef;
    switch(op) {
      case 'view' :
          modalRef = this._modalService.open(UpdatePrinterComponent, { size: 'lg' });
          modalRef.componentInstance.printer = printer;
          modalRef.componentInstance.readonly = true;
        break;
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
          modalRef.componentInstance.readonly = false;
          modalRef.result.then((result) => {
            if (result === 'save_close') {
              this.getPrinters();
            }
          }, (reason) => {

          });
        break;
      case 'delete' :
          modalRef = this._modalService.open(DeletePrinterComponent, { size: 'lg' });
          modalRef.componentInstance.printer = printer;
          modalRef.result.then((result) => {
            if (result === 'delete_close') {
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = '';
  }
}
