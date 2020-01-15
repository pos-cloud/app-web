import { Component, OnInit, Input } from '@angular/core';

import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Transaction } from './../../models/transaction';
import { MovementOfArticle } from './../../models/movement-of-article';
import { MovementOfCash } from './../../models/movement-of-cash';

import { MovementOfArticleService } from './../../services/movement-of-article.service';
import { MovementOfCashService } from './../../services/movement-of-cash.service';
import { TransactionService } from '../../services/transaction.service';

import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { Config } from 'app/app.config';
import { UserService } from 'app/services/user.service';
import { Article } from 'app/models/article';
import { AddArticleComponent } from '../add-article/add-article.component';
import { AddCompanyComponent } from '../add-company/add-company.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-view-transaction',
    templateUrl: './view-transaction.component.html',
    styleUrls: ['./view-transaction.component.css'],
    providers: [NgbAlertConfig]
})

export class ViewTransactionComponent implements OnInit {

    @Input() transactionId: string;
    public transaction: Transaction;
    public alertMessage = '';
    public loading = false;
    public movementsOfArticles: MovementOfArticle[];
    public areMovementsOfArticlesEmpty = true;
    public movementsOfCashes: MovementOfCash[];
    public areMovementsOfCashesEmpty = true;
    public roundNumber = new RoundNumberPipe();
    public orderTerm: string[] = ['expirationDate'];
    public currencyValue: []
    public showDetails = false;
    public propertyTerm: string;
    public userCountry: string = 'AR';
    public orientation: string = 'horizontal';
    private subscription: Subscription = new Subscription();

    constructor(
        public _transactionService: TransactionService,
        public _movementOfArticleService: MovementOfArticleService,
        public _movementOfCashService: MovementOfCashService,
        public alertConfig: NgbAlertConfig,
        public activeModal: NgbActiveModal,
        public _userService: UserService,
        private _modalService: NgbModal,
    ) {
        if (window.screen.width < 1000) this.orientation = 'vertical';
    }

    ngOnInit() {
        this.userCountry = Config.country;
        this.movementsOfArticles = new Array();
        this.movementsOfCashes = new Array();
        this.transaction = new Transaction();
        this.getTransaction(this.transactionId);
    }

    public getTransaction(transactionId): void {

        this.loading = true;

        this.subscription.add(this._transactionService.getTransaction(transactionId).subscribe(
            result => {
                if (!result.transaction) {
                    this.showMessage(result.message, 'danger', false);
                    this.loading = false;
                } else {
                    this.hideMessage();
                    this.transaction = result.transaction;
                    this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);
                    this.getMovementsOfArticlesByTransaction();
                    this.getMovementsOfCashesByTransaction();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        ));
    }

    public getMovementsOfArticlesByTransaction(): void {

        this.loading = true;

        let query = 'where="transaction":"' + this.transaction._id + '"';

        this.subscription.add(this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
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
        ));
    }

    public getMovementsOfCashesByTransaction(): void {

        this.loading = true;

        let query = 'where="transaction":"' + this.transaction._id + '"';

        this.subscription.add(this._movementOfCashService.getMovementsOfCashes(query).subscribe(
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
        ));
    }

    public updateBalance(): void {

        this.loading = true;

        this.subscription.add(this._transactionService.updateBalance(this.transaction).subscribe(
            async result => {
                if (!result.transaction) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                    this.loading = false;
                } else {
                    this.transaction.balance = result.transaction.balance;
                    this.showMessage("Saldo actualizado", "success", false);
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        ));
    }

    async openModal(op: string, article?: Article) {

        let modalRef;
        switch (op) {
            case 'view-article':
                modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.articleId = article._id;
                modalRef.componentInstance.readonly = true;
                modalRef.componentInstance.operation = "view";
                break;
            case 'view-company':
                modalRef = this._modalService.open(AddCompanyComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.companyId = this.transaction.company._id;
                modalRef.componentInstance.readonly = true;
                modalRef.componentInstance.operation = 'view';
                break;
            default:
                break;
        }
    }

    public orderBy(term: string, property?: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = "-" + term;
        } else {
            this.orderTerm[0] = term;
        }
        this.propertyTerm = property;
    }

    public pushCurrencyValue(e): void {
        this.currencyValue = e['currencyValues']
        this.showDetails = !this.showDetails
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
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
