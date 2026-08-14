import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import * as printJS from 'print-js';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CashBoxService, CurrencyValueService, PaymentMethodService, PrintService } from '@core/services';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, CashBox, CurrencyValue, PrintType, TransactionType } from '@types';
import { currencyValue, MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { PaymentMethod } from 'app/components/payment-method/payment-method';

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
  public cashBoxForm!: FormGroup;
  public formAddCurrencyValue!: FormGroup;
  public paymentMethods: PaymentMethod[] = [];
  public currencyValues: CurrencyValue[] = [];
  public currencyValuesForm: currencyValue[] = [];
  public totalCurrencyValue = 0;
  public selectPayment: any;
  public cashBox: CashBox = {} as CashBox;
  public movementsOfCashes: MovementOfCash[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private _fb: FormBuilder,
    private _paymentMethodService: PaymentMethodService,
    private _cashBoxService: CashBoxService,
    private _currencyValueService: CurrencyValueService,
    private _printService: PrintService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loading = true;

    combineLatest({
      currencyValues: this._currencyValueService.find({ query: { operationType: { $ne: 'D' } } }),
      paymentMethods: this._paymentMethodService.find({
        query: { cashBoxImpact: true, operationType: { $ne: 'D' } },
      }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ currencyValues, paymentMethods }) => {
          this.currencyValues = currencyValues ?? [];
          this.paymentMethods = paymentMethods ?? [];
          this.setValueForm();
          if (this.transactionType) {
            this.getAvailableCashBox();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          if (!this.transactionType) this.loading = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public buildForm(): void {
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
      .subscribe((data) => {
        this.selectPayment = data;
      });
  }

  public setValueForm(): void {
    this.cashBoxForm.patchValue({
      paymentMethod: this.paymentMethods[0] ?? null,
      amount: null,
    });
  }

  public getAvailableCashBox(): void {
    this.loading = true;
    this._cashBoxService
      .availableCashBox(this.transactionType.cashOpening)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status == 200) {
            if (result.result) this.cashBox = result.result;
            this._document.querySelectorAll('.cash-box-modal-pending').forEach((el) => {
              el.classList.remove('cash-box-modal-pending');
            });
          } else {
            this._toastService.showToast(result.error ?? result);
            this.activeModal.dismiss('validation');
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.activeModal.dismiss('validation');
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public addCurrencyValue(): void {
    let e = this.formAddCurrencyValue.value;
    if (e && parseInt(e.currencyValue) && e.currencyAmount) {
      this.currencyValuesForm.push({
        value: parseInt(e.currencyValue),
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
    let paymentMethod: PaymentMethod = this.cashBoxForm.value.paymentMethod;
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

    let mov = new MovementOfCash();
    mov.type = paymentMethod;

    if (useCurrencyBreakdown) {
      mov.currencyValues = this.currencyValuesForm;
      mov.amountPaid = 0;
      mov.currencyValues.forEach((element) => {
        mov.amountPaid = mov.amountPaid + element.quantity * element.value;
      });
    } else {
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
      mov.amountPaid = num;
    }

    this.movementsOfCashes.push(mov);
    this.currencyValuesForm = [];
    this.totalCurrencyValue = 0;
    this.cashBoxForm.patchValue({ amount: null });
    this.formAddCurrencyValue.patchValue({ currencyValue: null, currencyAmount: null });
  }

  public openCashBox(): void {
    if (!this.movementsOfCashes?.length) {
      this._toastService.showToast({
        message: 'Debe confirmar al menos un movimiento para abrir la caja.',
        type: 'info',
      });
      return;
    }

    this.loading = true;
    this._cashBoxService
      .openCashBox(this.movementsOfCashes, this.transactionType._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status == 200) {
            this.cashBox = result.result?.cashBox ?? result.result ?? this.cashBox;
            this.activeModal.close({ cashBox: this.cashBox });
          } else {
            this._toastService.showToast(result.error ?? result);
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

  public closeCashBox(): void {
    this.loading = true;
    this._cashBoxService
      .closeCashBox(this.movementsOfCashes, this.transactionType._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status == 200) {
            this.cashBox = result.result?.cashBox ?? result.result ?? this.cashBox;
            this.toPrint(PrintType.CashBox, { cashBoxId: this.cashBox._id });
            this.activeModal.close({ cashBox: this.cashBox });
          } else {
            this._toastService.showToast(result.error ?? result);
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

  public toPrint(type: PrintType, data: {}): void {
    this.loading = true;
    this._printService.toPrint(type, data).subscribe({
      next: (result: Blob | ApiResponse) => {
        if (!result) {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
          return;
        }
        if (result instanceof Blob) {
          try {
            printJS(URL.createObjectURL(result));
          } catch (e) {
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
}
