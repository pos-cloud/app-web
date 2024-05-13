import { Component, OnInit, Input, ViewEncapsulation, EventEmitter } from '@angular/core';
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { Transaction } from '../transaction'
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { MovementOfArticleService } from '../../movement-of-article/movement-of-article.service'
import { MovementOfArticle } from '../../movement-of-article/movement-of-article'
import { ViewTransactionComponent } from '../../transaction/view-transaction/view-transaction.component'; 
import { DateFormatPipe } from '../../../main/pipes/date-format.pipe'

@Component({
  selector: 'app-select-article-by-transaction',
  templateUrl: './select-article-by-transaction.component.html',
  styleUrls: ['./select-article-by-transaction.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [NgbAlertConfig, TranslateMePipe, DateFormatPipe]
})
export class SelectArticleByTransactionComponent implements OnInit {
  @Input() transactionTypeId: string;
  loading: boolean = false;
  movementOfArticle: MovementOfArticle;
  totalItems: number =  -1;
  amountSelect: number = 0;
  m3Select: number = 0;

  constructor(
    public activeModal: NgbActiveModal,
    public _modalService: NgbModal,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe,
    private _movementOfArticleService: MovementOfArticleService,
  ) { }


   ngOnInit() { 
     this.getArticlesByTransaction(this.transactionTypeId);
  }


  getArticlesByTransaction(transactionTypeId) {
    this.loading = true;
    try {
      this._movementOfArticleService.getMovOfArticleByTransaction(transactionTypeId).subscribe(
        (result) => {
         if(result && result.result && result.result.length > 0){
          this.movementOfArticle = result.result
         }else{
          this.totalItems = 0;
         }
         this.loading = false;
        },
        error => {
          this.showToast(error)
          this.totalItems = 0;
          this.loading = false;
      })
    } catch (error) {
      console.log(error)
    }
  }

  openModal(op: string, transaction: Transaction): void {

    let modalRef;
    switch (op) {
      case 'view':
          modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.transactionId = transaction._id;
          break;
  }
  }

  updateAmount(movemenstOfArticles: MovementOfArticle, inputValue: number){
     if (inputValue > movemenstOfArticles.amount) { 
      this.showToast(null, 'info', null, `la cantidad ingresada no puede ser mayor a la cantidad del articulo (${movemenstOfArticles.amount}).`);

  } 
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
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

