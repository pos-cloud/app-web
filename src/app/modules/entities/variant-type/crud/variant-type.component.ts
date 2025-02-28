import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, VariantType } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VariantTypeService } from '../../../../core/services/variant-type.service';

@Component({
  selector: 'app-variant-type',
  templateUrl: './variant-type.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class VariantTypeComponent implements OnInit, AfterViewInit, OnDestroy {
  public operation: string;
  public variantTypeForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public variantType: VariantType;
  private destroy$ = new Subject<void>();

  constructor(
    private _variantTypeService: VariantTypeService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.variantTypeForm = this._fb.group({
      _id: ['', []],
      order: [0, [Validators.required]],
      name: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const variantTypeId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') {
      this.variantTypeForm.disable();
    }
    if (variantTypeId) {
      this.getVariantType(variantTypeId);
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

  getVariantType(id: string): void {
    this._variantTypeService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.variantType = result.result;
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
    this.variantTypeForm.patchValue({
      _id: this.variantType?._id ?? '',
      order: this.variantType?.order ?? 0,
      name: this.variantType?.name ?? '',
      meliId: this.variantType?.meliId ?? '',
    });
  }

  returnTo() {
    return this._router.navigate(['/entities/variant-types']);
  }

  async handleVariantTypeOperation() {
    this.loading = true;

    this.variantTypeForm.markAllAsTouched();
    if (this.variantTypeForm.invalid) {
      this.loading = false;
      return;
    }

    this.variantType = this.variantTypeForm.value;

    switch (this.operation) {
      case 'add':
        this.saveVariantType();
        break;
      case 'update':
        this.updateVariantType();
        break;
      case 'delete':
        this.deleteVariantType();
        break;
    }
  }

  saveVariantType(): void {
    this._variantTypeService
      .save(this.variantType)
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

  updateVariantType(): void {
    this._variantTypeService
      .update(this.variantType)
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

  deleteVariantType() {
    this._variantTypeService
      .delete(this.variantType._id)
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
