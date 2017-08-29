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
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _printerService: PrinterService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deletePrinter(): void {

    this.loading = true;
    
    this._printerService.deletePrinter(this.printer._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }
  
  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage():void {
    this.alertMessage = "";
  }
}