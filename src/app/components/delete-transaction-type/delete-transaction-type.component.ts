import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TransactionType } from './../../models/transaction-type';

import { TransactionTypeService } from './../../services/transaction-type.service';

@Component({
  selector: 'app-delete-transaction-type',
  templateUrl: './delete-transaction-type.component.html',
  styleUrls: ['./delete-transaction-type.component.css'],
  providers: [NgbAlertConfig]
})

export class DeleteTransactionTypeComponent implements OnInit {

  @Input() transactionType: TransactionType;
  public alertMessage: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _transactionTypeService: TransactionTypeService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public deleteTransactionType(): void {

    this.loading = true;

    this._transactionTypeService.deleteTransactionType(this.transactionType._id).subscribe(
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
