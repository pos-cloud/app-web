import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, VariantValue } from '@types';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VariantValueService } from '../../../../core/services/variant-value.service';

@Component({
  selector: 'app-variant-value',
  templateUrl: './variant-value.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FocusDirective, PipesModule, TranslateModule],
})
export class VariantValueComponent implements OnInit, AfterViewInit, OnDestroy {
  public operation: string;
  public variantValueForm: UntypedFormGroup;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public variantValue: VariantValue;
  private destroy$ = new Subject<void>();

  public selectedFile: File = null;
  public imageURL: string = '';

  constructor(
    private _variantValueService: VariantValueService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.variantValueForm = this._fb.group({
      _id: ['', []],
      type: ['', [Validators.required]],
      order: [0, [Validators.required]],
      description: ['', [Validators.required]],
      picture: [''],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const variantValueId = pathUrl[4];

    if (this.operation === 'view' || this.operation === 'delete') {
      this.variantValueForm.disable();
    }
    if (variantValueId) {
      this.getVariantValue(variantValueId);
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

  getVariantValue(id: string): void {
    this.loading = true;
    this._variantValueService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.variantValue = result.result;
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
    this.variantValueForm.patchValue({
      _id: this.variantValue._id ?? '',
      type: this.variantValue.type ?? '',
      order: this.variantValue.order ?? 0,
      description: this.variantValue.description ?? '',
      picture: this.variantValue.picture ?? '',
    });

    this.imageURL = this.variantValue.picture ?? '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      this.variantValueForm.patchValue({
        picture: this.selectedFile.name,
      });

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageURL = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  returnTo() {
    return this._router.navigate(['/entities/variant-values']);
  }

  async handleVariantValueOperation() {
    this.loading = true;

    this.variantValueForm.markAllAsTouched();
    if (this.variantValueForm.invalid) {
      this.loading = false;
      return;
    }

    this.variantValue = this.variantValueForm.value;

    switch (this.operation) {
      case 'add':
        this.saveVariantValue();
        break;
      case 'update':
        this.updateVariantValue();
        break;
      case 'delete':
        this.deleteVariantValue();
        break;
    }
  }

  saveVariantValue(): void {
    this._variantValueService
      .save(this.variantValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status === 200) {
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

  updateVariantValue(): void {
    this._variantValueService
      .update(this.variantValue)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status === 200) {
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

  deleteVariantValue() {
    this._variantValueService
      .delete(this.variantValue._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          if (result.status === 200) {
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
}
