import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CashBoxTypeService } from '@core/services/cash-box-type.service';
import { TranslateModule } from '@ngx-translate/core';

import { ApiResponse, CashBoxType } from '@types';

import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-cash-box-types',
  templateUrl: 'cash-box-types.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class CashBoxTypeComponent implements OnInit {
  public operation: string;
  public cashBoxType: CashBoxType;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public cashBoxTypeForm: UntypedFormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    public _cashBoxTypeService: CashBoxTypeService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.cashBoxTypeForm = this._fb.group({
      _id: [''],
      name: ['', [Validators.required]],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const cashBoxType = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.cashBoxTypeForm.disable();

    if (cashBoxType) this.getCashBoxType(cashBoxType);
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
      _id: this.cashBoxType?._id ?? '',
      name: this.cashBoxType?.name ?? '',
    };

    this.cashBoxTypeForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/cash-box-types']);
  }

  public getCashBoxType(cashBoxTypeId: string) {
    this.loading = true;

    this._cashBoxTypeService
      .getById(cashBoxTypeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.cashBoxType = result.result;
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

  public handleCashBoxTypeOperation() {
    this.loading = true;
    this.cashBoxTypeForm.markAllAsTouched();
    if (this.cashBoxTypeForm.invalid) {
      this.loading = false;
      return;
    }

    this.cashBoxType = this.cashBoxTypeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveCashBoxType();
        break;
      case 'update':
        this.updateCashBoxType();
        break;
      case 'delete':
        this.deleteCashBoxType();
        break;
      default:
        break;
    }
  }

  public updateCashBoxType() {
    this._cashBoxTypeService
      .update(this.cashBoxType)
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

  public saveCashBoxType() {
    this._cashBoxTypeService
      .save(this.cashBoxType)
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

  public deleteCashBoxType() {
    this._cashBoxTypeService
      .delete(this.cashBoxType._id)
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
