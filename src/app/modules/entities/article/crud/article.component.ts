import { Component, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Article } from '@types';

import { CommonModule } from '@angular/common';
import { ArticleService } from '@core/services/article.service';
import { CategoryService } from '@core/services/category.service';
import { TranslateModule } from '@ngx-translate/core';
import { Category } from 'app/components/category/category';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
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
export class ArticleComponent implements OnInit {
  public operation: string;
  public readonly: boolean;
  public article: Article;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public articleForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  public categories: Category[] = [];

  constructor(
    public _articleService: ArticleService,
    public _categoryService: CategoryService,
    public _router: Router,
    public _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.articleForm = this._fb.group({
      _id: ['', []],
      order: ['', []],
      code: ['', [Validators.required]],
      codeProvider: ['', []],
      codeSAT: ['', []],
      currency: ['', []],
      make: ['', []],
      description: ['', [Validators.required]],
      posDescription: ['', [Validators.maxLength(20)]],
      basePrice: ['', [Validators.required]],
      costPrice: ['', [Validators.required]],
      costPrice2: [''],
      markupPercentage: ['', [Validators.required]],
      markupPriceWithoutVAT: [''],
      markupPrice: ['', [Validators.required]],
      salePrice: ['', [Validators.required]],
      salePriceWithoutVAT: [''],
      category: ['', [Validators.required]],
      quantityPerMeasure: ['', []],
      unitOfMeasurement: ['', []],
      children: this._fb.array([]),
      observation: ['', []],
      barcode: ['', []],
      printIn: ['', []],
      allowPurchase: ['', []],
      allowSale: ['', []],
      allowStock: ['', []],
      allowSaleWithoutStock: ['', []],
      allowMeasure: ['', []],
      ecommerceEnabled: ['', []],
      posKitchen: ['', []],
      isWeigth: ['', []],
      favourite: ['', []],
      providers: ['', []],
      provider: ['', []],
      lastPricePurchase: [0.0, []],
      lastDatePurchase: [0.0, []],
      classification: ['', []],
      pictures: this._fb.array([]),
      applications: this._fb.array([]),
      url: ['', []],
      forShipping: ['', []],
      salesAccount: ['', []],
      purchaseAccount: ['', []],
      minStock: ['', []],
      maxStock: ['', []],
      pointOfOrder: ['', []],
      meliId: ['', []],
      wooId: ['', []],
      purchasePrice: ['', []],
      m3: ['', []],
      weight: ['', []],
      width: ['', []],
      height: ['', []],
      depth: ['', []],
      showMenu: ['', []],
      tiendaNubeId: ['', []],
      updateVariants: ['', []],
      variants: this._fb.array([]),
      salePriceTN: ['', []],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');

    const articleId = pathUrl[4];
    this.operation = pathUrl[3];
    this.getCategories();

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.articleForm.disable();
    if (articleId) this.getArticle(articleId);
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
    const account = this.categories?.find((item) => item._id === this.article?.category?.toString());

    const values = {
      _id: this.article._id ?? '',
      code: this.article.code ?? 0,
      category: account ?? null,
    };
    this.articleForm.setValue(values);
  }

  returnTo() {
    return this._router.navigate(['/entities/banks']);
  }

  getCategories(): Promise<void> {
    this.loading = true;
    return new Promise(() => {
      this._categoryService
        .getAll({ match: { operationType: { $ne: 'D' } } })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            this.categories = result.result;
            this.setValueForm();
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
          },
        });
    });
  }

  public getArticle(id: string) {
    this.loading = true;

    this._articleService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ApiResponse) => {
          this.article = result.result;
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

  public handleArticleOperation() {
    this.loading = true;
    this.articleForm.markAllAsTouched();
    if (this.articleForm.invalid) {
      this.loading = false;
      return;
    }

    this.article = this.articleForm.value;

    switch (this.operation) {
      case 'add':
        this.saveArticle();
        break;
      case 'update':
        this.updateArticle();
        break;
      case 'delete':
        this.deleteArticle();
      default:
        break;
    }
  }

  public saveArticle() {
    this._articleService
      .save(this.article)
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

  public updateArticle() {
    this._articleService
      .update(this.article)
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

  public deleteArticle() {
    this._articleService
      .delete(this.article._id)
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
