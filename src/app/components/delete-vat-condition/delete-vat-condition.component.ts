import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { VATCondition } from './../../models/vat-condition';

import { VATConditionService } from './../../services/vat-condition.service';

@Component({
  selector: 'app-delete-vat-condition',
  templateUrl: './delete-vat-condition.component.html',
  styleUrls: ['./delete-vat-condition.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteVATConditionComponent implements OnInit {

  @Input() vatCondition: VATCondition;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _vatConditionService: VATConditionService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteVATCondition(): void {

    this.loading = true;

    this._vatConditionService.deleteVATCondition(this.vatCondition._id).subscribe(
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
