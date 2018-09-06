import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Deposit } from './../../models/deposit';

import { DepositService } from './../../services/deposit.service';

@Component({
  selector: 'app-delete-deposit',
  templateUrl: './delete-deposit.component.html',
  styleUrls: ['./delete-deposit.component.css'],
  providers: [NgbAlertConfig]
})
export class DeleteDepositComponent implements OnInit {

  @Input() deposit: Deposit;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _depositService: DepositService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void { }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteDeposit(): void {

    this.loading = true;

    this._depositService.deleteDeposit(this.deposit._id).subscribe(
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

  public hideMessage(): void {
    this.alertMessage = '';
  }

}
