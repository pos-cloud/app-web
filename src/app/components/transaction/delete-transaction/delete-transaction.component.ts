import { Component, Input, EventEmitter } from '@angular/core';
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Transaction } from '../transaction';
import { TransactionService } from '../transaction.service';
import { MovementOfArticleService } from '../../movement-of-article/movement-of-article.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';

@Component({
  selector: "app-delete-transaction",
  templateUrl: "./delete-transaction.component.html",
  styleUrls: ["./delete-transaction.component.css"],
  providers: [NgbAlertConfig, TranslateMePipe]
})
export class DeleteTransactionComponent {

  public transaction: Transaction;
  @Input() transactionId: string;
  public alertMessage: string = "";
  public focusEvent = new EventEmitter<boolean>();
  public loading: boolean = false;

  constructor(
    public _transactionService: TransactionService,
    public _movementOfArticle: MovementOfArticleService,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe
  ) {
    alertConfig.type = "danger";
    alertConfig.dismissible = true;
    this.transaction = new Transaction();
  }

  public ngOnInit(): void {
    if (this.transactionId) {
      this.getTransaction();
    }
  }

  public ngAfterViewInit(): void {
    this.focusEvent.emit(true);
  }

  public getTransaction(): void {

    this.loading = true;

    this._transactionService.getTransaction(this.transactionId).subscribe(
      result => {
        if (!result.transaction) {
          this.showToast(null, 'info', result.message);
        } else {
          this.transaction = result.transaction;
        }
        this.loading = false;
      },
      error => this.showToast(error)
    );
  }

  public deleteTransaction(): void {

    this.loading = true;

    if (!this.transaction.CAE &&
      !this.transaction.SATStamp &&
      !this.transaction.stringSAT &&
      !this.transaction.CFDStamp) {
      this._transactionService.delete(this.transaction._id).subscribe(
        result => {
          this.showToast(result);
          if(result.status === 200) this.activeModal.close("delete_close");
        },
        error => {
          this.showToast(error);
        }
      );
    } else {
      this.showToast(null, 'info', 'No se puede eliminar una transacción electrónica ya validada.');
    }
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 0) {
        type = 'info';
        title = 'el servicio se encuentra en mantenimiento, inténtelo nuevamente en unos minutos';
      } else if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 500) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }
}
