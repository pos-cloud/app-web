import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { normalizeApiResponse } from '@core/http';
import { CashBoxService, CurrencyValueService } from '@core/services';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ToastService } from '@shared/components/toast/toast.service';
import { CashBox, CashBoxBalanceItem, CashBoxState, CurrencyValue, TransactionType } from '@types';
import { currencyValue, MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { PaymentMethod } from 'app/components/payment-method/payment-method';

@Component({
  selector: 'app-transfer-cash-box',
  templateUrl: './transfer-cash-box.component.html',
  styleUrls: ['./transfer-cash-box.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ProgressbarModule],
})
export class TransferCashBoxComponent implements OnInit, OnDestroy {
  @Input() transactionType!: TransactionType;

  public loading = false;
  public transferForm!: FormGroup;
  public formAddCurrencyValue!: FormGroup;
  public cashBoxes: CashBox[] = [];
  public paymentMethods: PaymentMethod[] = [];
  public currencyValues: CurrencyValue[] = [];
  public currencyValuesForm: currencyValue[] = [];
  public totalCurrencyValue = 0;
  public selectPayment: PaymentMethod | null = null;
  public movementsOfCashes: MovementOfCash[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _cashBoxService: CashBoxService,
    private _currencyValueService: CurrencyValueService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loading = true;

    combineLatest({
      currencyValues: this._currencyValueService.find({ query: { operationType: { $ne: 'D' } } }),
      cashBoxes: this._cashBoxService.getAll({
        project: {
          _id: 1,
          number: 1,
          state: 1,
          'type._id': 1,
          'type.name': 1,
          'creationUser.name': 1,
          operationType: 1,
          open: 1,
          entries: 1,
        },
        match: {
          state: CashBoxState.Open,
          operationType: { $ne: 'D' },
        },
        sort: { number: -1 },
      }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ currencyValues, cashBoxes }) => {
          this.currencyValues = currencyValues ?? [];
          this.setOpenCashBoxes(cashBoxes);
          this.setPaymentMethodsFromCashBox(this.transferForm.value.cashBoxOrigin);
        },
        error: (error) => {
          const response = normalizeApiResponse(error);
          this._toastService.showToast(null, 'danger', '', response?.body.message ?? 'Algo salió mal.');
          this.activeModal.dismiss('validation');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public get destinationCashBoxes(): CashBox[] {
    const originId = this.transferForm?.value?.cashBoxOrigin?._id;
    if (!originId) return this.cashBoxes;
    return this.cashBoxes.filter((cashBox) => cashBox._id !== originId);
  }

  public get movementsTotal(): number {
    return this.movementsOfCashes.reduce((total, movement) => total + (Number(movement.amountPaid) || 0), 0);
  }

  public cashBoxLabel(cashBox: CashBox): string {
    const typeName = cashBox?.type?.name ? ` - ${cashBox.type.name}` : '';
    const userName = cashBox?.creationUser?.name ? ` (${cashBox.creationUser.name})` : '';
    return `Caja ${cashBox?.number ?? ''}${typeName}${userName}`;
  }

  public buildForm(): void {
    this.transferForm = this._fb.group({
      cashBoxOrigin: [null, [Validators.required]],
      cashBoxDestination: [null, [Validators.required]],
      paymentMethod: [null, [Validators.required]],
      amount: [null],
    });
    this.formAddCurrencyValue = this._fb.group({
      currencyValue: [null, [Validators.required]],
      currencyAmount: [0],
    });
    this.transferForm
      .get('paymentMethod')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.selectPayment = data;
      });
    this.transferForm
      .get('cashBoxOrigin')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((origin: CashBox) => {
        const destination: CashBox = this.transferForm.get('cashBoxDestination')?.value;
        if (origin && destination && origin._id === destination._id) {
          this.transferForm.patchValue({ cashBoxDestination: null }, { emitEvent: false });
        }
        this.movementsOfCashes = [];
        this.currencyValuesForm = [];
        this.totalCurrencyValue = 0;
        this.setPaymentMethodsFromCashBox(origin);
      });
  }

  public setPaymentMethodsFromCashBox(cashBox: CashBox | null): void {
    const origin = this.cashBoxes.find((box) => box._id === cashBox?._id) ?? cashBox;
    this.paymentMethods = this.paymentMethodsFromCashBox(origin);
    const current: PaymentMethod | null = this.transferForm?.get('paymentMethod')?.value;
    const stillValid = !!current && this.paymentMethods.some((method) => method._id === current._id);

    this.transferForm.patchValue({
      paymentMethod: stillValid ? current : this.paymentMethods[0] ?? null,
      amount: null,
    });
  }

  public addCurrencyValue(): void {
    const e = this.formAddCurrencyValue.value;
    if (e && parseInt(e.currencyValue, 10) && e.currencyAmount) {
      this.currencyValuesForm.push({
        value: parseInt(e.currencyValue, 10),
        quantity: e.currencyAmount,
      });
      this.totalCurrencyValue = 0;
      for (const iterator of this.currencyValuesForm) {
        this.totalCurrencyValue = this.totalCurrencyValue + iterator.quantity * iterator.value;
      }
      this.formAddCurrencyValue.patchValue({ currencyValue: null, currencyAmount: null });
    } else {
      this._toastService.showToast({ message: 'Debe completar todos los campos', type: 'info' });
    }
  }

  public deleteCurrencyValue(index: number): void {
    this.currencyValuesForm.splice(index, 1);
    this.totalCurrencyValue = 0;
    for (const iterator of this.currencyValuesForm) {
      this.totalCurrencyValue = this.totalCurrencyValue + iterator.quantity * iterator.value;
    }
  }

  public addMovementOfCash(): void {
    const paymentMethod: PaymentMethod = this.transferForm.value.paymentMethod;
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

    const mov = new MovementOfCash();
    mov.type = paymentMethod;

    if (useCurrencyBreakdown) {
      mov.currencyValues = this.currencyValuesForm;
      mov.amountPaid = 0;
      mov.currencyValues.forEach((element) => {
        mov.amountPaid = mov.amountPaid + element.quantity * element.value;
      });
    } else {
      const raw = this.transferForm.value.amount;
      if (raw === null || raw === undefined || (typeof raw === 'string' && String(raw).trim() === '')) {
        this._toastService.showToast({ message: 'Ingrese un monto.', type: 'info' });
        return;
      }
      const num = Number(raw);
      if (Number.isNaN(num) || num <= 0) {
        this._toastService.showToast({ message: 'El monto debe ser un número mayor a 0.', type: 'info' });
        return;
      }
      mov.amountPaid = num;
    }

    if (!mov.amountPaid || mov.amountPaid <= 0) {
      this._toastService.showToast({ message: 'El monto debe ser mayor a 0.', type: 'info' });
      return;
    }

    this.movementsOfCashes.push(mov);
    this.currencyValuesForm = [];
    this.totalCurrencyValue = 0;
    this.transferForm.patchValue({ amount: null });
    this.formAddCurrencyValue.patchValue({ currencyValue: null, currencyAmount: null });
  }

  public transferCashBox(): void {
    const origin: CashBox = this.transferForm.value.cashBoxOrigin;
    const destination: CashBox = this.transferForm.value.cashBoxDestination;

    if (!origin || !destination) {
      this._toastService.showToast({ message: 'Debe seleccionar caja de origen y destino.', type: 'info' });
      return;
    }

    if (origin._id === destination._id) {
      this._toastService.showToast({ message: 'La caja de origen y destino no pueden ser la misma.', type: 'info' });
      return;
    }

    if (!this.movementsOfCashes?.length) {
      this._toastService.showToast({
        message: 'Debe confirmar al menos un movimiento para transferir.',
        type: 'info',
      });
      return;
    }

    this.loading = true;
    this._cashBoxService
      .transferCashBox(this.movementsOfCashes, this.transactionType._id, origin._id, destination._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const response = normalizeApiResponse(result);
          if (response?.ok) {
            this.activeModal.close({
              cashBoxOrigin: origin,
              cashBoxDestination: destination,
              result: response.body.result,
            });
          } else {
            this._toastService.showToast(null, 'danger', '', response?.body.message ?? 'Algo salió mal.');
          }
        },
        error: (error) => {
          const response = normalizeApiResponse(error);
          this._toastService.showToast(null, 'danger', '', response?.body.message ?? 'Algo salió mal.');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  private paymentMethodsFromCashBox(cashBox: CashBox | null): PaymentMethod[] {
    if (!cashBox) return [];

    const items = [...this.toBalanceItems(cashBox.open), ...this.toBalanceItems(cashBox.entries)];
    const byId = new Map<string, PaymentMethod>();

    for (const item of items) {
      const method = this.paymentMethodFromBalanceItem(item);
      if (!method?._id || byId.has(method._id)) continue;
      byId.set(method._id, method);
    }

    return Array.from(byId.values());
  }

  private toBalanceItems(value: unknown): CashBoxBalanceItem[] {
    if (Array.isArray(value)) return value as CashBoxBalanceItem[];
    if (!value || typeof value !== 'object') return [];

    const nested = (value as { type?: unknown }).type;
    if (Array.isArray(nested)) {
      return nested.map((type) => ({
        type,
        name: (type as { name?: string })?.name ?? '',
        balance: 0,
      })) as CashBoxBalanceItem[];
    }

    return [value as CashBoxBalanceItem];
  }

  private paymentMethodFromBalanceItem(item: CashBoxBalanceItem): PaymentMethod | null {
    const rawType: unknown = Array.isArray(item?.type) ? item.type[0] : item?.type;
    const id = this.paymentMethodId(rawType);
    const name = (typeof rawType === 'object' && rawType && 'name' in rawType ? (rawType as PaymentMethod).name : '') || item?.name;
    if (!id || id === '[object Object]') return null;

    const fromType = typeof rawType === 'object' && rawType ? (rawType as PaymentMethod) : ({} as PaymentMethod);
    return {
      ...fromType,
      _id: fromType._id || id,
      name: name || fromType.name,
      cashBoxImpact: fromType.cashBoxImpact ?? true,
    } as PaymentMethod;
  }

  private paymentMethodId(value: unknown): string {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (obj['_id']) return this.paymentMethodId(obj['_id']);
      if (typeof obj['$oid'] === 'string') return obj['$oid'];
    }
    return String(value);
  }

  private setOpenCashBoxes(response: unknown): void {
    const normalized = Array.isArray(response) ? null : normalizeApiResponse(response);

    if (!Array.isArray(response) && !normalized?.ok) {
      this._toastService.showToast(null, 'danger', '', normalized?.body.message ?? 'Algo salió mal.');
      this.activeModal.dismiss('validation');
      return;
    }

    const boxes = Array.isArray(response) ? response : (normalized?.body.result ?? []);
    this.cashBoxes = Array.isArray(boxes) ? boxes : [];

    if (this.cashBoxes.length < 2) {
      this._toastService.showToast({
        message: 'Se necesitan al menos dos cajas abiertas para realizar una transferencia.',
        type: 'info',
      });
      this.activeModal.dismiss('validation');
      return;
    }

    if (this.cashBoxes.length === 2) {
      this.transferForm.patchValue({
        cashBoxOrigin: this.cashBoxes[0],
        cashBoxDestination: this.cashBoxes[1],
      });
    }

    this._document.querySelectorAll('.cash-box-modal-pending').forEach((el) => {
      el.classList.remove('cash-box-modal-pending');
    });
    this.loading = false;
  }
}
