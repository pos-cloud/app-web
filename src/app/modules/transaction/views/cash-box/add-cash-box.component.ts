import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import * as printJS from 'print-js';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { PrintService } from '@core/services/print.service';
import { ApiResponse, CashBox, CashBoxState, CurrencyValue, PrintType, TransactionType, User } from '@types';
import { Config } from 'app/app.config';
import { currencyValue, MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { Transaction, TransactionState } from 'app/components/transaction/transaction';
import { AuthService } from 'app/core/services/auth.service';
import { CashBoxService } from 'app/core/services/cash-box.service';
import { ConfigService } from 'app/core/services/config.service';
import { CurrencyValueService } from 'app/core/services/currency-value.service';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { PaymentMethodService } from 'app/core/services/payment-method.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';

@Component({
  selector: 'app-add-cash-box',
  templateUrl: './add-cash-box.component.html',
  styleUrls: ['./add-cash-box.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ProgressbarModule],
})
export class AddCashBoxComponent implements OnInit, OnDestroy {
  @Input() transactionType!: TransactionType;

  public loading = false;
  public madeIn = 'mostrador';

  public cashBoxForm!: FormGroup;
  public formAddCurrencyValue!: FormGroup;
  public paymentMethods: PaymentMethod[] = [];
  public currencyValues: CurrencyValue[] = [];
  public currencyValuesForm: currencyValue[] = [];
  public totalCurrencyValue = 0;
  public selectedPayment: PaymentMethod | null = null;

  public cashBox: CashBox = {} as CashBox;
  public transaction = new Transaction();
  public movementsOfCashes: MovementOfCash[] = [];

  private config: Config | null = null;
  private identity: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private _paymentMethodService: PaymentMethodService,
    private _movementOfCashService: MovementOfCashService,
    private _transactionTypeService: TransactionTypeService,
    private _cashBoxService: CashBoxService,
    private _authService: AuthService,
    private _transactionService: TransactionService,
    private _currencyValueService: CurrencyValueService,
    private _configService: ConfigService,
    private _printService: PrintService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.madeIn = this.resolveMadeIn();
    this.buildForm();
    this.loading = true;

    combineLatest({
      config: this._configService.getConfig,
      identity: this._authService.getIdentity,
      currencyValues: this._currencyValueService.find({ query: { operationType: { $ne: 'D' } } }),
      paymentMethods: this._paymentMethodService.find({
        query: { cashBoxImpact: true, operationType: { $ne: 'D' } },
      }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ config, identity, currencyValues, paymentMethods }) => {
          this.config = config;
          this.identity = identity;
          this.currencyValues = currencyValues ?? [];
          this.paymentMethods = paymentMethods ?? [];
          this.setValueForm();

          if (this.transactionType) {
            this.getOpenCashBox();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resolveMadeIn(): string {
    const fromQuery = this._route.snapshot.queryParams['madeIn'];
    if (fromQuery) return fromQuery;

    const path = this._router.url.split('/');
    return path[2] || 'mostrador';
  }

  private buildForm(): void {
    this.cashBoxForm = this._fb.group({
      paymentMethod: [null, [Validators.required]],
      amount: [null],
    });

    this.formAddCurrencyValue = this._fb.group({
      currencyValue: [null, [Validators.required]],
      currencyAmount: [0],
    });

    this.cashBoxForm
      .get('paymentMethod')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((payment: PaymentMethod | null) => {
        this.selectedPayment = payment;
      });
  }

  private setValueForm(): void {
    this.cashBoxForm.patchValue({
      paymentMethod: this.paymentMethods[0] ?? null,
      amount: null,
    });
  }

  private buildOpenCashBoxQuery(): string {
    let query = 'where="state":"' + CashBoxState.Open + '"';

    if (this.identity) {
      if (this.config?.cashBox?.perUser) {
        query += ',"creationUser":"' + this.identity._id + '"';
      } else if (this.identity.cashBoxType) {
        query += ',"type":"' + this.identity.cashBoxType._id + '"';
      } else {
        query += ',"type":null';
      }
    }

    return query + '&sort="number":-1&limit=1';
  }

  getOpenCashBox(): void {
    this.loading = true;
    this._cashBoxService
      .getCashBoxes(this.buildOpenCashBoxQuery())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.cashBoxes?.length) {
            this.cashBox = result.cashBoxes[0];
            this.validateCashBoxState();
          } else if (this.transactionType?.cashClosing) {
            this._toastService.showToast({ message: 'No se encuentran cajas abiertas.', type: 'info' });
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private validateCashBoxState(): void {
    if (this.transactionType?.cashOpening) {
      this._toastService.showToast({ message: 'La caja ya se encuentra abierta.', type: 'info' });
      return;
    }

    if (this.transactionType?.cashClosing && this.cashBox?._id) {
      this.getOpenTransactionsForCashBox(this.cashBox._id, true);
    }
  }

  getOpenTransactionsForCashBox(cashBoxId: string, onlyValidate = false): void {
    const query =
      'where="$and":[{"state":{"$ne": "' +
      TransactionState.Closed +
      '"}},{"state":{"$ne": "' +
      TransactionState.Canceled +
      '"}},{"state":{"$ne": "' +
      TransactionState.PaymentDeclined +
      '"}},{"cashBox":"' +
      cashBoxId +
      '"}]';

    this.loading = true;
    this._transactionService
      .getTransactions(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const transactions = result?.transactions;
          if (transactions?.length) {
            const tx = transactions[0];
            this._toastService.showToast({
              message:
                'No puede cerrar la caja. La transacción: ' +
                tx.type.name +
                ' ' +
                tx.origin +
                '-' +
                tx.letter +
                '-' +
                tx.number +
                ' se encuentra abierta.',
              type: 'info',
            });
            return;
          }

          if (!onlyValidate) {
            this.prepareTransaction();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  addCurrencyValue(): void {
    const formValue = this.formAddCurrencyValue.value;
    if (!(formValue && parseInt(formValue.currencyValue, 10) && formValue.currencyAmount)) {
      this._toastService.showToast({ message: 'Debe completar todos los campos', type: 'info' });
      return;
    }

    this.currencyValuesForm.push({
      value: parseInt(formValue.currencyValue, 10),
      quantity: formValue.currencyAmount,
    });
    this.recalcCurrencyTotal();
    this.formAddCurrencyValue.patchValue({ currencyValue: null, currencyAmount: null });
  }

  deleteCurrencyValue(index: number): void {
    this.currencyValuesForm.splice(index, 1);
    this.recalcCurrencyTotal();
  }

  private recalcCurrencyTotal(): void {
    this.totalCurrencyValue = this.currencyValuesForm.reduce((sum, item) => sum + item.quantity * item.value, 0);
  }

  addMovementOfCash(): void {
    const paymentMethod: PaymentMethod = this.cashBoxForm.value.paymentMethod;
    if (!paymentMethod) return;

    if (this.movementsOfCashes.some((m) => m.type?._id === paymentMethod._id)) {
      this._toastService.showToast({ message: 'Ya existe un movimiento con ese medio de pago.', type: 'info' });
      return;
    }

    if (!paymentMethod.cashBoxImpact) {
      this._toastService.showToast({
        message: 'El método de pago ' + paymentMethod.name + ' no impacta en la caja.',
        type: 'info',
      });
      return;
    }

    const useCurrencyBreakdown =
      paymentMethod.allowCurrencyValue && this.currencyValuesForm && this.currencyValuesForm.length > 0;

    let amountPaid = 0;
    if (!useCurrencyBreakdown) {
      const raw = this.cashBoxForm.value.amount;
      if (raw === null || raw === undefined || (typeof raw === 'string' && String(raw).trim() === '')) {
        this._toastService.showToast({ message: 'Ingrese un monto.', type: 'info' });
        return;
      }
      const num = Number(raw);
      if (Number.isNaN(num) || num < 0) {
        this._toastService.showToast({ message: 'El monto debe ser un número mayor o igual a 0.', type: 'info' });
        return;
      }
      amountPaid = num;
    }

    const mov = new MovementOfCash();
    mov.type = paymentMethod;

    if (useCurrencyBreakdown) {
      mov.currencyValues = [...this.currencyValuesForm];
      mov.amountPaid = mov.currencyValues.reduce((sum, el) => sum + el.quantity * el.value, 0);
    } else {
      mov.amountPaid = amountPaid;
    }

    this.movementsOfCashes.push(mov);
    this.currencyValuesForm = [];
    this.totalCurrencyValue = 0;
    this.cashBoxForm.patchValue({ amount: null });
    this.formAddCurrencyValue.patchValue({ currencyValue: null, currencyAmount: null });
  }

  removeMovement(movement: MovementOfCash): void {
    const index = this.movementsOfCashes.findIndex((m) => m === movement);
    if (index >= 0) {
      this.movementsOfCashes.splice(index, 1);
    }
  }

  openCashBox(): void {
    if (!this.transactionType) return;

    if (this.cashBox?._id) {
      this._toastService.showToast({ message: 'La caja ya se encuentra abierta.', type: 'info' });
      return;
    }

    this.loading = true;
    this._cashBoxService
      .getCashBoxes('sort="number":-1&limit=1')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const lastCashBoxes = result?.cashBoxes;
          this.cashBox = {
            number: lastCashBoxes?.length ? lastCashBoxes[0].number + 1 : 1,
            state: CashBoxState.Open,
            openingDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
            type: this.identity?.cashBoxType ?? null,
          } as CashBox;

          this.saveCashBox();
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  closeCashBox(): void {
    if (!this.cashBox?._id) {
      this._toastService.showToast({ message: 'No se encuentran cajas abiertas.', type: 'info' });
      return;
    }

    if (this.cashBox.state === CashBoxState.Closed) {
      this.printAndBack();
      return;
    }

    this.getOpenTransactionsForCashBox(this.cashBox._id, false);
  }

  saveCashBox(): void {
    this._cashBoxService
      .saveCashBox(this.cashBox as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!result?.cashBox) {
            if (result?.message) {
              this._toastService.showToast({ message: result.message, type: 'info' });
            }
            this.loading = false;
            return;
          }

          this.cashBox = result.cashBox;
          this.prepareTransaction();
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  prepareTransaction(): void {
    this.transaction.origin = this.transactionType.fixedOrigin ?? 0;

    if (this.transactionType.fixedLetter) {
      this.transaction.letter = this.transactionType.fixedLetter;
    } else {
      this.transaction.letter = Config.country === 'AR' ? 'X' : '';
    }

    this.transaction.type = this.transactionType;
    this.getLastTransactionByType();
  }

  getLastTransactionByType(): void {
    const query =
      'where="type":"' +
      this.transaction.type._id +
      '","origin":"' +
      0 +
      '","letter":"' +
      this.transaction.letter +
      '"&sort="number":-1&limit=1';

    this._transactionService
      .getTransactions(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const last = result?.transactions?.[0];
          this.transaction.number = last ? last.number + 1 : 1;
          this.addTransaction();
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  addTransaction(): void {
    if (!this.transactionType) return;

    this.transaction.madein = this.madeIn === 'cuentas-corrientes' ? 'mostrador' : this.madeIn;
    this.transaction.totalPrice = 0;
    this.transaction.cashBox = this.cashBox as any;
    this.transaction.type = this.transactionType;

    if (this.movementsOfCashes.length > 0) {
      for (const mov of this.movementsOfCashes) {
        this.transaction.totalPrice += mov.amountPaid;
      }
      this.transaction.state = TransactionState.Closed;
      this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      this.transaction.VATPeriod = moment().format('YYYYMM');
      this.transaction.expirationDate = this.transaction.endDate;
      this.saveTransaction();
      return;
    }

    this.finishCashBoxFlow();
  }

  saveTransaction(): void {
    this._transactionService
      .save(this.transaction)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status !== 200) {
            this._toastService.showToast(result);
            this.loading = false;
            return;
          }

          this.transaction = result.result;
          for (const movementOfCash of this.movementsOfCashes) {
            movementOfCash.transaction = this.transaction;
          }
          this.saveMovementsOfCashes();
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  saveMovementsOfCashes(): void {
    this._movementOfCashService
      .saveMovementsOfCashes(this.movementsOfCashes)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!result?.movementsOfCashes) {
            if (result?.message) {
              this._toastService.showToast({ message: result.message, type: 'info' });
            }
            this.loading = false;
            return;
          }

          this.finishCashBoxFlow();
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  private finishCashBoxFlow(): void {
    if (this.transactionType.cashOpening) {
      this.loading = false;
      this.activeModal.close({ cashBox: this.cashBox });
      return;
    }

    this.cashBox.closingDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    this.cashBox.state = CashBoxState.Closed;
    this.resetOrderNumber();
    this.updateCashBox();
  }

  updateCashBox(): void {
    this._cashBoxService
      .updateCashBox(this.cashBox as any)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!result?.cashBox) {
            if (result?.message) {
              this._toastService.showToast({ message: result.message, type: 'info' });
            }
            this.loading = false;
            return;
          }

          this.cashBox = result.cashBox;
          this.printAndBack();
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  resetOrderNumber(): void {
    const match: any = {
      operationType: { $ne: 'D' },
      resetOrderNumber: 'Caja',
      orderNumber: { $gte: 0 },
    };

    if (this.cashBox.type) {
      match['cashBoxType._id'] = { $oid: this.cashBox.type._id };
    }

    this._transactionTypeService
      .getAll({
        project: {
          resetOrderNumber: 1,
          orderNumber: 1,
          operationType: 1,
          order: 1,
          transactionMovement: 1,
          abbreviation: 1,
          name: 1,
          currentAccount: 1,
          stockMovement: 1,
          movement: 1,
          modifyStock: 1,
          requestArticles: 1,
          requestTaxes: 1,
          'cashBoxType._id': 1,
        },
        match,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.status !== 200) {
            this._toastService.showToast(result?.error ?? result);
            return;
          }

          for (const element of result.result as TransactionType[]) {
            this.updateTransactionTypeOrder(element);
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  private updateTransactionTypeOrder(transactionType: TransactionType): void {
    transactionType.orderNumber = 1;
    this._transactionTypeService
      .update(transactionType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.status === 200) {
            this._toastService.showToast({
              type: 'success',
              message:
                'La numeracion del tipo de transaccion: ' + result.result.name + ' se reinicio correctamente',
            });
          } else {
            this._toastService.showToast(result?.error ?? result);
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  private printAndBack(): void {
    this.toPrint(PrintType.CashBox, { cashBoxId: this.cashBox._id });
    this.activeModal.close({ cashBox: this.cashBox });
  }

  toPrint(type: PrintType, data: {}): void {
    this.loading = true;
    this._printService
      .toPrint(type, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              printJS(URL.createObjectURL(result));
            } catch {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        error: () => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  closeModal(): void {
    this.activeModal.dismiss('close_click');
  }
}
