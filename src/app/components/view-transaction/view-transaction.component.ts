import { Component, OnInit, Input } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { MovementOfCash } from './../../models/movement-of-cash';

import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { MovementOfCashService } from './../../services/movement-of-cash.service';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.css'],
  providers: [NgbAlertConfig]
})
export class ViewTransactionComponent implements OnInit {
  @Input()
  transaction: Transaction;
  public alertMessage = '';
  public loading = false;
  public movementsOfArticles: MovementOfArticle[];
  public areMovementsOfArticlesEmpty = true;
  public movementsOfCashes: MovementOfCash[];
  public areMovementsOfCashesEmpty = true;

  constructor(
    public _transactionService: TransactionService,
    public _movementOfArticleService: MovementOfArticleService,
    public _movementOfCashService: MovementOfCashService,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.movementsOfArticles = new Array();
    this.movementsOfCashes = new Array();
    this.getTransaction(this.transaction._id);
  }

  public getTransaction(transactionId): void {

    this.loading = true;

    this._transactionService.getTransaction(transactionId).subscribe(
      result => {
        if (!result.transaction) {
          this.showMessage(result.message, 'danger', false);
          this.loading = false;
        } else {
          this.hideMessage();
          this.transaction = result.transaction;
          this.getMovementsOfArticlesByTransaction();
          this.getMovementsOfCashesByTransaction();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getMovementsOfArticlesByTransaction(): void {
    this.loading = true;

    this._movementOfArticleService
      .getMovementsOfTransaction(this.transaction._id)
      .subscribe(
        result => {
          if (!result.movementsOfArticles) {
            this.areMovementsOfArticlesEmpty = true;
            this.movementsOfArticles = new Array();
          } else {
            this.areMovementsOfArticlesEmpty = false;
            this.movementsOfArticles = result.movementsOfArticles;
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  public getMovementsOfCashesByTransaction(): void {
    this.loading = true;

    this._movementOfCashService
      .getMovementOfCashesByTransaction(this.transaction._id)
      .subscribe(
        result => {
          if (!result.movementsOfCashes) {
            this.areMovementsOfCashesEmpty = true;
            this.movementsOfCashes = new Array();
          } else {
            this.areMovementsOfCashesEmpty = false;
            this.movementsOfCashes = result.movementsOfCashes;
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
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
    this.alertMessage = '';
  }
}
