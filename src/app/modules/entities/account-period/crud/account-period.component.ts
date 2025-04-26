import { Component, EventEmitter, OnInit } from '@angular/core';
import 'moment/locale/es';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountPeriodService } from '@core/services/account-period.service';
import { NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from '@shared/components/toast/toast.service';
import { FocusDirective } from '@shared/directives/focus.directive';
import { PipesModule } from '@shared/pipes/pipes.module';
import { AccountPeriod, ApiResponse } from '@types';
import { Subject, takeUntil } from 'rxjs';
import { ProgressbarModule } from '../../../../shared/components/progressbar/progressbar.module';

@Component({
  selector: 'app-account-period',
  templateUrl: './account-period.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    NgbDatepickerModule,
    ProgressbarModule,
  ],
})
export class AccountPeriodComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public accountPeriod: AccountPeriod;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public accountPeriodForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _accountPeriodService: AccountPeriodService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.accountPeriodForm = this._fb.group({
      _id: ['', []],
      description: ['', [Validators.required]],
      status: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const accountPeriodId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.accountPeriodForm.disable();
    if (accountPeriodId) this.getAccountPeriod(accountPeriodId);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusEvent.complete();
  }

  returnTo() {
    return this._router.navigate(['/entities/account-periods']);
  }

  public getAccountPeriod(id: string) {
    this.loading = true;

    this._accountPeriodService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.accountPeriod = result.result;
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

  public setValueForm(): void {
    const values = {
      _id: this.accountPeriod._id ?? '',
      description: this.accountPeriod.description ?? '',
      status: this.accountPeriod.status ?? null,
      startDate: this.fromISOString(this.accountPeriod.startDate),
      endDate: this.fromISOString(this.accountPeriod.endDate),
    };
    this.accountPeriodForm.setValue(values);
  }

  public handleAccountPeriodOperation() {
    this.loading = true;
    this.accountPeriodForm.markAllAsTouched();
    if (this.accountPeriodForm.invalid) {
      this.loading = false;
      return;
    }

    const formValues = this.accountPeriodForm.value;
    this.accountPeriod = {
      ...formValues,
      startDate: this.toISOString(formValues.startDate),
      endDate: this.toISOString(formValues.endDate),
    };

    switch (this.operation) {
      case 'add':
        this.saveAccountPeriod();
        break;
      case 'update':
        this.updateAccountPeriod();
        break;
      case 'delete':
        this.deleteAccountPeriod();
      default:
        break;
    }
  }

  public updateAccountPeriod() {
    this._accountPeriodService
      .update(this.accountPeriod)
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

  public saveAccountPeriod() {
    this._accountPeriodService
      .save(this.accountPeriod)
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

  public deleteAccountPeriod() {
    this._accountPeriodService
      .delete(this.accountPeriod._id)
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

  toISOString(dateStruct: NgbDateStruct): string | null {
    if (!dateStruct) return null;
    const { year, month, day } = dateStruct;
    const date = new Date(year, month - 1, day);
    return date.toISOString();
  }

  fromISOString(isoString: string): NgbDateStruct | null {
    if (!isoString) return null;
    const date = new Date(isoString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
}
