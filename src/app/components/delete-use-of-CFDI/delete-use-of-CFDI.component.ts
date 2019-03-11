import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { UseOfCFDI } from './../../models/use-of-CFDI';

import { UseOfCFDIService } from './../../services/use-of-CFDI.service';

@Component({
  selector: 'app-delete-use-of-CFDI',
  templateUrl: './delete-use-of-CFDI.component.html',
  styleUrls: ['./delete-use-of-CFDI.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteUseOfCFDIComponent implements OnInit {

  @Input() useOfCFDI: UseOfCFDI;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _useOfCFDIService: UseOfCFDIService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteUseOfCFDI(): void {

    this.loading = true;

    this._useOfCFDIService.deleteUseOfCFDI(this.useOfCFDI._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
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
    this.alertMessage = '';
  }
}
