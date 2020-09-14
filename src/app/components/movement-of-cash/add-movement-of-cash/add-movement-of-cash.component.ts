// ANGULAR
import { Component, OnInit, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

// DE TERCEROS
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

// MODELS
import { PaymentMethod } from '../../payment-method/payment-method';
import { MovementOfCash, StatusCheck } from '../movement-of-cash';
import { Transaction } from '../../transaction/transaction';
import { CurrentAccount, Movements } from '../../transaction-type/transaction-type';
import { Taxes } from '../../tax/taxes';
import { MovementOfArticle } from '../../movement-of-article/movement-of-article';
import { Bank } from 'app/components/bank/bank';
import { Config } from 'app/app.config';

// SERVICES
import { PaymentMethodService } from '../../payment-method/payment-method.service';
import { MovementOfCashService } from '../movement-of-cash.service';
import { TransactionService } from '../../transaction/transaction.service';
import { MovementOfArticleService } from '../../movement-of-article/movement-of-article.service';
import { BankService } from 'app/components/bank/bank.service';

// PIPES
import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';

// COMPONENTS
import { DeleteMovementOfCashComponent } from '../delete-movement-of-cash/delete-movement-of-cash.component';

import Keyboard from "simple-keyboard";
import { SelectChecksComponent } from '../select-checks/select-checks.component';
import { TaxService } from '../../tax/tax.service';
import { Tax } from '../../tax/tax';
import { Holiday } from 'app/components/holiday/holiday.model';
import { HolidayService } from 'app/components/holiday/holiday.service';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-add-movement-of-cash',
    templateUrl: './add-movement-of-cash.component.html',
    styleUrls: [
        "./../../../../../node_modules/simple-keyboard/build/css/index.css",
        "./add-movement-of-cash.component.scss"
    ],
    providers: [NgbAlertConfig, RoundNumberPipe],
    encapsulation: ViewEncapsulation.None
})

export class AddMovementOfCashComponent implements OnInit {

    @Input() transaction: Transaction;
    @Input() fastPayment: PaymentMethod;
    public movementOfCash: MovementOfCash;
    public movementsOfCashes: MovementOfCash[];
    public movementsOfCashesToFinance: MovementOfCash[];
    public paymentMethods: PaymentMethod[];
    public paymentMethodSelected: PaymentMethod;
    public movementOfCashForm: FormGroup;
    public paymentChange: string = '0.00';
    public alertMessage: string = '';
    public loading: boolean = false;
    public focusEvent = new EventEmitter<boolean>();
    public transactionAmount: number = 0.00;
    public amountToPay: number = 0.00;
    public amountPaid: number = 0.00;
    public amountDiscount: number = 0.00;
    private subscription: Subscription = new Subscription();
    public percentageCommission: number = 0.00;
    public daysCommission: number = 0;
    public roundNumber = new RoundNumberPipe();
    public quotas: number = 1;
    public days: number = 30;
    public orderTerm: string[] = ['expirationDate'];
    public propertyTerm: string;
    public holidays: Holiday[];
    public banks: Bank[];
    public movementOfArticle: MovementOfArticle;
    public keyboard: Keyboard;

    public formErrors = {
        'paymentMethod': '', 'amountToPay': '', 'amountPaid': '', 'paymentChange': '', 'observation': '', 'surcharge': '', 'CUIT': '', 'number': ''
    };

    public validationMessages = {
        'paymentMethod': {
            'required': 'Este campo es requerido.',
            'payValid': 'El monto ingresado es incorrecto para este medio de pago.'
        },
        'amountToPay': {},
        'amountPaid': {
            'required': 'Este campo es requerido.',
            'payValid': 'El monto ingresado es incorrecto.'
        },
        'paymentChange': {},
        'observation': {},
        'surcharge': {},
        'CUIT': {},
        'number': { 'pattern': ' Ingrese solo números ' }
    };

    constructor(
        public _paymentMethodService: PaymentMethodService,
        public _movementOfCashService: MovementOfCashService,
        public _transactionService: TransactionService,
        public _bankService: BankService,
        public _holidayService: HolidayService,
        public _fb: FormBuilder,
        public activeModal: NgbActiveModal,
        public alertConfig: NgbAlertConfig,
        public _modalService: NgbModal,
        private _taxService: TaxService,
        public _movementOfArticleService: MovementOfArticleService
    ) {
        this.movementOfCash = new MovementOfCash();
        this.paymentMethods = new Array();
        this.banks = new Array();
        if (this.fastPayment) {
            this.movementOfCash.type = this.fastPayment;
        } else {
            this.movementOfCash.type = new PaymentMethod();
        }
        this.paymentMethodSelected = this.movementOfCash.type;
    }

    ngOnInit() {
        this.transactionAmount = this.transaction.totalPrice;
        this.buildForm();
        this.keyboard = new Keyboard({
            onChange: input => this.onChange(input),
            onKeyPress: button => this.onKeyPress(button),
            layout: {
                default: ["7 8 9", "4 5 6", "1 2 3", "0 . {bksp}", "{enter}"],
                shift: []
            },
            buttonTheme: [
                {
                    class: "hg-blue",
                    buttons: "{enter}"
                },
                {
                    class: "hg-red",
                    buttons: "{bksp}"
                }
            ],
            theme: "hg-theme-default hg-layout-numeric numeric-theme",
            display: {
                "{bksp}": "Borrar ⌫",
                "{enter}": "Enter ↵"
            }
        });

        this.getPaymentMethods();
        this.getBanks();
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
    }

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    onChange = (input: string) => {
        (!isNaN(parseFloat(input))) ?
            this.movementOfCashForm.value.amountToPay = this.roundNumber.transform(parseFloat(input)) :
            this.movementOfCashForm.value.amountToPay = 0;
        this.updateAmounts('amountToPay');
    };

    onKeyPress = (button: string) => {
        if (button === "{enter}") this.addMovementOfCash();
        if (button === "{bksp}") {
            if (this.movementOfCashForm.value.amountToPay.toString().length > 1) {
                this.movementOfCashForm.value.amountToPay =
                    parseFloat(this.movementOfCashForm.value.amountToPay.toString().slice(0, this.movementOfCashForm.value.amountToPay.toString().length - 1));
            } else {
                this.movementOfCashForm.value.amountToPay = 0;
            }
            this.updateAmounts('amountToPay');
        }
    };

    onInputChange = (event: any) => {
        this.keyboard.setInput(event.target.value);
    };

    handleShift = () => {
        let currentLayout = this.keyboard.options.layoutName;
        let shiftToggle = currentLayout === "default" ? "shift" : "default";
        this.keyboard.setOptions({
            layoutName: shiftToggle
        });
    };

    public buildForm(): void {

        this.movementOfCashForm = this._fb.group({
            'transactionAmount': [parseFloat(this.roundNumber.transform(this.transactionAmount)).toFixed(2), [Validators.required]],
            'paymentMethod': [this.movementOfCash.type, [Validators.required]],
            'percentageCommission': [this.percentageCommission, []],
            'daysCommission': [this.daysCommission, []],
            'amountToPay': [this.amountToPay, []],
            'amountPaid': [this.amountPaid, []],
            'amountDiscount': [this.amountDiscount, []],
            'paymentChange': [this.movementOfCash.paymentChange, []],
            'observation': [this.movementOfCash.observation, []],
            'discount': [this.movementOfCash.type.discount, []],
            'surcharge': [this.movementOfCash.type.surcharge, []],
            'commissionAmount': [this.movementOfCash.commissionAmount, []],
            'expirationDate': [moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'), []],
            'receiver': [this.movementOfCash.receiver, []],
            'number': [this.movementOfCash.number, [Validators.pattern("^[0-9]*$")]],
            'bank': [this.movementOfCash.bank, []],
            'titular': [this.movementOfCash.titular, []],
            'CUIT': [this.movementOfCash.CUIT, []],
            'deliveredBy': [this.movementOfCash.deliveredBy, []],
            'quotas': [this.quotas, []],
            'days': [this.days, []]
        });

        this.movementOfCashForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
    }

    public changePaymentMethod(paymentMethod: PaymentMethod): void {
        this.paymentMethodSelected = paymentMethod;
        this.updateAmounts('paymentMethod');
    }

    public setValuesForm(): void {

        if (!this.movementOfCash.observation) this.movementOfCash.observation = '';
        if (!this.movementOfCash.amountPaid) this.movementOfCash.amountPaid = 0.00;
        if (!this.movementOfCash.discount) this.movementOfCash.discount = 0.00;
        if (!this.movementOfCash.surcharge) this.movementOfCash.surcharge = 0.00;
        if (!this.movementOfCash.commissionAmount) this.movementOfCash.commissionAmount = 0.00;
        if (!this.movementOfCash.receiver) this.movementOfCash.receiver = '';
        if (!this.movementOfCash.number) this.movementOfCash.number = '';
        if (!this.movementOfCash.titular) this.movementOfCash.titular = '';
        if (!this.movementOfCash.CUIT) this.movementOfCash.CUIT = '';
        if (!this.movementOfCash.deliveredBy) this.movementOfCash.deliveredBy = '';
        if (!this.amountToPay) this.amountToPay = 0.00;
        if (!this.amountPaid) this.amountPaid = 0.00;
        if (!this.amountDiscount) this.amountDiscount = 0.00;

        if (this.paymentMethodSelected.observation) {
            this.movementOfCash.observation = this.paymentMethodSelected.observation;
        }

        let bank;
        if (!this.movementOfCash.bank) {
            bank = null;
        } else {
            if (this.movementOfCash.bank._id) {
                bank = this.movementOfCash.bank._id;
            } else {
                bank = this.movementOfCash.bank;
            }
        }

        const values = {
            'transactionAmount': parseFloat(this.roundNumber.transform(this.transactionAmount).toFixed(2)),
            'paymentMethod': this.paymentMethodSelected,
            'amountToPay': parseFloat(this.roundNumber.transform(this.amountToPay).toFixed(2)),
            'amountPaid': parseFloat(this.roundNumber.transform(this.amountPaid).toFixed(2)),
            'amountDiscount': parseFloat(this.roundNumber.transform(this.amountDiscount).toFixed(2)),
            'paymentChange': parseFloat(this.roundNumber.transform(this.paymentChange).toFixed(2)),
            'percentageCommission': parseFloat(this.roundNumber.transform(this.percentageCommission).toFixed(2)),
            'daysCommission': this.daysCommission,
            'observation': this.movementOfCash.observation,
            'discount': parseFloat(this.roundNumber.transform(this.movementOfCash.discount).toFixed(2)),
            'surcharge': parseFloat(this.roundNumber.transform(this.movementOfCash.surcharge).toFixed(2)),
            'commissionAmount': parseFloat(this.roundNumber.transform(this.movementOfCash.commissionAmount).toFixed(2)),
            'expirationDate': moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'),
            'receiver': this.movementOfCash.receiver,
            'number': this.movementOfCash.number,
            'bank': bank,
            'titular': this.movementOfCash.titular,
            'CUIT': this.movementOfCash.CUIT,
            'deliveredBy': this.movementOfCash.deliveredBy,
            'quotas': this.quotas,
            'days': this.days
        };

        this.movementOfCashForm.setValue(values);
    }

    public onValueChanged(data?: any): void {

        if (!this.movementOfCashForm) { return; }
        const form = this.movementOfCashForm;

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

        if (this.transaction.totalPrice !== 0) {
            this.paymentChange = (this.movementOfCashForm.value.amountPaid - this.movementOfCashForm.value.transactionAmount).toFixed(2);
            if (parseFloat(this.paymentChange) < 0) {
                this.paymentChange = '0.00';
            }
        }

        for (let type of this.paymentMethods) {
            if (type._id.toString() === this.movementOfCashForm.value.paymentMethod) {
                this.paymentMethodSelected = type;
                this.movementOfCash.type = type;
            }
        }

        this.movementOfCash.expirationDate = this.movementOfCashForm.value.expirationDate;
    }

    public getBanks() {

        this.loading = true;

        let project = {
            "_id": 1,
            "name": 1,
            "code": 1,
            "operationType": 1,
        };

        this._bankService.getBanks(
            project, // PROJECT
            { "operationType": { "$ne": "D" } }, // MATCH
            { name: 1 }, // SORT
            {}, // GROUP
            0, // LIMIT
            0 // SKIP
        ).subscribe(result => {
            this.loading = false;
            if (result && result.banks) {
                this.banks = result.banks;
            } else {
                this.banks = new Array();
            }
        },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            });
    }

    public calculateQuotas(field: string, newValue?: any, movement?: MovementOfCash): void {

        this.quotas = this.movementOfCashForm.value.quotas;
        this.days = this.movementOfCashForm.value.days;
        let expirationDate = 1;

        switch (field) {
            case 'quotas':
                this.movementsOfCashesToFinance = new Array();
                let amountTotal = 0;
                for (let i = 0; i < this.quotas; i++) {
                    var mov: MovementOfCash = new MovementOfCash();
                    mov.transaction = this.transaction;
                    mov.type = this.paymentMethodSelected;
                    mov.observation = this.movementOfCash.observation;
                    mov.quota = i + 1;
                    mov.expirationDate = moment(moment(this.movementOfCash.expirationDate, 'YYYY-MM-DD').format('YYYY-MM-DD')).add(expirationDate, 'days').format('YYYY-MM-DD').toString();
                    expirationDate = (this.days * (i + 1)) + 1;
                    mov.amountPaid = this.roundNumber.transform(this.amountToPay / this.quotas);
                    amountTotal += mov.amountPaid;
                    if (i === (this.quotas - 1)) {
                        if (amountTotal !== this.amountToPay) {
                            mov.amountPaid = this.roundNumber.transform(mov.amountPaid - (amountTotal - this.amountToPay));
                        }
                    }
                    this.movementsOfCashesToFinance.push(mov);
                }
                break;
            case 'days':
                let i = 1;
                this.days = this.movementOfCashForm.value.days;
                for (let mov of this.movementsOfCashesToFinance) {
                    mov.expirationDate = moment(moment(this.movementOfCash.expirationDate, 'YYYY-MM-DD').format('YYYY-MM-DD')).add(expirationDate, 'days').format('YYYY-MM-DD').toString();
                    expirationDate = (this.days * i) + 1;
                    i++;
                }
                break;
            case 'amountPaid':
                let totalAmount = 0;
                if (this.movementsOfCashesToFinance && this.movementsOfCashesToFinance.length > 0) {
                    for (let i = 0; i < this.movementsOfCashesToFinance.length; i++) {
                        if (this.movementsOfCashesToFinance[i].quota === movement.quota) {
                            this.movementsOfCashesToFinance[i].amountPaid = this.roundNumber.transform(parseFloat(newValue));
                        }
                        totalAmount += this.movementsOfCashesToFinance[i].amountPaid;
                        if (totalAmount > this.amountToPay) {
                            totalAmount -= this.movementsOfCashesToFinance[i].amountPaid;
                            this.movementsOfCashesToFinance[i].amountPaid = this.roundNumber.transform(this.amountToPay - totalAmount);
                            totalAmount += this.movementsOfCashesToFinance[i].amountPaid;
                        }
                    }
                }
                this.amountToPay = this.roundNumber.transform(totalAmount);
                this.setValuesForm();
                break;
            case 'expirationDate':

                let isEdit: boolean = false;
                let isSum: boolean = false;

                // Corroboramos que la fecha sea válida y comparamos que la fecha sea mayor a la actual
                if (!moment(newValue).isValid()) {
                    this.showMessage('Debe ingresar una fecha válida', 'info', true);
                }

                if (this.movementsOfCashesToFinance && this.movementsOfCashesToFinance.length > 0) {
                    for (let i = 0; i < this.movementsOfCashesToFinance.length; i++) {
                        if (this.movementsOfCashesToFinance[i].quota === movement.quota) {
                            // Editamos desde la fecha modificada en adelante
                            isEdit = true;
                            this.movementsOfCashesToFinance[i].expirationDate = moment(newValue).toString();
                        } else {
                            if (isEdit) {
                                if (!isSum) {
                                    // Se suma el valor de la fecha en un dia para que de correctamente los dias.
                                    expirationDate = this.days + 1;
                                    this.movementsOfCashesToFinance[i].expirationDate = moment(moment(this.movementsOfCashesToFinance[i - 1].expirationDate).format('YYYY-MM-DD')).add(expirationDate, 'days').format('YYYY-MM-DD').toString();
                                    isSum = true;
                                } else {
                                    expirationDate = this.days;
                                    this.movementsOfCashesToFinance[i].expirationDate = moment(moment(this.movementsOfCashesToFinance[i - 1].expirationDate).format('YYYY-MM-DD')).add(expirationDate, 'days').format('YYYY-MM-DD').toString();
                                }
                            }
                        }
                    }
                }
                break;
            default:
                break;
        }
    }

    async getMovementOfCashesByTransaction() {

        this.loading = true;

        let query = 'where="transaction":"' + this.transaction._id + '"';

        this._movementOfCashService.getMovementsOfCashes(query).subscribe(
            async result => {
                if (!result.movementsOfCashes) {
                    this.movementsOfCashes = new Array();
                    this.amountToPay = this.transactionAmount;
                    this.movementOfCash.amountPaid = this.transactionAmount;
                    this.paymentChange = '0.00';
                    this.amountPaid = 0;
                    this.updateAmounts('init');
                    if (this.fastPayment) {
                        this.addMovementOfCash();
                    }
                    this.loading = false;
                } else {
                    let op;
                    if (!this.movementsOfCashes || this.movementsOfCashes.length === 0) op = 'init';
                    this.movementsOfCashes = result.movementsOfCashes;
                    if (this.isChargedFinished()) {
                        if (await this.areValidAmounts()) {
                            if (this.transaction.totalPrice !== 0) {
                                this.activeModal.close({ movementsOfCashes: this.movementsOfCashes, movementOfArticle: this.movementOfArticle });
                            }
                        } else {
                            this.fastPayment = null;
                        }
                    } else {
                        this.cleanForm();
                        this.updateAmounts(op);
                    }
                    this.loading = false;
                }
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public isChargedFinished(): boolean {

        let chargedFinished: boolean = false;
        let amountPaid = 0;

        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
            for (let movement of this.movementsOfCashes) {
                amountPaid += this.roundNumber.transform(movement.amountPaid);
            }
        }

        if (this.roundNumber.transform(amountPaid) >= this.roundNumber.transform(this.transactionAmount)) {
            chargedFinished = true;
        }

        return chargedFinished;
    }

    async openModal(op: string, movement: MovementOfCash) {

        let modalRef;
        switch (op) {
            case 'delete':
                modalRef = this._modalService.open(DeleteMovementOfCashComponent, { size: 'lg', backdrop: 'static' });
                modalRef.componentInstance.movementOfCash = movement;
                modalRef.result.then(async (result) => {
                    if (result === 'delete_close') {
                        if (this.transaction.type.requestArticles) {

                            if ((movement.discount && movement.discount !== 0) ||
                                (movement.surcharge && movement.surcharge !== 0)) {

                                let salePrice = 0;
                                if (movement.discount && movement.discount !== 0) {
                                    salePrice = movement.amountPaid * movement.discount / 100;
                                } else if (movement.surcharge && movement.surcharge !== 0) {
                                    salePrice = movement.amountPaid * movement.surcharge / 100;
                                }

                                let query = 'where="transaction":"' + this.transaction._id + '","salePrice":' + salePrice + '';

                                await this.getMovementsOfArticles(query).then(
                                    async movementsOfArticles => {
                                        if (movementsOfArticles && movementsOfArticles.length > 0) {
                                            await this.deleteMovementOfArticle(movementsOfArticles[0]).then(
                                                async movementOfArticle => {
                                                    if (movementOfArticle) {
                                                        this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice - movementOfArticle.salePrice);
                                                        await this.updateTransaction().then(
                                                            transaction => {
                                                                if (transaction) {
                                                                    this.transaction = transaction;
                                                                    this.keyboard.setInput('');
                                                                    this.getMovementOfCashesByTransaction();
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        } else {
                                            this.getMovementOfCashesByTransaction();
                                        }
                                    }
                                );
                            } else {
                                this.getMovementOfCashesByTransaction();
                            }
                        } else {
                            if (movement.discount && movement.discount !== 0) {
                                this.transaction.totalPrice += this.roundNumber.transform(movement.amountPaid * movement.discount / 100);
                            } else if (movement.surcharge && movement.surcharge !== 0) {
                                this.transaction.totalPrice -= this.roundNumber.transform(movement.amountPaid * movement.surcharge / 100);
                            }
                            await this.updateTransaction().then(
                                async transaction => {
                                    if (transaction) {
                                        this.transaction = transaction;
                                        if (movement.type.checkDetail) {
                                            let query = `where="number":"${movement.number}","type":"${movement.type._id}"`;
                                            await this.getMovementsOfCashes(query).then(
                                                async movementsOfCashes => {
                                                    if (movementsOfCashes && movementsOfCashes.length > 0) {
                                                        movementsOfCashes[0].statusCheck = StatusCheck.Available;
                                                        await this.updateMovementOfCash(movementsOfCashes[0]).then(
                                                            movementOfCash => {
                                                                if (movementOfCash) {
                                                                    this.getMovementOfCashesByTransaction();
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        this.getMovementOfCashesByTransaction();
                                                    }
                                                }
                                            );
                                        } else {
                                            this.getMovementOfCashesByTransaction();
                                        }
                                    }
                                }
                            );
                        }
                    }
                });
                break;
            case 'list-movements-of-cashes':
                modalRef = this._modalService.open(SelectChecksComponent, { size: 'lg', backdrop: 'static' });
                // MANDAMOS LÍMITE DE MONTO A SELECCIONAR
                modalRef.componentInstance.transactionAmount = this.roundNumber.transform(this.transaction.totalPrice - this.movementOfCashForm.value.amountPaid);
                modalRef.componentInstance.paymentMethod = this.paymentMethodSelected;
                modalRef.result.then(async (result) => {

                    if (result && result.movementsOfCashes && result.movementsOfCashes.length > 0) {

                        let isSaved = true; // SE UTILIZA PARA SABER SI ALGUNO DE TODOS LOS METODOS DE PAGO COPIADOS SE GUARDARON CORRECTAMENTE, CASO CONTRARIO PARAR EL PROCESO

                        for (let mov of result.movementsOfCashes) {

                            if (isSaved) {

                                this.movementOfCash.titular = mov.titular;
                                this.movementOfCash.amountPaid = mov.amountPaid;
                                this.movementOfCash.expirationDate = mov.expirationDate;
                                this.movementOfCash.date = this.movementOfCashForm.value.date;
                                this.movementOfCash.observation = mov.observation;
                                this.movementOfCash.deliveredBy = mov.deliveredBy;
                                this.movementOfCash.CUIT = mov.CUIT;
                                this.movementOfCash.bank = mov.bank;
                                this.movementOfCash.quota = mov.quota;
                                this.movementOfCash.transaction = this.transaction;
                                this.movementOfCash.number = mov.number;
                                this.movementOfCash.receiver = mov.receiver;
                                this.movementOfCash.type = mov.type;
                                this.movementOfCash.statusCheck = StatusCheck.Closed;

                                if (await this.isValidAmount(true)) {

                                    await this.saveMovementOfCash().then(
                                        async movementOfCash => {
                                            if (movementOfCash) {

                                                this.cleanForm();

                                                // CAMBIAMOS ESTADO DE METODO DE PAGO RELACIONADO EJ. CHEQUE
                                                mov.statusCheck = StatusCheck.Closed;
                                                mov.amount = mov.amountPaid;

                                                // ACTUALIZAMOS ESTADO METODO DE PAGO RELACIONADO EJ. CHEQUEUALIZAMOS ESTADO METODO DE PAGO RELACIONADO EJ. CHEQUE
                                                await this.updateMovementOfCash(mov).then(
                                                    async movementOfCash => {
                                                        if (!movementOfCash) {
                                                            isSaved = false;
                                                        }
                                                    }
                                                );
                                            } else {
                                                isSaved = false;
                                            }
                                        }
                                    );
                                }
                            }
                        }
                        if (isSaved) {
                            this.getMovementOfCashesByTransaction();
                        }
                    }
                });
                break;
            default: ;
        }
    };

    async finish() {

        if (await this.areValidAmounts()) {
            let paid = 0;
            for (let mov of this.movementsOfCashes) {
                paid += mov.amountPaid;
            }
            if (this.transaction.totalPrice === 0) {
                this.transaction.totalPrice = this.roundNumber.transform(paid);
                await this.updateTransaction().then(
                    transaction => {
                        if (transaction) {
                            this.transaction = transaction;
                            if (this.checkPrices()) {
                                this.activeModal.close({ movementsOfCashes: this.movementsOfCashes, movementOfArticle: this.movementOfArticle });
                            } else {
                                this.showMessage('Ocurrió un error al querer finalizar la transacción, inténtelo nuevamente.', 'info', true);
                            }
                        }
                    }
                );
            } else {
                if (this.transaction.totalPrice < paid) {
                    this.activeModal.close({ movementsOfCashes: this.movementsOfCashes, movementOfArticle: this.movementOfArticle });
                } else {
                    this.showMessage('La suma de métodos de pago debe ser igual o mayor al de la transacción.', 'info', true);
                }
            }
        } else {
            this.fastPayment = null;
        }
    }

    //FUNCIÓN PARA CONTROLAR QUE LA SUMA DE PRECIO DE ARTÍCULOS SEA IGUAL AL TOTAL DE LA TRANSACCIÓN
    private checkPrices(): boolean {

        let isValid: boolean = false;
        let totalPrice: number = 0;

        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
            for (let movementOfCash of this.movementsOfCashes) {
                totalPrice += this.roundNumber.transform(movementOfCash.amountPaid);
            }
        }

        if (this.roundNumber.transform(totalPrice) === this.roundNumber.transform(this.transaction.totalPrice)) {
            isValid = true;
        }

        return isValid;
    }

    public getMovementsOfCashes(query?: string): Promise<MovementOfCash[]> {

        return new Promise<MovementOfCash[]>((resolve, reject) => {

            this._movementOfCashService.getMovementsOfCashes(query).subscribe(
                async result => {
                    if (result && result.movementsOfCashes) {
                        resolve(result.movementsOfCashes);
                    } else {
                        resolve(null);
                    }
                },
                error => {
                    this.showMessage(error.body, "info", true);
                    resolve(null);
                }
            )
        });
    }

    public updateMovementOfCash(movementOfCash: MovementOfCash): Promise<MovementOfCash> {

        return new Promise<MovementOfCash>((resolve, reject) => {

            this._movementOfCashService.updateMovementOfCash(movementOfCash).subscribe(
                async result => {
                    if (result && result.movementOfCash) {
                        resolve(result.movementOfCash);
                    } else {
                        if (result && result.message && result.message !== "") this.showMessage(result.message, "info", true);
                        resolve(null);
                    }
                },
                error => {
                    this.showMessage(error.body, "info", true);
                    resolve(null);
                }
            )
        });
    }

    public getMovementsOfArticles(query?: string): Promise<MovementOfArticle[]> {

        return new Promise<MovementOfArticle[]>((resolve, reject) => {

            this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
                result => {
                    if (!result.movementsOfArticles) {
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

    public deleteMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {

        return new Promise<MovementOfArticle>((resolve, reject) => {

            this._movementOfArticleService.deleteMovementOfArticle(movementOfArticle._id).subscribe(
                result => {
                    if (!result.movementOfArticle) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(movementOfArticle);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public getPaymentMethods(): void {

        this.loading = true;

        this._paymentMethodService.getPaymentMethods().subscribe(
            result => {
                if (!result.paymentMethods) {
                    if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                } else {
                    this.paymentMethods = result.paymentMethods;
                    this.movementOfCash.type = this.paymentMethods[0];
                    this.paymentMethodSelected = this.movementOfCash.type;
                    if (this.movementOfCash.type.discount) {
                        this.movementOfCash.discount = this.movementOfCash.type.discount;
                    } else {
                        this.movementOfCash.discount = 0;
                    }
                    if (this.movementOfCash.type.surcharge) {
                        this.movementOfCash.surcharge = this.movementOfCash.type.surcharge;
                    } else {
                        this.movementOfCash.surcharge = 0;
                    }
                    if (this.movementOfCash.type.commission) {
                        this.percentageCommission = this.movementOfCash.type.commission;
                    } else {
                        this.percentageCommission = 0;
                    }
                    this.getMovementOfCashesByTransaction();
                }
                this.loading = false;
            },
            error => {
                this.showMessage(error._body, 'danger', false);
                this.loading = false;
            }
        );
    }

    public changeAmountToPay(): void {
        this.keyboard.setInput(this.movementOfCashForm.value.amountToPay.toString());
        this.updateAmounts('amountToPay');
    }

    public updateAmounts(op?: string): void {

        if (op === 'amountToPay') {
            if (typeof this.movementOfCashForm.value.amountToPay === 'string') this.movementOfCashForm.value.amountToPay = parseFloat(this.movementOfCashForm.value.amountToPay);
            this.amountToPay = this.movementOfCashForm.value.amountToPay;
        } else {
            this.amountPaid = 0;
            if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
                for (let movement of this.movementsOfCashes) {
                    this.amountPaid += movement.amountPaid;
                }
            }
        }

        if (op !== 'amountToPay' && this.transaction.totalPrice !== 0) {
            this.amountToPay = this.transactionAmount - this.amountPaid - this.amountDiscount;
            this.keyboard.setInput('');
        }

        this.movementOfCash.discount = this.paymentMethodSelected.discount;
        this.movementOfCash.surcharge = this.paymentMethodSelected.surcharge;

        if (this.movementOfCash.discount &&
            this.movementOfCash.discount !== 0) {
            this.transactionAmount = this.transaction.totalPrice - (this.amountToPay * this.movementOfCash.discount / 100);
        } else if (this.movementOfCash.surcharge &&
            this.movementOfCash.surcharge !== 0) {
            this.transactionAmount = this.transaction.totalPrice + (this.amountToPay * this.movementOfCash.surcharge / 100);
        } else {
            this.transactionAmount = this.transaction.totalPrice;
        }

        if (op !== 'amountToPay' && this.transaction.totalPrice !== 0) {
            this.amountToPay = this.transactionAmount - this.amountPaid;
        }

        if (this.transaction.totalPrice !== 0) {
            this.paymentChange = (this.amountPaid + this.amountToPay - this.transactionAmount).toFixed(2);
            if (parseFloat(this.paymentChange) < 0) {
                this.paymentChange = '0.00';
            }
        }

        this.amountDiscount = this.transactionAmount - this.transaction.totalPrice;

        if (this.paymentMethodSelected.allowToFinance) {
            this.calculateQuotas('quotas');
        }

        if (op === 'init') {
            this.keyboard.setInput('');
        }

        this.movementOfCash.observation = this.movementOfCashForm.value.observation;
        this.movementOfCash.number = this.movementOfCashForm.value.number;
        this.movementOfCash.expirationDate = this.movementOfCashForm.value.expirationDate;
        this.movementOfCash.bank = this.movementOfCashForm.value.bank;
        this.movementOfCash.deliveredBy = this.movementOfCashForm.value.deliveredBy;
        this.movementOfCash.receiver = this.movementOfCashForm.value.receiver;
        this.movementOfCash.titular = this.movementOfCashForm.value.titular;
        this.movementOfCash.CUIT = this.movementOfCashForm.value.CUIT;
        this.percentageCommission = this.paymentMethodSelected.commission;

        this.setValuesForm();
    }

    async isValidAmount(isCopy: boolean = false) {

        return new Promise(async resolve => {

            if (this.paymentMethodSelected.checkDetail && !isCopy) {
                let query = `where="number":"${this.movementOfCashForm.value.number}","type":"${this.paymentMethodSelected._id}","statusCheck":"Disponible"`;
                await this.getMovementsOfCashes(query).then(
                    movementsOfCashes => {
                        if (movementsOfCashes && movementsOfCashes.length > 0) {
                            resolve(false);
                            this.showMessage(`El ${this.paymentMethodSelected.name} número ${this.movementOfCashForm.value.number} ya existe`, 'info', true);
                        }
                    }
                );
            }

            if (this.transaction.totalPrice !== 0 &&
                this.roundNumber.transform(this.amountPaid + this.amountToPay) > this.roundNumber.transform(this.transactionAmount) &&
                !this.paymentMethodSelected.acceptReturned) {
                resolve(false);
                this.showMessage("El medio de pago " + this.paymentMethodSelected.name + " no acepta vuelto, por lo tanto el monto a pagar no puede ser mayor que el de la transacción.", 'info', true);
            }

            if (this.movementOfCash.discount && this.movementOfCash.discount > 0 &&
                this.amountToPay > this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.discount / 100) + this.transaction.totalPrice) &&
                !this.paymentMethodSelected.acceptReturned) {
                resolve(false);
                this.showMessage("El monto ingresado no puede ser mayor a " + this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.discount / 100)) + '.', 'info', true);
            }

            if (this.movementOfCash.surcharge && this.movementOfCash.surcharge > 0 &&
                this.amountToPay > this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.surcharge / 100) + this.transaction.totalPrice) &&
                !this.paymentMethodSelected.acceptReturned) {
                resolve(false);
                this.showMessage("El monto ingresado no puede ser mayor a " + this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.surcharge / 100) + this.transaction.totalPrice) + '.', 'info', true);
            }

            if (!this.movementOfCash.expirationDate || !moment(this.movementOfCash.expirationDate).isValid()) {
                resolve(false);
                this.showMessage('Debe ingresar fecha de vencimiento de pago válida', 'info', true);
            }

            if (!this.movementOfCash || !this.paymentMethodSelected) {
                resolve(false);
                this.showMessage('Debe seleccionar un medio de pago válido', 'info', true);
            }

            if (this.paymentMethodSelected.checkDetail &&
                (!this.paymentMethodSelected.inputAndOuput ||
                    this.transaction.type.movement === Movements.Inflows) &&
                (!this.movementOfCashForm.value.number || this.movementOfCashForm.value.number === '')) {
                resolve(false);
                this.showMessage('Debe completar el numero de comprobante', 'info', true);
            } else if (this.paymentMethodSelected.checkDetail &&
                this.paymentMethodSelected.inputAndOuput &&
                this.transaction.type.movement === Movements.Outflows &&
                !isCopy) {
                resolve(false);
                this.showMessage('Debe seleccionar los métodos de pago en cartera a utilizar.', 'info', true);
            }

            if (this.paymentMethodSelected.allowToFinance) {
                let amountTotal = 0;
                if (this.movementsOfCashesToFinance && this.movementsOfCashesToFinance.length > 0) {
                    for (let mov of this.movementsOfCashesToFinance) {
                        amountTotal = this.roundNumber.transform(amountTotal + mov.amountPaid);
                        if (!moment(mov.expirationDate).isValid()) {
                            resolve(false);
                            this.showMessage('Debe ingresar fechas de vencimiento de pago válidas', 'info', true);
                        } else {
                            if ((moment(mov.expirationDate).diff(moment(this.transaction.startDate), 'days') < 0)) {
                                resolve(false);
                                this.showMessage('La fecha de vencimiento de pago no puede ser menor a la fecha de la transacción', 'info', true);
                            }
                        }
                    }
                }
                if (amountTotal !== this.movementOfCashForm.value.amountToPay) {
                    resolve(false);
                    this.showMessage("El monto total de las cuotas no puede ser distinto del monto a pagar.", "info", true);
                }
            }

            if (this.paymentMethodSelected.isCurrentAccount &&
                !this.transaction.company) {
                resolve(false);
                this.showMessage("Debe seleccionar una empresa para poder efectuarse un pago con el método " + this.paymentMethodSelected.name + ".", "info", true);
            }

            if (this.paymentMethodSelected.isCurrentAccount &&
                this.transaction.company &&
                !this.transaction.company.allowCurrentAccount) {
                resolve(false);
                this.showMessage("La empresa seleccionada no esta habilitada para cobrar con el método " + this.paymentMethodSelected.name + ".", "info", true);
            }

            if (this.amountToPay === 0 && !isCopy) {
                this.showMessage("El monto a pagar no puede ser 0.", 'info', true);
                resolve(false);
            }

            if (this.paymentMethodSelected.isCurrentAccount &&
                this.transaction.type.currentAccount === CurrentAccount.Charge) {
                resolve(false);
                this.showMessage("No se puede elegir el medio de pago " + this.paymentMethodSelected.name + " para el tipo de transacción " + this.transaction.type.name + " .", "info", true);
            }

            resolve(true);
        });
    }

    public changePercentageCommission() {

        this.getHolidays().then(result => {
            
            this.holidays = result;

            this.movementOfCash = Object.assign(this.movementOfCashForm.value);
            this.percentageCommission = this.movementOfCashForm.value.percentageCommission;
            this.daysCommission = moment(moment(this.movementOfCashForm.value.expirationDate).format('YYYY-MM-DD'), 'YYYY-MM-DD').diff(moment().format('YYYY-MM-DD'), 'days') + 4;
            if (moment(this.movementOfCashForm.value.expirationDate).day() === 6) {
                this.daysCommission += 2
            }
            if (moment(this.movementOfCashForm.value.expirationDate).day() === 7) {
                this.daysCommission += 1
            }

            if(this.holidays && this.holidays.length > 0){
                this.holidays.forEach(element => {
                    if(moment(this.movementOfCashForm.value.expirationDate).format('YYYY-MM-DD') === moment(element.date).format("YYYY-MM-DD")){
                        this.daysCommission += 1
                    }
                });
            }

            this.movementOfCash.commissionAmount = (this.amountToPay * this.percentageCommission / 100) * this.daysCommission;
            this.setValuesForm();

        });

    }

    public getHolidays(): Promise<Holiday[]> {
        return new Promise<Holiday[]>((resolve, reject) => {

            var project = {
                "date": 1,
                "operationType": 1
            }

            var match = {
                "operationType": { "$ne": "D" }
            }

            this.subscription.add(this._holidayService.getAll({}, match, {}, {}).subscribe(
                result => {
                    this.loading = false;
                    if (result.status === 200) {
                        resolve(result.result);
                    } else {
                        resolve(null)
                    }
                },
                error => resolve(null)
            ));
        });
    }

    public getBusinessDays(startDate, endDate) {
        var startDateMoment = moment(startDate);
        var endDateMoment = moment(endDate)
        var days = Math.round(startDateMoment.diff(endDateMoment, 'days') - startDateMoment.diff(endDateMoment, 'days') / 7 * 2);
        if (endDateMoment.day() === 6) {
            days--;
        }
        if (startDateMoment.day() === 7) {
            days--;
        }
        return days;
    }

    async areValidAmounts(): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {

            let paid = 0;

            for (let mov of this.movementsOfCashes) {
                paid += mov.amountPaid;

                if (!mov.expirationDate || !moment(mov.expirationDate).isValid()) {
                    this.showMessage('Debe ingresar fecha de vencimiento de pago válida', 'info', true);
                    resolve(false);
                }

                if (mov.type.isCurrentAccount &&
                    !this.transaction.company) {
                    this.showMessage("Debe seleccionar una empresa para poder efectuarse un pago con el método " + mov.type.name + ".", "info", true);
                    resolve(false);
                }

                if (mov.type.isCurrentAccount &&
                    this.transaction.company &&
                    !this.transaction.company.allowCurrentAccount) {
                    this.showMessage("La empresa seleccionada no esta habilitada para cobrar con el método " + mov.type.name + ".", "info", true);
                    resolve(false);
                }

                if (mov.type.isCurrentAccount &&
                    this.transaction.type.currentAccount === CurrentAccount.Charge) {
                    this.showMessage("No se puede elegir el medio de pago " + mov.type.name + " para el tipo de transacción " + this.transaction.type.name + " .", "info", true);
                    resolve(false);
                }
            }

            if (this.roundNumber.transform(paid) > this.roundNumber.transform(this.transactionAmount) && !this.transaction.type.allowZero) {
                this.showMessage("La suma de monto de medios de pago no puede ser mayor al de la transacción.", 'info', true);
                resolve(false);
            }

            if (this.transaction.totalPrice !== 0 && this.roundNumber.transform(paid) <= 0) {
                this.showMessage("La suma de monto de medios de pago no puede ser menor o igual a 0.", 'info', true);
                resolve(false);
            }

            resolve(true);
        });
    }

    async addMovementOfCash() {

        if (!this.fastPayment) {
            if (await this.isValidAmount()) {
                if (!this.paymentMethodSelected.allowToFinance) {
                    if (this.roundNumber.transform(this.amountPaid + this.amountToPay) > this.roundNumber.transform(this.transactionAmount)) {
                        this.movementOfCash.amountPaid = this.roundNumber.transform(this.amountToPay - this.roundNumber.transform(parseFloat(this.movementOfCashForm.value.paymentChange)));
                    } else {
                        this.movementOfCash.amountPaid = this.amountToPay;
                    }
                    this.movementOfCash.transaction = this.transaction;
                    this.movementOfCash.paymentChange = this.movementOfCashForm.value.paymentChange;
                    this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
                    this.movementOfCash.observation = this.movementOfCashForm.value.observation;
                    this.movementOfCash.expirationDate = moment(this.movementOfCash.expirationDate, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ssZ");

                    if (this.paymentMethodSelected.checkDetail) {
                        this.movementOfCash.receiver = this.movementOfCashForm.value.receiver;
                        this.movementOfCash.number = this.movementOfCashForm.value.number;
                        this.movementOfCash.bank = this.movementOfCashForm.value.bank;
                        this.movementOfCash.titular = this.movementOfCashForm.value.titular;
                        this.movementOfCash.CUIT = this.movementOfCashForm.value.CUIT;
                        this.movementOfCash.deliveredBy = this.movementOfCashForm.value.deliveredBy;
                        this.movementOfCash.statusCheck = StatusCheck.Closed;
                    } else {
                        this.movementOfCash.receiver = '';
                        this.movementOfCash.number = '';
                        this.movementOfCash.titular = '';
                        this.movementOfCash.CUIT = '';
                        this.movementOfCash.deliveredBy = '';
                        this.movementOfCash.statusCheck = StatusCheck.Closed;
                    }

                    if (this.paymentMethodSelected.inputAndOuput && this.transaction.type.movement === Movements.Inflows) {
                        this.movementOfCash.statusCheck = StatusCheck.Available;
                    }

                    await this.saveMovementOfCash().then(
                        async movementOfCash => {
                            if (movementOfCash) {
                                this.movementOfCash = movementOfCash;
                                if (this.transactionAmount !== this.transaction.totalPrice) {
                                    this.transaction.totalPrice = this.transactionAmount;
                                    if (this.transaction.type.requestArticles) {
                                        this.addMovementOfArticle();
                                    } else {
                                        await this.updateTransaction().then(
                                            transaction => {
                                                if (transaction) {
                                                    this.transaction = transaction;
                                                    this.keyboard.setInput('');
                                                    this.getMovementOfCashesByTransaction();
                                                }
                                            }
                                        );
                                    }
                                } else {
                                    this.movementsOfCashes = new Array();
                                    this.movementsOfCashes.push(this.movementOfCash);
                                    if (!this.fastPayment) {
                                        this.getMovementOfCashesByTransaction();
                                    } else {
                                        if (this.amountDiscount && this.amountDiscount !== 0) {
                                            this.addMovementOfArticle();
                                        } else {
                                            this.getMovementOfCashesByTransaction();
                                        }
                                    }
                                }
                            }
                        }
                    );
                } else {
                    await this.saveMovementsOfCashes().then(
                        movementsOfCashes => {
                            if (movementsOfCashes && movementsOfCashes.length > 0) {
                                this.getMovementOfCashesByTransaction();
                            }
                        }
                    );
                }
            } else {
                this.fastPayment = null;
            }
        } else {
            this.movementOfCash.transaction = this.transaction;
            this.movementOfCash.type = this.fastPayment;
            this.paymentMethodSelected = this.fastPayment;
            this.movementOfCash.expirationDate = moment(this.movementOfCash.expirationDate, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ssZ");
            this.movementOfCash.receiver = '';
            this.movementOfCash.number = '';
            this.movementOfCash.titular = '';
            this.movementOfCash.CUIT = '';
            this.movementOfCash.deliveredBy = '';
            this.movementOfCash.statusCheck == StatusCheck.Closed;
            this.movementOfCash.discount = this.movementOfCash.type.discount;
            this.movementOfCash.surcharge = this.movementOfCash.type.surcharge;
            if (this.fastPayment.observation) {
                this.movementOfCash.observation = this.fastPayment.observation;
            }
            if (this.movementOfCash.discount &&
                this.movementOfCash.discount !== 0) {
                this.amountDiscount = -this.roundNumber.transform(this.transaction.totalPrice * this.movementOfCash.discount / 100);
            } else if (this.movementOfCash.surcharge &&
                this.movementOfCash.surcharge !== 0) {
                this.amountDiscount = this.roundNumber.transform(this.transaction.totalPrice * this.movementOfCash.surcharge / 100);
            }
            this.transaction.totalPrice = this.transaction.totalPrice + this.amountDiscount;
            this.transactionAmount = this.transaction.totalPrice;
            this.movementOfCash.amountPaid = this.transactionAmount;

            if (await this.isValidAmount()) {
                await this.saveMovementOfCash().then(
                    async movementOfCash => {
                        if (movementOfCash) {
                            this.movementOfCash = movementOfCash;
                            if (this.transactionAmount !== this.transaction.totalPrice) {
                                this.transaction.totalPrice = this.transactionAmount;
                                if (this.transaction.type.requestArticles) {
                                    this.addMovementOfArticle();
                                } else {
                                    await this.updateTransaction().then(
                                        transaction => {
                                            if (transaction) {
                                                this.transaction = transaction;
                                                this.getMovementOfCashesByTransaction();
                                            }
                                        }
                                    );
                                }
                            } else {
                                this.movementsOfCashes = new Array();
                                this.movementsOfCashes.push(this.movementOfCash);
                                if (!this.fastPayment) {
                                    this.getMovementOfCashesByTransaction();
                                } else {
                                    if (this.amountDiscount && this.amountDiscount !== 0) {
                                        this.addMovementOfArticle();
                                    } else {
                                        this.getMovementOfCashesByTransaction();
                                    }
                                }
                            }
                        }
                    }
                );
            } else {
                this.fastPayment = null;
            }
        }
    }

    public cancel(): void {
        this.activeModal.close('cancel');
    }

    public saveMovementOfCash(): Promise<MovementOfCash> {
        return new Promise<MovementOfCash>((resolve, reject) => {
            this._movementOfCashService.saveMovementOfCash(this.movementOfCash).subscribe(
                result => {
                    if (!result.movementOfCash) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.movementOfCash);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    public saveMovementsOfCashes(): Promise<MovementOfCash[]> {

        return new Promise<MovementOfCash[]>((resolve, reject) => {

            this._movementOfCashService.saveMovementsOfCashes(this.movementsOfCashesToFinance).subscribe(
                result => {
                    if (!result.movementsOfCashes) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        this.hideMessage();
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

    async addMovementOfArticle() {

        let movementOfArticle = new MovementOfArticle();

        if (this.paymentMethodSelected.surcharge && this.paymentMethodSelected.surcharge > 0) {
            movementOfArticle.description = 'Pago con ' + this.paymentMethodSelected.name;
        } else if (this.paymentMethodSelected.discount && this.paymentMethodSelected.discount > 0) {
            movementOfArticle.description = "Pago con " + this.paymentMethodSelected.name;
        }
        movementOfArticle.amount = 1;
        movementOfArticle.salePrice = this.roundNumber.transform(this.amountDiscount);
        movementOfArticle.unitPrice = movementOfArticle.salePrice;
        movementOfArticle.costPrice = movementOfArticle.salePrice;
        movementOfArticle.markupPrice = 0.00;
        movementOfArticle.markupPercentage = 0.00;
        movementOfArticle.transaction = this.transaction;
        movementOfArticle.modifyStock = this.transaction.type.modifyStock;
        if (this.transaction.type.stockMovement) {
            movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
        }

        let taxes: Taxes[] = new Array();
        let tax: Taxes = new Taxes();
        if (Config.country === 'MX') {
            tax.percentage = 16;
        } else {
            tax.percentage = 21;
        }
        tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice / ((tax.percentage / 100) + 1)));
        tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100));

        movementOfArticle.basePrice = movementOfArticle.salePrice - tax.taxAmount;

        let query = `where="percentage":"${tax.percentage}"`;
        await this.getTaxes(query).then(
            async taxesAux => {
                if (taxesAux) {
                    tax.tax = taxesAux[0];
                    taxes.push(tax);
                    movementOfArticle.taxes = taxes;
                    await this.saveMovementOfArticle(movementOfArticle).then(
                        async movementOfArticle => {
                            if (movementOfArticle) {
                                if (movementOfArticle.taxes && movementOfArticle.taxes.length !== 0) {
                                    for (let movTax of movementOfArticle.taxes) {
                                        let exists: boolean = false;
                                        for (let transactionTax of this.transaction.taxes) {
                                            if (movTax.tax._id.toString() === transactionTax.tax._id.toString()) {
                                                transactionTax.taxAmount += movTax.taxAmount;
                                                transactionTax.taxBase += movTax.taxBase;
                                                this.transaction.basePrice += transactionTax.taxBase;
                                                exists = true;
                                            }
                                        }
                                        if (!exists) {
                                            this.transaction.taxes.push(movTax);
                                        }
                                    }
                                }
                                await this.updateTransaction().then(
                                    transaction => {
                                        if (transaction) {
                                            this.transaction = transaction;
                                            this.getMovementOfCashesByTransaction();
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    }

    public cleanForm(): void {
        this.movementOfCash = new MovementOfCash();
        this.movementOfCash.type = this.paymentMethodSelected;
        this.movementOfCash.transaction = this.transaction;
        this.buildForm();
    }

    async getTaxes(query: string): Promise<Tax[]> {

        return new Promise<Tax[]>((resolve, reject) => {

            this._taxService.getTaxes(query).subscribe(
                async result => {
                    if (!result.taxes) {
                        this.showMessage("Debe configurar el impuesto IVA para el realizar el descuento/recargo con " + this.paymentMethodSelected.name, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.taxes);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    this.loading = false;
                }
            );
        });
    }

    public saveMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {

        return new Promise<MovementOfArticle>((resolve, reject) => {

            this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(
                result => {
                    if (!result.movementOfArticle) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
                        resolve(null);
                    } else {
                        resolve(result.movementOfArticle);
                    }
                },
                error => {
                    this.showMessage(error._body, 'danger', false);
                    resolve(null);
                }
            );
        });
    }

    async updateTransaction() {

        return new Promise<Transaction>((resolve, reject) => {

            this.transaction.exempt = this.roundNumber.transform(this.transaction.exempt);
            this.transaction.discountAmount = this.roundNumber.transform(this.transaction.discountAmount);
            this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);

            this._transactionService.updateTransaction(this.transaction).subscribe(
                async result => {
                    if (!result.transaction) {
                        if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
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

    public orderBy(term: string, property?: string): void {

        if (this.orderTerm[0] === term) {
            this.orderTerm[0] = '-' + term;
        } else {
            this.orderTerm[0] = term;
        }
        this.propertyTerm = property;
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
