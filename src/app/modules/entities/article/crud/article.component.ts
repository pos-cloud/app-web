import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { FormArray, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiResponse, Article, Make, UnitOfMeasurement } from '@types';

import { CommonModule } from '@angular/common';
import { ArticleService } from '@core/services/article.service';
import { CategoryService } from '@core/services/category.service';
import { MakeService } from '@core/services/make.service';
import { UnitOfMeasurementService } from '@core/services/unit-of-measurement.service';
import { TranslateModule } from '@ngx-translate/core';
import { UploadFileComponent } from '@shared/components/upload-file/upload-file.component';
import { ArticlePrintIn } from 'app/components/article/article';
import { Category } from 'app/components/category/category';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { QuillModule } from 'ngx-quill';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaxService } from '@core/services/tax.service';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { Tax } from 'app/components/tax/tax';
import Quill from 'quill';
import ImageResize from 'quill-image-resize';
Quill.register('modules/imageResize', ImageResize);

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
    UploadFileComponent,
    QuillModule,
    ProgressbarModule,
  ],
})
export class ArticleComponent implements OnInit {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public operation: string;
  public readonly: boolean;
  public article: Article;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public articleForm: UntypedFormGroup;
  private destroy$ = new Subject<void>();

  articleTaxes;

  public categories: Category[] = [];
  public makes: Make[] = [];
  public unitOfMeasurements: UnitOfMeasurement[] = [];
  public printIns: ArticlePrintIn[] = [
    ArticlePrintIn.Counter,
    ArticlePrintIn.Kitchen,
    ArticlePrintIn.Bar,
    ArticlePrintIn.Voucher,
  ];
  public quillConfig = {
    formats: ['bold', 'italic', 'underline', 'strike', 'list', 'link'],
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],

        [{ size: ['small', false, 'large', 'huge'] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }],

        ['clean'],
      ],
      imageResize: {
        displayStyles: {
          backgroundColor: 'black',
          border: 'none',
          color: 'white',
        },
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
      },
    },
    placeholder: 'Escribe aqui...',
    theme: 'snow',
    readOnly: false,
  };
  public taxes: Tax[] = [];

  constructor(
    private _articleService: ArticleService,
    private _categoryService: CategoryService,
    private _makeService: MakeService,
    private _unitOfMeasurementService: UnitOfMeasurementService,
    private _taxesService: TaxService,
    private _router: Router,
    private _fb: UntypedFormBuilder,
    private _toastService: ToastService
  ) {
    this.articleForm = this._fb.group({
      _id: ['', []],
      order: [1, []],
      code: ['', [Validators.required]],
      make: [null, []],
      category: [null, [Validators.required]],
      picture: ['', []],
      description: ['', [Validators.required]],
      posDescription: ['', [Validators.required, Validators.maxLength(20)]],
      unitOfMeasurement: [null, []],
      printIn: [ArticlePrintIn.Counter, []],
      favourite: [false, []],
      basePrice: ['', [Validators.required]],
      taxes: this._fb.array([]),
      codeProvider: ['', []],
      codeSAT: ['', []],
      currency: ['', []],
      costPrice: ['', [Validators.required]],
      costPrice2: [''],
      markupPercentage: ['', [Validators.required]],
      markupPriceWithoutVAT: [''],
      markupPrice: ['', [Validators.required]],
      salePrice: ['', [Validators.required]],
      salePriceWithoutVAT: [''],
      quantityPerMeasure: ['', []],
      children: this._fb.array([]),
      observation: ['', []],
      barcode: ['', []],
      allowPurchase: ['', []],
      allowSale: ['', []],
      allowStock: ['', []],
      allowSaleWithoutStock: ['', []],
      allowMeasure: ['', []],
      posKitchen: ['', []],
      isWeigth: ['', []],
      providers: ['', []],
      provider: ['', []],
      lastPricePurchase: [0.0, []],
      lastDatePurchase: [0.0, []],
      classification: ['', []],
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
      publishTiendaNube: [[false, []]],
      publishWooCommerce: [[false, []]],
    });
  }

  ngOnInit() {
    const pathUrl = this._router.url.split('/');
    const articleId = pathUrl[4];
    this.operation = pathUrl[3];

    if (pathUrl[3] === 'view' || pathUrl[3] === 'delete') this.articleForm.disable();

    this.loading = true;

    combineLatest({
      categories: this._categoryService.find({ query: { operationType: { $ne: 'D' } } }),
      makes: this._makeService.find({ query: { operationType: { $ne: 'D' } } }),
      unitOfMeasurements: this._unitOfMeasurementService.find({ query: { operationType: { $ne: 'D' } } }),
      taxes: this._taxesService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ categories, makes, unitOfMeasurements, taxes }) => {
          this.categories = categories || [];
          this.makes = makes || [];
          this.unitOfMeasurements = unitOfMeasurements || [];
          this.taxes = taxes || [];

          if (articleId) {
            this.getArticle(articleId);
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

  public setValueForm(): void {
    const category = this.categories?.find((item) => item._id === this.article?.category?.toString());
    const make = this.makes?.find((item) => item._id === this.article?.make?.toString());
    const unitOfMeasurement = this.unitOfMeasurements?.find(
      (item) => item._id === this.article?.unitOfMeasurement?.toString()
    );

    const values = {
      _id: this.article?._id ?? '',
      order: this.article?.order ?? 1,
      code: this.article?.code ?? 0,
      barcode: this.article?.barcode ?? '',
      make: make ?? null,
      category: category ?? null,
      description: this.article?.description ?? '',
      posDescription: this.article?.posDescription ?? '',
      unitOfMeasurement: unitOfMeasurement ?? null,
      printIn: this.article?.printIn,
      favourite: this.article?.favourite,
      observation: this.article?.observation,
      basePrice: this.article?.basePrice ?? 0,
      taxes: [],
      publishTiendaNube: this.article.publishTiendaNube ?? false,
      publishWooCommerce: this.article.publishWooCommerce ?? false,
    };
    this.articleForm.patchValue(values);

    const taxesArray = this.articleForm.get('taxes') as FormArray;
    this.article?.taxes?.forEach((tax) => {
      const taxObject = this.taxes?.find((t) => t._id === tax.tax.toString()) ?? null;
      taxesArray.push(
        this._fb.group({
          tax: [taxObject, Validators.required],
          percentage: [tax.percentage, Validators.required],
          taxBase: [tax.taxBase, Validators.required],
          taxAmount: [tax.taxAmount, Validators.required],
        })
      );
    });
  }

  public deleteArticleTax(index: number): void {
    (this.articleForm.get('taxes') as FormArray).removeAt(index);
  }

  returnTo() {
    return this._router.navigate(['/entities/articles']);
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

  async handleArticleOperation() {
    this.loading = true;
    this.articleForm.markAllAsTouched();
    if (this.articleForm.invalid) {
      this.loading = false;
      return;
    }

    await this.uploadFileComponent.uploadImages();

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

  onImagesUploaded(urls: string[]): void {
    if (urls && urls.length > 0) {
      this.articleForm.get('picture')?.setValue(urls[0]);
    }
  }

  loadPosDescription(): void {
    if (this.articleForm?.value?.posDescription === '') {
      this.articleForm.patchValue({
        posDescription: this.articleForm.value.description.slice(0, 20),
      });
    }
  }

  updatePrices(op): void {
    let taxedAmount = 0;

    // switch (op) {
    //   case 'basePrice':
    //     this.articleForm.value.costPrice = 0;
    //     taxedAmount = this.articleForm.value.basePrice;
    //     if (this.taxes && this.taxes.length > 0) {
    //       this.totalTaxes = 0;
    //       for (const articleTax of this.taxes) {
    //         if (articleTax.tax.percentage && articleTax.tax.percentage != 0) {
    //           articleTax.taxBase = taxedAmount;
    //           articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage) / 100);
    //           this.totalTaxes += articleTax.taxAmount;
    //         }
    //         this.articleForm.value.costPrice += articleTax.taxAmount;
    //       }
    //     }
    //     this.articleForm.value.costPrice += taxedAmount;
    //     if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
    //       this.articleForm.value.markupPrice = this.roundNumber.transform(
    //         (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
    //       );
    //       this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
    //     }
    //     break;
    //   case 'taxes':
    //     this.articleForm.value.costPrice = 0;
    //     taxedAmount = this.articleForm.value.basePrice;
    //     if (this.taxes && this.taxes.length > 0) {
    //       this.totalTaxes = 0;
    //       for (const articleTax of this.taxes) {
    //         this.articleForm.value.costPrice += articleTax.taxAmount;
    //         this.totalTaxes += articleTax.taxAmount;
    //       }
    //     }
    //     this.articleForm.value.costPrice += taxedAmount;
    //     if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
    //       this.articleForm.value.markupPrice = this.roundNumber.transform(
    //         (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
    //       );
    //       this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
    //     }
    //     break;
    //   case 'markupPercentage':
    //     if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
    //       this.articleForm.value.markupPrice = this.roundNumber.transform(
    //         (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
    //       );
    //       this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
    //     }
    //     break;
    //   case 'markupPrice':
    //     if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
    //       this.articleForm.value.markupPercentage = this.roundNumber.transform(
    //         (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100
    //       );
    //       this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
    //     }
    //     break;
    //   case 'salePrice':
    //     if (this.articleForm.value.basePrice === 0) {
    //       this.articleForm.value.costPrice === 0;
    //       this.articleForm.value.markupPercentage = 100;
    //       this.articleForm.value.markupPrice = this.articleForm.value.salePrice;
    //     } else {
    //       this.articleForm.value.markupPrice = this.articleForm.value.salePrice - this.articleForm.value.costPrice;
    //       this.articleForm.value.markupPercentage = this.roundNumber.transform(
    //         (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100
    //       );
    //     }
    //     break;
    //   default:
    //     break;
    // }

    // this.articleForm.value.basePrice = this.roundNumber.transform(this.articleForm.value.basePrice);
    // this.articleForm.value.costPrice = this.roundNumber.transform(this.articleForm.value.costPrice);
    // this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPercentage);
    // this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.markupPrice);
    // this.articleForm.value.salePrice = this.roundNumber.transform(this.articleForm.value.salePrice);
    // this.articleForm.value.salePriceTN = this.roundNumber.transform(this.articleForm.value.salePriceTN);
    // this.article = Object.assign(this.article, this.articleForm.value);
    // this.setValuesForm();
  }
}
