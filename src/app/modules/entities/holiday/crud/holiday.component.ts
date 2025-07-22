import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Holiday } from '@types';

import { CommonModule } from '@angular/common';
import { HolidayService } from '@core/services/holiday.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class HolidayComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public holiday: Holiday;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public holidayForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    public _holidayService: HolidayService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.holidayForm = this._fb.group({
      _id: ['', []],
      name: ['', [Validators.required]],
      date: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const holiday = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.holidayForm.disable();
    if (holiday) this.getHoliday(holiday);
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
      _id: this.holiday?._id ?? '',
      name: this.holiday?.name ?? '',
      date: this.holiday?.date ? new Date(this.holiday.date).toISOString().substring(0, 10) : '',
    };
    this.holidayForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/holidays']);
  }

  onEnter() {
    console.log(this.holidayForm);
    if (this.holidayForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.handleHolidayOperation();
    }
  }

  public getHoliday(id: string) {
    this.loading = true;

    this._holidayService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.holiday = result.result;
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

  public handleHolidayOperation() {
    this.loading = true;
    this.holidayForm.markAllAsTouched();
    if (this.holidayForm.invalid) {
      this.loading = false;
      return;
    }

    this.holiday = this.holidayForm.value;

    switch (this.operation) {
      case 'add':
        this.saveHoliday();
        break;
      case 'update':
        this.updateHoliday();
        break;
      case 'delete':
        this.deleteHoliday();
      default:
        break;
    }
  }

  public updateHoliday() {
    this._holidayService
      .update(this.holiday)
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

  public saveHoliday() {
    this._holidayService
      .save(this.holiday)
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

  public deleteHoliday() {
    this._holidayService
      .delete(this.holiday._id)
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
