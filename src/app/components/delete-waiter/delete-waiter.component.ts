import { Component, OnInit, Input } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Waiter } from './../../models/waiter';

import { WaiterService } from './../../services/waiter.service';

@Component({
  selector: 'app-delete-waiter',
  templateUrl: './delete-waiter.component.html',
  styleUrls: ['./delete-waiter.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteWaiterComponent implements OnInit {

  @Input() waiter: Waiter;
  private alertMessage: any;

  constructor(
    public _waiterService: WaiterService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { 
    alertConfig.type = 'danger';
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {
  }

  private deleteWaiter(): void {

    this._waiterService.deleteWaiter(this.waiter._id).subscribe(
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
