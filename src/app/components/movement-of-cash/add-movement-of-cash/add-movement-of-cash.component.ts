// ANGULAR
import {Component, OnInit, Input, EventEmitter, ViewEncapsulation, ViewChild, ElementRef} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';

// DE TERCEROS
import {NgbAlertConfig, NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/es';

// MODELS
import {Config} from '../../../app.config';

// SERVICES

// PIPES

// COMPONENTS

import {AccountSeatService} from 'app/components/account-seat/account-seat.service';
import {Bank} from 'app/components/bank/bank';
import {BankService} from 'app/components/bank/bank.service';
import {CompanyService} from 'app/components/company/company.service';
import {Currency} from 'app/components/currency/currency';
import {CurrencyService} from 'app/components/currency/currency.service';
import {Holiday} from 'app/components/holiday/holiday.model';
import {HolidayService} from 'app/components/holiday/holiday.service';
import {TranslateMePipe} from 'app/main/pipes/translate-me';
import Resulteable from 'app/util/Resulteable';
import * as moment from 'moment';
import {ToastrService} from 'ngx-toastr';
import {Subscription, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap, switchMap} from 'rxjs/operators';
import Keyboard from 'simple-keyboard';

import {RoundNumberPipe} from '../../../main/pipes/round-number.pipe';
import {MovementOfArticle} from '../../movement-of-article/movement-of-article';
import {MovementOfArticleService} from '../../movement-of-article/movement-of-article.service';
import {PaymentMethod} from '../../payment-method/payment-method';
import {PaymentMethodService} from '../../payment-method/payment-method.service';
import {Tax, TaxBase, TaxClassification} from '../../tax/tax';
import {TaxService} from '../../tax/tax.service';
import {Taxes} from '../../tax/taxes';
import {
  CurrentAccount,
  Movements,
  StockMovement,
  TransactionMovement,
  TransactionType,
} from '../../transaction-type/transaction-type';
import {Transaction, TransactionState} from '../../transaction/transaction';
import {TransactionService} from '../../transaction/transaction.service';
import {DeleteMovementOfCashComponent} from '../delete-movement-of-cash/delete-movement-of-cash.component';
import {MovementOfCash, StatusCheck} from '../movement-of-cash';
import {MovementOfCashService} from '../movement-of-cash.service';
import {SelectChecksComponent} from '../select-checks/select-checks.component';
import { padNumber } from 'app/util/functions/pad/padNumber';
import { EmailProps } from 'app/types';
import { EmailService } from 'app/components/send-email/send-email.service';
import { Printer, PrinterPrintIn, PrinterType } from 'app/components/printer/printer';
import { PrintTransactionTypeComponent } from 'app/components/print/print-transaction-type/print-transaction-type.component';
import { PrintComponent } from 'app/components/print/print/print.component';
import { PrinterService } from 'app/components/printer/printer.service';
import { User } from 'app/components/user/user';
import { UserService } from 'app/components/user/user.service';
import { CancellationTypeAutomaticComponent } from 'app/components/cancellation-type/cancellation-types-automatic/cancellation-types-automatic.component';
import { Table, TableState } from 'app/components/table/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TableService } from 'app/components/table/table.service';
import { CancellationType } from 'app/components/cancellation-type/cancellation-type';
import { MovementOfCancellation } from 'app/components/movement-of-cancellation/movement-of-cancellation';
import { BusinessRule } from 'app/components/business-rules/business-rules';
import { BusinessRuleService } from 'app/components/business-rules/business-rule.service';
import { Transport } from 'app/components/transport/transport';
import { TransportService } from 'app/components/transport/transport.service';
import { MovementOfCancellationService } from 'app/components/movement-of-cancellation/movement-of-cancellation.service';
import { CancellationTypeService } from 'app/components/cancellation-type/cancellation-type.service';
import { JsonDiffPipe } from 'app/main/pipes/json-diff';
import { PriceList } from 'app/components/price-list/price-list';
import { ArticleFields } from 'app/components/article-field/article-fields';
import { ArticleFieldType } from 'app/components/article-field/article-field';
import { removeParam } from '../../../util/functions/removeParam';
import { DeleteTransactionComponent } from 'app/components/transaction/delete-transaction/delete-transaction.component';
import { ArticlePrintIn } from 'app/components/article/article';
import { ArticleStock } from 'app/components/article-stock/article-stock';
import { ArticleStockService } from 'app/components/article-stock/article-stock.service';

@Component({
  selector: 'app-add-movement-of-cash',
  templateUrl: './add-movement-of-cash.component.html',
  styleUrls: [
    './../../../../../node_modules/simple-keyboard/build/css/index.css',
    './add-movement-of-cash.component.scss',
  ],
  providers: [NgbAlertConfig, RoundNumberPipe, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AddMovementOfCashComponent implements OnInit {
  @ViewChild('contentPrinters', {static: true}) contentPrinters: ElementRef;
  @ViewChild('containerMovementsOfArticles', {static: true}) containerMovementsOfArticles: ElementRef;
  @Input() transaction: Transaction;
  @Input() fastPayment: PaymentMethod;
  transactionId: string;
  movementOfCash: MovementOfCash;
  movementsOfCashes: MovementOfCash[];
  movementsOfCashesToFinance: MovementOfCash[];
  paymentMethods: PaymentMethod[];
  paymentMethodSelected: PaymentMethod;
  movementOfCashForm: FormGroup;
  paymentChange: string = '0.00';
  alertMessage: string = '';
  loading: boolean = false;
  focusEvent = new EventEmitter<boolean>();
  transactionAmount: number = 0.0;
  amountToPay: number = 0.0;
  amountPaid: number = 0.0;
  amountDiscount: number = 0.0;
  private subscription: Subscription = new Subscription();
  percentageCommission: number = 0.0;
  percentageAdministrativeExpense: number = 0.0;
  percentageOtherExpense: number = 0.0;
  daysCommission: number = 0;
  printerSelected: Printer;
  typeOfOperationToPrint: string;
  isCancellationAutomatic: boolean = false;
  transactionMovement: string;
  filtersTaxClassification: TaxClassification[];
  userCountry: string = 'AR';
  areMovementsOfArticlesEmpty: boolean = true;
  totalTaxesAmount: number = 0;
  totalTaxesBase: number = 0;
  userType: string;
  posType: string;
  showBussinessRulesButton: boolean = false;
  lastQuotation: number = 1;
  cancellationTypes: CancellationType[];
  showButtonInformCancellation: boolean;
  showButtonCancelation: boolean;
  movementsOfCancellations: MovementOfCancellation[] = new Array();
  transports: Transport[];
  movementsOfArticles: MovementOfArticle[];
  lastMovementOfArticle: MovementOfArticle;
  quantity = 0
  priceList: PriceList;
  newPriceList: PriceList;
  printersAux: Printer[];
  kitchenArticlesToPrint: MovementOfArticle[];
  kitchenArticlesPrinted: number = 0;
  barArticlesToPrint: MovementOfArticle[];
  barArticlesPrinted: number = 0;
  voucherArticlesToPrint: MovementOfArticle[];
  voucherArticlesPrinted: number = 0;
  isCharge: boolean;
  roundNumber = new RoundNumberPipe();
  quotas: number = 1;
  days: number = 1;
  period: string = 'Mensual';
  interestPercentage: number = 0;
  orderTerm: string[] = ['expirationDate'];
  propertyTerm: string;
  holidays: Holiday[];
  banks: Bank[];
  config: Config;
  database: string;
  movementOfArticle: MovementOfArticle;
  keyboard: Keyboard;
  lastVatOfExpenses: number = 0;
  interestType: string = 'Interés Simple';
  totalInterestAmount: number = 0;
  totalTaxAmount: number = 0;
  focus$: Subject<string>[] = new Array();
  currencyNative: Currency = Config.currency;
  quotationNative: number = 0;
  quotationAmount: number = 0;
  printers: Printer[];
  canceledTransactions: {
    typeId: string;
    code: number;
    origin: number;
    letter: string;
    number: number;
  } = {
    typeId: '',
    code: 0,
    origin: 0,
    letter: '',
    number: 0,
  };

  formErrors = {
    paymentMethod: '',
    amountToPay: '',
    amountPaid: '',
    paymentChange: '',
    observation: '',
    surcharge: '',
    CUIT: '',
    number: '',
  };

  validationMessages = {
    paymentMethod: {
      required: 'Este campo es requerido.',
      payValid: 'El monto ingresado es incorrecto para este medio de pago.',
    },
    amountToPay: {},
    amountPaid: {
      required: 'Este campo es requerido.',
      payValid: 'El monto ingresado es incorrecto.',
    },
    paymentChange: {},
    observation: {},
    surcharge: {},
    CUIT: {},
    number: {pattern: ' Ingrese solo números '},
  };

  constructor(
    private _paymentMethodService: PaymentMethodService,
    private _movementOfCashService: MovementOfCashService,
    private _transactionService: TransactionService,
    private _printerService: PrinterService,
    private _userService: UserService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _tableService: TableService,
    private _businessRulesService: BusinessRuleService,
    private _transportService: TransportService,
    private _movementOfCancellationService: MovementOfCancellationService,
    private _cancellationTypeService: CancellationTypeService,
    private _jsonDiffPipe: JsonDiffPipe,
    private _articleStockService: ArticleStockService,
    private _bankService: BankService,
    private _holidayService: HolidayService,
    private _accountSeatService: AccountSeatService,
    private _companyService: CompanyService,
    private _taxService: TaxService,
    private _movementOfArticleService: MovementOfArticleService,
    private _toastr: ToastrService,
    private _currencyService: CurrencyService,
    public activeModal: NgbActiveModal,
    public _fb: FormBuilder,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal,
    public translatePipe: TranslateMePipe,
    private _serviceEmail: EmailService,
  ) {
    this.initVariables();
    this.processParams();
  }

  private processParams(): void {
    this._route.queryParams.subscribe((params) => {
      this.transactionId = params['transactionId'];
      if (!this.transactionId) {
        this.backFinal();
      }
    });
  }

  initVariables(): void {
    this.transaction = new Transaction();
    this.transaction.type = new TransactionType();
    this.printersAux = new Array();
    this.movementOfCash = new MovementOfCash();
    this.movementsOfArticles = new Array();
    this.paymentMethods = new Array();
    this.barArticlesToPrint = new Array();
    this.kitchenArticlesToPrint = new Array();
    this.voucherArticlesToPrint = new Array();
    this.banks = new Array();
    if (this.fastPayment) {
      this.movementOfCash.type = this.fastPayment;
    } else {
      this.movementOfCash.type = new PaymentMethod();
    }
    this.paymentMethodSelected = this.movementOfCash.type;
    this.printers = new Array();
    this.cancellationTypes = new Array();
  }

  async ngOnInit() {
    this.transactionAmount = this.transaction.totalPrice;
    this.movementOfCash.expirationDate = this.transaction.endDate
      ? this.transaction.endDate
      : this.transaction.startDate;
    this.buildForm();
    this.getPaymentMethods();
    this.getHolidays().then((result) => {
      this.holidays = result;
    });

    let pathLocation: string[] = this._router.url.split('/');

    this.userType = pathLocation[1];
    this.posType = pathLocation[2];
    this.initComponent();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
    if (this.transaction.type.showKeyboard) {
      this.keyboard = new Keyboard({
        onChange: (input) => this.onChange(input),
        onKeyPress: (button) => this.onKeyPress(button),
        layout: {
          default: ['7 8 9', '4 5 6', '1 2 3', '0 . {bksp}', '{enter}'],
          shift: [],
        },
        buttonTheme: [
          {
            class: 'hg-blue',
            buttons: '{enter}',
          },
          {
            class: 'hg-red',
            buttons: '{bksp}',
          },
        ],
        theme: 'hg-theme-default hg-layout-numeric numeric-theme',
        display: {
          '{bksp}': 'Borrar ⌫',
          '{enter}': 'Enter ↵',
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onChange = (input: string) => {
    !isNaN(parseFloat(input))
      ? (this.movementOfCashForm.value.amountToPay = this.roundNumber.transform(
          parseFloat(input),
        ))
      : (this.movementOfCashForm.value.amountToPay = 0);
    this.updateAmounts('amountToPay');
  };

  onKeyPress = (button: string) => {
    if (button === '{enter}') this.addMovementOfCash();
    if (button === '{bksp}') {
      if (this.movementOfCashForm.value.amountToPay.toString().length > 1) {
        this.movementOfCashForm.value.amountToPay = parseFloat(
          this.movementOfCashForm.value.amountToPay
            .toString()
            .slice(0, this.movementOfCashForm.value.amountToPay.toString().length - 1),
        );
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
      let shiftToggle = currentLayout === 'default' ? 'shift' : 'default';

      this.keyboard.setOptions({
        layoutName: shiftToggle,
      });
    }
  };

  buildForm(): void {
    this.movementOfCashForm = this._fb.group({
      date: this.transaction.endDate || this.transaction.startDate,
      transactionAmount: [
        parseFloat(this.roundNumber.transform(this.transactionAmount)).toFixed(2),
        [Validators.required],
      ],
      paymentMethod: [this.movementOfCash.type, [Validators.required]],
      percentageCommission: [this.percentageCommission, []],
      percentageAdministrativeExpense: [this.percentageAdministrativeExpense, []],
      percentageOtherExpense: [this.percentageOtherExpense, []],
      daysCommission: [this.daysCommission, []],
      amountToPay: [this.amountToPay, []],
      amountPaid: [this.amountPaid, []],
      amountDiscount: [this.amountDiscount],
      paymentChange: [this.movementOfCash.paymentChange, []],
      observation: [this.movementOfCash.observation, []],
      discount: [
        this.movementOfCash.type ? this.movementOfCash.type.discount || 0 : 0,
        [],
      ],
      surcharge: [this.movementOfCash.type.surcharge || 0, []],
      commissionAmount: [this.movementOfCash.commissionAmount, []],
      administrativeExpenseAmount: [this.movementOfCash.administrativeExpenseAmount, []],
      otherExpenseAmount: [this.movementOfCash.otherExpenseAmount, []],
      expirationDate: [
        moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'),
        [],
      ],
      receiver: [this.movementOfCash.receiver, []],
      number: [this.movementOfCash.number],
      bank: [this.movementOfCash.bank ? this.movementOfCash.bank : null, []],
      titular: [this.movementOfCash.titular, []],
      CUIT: [this.movementOfCash.CUIT, []],
      deliveredBy: [this.movementOfCash.deliveredBy, []],
      quota: [this.quotas, []],
      days: [this.days, []],
      period: [this.period, []],
      interestPercentage: [this.interestPercentage, []],
      taxPercentage: [this.movementOfCash.taxPercentage, []],
      interestType: [this.interestType],
      quotationNative: [this.quotationNative],
      quotationAmount: [this.quotationAmount],
      balanceCanceled: this.movementOfCash.balanceCanceled,
    });

    this.movementOfCashForm.valueChanges.subscribe((data) => this.onValueChanged(data));
  }

  changePaymentMethod(paymentMethod: PaymentMethod): void {
    this.paymentMethodSelected = paymentMethod;
    this.updateAmounts('paymentMethod');
  }

  setValuesForm(amountToPay?: number): void {
    if (amountToPay) this.amountToPay = amountToPay;
    if (!this.movementOfCash.observation) this.movementOfCash.observation = '';
    if (!this.movementOfCash.amountPaid) this.movementOfCash.amountPaid = 0.0;
    if (!this.movementOfCash.discount) this.movementOfCash.discount = 0.0;
    if (!this.movementOfCash.surcharge) this.movementOfCash.surcharge = 0.0;
    if (!this.movementOfCash.commissionAmount) this.movementOfCash.commissionAmount = 0.0;
    if (!this.movementOfCash.administrativeExpenseAmount)
      this.movementOfCash.administrativeExpenseAmount = 0.0;
    if (!this.movementOfCash.otherExpenseAmount)
      this.movementOfCash.otherExpenseAmount = 0.0;
    if (!this.movementOfCash.receiver) this.movementOfCash.receiver = '';
    if (!this.movementOfCash.number) this.movementOfCash.number = '';
    if (!this.movementOfCash.titular) this.movementOfCash.titular = '';
    if (!this.movementOfCash.CUIT) this.movementOfCash.CUIT = '';
    if (!this.movementOfCash.deliveredBy) this.movementOfCash.deliveredBy = '';
    if (!this.amountToPay) this.amountToPay = 0.0;
    if (!this.amountPaid) this.amountPaid = 0.0;
    if (!this.amountDiscount) this.amountDiscount = 0.0;

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
      date: this.transaction.endDate || this.transaction.startDate,
      transactionAmount: parseFloat(
        this.roundNumber.transform(this.transactionAmount).toFixed(2),
      ),
      paymentMethod: this.paymentMethodSelected,
      amountToPay: parseFloat(this.roundNumber.transform(this.amountToPay).toFixed(2)),
      amountPaid: parseFloat(this.roundNumber.transform(this.amountPaid).toFixed(2)),
      amountDiscount: parseFloat(
        this.roundNumber.transform(this.amountDiscount).toFixed(2),
      ),
      paymentChange: parseFloat(
        this.roundNumber.transform(this.paymentChange).toFixed(2),
      ),
      percentageCommission: parseFloat(
        this.roundNumber.transform(this.percentageCommission, 3).toFixed(3),
      ),
      percentageAdministrativeExpense: parseFloat(
        this.roundNumber.transform(this.percentageAdministrativeExpense, 3).toFixed(3),
      ),
      percentageOtherExpense: parseFloat(
        this.roundNumber.transform(this.percentageOtherExpense, 3).toFixed(3),
      ),
      daysCommission: this.daysCommission,
      observation: this.movementOfCash.observation,
      discount: parseFloat(
        this.roundNumber.transform(this.movementOfCash.discount).toFixed(2),
      ),
      surcharge: parseFloat(
        this.roundNumber.transform(this.movementOfCash.surcharge).toFixed(2),
      ),
      commissionAmount: parseFloat(
        this.roundNumber.transform(this.movementOfCash.commissionAmount).toFixed(2),
      ),
      administrativeExpenseAmount: parseFloat(
        this.roundNumber
          .transform(this.movementOfCash.administrativeExpenseAmount)
          .toFixed(2),
      ),
      otherExpenseAmount: parseFloat(
        this.roundNumber.transform(this.movementOfCash.otherExpenseAmount).toFixed(2),
      ),
      expirationDate: moment(this.movementOfCash.expirationDate).format('YYYY-MM-DD'),
      receiver: this.movementOfCash.receiver,
      number: this.movementOfCash.number,
      bank: this.movementOfCash.bank ? this.movementOfCash.bank : null,
      titular: this.movementOfCash.titular,
      CUIT: this.movementOfCash.CUIT,
      deliveredBy: this.movementOfCash.deliveredBy,
      quota: this.quotas,
      days: this.days,
      period: this.period,
      interestPercentage: this.interestPercentage,
      taxPercentage: this.movementOfCash.taxPercentage,
      interestType: this.interestType,
      quotationNative: this.quotationNative,
      quotationAmount: this.quotationAmount,
      balanceCanceled: parseFloat(
        this.roundNumber.transform(this.movementOfCash.balanceCanceled).toFixed(2),
      ),
    };

    this.movementOfCashForm.setValue(values);
  }

  onValueChanged(fieldID?: any): void {
    if (!this.movementOfCashForm) {
      return;
    }
    const form = this.movementOfCashForm;

    if (!fieldID || typeof fieldID === 'string') {
      for (const field in this.formErrors) {
        if (!fieldID || field === fieldID) {
          this.formErrors[field] = '';
          const control = form.get(field);

          if (control && !control.valid) {
            const messages = this.validationMessages[field];

            for (const key in control.errors) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
      if (this.transaction.totalPrice !== 0) {
        this.paymentChange = (
          this.movementOfCashForm.value.amountToPay +
          this.movementOfCashForm.value.amountPaid -
          this.movementOfCashForm.value.transactionAmount
        ).toFixed(2);
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
  }

  searchBanks = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap((term) =>
        this.getBanks(
          term && term !== ''
            ? {
                $or: [
                  {name: {$regex: term, $options: 'i'}},
                  {code: {$regex: term, $options: 'i'}},
                  {account: {$regex: term, $options: 'i'}},
                  {agency: {$regex: term, $options: 'i'}},
                ],
              }
            : {},
        ).then((banks) => {
          return banks;
        }),
      ),
      tap(() => (this.loading = false)),
    );

  formatterBanks = (x: Bank) => x.name;

  getBanks(match: {}): Promise<Bank[]> {
    this.loading = true;

    return new Promise<Bank[]>((resolve, reject) => {
      match['operationType'] = {$ne: 'D'};
      this.subscription.add(
        this._bankService
          .getAll({
            project: {
              _id: 1,
              code: {$toString: '$code'},
              name: 1,
              account: 1,
              agency: {$toString: '$agency'},
            },
            match,
            sort: {name: 1},
            limit: 10,
          })
          .subscribe(
            (result) => {
              this.loading = false;
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error),
          ),
      );
    });
  }

  calculateQuotas(field: string, newValue?: any, movement?: MovementOfCash): void {
    this.quotas = this.movementOfCashForm.value.quota;
    this.days = this.movementOfCashForm.value.days;
    this.period = this.movementOfCashForm.value.period;
    this.interestPercentage = this.movementOfCashForm.value.interestPercentage;
    this.movementOfCash.taxPercentage = this.movementOfCashForm.value.taxPercentage;
    this.interestType = this.movementOfCashForm.value.interestType;
    let expirationDate: number = 0;
    let amountTotal: number = 0;
    let amountToPayTemp: number =
      this.amountToPay +
      this.movementOfCash.commissionAmount +
      this.movementOfCash.administrativeExpenseAmount +
      this.movementOfCash.otherExpenseAmount;

    // if (!this.paymentMethodSelected.payFirstQuota && this.period === 'Diario') {
    //     expirationDate += this.days;
    // }
    switch (field) {
      case 'quota':
        this.movementsOfCashesToFinance = new Array();
        this.totalInterestAmount = 0;
        this.totalTaxAmount = 0;
        for (let i = 0; i < this.quotas; i++) {
          let mov: MovementOfCash = new MovementOfCash();

          mov.expirationDate = mov.date;
          mov.transaction = this.transaction;
          mov.type = this.paymentMethodSelected;
          mov.observation = this.movementOfCash.observation;
          mov.quota = i + 1;
          switch (this.interestType) {
            case 'Interés Simple':
              mov.interestAmount = this.roundNumber.transform(
                (this.roundNumber.transform(amountToPayTemp) * this.interestPercentage) /
                  100 /
                  this.quotas,
              );
              mov.taxAmount = this.roundNumber.transform(
                (mov.interestAmount * this.movementOfCash.taxPercentage) / 100,
              );
              mov.capital = this.roundNumber.transform(amountToPayTemp / this.quotas);
              mov.amountPaid = this.roundNumber.transform(
                mov.capital + mov.interestAmount + mov.taxAmount,
              );
              amountTotal += mov.amountPaid;
              if (i === this.quotas - 1) {
                if (
                  amountTotal !==
                  amountToPayTemp + this.totalInterestAmount + this.totalTaxAmount
                ) {
                  mov.amountPaid = this.roundNumber.transform(
                    mov.amountPaid -
                      (amountTotal -
                        (amountToPayTemp +
                          this.totalInterestAmount +
                          this.totalTaxAmount)),
                  );
                }
              }
              break;
            case 'Francés':
              let tasa: number = 0.0000000001;

              if (this.interestPercentage > 0) {
                tasa = this.interestPercentage / 100 / 12;
              }
              let factorTotal: number = Math.pow(1 + tasa, this.quotas);
              let factorQuota: number = Math.pow(1 + tasa, this.quotas + 1 - mov.quota);

              mov.amountPaid = this.roundNumber.transform(
                (amountToPayTemp * tasa * factorTotal) / (factorTotal - 1),
              );
              mov.amountPaid = this.roundNumber.transform(mov.amountPaid);
              mov.capital = this.roundNumber.transform(mov.amountPaid / factorQuota);
              mov.capital = this.roundNumber.transform(mov.capital);
              mov.interestAmount = this.roundNumber.transform(
                mov.amountPaid - mov.capital,
              );
              mov.interestAmount = this.roundNumber.transform(mov.interestAmount);
              if (this.movementOfCash.taxPercentage > 0) {
                mov.taxAmount = this.roundNumber.transform(
                  (mov.interestAmount * this.movementOfCash.taxPercentage) / 100,
                );
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
              mov.interestAmount = this.roundNumber.transform(
                (this.roundNumber.transform(amountToPayTemp) * this.interestPercentage) /
                  100 /
                  this.quotas,
              );
              mov.taxAmount = this.roundNumber.transform(
                (mov.interestAmount * this.movementOfCash.taxPercentage) / 100,
              );
              mov.capital = this.roundNumber.transform(amountToPayTemp / this.quotas);
              mov.amountPaid = this.roundNumber.transform(
                mov.capital + mov.interestAmount + mov.taxAmount,
              );
              amountTotal += mov.amountPaid;
              if (i === this.quotas - 1) {
                if (
                  amountTotal !==
                  amountToPayTemp + this.totalInterestAmount + this.totalTaxAmount
                ) {
                  mov.amountPaid = this.roundNumber.transform(
                    mov.amountPaid -
                      (amountTotal -
                        (amountToPayTemp +
                          this.totalInterestAmount +
                          this.totalTaxAmount)),
                  );
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
          moment(
            moment(this.movementOfCash.expirationDate, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          )
            .add(expirationDate, 'days')
            .format('YYYY-MM-DD')
            .toString(),
          this.movementsOfCashesToFinance[0],
        );
        break;
      case 'amountPaid':
        let totalAmount = 0;

        if (
          this.movementsOfCashesToFinance &&
          this.movementsOfCashesToFinance.length > 0
        ) {
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
        if (
          this.movementsOfCashesToFinance &&
          this.movementsOfCashesToFinance.length > 0
        ) {
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
                    mov.expirationDate = moment(
                      moment(
                        this.movementsOfCashesToFinance[i - 1].expirationDate,
                      ).format('YYYY-MM-DD'),
                    )
                      .add(this.days, 'days')
                      .format('YYYY-MM-DD')
                      .toString();
                    break;
                  case 'Mensual':
                    mov.expirationDate = moment(
                      moment(
                        this.movementsOfCashesToFinance[i - 1].expirationDate,
                      ).format('YYYY-MM-DD'),
                    )
                      .add(this.days, 'month')
                      .format('YYYY-MM-DD')
                      .toString();
                    break;
                  case 'Anual':
                    mov.expirationDate = moment(
                      moment(
                        this.movementsOfCashesToFinance[i - 1].expirationDate,
                      ).format('YYYY-MM-DD'),
                    )
                      .add(this.days, 'year')
                      .format('YYYY-MM-DD')
                      .toString();
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
    try {
      // VERIFICAR SI EL ULTIMO METODO TIENE CURRENCY Y HAY Q DAR DE ALTA AUTOMATICO LO DAMOS AQUI SINO OBTENEMOS TODO
      if (
        op !== 'delete' &&
        this.movementsOfCashes &&
        this.movementsOfCashes.length > 0 &&
        this.movementsOfCashes[0].operationType !== 'D' &&
        this.movementsOfCashes[0].type.currency &&
        this.currencyNative &&
        this.movementsOfCashes[0].type.currency.toString() !==
          this.currencyNative._id.toString()
      ) {
        let lastMovement: MovementOfCash = this.movementsOfCashes[0];

        this.amountPaid = -(
          lastMovement.amountPaid * this.movementOfCashForm.value.quotationNative
        );
        for (let paymentMethod of this.paymentMethods) {
          if (
            paymentMethod.currency &&
            paymentMethod.currency._id.toString() === this.currencyNative._id.toString()
          ) {
            this.paymentMethodSelected = paymentMethod;
          }
        }
        this.movementOfCash = Object.assign(new MovementOfCash(), lastMovement);
        this.movementOfCash._id = '';
        this.movementOfCash.type = this.paymentMethodSelected;
        this.transaction.quotation = this.movementOfCashForm.value.quotationNative;
        this.transaction = await this.updateTransaction();
        this.setValuesForm(this.amountPaid);
        this.addMovementOfCash();
      } else {
        this.loading = true;

        let query = 'where="transaction":"' + this.transaction._id + '"';

        this._movementOfCashService.getMovementsOfCashes(query).subscribe(
          async (result) => {
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

              if (!this.movementsOfCashes || this.movementsOfCashes.length === 0)
                op = 'init';
              this.movementsOfCashes = result.movementsOfCashes;
              if (this.isChargedFinished()) {
                if (await this.areValidAmounts()) {
                  if (this.transaction.totalPrice !== 0) {
                    if (
                      this.transaction.commissionAmount > 0 ||
                      this.transaction.administrativeExpenseAmount > 0 ||
                      this.transaction.otherExpenseAmount > 0
                    ) {
                      let amountPaid = 0;

                      if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
                        for (let movement of this.movementsOfCashes) {
                          amountPaid += this.roundNumber.transform(movement.amountPaid);
                        }
                      }
                      this.transaction.totalPrice = this.roundNumber.transform(
                        amountPaid -
                          this.transaction.commissionAmount -
                          this.transaction.administrativeExpenseAmount -
                          this.transaction.otherExpenseAmount,
                      );
                      await this.updateTransaction();
                    }
                  }
                  this.closeModal();
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
          (error) => {
            throw error;
          },
        );
      }
    } catch (error) {
      this.showToast(error);
    }
  }

  isChargedFinished(): boolean {
    let chargedFinished: boolean = false;
    let amountPaid = 0;

    this.transaction.commissionAmount = 0;
    this.transaction.administrativeExpenseAmount = 0;
    this.transaction.otherExpenseAmount = 0;

    if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
      for (let movement of this.movementsOfCashes) {
        amountPaid += this.roundNumber.transform(movement.amountPaid);
        this.transaction.commissionAmount = movement.commissionAmount;
        this.transaction.administrativeExpenseAmount =
          movement.administrativeExpenseAmount;
        this.transaction.otherExpenseAmount = movement.otherExpenseAmount;
      }
    }

    if (
      this.roundNumber.transform(amountPaid) >=
        this.roundNumber.transform(this.transactionAmount) &&
      this.transactionAmount !== 0
    ) {
      chargedFinished = true;
    }

    return chargedFinished;
  }

  async openModal(op: string, movement?: MovementOfCash) {
    let modalRef;

    switch (op) {
      case 'delete':
        modalRef = this._modalService.open(DeleteMovementOfCashComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.movementOfCash = movement;
        modalRef.result.then(async (result) => {
          try {
            if (result === 'delete_close') {
              if (this.transaction.type.requestArticles) {
                if (
                  (movement.discount && movement.discount !== 0) ||
                  (movement.surcharge && movement.surcharge !== 0)
                ) {
                  let salePrice = 0;

                  if (movement.discount && movement.discount !== 0) {
                    salePrice = (movement.amountPaid * movement.discount) / 100;
                  } else if (movement.surcharge && movement.surcharge !== 0) {
                    salePrice = (movement.amountPaid * movement.surcharge) / 100;
                  }

                  let query =
                    'where="transaction":"' +
                    this.transaction._id +
                    '","salePrice":' +
                    salePrice +
                    '';

                  let movementsOfArticles: MovementOfArticle[] =
                    await this.getMovementsOfArticles(query);

                  if (movementsOfArticles && movementsOfArticles.length > 0) {
                    let movementOfArticle: MovementOfArticle =
                      await this.deleteMovementOfArticle(movementsOfArticles[0]);

                    this.transaction.totalPrice = this.roundNumber.transform(
                      this.transaction.totalPrice - movementOfArticle.salePrice,
                    );
                    this.transaction = await this.updateTransaction();
                    if (this.keyboard) this.keyboard.setInput('');
                    this.getMovementOfCashesByTransaction('delete');
                  } else {
                    this.getMovementOfCashesByTransaction('delete');
                  }
                } else {
                  this.getMovementOfCashesByTransaction('delete');
                }
              } else {
                if (movement.discount && movement.discount !== 0) {
                  this.transaction.totalPrice += this.roundNumber.transform(
                    (movement.amountPaid * movement.discount) / 100,
                  );
                } else if (movement.surcharge && movement.surcharge !== 0) {
                  this.transaction.totalPrice -= this.roundNumber.transform(
                    (movement.amountPaid * movement.surcharge) / 100,
                  );
                }
                this.transaction = await this.updateTransaction();
                if (movement.type.checkDetail) {
                  let query = `where="number":"${movement.number}","type":"${movement.type._id}"`;
                  let movementsOfCashes: MovementOfCash[] =
                    await this.getMovementsOfCashes(query);

                  if (movementsOfCashes && movementsOfCashes.length > 0) {
                    movementsOfCashes[0].statusCheck = StatusCheck.Available;
                    await this.updateMovementOfCash(movementsOfCashes[0]);
                  }
                  this.getMovementOfCashesByTransaction('delete');
                }
                this.getMovementOfCashesByTransaction('delete');
              }
            }
          } catch (error) {
            this.showToast(error);
          }
        });
        break;
      case 'list-movements-of-cashes':
        modalRef = this._modalService.open(SelectChecksComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        // MANDAMOS LÍMITE DE MONTO A SELECCIONAR
        modalRef.componentInstance.transactionAmount = this.roundNumber.transform(
          this.transaction.totalPrice - this.movementOfCashForm.value.amountPaid,
        );
        modalRef.componentInstance.paymentMethod = this.paymentMethodSelected;
        modalRef.componentInstance.transactionType = this.transaction.type;
        modalRef.result.then(async (result) => {
          if (result && result.movementsOfCashes && result.movementsOfCashes.length > 0) {
            try {
              for (let mov of result.movementsOfCashes) {
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
                  await this.saveMovementOfCash();
                  this.cleanForm();

                  // CAMBIAMOS ESTADO DE METODO DE PAGO RELACIONADO EJ. CHEQUE
                  mov.statusCheck = StatusCheck.Closed;
                  mov.amount = mov.amountPaid;

                  // ACTUALIZAMOS ESTADO METODO DE PAGO RELACIONADO EJ. CHEQUEUALIZAMOS ESTADO METODO DE PAGO RELACIONADO EJ. CHEQUE
                  await this.updateMovementOfCash(mov);
                }
              }
              this.getMovementOfCashesByTransaction();
            } catch (error) {
              this.showToast(error);
            }
          }
        });
        break;
      case 'send-email':
        let attachments = [];
      
        if (this.transaction.type.readLayout) {
          modalRef = this._modalService.open(PrintTransactionTypeComponent);
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.componentInstance.source = 'mail';
        } else {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.company = this.transaction.company;
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.componentInstance.typePrint = 'invoice';
          modalRef.componentInstance.source = 'mail';
        }
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
      
        let labelPrint = this.transaction.type.name;
      
        if (this.transaction.type.labelPrint) {
          labelPrint = this.transaction.type.labelPrint;
        }

        if (this.transaction.type.electronics) {
          attachments.push({
            filename: `${this.transaction.origin}-${this.transaction.letter}-${this.transaction.number}.pdf`,
            path: `/home/clients/${Config.database}/invoice/${this.transaction._id}.pdf`,
          });
        } else {
          attachments.push({
            filename: `${this.transaction.origin}-${this.transaction.letter}-${this.transaction.number}.pdf`,
            path: `/home/clients/${Config.database}/others/${this.transaction._id}.pdf`,
          });
        }
      
        if (Config.country === 'MX') {
          attachments.push({
            filename: `${this.transaction.origin}-${this.transaction.letter}-${this.transaction.number}.xml`,
            path: `/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_${this.transaction.number}.xml`,
          });
        }
      
        if (this.transaction.type.defectEmailTemplate) {
          if (this.transaction.type.electronics) {
            attachments = [];
            attachments.push({
              filename: `${this.transaction.origin}-${this.transaction.letter}-${this.transaction.number}.pdf`,
              path: `/home/clients/${Config.database}/invoice/${this.transaction._id}.pdf`,
            });
          } else {
            attachments = [];
            attachments.push({
              filename: `${this.transaction.origin}-${this.transaction.letter}-${this.transaction.number}.pdf`,
              path: `/home/clients/${Config.database}/others/${this.transaction._id}.pdf`,
            });
          }
      
          if (Config.country === 'MX') {
            attachments = [];
            attachments.push({
              filename: `${this.transaction.origin}-${this.transaction.letter}-${this.transaction.number}.xml`,
              path: `/var/www/html/libs/fe/mx/archs_cfdi/CFDI-33_Factura_${this.transaction.number}.xml`,
            });
          }
        }
      
        const email: EmailProps = {
          to: this.transaction.company.emails,
          subject: `${labelPrint} ${padNumber(this.transaction.origin, 4)}-${this.transaction.letter}-${padNumber(this.transaction.number, 8)}`,
          body: this.transaction?.type?.defectEmailTemplate?.design || "",
          attachments: attachments
        };
        
        this.sendEmail(email)
        break;
      case 'cancelation-type-automatic':
        modalRef = this._modalService.open(CancellationTypeAutomaticComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then(
          (result) => {
            if (result && result.transaction) {
              this.isCancellationAutomatic = true;
              this.initVariables();
              this.transactionId = result.transaction._id;
              this.initComponent();
            } else {
              if (this.transaction && this.transaction.type.printable) {
                this.print();
                if (this.transaction && this.transaction.type.requestEmailTemplate)
                  this.openModal('send-email');
              } else {
                this.backFinal();
              }
            }
          },
          (reason) => {
            if (this.transaction && this.transaction.type.printable) {
              this.print();
              if (this.transaction && this.transaction.type.requestEmailTemplate)
                this.openModal('send-email');
            } else {
              this.backFinal();
            }
          },
        );
        break;
      case 'printers':
        await this.getPrinters().then((printers) => {
          if (printers) {
            this.printers = printers;
          }
        });
  
        if (this.countPrinters() > 1) {
          modalRef = this._modalService
            .open(this.contentPrinters, {
              size: 'lg',
              backdrop: 'static',
            })
            .result.then((result) => {
              if (result !== 'cancel' && result !== '') {
                this.distributeImpressions(result);
              }
            });
        } else if (this.countPrinters() === 1) {
          this.distributeImpressions(this.printersAux[0]);
        } else {
          this.backFinal();
        }
        break;
      case 'cancel':
        modalRef = this._modalService.open(DeleteTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then(async (result) => {
          if (result === 'delete_close') {
            if (this.posType === 'resto' && this.transaction.table) {
              this.transaction.table.employee = null;
              this.transaction.table.state = TableState.Available;
              await this.updateTable(this.transaction.table).then((table) => {
                if (table) {
                  this.transaction.table = table;
                  this.backFinal();
                }
              });
            } else {
              this.backFinal();
            }
          }
        });
        break;
      case 'charge':
        this.typeOfOperationToPrint = 'charge';
  
        if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          this.transaction = await this.assignLetter();
        }
  
        if ((await this.isValidCharge()) && (await this.areValidMovementOfArticle())) {
          if (this.transaction.type.requestPaymentMethods || this.fastPayment) {
            modalRef = this._modalService.open(AddMovementOfCashComponent, {
              size: 'lg',
              backdrop: 'static',
            });
            modalRef.componentInstance.transaction = this.transaction;
            if (this.fastPayment) {
              modalRef.componentInstance.fastPayment = this.fastPayment;
            }
            modalRef.result.then((result) => {
              if (result != 'cancel') {
                this.movementsOfCashes = result.movementsOfCashes;
  
                if (this.movementsOfCashes) {
                  this.transaction = result.transaction;
  
                  if (result.movementOfArticle) {
                    this.movementsOfArticles.push(result.movementOfArticle);
                  }
  
                  if (
                    this.transaction.type.transactionMovement === TransactionMovement.Sale
                  ) {
                    if (
                      this.transaction.type.fixedOrigin &&
                      this.transaction.type.fixedOrigin !== 0
                    ) {
                      this.transaction.origin = this.transaction.type.fixedOrigin;
                    }
  
                    if (this.transaction.type.electronics) {
                      if (this.config['country'] === 'MX') {
                        if (
                          !this.transaction.CFDStamp &&
                          !this.transaction.SATStamp &&
                          !this.transaction.stringSAT
                        ) {
                          this.validateElectronicTransactionMX();
                        } else {
                          this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
                        }
                      } else if (this.config['country'] === 'AR') {
                        if (!this.transaction.CAE) {
                          this.validateElectronicTransactionAR();
                        } else {
                          this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
                        }
                      } else {
                        this.showMessage(
                          'Facturación electrónica no esta habilitada para tu país.',
                          'info',
                          true,
                        );
                      }
                    } else if (
                      this.transaction.type.electronics &&
                      this.transaction.CAE
                    ) {
                      this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
                    } else {
                      if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                        this.assignTransactionNumber();
                      } else {
                        this.close('charge');
                      }
                    }
                  } else {
                    this.close('charge');
                  }
                }
              } else {
                this.voucherArticlesToPrint = [];
              }
            });
          } else {
            if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.transaction = await this.assignLetter();
              if (this.transaction.type.electronics && !this.transaction.CAE) {
                this.validateElectronicTransactionAR();
              } else if (this.transaction.type.electronics && this.transaction.CAE) {
                this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
              } else {
                if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                  this.assignTransactionNumber();
                } else {
                  this.close('charge');
                }
              }
            } else {
              this.close('charge');
            }
          }
        }
        break;
      case 'print':
        if (this.transaction.type.readLayout) {
          modalRef = this._modalService.open(PrintTransactionTypeComponent);
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.result.then(() => {
            this.backFinal();
          });
        } else {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.componentInstance.company = this.transaction.company;
          modalRef.componentInstance.printer = this.printerSelected;
          modalRef.componentInstance.typePrint = 'invoice';
          modalRef.result
          .then(() => {
            this.backFinal();
          })
          .catch((e) => {
            this.backFinal();
          });
        }
    
        break;
      case 'printKitchen':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.kitchenArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'kitchen';
    
        modalRef.result
          .then(() => {
            this.updateMovementOfArticlePrintedKitchen();
          })
          .catch((e) => {
            this.updateMovementOfArticlePrintedKitchen();
          });
        break;
      case 'printBar':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.barArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'bar';
    
        modalRef.result
          .then(() => {
            this.updateMovementOfArticlePrintedBar();
          })
          .catch((e) => {
            this.updateMovementOfArticlePrintedBar();
          });
        break;
      case 'printVoucher':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.voucherArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'voucher';
    
        modalRef.result
          .then(() => {
            this.updateMovementOfArticlePrintedVoucher();
          })
          .catch((e) => {
            this.updateMovementOfArticlePrintedVoucher();
          });
        break;
      default:
        break;
    }
  }

  async areValidMovementOfArticle(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      try {
        let isValid: boolean = true;

        for (let movementOfArticle of this.movementsOfArticles) {
          if (isValid) isValid = await this.isValidMovementOfArticle(movementOfArticle);
        }
        resolve(isValid);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async isValidMovementOfArticle(
    movementOfArticle: MovementOfArticle,
    verifyStock: boolean = true,
  ): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      try {
        if (
          this.transaction.type &&
          this.transaction.type.transactionMovement === TransactionMovement.Sale &&
          movementOfArticle.article &&
          !movementOfArticle.article.allowSale
        )
          throw new Error(
            `El producto ${movementOfArticle.article.description} (${movementOfArticle.article.code}) no esta habilitado para la venta`,
          );

        if (
          this.transaction.type &&
          this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
          movementOfArticle.article &&
          !movementOfArticle.article.allowPurchase
        )
          throw new Error(
            `El producto ${movementOfArticle.article.description} (${movementOfArticle.article.code}) no esta habilitado para la compra`,
          );
        if (verifyStock && !(await this.hasStock(movementOfArticle)))
          throw new Error(
            `No tiene el stock suficiente del producto ${movementOfArticle.article.description} (${movementOfArticle.article.code}).`,
          );
        resolve(true);
      } catch (error) {
        this.showToast(error);
        resolve(false);
      }
    });
  }

  async hasStock(movementOfArticle: MovementOfArticle): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let has: boolean = true;

        if (
          movementOfArticle.article &&
          this.config['modules'].stock &&
          movementOfArticle.modifyStock &&
          (movementOfArticle.stockMovement === StockMovement.Outflows ||
            movementOfArticle.stockMovement === StockMovement.Transfer) &&
          !movementOfArticle.article.allowSaleWithoutStock
        ) {
          let articleStocks: ArticleStock[] = await this.getArticleStock(
            movementOfArticle,
          );
          let articleStock: ArticleStock;

          if (articleStocks && articleStocks.length > 0) articleStock = articleStocks[0];
          let totalStock: number = movementOfArticle.amount;

          this.movementsOfArticles.forEach((mov: MovementOfArticle) => {
            if (
              mov._id.toString() !== movementOfArticle._id.toString() &&
              mov.article._id.toString() === movementOfArticle.article._id.toString()
            ) {
              totalStock += mov.amount - mov.quantityForStock;
            }
          });
          if (!articleStock || totalStock > articleStock.realStock) {
            if (
              !(
                this.transaction.type.stockMovement === StockMovement.Transfer &&
                movementOfArticle.deposit &&
                movementOfArticle.deposit._id.toString() ===
                  this.transaction.depositDestination._id.toString()
              )
            ) {
              has = false;
            }
          }
        }
        resolve(has);
      } catch (error) {
        reject(error);
      }
    });
  }

  getArticleStock(movementOfArticle: MovementOfArticle): Promise<ArticleStock[]> {
    return new Promise<ArticleStock[]>((resolve, reject) => {
      let depositID;
      let query;

      if (
        movementOfArticle.article.deposits &&
        movementOfArticle.article.deposits.length > 0
      ) {
        movementOfArticle.article.deposits.forEach((element) => {
          if (element.deposit.branch._id === this.transaction.branchOrigin._id) {
            depositID = element.deposit._id;
          }
        });
      }
      if (depositID) {
        query = `where= "article": "${movementOfArticle.article._id}",
                        "branch": "${this.transaction.branchOrigin._id}",
                        "deposit": "${depositID}"`;
      } else {
        query = `where= "article": "${movementOfArticle.article._id}",
                        "branch": "${this.transaction.branchOrigin._id}",
                        "deposit": "${this.transaction.depositOrigin._id}"`;
      }

      this._articleStockService.getArticleStocks(query).subscribe(
        (result) => {
          if (result.articleStocks) resolve(result.articleStocks);
          else reject(result);
        },
        (error) => reject(error),
      );
    });
  }



  async isValidCharge(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        if (this.movementsOfArticles && this.movementsOfArticles.length <= 0)
          throw new Error('No existen productos en la transacción');

        await this.areValidMovementOfArticle();

        if (
          this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
          !this.transaction.company
        )
          throw new Error(`Debe seleccionar un proveedor para la transacción`);

        if (
          this.transaction.type.transactionMovement === TransactionMovement.Sale &&
          !this.transaction.company &&
          this.transaction.type.requestCompany
        )
          throw new Error(`Debe seleccionar un cliente para la transacción`);

        if (
          this.transaction.type.electronics &&
          this.transaction.totalPrice >= 26228 &&
          !this.transaction.company &&
          this.config['country'] === 'AR'
        )
          throw new Error(
            `Debe indentificar al cliente para transacciones electrónicos con monto mayor a $5.000,00`,
          );

        if (
          this.transaction.type.electronics &&
          this.transaction.company &&
          (!this.transaction.company.identificationType ||
            !this.transaction.company.identificationValue ||
            this.transaction.company.identificationValue === '')
        )
          throw new Error(`El cliente ingresado no tiene número de identificación`);

        if (
          this.transaction.type.fixedOrigin &&
          this.transaction.type.fixedOrigin === 0 &&
          this.transaction.type.electronics &&
          this.config['country'] === 'MX'
        )
          throw new Error(
            `Debe configurar un punto de venta para transacciones electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción`,
          );

        resolve(true);
      } catch (error) {
        this.showToast(error);
        resolve(false);
      }
    });
  }


  async assignTransactionNumber() {
    try {
      let query = `where= "type":"${this.transaction.type._id}",
            "origin":${this.transaction.origin},
            "letter":"${this.transaction.letter}",
            "_id":{"$ne":"${this.transaction._id}"}
            &sort="number":-1
            &limit=1`;

      this._transactionService.getTransactions(query).subscribe(
        async (result) => {
          if (!result.transactions || result.transactions.length === 0) {
            this.transaction.number = 1;
          } else {
            this.transaction.number = result.transactions[0].number + 1;
          }
          this.transaction = await this.updateTransaction();
          this.close('charge');
        },
        (error) => {
          throw error;
        },
      );
    } catch (error) {
      this.showToast(error);
    }
  }


  updateMovementOfArticlePrintedBar(): void {
    this.loading = true;

    this.barArticlesToPrint[this.barArticlesPrinted].printed =
      this.barArticlesToPrint[this.barArticlesPrinted].amount;
    this._movementOfArticleService
      .updateMovementOfArticle(this.barArticlesToPrint[this.barArticlesPrinted])
      .subscribe(
        async (result) => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
          } else {
            this.barArticlesPrinted++;
            if (this.barArticlesPrinted < this.barArticlesToPrint.length) {
              this.updateMovementOfArticlePrintedBar();
            } else {
              if (this.kitchenArticlesToPrint.length > 0) {
                this.typeOfOperationToPrint = 'kitchen';
                this.distributeImpressions(null);
              } else if (this.voucherArticlesToPrint.length > 0) {
                this.typeOfOperationToPrint = 'voucher';
                this.distributeImpressions(null);
              } else {
                if (this.isCharge) {
                  this.finish();
                } else {
                  this.backFinal();
                }
              }
            }
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
        },
      );
  }

  updateMovementOfArticlePrintedKitchen(): void {
    this.loading = true;

    this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].printed =
      this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].amount;
    this._movementOfArticleService
      .updateMovementOfArticle(this.kitchenArticlesToPrint[this.kitchenArticlesPrinted])
      .subscribe(
        async (result) => {
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
          } else {
            this.kitchenArticlesPrinted++;
            if (this.kitchenArticlesPrinted < this.kitchenArticlesToPrint.length) {
              this.updateMovementOfArticlePrintedKitchen();
            } else {
              if (this.voucherArticlesToPrint.length > 0) {
                this.typeOfOperationToPrint = 'voucher';
                this.distributeImpressions(null);
              } else {
                if (this.isCharge) {
                  this.finish();
                } else {
                  this.backFinal();
                }
              }
            }
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      );
  }

  updateMovementOfArticlePrintedVoucher(): void {
    this.loading = true;

    if (
      this.voucherArticlesToPrint[this.voucherArticlesPrinted] &&
      this.voucherArticlesToPrint[this.voucherArticlesPrinted].amount
    ) {
      this.voucherArticlesToPrint[this.voucherArticlesPrinted].printed =
        this.voucherArticlesToPrint[this.voucherArticlesPrinted].amount;
      this._movementOfArticleService
        .updateMovementOfArticle(this.voucherArticlesToPrint[this.voucherArticlesPrinted])
        .subscribe(
          async (result) => {
            if (!result.movementOfArticle) {
              if (result.message && result.message !== '')
                this.showMessage(result.message, 'info', true);
            } else {
              this.voucherArticlesPrinted++;
              if (this.voucherArticlesPrinted < this.voucherArticlesToPrint.length) {
                this.updateMovementOfArticlePrintedVoucher();
              } else {
                if (this.isCharge) {
                  this.finish();
                } else {
                  this.backFinal();
                }
              }
            }
            this.loading = false;
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
          },
        );
    } else {
      if (this.isCharge) {
        this.openModal('charge');
      } else {
        this.backFinal();
      }
    }
  }


  async assignLetter(): Promise<Transaction> {
    if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
      this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
    } else {
      if (this.config['country'] === 'AR') {
        if (
          this.config['companyVatCondition'] &&
          this.config['companyVatCondition'].description === 'Responsable Inscripto'
        ) {
          if (this.transaction.company && this.transaction.company.vatCondition) {
            this.transaction.letter =
              this.transaction.company.vatCondition.transactionLetter;
          } else {
            this.transaction.letter = 'B';
          }
        } else if (
          this.config['companyVatCondition'] &&
          this.config['companyVatCondition'].description === 'Monotributista'
        ) {
          this.transaction.letter = 'C';
        } else {
          this.transaction.letter = 'X';
        }
      }
    }

    return this.updateTransaction();
  }


  async validateElectronicTransactionAR() {
    this.showMessage('Validando comprobante con AFIP...', 'info', false);
    this.loading = true;
    this.transaction.type.defectEmailTemplate = null;

    this.canceledTransactions =
      this.canceledTransactions &&
      this.canceledTransactions.typeId &&
      this.canceledTransactions.typeId != ''
        ? this.canceledTransactions
        : null;
    this._transactionService
      .validateElectronicTransactionAR(this.transaction, this.canceledTransactions)
      .subscribe(
        (result: Resulteable) => {
          if (result.status === 200) {
            let transactionResponse: Transaction = result.result;

            this.transaction.CAE = transactionResponse.CAE;
            this.transaction.CAEExpirationDate = transactionResponse.CAEExpirationDate;
            this.transaction.number = transactionResponse.number;
            this.transaction.state = transactionResponse.state;
            this.finish();
          } else this.showToast(result);
        },
        (error) => {
          this.showToast(error);
        },
      );
  }


  validateElectronicTransactionMX(): void {
    this.showMessage('Validando comprobante con SAT...', 'info', false);

    this._transactionService
      .validateElectronicTransactionMX(
        this.transaction,
        this.movementsOfArticles,
        this.movementsOfCashes,
      )
      .subscribe(
        (result) => {
          if (result.status === 'err') {
            let msn = '';

            if (result.code && result.code !== '') {
              msn += 'ERROR ' + result.code + ': ';
            }
            if (result.message && result.message !== '') {
              msn += result.message + '. ';
            }
            if (msn === '') {
              msn =
                'Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.';
            }
            this.showMessage(msn, 'info', true);

            let body = {
              transaction: {
                origin: this.transaction.origin,
                letter: this.transaction.letter,
                number: this.transaction.number,
                startDate: this.transaction.startDate,
                endDate: this.transaction.endDate,
                expirationDate: this.transaction.expirationDate,
                VATPeriod: this.transaction.VATPeriod,
                state: this.transaction.state,
                basePrice: this.transaction.basePrice,
                exempt: this.transaction.exempt,
                discountAmount: this.transaction.discountAmount,
                discountPercent: this.transaction.discountPercent,
                totalPrice: this.transaction.totalPrice,
                roundingAmount: this.transaction.roundingAmount,
                CAE: this.transaction.CAE,
                CAEExpirationDate: this.transaction.CAEExpirationDate,
                type: this.transaction.type,
                company: this.transaction.company,
                priceList: this.transaction.priceList,
              },
              config: {
                companyIdentificationValue: this.config['companyIdentificationValue'],
                vatCondition: this.config['companyVatCondition'].code,
                database: this.config['database'],
              },
            };
          } else {
            if (this.transaction.type.finishState) {
              this.transaction.state = this.transaction.type.finishState;
            } else {
              this.transaction.state = TransactionState.Closed;
            }
            this.transaction.stringSAT = result.stringSAT;
            this.transaction.CFDStamp = result.CFDStamp;
            this.transaction.SATStamp = result.SATStamp;
            this.transaction.endDate = result.endDate;
            this.transaction.UUID = result.UUID;
            this.finish();
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(
            'Ha ocurrido un error en el servidor. Comuníquese con Soporte.',
            'danger',
            false,
          );
          this.loading = false;
        },
      );
  }


  countPrinters(): number {
    let numberOfPrinters: number = 0;

    this.printersAux = new Array();

    if (this.printers != undefined) {
      for (let printer of this.printers) {
        if (
          this.typeOfOperationToPrint === 'charge' &&
          printer.printIn === PrinterPrintIn.Counter
        ) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (
          this.typeOfOperationToPrint === 'bill' &&
          printer.printIn === PrinterPrintIn.Counter
        ) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (
          this.typeOfOperationToPrint === 'bar' &&
          printer.printIn === PrinterPrintIn.Bar
        ) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (
          this.typeOfOperationToPrint === 'kitchen' &&
          printer.printIn === PrinterPrintIn.Kitchen
        ) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (
          this.typeOfOperationToPrint === 'voucher' &&
          printer.printIn === PrinterPrintIn.Voucher
        ) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    return numberOfPrinters;
  }

  async close(op?: string) {
    if (op === 'charge') {
      this.isCharge = true;
    } else {
      this.isCharge = false;
    }

    if (this.transaction.type.posKitchen) {
      this.typeOfOperationToPrint = 'item';
      if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
        for (let movementOfArticle of this.movementsOfArticles) {
          if (
            movementOfArticle.article &&
            movementOfArticle.article.printIn === ArticlePrintIn.Bar &&
            movementOfArticle.printed < movementOfArticle.amount
          ) {
            this.barArticlesToPrint.push(movementOfArticle);
          }
          if (
            movementOfArticle.article &&
            movementOfArticle.article.printIn === ArticlePrintIn.Kitchen &&
            movementOfArticle.printed < movementOfArticle.amount
          ) {
            this.kitchenArticlesToPrint.push(movementOfArticle);
          }
          if (
            movementOfArticle.article &&
            movementOfArticle.article.printIn === ArticlePrintIn.Voucher &&
            movementOfArticle.printed < movementOfArticle.amount
          ) {
            this.voucherArticlesToPrint.push(movementOfArticle);
          }
        }
      }
    }
    if (this.barArticlesToPrint && this.barArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = 'bar';
      this.distributeImpressions();
    } else if (this.kitchenArticlesToPrint && this.kitchenArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = 'kitchen';
      this.distributeImpressions();
    } else if (this.voucherArticlesToPrint && this.voucherArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = 'voucher';
      this.distributeImpressions();
    } else {
      if (this.isCharge) {
        this.finish();
      } else {
        this.backFinal();
      }
    }
  }

  backFinal(): void {
    this._route.queryParams.subscribe((params) => {
      if (params['returnURL']) {
        if (params['automaticCreation']) {
          if (this.transaction.state === TransactionState.Closed) {
            let route = params['returnURL'].split('?')[0];
            let paramsFromRoute = params['returnURL'].split('?')[1];

            if (paramsFromRoute && paramsFromRoute !== '') {
              paramsFromRoute = removeParam(paramsFromRoute, 'automaticCreation');
              route +=
                '?' +
                paramsFromRoute +
                '&automaticCreation=' +
                params['automaticCreation'];
            } else {
              route += '?' + 'automaticCreation=' + params['automaticCreation'];
            }
            this._router.navigateByUrl(route);
          } else {
            this._router.navigateByUrl(
              removeParam(params['returnURL'], 'automaticCreation'),
            );
          }
        } else {
          this._router.navigateByUrl(params['returnURL']);
        }
      }
    });
  }

  getTransaction(): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.getTransaction(this.transactionId).subscribe(
        async (result) => {
          if (result.transaction) {
            resolve(result.transaction);
          } else reject(result);
        },
        (error) => reject(error),
      );
    });
  }

  async initComponent() {
    try {
      this.loading = true;

      if (this.transactionId) {
        this.transaction = await this.getTransaction();

        if (this.transaction.type.optionalAFIP && !this.transaction.optionalAFIP) {
          this.transaction.optionalAFIP = this.transaction.type.optionalAFIP;
        }

        if (!this.transaction.company && this.transaction.type.company) {
          this.transaction.company = this.transaction.type.company;
        }

        if (
          this.transaction &&
          this.transaction.company &&
          this.transaction.company.transport
        ) {
          this.transaction.transport = this.transaction.company.transport;
        }
        if (
          this.transaction.state === TransactionState.Closed ||
          this.transaction.state === TransactionState.Canceled ||
          this.transaction.CAE
        ) {
          if (this.posType === 'resto' && this.transaction.table) {
            this.transaction.table.employee = null;
            this.transaction.table.state = TableState.Available;
            this.transaction.table = await this.updateTable(this.transaction.table);
          }
          this.backFinal();
        } else {
          this.getBusinessRules().then((businessRules) => {
            if (businessRules && businessRules.length > 0) {
              this.showBussinessRulesButton = true;
            }
          });

          this.transactionMovement = '' + this.transaction.type.transactionMovement || '';
          this.filtersTaxClassification = [
            TaxClassification.Withholding,
            TaxClassification.Perception,
          ];
          this.lastQuotation = this.transaction.quotation;

          if (
            this.userCountry === 'MX' &&
            this.transaction.type.defectUseOfCFDI &&
            !this.transaction.useOfCFDI
          ) {
            this.transaction.useOfCFDI = this.transaction.type.defectUseOfCFDI;
          }

          this.cancellationTypes = await this.getCancellationTypes();
          if (this.cancellationTypes) {
            this.cancellationTypes = this.cancellationTypes;
            this.showButtonInformCancellation = true;
            this.showButtonCancelation = true;
          } else {
            this.showButtonCancelation = false;
          }

          this.movementsOfCancellations = await this.getMovementsOfCancellations();
          if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
            this.showButtonCancelation = false;
          } else {
            this.showButtonCancelation = true;
          }
          this.getTransports();

          this.getMovementsOfTransaction();
        }
      }

      this.loading = false;
    } catch (error) {
      this.showToast(error);
    }
  }

  getTransports(): void {
    this.loading = true;

    this._transportService
      .getTransports(
        {name: 1, operationType: 1}, // PROJECT
        {operationType: {$ne: 'D'}}, // MATCH
        {name: 1}, // SORT
        {}, // GROUP
        0, // LIMIT
        0, // SKIP
      )
      .subscribe(
        (result) => {
          if (result && result.transports && result.transports.length > 0) {
            this.transports = result.transports;
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        },
      );
  }

  getMovementsOfCancellations(): Promise<MovementOfCancellation[]> {
    return new Promise<MovementOfCancellation[]>((resolve) => {
      this._movementOfCancellationService
        .getAll({
          project: {
            _id: 1,
            transactionDestination: 1,
            'transactionOrigin._id': 1,
            'transactionOrigin.type.codes': 1,
            'transactionOrigin.type.electronics': 1,
            'transactionOrigin.letter': 1,
            'transactionOrigin.origin': 1,
            'transactionOrigin.number': 1,
          },
          match: {transactionDestination: {$oid: this.transaction._id}},
        })
        .subscribe(
          (result) => {
            if (result.status == 200) {
              resolve(result.result);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          },
        );
    });
  }

  getCancellationTypes(): Promise<CancellationType[]> {
    return new Promise<CancellationType[]>((resolve) => {
      this._cancellationTypeService
        .getCancellationTypes(
          {
            'destination._id': 1,
            'destination.name': 1,
            'origin._id': 1,
            'origin.name': 1,
            operationType: 1,
          }, // PROJECT
          {
            'destination._id': {$oid: this.transaction.type._id},
            operationType: {$ne: 'D'},
          }, // MATCH
          {order: 1}, // SORT
          {}, // GROUP
          0, // LIMIT
          0, // SKIP
        )
        .subscribe(
          (result) => {
            if (
              result &&
              result.cancellationTypes &&
              result.cancellationTypes.length > 0
            ) {
              resolve(result.cancellationTypes);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          },
        );
    });
  }

  getBusinessRules(): Promise<BusinessRule[]> {
    return new Promise<BusinessRule[]>((resolve) => {
      this.loading = true;

      this._businessRulesService
        .getAll({
          match: {
            $or: [
              {transactionTypeIds: {$in: [this.transaction.type._id]}},
              {transactionTypeIds: {$size: 0}},
            ],
          },
        })
        .subscribe(
          (result: Resulteable) => {
            if (result.status === 200) {
              resolve(result.result);
            } else {
              resolve(null);
            }
          },
          () => {
            this.loading = false;
            resolve(null);
          },
        );
    });
  }

  updateMovementOfArticle(
    movementOfArticle: MovementOfArticle,
  ): Promise<MovementOfArticle> {
    return new Promise<MovementOfArticle>(async (resolve, reject) => {
      this.loading = true;
      movementOfArticle.basePrice = this.roundNumber.transform(
        movementOfArticle.basePrice,
      );
      movementOfArticle.costPrice = this.roundNumber.transform(
        movementOfArticle.costPrice,
      );
      movementOfArticle.salePrice = this.roundNumber.transform(
        movementOfArticle.salePrice,
      );

      // LIMPIAR UN POCO LA RELACIÓN
      movementOfArticle.transaction = new Transaction();
      movementOfArticle.transaction._id = this.transaction._id;
      // FIN DE LIMPIADO

      this._movementOfArticleService.updateMovementOfArticle(movementOfArticle).subscribe(
        (result) => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
            reject(result.message);
          } else {
            this.containerMovementsOfArticles.nativeElement.scrollTop =
              this.containerMovementsOfArticles.nativeElement.scrollHeight;
            resolve(result.movementOfArticle);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          reject(error);
        },
      );
    });
  }

  getMovementsOfTransaction(): void {
    this.hideMessage();

    this.loading = true;

    let query = 'where="transaction":"' + this.transaction._id + '"';

    this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
      (result) => {
        if (!result.movementsOfArticles) {
          this.areMovementsOfArticlesEmpty = true;
          this.movementsOfArticles = new Array();
          this.lastMovementOfArticle = null;
          this.updatePrices();
        } else {
          this.areMovementsOfArticlesEmpty = false;
          this.movementsOfArticles = result.movementsOfArticles;
          this.lastMovementOfArticle =
            this.movementsOfArticles[this.movementsOfArticles.length - 1];
          this.containerMovementsOfArticles.nativeElement.scrollTop =
            this.containerMovementsOfArticles.nativeElement.scrollHeight;
          this.updateQuantity();
          this.updatePrices();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      },
    );
  }

  async updatePrices(discountPercent?: number) {
    this.loading = true;

    let totalPriceAux: number = 0;
    let discountAmountAux: number = 0;

    if (!discountPercent && this.transaction.discountPercent === 0) {
      if (
        this.transaction.company &&
        this.transaction.company.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.discount;
      if (
        this.transaction.company &&
        this.transaction.company.group &&
        this.transaction.company.group.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.group.discount;
    }

    if (discountPercent !== undefined) {
      this.transaction.discountPercent = this.roundNumber.transform(discountPercent, 6);
      if (
        this.transaction.company &&
        this.transaction.company.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.discount;
      if (
        this.transaction.company &&
        this.transaction.company.group &&
        this.transaction.company.group.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.group.discount;
    }

    let isUpdateValid: boolean = true;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        // BORRAMOS TAXES ID PARA COMPARAR
        for (let taxes of movementOfArticle.taxes) {
          delete taxes._id;
        }
        let oldMovementOfArticle: {} = {};

        oldMovementOfArticle = Object.assign(oldMovementOfArticle, movementOfArticle);
        if (
          !movementOfArticle.movementParent ||
          (movementOfArticle.movementParent && movementOfArticle.isOptional)
        ) {
          this.transaction.discountPercent = this.roundNumber.transform(
            this.transaction.discountPercent,
            6,
          );
          if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
            movementOfArticle = await this.recalculateSalePrice(movementOfArticle);
          } else {
            movementOfArticle = this.recalculateCostPrice(movementOfArticle);
          }
          totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
          discountAmountAux += this.roundNumber.transform(
            movementOfArticle.transactionDiscountAmount * movementOfArticle.amount,
            6,
          );
          // COMPARAMOS JSON -- SI CAMBIO ACTUALIZAMOS
          if (
            this._jsonDiffPipe.transform(oldMovementOfArticle, movementOfArticle) ||
            (oldMovementOfArticle['taxes'] &&
              oldMovementOfArticle['taxes'].length > 0 &&
              movementOfArticle['taxes'] &&
              movementOfArticle['taxes'].length > 0 &&
              oldMovementOfArticle['taxes'][0].taxAmount !==
                movementOfArticle['taxes'][0].taxAmount)
          ) {
            try {
              let result = await this.updateMovementOfArticle(movementOfArticle);

              if (!result) {
                isUpdateValid = false;
                break;
              }
            } catch (error) {
              isUpdateValid = false;
            }
          }
        }
      }
    } else {
      isUpdateValid = true;
      totalPriceAux = 0;
      this.transaction.discountPercent = 0;
      discountAmountAux = 0;
    }

    this.priceList = null;
    this.newPriceList = null;

    if (isUpdateValid) {
      this.transaction.totalPrice = totalPriceAux;
      this.transaction.discountAmount = discountAmountAux;
      if (this.transaction.type.requestTaxes) {
        this.loading = false;
        await this.updateTaxes();
      } else {
        this.transaction.exempt = this.transaction.totalPrice;
        await this.updateTransaction().then(async (transaction) => {
          if (transaction) {
            this.loading = false;
            this.transaction = transaction;
            this.lastQuotation = this.transaction.quotation;
            if (this.isCancellationAutomatic) {
              this.openModal('charge');
            }
          } else {
            this.loading = false;
            this.hideMessage();
            this.getMovementsOfTransaction();
          }
        });
      }
    } else {
      this.loading = false;
      this.getMovementsOfTransaction(); // EN CASO DE QUE DE ERROR DE ACTUALIZAR ALGÚN PRODUCTO.
    }
  }

  async updateTaxes() {
    this.loading = true;

    let oldTaxes: Taxes[] = this.transaction.taxes;
    let totalPriceAux = 0;

    let transactionTaxes: Taxes[] = new Array();
    let transactionTaxesAUX: Taxes[] = new Array();

    this.transaction.exempt = 0;
    this.transaction.basePrice = 0;
    if (this.movementsOfArticles) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (movementOfArticle.taxes && movementOfArticle.taxes.length !== 0) {
          let taxBaseTotal = 0;
          let taxAmountTotal = 0;

          for (let taxesAux of movementOfArticle.taxes) {
            let transactionTax: Taxes = new Taxes();

            transactionTax.percentage = this.roundNumber.transform(taxesAux.percentage);
            transactionTax.tax = taxesAux.tax;
            transactionTax.taxBase = this.roundNumber.transform(taxesAux.taxBase, 4);
            transactionTax.taxAmount = this.roundNumber.transform(taxesAux.taxAmount, 4);
            transactionTaxesAUX.push(transactionTax);
            this.transaction.basePrice += this.roundNumber.transform(
              transactionTax.taxBase,
            );
            taxBaseTotal += this.roundNumber.transform(transactionTax.taxBase);
            taxAmountTotal += this.roundNumber.transform(transactionTax.taxAmount);
          }
          if (taxBaseTotal === 0) {
            this.transaction.exempt += this.roundNumber.transform(
              movementOfArticle.salePrice - taxAmountTotal,
            );
          }
        } else {
          this.transaction.exempt += this.roundNumber.transform(
            movementOfArticle.salePrice,
          );
        }
        totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
      }
    }

    this.transaction.basePrice = this.roundNumber.transform(this.transaction.basePrice);

    if (transactionTaxesAUX) {
      for (let transactionTaxAux of transactionTaxesAUX) {
        let exists: boolean = false;

        for (let transactionTax of transactionTaxes) {
          if (
            transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()
          ) {
            transactionTax.taxAmount += this.roundNumber.transform(
              transactionTaxAux.taxAmount,
              4,
            );
            transactionTax.taxBase += this.roundNumber.transform(
              transactionTaxAux.taxBase,
              4,
            );
            exists = true;
          }
        }
        if (!exists) {
          transactionTaxes.push(transactionTaxAux);
        }
      }
    }

    this.totalTaxesAmount = 0;
    this.totalTaxesBase = 0;

    // REDONDEAMOS IMPUESTO
    for (let taxes of transactionTaxes) {
      taxes.taxBase = this.roundNumber.transform(taxes.taxBase);
      taxes.taxAmount = this.roundNumber.transform(taxes.taxAmount);
      this.totalTaxesAmount += taxes.taxAmount;
      this.totalTaxesBase += taxes.taxBase;
    }

    this.transaction.taxes = transactionTaxes;

    if (oldTaxes && oldTaxes.length > 0) {
      for (let oldTax of oldTaxes) {
        if (oldTax.tax.classification !== TaxClassification.Tax) {
          this.transaction.taxes.push(oldTax);
          this.totalTaxesAmount += this.roundNumber.transform(oldTax.taxAmount);
          // SUMAMOS AL TOTAL DE LA TRANSACCION LOS IMPUESTOS CARGADOS MANUALMENTE COMO PERCEPCIONES Y RETENCIONES
          totalPriceAux += oldTax.taxAmount;
        }
      }
    }
    this.totalTaxesAmount = this.roundNumber.transform(this.totalTaxesAmount);
    this.transaction.totalPrice = this.roundNumber.transform(totalPriceAux);

    await this.updateTransaction().then(async (transaction) => {
      if (transaction) {
        this.loading = false;
        this.transaction = transaction;
        this.lastQuotation = this.transaction.quotation;
        if (this.isCancellationAutomatic) {
          this.openModal('charge');
        }
      } else {
        this.loading = false;
        this.hideMessage();
        this.getMovementsOfTransaction();
      }
    });
  }

  recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {
    let quotation = 1;

    if (this.transaction.quotation) {
      quotation = this.transaction.quotation;
    }

    movementOfArticle.unitPrice = this.roundNumber.transform(
      movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount,
    );

    if (
      movementOfArticle.article &&
      movementOfArticle.article.currency &&
      this.config['currency'] &&
      this.config['currency']._id !== movementOfArticle.article.currency._id
    ) {
      movementOfArticle.unitPrice = this.roundNumber.transform(
        (movementOfArticle.unitPrice / this.lastQuotation) * quotation,
      );
    }

    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform(
      (movementOfArticle.unitPrice * this.transaction.discountPercent) / 100,
      6,
    );
    movementOfArticle.unitPrice -= this.roundNumber.transform(
      movementOfArticle.transactionDiscountAmount,
    );
    movementOfArticle.basePrice = this.roundNumber.transform(
      movementOfArticle.unitPrice * movementOfArticle.amount,
    );
    movementOfArticle.markupPrice = 0.0;
    movementOfArticle.markupPercentage = 0.0;

    let taxedAmount = movementOfArticle.basePrice;

    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();

    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (
          field.articleField.datatype === ArticleFieldType.Percentage ||
          field.articleField.datatype === ArticleFieldType.Number
        ) {
          if (field.articleField.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform(
              (movementOfArticle.basePrice * parseFloat(field.value)) / 100,
            );
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
    if (this.transaction.type.requestTaxes) {
      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
        let taxes: Taxes[] = new Array();

        for (let articleTax of movementOfArticle.taxes) {
          if (articleTax.tax.taxBase === TaxBase.Neto) {
            articleTax.taxBase = this.roundNumber.transform(taxedAmount);
          } else {
            articleTax.taxBase = 0;
          }
          if (articleTax.percentage === 0) {
            for (let artTax of movementOfArticle.article.taxes) {
              if (artTax.tax._id === articleTax.tax._id) {
                articleTax.taxAmount = this.roundNumber.transform(
                  artTax.taxAmount * movementOfArticle.amount,
                );
              }
            }
          } else {
            articleTax.taxAmount = this.roundNumber.transform(
              (articleTax.taxBase * articleTax.percentage) / 100,
            );
          }
          taxes.push(articleTax);
          movementOfArticle.costPrice += this.roundNumber.transform(articleTax.taxAmount);
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
    movementOfArticle.salePrice = this.roundNumber.transform(
      movementOfArticle.costPrice + movementOfArticle.roundingAmount,
    );

    return movementOfArticle;
  }

  updateQuantity(): void {
    this.quantity = 0;
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (!movementOfArticle.movementParent) {
          this.quantity += movementOfArticle.amount;
        }
      }
    }
  }
  
  updateTable(table): Promise<Table> {
    return new Promise<Table>((resolve, reject) => {
      this.loading = true;

      this._tableService.updateTable(table).subscribe(
        (result) => {
          this.loading = false;
          if (!result.table) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.table);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          reject(null);
        },
      );
    });
  }

  getUser(): Promise<User> {
    return new Promise<User>((resolve) => {
      let identity: User = JSON.parse(sessionStorage.getItem('user'));

      if (identity) {
        this._userService.getUser(identity._id).subscribe(
          (result) => {
            if (result && result.user) {
              resolve(result.user);
            } else {
              this.showMessage('Debe volver a iniciar sesión', 'danger', false);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
          },
        );
      }
    });
  }

  async distributeImpressions(printer?: Printer) {
    this.printerSelected = printer;

    await this.getUser().then(async (user) => {
      if (user) {
        if (user.printers && user.printers.length > 0) {
          for (const element of user.printers) {
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Bar &&
              this.typeOfOperationToPrint === 'bar'
            ) {
              this.printerSelected = element.printer;
            }
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Counter &&
              (this.typeOfOperationToPrint === 'charge' ||
                this.typeOfOperationToPrint === 'bill')
            ) {
              this.printerSelected = element.printer;
            }
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Kitchen &&
              this.typeOfOperationToPrint === 'kitchen'
            ) {
              this.printerSelected = element.printer;
            }
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Voucher &&
              this.typeOfOperationToPrint === 'voucher'
            ) {
              this.printerSelected = element.printer;
            }
          }
        } else {
          if (!this.printerSelected) {
            await this.getPrinters().then((printers) => {
              if (printers) {
                this.printers = printers;
                for (const element of this.printers) {
                  if (
                    element &&
                    element.printIn === PrinterPrintIn.Bar &&
                    this.typeOfOperationToPrint === 'bar'
                  ) {
                    this.printerSelected = element;
                  }
                  if (
                    element &&
                    element.printIn === PrinterPrintIn.Kitchen &&
                    this.typeOfOperationToPrint === 'kitchen'
                  ) {
                    this.printerSelected = element;
                  }
                  if (
                    element &&
                    element.printIn === PrinterPrintIn.Voucher &&
                    this.typeOfOperationToPrint === 'voucher'
                  ) {
                    this.printerSelected = element;
                  }
                  if (
                    element &&
                    element.printIn === PrinterPrintIn.Counter &&
                    (this.typeOfOperationToPrint === 'charge' ||
                      this.typeOfOperationToPrint === 'bill')
                  ) {
                    this.printerSelected = element;
                  }
                }
              }
            });
          }
        }
      } else {
        this.showToast(null, 'info', 'Debe iniciar sesión');
      }

      switch (this.typeOfOperationToPrint) {
        case 'charge':
          if (printer.type === PrinterType.PDF) {
            this.openModal('print');
          }
          break;
        case 'kitchen':
          this.openModal('printKitchen');
          break;
        case 'bar':
          this.openModal('printBar');
          break;
        case 'voucher':
          this.openModal('printVoucher');
          break;
        default:
          this.showMessage('No se reconoce la operación de impresión.', 'danger', false);
          break;
      }
    });
  }

  recalculateSalePrice(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {
    return new Promise<MovementOfArticle>(async (resolve) => {
      this.loading = true;

      let quotation = 1;

      if (this.transaction.quotation) {
        quotation = this.transaction.quotation;
      }

      if (movementOfArticle.article) {
        movementOfArticle.basePrice = this.roundNumber.transform(
          movementOfArticle.article.basePrice * movementOfArticle.amount,
        );

        if (
          movementOfArticle.article.currency &&
          this.config['currency'] &&
          this.config['currency']._id !== movementOfArticle.article.currency._id
        ) {
          movementOfArticle.basePrice = this.roundNumber.transform(
            movementOfArticle.basePrice * quotation,
          );
        }
      }

      let fields: ArticleFields[] = new Array();

      if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
        for (const field of movementOfArticle.otherFields) {
          if (
            field.articleField.datatype === ArticleFieldType.Percentage ||
            field.articleField.datatype === ArticleFieldType.Number
          ) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform(
                (movementOfArticle.basePrice * parseFloat(field.value)) / 100,
              );
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
          }
          fields.push(field);
        }
      }
      movementOfArticle.otherFields = fields;

      if (movementOfArticle.article) {
        movementOfArticle.costPrice = this.roundNumber.transform(
          movementOfArticle.article.costPrice * movementOfArticle.amount,
        );
        if (
          movementOfArticle.article.currency &&
          this.config['currency'] &&
          this.config['currency']._id !== movementOfArticle.article.currency._id
        ) {
          movementOfArticle.costPrice = this.roundNumber.transform(
            movementOfArticle.costPrice * quotation,
          );
        }
      }

      movementOfArticle.unitPrice = this.roundNumber.transform(
        movementOfArticle.unitPrice +
          movementOfArticle.transactionDiscountAmount +
          movementOfArticle.discountAmount,
      );
      if (
        movementOfArticle.article &&
        movementOfArticle.article.currency &&
        this.config['currency'] &&
        this.config['currency']._id !== movementOfArticle.article.currency._id
      ) {
        movementOfArticle.unitPrice = this.roundNumber.transform(
          (movementOfArticle.unitPrice / this.lastQuotation) * quotation,
        );
      }

      if (movementOfArticle.article && this.priceList) {
        let increasePrice = 0;

        if (
          this.priceList.allowSpecialRules &&
          this.priceList.rules &&
          this.priceList.rules.length > 0
        ) {
          this.priceList.rules.forEach((rule) => {
            if (rule) {
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make &&
                movementOfArticle.make &&
                rule.category._id === movementOfArticle.category._id &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(
                  rule.percentage + this.priceList.percentage,
                );
              }
              if (
                rule.make &&
                movementOfArticle.make &&
                rule.category == null &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(
                  rule.percentage + this.priceList.percentage,
                );
              }
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make == null &&
                rule.category._id === movementOfArticle.category._id
              ) {
                increasePrice = this.roundNumber.transform(
                  rule.percentage + this.priceList.percentage,
                );
              }
            }
          });
          if (increasePrice === 0) {
            increasePrice = this.roundNumber.transform(this.priceList.percentage);
          }
        } else {
          increasePrice = this.roundNumber.transform(this.priceList.percentage);
        }

        if (this.priceList.exceptions && this.priceList.exceptions.length > 0) {
          this.priceList.exceptions.forEach((exception) => {
            if (exception) {
              if (exception.article._id === movementOfArticle.article._id) {
                increasePrice = this.roundNumber.transform(exception.percentage);
              }
            }
          });
        }

        if (increasePrice != 0) {
          movementOfArticle.unitPrice = this.roundNumber.transform(
            (movementOfArticle.unitPrice * 100) / (100 + increasePrice),
          );
        }
      }

      if (movementOfArticle.article && this.newPriceList) {
        let increasePrice = 0;

        if (
          this.newPriceList.allowSpecialRules &&
          this.newPriceList.rules &&
          this.newPriceList.rules.length > 0
        ) {
          this.newPriceList.rules.forEach((rule) => {
            if (rule) {
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make &&
                movementOfArticle.make &&
                rule.category._id === movementOfArticle.category._id &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(
                  rule.percentage + this.newPriceList.percentage,
                );
              }
              if (
                rule.make &&
                movementOfArticle.make &&
                rule.category == null &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(
                  rule.percentage + this.newPriceList.percentage,
                );
              }
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make == null &&
                rule.category._id === movementOfArticle.category._id
              ) {
                increasePrice = this.roundNumber.transform(
                  rule.percentage + this.newPriceList.percentage,
                );
              }
            }
          });
          if (increasePrice === 0) {
            increasePrice = this.roundNumber.transform(this.newPriceList.percentage);
          }
        } else {
          increasePrice = this.roundNumber.transform(this.newPriceList.percentage);
        }

        if (this.newPriceList.exceptions && this.newPriceList.exceptions.length > 0) {
          this.newPriceList.exceptions.forEach((exception) => {
            if (exception) {
              if (exception.article._id === movementOfArticle.article._id) {
                increasePrice = this.roundNumber.transform(exception.percentage);
              }
            }
          });
        }

        if (increasePrice != 0) {
          movementOfArticle.unitPrice = this.roundNumber.transform(
            movementOfArticle.unitPrice +
              (movementOfArticle.unitPrice * increasePrice) / 100,
          );
        }
      }

      movementOfArticle.transactionDiscountAmount = this.roundNumber.transform(
        (movementOfArticle.unitPrice * this.transaction.discountPercent) / 100,
        6,
      );
      movementOfArticle.unitPrice -= this.roundNumber.transform(
        movementOfArticle.transactionDiscountAmount,
      );
      movementOfArticle.unitPrice -= this.roundNumber.transform(
        movementOfArticle.discountAmount,
      );
      movementOfArticle.salePrice = this.roundNumber.transform(
        movementOfArticle.unitPrice * movementOfArticle.amount,
      );
      movementOfArticle.markupPrice = this.roundNumber.transform(
        movementOfArticle.salePrice - movementOfArticle.costPrice,
      );
      movementOfArticle.markupPercentage = this.roundNumber.transform(
        (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
        3,
      );

      if (this.transaction.type.requestTaxes) {
        let taxes: Taxes[] = new Array();

        if (movementOfArticle.taxes) {
          let impInt: number = 0;

          if (movementOfArticle.article) {
            for (let taxAux of movementOfArticle.article.taxes) {
              if (taxAux.percentage === 0) {
                impInt = this.roundNumber.transform(
                  taxAux.taxAmount * movementOfArticle.amount,
                  4,
                );
              }
            }
          }
          for (let taxAux of movementOfArticle.taxes) {
            let tax: Taxes = new Taxes();

            tax.tax = taxAux.tax;
            tax.percentage = this.roundNumber.transform(taxAux.percentage);
            if (tax.tax.taxBase == TaxBase.Neto) {
              tax.taxBase = this.roundNumber.transform(
                (movementOfArticle.salePrice - impInt) / (tax.percentage / 100 + 1),
                4,
              );
            }
            if (taxAux.percentage === 0) {
              for (let artTax of movementOfArticle.article.taxes) {
                if (artTax.tax._id === tax.tax._id) {
                  tax.taxAmount = this.roundNumber.transform(
                    artTax.taxAmount * movementOfArticle.amount,
                    4,
                  );
                }
              }
            } else {
              tax.taxAmount = this.roundNumber.transform(
                (tax.taxBase * tax.percentage) / 100,
                4,
              );
            }
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;
      }
      this.loading = false;
      //guardamos la lista con la que se calculo el precio

      if (this.transaction.company && this.transaction.company.priceList) {
        this.transaction.priceList = this.transaction.company.priceList;
      }

      resolve(movementOfArticle);
    });
  }

  getPrinters(): Promise<Printer[]> {
    return new Promise<Printer[]>(async (resolve) => {
      this.loading = true;

      this._printerService.getPrinters().subscribe(
        (result) => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== '')
              this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        },
      );
    });
  }
  
  async print() {
    await this.getPrinters().then((printers) => {
      if (printers) {
        this.printers = printers;
      }
    });

    if (this.transaction.type.defectPrinter) {
      this.printerSelected = this.transaction.type.defectPrinter;
      this.typeOfOperationToPrint = 'charge';
      this.distributeImpressions(this.transaction.type.defectPrinter);
    } else {
      this.openModal('printers');
    }
  }

  async finish() {
    if (await this.areValidAmounts()) {
      let paid: number = 0;

      this.transaction.commissionAmount = 0;
      this.transaction.administrativeExpenseAmount = 0;
      this.transaction.otherExpenseAmount = 0;
      for (let mov of this.movementsOfCashes) {
        paid += mov.amountPaid;
        this.transaction.commissionAmount += mov.commissionAmount;
        this.transaction.administrativeExpenseAmount += mov.administrativeExpenseAmount;
        this.transaction.otherExpenseAmount += mov.otherExpenseAmount;
      }

      if (
        this.transaction.totalPrice === 0 ||
        this.transaction.commissionAmount > 0 ||
        this.transaction.administrativeExpenseAmount > 0 ||
        this.transaction.otherExpenseAmount > 0
      ) {
        this.transaction.totalPrice = this.roundNumber.transform(
          paid -
            this.transaction.commissionAmount -
            this.transaction.administrativeExpenseAmount -
            this.transaction.otherExpenseAmount,
        );
        await this.updateTransaction().then((transaction) => {
          if (transaction) {
            this.transaction = transaction;
            this.closeModal();
          }
        });
      } else {
        if (this.transaction.totalPrice < paid) {
          this.closeModal();
        } else {
          this.showToast(
            null,
            'info',
            'La suma de métodos de pago debe ser igual o mayor al de la transacción.',
          );
        }
      }
    } else {
      this.fastPayment = null;
    }
  }

  //FUNCIÓN PARA CONTROLAR QUE LA SUMA DE PRECIO DE ARTÍCULOS SEA IGUAL AL TOTAL DE LA TRANSACCIÓN
  private async closeModal() {
    try {
      let totalPrice: number = 0;

      if (this.movementsOfCashes && this.movementsOfCashes.length > 0) {
        for (let movementOfCash of this.movementsOfCashes) {
          totalPrice += this.roundNumber.transform(movementOfCash.amountPaid);
        }
      }

      if (
        !(
          this.roundNumber.transform(totalPrice) ===
          this.roundNumber.transform(
            this.transaction.totalPrice +
              this.transaction.commissionAmount +
              this.transaction.administrativeExpenseAmount +
              this.transaction.otherExpenseAmount,
          )
        )
      )
        throw new Error(
          'La suma de métodos de pago no coincide con el de la transacción.',
        );

      if (totalPrice > 0 && this.transaction.totalPrice === 0) {
        this.transaction.totalPrice = this.roundNumber.transform(
          totalPrice -
            this.transaction.commissionAmount -
            this.transaction.administrativeExpenseAmount -
            this.transaction.otherExpenseAmount,
        );

        if (this.transaction.type.finishState) {
          this.transaction.state = this.transaction.type.finishState;
        } else {
          this.transaction.state = TransactionState.Closed;
        }
        this.transaction = await this.updateTransaction();
      }

      if (this.transaction.type.allowAccounting) {
        this._accountSeatService
          .addAccountSeatByTransaction(this.transaction._id)
          .subscribe(
            (result) => {
              this.showToast(result);
            },
            (error) => {
              this.showToast(error);
            },
          );
      }

    let cancellationTypesAutomatic = await this.getCancellationTypesAutomatic();
    if (!cancellationTypesAutomatic || cancellationTypesAutomatic.length == 0) {
      if (this.transaction && this.transaction.type.printable) {
        this.print();
        if (this.transaction && this.transaction.type.requestEmailTemplate == true)
          this.openModal('send-email');
      } else {
        this.backFinal();
        if (this.transaction && this.transaction.type.requestEmailTemplate == true)
        this.openModal('send-email');
      }
    } else {
      this.openModal('cancelation-type-automatic');
    }
      this.activeModal.close({
        movementsOfCashes: this.movementsOfCashes,
        movementOfArticle: this.movementOfArticle,
        transaction: this.transaction,
      });
    } catch (error) {
      this.showToast(null, 'info', error.message);
    }
  }

  getCancellationTypesAutomatic(): Promise<CancellationType[]> {
    return new Promise<CancellationType[]>((resolve) => {
      this.loading = true;

      this._cancellationTypeService
        .getCancellationTypes(
          {
            'origin._id': 1,
            'origin.operationType': 1,
            'destination._id': 1,
            'destination.name': 1,
            'destination.operationType': 1,
            operationType: 1,
            requestAutomatic: 1,
          }, // PROJECT
          {
            'origin._id': {$oid: this.transaction.type._id},
            requestAutomatic: true,
            operationType: {$ne: 'D'},
            'destination.operationType': {$ne: 'D'},
            'origin.operationType': {$ne: 'D'},
          }, // MATCH
          {}, // SORT
          {}, // GROUP
          0, // LIMIT
          0, // SKIP
        )
        .subscribe(
          (result) => {
            this.loading = false;
            if (
              result &&
              result.cancellationTypes &&
              result.cancellationTypes.length > 0
            ) {
              resolve(result.cancellationTypes);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.loading = false;
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          },
        );
    });
  }

  getMovementsOfCashes(query?: string): Promise<MovementOfCash[]> {
    return new Promise<MovementOfCash[]>((resolve, reject) => {
      this._movementOfCashService.getMovementsOfCashes(query).subscribe(
        async (result) => {
          if (result && result.movementsOfCashes) {
            resolve(result.movementsOfCashes);
          } else {
            resolve(null);
          }
        },
        (error) => {
          this.showToast(error);
          resolve(null);
        },
      );
    });
  }

  updateMovementOfCash(movementOfCash: MovementOfCash): Promise<MovementOfCash> {
    return new Promise<MovementOfCash>((resolve, reject) => {
      this._movementOfCashService.update(movementOfCash).subscribe(
        async (result) => {
          if (result.status === 200) {
            resolve(result.result);
          } else reject(result);
        },
        (error) => reject(error),
      );
    });
  }

  getMovementsOfArticles(query?: string): Promise<MovementOfArticle[]> {
    return new Promise<MovementOfArticle[]>((resolve, reject) => {
      this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
        (result) => {
          if (!result.movementsOfArticles) {
            resolve(null);
          } else {
            resolve(result.movementsOfArticles);
          }
        },
        (error) => {
          this.showToast(error);
          resolve(null);
        },
      );
    });
  }

  deleteMovementOfArticle(
    movementOfArticle: MovementOfArticle,
  ): Promise<MovementOfArticle> {
    return new Promise<MovementOfArticle>((resolve, reject) => {
      this._movementOfArticleService.delete(movementOfArticle._id).subscribe(
        (result) => {
          if (result.status === 200) {
            resolve(movementOfArticle);
          } else reject(result);
        },
        (error) => reject(error),
      );
    });
  }

  async getPaymentMethods() {
    this.loading = true;

    let match = {};

    match['operationType'] = {$ne: 'D'};

    if (
      this.transaction.type &&
      this.transaction.type.paymentMethods &&
      this.transaction.type.paymentMethods.length > 0 &&
      this.transaction.type.paymentMethods[0]
    ) {
      match['$or'] = new Array();
      this.transaction.type.paymentMethods.forEach((element) => {
        match['$or'].push({_id: {$oid: element}});
      });
    }

    this.subscription.add(
      this._paymentMethodService
        .getAll({
          project: {},
          match: match,
          sort: {order: 1},
        })
        .subscribe(
          async (result) => {
            this.loading = false;
            if (result.status === 200) {
              this.paymentMethods = result.result;
              for (let p of this.paymentMethods) {
                if (p.currency) {
                  await this._currencyService
                    .getAll({
                      match: {
                        _id: {$oid: p.currency},
                      },
                    })
                    .toPromise()
                    .then((result: Resulteable) => {
                      p.currency = result.result[0];
                    });
                }
              }
              this.movementOfCash.type = this.paymentMethods[0];
              this.paymentMethodSelected = this.movementOfCash.type;
              this.movementOfCash.discount = this.paymentMethodSelected.discount || 0;
              this.movementOfCash.surcharge = this.paymentMethodSelected.surcharge || 0;
              this.percentageCommission = this.paymentMethodSelected.commission || 0;
              this.getMovementOfCashesByTransaction();
            } else {
              this.showToast(result.result);
            }
          },
          (error) => {
            this.showToast(error);
            this.loading = false;
          },
        ),
    );
  }

  changeAmountToPay(): void {
    if (this.keyboard)
      this.keyboard.setInput(this.movementOfCashForm.value.amountToPay.toString());
    this.updateAmounts('amountToPay');
  }

  changeQuotationNative() {
    this.quotationNative = this.movementOfCashForm.value.quotationNative;
    this.quotationAmount = this.amountToPay * this.quotationNative;
    this.movementOfCashForm.patchValue({
      quotationNative: this.quotationNative,
      quotationAmount: this.quotationAmount,
    });
  }

  updateAmounts(op?: string): void {
    if (op === 'amountToPay') {
      if (typeof this.movementOfCashForm.value.amountToPay === 'string')
        this.movementOfCashForm.value.amountToPay = parseFloat(
          this.movementOfCashForm.value.amountToPay,
        );
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
        this.transaction.administrativeExpenseAmount +=
          movement.administrativeExpenseAmount;
        this.transaction.otherExpenseAmount += movement.otherExpenseAmount;
      }
    }

    if (op !== 'amountToPay' && this.transaction.totalPrice !== 0) {
      this.amountToPay = this.transactionAmount - this.amountPaid - this.amountDiscount;
      if (this.keyboard) this.keyboard.setInput('');
    }

    this.movementOfCash.discount = this.paymentMethodSelected.discount;
    this.movementOfCash.surcharge = this.paymentMethodSelected.surcharge;

    if (this.movementOfCash.discount && this.movementOfCash.discount !== 0) {
      this.transactionAmount =
        this.transaction.totalPrice -
        (this.amountToPay * this.movementOfCash.discount) / 100;
    } else if (this.movementOfCash.surcharge && this.movementOfCash.surcharge !== 0) {
      this.transactionAmount =
        this.transaction.totalPrice +
        (this.amountToPay * this.movementOfCash.surcharge) / 100;
    } else {
      this.transactionAmount = this.transaction.totalPrice;
    }

    if (op !== 'amountToPay' && this.transaction.totalPrice !== 0) {
      this.amountToPay = this.transactionAmount - this.amountPaid;
    }

    if (this.transaction.totalPrice !== 0) {
      this.paymentChange = (
        this.amountPaid +
        this.amountToPay -
        this.transactionAmount
      ).toFixed(2);
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
    this.percentageAdministrativeExpense =
      this.paymentMethodSelected.administrativeExpense;
    this.percentageOtherExpense = this.paymentMethodSelected.otherExpense;

    this.setValuesForm();

    this.changePercentageCommission();
    this.changePercentageAdministrativeExpense();
    this.changePercentageOtherExpense();
  }

  async isValidAmount(isCopy: boolean = false) {
    return new Promise(async (resolve) => {
      try {
        if (this.paymentMethodSelected.checkDetail && !isCopy) {
          let query = `where="number":"${this.movementOfCashForm.value.number}","type":"${this.paymentMethodSelected._id}","statusCheck":"Disponible"`;

          await this.getMovementsOfCashes(query).then((movementsOfCashes) => {
            if (movementsOfCashes && movementsOfCashes.length > 0) {
              throw new Error(
                `El ${this.paymentMethodSelected.name} número ${this.movementOfCashForm.value.number} ya existe`,
              );
            }
          });
        }

        if (
          this.transaction.totalPrice !== 0 &&
          this.roundNumber.transform(this.amountPaid + this.amountToPay) >
            this.roundNumber.transform(
              this.transactionAmount + this.totalInterestAmount + this.totalTaxAmount,
            ) &&
          !this.paymentMethodSelected.acceptReturned
        ) {
          throw new Error(
            'El medio de pago ' +
              this.paymentMethodSelected.name +
              ' no acepta vuelto, por lo tanto el monto a pagar no puede ser mayor que el de la transacción.',
          );
        }

        if (
          this.movementOfCash.discount &&
          this.movementOfCash.discount > 0 &&
          this.amountToPay >
            this.roundNumber.transform(
              (this.transaction.totalPrice * this.movementOfCash.discount) / 100 +
                this.transaction.totalPrice,
            ) &&
          !this.paymentMethodSelected.acceptReturned
        ) {
          throw new Error(
            'El monto ingresado no puede ser mayor a ' +
              this.roundNumber.transform(
                (this.transaction.totalPrice * this.movementOfCash.discount) / 100,
              ) +
              '.',
          );
        }

        if (
          this.movementOfCash.surcharge &&
          this.movementOfCash.surcharge > 0 &&
          this.amountToPay - 0.01 >
            this.roundNumber.transform(
              (this.transaction.totalPrice * this.movementOfCash.surcharge) / 100 +
                this.transaction.totalPrice,
            ) &&
          !this.paymentMethodSelected.acceptReturned
        ) {
          throw new Error(
            'El monto ingresado no puede ser mayor a ' +
              this.roundNumber.transform(
                (this.transaction.totalPrice * this.movementOfCash.surcharge) / 100 +
                  this.transaction.totalPrice,
              ) +
              '.',
          );
        }

        if (
          !this.movementOfCash.expirationDate ||
          !moment(this.movementOfCash.expirationDate).isValid()
        ) {
          throw new Error('Debe ingresar fecha de vencimiento de pago válida');
        }

        if (!this.movementOfCash || !this.paymentMethodSelected) {
          throw new Error('Debe seleccionar un medio de pago válido');
        }

        if (
          this.paymentMethodSelected.checkDetail &&
          (!this.paymentMethodSelected.inputAndOuput ||
            this.transaction.type.movement === Movements.Inflows) &&
          (!this.movementOfCashForm.value.number ||
            this.movementOfCashForm.value.number === '')
        ) {
          throw new Error('Debe completar el número de comprobante');
        } else if (
          this.paymentMethodSelected.checkDetail &&
          this.paymentMethodSelected.inputAndOuput &&
          this.transaction.type.movement === Movements.Outflows &&
          !isCopy
        ) {
          throw new Error('Debe seleccionar los métodos de pago en cartera a utilizar.');
        }

        if (this.paymentMethodSelected.allowToFinance) {
          let amountTotal = 0;

          if (
            this.movementsOfCashesToFinance &&
            this.movementsOfCashesToFinance.length > 0
          ) {
            for (let mov of this.movementsOfCashesToFinance) {
              amountTotal = this.roundNumber.transform(amountTotal + mov.amountPaid);
              if (!moment(mov.expirationDate).isValid()) {
                throw new Error('Debe ingresar fechas de vencimiento de pago válidas');
              } else {
                if (
                  moment(mov.expirationDate).diff(
                    moment(this.transaction.startDate),
                    'days',
                  ) < 0
                ) {
                  throw new Error(
                    'La fecha de vencimiento de pago no puede ser menor a la fecha de la transacción',
                  );
                }
              }
            }
          }
        }

        resolve(true);
      } catch (error) {
        resolve(false);
        this.showToast(null, 'info', error.message);
      }
    });
  }

  getTotalAmount(field: string): number {
    let total: number = 0;

    for (let mov of this.movementsOfCashes) {
      if (field !== 'total') {
        total += mov[field];
      } else {
        total +=
          mov.amountPaid -
          mov.commissionAmount -
          mov.administrativeExpenseAmount -
          mov.otherExpenseAmount;
      }
    }

    return total;
  }

  async changePercentageCommission(commissionAmount: number = null) {
    this.movementOfCash = Object.assign(this.movementOfCashForm.value);
    this.daysCommission =
      moment(
        moment(this.movementOfCashForm.value.expirationDate).format('YYYY-MM-DD'),
        'YYYY-MM-DD',
      ).diff(moment().format('YYYY-MM-DD'), 'days') + 4;
    if (moment(this.movementOfCashForm.value.expirationDate).day() === 6) {
      this.daysCommission += 2;
    }
    if (moment(this.movementOfCashForm.value.expirationDate).day() === 7) {
      this.daysCommission += 1;
    }

    if (this.holidays && this.holidays.length > 0) {
      this.holidays.forEach((element) => {
        if (
          moment(this.movementOfCashForm.value.expirationDate).format('YYYY-MM-DD') ===
          moment(element.date).format('YYYY-MM-DD')
        ) {
          this.daysCommission += 1;
        }
      });
    }

    if (commissionAmount != null) {
      this.movementOfCash.commissionAmount = commissionAmount;
      this.percentageCommission = this.roundNumber.transform(
        100 *
          (this.movementOfCash.commissionAmount /
            (this.amountToPay * this.daysCommission)),
      );
    } else {
      this.percentageCommission = this.movementOfCashForm.value.percentageCommission;
      this.movementOfCash.commissionAmount = this.roundNumber.transform(
        ((this.amountToPay * this.percentageCommission) / 100) * this.daysCommission,
      );
    }
    if (this.movementOfCash.taxPercentage > 0)
      this.movementOfCash.commissionAmount = this.roundNumber.transform(
        this.movementOfCash.commissionAmount +
          (this.movementOfCash.commissionAmount * this.movementOfCash.taxPercentage) /
            100,
      );
    this.movementOfCashForm.patchValue({
      commissionAmount: this.movementOfCash.commissionAmount,
      daysCommission: this.daysCommission,
      percentageCommission: this.percentageCommission,
    });
    if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance)
      this.calculateQuotas('quotas');
  }

  changePercentageAdministrativeExpense(administrativeExpenseAmount: number = null) {
    if (administrativeExpenseAmount != null) {
      this.movementOfCash.administrativeExpenseAmount = administrativeExpenseAmount;
      this.percentageAdministrativeExpense = this.roundNumber.transform(
        100 * (this.movementOfCash.administrativeExpenseAmount / this.amountToPay),
      );
    } else {
      this.percentageAdministrativeExpense =
        this.movementOfCashForm.value.percentageAdministrativeExpense;
      this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(
        (this.amountToPay * this.percentageAdministrativeExpense) / 100,
      );
    }
    if (this.movementOfCash.taxPercentage > 0)
      this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(
        this.movementOfCash.administrativeExpenseAmount +
          (this.movementOfCash.administrativeExpenseAmount *
            this.movementOfCash.taxPercentage) /
            100,
      );
    this.movementOfCashForm.patchValue({
      administrativeExpenseAmount: this.movementOfCash.administrativeExpenseAmount,
      percentageAdministrativeExpense: this.percentageAdministrativeExpense,
    });
    if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance)
      this.calculateQuotas('quotas');
  }

  changePercentageOtherExpense(otherExpenseAmount: number = null) {
    if (otherExpenseAmount != null) {
      this.movementOfCash.otherExpenseAmount = otherExpenseAmount;
      this.percentageOtherExpense = this.roundNumber.transform(
        100 * (this.movementOfCash.otherExpenseAmount / this.amountToPay),
      );
    } else {
      this.percentageOtherExpense = this.movementOfCashForm.value.percentageOtherExpense;
      this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(
        (this.amountToPay * this.percentageOtherExpense) / 100,
      );
    }
    if (this.movementOfCash.taxPercentage > 0)
      this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(
        this.movementOfCash.otherExpenseAmount +
          (this.movementOfCash.otherExpenseAmount * this.movementOfCash.taxPercentage) /
            100,
      );
    this.movementOfCashForm.patchValue({
      otherExpenseAmount: this.movementOfCash.otherExpenseAmount,
      percentageOtherExpense: this.percentageOtherExpense,
    });
    if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance)
      this.calculateQuotas('quotas');
  }

  changeVatOfExpenses() {
    this.movementOfCash.taxPercentage = this.movementOfCashForm.value.taxPercentage;
    if (this.lastVatOfExpenses > 0) {
      if (this.paymentMethodSelected.commission > 0)
        this.movementOfCash.commissionAmount = this.roundNumber.transform(
          this.movementOfCash.commissionAmount / (this.lastVatOfExpenses / 100 + 1),
        );
      if (this.paymentMethodSelected.administrativeExpense > 0)
        this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(
          this.movementOfCash.administrativeExpenseAmount /
            (this.lastVatOfExpenses / 100 + 1),
        );
      if (this.paymentMethodSelected.otherExpense > 0)
        this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(
          this.movementOfCash.otherExpenseAmount / (this.lastVatOfExpenses / 100 + 1),
        );
    }
    this.lastVatOfExpenses = this.movementOfCash.taxPercentage;
    if (this.paymentMethodSelected.commission > 0)
      this.movementOfCash.commissionAmount = this.roundNumber.transform(
        this.movementOfCash.commissionAmount +
          (this.movementOfCash.commissionAmount * this.movementOfCash.taxPercentage) /
            100,
      );
    if (this.paymentMethodSelected.administrativeExpense > 0)
      this.movementOfCash.administrativeExpenseAmount = this.roundNumber.transform(
        this.movementOfCash.administrativeExpenseAmount +
          (this.movementOfCash.administrativeExpenseAmount *
            this.movementOfCash.taxPercentage) /
            100,
      );
    if (this.paymentMethodSelected.otherExpense > 0)
      this.movementOfCash.otherExpenseAmount = this.roundNumber.transform(
        this.movementOfCash.otherExpenseAmount +
          (this.movementOfCash.otherExpenseAmount * this.movementOfCash.taxPercentage) /
            100,
      );
    this.movementOfCashForm.patchValue({
      commissionAmount: this.movementOfCash.commissionAmount,
      administrativeExpenseAmount: this.movementOfCash.administrativeExpenseAmount,
      otherExpenseAmount: this.movementOfCash.otherExpenseAmount,
    });
    if (this.paymentMethodSelected && this.paymentMethodSelected.allowToFinance)
      this.calculateQuotas('quotas');
  }

  getHolidays(): Promise<Holiday[]> {
    return new Promise<Holiday[]>((resolve, reject) => {
      this.subscription.add(
        this._holidayService
          .getAll({
            match: {operationType: {$ne: 'D'}},
          })
          .subscribe(
            (result) => {
              this.loading = false;
              if (result.status === 200) {
                resolve(result.result);
              } else {
                resolve(null);
              }
            },
            (error) => resolve(null),
          ),
      );
    });
  }

  getBusinessDays(startDate, endDate) {
    let startDateMoment = moment(startDate);
    let endDateMoment = moment(endDate);
    let days = Math.round(
      startDateMoment.diff(endDateMoment, 'days') -
        (startDateMoment.diff(endDateMoment, 'days') / 7) * 2,
    );

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
      try {
        let paid = 0;

        for (let mov of this.movementsOfCashes) {
          paid += mov.amountPaid;

          if (!mov.expirationDate || !moment(mov.expirationDate).isValid()) {
            throw new Error('Debe ingresar fecha de vencimiento de pago válida');
          }
        }

        if (
          this.roundNumber.transform(paid) >
            this.roundNumber.transform(this.transactionAmount) &&
          !this.transaction.type.allowZero
        ) {
          throw new Error(
            'La suma de monto de medios de pago no puede ser mayor al de la transacción.',
          );
        }

        if (this.transaction.totalPrice !== 0 && this.roundNumber.transform(paid) <= 0) {
          throw new Error(
            'La suma de monto de medios de pago no puede ser menor o igual a 0.',
          );
        }

        resolve(true);
      } catch (error) {
        resolve(false);
        this.showToast(null, 'info', error.message);
      }
    });
  }

  async addMovementOfCash() {
    if (!this.loading) {
      try {
        if (this.movementOfCashForm.valid) {
          this.loading = true;
          if (!this.fastPayment) {
            if (await this.isValidAmount()) {
              if (!this.paymentMethodSelected.allowToFinance) {
                if (
                  this.roundNumber.transform(this.amountPaid + this.amountToPay) >
                  this.roundNumber.transform(this.transactionAmount)
                ) {
                  this.movementOfCash.amountPaid = this.roundNumber.transform(
                    this.amountToPay -
                      this.roundNumber.transform(
                        parseFloat(this.movementOfCashForm.value.paymentChange),
                      ),
                  );
                } else {
                  this.movementOfCash.amountPaid = this.amountToPay;
                }
                this.movementOfCash.transaction = this.transaction;
                this.movementOfCash.paymentChange =
                  this.movementOfCashForm.value.paymentChange;
                this.movementOfCash.type = this.movementOfCashForm.value.paymentMethod;
                this.movementOfCash.observation =
                  this.movementOfCashForm.value.observation;
                this.movementOfCash.expirationDate = moment(
                  this.movementOfCash.expirationDate,
                  'YYYY-MM-DD',
                ).format('YYYY-MM-DDTHH:mm:ssZ');
                this.movementOfCash.interestPercentage =
                  this.movementOfCashForm.value.interestPercentage;

                if (this.paymentMethodSelected.allowBank) {
                  this.movementOfCash.bank = this.movementOfCashForm.value.bank;
                } else {
                  this.movementOfCash.bank = null;
                }

                if (this.paymentMethodSelected.checkDetail) {
                  this.movementOfCash.receiver = this.movementOfCashForm.value.receiver;
                  this.movementOfCash.number = this.movementOfCashForm.value.number;
                  this.movementOfCash.titular = this.movementOfCashForm.value.titular;
                  this.movementOfCash.bank = this.movementOfCashForm.value.bank;
                  this.movementOfCash.CUIT = this.movementOfCashForm.value.CUIT;
                  this.movementOfCash.deliveredBy =
                    this.movementOfCashForm.value.deliveredBy;
                  this.movementOfCash.statusCheck = StatusCheck.Closed;
                } else {
                  this.movementOfCash.receiver = '';
                  this.movementOfCash.number = '';
                  this.movementOfCash.titular = '';
                  this.movementOfCash.CUIT = '';
                  this.movementOfCash.deliveredBy = '';
                  this.movementOfCash.statusCheck = StatusCheck.Closed;
                }

                if (
                  this.paymentMethodSelected.inputAndOuput &&
                  this.transaction.type.movement === Movements.Inflows
                ) {
                  this.movementOfCash.statusCheck = StatusCheck.Available;
                }

                if (await this.validateCredit()) {
                  this.movementOfCash = await this.saveMovementOfCash();
                  if (this.transactionAmount !== this.transaction.totalPrice) {
                    this.transaction.totalPrice = this.transactionAmount;
                    if (this.transaction.type.requestArticles) {
                      this.addMovementOfArticle();
                    } else {
                      this.transaction = await this.updateTransaction();
                      if (this.keyboard) this.keyboard.setInput('');
                      this.getMovementOfCashesByTransaction();
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
              } else {
                if (
                  this.totalInterestAmount + this.totalTaxAmount > 0 &&
                  this.transaction.totalPrice !== 0
                ) {
                  this.transaction.totalPrice +=
                    this.totalInterestAmount + this.totalTaxAmount;
                  this.transaction = await this.updateTransaction();
                }
                for (let mov of this.movementsOfCashesToFinance) {
                  mov.expirationDate = moment(mov.expirationDate, 'YYYY-MM-DD').format(
                    'YYYY-MM-DDTHH:mm:ssZ',
                  );
                }
                let movementsOfCashes: MovementOfCash[] =
                  await this.saveMovementsOfCashes();

                if (movementsOfCashes && movementsOfCashes.length > 0) {
                  this.getMovementOfCashesByTransaction();
                }
              }
            } else {
              this.fastPayment = null;
            }
          } else {
            this.movementOfCash.transaction = this.transaction;
            this.movementOfCash.type = this.fastPayment;
            this.paymentMethodSelected = this.fastPayment;
            this.movementOfCash.expirationDate = moment(
              this.movementOfCash.expirationDate,
              'YYYY-MM-DD',
            ).format('YYYY-MM-DDTHH:mm:ssZ');
            this.movementOfCash.receiver = '';
            this.movementOfCash.number = '';
            this.movementOfCash.titular = '';
            this.movementOfCash.CUIT = '';
            this.movementOfCash.deliveredBy = '';
            this.movementOfCash.statusCheck == StatusCheck.Closed;
            this.movementOfCash.discount = this.movementOfCash.type
              ? this.movementOfCash.type.discount || 0
              : 0;
            this.movementOfCash.surcharge = this.movementOfCash.type.surcharge || 0;
            this.movementOfCash.interestPercentage =
              this.movementOfCashForm.value.interestPercentage;
            if (this.fastPayment.observation) {
              this.movementOfCash.observation = this.fastPayment.observation;
            }
            if (this.movementOfCash.discount && this.movementOfCash.discount !== 0) {
              this.amountDiscount = -this.roundNumber.transform(
                (this.transaction.totalPrice * this.movementOfCash.discount) / 100,
              );
            } else if (
              this.movementOfCash.surcharge &&
              this.movementOfCash.surcharge !== 0
            ) {
              this.amountDiscount = this.roundNumber.transform(
                (this.transaction.totalPrice * this.movementOfCash.surcharge) / 100,
              );
            }
            this.transaction.totalPrice =
              this.transaction.totalPrice + this.amountDiscount;
            this.transactionAmount = this.transaction.totalPrice;
            this.movementOfCash.amountPaid = this.transactionAmount;

            if ((await this.isValidAmount()) && (await this.validateCredit())) {
              this.movementOfCash = await this.saveMovementOfCash();
              if (this.transactionAmount !== this.transaction.totalPrice) {
                this.transaction.totalPrice = this.transactionAmount;
                if (this.transaction.type.requestArticles) {
                  this.addMovementOfArticle();
                } else {
                  this.transaction = await this.updateTransaction();
                  this.getMovementOfCashesByTransaction();
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
            } else {
              this.fastPayment = null;
            }
          }
        } else {
          this.onValueChanged();
          throw new Error('Verificar errores en el formulario');
        }
      } catch (error) {
        this.showToast(error);
      }
    }
  }

  cancel(): void {
    this.activeModal.close('cancel');
  }

  saveMovementOfCash(): Promise<MovementOfCash> {
    return new Promise<MovementOfCash>((resolve, reject) => {
      this._movementOfCashService.save(this.movementOfCash).subscribe(
        (result) => {
          if (result.status === 200) {
            resolve(result.result);
          } else reject(result);
        },
        (error) => reject(error),
      );
    });
  }

  validateCredit(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      try {
        if (this.movementOfCash.type.isCurrentAccount && !this.transaction.company)
          throw new Error('Debe seleccionar una empresa para este método de pago');
        if (
          this.movementOfCash.type.isCurrentAccount &&
          (this.transaction.company.creditLimit || 0) > 0 &&
          this.transaction.company._id &&
          this.transaction.type.transactionMovement === TransactionMovement.Sale
        ) {
          this._companyService
            .getSummaryCurrentAccount(this.transaction.company._id)
            .subscribe(
              (result) => {
                if (result && result.status === 200) {
                  let total = result.result + this.movementOfCash.amountPaid;

                  if (total > (this.transaction.company.creditLimit || 0)) {
                    throw new Error('La empresa supera el limite de crédito otorgado');
                  } else {
                    resolve(true);
                  }
                } else throw result;
              },
              (error) => {
                throw error;
              },
            );
        } else {
          resolve(true);
        }
      } catch (error) {
        this.showToast(error);
        resolve(false);
      }
    });
  }

  saveMovementsOfCashes(): Promise<MovementOfCash[]> {
    return new Promise<MovementOfCash[]>((resolve, reject) => {
      this._movementOfCashService
        .saveMovementsOfCashes(this.movementsOfCashesToFinance)
        .subscribe(
          (result) => {
            if (!result.movementsOfCashes) {
              if (result.message && result.message !== '')
                this.showToast(null, 'info', result.message);
              resolve(null);
            } else {
              resolve(result.movementsOfCashes);
            }
          },
          (error) => {
            this.showToast(error);
            resolve(null);
          },
        );
    });
  }

  async addMovementOfArticle() {
    try {
      let movementOfArticle = new MovementOfArticle();

      if (
        this.paymentMethodSelected.surcharge &&
        this.paymentMethodSelected.surcharge > 0
      ) {
        movementOfArticle.description = 'Pago con ' + this.paymentMethodSelected.name;
      } else if (
        this.paymentMethodSelected.discount &&
        this.paymentMethodSelected.discount > 0
      ) {
        movementOfArticle.description = 'Pago con ' + this.paymentMethodSelected.name;
      }
      movementOfArticle.amount = 1;
      movementOfArticle.salePrice = this.roundNumber.transform(this.amountDiscount);
      movementOfArticle.unitPrice = movementOfArticle.salePrice;
      movementOfArticle.costPrice = movementOfArticle.salePrice;
      movementOfArticle.markupPrice = 0.0;
      movementOfArticle.markupPercentage = 0.0;
      movementOfArticle.transaction = this.transaction;
      movementOfArticle.modifyStock = this.transaction.type.modifyStock;
      movementOfArticle.stockMovement = this.transaction.type.stockMovement;

      let taxes: Taxes[] = new Array();
      let tax: Taxes = new Taxes();

      if (Config.country === 'MX') {
        tax.percentage = 16;
      } else {
        tax.percentage = 21;
      }
      tax.taxBase = this.roundNumber.transform(
        movementOfArticle.salePrice / (tax.percentage / 100 + 1),
      );
      tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage) / 100);

      movementOfArticle.basePrice = movementOfArticle.salePrice - tax.taxAmount;

      let query = `where="percentage":"${tax.percentage}"`;
      let taxesAux: Tax[] = await this.getTaxes(query);

      if (taxesAux) {
        tax.tax = taxesAux[0];
        taxes.push(tax);
        movementOfArticle.taxes = taxes;
        movementOfArticle = await this.saveMovementOfArticle(movementOfArticle);
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
        this.transaction = await this.updateTransaction();
        this.getMovementOfCashesByTransaction();
      }
    } catch (error) {
      this.showToast(error);
    }
  }

  async cleanForm() {
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
    let bank: Bank = oldMovementOfCash.bank ? oldMovementOfCash.bank : null;

    if (bank && !bank._id) {
      await this.getBanks({_id: {$oid: bank}}).then((banks: Bank[]) => {
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
        async (result) => {
          if (!result.taxes) {
            this.showToast(
              null,
              'info',
              'Debe configurar el impuesto IVA para el realizar el descuento/recargo con ' +
                this.paymentMethodSelected.name,
            );
            resolve(null);
          } else {
            resolve(result.taxes);
          }
        },
        (error) => {
          this.showToast(error);
          this.loading = false;
        },
      );
    });
  }

  saveMovementOfArticle(
    movementOfArticle: MovementOfArticle,
  ): Promise<MovementOfArticle> {
    return new Promise<MovementOfArticle>((resolve, reject) => {
      this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(
        (result) => {
          if (result.movementOfArticle) {
            resolve(result.movementOfArticle);
          } else reject(result);
        },
        (error) => reject(error),
      );
    });
  }

  async updateTransaction() {
    return new Promise<Transaction>((resolve, reject) => {
      this.transaction.exempt = this.roundNumber.transform(this.transaction.exempt);
      this.transaction.discountAmount = this.roundNumber.transform(
        this.transaction.discountAmount,
      );
      this.transaction.totalPrice = this.roundNumber.transform(
        this.transaction.totalPrice,
      );
      this._transactionService.update(this.transaction).subscribe(
        (result: Resulteable) => {
          if (result.status === 200) {
            resolve(result.result);
          } else {
            this.showToast(result);
            reject(result);
          }
        },
        (error) => {
          this.showToast(error);
          reject(error);
        },
      );
    });
  }

  orderBy(term: string, property?: string): void {
    if (this.orderTerm[0] === term) {
      this.orderTerm[0] = '-' + term;
    } else {
      this.orderTerm[0] = term;
    }
    this.propertyTerm = property;
  }

  
  showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
    this.loading = false;
  }

  hideMessage(): void {
    this.alertMessage = '';
    this.loading = false;
  }

  showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
    }
    this.loading = false;
  }

  public sendEmail (body: EmailProps): void {
    this._serviceEmail.sendEmailV2(body).subscribe(
        (result) => {
          this.showToast(result);
        },
        (err) => {
          this.showToast(err);
        },
    );
  }
}
