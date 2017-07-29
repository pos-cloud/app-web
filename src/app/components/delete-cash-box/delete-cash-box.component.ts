import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { CashBox } from './../../models/cash-box';

import { CashBoxService } from './../../services/cash-box.service';

@Component({
  selector: 'app-delete-cash-box',
  templateUrl: './delete-cash-box.component.html',
  styleUrls: ['./delete-cash-box.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteCashBoxComponent implements OnInit {

  @Input() cashBox: CashBox;
  public alertMessage: any;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _cashBoxService: CashBoxService,
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

  public deleteCashBox(): void {

    this._cashBoxService.deleteCashBox(this.cashBox._id).subscribe(
      result => {
        this.activeModal.close('delete_close');
      },
      error => {
        this.alertMessage = error._body;
        if(!this.alertMessage) {
            this.alertMessage = 'Ha ocurrido un error al conectarse con el servidor.';
        }
      }
    );
  }
}
