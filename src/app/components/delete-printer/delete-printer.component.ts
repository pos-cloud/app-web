import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Printer } from './../../models/printer';

import { PrinterService } from './../../services/printer.service';

@Component({
  selector: 'app-delete-printer',
  templateUrl: './delete-printer.component.html',
  styleUrls: ['./delete-printer.component.css'],
  providers: [NgbAlertConfig]
})

export class DeletePrinterComponent implements OnInit {

  @Input() printer: Printer;
  public alertMessage: any;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _printerService: PrinterService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deletePrinter(): void {

    this._printerService.deletePrinter(this.printer._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
      },
      error => {
        this.alertMessage = error;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }
}