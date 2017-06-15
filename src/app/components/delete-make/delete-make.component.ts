import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Make } from './../../models/make';

import { MakeService } from './../../services/make.service';

@Component({
  selector: 'app-delete-make',
  templateUrl: './delete-make.component.html',
  styleUrls: ['./delete-make.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteMakeComponent implements OnInit {

  @Input() make: Make;
  public alertMessage: any;
  public focusEvent = new EventEmitter<boolean>();

  constructor(
    public _makeService: MakeService,
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

  public deleteMake(): void {

    this._makeService.deleteMake(this.make._id).subscribe(
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