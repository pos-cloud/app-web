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
import { Transaction, TransactionState } from '../../transaction/transaction';
import { CurrentAccount, Movements, TransactionMovement } from '../../transaction-type/transaction-type';
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
import { TranslateMePipe } from 'app/main/pipes/translate-me';
import { ToastrService } from 'ngx-toastr';
import { Subscription, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import { AccountSeatService } from 'app/components/account-seat/account-seat.service';
import { CompanyService } from 'app/components/company/company.service';
import { Currency } from 'app/components/currency/currency';
import { CurrencyService } from 'app/components/currency/currency.service';
import Resulteable from 'app/util/Resulteable';


@Component({
    selector: 'app-add-movement-of-cash',
    templateUrl: './add-movement-of-cash.component.html',
    styleUrls: [
        "./../../../../../node_modules/simple-keyboard/build/css/index.css",
        "./add-movement-of-cash.component.scss"
    ],
    providers: [NgbAlertConfig, RoundNumberPipe, TranslateMePipe],
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
    public percentageAdministrativeExpense: number = 0.00;
    public percentageOtherExpense: number = 0.00;
    public daysCommission: number = 0;
    public roundNumber = new RoundNumberPipe();
    public quotas: number = 1;
    public days: number = 1;
    public period: string = 'Mensual';
    public interestPercentage: number = 0;
    public orderTerm: string[] = ['expirationDate'];
    public propertyTerm: string;
    public holidays: Holiday[];
    public banks: Bank[];
    public movementOfArticle: MovementOfArticle;
    public keyboard: Keyboard;
    public lastVatOfExpenses: number = 0;
    public interestType: string = 'Interés Simple';
    public totalInterestAmount: number = 0;
    public totalTaxAmount: number = 0;
    public focus$: Subject<string>[] = new Array();
    public currencyNative: Currency = Config.currency;
    public quotationNative: number = 0;
    public quotationAmount: number = 0;

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
        private _accountSeatService: AccountSeatService,
        private _companyService: CompanyService,
        public alertConfig: NgbAlertConfig,
        public _modalService: NgbModal,
        private _taxService: TaxService,
        public _movementOfArticleService: MovementOfArticleService,
        public translatePipe: TranslateMePipe,
        private _toastr: ToastrService,
        private _currencyService: CurrencyService
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

    async ngOnInit() {
        this.transactionAmount = this.transaction.totalPrice;
        this.movementOfCash.expirationDate = (this.transaction.endDate) ? this.transaction.endDate : this.transaction.startDate;
        this.buildForm();
        this.getPaymentMethods();
        this.getHolidays()
            .then(result => {
                this.holidays = result;
            });
    }

    ngAfterViewInit() {
        this.focusEvent.emit(true);
        if (this.transaction.type.showKeyboard) {
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
        }
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
        if (this.keyboard) this.keyboard.setInput(event.target.value);
    };

    handleShift = () => {
        if (this.keyboard) {
            let currentLayout = this.keyboard.options.layoutName;
            let shiftToggle = currentLayout === "default" ? "shift" : "default";
            this.keyboard.setOptions({
                layoutName: shiftToggle
            });
        }
    };

    public buildForm(): void {
        this.movementOfCashForm = this._fb.group({
            'transactionAmount': [parseFloat(this.roundNumber.transform(this.transactionAmount)).toFixed(2), [Validators.required]],
            'paymentMethod': [this.movementOfCash.type, [Validators.required]],
            'percentageCommission': [this.percentageCommission, []],
            'percentageAdministrativeExpense': [this.percentageAdministrativeExpense, []],
            'percentageOtherExpense': [this.percentageOtherExpense, []],
            'daysCommission': [this.daysCommission, []],
            'amountToPay': [this.amountToPay, []],
            'amountPaid': [this.amountPaid, []],
            'amountDiscount': [this.amountDiscount, []],
            'paymentChange': [this.movementOfCash.paymentChange, []],
            'observation': [this.movementOfCash.observation, []],
            'discount': [this.movementOfCash.type.discount, []],
            'surcharge': [this.movementOfCash.type.surcharge, []],
            'commissionAmount': [this.movementOfCash.commissionAmount, []],
            'administrativeExpenseAmount': [this.movementOfCash.administrativeExpenseAmount, []],
            'otherExpenseAmount': [this.movementOfCash.otherExpenseAmount, []],
            'expirationDate': [moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'), []],
            'receiver': [this.movementOfCash.receiver, []],
            'number': [this.movementOfCash.number, [Validators.pattern("^[0-9]*$")]],
            'bank': [(this.movementOfCash.bank) ? this.movementOfCash.bank : null, []],
            'titular': [this.movementOfCash.titular, []],
            'CUIT': [this.movementOfCash.CUIT, []],
            'deliveredBy': [this.movementOfCash.deliveredBy, []],
            'quotas': [this.quotas, []],
            'days': [this.days, []],
            'period': [this.period, []],
            'interestPercentage': [this.interestPercentage, []],
            'taxPercentage': [this.movementOfCash.taxPercentage, []],
            'interestType': [this.interestType],
            'quotationNative': [this.quotationNative],
            'quotationAmount': [this.quotationAmount],
        });

        this.movementOfCashForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged();
    }

    public changePaymentMethod(paymentMethod: PaymentMethod): void {
        this.paymentMethodSelected = paymentMethod;
        this.updateAmounts('paymentMethod');
    }

    public setValuesForm(amountToPay?: number): void {
        if (amountToPay) this.amountToPay = amountToPay;
        if (!this.movementOfCash.observation) this.movementOfCash.observation = '';
        if (!this.movementOfCash.amountPaid) this.movementOfCash.amountPaid = 0.00;
        if (!this.movementOfCash.discount) this.movementOfCash.discount = 0.00;
        if (!this.movementOfCash.surcharge) this.movementOfCash.surcharge = 0.00;
        if (!this.movementOfCash.commissionAmount) this.movementOfCash.commissionAmount = 0.00;
        if (!this.movementOfCash.administrativeExpenseAmount) this.movementOfCash.administrativeExpenseAmount = 0.00;
        if (!this.movementOfCash.otherExpenseAmount) this.movementOfCash.otherExpenseAmount = 0.00;
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

        if (!this.percentageCommission) {
            this.percentageCommission = 0;
        }

        if (!this.percentageAdministrativeExpense) {
            this.percentageAdministrativeExpense = 0;
        }

        if (!this.percentageOtherExpense) {
            this.percentageOtherExpense = 0;
        }

        if (this.paymentMethodSelected.currency) {
            this.quotationNative = this.paymentMethodSelected.currency.quotation;
            this.quotationAmount = this.amountToPay * this.quotationNative;
        }

        const values = {
            'transactionAmount': parseFloat(this.roundNumber.transform(this.transactionAmount).toFixed(2)),
            'paymentMethod': this.paymentMethodSelected,
            'amountToPay': parseFloat(this.roundNumber.transform(this.amountToPay).toFixed(2)),
            'amountPaid': parseFloat(this.roundNumber.transform(this.amountPaid).toFixed(2)),
            'amountDiscount': parseFloat(this.roundNumber.transform(this.amountDiscount).toFixed(2)),
            'paymentChange': parseFloat(this.roundNumber.transform(this.paymentChange).toFixed(2)),
            'percentageCommission': parseFloat(this.roundNumber.transform(this.percentageCommission, 3).toFixed(3)),
            'percentageAdministrativeExpense': parseFloat(this.roundNumber.transform(this.percentageAdministrativeExpense, 3).toFixed(3)),
            'percentageOtherExpense': parseFloat(this.roundNumber.transform(this.percentageOtherExpense, 3).toFixed(3)),
            'daysCommission': this.daysCommission,
            'observation': this.movementOfCash.observation,
            'discount': parseFloat(this.roundNumber.transform(this.movementOfCash.discount).toFixed(2)),
            'surcharge': parseFloat(this.roundNumber.transform(this.movementOfCash.surcharge).toFixed(2)),
            'commissionAmount': parseFloat(this.roundNumber.transform(this.movementOfCash.commissionAmount).toFixed(2)),
            'administrativeExpenseAmount': parseFloat(this.roundNumber.transform(this.movementOfCash.administrativeExpenseAmount).toFixed(2)),
            'otherExpenseAmount': parseFloat(this.roundNumber.transform(this.movementOfCash.otherExpenseAmount).toFixed(2)),
            'expirationDate': moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'),
            'receiver': this.movementOfCash.receiver,
            'number': this.movementOfCash.number,
            'bank': (this.movementOfCash.bank) ? this.movementOfCash.bank : null,
            'titular': this.movementOfCash.titular,
            'CUIT': this.movementOfCash.CUIT,
            'deliveredBy': this.movementOfCash.deliveredBy,
            'quotas': this.quotas,
            'days': this.days,
            'period': this.period,
            'interestPercentage': this.interestPercentage,
            'taxPercentage': this.movementOfCash.taxPercentage,
            'interestType': this.interestType,
            'quotationNative': this.quotationNative,
            'quotationAmount': this.quotationAmount
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
            this.paymentChange = ((this.movementOfCashForm.value.amountToPay + this.movementOfCashForm.value.amountPaid) - this.movementOfCashForm.value.transactionAmount).toFixed(2);
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

    public searchBanks = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            tap(() => this.loading = true),
            switchMap(term =>
                this.getBanks((term && term !== '') ?
                    {
                        $or: [
                            { name: { $regex: term, $options: 'i' } },
                            { code: { $regex: term, $options: 'i' } },
                            { account: { $regex: term, $options: 'i' } },
                            { agency: { $regex: term, $options: 'i' } }
                        ]
                    } :
                    {}).then(
                        banks => {
                            return banks;
                        }
                    )
            ),
            tap(() => this.loading = false)
        )

    public formatterBanks = (x: Bank) => x.name;

    public getBanks(match: {}): Promise<Bank[]> {
        this.loading = true;
        return new Promise<Bank[]>((resolve, reject) => {
            match["operationType"] = { "$ne": "D" };
            this.subscription.add(this._bankService.getAll({
                project: {
                    _id: 1,
                    code: { $toString: "$code" },
                    name: 1,
                    account: 1,
                    agency: { $toString: "$agency" },
                },
                match,
                sort: { name: 1 },
                limit: 10,
            }).subscribe(
                result => {
                    this.loading = false;
                    (result.status === 200) ? resolve(result.result) : reject(result);
                },
                error => reject(error)
            ));
        });
    }

    public calculateQuotas(field: string, newValue?: any, movement?: MovementOfCash): void {
        this.quotas = this.movementOfCashForm.value.quotas;
        this.days = this.movementOfCashForm.value.days;
        this.period = this.movementOfCashForm.value.period;
        this.interestPercentage = this.movementOfCashForm.value.interestPercentage;
        this.movementOfCash.taxPercentage = this.movementOfCashForm.value.taxPercentage;
        this.interestType = this.movementOfCashForm.value.interestType;
        let expirationDate: number = 0;
        let amountTotal: number = 0;
        let amountToPayTemp: number = this.amountToPay + this.movementOfCash.commissionAmount + this.movementOfCash.administrativeExpenseAmount + this.movementOfCash.otherExpenseAmount;
        // if (!this.paymentMethodSelected.payFirstQuota && this.period === 'Diario') {
        //     expirationDate += this.days;
        // }
        switch (field) {
            case 'quotas':
                this.movementsOfCashesToFinance = new Array();
                this.totalInterestAmount = 0;
                this.totalTaxAmount = 0;
                for (let i = 0; i < this.quotas; i++) {
                    var mov: MovementOfCash = new MovementOfCash();
                    mov.expirationDate = mov.date;
                    mov.transaction = this.transaction;
                    mov.type = this.paymentMethodSelected;
                    mov.observation = this.movementOfCash.observation;
                    mov.quota = i + 1;
                    switch (this.interestType) {
                        case 'Interés Simple':
                            mov.interestAmount = this.roundNumber.transform((this.roundNumber.transform(amountToPayTemp) * this.interestPercentage / 100) / this.quotas);
                            mov.taxAmount = this.roundNumber.transform(mov.interestAmount * this.movementOfCash.taxPercentage / 100);
                            mov.capital = this.roundNumber.transform(amountToPayTemp / this.quotas);
                            mov.amountPaid = this.roundNumber.transform(mov.capital + mov.interestAmount + mov.taxAmount);
                            amountTotal += mov.amountPaid;
                            if (i === (this.quotas - 1)) {
                                if (amountTotal !== (amountToPayTemp + this.totalInterestAmount + this.totalTaxAmount)) {
                                    mov.amountPaid = this.roundNumber.transform(mov.amountPaid - (amountTotal - (amountToPayTemp + this.totalInterestAmount + this.totalTaxAmount)));
                                }
                            }
                            break;
                        case 'Francés':
                            let tasa: number = 0.0000000001;
                            if (this.interestPercentage > 0) {
                                tasa = (this.interestPercentage / 100) / 12;
                            }
                            let factorTotal: number = (Math.pow((1 + tasa), this.quotas));
                            let factorQuota: number = (Math.pow((1 + tasa), ((this.quotas + 1) - mov.quota)));
                            mov.amountPaid = this.roundNumber.transform((amountToPayTemp * tasa * factorTotal) / (factorTotal - 1));
                            mov.amountPaid = this.roundNumber.transform(mov.amountPaid);
                            mov.capital = this.roundNumber.transform(mov.amountPaid / factorQuota);
                            mov.capital = this.roundNumber.transform(mov.capital);
                            mov.interestAmount = this.roundNumber.transform(mov.amountPaid - mov.capital);
                            mov.interestAmount = this.roundNumber.transform(mov.interestAmount);
                            if (this.movementOfCash.taxPercentage > 0) {
                                mov.taxAmount = this.roundNumber.transform(mov.interestAmount * this.movementOfCash.taxPercentage / 100);
                            } else {
                                mov.taxAmount = 0;
                            }
                            mov.taxAmount = this.roundNumber.transform(mov.taxAmount);
                            mov.amountPaid += mov.taxAmount;
                            mov.amountPaid = this.roundNumber.transform(mov.amountPaid);
                            amountTotal += mov.amountPaid;
                            amountTotal = this.roundNumber.transform(amountTotal);
                            break;
                        default:
                            mov.interestAmount = this.roundNumber.transform((this.roundNumber.transform(amountToPayTemp) * this.interestPercentage / 100) / this.quotas);
                            mov.taxAmount = this.roundNumber.transform(mov.interestAmount * this.movementOfCash.taxPercentage / 100);
                            mov.capital = this.roundNumber.transform(amountToPayTemp / this.quotas);
                            mov.amountPaid = this.roundNumber.transform(mov.capital + mov.interestAmount + mov.taxAmount);
                            amountTotal += mov.amountPaid;
                            if (i === (this.quotas - 1)) {
                                if (amountTotal !== (amountToPayTemp + this.totalInterestAmount + this.totalTaxAmount)) {
                                    mov.amountPaid = this.roundNumber.transform(mov.amountPaid - (amountTotal - (amountToPayTemp + this.totalInterestAmount + this.totalTaxAmount)));
                                }
                            }
                            break;
                    }
                    this.totalInterestAmount += mov.interestAmount;
                    this.totalTaxAmount += mov.taxAmount;
                    this.totalInterestAmount = this.roundNumber.transform(this.totalInterestAmount);
                    this.totalTaxAmount = this.roundNumber.transform(this.totalTaxAmount);
                    this.movementsOfCashesToFinance.push(mov);
                }
                this.setValuesForm();
                this.calculateQuotas(
                    'expirationDate',
                    moment(moment(this.movementOfCash.expirationDate, 'YYYY-MM-DD').format('YYYY-MM-DD')).add(expirationDate, 'days').format('YYYY-MM-DD').toString(),
                    this.movementsOfCashesToFinance[0]
                );
                break;
            case 'amountPaid':
                let totalAmount = 0;
                if (this.movementsOfCashesToFinance && this.movementsOfCashesToFinance.length > 0) {
                    for (let i = 0; i < this.movementsOfCashesToFinance.length; i++) {
                        let mov: MovementOfCash = this.movementsOfCashesToFinance[i];
                        if (mov.quota === movement.quota) {
                            mov.amountPaid = this.roundNumber.transform(parseFloat(newValue));
                        }
                        totalAmount += mov.amountPaid;
                        if (totalAmount > this.amountToPay) {
                            totalAmount -= mov.amountPaid;
                            mov.amountPaid = this.roundNumber.transform(this.amountToPay - totalAmount);
                            totalAmount += mov.amountPaid;
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
                    this.showToast(null, 'info', 'Debe ingresar una fecha válida');
                }
                if (this.movementsOfCashesToFinance && this.movementsOfCashesToFinance.length > 0) {
                    for (let i = 0; i < this.movementsOfCashesToFinance.length; i++) {
                        let mov: MovementOfCash = this.movementsOfCashesToFinance[i];
                        if (mov.quota === movement.quota) {
                            // Editamos desde la fecha modificada en adelante
                            isEdit = true;
                            mov.expirationDate = moment(newValue).format('YYYY-MM-DD').toString();
                        } else {
                            if (isEdit) {
                                switch (this.period) {
                                    case 'Diario':
                                        mov.expirationDate = moment(moment(this.movementsOfCashesToFinance[i - 1].expirationDate).format('YYYY-MM-DD')).add(this.days, 'days').format('YYYY-MM-DD').toString();
                                        break;
                                    case 'Mensual':
                                        mov.expirationDate = moment(moment(this.movementsOfCashesToFinance[i - 1].expirationDate).format('YYYY-MM-DD')).add(this.days, 'month').format('YYYY-MM-DD').toString();
                                        break;
                                    case 'Anual':
                                        mov.expirationDate = moment(moment(this.movementsOfCashesToFinance[i - 1].expirationDate).format('YYYY-MM-DD')).add(this.days, 'year').format('YYYY-MM-DD').toString();
                                        break;
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

    async getMovementOfCashesByTransaction(op?: string) {

        // VERIFICAR SI EL ULTIMO METODO TIENE CURRENCY Y HAY Q DAR DE ALTA AUTOMATICO LO DAMOS AQUI SINO OBTENEMOS TODO
        if (op !== 'delete' &&
        this.movementsOfCashes &&
        this.movementsOfCashes.length > 0 &&
        this.movementsOfCashes[0].operationType !== 'D' &&
        this.movementsOfCashes[0].type.currency &&
        this.currencyNative &&
        this.movementsOfCashes[0].type.currency.toString() !== this.currencyNative._id.toString()) {
            let lastMovement: MovementOfCash = this.movementsOfCashes[0];
            this.amountPaid = -(lastMovement.amountPaid * this.movementOfCashForm.value.quotationNative);
            for (let paymentMethod of this.paymentMethods) {
                if (paymentMethod.currency && paymentMethod.currency._id.toString() === this.currencyNative._id.toString()) {
                    this.paymentMethodSelected = paymentMethod;
                }
            }
            this.movementOfCash = Object.assign(new MovementOfCash(), lastMovement);
            this.movementOfCash._id = '';
            this.movementOfCash.type = this.paymentMethodSelected;
            this.transaction.quotation = this.movementOfCashForm.value.quotationNative;
            await this.updateTransaction().then(
                transaction => {
                    if (transaction) {
                        this.transaction = transaction;
                    }
                }
            );
            this.setValuesForm(this.amountPaid);
            this.addMovementOfCash();
        } else {
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
                                    if (this.transaction.commissionAmount > 0 || this.transaction.administrativeExpenseAmount > 0 || this.transaction.otherExpenseAmount > 0) {
                                        let amountPaid = 0;

                                        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
                                            for (let movement of this.movementsOfCashes) {
                                                amountPaid += this.roundNumber.transform(movement.amountPaid);
                                            }
                                        }
                                        this.transaction.totalPrice = this.roundNumber.transform(amountPaid - this.transaction.commissionAmount - this.transaction.administrativeExpenseAmount - this.transaction.otherExpenseAmount);
                                        await this.updateTransaction().then(
                                            transaction => {
                                                if (transaction) {
                                                    this.closeModal();
                                                }
                                            }
                                        );
                                    } else {
                                        this.closeModal();
                                    }
                                } else {
                                    this.closeModal();
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
                    this.showToast(error);
                    this.loading = false;
                }
            );
        }
    }

    public isChargedFinished(): boolean {

        let chargedFinished: boolean = false;
        let amountPaid = 0;
        this.transaction.commissionAmount = 0;
        this.transaction.administrativeExpenseAmount = 0;
        this.transaction.otherExpenseAmount = 0;

        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
            for (let movement of this.movementsOfCashes) {
                amountPaid += this.roundNumber.transform(movement.amountPaid);
                this.transaction.commissionAmount = movement.commissionAmount;
                this.transaction.administrativeExpenseAmount = movement.administrativeExpenseAmount;
                this.transaction.otherExpenseAmount = movement.otherExpenseAmount;
            }
        }

        if (this.roundNumber.transform(amountPaid) >= this.roundNumber.transform(this.transactionAmount) && this.transactionAmount !== 0) {
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
                                                                    if (this.keyboard) this.keyboard.setInput('');
                                                                    this.getMovementOfCashesByTransaction('delete');
                                                                }
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        } else {
                                            this.getMovementOfCashesByTransaction('delete');
                                        }
                                    }
                                );
                            } else {
                                this.getMovementOfCashesByTransaction('delete');
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
                                                                    this.getMovementOfCashesByTransaction('delete');
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        this.getMovementOfCashesByTransaction('delete');
                                                    }
                                                }
                                            );
                                        } else {
                                            this.getMovementOfCashesByTransaction('delete');
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
                modalRef.componentInstance.transactionType = this.transaction.type;
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
            let paid: number = 0;
            this.transaction.commissionAmount = 0;
            this.transaction.administrativeExpenseAmount = 0;
            this.transaction.otherExpenseAmount = 0;
            for (let mov of this.movementsOfCashes) {
                paid += (mov.amountPaid);
                this.transaction.commissionAmount += mov.commissionAmount;
                this.transaction.administrativeExpenseAmount += mov.administrativeExpenseAmount;
                this.transaction.otherExpenseAmount += mov.otherExpenseAmount;
            }

            if (this.transaction.totalPrice === 0 || this.transaction.commissionAmount > 0 || this.transaction.administrativeExpenseAmount > 0 || this.transaction.otherExpenseAmount > 0) {
                this.transaction.totalPrice = this.roundNumber.transform(paid - this.transaction.commissionAmount - this.transaction.administrativeExpenseAmount - this.transaction.otherExpenseAmount);
                await this.updateTransaction().then(
                    transaction => {
                        if (transaction) {
                            this.transaction = transaction;
                            this.closeModal();
                        }
                    }
                );
            } else {
                if (this.transaction.totalPrice < paid) {
                    this.closeModal();
                } else {
                    this.showToast(null, 'info', 'La suma de métodos de pago debe ser igual o mayor al de la transacción.');
                }
            }
        } else {
            this.fastPayment = null;
        }
    }

    //FUNCIÓN PARA CONTROLAR QUE LA SUMA DE PRECIO DE ARTÍCULOS SEA IGUAL AL TOTAL DE LA TRANSACCIÓN
    private async closeModal() {

        let isValid: boolean = false;
        let totalPrice: number = 0;

        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
            for (let movementOfCash of this.movementsOfCashes) {
                totalPrice += this.roundNumber.transform(movementOfCash.amountPaid);
            }
        }

        if (this.roundNumber.transform(totalPrice) === (this.roundNumber.transform(this.transaction.totalPrice + this.transaction.commissionAmount + this.transaction.administrativeExpenseAmount + this.transaction.otherExpenseAmount))) {
            isValid = true;
        } else {
            isValid = false;
            this.showToast(null, "info", "La suma de métodos de pago no coincide con el de la transacción.");
        }

        if (isValid && totalPrice > 0 && this.transaction.totalPrice === 0) {
            this.transaction.totalPrice = this.roundNumber.transform(totalPrice - this.transaction.commissionAmount - this.transaction.administrativeExpenseAmount - this.transaction.otherExpenseAmount);

            if (this.transaction.type.finishState) {
                this.transaction.state = this.transaction.type.finishState;
            } else {
                this.transaction.state = TransactionState.Closed;
            }

            await this.updateTransaction().then(
                transaction => {
                    if (transaction) {
                        this.transaction = transaction;
                        this.closeModal();
                    }
                }
            );
        }

        if (isValid) {
            this.activeModal.close({ movementsOfCashes: this.movementsOfCashes, movementOfArticle: this.movementOfArticle });
        }
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
                    this.showToast(error);
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
                        if (result && result.message && result.message !== "") this.showToast(null, 'info', result.message);
                        resolve(null);
                    }
                },
                error => {
                    this.showToast(error);
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
                    this.showToast(error);
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
                        if (result.message && result.message !== '') this.showToast(null, 'info', result.message);
                        resolve(null);
                    } else {
                        resolve(movementOfArticle);
                    }
                },
                error => {
                    this.showToast(error);
                    resolve(null);
                }
            );
        });
    }

    public async getPaymentMethods() {

        this.loading = true;

        let match = {};
        match["operationType"] = { "$ne": "D" };

        if (this.transaction.type && this.transaction.type.paymentMethods && this.transaction.type.paymentMethods.length > 0 && this.transaction.type.paymentMethods[0]) {
            match['$or'] = new Array();
            this.transaction.type.paymentMethods.forEach(element => {
                match['$or'].push({ _id: { "$oid": element } });
            });
        }

        this.subscription.add(this._paymentMethodService.getAll({
            project: {},
            match: match,
            sort: { order: 1 },
        }).subscribe(
            async result => {
                this.loading = false;
                if (result.status === 200) {
                    this.paymentMethods = result.result;
                    for (let p of this.paymentMethods) {
                        if (p.currency) {
                            await this._currencyService.getAll({
                                match: {
                                    _id: { $oid: p.currency }
                                }
                            }).toPromise()
                                .then((result: Resulteable) => {
                                    p.currency = result.result[0];
                                })
                        }
                    }
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
                } else {
                    this.showToast(result.result)
                }
            },
            error => {
                this.showToast(error);
                this.loading = false;
            }
        ));
    }

    public changeAmountToPay(): void {
        if (this.keyboard) this.keyboard.setInput(this.movementOfCashForm.value.amountToPay.toString());
        this.updateAmounts('amountToPay');
    }

    public changeQuotationNative() {
        this.quotationNative = this.movementOfCashForm.value.quotationNative;
        this.quotationAmount = this.amountToPay * this.quotationNative;
        this.movementOfCashForm.patchValue({
            quotationNative: this.quotationNative,
            quotationAmount: this.quotationAmount
        });
    }

    public updateAmounts(op?: string): void {

        if (op === 'amountToPay') {
            if (typeof this.movementOfCashForm.value.amountToPay === 'string') this.movementOfCashForm.value.amountToPay = parseFloat(this.movementOfCashForm.value.amountToPay);
            this.amountToPay = this.movementOfCashForm.value.amountToPay;
        }
        this.amountPaid = 0;
        this.transaction.commissionAmount = 0;
        this.transaction.administrativeExpenseAmount = 0;
        this.transaction.otherExpenseAmount = 0;
        if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
            for (let movement of this.movementsOfCashes) {
                this.amountPaid += movement.amountPaid;
                this.transaction.commissionAmount += movement.commissionAmount;
                this.transaction.administrativeExpenseAmount += movement.administrativeExpenseAmount;
                this.transaction.otherExpenseAmount += movement.otherExpenseAmount;
            }
        }

        if (op !== 'amountToPay' && this.transaction.totalPrice !== 0) {
            this.amountToPay = this.transactionAmount - this.amountPaid - this.amountDiscount;
            if (this.keyboard) this.keyboard.setInput('');
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

        if (op === 'init' && this.keyboard) {
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
        this.percentageAdministrativeExpense = this.paymentMethodSelected.administrativeExpense;
        this.percentageOtherExpense = this.paymentMethodSelected.otherExpense;

        this.setValuesForm();

        this.changePercentageCommission();
        this.changePercentageAdministrativeExpense();
        this.changePercentageOtherExpense();
    }

    async isValidAmount(isCopy: boolean = false) {

        return new Promise(async resolve => {

            let isValid: boolean = true;

            if (isValid && this.paymentMethodSelected.checkDetail && !isCopy) {
                let query = `where="number":"${this.movementOfCashForm.value.number}","type":"${this.paymentMethodSelected._id}","statusCheck":"Disponible"`;
                await this.getMovementsOfCashes(query).then(
                    movementsOfCashes => {
                        if (movementsOfCashes && movementsOfCashes.length > 0) {
                            isValid = false;
                            this.showToast(null, 'info', `El ${this.paymentMethodSelected.name} número ${this.movementOfCashForm.value.number} ya existe`);
                        }
                    }
                );
            }

            if (isValid && this.transaction.totalPrice !== 0 &&
                this.roundNumber.transform(this.amountPaid + this.amountToPay) > this.roundNumber.transform(this.transactionAmount + this.totalInterestAmount + this.totalTaxAmount) &&
                !this.paymentMethodSelected.acceptReturned) {
                isValid = false;
                this.showToast(null, 'info', "El medio de pago " + this.paymentMethodSelected.name + " no acepta vuelto, por lo tanto el monto a pagar no puede ser mayor que el de la transacción.");
            }

            if (isValid && this.movementOfCash.discount && this.movementOfCash.discount > 0 &&
                this.amountToPay > this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.discount / 100) + this.transaction.totalPrice) &&
                !this.paymentMethodSelected.acceptReturned) {
                isValid = false;
                this.showToast(null, 'info', "El monto ingresado no puede ser mayor a " + this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.discount / 100)) + '.');
            }

            if (isValid && this.movementOfCash.surcharge && this.movementOfCash.surcharge > 0 &&
                this.amountToPay > this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.surcharge / 100) + this.transaction.totalPrice) &&
                !this.paymentMethodSelected.acceptReturned) {
                isValid = false;
                this.showToast(null, 'info', "El monto ingresado no puede ser mayor a " + this.roundNumber.transform((this.transaction.totalPrice * this.movementOfCash.surcharge / 100) + this.transaction.totalPrice) + '.');
            }

            if (isValid && (!this.movementOfCash.expirationDate || !moment(this.movementOfCash.expirationDate).isValid())) {
                isValid = false;
                this.showToast(null, 'info', 'Debe ingresar fecha de vencimiento de pago válida');
            }

            if (isValid && (!this.movementOfCash || !this.paymentMethodSelected)) {
                isValid = false;
                this.showToast(null, 'info', 'Debe seleccionar un medio de pago válido');
            }

            if (isValid && this.paymentMethodSelected.checkDetail &&
                (!this.paymentMethodSelected.inputAndOuput ||
                    this.transaction.type.movement === Movements.Inflows) &&
                (!this.movementOfCashForm.value.number || this.movementOfCashForm.value.number === '')) {
                isValid = false;
                this.showToast(null, 'info', 'Debe completar el numero de comprobante');
            } else if (isValid && this.paymentMethodSelected.checkDetail &&
                this.paymentMethodSelected.inputAndOuput &&
                this.transaction.type.movement === Movements.Outflows &&
                !isCopy) {
                isValid = false;
                this.showToast(null, 'info', 'Debe seleccionar los métodos de pago en cartera a utilizar.');
            }

            if (isValid && this.paymentMethodSelected.allowToFinance) {
                let amountTotal = 0;
                if (this.movementsOfCashesToFinance && this.movementsOfCashesToFinance.length > 0) {
                    for (let mov of this.movementsOfCashesToFinance) {
                        amountTotal = this.roundNumber.transform(amountTotal + mov.amountPaid);
                        if (!moment(mov.expirationDate).isValid()) {
                            isValid = false;
                            this.showToast(null, 'info', 'Debe ingresar fechas de vencimiento de pago válidas');
                        } else {
                            if ((moment(mov.expirationDate).diff(moment(this.transaction.startDate), 'days') < 0)) {
                                isValid = false;
                                this.showToast(null, 'info', 'La fecha de vencimiento de pago no puede ser menor a la fecha de la transacción');
                            }
                        }
                    }
                }
            }

            if (isValid && this.paymentMethodSelected.isCurrentAccount &&
                !this.transaction.company) {
                isValid = false;
                this.showToast(null, 'info', "Debe seleccionar una empresa para poder efectuarse un pago con el método " + this.paymentMethodSelected.name + ".");
            }

            if (isValid && this.paymentMethodSelected.isCurrentAccount &&
                this.transaction.company &&
                !this.transaction.company.allowCurrentAccount) {
                isValid = false;
                this.showToast(null, 'info', "La empresa seleccionada no esta habilitada para cobrar con el método " + this.paymentMethodSelected.name + ".");
            }

            if (isValid && this.paymentMethodSelected.isCurrentAccount &&
                this.transaction.type.currentAccount === CurrentAccount.Charge) {
                isValid = false;
                this.showToast(null, 'info', "No se puede elegir el medio de pago " + this.paymentMethodSelected.name + " para el tipo de transacción " + this.transaction.type.name + " .");
            }

            resolve(isValid);
        });
    }

    getTotalAmount(field: string): number {
        let total: number = 0;
        for (let mov of this.movementsOfCashes) {
            if (field !== 'total') {
                total += mov[field];
            } else {
                total += (mov.amountPaid - mov.commissionAmount - mov.administrativeExpenseAmount - mov.otherExpenseAmount);
            }
        }
        return total;
    }

    public async changePercentageCommission(commissionAmount: number = null) {
        this.movementOfCash = Object.assign(this.movementOfCashForm.value);
        this.daysCommission = moment(moment(this.movementOfCashForm.value.expirationDate).format('YYYY-MM-DD'), 'YYYY-MM-DD').diff(moment().format('YYYY-MM-DD'), 'days') + 4;
        if (moment(this.movementOfCashForm.value.expirationDate).day() === 6) {
            this.daysCommission += 2
        }
        if (moment(this.movementOfCashForm.value.expirationDate).day() === 7) {
            this.daysCommission += 1
        }

        if (this.holidays && this.holidays.length > 0) {
            this.holidays.forEach(element => {
                if (moment(this.movementOfCashForm.value.expirationDate).format('YYYY-MM-DD') === moment(element.date).format("YYYY-MM-DD")) {
                    this.daysCommission += 1;
                }
            });
        }

        if (commissionAmount != null) {
            this.movementOfCash.commissionAmount = commissionAmount;
            this.percentageCommission = this.roundNumber.transform(100 * (this.movementOfCash.commissionAmount / (this.amountToPay * this.daysCommission)));
        } else {
            this.percentageCommission = this.movementOfCashForm.value.percentageCommission;
            this.movementOfCash.commissionAmount = this.roundNumber.transform((this.amountToPay * this.percentageCommission / 100) * this.daysCommission);
        }
        if (this.movementOfCash.taxPercentage > 0) this.movementOfCash.commissionAmount = this.roundNumber.transform(this.movementOfCash.commissionAmount + (this.movementOfCash.commissionAmount * this.movementOfCash.taxPercentage / 100));
        this.movementOfCashForm.patchValue({
            commissionAmount: this.movementOfCash.commissionAmount,
            daysCommission: this.daysCommission,
            percentageCommission: this.percentageCommission

        });
        if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance) this.calculateQuotas('quotas');
    }

    public changePercentageAdministrativeExpense(administrativeExpenseAmount: number = null) {
        if (administrativeExpenseAmount != null) {
            this.movementOfCash.administrativeExpenseAmount = administrativeExpenseAmount;
            this.percentageAdministrativeExpense = this.roundNumber.transform(100 * (this.movementOfCash.administrativeExpenseAmount / this.amountToPay));
        } else {
            this.percentageAdministrativeExpense = this.movementOfCashForm.value.percentageAdministrativeExpense;
            this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(this.amountToPay * this.percentageAdministrativeExpense / 100);
        }
        if (this.movementOfCash.taxPercentage > 0) this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(this.movementOfCash.administrativeExpenseAmount + (this.movementOfCash.administrativeExpenseAmount * this.movementOfCash.taxPercentage / 100));
        this.movementOfCashForm.patchValue({
            administrativeExpenseAmount: this.movementOfCash.administrativeExpenseAmount,
            percentageAdministrativeExpense: this.percentageAdministrativeExpense
        });
        if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance) this.calculateQuotas('quotas');
    }

    public changePercentageOtherExpense(otherExpenseAmount: number = null) {
        if (otherExpenseAmount != null) {
            this.movementOfCash.otherExpenseAmount = otherExpenseAmount;
            this.percentageOtherExpense = this.roundNumber.transform(100 * (this.movementOfCash.otherExpenseAmount / this.amountToPay));
        } else {
            this.percentageOtherExpense = this.movementOfCashForm.value.percentageOtherExpense;
            this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(this.amountToPay * this.percentageOtherExpense / 100);
        }
        if (this.movementOfCash.taxPercentage > 0) this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(this.movementOfCash.otherExpenseAmount + (this.movementOfCash.otherExpenseAmount * this.movementOfCash.taxPercentage / 100));
        this.movementOfCashForm.patchValue({
            otherExpenseAmount: this.movementOfCash.otherExpenseAmount,
            percentageOtherExpense: this.percentageOtherExpense
        });
        if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance) this.calculateQuotas('quotas');
    }

    public changeVatOfExpenses() {
        this.movementOfCash.taxPercentage = this.movementOfCashForm.value.taxPercentage;
        if (this.lastVatOfExpenses > 0) {
            if (this.paymentMethodSelected.commission > 0) this.movementOfCash.commissionAmount = this.roundNumber.transform(this.movementOfCash.commissionAmount / (this.lastVatOfExpenses / 100 + 1));
            if (this.paymentMethodSelected.administrativeExpense > 0) this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(this.movementOfCash.administrativeExpenseAmount / (this.lastVatOfExpenses / 100 + 1));
            if (this.paymentMethodSelected.otherExpense > 0) this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(this.movementOfCash.otherExpenseAmount / (this.lastVatOfExpenses / 100 + 1));
        }
        this.lastVatOfExpenses = this.movementOfCash.taxPercentage;
        if (this.paymentMethodSelected.commission > 0) this.movementOfCash.commissionAmount = this.roundNumber.transform(this.movementOfCash.commissionAmount + (this.movementOfCash.commissionAmount * this.movementOfCash.taxPercentage / 100));
        if (this.paymentMethodSelected.administrativeExpense > 0) this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(this.movementOfCash.administrativeExpenseAmount + (this.movementOfCash.administrativeExpenseAmount * this.movementOfCash.taxPercentage / 100));
        if (this.paymentMethodSelected.otherExpense > 0) this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(this.movementOfCash.otherExpenseAmount + (this.movementOfCash.otherExpenseAmount * this.movementOfCash.taxPercentage / 100));
        this.movementOfCashForm.patchValue({
            commissionAmount: this.movementOfCash.commissionAmount,
            administrativeExpenseAmount: this.movementOfCash.administrativeExpenseAmount,
            otherExpenseAmount: this.movementOfCash.otherExpenseAmount
        });
        if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance) this.calculateQuotas('quotas');
    }

    public getHolidays(): Promise<Holiday[]> {
        return new Promise<Holiday[]>((resolve, reject) => {
            this.subscription.add(this._holidayService.getAll({
                match: { operationType: { $ne: "D" } }
            }).subscribe(
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
                    this.showToast(null, 'info', 'Debe ingresar fecha de vencimiento de pago válida');
                    resolve(false);
                }

                if (mov.type.isCurrentAccount &&
                    !this.transaction.company) {
                    this.showToast(null, 'info', "Debe seleccionar una empresa para poder efectuarse un pago con el método " + mov.type.name + ".");
                    resolve(false);
                }

                if (mov.type.isCurrentAccount &&
                    this.transaction.company &&
                    !this.transaction.company.allowCurrentAccount) {
                    this.showToast(null, 'info', "La empresa seleccionada no esta habilitada para cobrar con el método " + mov.type.name + ".");
                    resolve(false);
                }

                if (mov.type.isCurrentAccount &&
                    this.transaction.type.currentAccount === CurrentAccount.Charge) {
                    this.showToast(null, 'info', "No se puede elegir el medio de pago " + mov.type.name + " para el tipo de transacción " + this.transaction.type.name + " .");
                    resolve(false);
                }
            }

            if (this.roundNumber.transform(paid) > this.roundNumber.transform(this.transactionAmount) && !this.transaction.type.allowZero) {
                this.showToast(null, 'info', "La suma de monto de medios de pago no puede ser mayor al de la transacción.");
                resolve(false);
            }

            if (this.transaction.totalPrice !== 0 && this.roundNumber.transform(paid) <= 0) {
                this.showToast(null, 'info', "La suma de monto de medios de pago no puede ser menor o igual a 0.");
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
                    this.movementOfCash.interestPercentage = this.movementOfCashForm.value.interestPercentage;

                    if (this.paymentMethodSelected.allowBank) {
                        this.movementOfCash.bank = this.movementOfCashForm.value.bank;
                    } else {
                        this.movementOfCash.bank = null
                    }

                    if (this.paymentMethodSelected.checkDetail) {
                        this.movementOfCash.receiver = this.movementOfCashForm.value.receiver;
                        this.movementOfCash.number = this.movementOfCashForm.value.number;
                        this.movementOfCash.titular = this.movementOfCashForm.value.titular;
                        this.movementOfCash.bank = this.movementOfCashForm.value.bank;
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

                    if (await this.validateCredit()) {
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
                                                        if (this.keyboard) this.keyboard.setInput('');
                                                        this.showToast(null, 'success', 'Operación realizada con éxito');
                                                        this.getMovementOfCashesByTransaction();
                                                    }
                                                }
                                            );
                                        }
                                    } else {
                                        this.movementsOfCashes = new Array();
                                        this.movementsOfCashes.push(this.movementOfCash);
                                        if (!this.fastPayment) {
                                            this.showToast(null, 'success', 'Operación realizada con éxito');
                                            this.getMovementOfCashesByTransaction();
                                        } else {
                                            if (this.amountDiscount && this.amountDiscount !== 0) {
                                                this.addMovementOfArticle();
                                            } else {
                                                this.showToast(null, 'success', 'Operación realizada con éxito');
                                                this.getMovementOfCashesByTransaction();
                                            }
                                        }
                                    }
                                }
                                if (this.transaction.type.allowAccounting && this.transaction.type.currentAccount === CurrentAccount.Charge) {
                                    this._accountSeatService.addAccountSeatByTransaction(this.transaction._id).subscribe(
                                        result => {
                                            if (result && result.status === 200) {
                                                this.showToast(result);
                                            } else {
                                                this.showToast(result);
                                            }
                                        },
                                        error => {
                                            this.showToast(error);
                                        }
                                    )
                                }
                            }
                        );
                    }
                } else {
                    let isValid: boolean = true;
                    if ((this.totalInterestAmount + this.totalTaxAmount) > 0 && this.transaction.totalPrice !== 0) {
                        this.transaction.totalPrice += (this.totalInterestAmount + this.totalTaxAmount);
                        await this.updateTransaction().then(
                            transaction => {
                                if (transaction) {
                                    this.transaction = transaction;
                                } else {
                                    isValid = false;
                                }
                            }
                        );
                    }
                    if (isValid) {
                        for (let mov of this.movementsOfCashesToFinance) {
                            mov.expirationDate = moment(mov.expirationDate, "YYYY-MM-DD").format("YYYY-MM-DDTHH:mm:ssZ");
                        }
                        await this.saveMovementsOfCashes().then(
                            movementsOfCashes => {
                                if (movementsOfCashes && movementsOfCashes.length > 0) {
                                    this.showToast(null, 'success', 'Operación realizada con éxito');
                                    this.getMovementOfCashesByTransaction();
                                }
                            }
                        );
                    }
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
            this.movementOfCash.interestPercentage = this.movementOfCashForm.value.interestPercentage;
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

            if (await this.isValidAmount() && await this.validateCredit()) {
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
                        if (result.message && result.message !== '') this.showToast(null, 'info', result.message);
                        resolve(null);
                    } else {
                        resolve(result.movementOfCash);
                    }
                },
                error => {
                    this.showToast(error);
                    resolve(null);
                }
            );
        });
    }

    public validateCredit(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (this.movementOfCash.type.isCurrentAccount && this.transaction.company.creditLimit > 0 && this.transaction.company._id && this.transaction.type.transactionMovement === TransactionMovement.Sale) {
                this._companyService.getSummaryCurrentAccount(this.transaction.company._id).subscribe(
                    result => {
                        if (result && result.status === 200) {
                            var total = result.result + this.movementOfCash.amountPaid;
                            if (total > this.transaction.company.creditLimit) {
                                resolve(false);
                                this.showToast(null, 'info', "La empresa supera el limite de credito otorgado");
                            } else {
                                resolve(true)
                            }
                        } else {
                            resolve(false);
                            this.showToast(result);
                        }
                    },
                    error => {
                        resolve(false);
                        this.showToast(error);
                    }
                )
            } else {
                resolve(true);
            }
        });
    }

    public saveMovementsOfCashes(): Promise<MovementOfCash[]> {

        return new Promise<MovementOfCash[]>((resolve, reject) => {
            this._movementOfCashService.saveMovementsOfCashes(this.movementsOfCashesToFinance).subscribe(
                result => {
                    if (!result.movementsOfCashes) {
                        if (result.message && result.message !== '') this.showToast(null, 'info', result.message);
                        resolve(null);
                    } else {
                        resolve(result.movementsOfCashes);
                    }
                },
                error => {
                    this.showToast(error);
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

    public async cleanForm() {
        let oldMovementOfCash: MovementOfCash = new MovementOfCash();
        oldMovementOfCash = Object.assign(oldMovementOfCash, this.movementOfCash);
        this.movementOfCash = new MovementOfCash();
        this.movementOfCash.type = this.paymentMethodSelected;
        this.paymentChange = '0.00';
        this.amountToPay = 0;
        this.amountPaid = 0;
        this.movementOfCash.expirationDate = oldMovementOfCash.expirationDate;
        this.movementOfCash.receiver = oldMovementOfCash.receiver;
        this.movementOfCash.number = oldMovementOfCash.number;
        let bank: Bank = (oldMovementOfCash.bank) ? oldMovementOfCash.bank : null;
        if (bank && !bank._id) {
            await this.getBanks({ _id: { $oid: bank } })
                .then((banks: Bank[]) => {
                    if (banks && banks.length > 0) bank = banks[0];
                });
        }
        this.movementOfCash.bank = bank;
        this.movementOfCash.titular = oldMovementOfCash.titular;
        this.movementOfCash.CUIT = oldMovementOfCash.CUIT;
        this.movementOfCash.deliveredBy = oldMovementOfCash.deliveredBy;
        this.movementOfCash.transaction = this.transaction;
        this.movementOfCash.amountPaid = 0;
        this.buildForm();
    }

    async getTaxes(query: string): Promise<Tax[]> {

        return new Promise<Tax[]>((resolve, reject) => {

            this._taxService.getTaxes(query).subscribe(
                async result => {
                    if (!result.taxes) {
                        this.showToast(null, 'info', "Debe configurar el impuesto IVA para el realizar el descuento/recargo con " + this.paymentMethodSelected.name);
                        resolve(null);
                    } else {
                        resolve(result.taxes);
                    }
                },
                error => {
                    this.showToast(error);
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
                        if (result.message && result.message !== '') this.showToast(null, 'info', result.message);
                        resolve(null);
                    } else {
                        resolve(result.movementOfArticle);
                    }
                },
                error => {
                    this.showToast(error);
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
                        if (result.message && result.message !== '') this.showToast(null, 'info', result.message);
                        resolve(null);
                    } else {
                        resolve(result.transaction);
                    }
                },
                error => {
                    this.showToast(error);
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
