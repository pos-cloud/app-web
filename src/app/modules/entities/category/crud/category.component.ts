import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UploadFileComponent } from '@shared/components/upload-file/upload-file.component';

import { ApiResponse, Category } from '@types';

import { CategoryService } from 'app/core/services/category.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FocusDirective,
    PipesModule,
    TranslateModule,
    TypeaheadDropdownComponent,
    UploadFileComponent,
  ],
})
export class CategoryComponent implements OnInit {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public operation: string;
  public readonly: boolean;
  public alertMessage: string = '';
  public userType: string;
  public category: Category;
  public categories: Category[];
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public categoryForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();
  public imageURL: string;

  constructor(
    public _categoryService: CategoryService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.categoryForm = this._fb.group({
      _id: ['', []],
      order: [0, []],
      description: ['', [Validators.required]],
      picture: ['', []],
      parent: [null, []],
      favourite: [false, []],
      isRequiredOptional: [false, []],
      observation: ['', []],
      publishWooCommerce: [false, []],
      publishTiendaNube: [false, []],
      visibleInvoice: [false, []],
      visibleOnSale: [true, []],
      visibleOnPurchase: [true, []],
      showMenu: [false, []],
      tiendaNubeId: [],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const categoryId = pathUrl[4];
    this.operation = pathUrl[3];
    this.getCategories();

    if (categoryId) this.getCategory(categoryId);
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
    const parent = this.categories?.find((item) => item._id === this.category?.parent?.toString());

    const values = {
      _id: this.category?._id ?? '',
      order: this.category?.order ?? 0,
      description: this.category?.description ?? '',
      picture: this.category?.picture ?? '',
      parent: parent ?? null,
      favourite: this.category?.favourite ?? false,
      isRequiredOptional: this.category?.isRequiredOptional ?? false,
      observation: this.category?.observation ?? '',
      publishWooCommerce: this.category?.publishWooCommerce ?? false,
      publishTiendaNube: this.category?.publishTiendaNube ?? false,
      visibleInvoice: this.category?.visibleInvoice ?? false,
      visibleOnSale: this.category?.visibleOnSale ?? true,
      visibleOnPurchase: this.category?.visibleOnPurchase ?? true,
      showMenu: this.category?.showMenu ?? false,
      tiendaNubeId: this.category?.tiendaNubeId ?? null,
    };
    this.categoryForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/categories']);
  }

  getCategories(): Promise<void> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this._categoryService
        .find({})
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: any) => {
            this.categories = result;
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

  public getCategory(categoryId: string) {
    this.loading = true;

    this._categoryService
      .getById(categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.category = result.result;
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

  public handleCategoryOperation() {
    this.loading = true;
    this.categoryForm.markAllAsTouched();
    if (this.categoryForm.invalid) {
      this.loading = false;
      return;
    }

    this.category = this.categoryForm.value;

    switch (this.operation) {
      case 'add':
        this.saveCategory();
        break;
      case 'update':
        this.updateCategory();
        break;
      case 'delete':
        this.deleteCategory();
      default:
        break;
    }
  }

  public updateCategory() {
    this._categoryService
      .update(this.category)
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

  public saveCategory() {
    this._categoryService
      .save(this.category)
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

  public deleteCategory() {
    this._categoryService
      .delete(this.category._id)
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

  onImagesUploaded(urls: string[]): void {
    if (urls && urls.length > 0) {
      this.categoryForm.get('picture')?.setValue(urls[0]);
    }
  }
}
