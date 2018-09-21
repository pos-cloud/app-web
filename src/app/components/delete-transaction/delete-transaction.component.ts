import { Component, OnInit, Input, EventEmitter } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction, TransactionState } from './../../models/transaction';

import { TransactionService } from './../../services/transaction.service';
import { MovementOfArticleService } from '../../services/movement-of-article.service';

@Component({
  selector: "app-delete-transaction",
  templateUrl: "./delete-transaction.component.html",
  styleUrls: ["./delete-transaction.component.css"],
  providers: [NgbAlertConfig]
})
export class DeleteTransactionComponent implements OnInit {
  @Input()
  transaction: Transaction;
  @Input()
  op: string = "cancel";
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _transactionService: TransactionService,
    public _movementOfArticle: MovementOfArticleService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    alertConfig.type = "danger";
    alertConfig.dismissible = true;
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public cancelTransaction(): void {

    this.loading = true;

    this.transaction.state = TransactionState.Canceled;

    this._transactionService.updateTransaction(this.transaction).subscribe(
      result => {
        this.activeModal.close("delete_close");
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public deleteTransaction(): void {

    this.loading = true;

    this._transactionService.deleteTransaction(this.transaction._id).subscribe(
      result => {
        this.activeModal.close("delete_close");
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public showMessage(
    message: string,
    type: string,
    dismissible: boolean
  ): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = "";
  }
}
