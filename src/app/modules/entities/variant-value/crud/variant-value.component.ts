import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VariantTypeService } from '@core/services/variant-type.service';
import { TranslateModule } from '@ngx-translate/core';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { UploadFileComponent } from '@shared/components/upload-file/upload-file.component';
import { ApiResponse, VariantType, VariantValue } from '@types';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    UploadFileComponent,
    TypeaheadDropdownComponent,
  ],
})
export class VariantValueComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public variantTypes: VariantType[] = [];
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
    private _variantTypeService: VariantTypeService,
    private _fb: UntypedFormBuilder,
    private _router: Router,
    private _toastService: ToastService
  ) {
    this.variantValueForm = this._fb.group({
      _id: ['', []],
      order: [0, [Validators.required]],
      description: ['', [Validators.required]],
      type: ['', [Validators.required]],
      picture: [''],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    this.operation = pathUrl[3];
    const variantValueId = pathUrl[4];

    this.getVariantTypes();

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

  getVariantTypes(): Promise<void> {
    this.loading = true;
    return new Promise(() => {
      this._variantTypeService
        .find({ query: { operationType: { $ne: 'D' } } })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.variantTypes = result;
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.setValueForm();
          },
        });
    });
  }

  setValueForm(): void {
    const type = this.variantTypes?.find((item) => item._id === this.variantValue?.type?.toString());

    this.variantValueForm.patchValue({
      _id: this.variantValue?._id ?? '',
      order: this.variantValue?.order ?? 0,
      description: this.variantValue?.description ?? '',
      type: type ?? null,
      picture: this.variantValue?.picture ?? '',
    });
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

    await this.uploadFileComponent.uploadImages();

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

  updateVariantValue(): void {
    this._variantValueService
      .update(this.variantValue)
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

  deleteVariantValue() {
    this._variantValueService
      .delete(this.variantValue._id)
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

  onImagesUploaded(urls: string[]): void {
    if (urls && urls.length > 0) {
      this.variantValueForm.get('picture')?.setValue(urls[0]);
    }
  }
}
