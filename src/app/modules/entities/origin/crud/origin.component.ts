import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Branch, Origin } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';

import { CommonModule } from '@angular/common';
import { BranchService } from '@core/services/branch.service';
import { OriginService } from '@core/services/origin.service';
import { TranslateModule } from '@ngx-translate/core';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-origin',
  templateUrl: './origin.component.html',
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
export class OriginComponent implements OnInit, OnDestroy {
  public operation: string;
  public originForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public origin: Origin;
  private destroy$ = new Subject<void>();
  public branchs: Branch[];

  constructor(
    private _originService: OriginService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService,
    private _branchService: BranchService
  ) {
    this.originForm = this._fb.group({
      _id: ['', []],
      number: ['', [Validators.required]],
      branch: [null, [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const originId = pathUrl[4];
    if (this.operation === 'view' || this.operation === 'delete') this.originForm.disable();

    this.loading = true;
    combineLatest({
      branch: this._branchService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ branch }) => {
          this.branchs = branch ?? [];

          if (originId) {
            if (originId) this.getOrigin(originId);
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

  getOrigin(id: string): void {
    this._originService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.origin = result.result;
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
    const branch = this.branchs.find((branch) => branch?._id === this.origin?.branch?.toString());
    this.originForm.patchValue({
      _id: this?.origin?._id ?? '',
      number: this?.origin?.number ?? 0,
      branch: branch ?? null,
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/origins']);
  }

  async handleOriginOperation() {
    this.loading = true;

    this.originForm.markAllAsTouched();
    if (this.originForm.invalid) {
      this.loading = false;
      return;
    }

    this.origin = this.originForm.value;

    switch (this.operation) {
      case 'add':
        this.saveOrigin();
        break;
      case 'update':
        this.updateOrigin();
        break;
      case 'delete':
        this.deleteOrigin();
        break;
    }
  }

  saveOrigin(): void {
    this._originService
      .save(this.origin)
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

  updateOrigin(): void {
    this._originService
      .update(this.origin)
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

  deleteOrigin() {
    this._originService
      .delete(this.origin._id)
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
