import { Component, OnInit, Input } from '@angular/core';

import { Transaction, TransactionState } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { Turn, TurnState } from './../../models/turn';
import { Config } from './../../app.config';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { TurnService } from './../../services/turn.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.css']
})
export class PrintComponent implements OnInit {

  @Input() transaction: Transaction;
  @Input() movementsOfArticles: MovementOfArticle[];
  @Input() turn: Turn;
  @Input() typePrint;
  public loading: boolean;
  public alertMessage: string = "";
  public shiftClosingTransaction;
  public shiftClosingMovementOfArticle;
  public shiftClosingMovementOfCash;
  public companyName: string = Config.companyName;

  constructor(
    public _turnService: TurnService,
    public alertConfig: NgbAlertConfig,
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    console.log(this.companyName);
    console.log(Config.companyName);
    if(this.typePrint === "turn") {
      this.shiftClosingTransaction = new Array();
      this.shiftClosingMovementOfArticle = new Array();
      this.shiftClosingMovementOfCash = new Array();
      this.getShiftClosingByTransaccion();
      this.getShiftClosingByMovementOfArticle();
      this.getShiftClosingByMovementOfCash();
    }
  }

  public getShiftClosingByTransaccion(): void {

    this.loading = true;

    this._turnService.getShiftClosingByTransaccion(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingTransaction = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfArticle(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfArticle(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfArticle = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getShiftClosingByMovementOfCash(): void {

    this.loading = true;

    this._turnService.getShiftClosingByMovementOfCash(this.turn._id).subscribe(
      result => {
        if (!result.shiftClosing) {
          this.showMessage(result.message, "info", true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.shiftClosingMovementOfCash = result.shiftClosing;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}
