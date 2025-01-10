import { Component, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse } from '@types';

import { Account } from 'app/components/account/account';
import { Currency } from 'app/components/currency/currency';
import { CurrencyService } from 'app/core/services/currency.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-currency',
  templateUrl: 'currency.component.html',
})
export class CurrencyComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public bankId: string;
  public alertMessage: string = '';
  public userType: string;
  public currency: Currency;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public currencyForm: UntypedFormGroup;
  public accounts: Account[];
  public quotation: any;

  private destroy$ = new Subject<void>();

  constructor(
    public _currencyService: CurrencyService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.currencyForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      sign: ['', [Validators.required]],
      quotation: ['', []],
      name: [null, []],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const currencyId = pathUrl[4];
    this.operation = pathUrl[3];

    if (currencyId) this.getCurrency(currencyId);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public setValueForm(): void {
    const values = {
      _id: this.currency._id ?? '',
      code: this.currency.code ?? 0,
      name: this.currency.name ?? '',
      sing: this.currency.sign ?? 0,
      quotation: this.currency.quotation ?? null,
    };
    this.currencyForm.setValue(values);
    this.quotation = values.quotation;
  }

  returnTo() {
    return this._router.navigate(['/entities/currencies']);
  }

  public getCurrency(currencyId: string) {
    this.loading = true;

    this._currencyService
      .getById(currencyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.currency = result.result;
          if (result.status == 200) this.setValueForm();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public handleCurrencyOperation() {
    this.loading = true;
    this.currencyForm.markAllAsTouched();
    if (this.currencyForm.invalid) {
      this.loading = false;
      return;
    }

    this.currency = this.currencyForm.value;

    switch (this.operation) {
      case 'add':
        this.saveCurrency();
        break;
      case 'update':
        this.updateCurrency();
        break;
      case 'delete':
        this.deleteCurrency();
      default:
        break;
    }
  }

  public updateCurrency() {
    this._currencyService
      .update(this.currency)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public saveCurrency() {
    this._currencyService
      .save(this.currency)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public deleteCurrency() {
    this._currencyService
      .delete(this.currency._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) this.returnTo();
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
