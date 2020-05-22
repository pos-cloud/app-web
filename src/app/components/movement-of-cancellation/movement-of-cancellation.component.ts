import { Component, OnInit, Input, ViewEncapsulation, EventEmitter } from '@angular/core';

import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionMovement, Movements } from '../transaction-type/transaction-type'
import { Transaction, TransactionState } from '../transaction/transaction'

//service
import { CancellationTypeService } from "../cancellation-type/cancellation-type.service"
import { TransactionService } from "../transaction/transaction.service";
import { MovementOfArticleService } from "../movement-of-article/movement-of-article.service"

import { CancellationType } from 'app/components/cancellation-type/cancellation-type';
import { CompanyService } from 'app/components/company/company.service';
import { ViewTransactionComponent } from '../transaction/view-transaction/view-transaction.component';
import { MovementOfArticle } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfCashService } from 'app/components/movement-of-cash/movement-of-cash.service';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { ArticleFields } from 'app/components/article-field/article-fields';
import { ArticleFieldType } from 'app/components/article-field/article-field';
import { Taxes } from 'app/components/tax/taxes';
import { Router } from '@angular/router';
import { TaxBase } from '../tax/tax';
import { MovementOfCancellationService } from 'app/components/movement-of-cancellation/movement-of-cancellation.service';
import { Config } from 'app/app.config';
import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';

@Component({
    selector: 'app-movement-of-cancellation',
    templateUrl: './movement-of-cancellation.component.html',
    styleUrls: ['./movement-of-cancellation.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class MovementOfCancellationComponent implements OnInit {

    @Input() transactionDestinationId: string;
    @Input() transactionDestinationViewId: string;
    @Input() transactionOriginViewId: string;
    @Input() totalPrice: number = 0;
    @Input() selectionView: boolean = false;
    @Input() movementsOfCancellations: MovementOfCancellation[] = new Array();
    public focusEvent = new EventEmitter<boolean>();
    public movArticle: MovementOfArticle[] = new Array();
    public transactionDestination: Transaction;
    public requestCompany: Boolean = false;
    public transactionMovement: TransactionMovement;
    public transactions: Transaction[];
    public cancellationTypes: CancellationType[];
    public alertMessage: string = '';
    public loading: boolean = false;
    public totalItems: number = -1;
    public orderTerm: string[] = ['endDate'];
    public existingCanceled = [];
    public displayedColumns = [
        '_id',
        'endDate',
        'number',
        'letter',
        'state',
        'totalPrice',
        'balance',
        'operationType',
        'type.name',
        'type._id',
        'type.requestArticles',
        'company._id',
        'company.city'
    ];
    public filters: any[];
    public filterValue: string;
    public roundNumber = new RoundNumberPipe();
    public userCountry: string;
    public balanceSelected: number = 0;
    public userType: string;

    constructor(
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _cancellationTypeService: CancellationTypeService,
        public _movementOfCancellation: MovementOfCancellationService,
        public _transactionService: TransactionService,
        public _companyService: CompanyService,
        public _modalService: NgbModal,
        public _movementOfCashService: MovementOfCashService,
        public _movementOfArticleService: MovementOfArticleService,
        public _movementOfCancellationService: MovementOfCancellationService,
        public _router: Router,
    ) {
        this.userCountry = Config.country;
        const pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.filters = new Array();
        for (let field of this.displayedColumns) {
            this.filters[field] = "";
        }
        this.existingCanceled = new Array();
        this.transactions = new Array();
    }

    async ngOnInit() {
        if (this.transactionDestinationViewId || this.transactionOriginViewId) {
            this.getCancellationsOfMovements();
        } else {
            this.transactionDestination = await this.getTransaction(this.transactionDestinationId);
            if (this.transactionDestination) {
                this.getCancellationTypes();
            }
        }
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public getCancellationsOfMovements() {

        this.loading = true;

        let match;
        // FILTRAMOS LA CONSULTA
        if (this.transactionOriginViewId) {
            match = { "transactionOrigin": { $oid: this.transactionOriginViewId }, "operationType": { "$ne": "D" } };
        } else {
            match = { "transactionDestination": { $oid: this.transactionDestinationViewId }, "operationType": { "$ne": "D" } };
        }

        // CAMPOS A TRAER
        let project = {
            "balance": 1,
            "transactionOrigin": 1,
            "transactionDestination": 1,
            "operationType": 1
        };

        this._movementOfCancellation.getMovementsOfCancellations(
            project, // PROJECT
            match, // MATCH
            { order: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(async result => {
            if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
                for (let index = 0; index < result.movementsOfCancellations.length; index++) {
                    let transaction = new Transaction;
                    if (this.transactionOriginViewId) {
                        transaction = await this.getTransaction(result.movementsOfCancellations[index].transactionDestination)
                    } else {
                        transaction = await this.getTransaction(result.movementsOfCancellations[index].transactionOrigin)
                    }
                    if (transaction && transaction.state === TransactionState.Closed) {
                        transaction.balance = this.roundNumber.transform(result.movementsOfCancellations[index].balance);
                        this.transactions.push(transaction);
                    } else {
                        this.totalItems = 0;
                        this.loading = false;
                    }
                }
            } else {
                this.showMessage("No se encontraron transactiones relacionadas", 'danger', false);
                this.totalItems = 0;
                this.loading = false;
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.totalItems = 0;
                this.loading = false;
            });
    }

    public getTransaction(transactionId: string): Promise<Transaction> {

        return new Promise<Transaction>((resolve, reject) => {

            this.loading = true;

            this._transactionService.getTransaction(transactionId).subscribe(
                result => {
                    if (!result.transaction) {
                        this.showMessage(result.message, 'danger', false);
                        this.totalItems = 0;
                        this.loading = false;
                        resolve(null);
                    } else {
                        this.hideMessage();
                        this.loading = false;
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.totalItems = 0;
                    this.loading = false;
                    resolve(null);
                }
            );
        });
    }

    public getCancellationTypes(): void {

        this.loading = true;

        // CAMPOS A TRAER
        let project = {
            "origin._id": 1,
            "origin.type": 1,
            "destination._id": 1,
            "operationType": 1,
            "modifyBalance": 1,
            "requestCompany": 1,
            "stateOrigin": 1
        };

        this._cancellationTypeService.getCancellationTypes(
            project, // PROJECT
            { "destination._id": { $oid: this.transactionDestination.type._id }, "operationType": { "$ne": "D" } }, // MATCH
            {}, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(result => {
            if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
                this.cancellationTypes = result.cancellationTypes;
                this.getTransactions();
            } else {
                this.totalItems = 0;
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.totalItems = 0;
                this.loading = false;
            });
    }

    async getTransactions() {

        this.loading = true;

        /// ORDENAMOS LA CONSULTA
        let sortAux;
        if (this.orderTerm[0].charAt(0) === '-') {
            sortAux = `{ "${this.orderTerm[0].split('-')[1]}" : -1 }`;
        } else {
            sortAux = `{ "${this.orderTerm[0]}" : 1 }`;
        }
        sortAux = JSON.parse(sortAux);

        // FILTRAMOS LA CONSULTA
        let match = `{`;
        for (let i = 0; i < this.displayedColumns.length; i++) {
            let value = this.filters[this.displayedColumns[i]];
            if (value && value != "") {
                match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
                match += ',';
            }
        }

        if (this.cancellationTypes && this.cancellationTypes.length != 0) {

            match += `"$or": [`
            for (let index = 0; index < this.cancellationTypes.length; index++) {
                match += `{ "type._id"  : "${this.cancellationTypes[index].origin._id}"}`;
                if (this.cancellationTypes[index].requestCompany) {
                    this.requestCompany = true;
                }
                if (index < this.cancellationTypes.length) {
                    match += ','
                }
            }

            match = match.slice(0, -1);

            match += `],`
        } else {
            match += `{ "type._id"  : "${this.cancellationTypes[0].origin._id}"}`
            if (this.cancellationTypes[0].requestCompany) {
                this.requestCompany = true;
            }
        }

        if (this.requestCompany) {
            match += `"company._id":  "${this.transactionDestination.company._id}",`
        }

        match += `"$or":[{"state": "Cerrado"},{"state":"Enviado"}],`

        match += `"operationType": { "$ne": "D" }, "balance": { "$gt": 0 } }`;

        match = JSON.parse(match);

        let timezone = "-03:00";
        if (Config.timezone && Config.timezone !== '') {
            timezone = Config.timezone.split('UTC')[1];
        }

        // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
        let project = {
            _id: 1,
            endDate: { $dateToString: { date: '$endDate', format: '%d/%m/%Y', timezone: timezone } },
            number: { $toString: '$number' },
            letter: 1,
            state: 1,
            totalPrice: 1,
            balance: 1,
            balanceSelected: '$balance',
            operationType: 1,
            'company._id': { $toString: '$company._id' },
            'company.city': 1,
            'type._id': { $toString: '$type._id' },
            'type.name': 1,
            'type.requestArticles': 1,
            'type.movement': 1,
        };

        // AGRUPAMOS EL RESULTADO
        let group = {
            _id: null,
            count: { $sum: 1 },
            transactions: { $push: "$$ROOT" }
        };

        this._transactionService.getTransactionsV2(
            project, // PROJECT
            match, // MATCH
            sortAux, // SORT
            group, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(
            async result => {
                this.loading = false;
                if (result && result.length > 0 && result[0].transactions) {
                    this.transactions = result[0].transactions;
                    this.totalItems = result[0].count;
                    if (this.transactions.length > 0) {
                        if (this.totalPrice > 0 && this.balanceSelected === 0) {
                            if (!this.movementsOfCancellations || this.movementsOfCancellations.length === 0) {
                                await this.getMovementsOfCancellations().then(
                                    movementsOfCancellations => {
                                        this.movementsOfCancellations = movementsOfCancellations;
                                        if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
                                            for (let mov of this.movementsOfCancellations) {
                                                mov['saved'] = true;
                                            }
                                        }
                                    }
                                );
                            }

                            if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
                                for (let transaction of this.transactions) {
                                    for (let mov of this.movementsOfCancellations) {
                                        if (mov.transactionOrigin._id === transaction._id) {
                                            transaction['balanceSelected'] = this.roundNumber.transform(mov.balance);
                                        }
                                    }
                                }
                                this.recalculateBalanceSelected();
                            } else {
                                this.movementsOfCancellations = new Array();
                                this.selectAutomatically();
                            }
                        } else if (this.totalPrice === 0 && this.balanceSelected === 0) {
                            this.movementsOfCancellations = new Array();
                            this.selectAutomatically();
                        }
                    }
                } else {
                    this.transactions = new Array();
                    this.totalItems = 0;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
                this.totalItems = 0;
            }
        );
    }

    public getMovementsOfCancellations(): Promise<MovementOfCancellation[]> {

        return new Promise<MovementOfCancellation[]>((resolve, reject) => {

            // CAMPOS A TRAER
            let project = {
                "_id": 0,
                "transactionOrigin._id": 1,
                "transactionDestination._id": 1,
                "balance": 1,
                "operationType": 1,
                'transactionOrigin.type.name': 1,
                'transactionOrigin.type.movement': 1,
                'transactionOrigin.type.transactionMovement': 1,
                'transactionOrigin.number': 1,
                'transactionOrigin.operationType': 1,
                'transactionOrigin.balance': 1
            };

            this._movementOfCancellationService.getMovementsOfCancellations(
                project, // PROJECT
                { "transactionDestination._id": { $oid: this.transactionDestination._id }, "operationType": { "$ne": "D" }, "transactionOrigin.operationType": { "$ne": "D" } }, // MATCH
                {}, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(result => {
                if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
                    resolve(result.movementsOfCancellations);
                } else {
                    resolve(null);
                }
            },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                });
        });
    }

    async selectAutomatically() {

        if (this.totalPrice > 0) {
            for (let transaction of this.transactions) {
                if (this.totalPrice > this.balanceSelected) {
                    await this.selectTransaction(transaction, true);
                    this.recalculateBalanceSelected();
                }
            }
        } else if (this.totalPrice === 0) {
            for (let transaction of this.transactions) {
                await this.selectTransaction(transaction, true);
                this.recalculateBalanceSelected();
            }
        }
    }

    public orderBy(term: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = "-" + term;
        } else {
            this.orderTerm[0] = term;
        }

        this.getTransactions();
    }

    public openModal(op: string, transaction: Transaction): void {

        let modalRef;
        switch (op) {
            case 'view':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = transaction._id;
                break;
        }
    }

    async selectTransaction(transactionSelected: Transaction, automatic: boolean = false) {

        transactionSelected = await this.getTransaction(transactionSelected._id);

        if (this.isTransactionSelected(transactionSelected)) {
            if (!automatic) this.deleteTransactionSelected(transactionSelected);
        } else {
            let movementOfCancellation = new MovementOfCancellation();
            movementOfCancellation.transactionOrigin = transactionSelected;
            movementOfCancellation.transactionDestination = this.transactionDestination;
            if (this.modifyBalance(transactionSelected)) {
                let transBalance = 0;
                if ((transactionSelected.type.transactionMovement === TransactionMovement.Sale &&
                    transactionSelected.type.movement === Movements.Outflows) ||
                    (transactionSelected.type.transactionMovement === TransactionMovement.Purchase &&
                        transactionSelected.type.movement === Movements.Inflows)) {
                    transBalance = transactionSelected.balance * -1;
                } else {
                    if (transactionSelected.balance > this.totalPrice && this.totalPrice !== 0) {
                        transBalance = this.totalPrice;
                    } else {
                        transBalance = transactionSelected.balance;
                    }
                }
                if (automatic && (this.totalPrice < ((transBalance) + this.balanceSelected))) {
                    if (this.totalPrice === 0) {
                        movementOfCancellation.balance = this.roundNumber.transform(transBalance);
                    } else {
                        movementOfCancellation.balance = this.roundNumber.transform(this.totalPrice - this.balanceSelected);
                    }
                } else {
                    movementOfCancellation.balance = this.roundNumber.transform(transBalance);
                }
            } else {
                movementOfCancellation.balance = 0;
            }
            for (let t of this.transactions) {
                if (t._id.toString() == transactionSelected._id.toString()) {
                    t['balanceSelected'] = this.roundNumber.transform(movementOfCancellation.balance);
                }
            }
            this.movementsOfCancellations.push(movementOfCancellation);
        }
        this.recalculateBalanceSelected();
    }

    public recalculateBalanceSelected(): void {
        this.balanceSelected = 0;
        for (let mov of this.movementsOfCancellations) {
            if (!this.isMovementClosed(mov.transactionOrigin)) {
                this.balanceSelected += this.roundNumber.transform(mov.balance);
            }
        }
        this.roundNumber.transform(this.balanceSelected);
    }

    private isMovementClosed(transaction: Transaction): boolean {

        let closed: boolean = true;

        for (let trans of this.transactions) {
            if (trans._id.toString() === transaction._id.toString()) {
                closed = false;
            }
        }

        return closed;
    }

    public modifyBalance(transaction: Transaction) {

        let modify: boolean = false;

        for (let canc of this.cancellationTypes) {
            if (canc.origin._id.toString() === transaction.type._id) {
                modify = canc.modifyBalance;
            }
        }

        return modify;
    }

    public deleteAllMovements(): void {
        for (let trans of this.transactions) {
            this.deleteTransactionSelected(trans);
        }
        this.recalculateBalanceSelected();
    }

    public deleteTransactionSelected(transaction: Transaction): void {

        let movementToDelete: number;

        for (let i = 0; i < this.movementsOfCancellations.length; i++) {
            if (this.movementsOfCancellations[i].transactionOrigin._id.toString() === transaction._id.toString()) {
                movementToDelete = i;
            }
        }
        if (movementToDelete !== undefined) {
            this.movementsOfCancellations.splice(movementToDelete, 1);
        }
    }

    public isTransactionSelected(transaction: Transaction) {

        let isSelected: boolean = false;

        if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
            for (let mov of this.movementsOfCancellations) {
                if (mov.transactionOrigin._id.toString() === transaction._id.toString()) {
                    isSelected = true;
                }
            }
        }

        return isSelected;
    }

    async finish() {

        let endedProcess = true;

        if (this.balanceSelected >= 0) {
            if (this.movementsOfCancellations.length > 0) {
                for (let mov of this.movementsOfCancellations) {
                    if ((mov.balance <= mov.transactionOrigin.balance) || !this.modifyBalance(mov.transactionOrigin)) {
                        for (const type of this.cancellationTypes) {
                            if (type.origin._id === mov.transactionOrigin.type._id) {
                                await this.updateTransaction(mov.transactionOrigin, type.stateOrigin);
                            }
                        }
                        if (mov.transactionDestination.type && mov.transactionDestination.type.requestArticles) {
                            await this.getMovementOfArticles(mov.transactionOrigin).then(
                                async movementsOfArticles => {
                                    if (movementsOfArticles && movementsOfArticles.length > 0) {
                                        for (let mov2 of movementsOfArticles) {
                                            //le mandas el mov a la fun
                                            let movement = this.existsMovementOfArticle(mov2);
                                            if (!movement) {
                                                if (!this.movArticle) this.movArticle = new Array();
                                                this.movArticle.push(mov2);
                                            } else {
                                                // recalculo
                                                movement.amount += mov2.amount;
                                                movement.unitPrice += mov2.unitPrice;
                                                movement = await this.recalculateMovArticle(movement, mov.transactionOrigin);
                                            }
                                        }
                                    }
                                }
                            );
                        }
                    } else {
                        endedProcess = false;
                        this.showMessage("El saldo ingresado en la transacción " + mov.transactionOrigin.type.name + " " + mov.transactionOrigin.number + " no puede ser mayor que el saldo restante de la misma.", "info", true);
                    }
                }
                //guardo todos los mov agrupados
                if (this.movArticle && this.movArticle.length !== 0) {
                    await this.saveMovementsOfArticles(this.movArticle).then(
                        movementsOfArticlesSaved => {
                            if (movementsOfArticlesSaved && movementsOfArticlesSaved.length > 0) {
                                endedProcess = true;
                            } else {
                                endedProcess = false;
                            }
                        }
                    );
                }
                if (endedProcess) {
                    this.closeModal();
                }
            } else {
                this.closeModal();
            }
        } else {
            endedProcess = false;
            this.showMessage("El saldo seleccionado debe ser mayor o igual a 0.", "info", true);
        }
    }

    public existsMovementOfArticle(movementOfArticle: MovementOfArticle): MovementOfArticle {
        let movement: MovementOfArticle;
        if (this.movArticle && this.movArticle.length > 0) {
            for (let mov of this.movArticle) {
                if (mov.article._id === movementOfArticle.article._id && mov.salePrice === movementOfArticle.salePrice) movement = mov;
            }
        }
        return movement;
    }

    public updateTransaction(transaction: Transaction, status: TransactionState): Promise<Transaction> {

        return new Promise<Transaction>((resolve, reject) => {

            this.loading = true;

            transaction.state = status;

            this._transactionService.updateTransaction(transaction).subscribe(
                result => {
                    this.loading = false;
                    if (!result.transaction) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.loading = false;
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public getMovementOfArticles(transaction: Transaction): Promise<MovementOfArticle[]> {

        return new Promise((resolve, reject) => {

            let query = 'where="transaction":"' + transaction._id + '"';

            this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
                async result => {
                    if (!result.movementsOfArticles) {
                        resolve(null);
                    } else {
                        let movements: MovementOfArticle[] = new Array();
                        for (let mov of result.movementsOfArticles) {

                            let movementOfArticle = await this.recalculateMovArticle(mov, transaction);

                            movements.push(movementOfArticle);
                        }

                        resolve(movements);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public recalculateMovArticle(mov: MovementOfArticle, transaction: Transaction): MovementOfArticle {


        let movementOfArticle = new MovementOfArticle();

        movementOfArticle.code = mov.code;
        movementOfArticle.codeSAT = mov.codeSAT;
        movementOfArticle.description = mov.description;
        movementOfArticle.observation = mov.observation;
        movementOfArticle.otherFields = mov.otherFields;
        if (mov.make && mov.make._id && mov.make._id !== "") {
            movementOfArticle.make._id = mov.make._id;
        } else {
            movementOfArticle.make = mov.make;
        }
        movementOfArticle.category = mov.category;
        /*if (mov.category && mov.category._id && mov.category._id !== "") {
        } else {
            movementOfArticle.category = mov.category;
        }*/

        movementOfArticle.costPrice = mov.costPrice;
        movementOfArticle.salePrice = mov.salePrice;
        let taxes: Taxes[] = new Array();
        if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
            for (let taxAux of movementOfArticle.article.taxes) {
                let tax: Taxes = new Taxes();
                tax.percentage = this.roundNumber.transform(taxAux.percentage);
                tax.tax = taxAux.tax;
                if (tax.tax.taxBase == TaxBase.Neto) {
                    tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice);
                }
                if (tax.percentage === 0) {
                    tax.taxAmount = this.roundNumber.transform(tax.taxAmount * movementOfArticle.amount);
                } else {
                    tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
                }
                movementOfArticle.salePrice += tax.taxAmount;
                taxes.push(tax);
            }
        }
        movementOfArticle.taxes = taxes;

        movementOfArticle.unitPrice = movementOfArticle.salePrice / movementOfArticle.amount;
        movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
        movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);
        movementOfArticle.roundingAmount = mov.roundingAmount;
        if (this.transactionDestination.type.requestTaxes && transaction.type.requestTaxes) {
            movementOfArticle.taxes = mov.taxes;
        } else {
            movementOfArticle.costPrice = mov.costPrice;
            movementOfArticle.unitPrice = mov.unitPrice;
            movementOfArticle.markupPercentage = mov.markupPercentage;
            movementOfArticle.markupPrice = mov.markupPrice;
            movementOfArticle.salePrice = mov.salePrice;
            movementOfArticle.roundingAmount = mov.roundingAmount;
        }
        if (this.transactionDestination.type.transactionMovement === TransactionMovement.Sale) {
            movementOfArticle = this.recalculateSalePrice(movementOfArticle);
        } else {
            movementOfArticle = this.recalculateCostPrice(movementOfArticle);
        }


        return movementOfArticle
    }

    public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

        let quotation = 1;

        if (this.transactionDestination.quotation) {
            quotation = movementOfArticle.transaction.quotation;
        }

        // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
        movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
        movementOfArticle.markupPrice = 0.00;
        movementOfArticle.markupPercentage = 0.00;

        let taxedAmount = movementOfArticle.basePrice;
        movementOfArticle.costPrice = 0;

        let fields: ArticleFields[] = new Array();
        if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
            for (const field of movementOfArticle.otherFields) {
                if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
                    if (field.articleField.datatype === ArticleFieldType.Percentage) {
                        field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
                    } else if (field.articleField.datatype === ArticleFieldType.Number) {
                        field.amount = parseFloat(field.value);
                    }
                    if (field.articleField.modifyVAT) {
                        taxedAmount += field.amount;
                    } else {
                        movementOfArticle.costPrice += field.amount;
                    }
                }
                fields.push(field);
            }
        }
        movementOfArticle.otherFields = fields;
        if (this.transactionDestination.type.requestTaxes) {
            if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
                let taxes: Taxes[] = new Array();
                for (let articleTax of movementOfArticle.taxes) {
                    if (articleTax.tax.taxBase === TaxBase.Neto) {
                        articleTax.taxBase = taxedAmount;
                    } else {
                        articleTax.taxBase = 0;
                    }
                    if (articleTax.percentage === 0) {
                        for (let artTax of movementOfArticle.article.taxes) {
                            if (artTax.tax._id === articleTax.tax._id) {
                                articleTax.taxAmount = this.roundNumber.transform(artTax.taxAmount * movementOfArticle.amount);
                            }
                        }
                    } else {
                        articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
                    }
                    taxes.push(articleTax);
                    movementOfArticle.costPrice += articleTax.taxAmount;
                }
                movementOfArticle.taxes = taxes;
            }
        }
        movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
        movementOfArticle.salePrice = movementOfArticle.costPrice + movementOfArticle.roundingAmount;

        return movementOfArticle;
    }

    // EL IMPUESTO VA SOBRE EL ARTICULO Y NO SOBRE EL MOVIMIENTO
    public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

        let quotation = 1;
        if (this.transactionDestination.quotation) {
            quotation = this.transactionDestination.quotation;
        }

        if (movementOfArticle.article) {

            movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);

            if (movementOfArticle.article.currency &&
                Config.currency &&
                Config.currency._id !== movementOfArticle.article.currency._id) {
                movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
            }
        }

        let fields: ArticleFields[] = new Array();
        if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
            for (const field of movementOfArticle.otherFields) {
                if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
                    if (field.articleField.datatype === ArticleFieldType.Percentage) {
                        field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
                    } else if (field.articleField.datatype === ArticleFieldType.Number) {
                        field.amount = parseFloat(field.value);
                    }
                }
                fields.push(field);
            }
        }
        movementOfArticle.otherFields = fields;

        if (movementOfArticle.article) {
            movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);

            if (movementOfArticle.article.currency &&
                Config.currency &&
                Config.currency._id !== movementOfArticle.article.currency._id) {
                movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
            }
        }

        // ADVERTENCIA, EL UNIT PRICE NO SE RECALCULA CON EL DESCUENTO DE LA transaction PARA QUE EL DESCUENTO DE LA transaction CANCELADA PASE A LA transaction CANCELATORIA
        movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
        movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
        movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);

        if (this.transactionDestination.type.requestTaxes) {
            let taxes: Taxes[] = new Array();
            if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
                let impInt: number = 0;
                for (let taxAux of movementOfArticle.article.taxes) {
                    if (taxAux.percentage === 0) {
                        impInt = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount);
                    }
                }
                for (let taxAux of movementOfArticle.article.taxes) {
                    let tax: Taxes = new Taxes();
                    tax.percentage = this.roundNumber.transform(taxAux.percentage);
                    tax.tax = taxAux.tax;
                    if (tax.percentage === 0) {
                        tax.taxAmount = impInt;
                        tax.taxBase = 0;
                    } else {
                        tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice - impInt) / ((tax.percentage / 100) + 1), 4);
                        tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100), 4);
                    }
                    taxes.push(tax);
                }
            }
            movementOfArticle.taxes = taxes;
        }

        return movementOfArticle;
    }

    public refresh(): void {
        this.getCancellationTypes();
    }

    public closeModal(): void {
        if (this.areValidMovements()) {
            this.activeModal.close(
                {
                    movementsOfCancellations: this.movementsOfCancellations
                }
            );
        }
    }

    public areValidMovements(): boolean {
        let areValid: boolean = true;
        let totalBalance = 0;
        for (let mov of this.movementsOfCancellations) {
            if (!mov['saved']) totalBalance += this.roundNumber.transform(mov.balance);
        }
        if (this.totalPrice !== 0 && this.totalPrice < this.roundNumber.transform(totalBalance)) {
            areValid = false;
            this.showMessage("El saldo seleccionado de las transacciones no puede ser distinto del monto de la transacción ($ " + this.totalPrice + ")", "info", true);
        }
        return areValid;
    }

    public updateBalanceOrigin(transaction: Transaction): void {

        if (transaction['balanceSelected'] <= transaction.balance) {
            for (let mov of this.movementsOfCancellations) {
                if (mov.transactionOrigin._id.toString() === transaction._id.toString()) {
                    mov.balance = this.roundNumber.transform(transaction['balanceSelected']);
                }
            }
            this.recalculateBalanceSelected();
        } else {
            this.showMessage(`El saldo ingresado no puede ser mayor al saldo de la transacción (${transaction.balance}).`, 'info', true);
            transaction['balanceSelected'] = this.roundNumber.transform(transaction.balance);
        }
    }

    public saveMovementsOfArticles(movemenstOfarticles: MovementOfArticle[]): Promise<MovementOfArticle[]> {

        return new Promise((resolve, reject) => {

            this._movementOfArticleService.saveMovementsOfArticles(movemenstOfarticles).subscribe(
                result => {
                    if (!result.movementsOfArticles) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.movementsOfArticles);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
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
