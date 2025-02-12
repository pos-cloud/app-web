import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse, CurrencyValue } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurrencyValueService } from '../../../core/services/currency-value.service';

@Component({
  selector: 'app-currency-value',
  templateUrl: './currency-value.component.html',
})
export class CurrencyValueComponent implements OnInit, OnDestroy {
  public operation: string;
  public currencyValueForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public currencyValue: CurrencyValue;
  private destroy$ = new Subject<void>();

  constructor(
    private _currencyValueService: CurrencyValueService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.currencyValueForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      value: [0, [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const currencyValueId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') this.currencyValueForm.disable();
    if (currencyValueId) {
      this.getCurrencyValue(currencyValueId);
    }
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  getCurrencyValue(id: string): void {
    this._currencyValueService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.currencyValue = result.result;
          this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  setValueForm(): void {
    this.currencyValueForm.patchValue({
      _id: this.currencyValue._id ?? '',
      name: this.currencyValue.name ?? '',
      value: this.currencyValue.value ?? 0,
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/currency-values']);
  }

  async handleCurrencyValueOperation() {
    this.loading = true;

    this.currencyValueForm.markAllAsTouched();
    if (this.currencyValueForm.invalid) {
      this.loading = false;
      return;
    }

    this.currencyValue = this.currencyValueForm.value;

    switch (this.operation) {
      case 'add':
        this.saveCurrencyValue();
        break;
      case 'update':
        this.updateCurrencyValue();
        break;
      case 'delete':
        this.deleteCurrencyValue();
        break;
    }
  }

  saveCurrencyValue(): void {
    this._currencyValueService
      .save(this.currencyValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  updateCurrencyValue(): void {
    this._currencyValueService
      .update(this.currencyValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  deleteCurrencyValue() {
    this._currencyValueService
      .delete(this.currencyValue._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status === 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
