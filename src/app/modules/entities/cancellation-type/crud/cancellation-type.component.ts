import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, CancellationType, TransactionState, TransactionType } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { CommonModule } from '@angular/common';
import { CancellationTypeService } from '@core/services/cancellation-type.service';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { TranslateModule } from '@ngx-translate/core';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-cancellationType',
  templateUrl: './cancellation-type.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
  ],
})
export class CancellationTypeComponent implements OnInit, OnDestroy {
  public operation: string;
  public cancellationTypeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public cancellationType: CancellationType;
  private destroy$ = new Subject<void>();
  public origins: TransactionType[];
  public destinations: TransactionType[];

  constructor(
    private _cancellationTypeService: CancellationTypeService,
    private _transactionTypeService: TransactionTypeService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.cancellationTypeForm = this._fb.group({
      _id: ['', []],
      origin: [null, [Validators.required]],
      destination: [null, [Validators.required]],
      automaticSelection: [false, [Validators.required]],
      modifyBalance: [true, [Validators.required]],
      requestAutomatic: [false, [Validators.required]],
      requestCompany: [true, [Validators.required]],
      stateOrigin: [TransactionState.Closed, [Validators.required]],
      requestStatusOrigin: [TransactionState.Closed, [Validators.required]],
      updatePrices: [false, [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const cancelationTypeId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') this.cancellationTypeForm.disable();
    combineLatest({
      origins: this._transactionTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      destinations: this._transactionTypeService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ origins, destinations }) => {
          this.origins =
            origins.map((data) => ({
              name: `${data.transactionMovement} - ${data.name} `,
              _id: data._id,
            })) ?? [];
          this.destinations =
            destinations.map((data) => ({
              name: `${data.transactionMovement} - ${data.name}`,
              _id: data._id,
            })) ?? [];
          if (cancelationTypeId) {
            if (cancelationTypeId) this.getCancellationType(cancelationTypeId);
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

  getCancellationType(id: string): void {
    this._cancellationTypeService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.cancellationType = result.result;
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
    const origin = this.origins.find((origin) => origin._id === this.cancellationType?.origin?.toString());
    const destination = this.destinations.find(
      (destination) => destination._id === this.cancellationType?.destination?.toString()
    );
    this.cancellationTypeForm.patchValue({
      _id: this.cancellationType?._id ?? '',
      origin: origin ?? null,
      destination: destination ?? null,
      automaticSelection: this.cancellationType?.automaticSelection ?? false,
      modifyBalance: this.cancellationType?.modifyBalance ?? true,
      requestAutomatic: this.cancellationType?.requestAutomatic ?? false,
      requestCompany: this.cancellationType?.requestCompany ?? true,
      requestStatusOrigin: this.cancellationType?.requestStatusOrigin ?? TransactionState.Closed,
      stateOrigin: this.cancellationType?.stateOrigin ?? TransactionState.Closed,
      updatePrices: this.cancellationType?.updatePrices ?? false,
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/cancellation-types']);
  }

  async handleCancellationTypeOperation() {
    this.loading = true;

    this.cancellationTypeForm.markAllAsTouched();
    if (this.cancellationTypeForm.invalid) {
      this.loading = false;
      return;
    }

    this.cancellationType = this.cancellationTypeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveCancellationType();
        break;
      case 'update':
        this.updateCancellationType();
        break;
      case 'delete':
        this.deleteCancellationType();
        break;
    }
  }

  saveCancellationType(): void {
    this._cancellationTypeService
      .save(this.cancellationType)
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

  updateCancellationType(): void {
    this._cancellationTypeService
      .update(this.cancellationType)
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

  deleteCancellationType() {
    this._cancellationTypeService
      .delete(this.cancellationType._id)
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
