import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, UnitOfMeasurement } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UnitOfMeasurementService } from 'app/core/services/unit-of-measurement.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-unit-of-measurement',
  templateUrl: './unit-of-measurement.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class UnitOfMeasurementComponent implements OnInit, OnDestroy {
  public operation: string;
  public unitForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public unit: UnitOfMeasurement;
  private destroy$ = new Subject<void>();

  constructor(
    private _unitService: UnitOfMeasurementService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.unitForm = this._fb.group({
      _id: ['', []],
      code: ['', [Validators.required]],
      abbreviation: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const unitId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') this.unitForm.disable();
    if (unitId) {
      this.getUnit(unitId);
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

  getUnit(id: string): void {
    this._unitService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.unit = result.result;
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
    this.unitForm.patchValue({
      _id: this.unit?._id ?? '',
      code: this.unit?.code ?? '',
      abbreviation: this.unit?.abbreviation ?? '',
      name: this.unit?.name ?? '',
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/unit-of-measurements']);
  }

  async handleUnitOperation() {
    this.loading = true;

    this.unitForm.markAllAsTouched();
    if (this.unitForm.invalid) {
      this.loading = false;
      return;
    }

    this.unit = this.unitForm.value;

    switch (this.operation) {
      case 'add':
        this.saveUnit();
        break;
      case 'update':
        this.updateUnit();
        break;
      case 'delete':
        this.deleteUnit();
        break;
    }
  }

  saveUnit(): void {
    this._unitService
      .save(this.unit)
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

  updateUnit(): void {
    this._unitService
      .update(this.unit)
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

  deleteUnit() {
    this._unitService
      .delete(this.unit._id)
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
