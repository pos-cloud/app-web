import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AccountService } from '@core/services/account.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { Account, ApiResponse, Article } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaymentMethod } from '../../../../components/payment-method/payment-method';
import { ArticleService } from '../../../../core/services/article.service';
import { PaymentMethodService } from '../../../../core/services/payment-method.service';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    ProgressbarModule,
  ],
})
export class PaymentMethodComponent implements OnInit {
  public operation: string;

  public paymentMethod: PaymentMethod;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public paymentMethodForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public articles: Article[];
  public accounts: Account[];

  constructor(
    public _paymentMethodService: PaymentMethodService,
    public _articleService: ArticleService,
    public _accountService: AccountService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.paymentMethodForm = this._fb.group({
      _id: ['', []],
      order: ['', []],
      code: ['', []],
      name: ['', [Validators.required]],
      discount: ['', []],
      discountArticle: ['', []],
      surcharge: ['', []],
      surchargeArticle: ['', []],
      commission: ['', []],
      commissionArticle: ['', []],
      administrativeExpense: ['', []],
      administrativeExpenseArticle: ['', []],
      otherExpense: ['', []],
      otherExpenseArticle: ['', []],
      isCurrentAccount: ['', []],
      acceptReturned: ['', []],
      inputAndOuput: ['', []],
      checkDetail: ['', []],
      checkPerson: ['', []],
      cardDetail: ['', []],
      allowToFinance: ['', []],
      payFirstQuota: ['', []],
      cashBoxImpact: ['', []],
      company: ['', []],
      allowCurrencyValue: ['', []],
      allowBank: ['', []],
      account: ['', []],
      expirationDays: ['', []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const paymentMethodId = pathUrl[4];
    this.operation = pathUrl[3];

    if (this.operation === 'view' || this.operation === 'delete') this.paymentMethodForm.disable();
    this.loading = true;

    combineLatest({
      articles: this._articleService.find({ query: { operationType: { $ne: 'D' } } }),
      accounts: this._accountService.find({ query: { operationType: { $ne: 'D' }, mode: 'Analitico' } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ articles, accounts }) => {
          this.articles = articles ?? [];
          this.accounts = accounts ?? [];
          if (paymentMethodId) {
            this.getPaymentMethod(paymentMethodId);
          } else {
            this.setValueForm();
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

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  public setValueForm(): void {
    const values = {
      _id: this.paymentMethod?._id ?? '',
      name: this.paymentMethod?.name ?? '',
      code: this.paymentMethod?.code ?? 0,
      order: this.paymentMethod?.order ?? 0,
      commissionArticle:
        this.articles?.find((item) => item._id === this.paymentMethod?.commissionArticle?.toString()) ?? null,
      administrativeExpenseArticle:
        this.articles?.find((item) => item._id === this.paymentMethod?.administrativeExpenseArticle?.toString()) ??
        null,
      discountArticle:
        this.articles?.find((item) => item._id === this.paymentMethod?.discountArticle?.toString()) ?? null,
      surchargeArticle:
        this.articles?.find((item) => item._id === this.paymentMethod?.surchargeArticle?.toString()) ?? null,
      otherExpenseArticle:
        this.articles?.find((item) => item._id === this.paymentMethod?.otherExpenseArticle?.toString()) ?? null,
      discount: this.paymentMethod?.discount ?? 0.0,
      surcharge: this.paymentMethod?.surcharge ?? 0.0,
      commission: this.paymentMethod?.commission ?? 0.0,
      administrativeExpense: this.paymentMethod?.administrativeExpense ?? 0.0,
      otherExpense: this.paymentMethod?.otherExpense ?? 0.0,
      isCurrentAccount: this.paymentMethod?.isCurrentAccount ?? false,
      expirationDays: this.paymentMethod?.expirationDays ?? 30,
      acceptReturned: this.paymentMethod?.acceptReturned ?? false,
      inputAndOuput: this.paymentMethod?.inputAndOuput ?? false,
      checkDetail: this.paymentMethod?.checkDetail ?? false,
      checkPerson: this.paymentMethod?.checkPerson ?? false,
      cardDetail: this.paymentMethod?.cardDetail ?? false,
      allowToFinance: this.paymentMethod?.allowToFinance ?? false,
      payFirstQuota: this.paymentMethod?.payFirstQuota ?? false,
      cashBoxImpact: this.paymentMethod?.cashBoxImpact ?? false,
      account: this.accounts?.find((item) => item._id === this.paymentMethod?.account?.toString()) ?? null,
      company: this.paymentMethod?.company ?? null,
      allowCurrencyValue: this.paymentMethod?.allowCurrencyValue ?? false,
      allowBank: this.paymentMethod?.allowBank ?? false,
    };
    this.paymentMethodForm.setValue(values);
  }

  returnTo() {
    this._router.navigate(['/entities/payment-methods']);
  }

  public getPaymentMethod(id: string) {
    this.loading = true;

    this._paymentMethodService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.paymentMethod = result.result;
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

  public handlePaymentMethodOperation() {
    this.loading = true;
    this.paymentMethodForm.markAllAsTouched();
    if (this.paymentMethodForm.invalid) {
      this.loading = false;
      return;
    }
    this.paymentMethod = this.paymentMethodForm.value;
    switch (this.operation) {
      case 'add':
        this.savePaymentMethod();
        break;
      case 'update':
        this.updatePaymentMethod();
        break;
      case 'delete':
        this.deletePaymentMethod();
      default:
        break;
    }
  }

  public updatePaymentMethod() {
    this._paymentMethodService
      .update(this.paymentMethod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.paymentMethod = result.result;
            this.returnTo();
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

  public savePaymentMethod() {
    this._paymentMethodService
      .save(this.paymentMethod)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.paymentMethod = result.result;
            this.returnTo();
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

  public deletePaymentMethod() {
    this._paymentMethodService
      .delete(this.paymentMethod._id)
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
