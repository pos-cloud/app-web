import { Component, OnInit, Input } from '@angular/core';

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
  private alertMessage: any;

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

  private deleteCashBox(): void {

    this._cashBoxService.deleteCashBox(this.cashBox._id).subscribe(
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
