import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { Account, AccountPeriod, AccountSeat, ApiResponse, TypeAccountSeat } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { CommonModule } from '@angular/common';
import { AccountPeriodService } from '@core/services/account-period.service';
import { AccountSeatService } from '@core/services/account-seat.service';
import { AccountService } from '@core/services/account.service';
import { TranslateModule } from '@ngx-translate/core';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { UploadFileComponent } from 'app/shared/components/upload-file/upload-file.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-account-seat',
  templateUrl: './account-seat.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    UploadFileComponent,
    TypeaheadDropdownComponent,
    FormsModule,
  ],
})
export class AccountSeatComponent implements OnInit, OnDestroy {
  public operation: string;
  public accountSeatForm: UntypedFormGroup;
  public accountForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public accountSeat: AccountSeat;
  private destroy$ = new Subject<void>();
  public accounts: Account[];
  public accountPeriods: AccountPeriod[];
  public optionsTypeAccountSeat = [
    { label: 'automatic', value: TypeAccountSeat.Automatic },
    { label: 'manual', value: TypeAccountSeat.Manual },
    { label: 'reversal', value: TypeAccountSeat.Reversal },
  ];
  public totalDebit: number = 0;
  public totalHaber: number = 0;

  constructor(
    private _accountSeatService: AccountSeatService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService,
    private _accountService: AccountService,
    private _accountPeriodService: AccountPeriodService
  ) {
    this.accountSeatForm = this._fb.group({
      _id: ['', []],
      period: [null, [Validators.required]],
      date: ['', []],
      type: ['', []],
      observation: ['', []],
      items: this._fb.array([]),
    });

    this.accountForm = this._fb.group({
      account: [null, [Validators.required]],
      debit: [0],
      credit: [0],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const accountSeatId = pathUrl[4];
    if (this.operation === 'view' || this.operation === 'delete') {
      this.accountSeatForm.disable();
      this.accountForm.disable();
    }
    combineLatest({
      accounts: this._accountService.find({ query: { operationType: { $ne: 'D' } } }),
      accountPeriods: this._accountPeriodService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ accounts, accountPeriods }) => {
          this.accounts = accounts ?? [];
          this.accountPeriods = accountPeriods ?? [];

          if (accountSeatId) {
            this.getAccountSeat(accountSeatId);
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

  getAccountSeat(id: string): void {
    this._accountSeatService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.accountSeat = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.setValueForm();
          this.loading = false;
        },
      });
  }

  setValueForm(): void {
    const period = this.accountPeriods?.find((period) => period._id === this.accountSeat?.period?.toString());
    let values = {
      _id: this.accountSeat?._id ?? '',
      period: period ?? null,
      date: this.accountSeat?.date ? new Date(this.accountSeat.date).toISOString().substring(0, 10) : '',
      observation: this.accountSeat?.observation ?? '',
      type: this.accountSeat?.type ?? TypeAccountSeat.Manual,
    };

    this.accountSeatForm.patchValue(values);

    if (this.accountSeat.items && this.accountSeat.items.length > 0) {
      const itemsArray = this.accountSeatForm.get('items') as FormArray;

      this.accountSeat?.items?.forEach((item: any) => {
        this.totalDebit += +item.debit;
        this.totalHaber += +item.credit;
        const accountObject = this.accounts?.find((a) => a._id === item.account.toString()) ?? null;

        itemsArray.push(
          this._fb.group({
            account: accountObject,
            debit: item?.debit ?? 0,
            credit: item?.credit ?? 0,
          })
        );
      });
    }
  }

  returnTo() {
    return this._router.navigate(['/entities/account-seat']);
  }

  async handleAccountSeatOperation() {
    this.loading = true;

    this.accountSeatForm.markAllAsTouched();
    if (this.accountSeatForm.invalid) {
      this.loading = false;
      return;
    }

    if (this.operation === 'delete') {
      this.accountSeat = this.accountSeatForm.getRawValue();
    } else {
      this.accountSeat = this.accountSeatForm.value;
    }

    switch (this.operation) {
      case 'add':
        this.saveAccountSeat();
        break;
      case 'update':
        this.updateAccountSeat();
        break;
      case 'delete':
        this.deleteAccountSeat();
        break;
    }
  }

  saveAccountSeat(): void {
    this._accountSeatService
      .save(this.accountSeat)
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

  updateAccountSeat(): void {
    this._accountSeatService
      .update(this.accountSeat)
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

  deleteAccountSeat() {
    this._accountSeatService
      .delete(this.accountSeat._id)
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

  addItem() {
    const items = this.accountSeatForm.get('items') as FormArray;

    const account = this.accountForm.get('account')?.value;
    const debit = this.accountForm.get('debit')?.value ?? 0;
    const credit = this.accountForm.get('credit')?.value ?? 0;

    if (!account) return this._toastService.showToast({ message: 'Selecciona una cuenta para guardar' });
    items.push(
      this._fb.group({
        account: account,
        debit: debit,
        credit: credit,
      })
    );

    this.totalDebit += +debit;
    this.totalHaber += +credit;

    // reset form
    this.accountForm.reset({
      account: null,
      debit: 0,
      credit: 0,
    });
  }

  deleteItem(index) {
    let control = <UntypedFormArray>this.accountSeatForm.controls.items;
    control.removeAt(index);

    this.totalDebit = 0;
    this.totalHaber = 0;

    control.controls.forEach((element) => {
      this.totalDebit = this.totalDebit + +element.value.debit;
      this.totalHaber = this.totalHaber + +element.value.credit;
    });
  }
}
