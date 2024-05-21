import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { Transaction, TransactionState } from '../../transaction/transaction';
import { TransactionService } from '../../transaction/transaction.service';
import { TransactionMovement } from '../../transaction-type/transaction-type';
import { User } from '../../../components/user/user';
import { Subscription } from 'rxjs';
import { TranslateMePipe } from '../../../main/pipes/translate-me';
import { ViewTransactionComponent } from '../../transaction/view-transaction/view-transaction.component';
import { Router } from '@angular/router';
import { Printer, PrinterPrintIn } from '../../printer/printer';
import { PrintTransactionTypeComponent } from '../../print/print-transaction-type/print-transaction-type.component';
import { PrintComponent } from '../../print/print/print.component';
import Resulteable from '../../../util/Resulteable';
import { PrinterService } from '../../printer/printer.service';
import { AddTransactionComponent } from '../../transaction/add-transaction/add-transaction.component';
import { DeleteTransactionComponent } from '../../transaction/delete-transaction/delete-transaction.component';
import { ConfigService } from '../../config/config.service';
import { Config } from '../../../app.config';
import { CancelComponent } from '../../tiendaNube/cancel/cancel.component';
import { FulfilledComponent } from '../../tiendaNube/fulfilled/fulfilled.component';
import {MovementOfArticle} from '../../movement-of-article/movement-of-article';
import {MovementOfArticleService} from '../../movement-of-article/movement-of-article.service';
import {MovementOfCash} from '../../movement-of-cash/movement-of-cash';
import {MovementOfCashService} from '../../movement-of-cash/movement-of-cash.service';
import { DateFromToComponent } from '../../tiendaNube/date-from-to/date-from-to.component'

@Component({
    selector: 'app-web-transactions',
    templateUrl: './web-transactions.component.html',
    styleUrls: ['./web-transactions.component.css'],
    providers: [NgbAlertConfig, TranslateMePipe],
    encapsulation: ViewEncapsulation.None
})

export class WebTransactionsComponent implements OnInit {
    public loading: boolean = false;
    public transactions: Transaction[] = new Array();
    public transaction: Transaction;
    public alertMessage: string = '';
    public transactionMovement: TransactionMovement = TransactionMovement.Sale;
    public posType: string;
    public user: User;
    private subscription: Subscription = new Subscription();
    public orderTerm: string[] = ['startDate'];
    public propertyTerm: string;
    public itemsPerPage = 10;
    public transactionStates: string[];
    public validTransactionStates: string[] = [
        TransactionState.Delivered.toString(),
        TransactionState.Open.toString(),
        TransactionState.Pending.toString(),
        TransactionState.Sent.toString(),
        TransactionState.Preparing.toString(),
        TransactionState.Packing.toString(),
        TransactionState.Outstanding.toString(),
        TransactionState.PaymentDeclined.toString(),
        TransactionState.PaymentConfirmed.toString()
    ];
    public printers: Printer[];
    public config: Config;
    movementsOfArticles: MovementOfArticle[]
    movementsOfCashes: MovementOfCash[];

    public filterEndDate;
    public filterType;
    public filterNumber;
    public filterCompany;
    public filterOrderNumber;
    public filterState;
    filterBalance;
    filterObservation;
    filterTotalPrice;
    p;

    constructor(
        public alertConfig: NgbAlertConfig,
        private _transactionService: TransactionService,
        private _modalService: NgbModal,
        private _router: Router,
        private _printerService: PrinterService,
        private _configService: ConfigService,
        public _movementOfArticleService: MovementOfArticleService,
        public _movementOfCashService: MovementOfCashService,
    ) { }

    async ngOnInit() {
        this.getTransactionsV2()
        let pathLocation: string[] = this._router.url.split('/');
        this.posType = pathLocation[2].split('?')[0];

        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
            }
        );
    }

    refresh() {
        this.getTransactionsV2()
    }

    public getTransactionsV2(): Promise<Transaction[]> {
        return new Promise<Transaction[]>((resolve, reject) => {

            this.loading = true;

            let project = {
                _id: 1,
                startDate: 1,
                endDate: 1,
                origin: 1,
                number: 1,
                orderNumber: 1,
                observation: 1,
                totalPrice: 1,
                balance: 1,
                state: 1,
                madein: 1,
                operationType: 1,
                taxes: 1,
                CAE: 1,
                creationUser: 1,
                tiendaNubeId: 1,
                "company.name": 1,
                "type._id": 1,
                "type.allowEdit": 1,
                "type.name": 1,
                "type.level": 1,
                "type.transactionMovement": 1,
                "type.electronics": 1,
                "type.paymentMethods": 1,
                "branchOrigin": 1,
                "deliveryAddress.name": 1,
                "deliveryAddress.number": 1,
                "deliveryAddress.floor": 1,
                "deliveryAddress.flat": 1,
                "deliveryAddress.city": 1,
                "deliveryAddress.state": 1,
                "deliveryAddress.observation": 1,
                "deliveryAddress.shippingStatus":1,
                "shipmentMethod.name": 1,
                "paymentMethodEcommerce": 1
            }
            let match = {
                state: { $nin: [TransactionState.Canceled] },
                madein: { $in: ['pedidos-web', 'mercadolibre', 'woocommerce', 'tiendanube'] },
                operationType: { $ne: 'D' },
                "type.transactionMovement": this.transactionMovement,
            }

            if (this.transactionMovement !== TransactionMovement.Stock) {
                project["company._id"] = 1;
                project["company.name"] = 1;
            }

            if (this.transactionMovement === TransactionMovement.Sale) {
                project["employeeClosing._id"] = 1;
                project["employeeClosing.name"] = 1;
            }

            let sort: {} = { startDate: -1 };

            if (this.posType === 'pedidos-web' || this.posType === 'mercadolibre' || this.posType === 'woocommerce' || this.posType === 'carritos-abandonados') {
                sort = { orderNumber: -1 };
                this.orderTerm = ['-orderNumber'];
            }

            if (this.user && this.user.permission && this.user.permission.transactionTypes && this.user.permission.transactionTypes.length > 0) {
                let transactionTypes = [];
                this.user.permission.transactionTypes.forEach(element => {
                    transactionTypes.push({ "$oid": element });
                });
                match['type._id'] = { "$in": transactionTypes }
            }

            this.subscription.add(this._transactionService.getTransactionsV2(
                project, // PROJECT
                match, // MATCH
                sort, // SORT
                {}, // GROUP
                0, // LIMIT
                0 // SKIP
            ).subscribe(
                result => {
                    this.loading = false;
                    this.hideMessage();
                    this.transactions = result.transactions
                    resolve(result.transactions);
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                    resolve(new Array());
                }
            ));
        });
    }

    public updateTransaction(transaction: Transaction): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            this._transactionService.update(transaction).subscribe(
                (result: Resulteable) => {
                    if (result.status === 200) {
                        resolve(result.result);
                    } else {
                        //  this.showToast(result);
                        reject(result);
                    };
                },
                error => {
                    //  this.showToast(error)
                    reject(error);
                }
            );
        });
    }

    public getPrinters(): Promise<Printer[]> {

        return new Promise<Printer[]>(async (resolve, reject) => {

            this.subscription.add(this._printerService.getPrinters().subscribe(
                result => {
                    if (!result.printers) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.printers);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            ));
        });
    }

    async openModal(op: string, state: TransactionState = TransactionState.Closed) {

        let modalRef;
        switch (op) {
            case 'view-transaction':
                modalRef = this._modalService.open(ViewTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = this.transaction._id;
                break;
            case 'print':
                if (this.transaction.type.readLayout) {
                    modalRef = this._modalService.open(PrintTransactionTypeComponent);
                    modalRef.componentInstance.transactionId = this.transaction._id;
                    modalRef.result.then(async (result) => {
                    }, async (reason) => {
                        if (this.transaction.state === TransactionState.Packing) {
                            // PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
                            await this.getTransaction(this.transaction._id).then(
                                async transaction => {
                                    if (transaction) {
                                        transaction.state = TransactionState.Delivered;
                                        await this.updateTransaction(transaction);
                                        this.refresh();
                                    }
                                }
                            );
                        }
                    });
                } else {
                    await this.getPrinters().then(
                        printers => {
                            this.printers = printers;
                        }
                    );
                    modalRef = this._modalService.open(PrintComponent);
                    modalRef.componentInstance.company = this.transaction.company;
                    modalRef.componentInstance.transactionId = this.transaction._id;
                    modalRef.componentInstance.typePrint = 'invoice';
                    if (this.transaction.type.defectPrinter) {
                        modalRef.componentInstance.printer = this.transaction.type.defectPrinter;
                    } else {
                        if (this.printers && this.printers.length > 0) {
                            for (let printer of this.printers) {
                                if (printer.printIn === PrinterPrintIn.Counter) {
                                    modalRef.componentInstance.printer = printer;
                                }
                            }
                        }
                    }
                    modalRef.result.then(async (result) => {
                    }, async (reason) => {
                        if (this.transaction.state === TransactionState.Packing) {
                            // PONEMOS LA TRANSACCION EN ESTADO EN ENTREGADO
                            await this.getTransaction(this.transaction._id).then(
                                async transaction => {
                                    if (transaction) {
                                        transaction.state = TransactionState.Delivered;
                                        await this.updateTransaction(transaction);
                                        this.refresh();
                                    }
                                }
                            );
                        }
                    });
                }
                break;
            case 'edit':
                modalRef = this._modalService.open(AddTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = this.transaction._id;
                modalRef.result.then(
                    async (result) => {
                        if (result && result.transaction) {
                            await this.updateTransaction(result.transaction);
                            this.refresh();
                        } else {
                            this.refresh();
                        }
                    }, (reason) => {
                        this.refresh();
                    });
                break;
            case 'cancel-transaction':
                modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transactionId = this.transaction._id;
                modalRef.result.then((result) => {
                    if (result === "delete_close") {
                        this.refresh();
                    }
                }, (reason) => {

                });
                break;
            case 'canceledTn':
                modalRef = this._modalService.open(CancelComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transaction = this.transaction;
                modalRef.componentInstance.config = this.config;
                modalRef.componentInstance.state = state;
                break
            case 'fulfilledTn':
                modalRef = this._modalService.open(FulfilledComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.transaction = this.transaction;
                modalRef.componentInstance.config = this.config;
                modalRef.componentInstance.state = state;
                break
            case 'dateTn':
                modalRef = this._modalService.open(DateFromToComponent , { size: 'lg', backdrop: 'static' });
                modalRef.result.then(() =>{
                    this.refresh()
                })
                break
        }
    }

    public async viewTransaction(transaction: Transaction) {
        console.log(transaction)
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
            this.openModal('view-transaction');
        }
    }

    public async printTransaction(transaction: Transaction) {
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
            this.openModal('print');
        }
    }

    public async changeCompany(transaction: Transaction) {
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
            this.openModal('edit');
        }
    }

    public async cancelTransaction(transaction: Transaction) {
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
            this.openModal('cancel-transaction');
        }
    }

    public async canceledStatusTransaction(transaction: Transaction, state: TransactionState = TransactionState.Closed) {
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
            this.openModal('canceledTn', state);
        }
    }

    public getTransaction(transactionId: string): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            this._transactionService.getTransaction(transactionId).subscribe(
                async result => {
                    if (!result.transaction) {
                        this.showMessage(result.message, 'danger', false);
                        resolve(null);
                    } else {
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    async changeStateOfTransaction(transaction: Transaction, state: TransactionState) {
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction && this.transaction.tiendaNubeId && this.config.tiendaNube.userID) {
            return new Promise<Transaction>((resolve, reject) => {
                this._transactionService.updateTransactionStatus(transaction.tiendaNubeId, this.config.tiendaNube.userID, state).subscribe(
                    (result: Resulteable) => {
                        if (result.status === 201) {
                            this.refresh();
                            resolve(result.result);
                        } else {
                            this.refresh();
                            reject(result);
                        };
                        this.refresh();
                    },
                    error => {
                        // this.showToast(error)
                        reject(error);
                    }
                );
            });
        }
    }

    public async fulfilledStatusTransaction(transaction: Transaction, state: TransactionState = TransactionState.Closed) {
        this.transaction = await this.getTransaction(transaction._id);
        if (this.transaction) {
            this.openModal('fulfilledTn', state);
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

    public getTransactionById(transactionId: string): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            this._transactionService.getTransaction(transactionId).subscribe(
                async result => {
                    if (!result.transaction) {
                        this.showMessage(result.message, 'danger', false);
                        resolve(null);
                    } else {
                        resolve(result.transaction);
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
        this.loading = false;
    }

    public hideMessage(): void {
        this.alertMessage = '';
    }
}