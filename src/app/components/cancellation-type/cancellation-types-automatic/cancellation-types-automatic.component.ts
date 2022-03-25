import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';


import { CancellationTypeService } from '../cancellation-type.service';

import { CancellationType } from '../cancellation-type';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Transaction, TransactionState } from 'app/components/transaction/transaction';
import { TransactionService } from 'app/components/transaction/transaction.service';
import { RoundNumberPipe } from 'app/main/pipes/round-number.pipe';
import { MovementOfArticleService } from 'app/components/movement-of-article/movement-of-article.service';
import { MovementOfCashService } from 'app/components/movement-of-cash/movement-of-cash.service';
import { MovementOfArticle, MovementOfArticleStatus } from 'app/components/movement-of-article/movement-of-article';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { TransactionType, TransactionMovement } from 'app/components/transaction-type/transaction-type';
import { ArticleFields } from 'app/components/article-field/article-fields';
import { ArticleFieldType } from 'app/components/article-field/article-field';
import { Taxes } from 'app/components/tax/taxes';
import { Config } from 'app/app.config';
import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';
import { MovementOfCancellationService } from 'app/components/movement-of-cancellation/movement-of-cancellation.service';
import { TaxBase } from 'app/components/tax/tax';
import { ToastrService } from 'ngx-toastr';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import Resulteable from 'app/util/Resulteable';

@Component({
    selector: 'app-cancellation-types-automatic',
    templateUrl: './cancellation-types-automatic.component.html',
    styleUrls: ['./cancellation-types-automatic.component.scss'],
    providers: [NgbAlertConfig, TranslateMePipe]
})

export class CancellationTypeAutomaticComponent implements OnInit {

    @Input() transactionId: string;
    public transaction: Transaction;
    public alertMessage: string = '';
    public userType: string;
    public cancellationTypes: CancellationType[];
    public movementsOfArticles: MovementOfArticle[];
    public movementsOfCashes: MovementOfCash[];
    public orderTerm: string[] = ['-origin'];
    public propertyTerm: string;
    public areFiltersVisible: boolean = false;
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public roundNumber: RoundNumberPipe = new RoundNumberPipe();
    public cancellationTypeSelected: CancellationType;

    constructor(
        public alertConfig: NgbAlertConfig,
        private _cancellationTypeService: CancellationTypeService,
        public _transactionService: TransactionService,
        public _movementOfArticleService: MovementOfArticleService,
        public _movementOfCashService: MovementOfCashService,
        private _router: Router,
        public activeModal: NgbActiveModal,
        private _transactionTypeService: TransactionTypeService,
        private _movementOfCancellationService: MovementOfCancellationService,
        private _toastr: ToastrService,
        public translatePipe: TranslateMePipe,
    ) {
        this.cancellationTypes = new Array();
    }

    ngOnInit() {
        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        if (this.transactionId) {
            this.getTransaction(this.transactionId);
        }
    }

    public async getTransaction(transactionId) {

        this.loading = true;

        this._transactionService.getTransaction(transactionId).subscribe(
            async result => {
                if (!result.transaction) {
                    this.showMessage(result.message, 'danger', false);
                    this.loading = false;
                } else {
                    this.hideMessage();
                    this.transaction = result.transaction;
                    this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);
                    let query = 'where="transaction":"' + this.transaction._id + '"';
                    this.movementsOfArticles = await this.getMovementsOfArticles(query);
                    this.movementsOfCashes = await this.getMovementsOfCashes(query);
                    this.getCancellationTypes();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public getMovementsOfArticles(query: string): Promise<MovementOfArticle[]> {

        return new Promise<MovementOfArticle[]>((resolve, reject) => {

            this.loading = true;

            this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
                result => {
                    this.loading = false;
                    if (!result.movementsOfArticles) {
                        resolve(null);
                    } else {
                        resolve(result.movementsOfArticles);
                    }
                },
                error => {
                    this.loading = false;
                    resolve(null);
                }
            );
        });
    }

    public getMovementsOfCashes(query: string): Promise<MovementOfCash[]> {

        return new Promise<MovementOfCash[]>((resolve, reject) => {

            this.loading = true;

            this._movementOfCashService.getMovementsOfCashes(query).subscribe(
                result => {
                    this.loading = false;
                    if (!result.movementsOfCashes) {
                        resolve(null);
                    } else {
                        resolve(result.movementsOfCashes);
                    }
                },
                error => {
                    this.loading = false;
                    resolve(null);
                }
            );
        });
    }

    public getCancellationTypes(): void {

        this.loading = true;

        this._cancellationTypeService.getCancellationTypes(
            {
                "origin._id": 1,
                "origin.operationType": 1,
                "destination._id": 1,
                "destination.name": 1,
                "destination.operationType": 1,
                operationType: 1,
                requestAutomatic: 1,
                modifyBalance: 1,
                requestCompany: 1,
                requestStatusOrigin: 1,
                stateOrigin: 1,
                updatePrices: 1,
            }, // PROJECT
            {
                "origin._id": { $oid: this.transaction.type._id },
                "requestAutomatic": true,
                "operationType": { "$ne": "D" },
                "destination.operationType": { "$ne": "D" },
                "origin.operationType": { "$ne": "D" }
            }, // MATCH
            {}, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(result => {
            if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
                this.cancellationTypes = result.cancellationTypes;
            }
            this.loading = false;
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            });
    }

    public async finishSelection() {
        try {
            if (!this.cancellationTypeSelected) {
                this.activeModal.close();
            } else {
                // CAMBIAMOS EL TIPO
                let match = {
                    _id: { "$oid": this.cancellationTypeSelected.destination._id }
                }
                let transactionType: TransactionType = await this.getTransactionType(match);
                // CAMBIAMOS DATOS NECESARIO
                let transactionDestination: Transaction = new Transaction();
                transactionDestination = Object.assign(transactionDestination, this.transaction);
                transactionDestination._id = '';
                transactionDestination.type = transactionType;
                transactionDestination.state = TransactionState.Pending;
                transactionDestination.balance = 0;
                transactionDestination.transport = this.transaction.transport;
                transactionDestination.observation = this.transaction.observation;
                transactionDestination.declaredValue = this.transaction.declaredValue;
                transactionDestination.package = this.transaction.package;
                transactionDestination.discountAmount = this.transaction.discountAmount;
                transactionDestination.discountPercent = this.transaction.discountPercent;
                transactionDestination.orderNumber = this.transaction.orderNumber;
                if(this.transaction.table){
                    transactionDestination.table = this.transaction.table;
                }
                transactionDestination.CAE = null;
                transactionDestination.CAEExpirationDate = null;

                if (transactionDestination.type.fixedOrigin && transactionDestination.type.fixedOrigin !== 0) {
                    transactionDestination.origin = transactionDestination.type.fixedOrigin;
                }

                if (transactionDestination.type.fixedLetter && transactionDestination.type.fixedLetter !== '') {
                    transactionDestination.letter = transactionDestination.type.fixedLetter;
                }

                if (!transactionDestination.type.cashBoxImpact) {
                    transactionDestination.cashBox = null;
                }

                // CONSULTAR ULTIMA TRANSACCIÓN PARA ENUMARAR LA SIGUIENTE
                let query = `where= "type":"${transactionDestination.type._id}",
                    "origin":${transactionDestination.origin},
                    "letter":"${transactionDestination.letter}"
                    &sort="number":-1
                    &limit=1`;

                let transactions: Transaction[] = await this.getTransactions(query);

                if (transactions && transactions.length > 0) {
                    transactionDestination.number = transactions[0].number + 1;
                } else {
                    transactionDestination.number = 1;
                }
                transactionDestination = await this.saveTransaction(transactionDestination);
                // SI REQUIERE ARTÍCULOS GUARDAMOS ARTÍCULOS
                if (transactionDestination.type.requestArticles && this.transaction.type.requestArticles) {
                    await this.saveMovementsOfArticles(this.copyMovementsOfArticles(transactionDestination));
                }

                if (transactionDestination.type.requestPaymentMethods && this.transaction.type.requestPaymentMethods) {
                    await this.copyMovementsOfCashes(transactionDestination);
                }

                let movementOfCancellation: MovementOfCancellation = new MovementOfCancellation();
                movementOfCancellation.transactionOrigin = this.transaction;
                movementOfCancellation.transactionDestination = transactionDestination;
                movementOfCancellation.balance = transactionDestination.totalPrice;
                await this.saveMovementOfCancellation(movementOfCancellation);
                this.transaction.state = this.cancellationTypeSelected.stateOrigin;
                if (this.cancellationTypeSelected.modifyBalance) this.transaction.balance = 0;
                this.transaction = await this.updateTransaction(this.transaction);

                this.activeModal.close({ transaction: transactionDestination });
            }
        } catch (error) { this.showToast(error); }
    }

    public updateTransaction(transaction: Transaction): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            this._transactionService.update(this.transaction).subscribe(
                (result: Resulteable) => {
                    if (result.status === 200) {
                        resolve(result.result);
                    } else {
                        this.showToast(result);
                        reject(result);
                    };
                },
                error => {
                    this.showToast(error)
                    reject(error);
                }
            );
        });
    }


    public saveMovementOfCancellation(movementOfCancellation: MovementOfCancellation): Promise<MovementOfCancellation> {
        return new Promise<MovementOfCancellation>((resolve, reject) => {
            this._movementOfCancellationService.saveMovementOfCancellation(movementOfCancellation).subscribe(
                async result => {
                    if (result.movementOfCancellation) {
                        resolve(result.movementOfCancellation);
                    } else reject(result);
                },
                error => reject(error)
            );
        });
    }

    public copyMovementsOfArticles(transaction: Transaction): MovementOfArticle[] {

        let movsOfArts = new Array();
        for (let movOfArt of this.movementsOfArticles) {
            let mov = new MovementOfArticle();
            mov = Object.assign(mov, movOfArt);
            delete mov._id;
            mov.transaction = transaction;
            mov.quantityForStock = 0;
            mov.discountAmount = movOfArt.discountAmount;
            mov.discountRate = movOfArt.discountRate;
            mov.transactionDiscountAmount = movOfArt.transactionDiscountAmount;
            mov.status = MovementOfArticleStatus.Ready;
            mov.stockMovement = transaction.type.stockMovement;
            if (this.transaction.type.requestTaxes && !transaction.type.requestTaxes) {

                mov.costPrice = movOfArt.costPrice;
                mov.salePrice = movOfArt.salePrice;
                let taxes: Taxes[] = new Array();
                if (mov.article && mov.article.taxes && mov.article.taxes.length > 0) {
                    for (let taxAux of mov.article.taxes) {
                        let tax: Taxes = new Taxes();
                        tax.percentage = this.roundNumber.transform(taxAux.percentage);
                        tax.tax = taxAux.tax;
                        if (tax.tax.taxBase == TaxBase.Neto) {
                            tax.taxBase = this.roundNumber.transform(mov.salePrice);
                        }
                        if (tax.percentage === 0) {
                            tax.taxAmount = this.roundNumber.transform(tax.taxAmount * mov.amount);
                        } else {
                            tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
                        }
                        mov.salePrice += tax.taxAmount;
                        taxes.push(tax);
                    }
                }
                mov.taxes = taxes;

                mov.unitPrice = mov.salePrice / mov.amount;
                mov.markupPrice = this.roundNumber.transform(mov.salePrice - mov.costPrice);
                mov.markupPercentage = this.roundNumber.transform((mov.markupPrice / mov.costPrice * 100), 3);
                mov.roundingAmount = movOfArt.roundingAmount;
            } else {
                if (this.transaction.type.requestTaxes && transaction.type.requestTaxes) {
                    mov.taxes = movOfArt.taxes;
                }
                mov.costPrice = movOfArt.costPrice;
                mov.unitPrice = movOfArt.unitPrice;
                mov.markupPercentage = movOfArt.markupPercentage;
                mov.markupPrice = movOfArt.markupPrice;
                mov.salePrice = movOfArt.salePrice;
                mov.roundingAmount = movOfArt.roundingAmount;
            }
            if (transaction.type.transactionMovement === TransactionMovement.Sale) {
                mov = this.recalculateSalePrice(mov, transaction);
            } else {
                mov = this.recalculateCostPrice(mov, transaction);
            }
            movsOfArts.push(mov);
        }
        return movsOfArts;
    }

    public async copyMovementsOfCashes(transaction: Transaction): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
                    for (let movOfCash of this.movementsOfCashes) {
                        let mov = new MovementOfCash();
                        Object.assign(mov, movOfCash);
                        mov.transaction = transaction;
                        await this.updateMovementOfCash(mov);
                    }
                }
                resolve(true);
            } catch (error) { reject(error); }
        });
    }

    public updateMovementOfCash(movementOfCash: MovementOfCash): Promise<MovementOfCash> {
        return new Promise<MovementOfCash>((resolve, reject) => {
            this._movementOfCashService.updateMovementOfCash(movementOfCash).subscribe(
                async result => {
                    if (result.movementOfCash) {
                        resolve(result.movementOfCash);
                    } else reject(result)
                },
                error => reject(error)
            )
        });
    }

    public recalculateCostPrice(movementOfArticle: MovementOfArticle, transaction: Transaction): MovementOfArticle {

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
        if (transaction.type.requestTaxes) {
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
    public recalculateSalePrice(movementOfArticle: MovementOfArticle, transaction: Transaction): MovementOfArticle {

        let quotation = 1;
        if (transaction.quotation) {
            quotation = transaction.quotation;
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

        if (transaction.type.requestTaxes) {
            let taxes: Taxes[] = new Array();
            if (movementOfArticle.article && movementOfArticle.article.taxes && movementOfArticle.article.taxes.length > 0) {
                let impInt: number = 0;
                for (let taxAux of movementOfArticle.article.taxes) {
                    if (taxAux.percentage === 0) {
                        impInt = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount, 4);
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

    public saveMovementsOfArticles(movemenstOfarticles: MovementOfArticle[]): Promise<MovementOfArticle[]> {
        return new Promise((resolve, reject) => {
            this._movementOfArticleService.saveMovementsOfArticles(movemenstOfarticles).subscribe(
                result => {
                    if (result.movementsOfArticles) {
                        resolve(result.movementsOfArticles);
                    } else reject(result)
                },
                error => reject(error)
            );
        });
    }

    public getTransactions(query: string): Promise<Transaction[]> {
        return new Promise<Transaction[]>((resolve, reject) => {
            this._transactionService.getTransactions(query).subscribe(
                result => {
                    if (result.transactions) {
                        resolve(result.transactions);
                    } else reject(result);
                },
                error => reject(error)
            );
        });
    }

    public saveTransaction(transaction: Transaction): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            this._transactionService.save(transaction).subscribe(
                (result: Resulteable) => {
                    if (result.status === 200) {
                        resolve(result.result);
                    } else {
                        this.showToast(result);
                        reject(result);
                    };
                },
                error => {
                    this.showToast(error)
                    reject(error);
                }
            );
        });
    }

    public getTransactionType(match): Promise<TransactionType> {
        return new Promise<TransactionType>((resolve, reject) => {
            match["operationType"] = { "$ne": "D" };
            this._transactionTypeService.getAll({
                project: {
                    _id: 1,
                    fixedOrigin: 1,
                    fixedLetter: 1,
                    cashBoxImpact: 1,
                    requestArticles: 1,
                    stockMovement: 1,
                    requestTaxes: 1,
                    transactionMovement: 1,
                    table : 1,
                    operationType: 1,
                },
                match
            }).subscribe(
                result => {
                    if (result.status == 200 && result.result.length > 0) resolve(result.result[0]);
                    else reject(result)
                },
                error => reject(error)
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

    showToast(result, type?: string, title?: string, message?: string): void {
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
