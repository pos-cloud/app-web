import { Component, OnInit, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { CashBox, CashBoxState } from '../cash-box';
import { PaymentMethod } from '../../payment-method/payment-method';
import { Transaction, TransactionState } from '../../transaction/transaction';
import { MovementOfCash, currencyValue } from '../../movement-of-cash/movement-of-cash';

//Servicios
import { PaymentMethodService } from '../../payment-method/payment-method.service';
import { MovementOfCashService } from '../../movement-of-cash/movement-of-cash.service';
import { CashBoxService } from '../cash-box.service';
import { AuthService } from 'app/components/login/auth.service';
import { TransactionService } from '../../transaction/transaction.service';

//Componentes
import { PrintComponent } from '../../print/print/print.component';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { Config } from 'app/app.config';
import { ConfigService } from 'app/components/config/config.service';
import { CurrencyValueService } from 'app/components/currency-value/currency-value.service';
import { CurrencyValue } from 'app/components/currency-value/currency-value';
import { User } from 'app/components/user/user';
import { UserService } from 'app/components/user/user.service';
import { PrinterPrintIn, Printer } from 'app/components/printer/printer';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import Resulteable from 'app/util/Resulteable';

@Component({
    selector: 'app-cash-box',
    templateUrl: './cash-box.component.html',
    styleUrls: ['./cash-box.component.css'],
    providers: [NgbAlertConfig, TranslateMePipe],
    encapsulation: ViewEncapsulation.None
})

export class CashBoxComponent implements OnInit {

    public cashBoxForm: FormGroup;
    public formAddCurrencyValue: FormGroup;
    public paymentMethods: PaymentMethod[];
    public currencyValues: CurrencyValue[];
    public transaction: Transaction;
    public currencyValuesForm: currencyValue[]
    public totalCurrencyValue = 0;
    public cashBox: CashBox;
    public movementOfCash: MovementOfCash;
    public loading: boolean = false;
    public posType: string;
    public userType: string;
    public alertMessage: string = '';
    public movementsOfCashes: MovementOfCash[];
    public focusEvent = new EventEmitter<boolean>();
    @Input() transactionType: TransactionType;
    private config: Config;
    private identity: User;
    public selectPayment;
    public printerSelected: Printer;

    constructor(
        private _fb: FormBuilder,
        private _router: Router,
        private _paymentMethodService: PaymentMethodService,
        private _movementOfCashService: MovementOfCashService,
        private _transactionTypeService : TransactionTypeService,
        private _cashBoxService: CashBoxService,
        private _authService: AuthService,
        private _transactionService: TransactionService,
        private _currencyValueService: CurrencyValueService,
        public translatePipe: TranslateMePipe,
        private _toastr: ToastrService,
        private _configService: ConfigService,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _userService: UserService,
        public _modalService: NgbModal,
    ) {
        this.paymentMethods = new Array();
        this.cashBox = new CashBox();
        this.movementOfCash = new MovementOfCash();
        this.movementsOfCashes = new Array();
        this.transaction = new Transaction();
    }

    async ngOnInit() {

        let pathLocation: string[] = this._router.url.split('/');
        this.userType = pathLocation[1];
        this.posType = pathLocation[2];
        this.transaction.type = this.transactionType;
        this.getCurrencyValues();
        this.buildForm();
        await this._configService.getConfig.subscribe(
            config => {
                this.config = config;
            }
        );
        await this._authService.getIdentity.subscribe(
            identity => {
                this.identity = identity;
            }
        );
        await this.getPaymentMethods('where="cashBoxImpact":true').then(
            async paymentMethods => {
                if (paymentMethods) {
                    this.paymentMethods = paymentMethods;
                    this.setValueForm();
                    let query = 'where="state":"' + CashBoxState.Open + '"';

                    if (this.identity) {
                        if (this.config.cashBox.perUser) {
                            if (this.identity.employee) {
                                query += ',"employee":"' + this.identity.employee._id + '"';
                            }
                        } else if (this.identity.cashBoxType) {
                            query += ',"type":"' + this.identity.cashBoxType._id + '"';
                        } else {
                            query += ',"type":null';
                        }
                    }

                    query += '&sort="number":-1&limit=1';
                    await this.getCashBoxes(query).then(
                        async cashBoxes => {
                            if (cashBoxes) {
                                this.cashBox = cashBoxes[0];
                                if (this.transactionType.cashOpening) {
                                    this.showMessage("La caja ya se encuentra abierta.", 'info', true);
                                } else if (this.transactionType.cashClosing) {
                                    let query = 'where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled + '"}},{"state":{"$ne": "' + TransactionState.PaymentDeclined + '"}},{"cashBox":"' + this.cashBox._id + '"}]';
                                    await this.getTransactions(query).then(
                                        async transactions => {
                                            if (transactions) {
                                                this.showMessage("No puede cerrar la caja. La transacción: " + transactions[0].type.name + " " + transactions[0].origin + "-" + transactions[0].letter + "-" + transactions[0].number + " se encuentra abierta.", 'info', true);
                                            }
                                        }
                                    );
                                }
                            } else {
                                if (this.transactionType.cashOpening) {
                                    if (this.identity && this.identity.employee) {
                                        this.cashBox.employee = this.identity.employee;
                                    }
                                } else if (this.transactionType.cashClosing) {
                                    this.showMessage("No se encuentran cajas abiertas.", 'info', true);
                                }
                            }
                        }
                    );
                }
            }
        );
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public formErrors = {
        'paymentMethod': '',
        'amount': '',
    };

    public validationMessages = {
        'paymentMethod': {
            'required': 'Este campo es requerido.'
        },
        'amount': {
        }
    };

    public buildForm(): void {

        this.cashBoxForm = this._fb.group({
            'paymentMethod': [null, [
                Validators.required
            ]
            ],
            'amount': [0, [
            ]
            ]
        });
        this.formAddCurrencyValue = this._fb.group({
            'currencyValue':[null,[
                Validators.required
            ]],
            'currencyAmount':[0,[]]
        })

        this.cashBoxForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
    }

    public onValueChanged(data?: any): void {

        if (!this.cashBoxForm) { return; }
        const form = this.cashBoxForm;

        for (const field in this.formErrors) {

            this.formErrors[field] = '';

            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    public setValueForm(): void {

        let paymentMethod = this.cashBoxForm.value.paymentMethod;

        if (!paymentMethod &&
            this.paymentMethods &&
            this.paymentMethods.length > 0) paymentMethod = this.paymentMethods[0];

        let values = {
            'paymentMethod': paymentMethod,
            'amount': 0,
        };
        
        this.cashBoxForm.setValue(values);
    }

    public getCashBoxes(query?: string): Promise<CashBox[]> {

        return new Promise<CashBox[]>((resolve, reject) => {

            this._cashBoxService.getCashBoxes(query).subscribe(
                result => {
                    if (!result.cashBoxes) {
                        resolve(null);
                    } else {
                        resolve(result.cashBoxes);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public saveCashBox(): Promise<CashBox> {

        return new Promise<CashBox>((resolve, reject) => {
            this._cashBoxService.saveCashBox(this.cashBox).subscribe(
                result => {
                    if (!result.cashBox) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.cashBox);
                    }
                },
                error => {
                    error => {
                        this.showMessage(error._body, 'danger', true);
                        resolve(null);
                    }
                }
            );
        });
    }

    async openCashBox() {
        this.loading = true;
        if (!this.cashBox || !this.cashBox._id) {
            await this.getCashBoxes('sort="number":-1&limit=1').then(
                async cashBoxes => {
                    if (cashBoxes) {
                        this.cashBox.number = cashBoxes[0].number + 1;
                    } else {
                        this.cashBox.number = 1;
                    }
                    this._authService.getIdentity.subscribe(
                        identity => {
                            if (identity.cashBoxType) {
                                this.cashBox.type = identity.cashBoxType;
                            }
                        },
                    );
                    await this.saveCashBox().then(
                        async cashBox => {
                            if (cashBox) {
                                this.cashBox = cashBox;
                                if (this.cashBox) {
                                    if (this.transactionType.fixedOrigin) {
                                        this.transaction.origin = this.transactionType.fixedOrigin;
                                    } else {
                                        this.transaction.origin = 0;
                                    }
                                    if (this.transactionType.fixedLetter) {
                                        this.transaction.letter = this.transactionType.fixedLetter;
                                    } else {
                                        if (Config.country === "AR") {
                                            this.transaction.letter = "X";
                                        } else {
                                            this.transaction.letter = "";
                                        }
                                    }
                                    await this.getLastTransactionByType().then(
                                        transaction => {
                                            if (transaction) {
                                                this.transaction.number = transaction.number + 1;
                                            } else {
                                                this.transaction.number = 1;
                                            }
                                            this.addTransaction();
                                        }
                                    );
                                } else {
                                    this.activeModal.close({ cashBox: this.cashBox });
                                }
                            }
                        }
                    );
                }
            );
        } else {
            this.loading = false;
            this.showMessage("La caja ya se encuentra abierta.", 'info', true);
        }
    }

    async closeCashBox() {

        if (this.cashBox && this.cashBox._id) {
            if (this.cashBox.state === CashBoxState.Closed) {
                this.openModal("print");
            } else {
                let query = 'where="$and":[{"state":{"$ne": "' + TransactionState.Closed + '"}},{"state":{"$ne": "' + TransactionState.Canceled + '"}},{"state":{"$ne": "' + TransactionState.PaymentDeclined + '"}},{"cashBox":"' + this.cashBox._id + '"}]';
                await this.getTransactions(query).then(
                    async transactions => {
                        if (transactions) {
                            this.showMessage("No puede cerrar la caja la transaccion : " + transactions[0].type.name + "  " + transactions[0].origin + "-" + transactions[0].letter + "-" + transactions[0].number + "tiene el estado de " + transactions[0].state, 'info', true);
                        } else {
                            await this.getLastTransactionByType().then(
                                transaction => {
                                    if (transaction) {
                                        this.transaction.number = transaction.number + 1;
                                    } else {
                                        this.transaction.number = 1;
                                    }
                                    this.addTransaction();
                                }
                            );
                        }
                    }
                );
            }
        } else {
            this.showMessage("No se encuentran cajas abiertas.", 'info', true);
        }
    }

    public updateCashBox(): Promise<CashBox> {

        return new Promise<CashBox>((resolve, reject) => {

            this._cashBoxService.updateCashBox(this.cashBox).subscribe(
                result => {
                    if (!result.cashBox) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.cashBox);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', true);
                    resolve(null);
                }
            );
        });
    }

    async openModal(op: string, movement?: MovementOfCash) {

        let modalRef;

        switch (op) {
            case 'print':
                await this.getUser().then(
                    async user => {
                        if (user) {
                            if (user.printers && user.printers.length > 0) {
                                for (const element of user.printers) {
                                    if (element && element.printer && element.printer.printIn === PrinterPrintIn.Counter) {
                                        this.printerSelected = element.printer;
                                    }
                                }
                            }
                        }

                        let modalRef = this._modalService.open(PrintComponent);
                        modalRef.componentInstance.cashBox = this.cashBox;
                        modalRef.componentInstance.typePrint = 'cash-box';
                        if (this.printerSelected) {
                            modalRef.componentInstance.printer = this.printerSelected;
                        } else {
                            modalRef.componentInstance.printer = this.transactionType.defectPrinter;
                        }
                        modalRef.result.then((result) => {
                            this.activeModal.close({ cashBox: this.cashBox });
                        }, (reason) => {
                            this.activeModal.close({ cashBox: this.cashBox });
                        });
                    }
                );
                break;
            case 'delete':
                let del = -1;
                for (let i = 0; i < this.movementsOfCashes.length; i++) {
                    if (this.movementsOfCashes[i]._id === movement._id) {
                        del = i;
                    }
                }
                this.movementsOfCashes.splice(del, 1);
                break;
            default: ;
        }
    };

    public getUser(): Promise<User> {

        return new Promise<User>((resolve, reject) => {

            let identity: User = JSON.parse(sessionStorage.getItem('user'));
            if (identity) {
                this._userService.getUser(identity._id).subscribe(
                    result => {
                        if (result && result.user) {
                            resolve(result.user)
                        } else {
                            this.showMessage("Debe volver a iniciar sesión", "danger", false);
                        }
                    },
                    error => {
                        this.showMessage(error._body, "danger", false);
                    }
                )
            }
        });
    }

    async getPaymentMethods(query?: string): Promise<PaymentMethod[]> {

        return new Promise<PaymentMethod[]>((resolve, reject) => {

            this._paymentMethodService.getPaymentMethods(query).subscribe(
                result => {
                    if (!result.paymentMethods) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.paymentMethods);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public getCurrencyValues(): void {

        this._currencyValueService.getCurrencyValues(
            { value: 1, name: 1, operationType: 1 },
            { "operationType": { "$ne": "D" } },
            {},
            {},
        ).subscribe(
            result => {
                if (result && result.currencyValues) {
                    this.currencyValues = result.currencyValues
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
            }
        )

    }

    public addCurrencyValue(e: any): void {
        // allowCurrencyValue
        e = this.formAddCurrencyValue.value
        if (e && parseInt(e.currencyValue) && e.currencyAmount) {
            if (!this.currencyValuesForm) this.currencyValuesForm = new Array();
            this.currencyValuesForm.push({ value: parseInt(e.currencyValue), quantity: e.currencyAmount });
            this.totalCurrencyValue = 0;
            for (const iterator of this.currencyValuesForm) {
                this.totalCurrencyValue = this.totalCurrencyValue + (iterator.quantity * iterator.value)
            }
        } else {
            this.showMessage("Debe completar todos los campos", 'info', true);
        }
    }

    public deleteCurrencyValue(e): void {
        this.totalCurrencyValue = 0;
        this.currencyValuesForm.splice(e, 1);
        for (const iterator of this.currencyValuesForm) {
            this.totalCurrencyValue = this.totalCurrencyValue + (iterator.quantity * iterator.value)
        }
    }

    public addMovementOfCash(): void {

        this.movementOfCash.type = this.cashBoxForm.value.paymentMethod;
        if (this.movementOfCash.type.cashBoxImpact) {
            this.movementOfCash.amountPaid = this.cashBoxForm.value.amount;
            let mov = new MovementOfCash();
            mov.date = this.movementOfCash.date;
            mov.quota = this.movementOfCash.quota;
            mov.expirationDate = this.movementOfCash.expirationDate;
            mov.discount = this.movementOfCash.discount;
            mov.surcharge = this.movementOfCash.surcharge;

            if (this.movementOfCash.type.allowCurrencyValue && this.currencyValuesForm && this.currencyValuesForm.length > 0) {
                mov.currencyValues = this.currencyValuesForm
                mov.amountPaid = 0;
                mov.currencyValues.forEach(element => {
                    mov.amountPaid = mov.amountPaid + (element.quantity * element.value)
                });
            } else {
                mov.amountPaid = this.movementOfCash.amountPaid;
            }

            mov.observation = this.movementOfCash.observation;
            mov.type = this.movementOfCash.type;
            mov.transaction = this.movementOfCash.transaction;
            mov.receiver = this.movementOfCash.receiver;
            mov.number = this.movementOfCash.number;
            mov.bank = this.movementOfCash.bank;
            mov.titular = this.movementOfCash.titular;
            mov.CUIT = this.movementOfCash.CUIT;
            mov.deliveredBy = this.movementOfCash.deliveredBy;
            this.movementsOfCashes.push(mov);
            this.currencyValuesForm = null;
        } else {
            this.showMessage('El método de pago ' + this.movementOfCash.type.name + ' no impacta en la caja.', 'info', true);
        }
    }

    public getTransactions(query?: string): Promise<Transaction[]> {

        return new Promise<Transaction[]>((resolve, reject) => {

            this._transactionService.getTransactions(query).subscribe(
                result => {
                    if (!result.transactions || result.transactions.length === 0) {
                        resolve(null);
                    } else {
                        resolve(result.transactions);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public getLastTransactionByType(): Promise<Transaction> {

        return new Promise<Transaction>((resolve, reject) => {

            let query = 'where="type":"' + this.transaction.type._id + '","origin":"' + 0 + '","letter":"' + this.transaction.letter + '"&sort="number":-1&limit=1';

            this._transactionService.getTransactions(query).subscribe(
                result => {
                    if (!result.transactions || result.transactions.length === 0) {
                        resolve(null);
                    } else {
                        resolve(result.transactions[0]);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    async addTransaction() {

        this.loading = true;
        (this.posType === 'cuentas-corrientes') ? this.transaction.madein = 'mostrador' : this.transaction.madein = this.posType;
        this.transaction.totalPrice = 0;
        if (this.movementsOfCashes.length > 0) {

            for (let mov of this.movementsOfCashes) {
                this.transaction.totalPrice += mov.amountPaid;
            }
            this.transaction.state = TransactionState.Closed;
            this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
            this.transaction.VATPeriod = moment().format('YYYYMM');
            this.transaction.expirationDate = this.transaction.endDate;
            this.transaction.cashBox = this.cashBox;
            this.transaction.type = this.transactionType;

            await this.saveTransaction().then(
                async transaction => {
                    if (transaction) {
                        this.transaction = transaction;
                        for (let movementOfCash of this.movementsOfCashes) {
                            movementOfCash.transaction = this.transaction;
                        }
                        await this.saveMovementsOfCashes().then(
                            async movementsOfCashes => {
                                if (movementsOfCashes) {
                                    if (this.transactionType.cashOpening) {
                                        this.activeModal.close({ cashBox: this.cashBox });
                                    } else {
                                        this.cashBox.closingDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                                        this.cashBox.state = CashBoxState.Closed;
                                        await this.resetOrderNumber();
                                        await this.updateCashBox().then(
                                            cashBox => {
                                                if (cashBox) {
                                                    this.cashBox = cashBox;
                                                    this.openModal("print");
                                                    this.loading = false;
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        );
                    }
                }
            );
        } else {
            if (this.transactionType.cashOpening) {
                this.activeModal.close({ cashBox: this.cashBox });
            } else {

                this.cashBox.closingDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
                this.cashBox.state = CashBoxState.Closed;
                await this.resetOrderNumber();
                await this.updateCashBox().then(
                    cashBox => {
                        if (cashBox) {
                            this.cashBox = cashBox;
                            this.openModal("print");
                        }
                    }
                );
            }
        }
    }

    public saveTransaction(): Promise<Transaction> {
        return new Promise<Transaction>((resolve, reject) => {
            (this.posType === 'cuentas-corrientes') ? this.transaction.madein = 'mostrador' : this.transaction.madein = this.posType;
            this._transactionService.save(this.transaction).subscribe(
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

    async saveMovementsOfCashes(): Promise<MovementOfCash[]> {

        return new Promise<MovementOfCash[]>((resolve, reject) => {

            this._movementOfCashService.saveMovementsOfCashes(this.movementsOfCashes).subscribe(
                async result => {
                    if (!result.movementsOfCashes) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.movementsOfCashes);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public resetOrderNumber() {

        let match = {
            operationType : { "$ne" : "D" },
            resetOrderNumber : "Caja",
            orderNumber : { "$gte" : 0 }
        }

        if(this.cashBox.type){
            match["cashBoxType._id"] = { "$oid" : this.cashBox.type._id }
        }

        this._transactionTypeService.getAll({
            project : {
                resetOrderNumber : 1,
                orderNumber : 1,
                operationType : 1,
                order : 1,
                transactionMovement: 1,
                abbreviation: 1,
                name: 1,
                currentAccount: 1,
                stockMovement : 1,
                movement: 1,
                modifyStock: 1,
                requestArticles: 1,
                requestTaxes: 1,
                "cashBoxType._id" : 1
            },
            match : match
        }).subscribe(
            result => {
                if(result && result.status === 200){
                    result.result.forEach(async element => {
                        element.orderNumber = 1;
                        await this._transactionTypeService.update(element).subscribe(
                            result => {
                                if(result && result.status === 200){
                                    this.showToast(null, 'success', "La numeracion del tipo de transaccion: " + result.result.name + " se reinicio correctamente");
                                } else {
                                    this.showToast(result.error);
                                }
                            },
                            error =>{
                                this.showToast(error);
                            }
                        )
                    });
                } else {
                    this.showToast(result.error);
                }
            },
            error =>{
                this.showToast(error);
            }
        )
    }

    public showMessage(message: string, type: string, dismissible: boolean): void {
        this.alertMessage = message;
        this.alertConfig.type = type;
        this.alertConfig.dismissible = dismissible;
    }

    public hideMessage(): void {
        this.alertMessage = '';
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
