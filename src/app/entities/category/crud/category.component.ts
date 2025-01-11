import { Component, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Category } from '@types';

import { CategoryService } from 'app/core/services/category.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
})
export class CategoryComponent implements OnInit {
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
      visibleOnSale: [false, []],
      visibleOnPurchase: [false, []],
    });
  }

  async ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const categoryId = pathUrl[4];
    this.operation = pathUrl[3];
    await this.getCategories();

    if (categoryId) this.getCategory(categoryId);
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public setValueForm(): void {
    const parent = this.categories?.find((item) => item._id === this.category?.parent?.toString());

    const values = {
      _id: this.category._id ?? '',
      order: this.category.order ?? 0,
      description: this.category.description ?? '',
      picture: this.category.picture ?? '',
      parent: parent ?? null,
      favourite: this.category.favourite ?? false,
      isRequiredOptional: this.category.isRequiredOptional ?? false,
      observation: this.category.observation ?? '',
      publishWooCommerce: this.category.publishWooCommerce ?? '',
      publishTiendaNube: this.category.publishTiendaNube ?? '',
      visibleInvoice: this.category.visibleInvoice ?? false,
      visibleOnSale: this.category.visibleOnSale ?? false,
      visibleOnPurchase: this.category.visibleOnPurchase ?? false,
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
        .getAll({})
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            this.categories = result.result;
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            resolve();
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
}
