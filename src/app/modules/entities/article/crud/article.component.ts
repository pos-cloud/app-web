import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  Account,
  ApiResponse,
  Article,
  Category,
  Classification,
  Company,
  Config,
  Make,
  Tax,
  TaxBase,
  Taxes,
  Type,
  UnitOfMeasurement,
  VariantType,
  VariantValue,
} from '@types';

import { CommonModule, DecimalPipe } from '@angular/common';
import { ArticleService } from '@core/services/article.service';
import { CategoryService } from '@core/services/category.service';
import { MakeService } from '@core/services/make.service';
import { UnitOfMeasurementService } from '@core/services/unit-of-measurement.service';
import { TranslateModule } from '@ngx-translate/core';
import { UploadFileComponent } from '@shared/components/upload-file/upload-file.component';
import { ArticlePrintIn } from 'app/components/article/article';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { FocusDirective } from 'app/shared/directives/focus.directive';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { QuillModule } from 'ngx-quill';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AccountService } from '@core/services/account.service';
import { ClassificationService } from '@core/services/classification.service';
import { CompanyService } from '@core/services/company.service';
import { ConfigService } from '@core/services/config.service';
import { FileService } from '@core/services/file.service';
import { TaxService } from '@core/services/tax.service';
import { VariantTypeService } from '@core/services/variant-type.service';
import { VariantValueService } from '@core/services/variant-value.service';
import {
  HierarchicalItem,
  HierarchicalMultiSelectComponent,
} from '@shared/components/hierarchical-multi-select/hierarchical-multi-select.component';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { RoundNumberPipe } from '@shared/pipes/round-number.pipe';
import { Variant } from 'app/components/variant/variant';
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
    HierarchicalMultiSelectComponent,
    UploadFileComponent,
    QuillModule,
    ProgressbarModule,
    FormsModule,
  ],
  providers: [DecimalPipe],
})
export class ArticleComponent implements OnInit {
  @ViewChild(UploadFileComponent) uploadFileComponent: UploadFileComponent;

  public operation: string;
  public readonly: boolean;
  public article: Article;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public focusNoteEvent = new EventEmitter<boolean>();

  public articleForm: UntypedFormGroup;
  public config: Config;
  private destroy$ = new Subject<void>();
  public filesToUpload: Array<File>;
  public filesToArray: Array<File>;
  public hasChanged = false;
  public imageURL: string;
  public fileNamePrincipal: string;
  public fileNameArray: string;
  public articleTax: Taxes;
  public notes: string[];
  public tags: string[];
  public userType: string;
  public variant: Variant;
  public variantsByTypes: any[];
  public typeSelect = [];
  public filteredVariantTypes: any[] = [];
  public variantTypes: VariantType[];
  public variantType: VariantType[];
  public variantTypeSelected: VariantType;
  public variantValueSelected: VariantValue;
  public variantValues: VariantValue[];
  public allVariantValues: VariantValue[]; // Almacenar todos los valores disponibles
  public variants: Variant[] = new Array();
  public code: string;
  public accounts: Account[];

  public categories: Category[] = [];
  public categoriesTN: Category[] = [];
  public classifications: Classification[] = [];
  public makes: Make[] = [];
  public unitOfMeasurements: UnitOfMeasurement[] = [];
  public companies: Company[] = [];
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
  public taxForm: UntypedFormGroup;
  public totalTaxes: number = 0;
  public roundNumber: RoundNumberPipe = new RoundNumberPipe();

  public hierarchicalCategories;
  public categoriesDisplayText;

  constructor(
    private _articleService: ArticleService,
    private _categoryService: CategoryService,
    private _makeService: MakeService,
    private _unitOfMeasurementService: UnitOfMeasurementService,
    private _configService: ConfigService,
    private _taxesService: TaxService,
    private _router: Router,
    private _fb: UntypedFormBuilder,
    private _toastService: ToastService,
    public _fileService: FileService,
    private _classificationService: ClassificationService,
    private _companyService: CompanyService,
    private _variantTypeService: VariantTypeService,
    private _variantValueService: VariantValueService, //  private roundNumber: DecimalPipe
    private _accountService: AccountService
  ) {
    this.articleForm = this._fb.group({
      _id: ['', []],
      order: [1, []],
      type: [Type.Final, []],
      code: ['', [Validators.required]],
      make: [null, []],
      category: [null, [Validators.required]],
      picture: ['', []],
      picturePOS: ['', []],
      description: ['', [Validators.required]],
      posDescription: ['', [Validators.required, Validators.maxLength(20)]],
      unitOfMeasurement: [null, []],
      printIn: [ArticlePrintIn.Counter, []],
      favourite: [false, []],
      basePrice: [0, [Validators.required]],
      taxes: this._fb.array([]),
      codeProvider: ['', []],
      codeSAT: ['', []],
      currency: [null, []],
      costPrice: ['', [Validators.required]],
      costPrice2: [''],
      markupPercentage: ['', [Validators.required]],
      markupPriceWithoutVAT: [''],
      markupPrice: ['', [Validators.required]],
      salePrice: ['', [Validators.required]],
      salePriceWithoutVAT: [''],
      quantityPerMeasure: [1, []],
      children: this._fb.array([]),
      observation: ['', []],
      barcode: ['', []],
      allowPurchase: [true, []],
      allowSale: [true, []],
      allowStock: [true, []],
      allowSaleWithoutStock: [true, []],
      allowMeasure: [false, []],
      posKitchen: [false, []],
      isWeigth: [false, []],
      providers: ['', []],
      provider: ['', []],
      lastPricePurchase: [0.0, []],
      lastDatePurchase: [0.0, []],
      classification: ['', []],
      url: ['', []],
      forShipping: [false, []],
      salesAccount: [null, []],
      purchaseAccount: [null, []],
      minStock: ['', []],
      maxStock: ['', []],
      pointOfOrder: ['', []],
      meliId: ['', []],
      wooId: ['', []],
      purchasePrice: [0, []],
      m3: ['', []],
      weight: ['', [Validators.min(0)]],
      width: ['', [Validators.min(0)]],
      height: ['', [Validators.min(0)]],
      depth: ['', [Validators.min(0)]],
      showMenu: [false, []],
      tiendaNubeId: ['', []],
      updateVariants: [true, []],
      variants: this._fb.array([]),
      salePriceTN: [0, []],
      publishTiendaNube: [false, []],
      publishWooCommerce: [false, []],
      pictures: this._fb.array([]),
      season: ['', []],
      typeTN: [true, []],
      categoryTN: [[], []],
      seoTitleTN: ['', []],
      seoDescriptionTN: ['', []],
      videoUrlTN: ['', []],
    });

    this.taxForm = this._fb.group({
      tax: [null, [Validators.required]],
      percentage: [0, []],
      taxAmount: [0, []],
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
      classifications: this._classificationService.find({ query: { operationType: { $ne: 'D' } } }),
      companies: this._companyService.find({ query: { type: 'Proveedor', operationType: { $ne: 'D' } } }),
      variantTypes: this._variantTypeService.find({ query: { operationType: { $ne: 'D' } } }),
      variantValues: this._variantValueService.find({ query: { operationType: { $ne: 'D' } } }),
      config: this._configService.find({ query: { operationType: { $ne: 'D' } } }),
      code: this._articleService.getLasCode(),
      accounts: this._accountService.find({ query: { operationType: { $ne: 'D' } } }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({
          categories,
          makes,
          unitOfMeasurements,
          taxes,
          classifications,
          companies,
          variantTypes,
          config,
          variantValues,
          code,
          accounts,
        }) => {
          this.categories = categories || [];

          this.makes = makes || [];
          this.unitOfMeasurements = unitOfMeasurements || [];
          this.taxes = taxes || [];
          this.classifications = classifications || [];
          this.companies = companies || [];
          this.variantTypes = variantTypes || [];
          this.config = config || [];
          this.variantValues = variantValues || [];
          this.allVariantValues = variantValues || [];
          this.code = code.code;
          this.accounts = accounts;

          if (articleId) {
            this.getArticle(articleId);
          } else {
            this.setValueForm();
            this.setValueFormTax();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.processHierarchicalCategories();
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
    // Configurar propiedades del artículo
    this.notes = this.article?.notes || [];
    this.tags = this.article?.tags || [];

    let codeArticle;
    if (this.operation === 'add' || this.operation === 'copy') {
      codeArticle = !this.code ? this.padString(1, this.config.article.code.validators.maxLength) : this.code;
    } else {
      codeArticle = this.article.code;
    }

    // Filtrar tipos de variantes si el artículo tiene variantes
    if (this.article?.variants && this.article.variants.length > 0) {
      const variantTypeIds = this.article.variants.map((item) =>
        typeof item.type === 'string' ? item.type : item.type._id
      );
      const uniqueTypeIds = [...new Set(variantTypeIds)];
      this.variantTypes = this.variantTypes.filter((variantType: any) => uniqueTypeIds.includes(variantType._id));
    }

    // Buscar objetos relacionados
    const category = this.categories?.find((item) => item._id === this.article?.category?.toString());
    const classification = this.classifications?.find((item) => item._id === this.article?.classification?.toString());
    const make = this.makes?.find((item) => item._id === this.article?.make?.toString());
    const unitOfMeasurement = this.unitOfMeasurements?.find(
      (item) => item._id === this.article?.unitOfMeasurement?.toString()
    );
    const provider = this.companies?.find((item) => item._id === this.article?.provider?.toString());
    const salesAccounts = this.accounts?.find((item) => item._id === this.article?.salesAccount?.toString());
    const purchaseAccounts = this.accounts?.find((item) => item._id === this.article?.purchaseAccount?.toString());

    const values = {
      _id: this.article?._id ?? '',
      type: this.article?.type ?? Type.Final,
      order: this.article?.order ?? 1,
      code: codeArticle,
      barcode: this.article?.barcode ?? '',
      make: make ?? null,
      category: category ?? null,
      description: this.article?.description ?? '',
      posDescription: this.article?.posDescription ?? '',
      unitOfMeasurement: unitOfMeasurement ?? null,
      printIn: this.article?.printIn ?? ArticlePrintIn.Counter,
      favourite: this.article?.favourite ?? false,
      observation: this.article?.observation ?? '',
      basePrice: this.article?.basePrice ?? 0,
      purchasePrice: this.article?.purchasePrice ?? 0,
      costPrice2: this.article?.costPrice2 ?? 0,
      costPrice: this.article?.costPrice ?? 0,
      markupPercentage: this.article?.markupPercentage ?? 0,
      markupPrice: this.article?.markupPrice ?? 0,
      salePrice: this.article?.salePrice ?? 0,
      markupPriceWithoutVAT: 0, // Campo calculado
      salePriceWithoutVAT: 0, // Campo calculado
      classification: classification ?? null,
      provider: provider ?? null,
      taxes: [],
      publishTiendaNube: this.article?.publishTiendaNube ?? false,
      publishWooCommerce: this.article?.publishWooCommerce ?? false,
      season: this.article?.season ?? '',
      allowPurchase: this.article?.allowPurchase ?? true,
      allowSale: this.article?.allowSale ?? true,
      allowStock: this.article?.allowStock ?? true,
      allowSaleWithoutStock: this.article?.allowSaleWithoutStock ?? true,
      isWeigth: this.article?.isWeigth ?? false,
      quantityPerMeasure: this.article?.quantityPerMeasure ?? 1,
      allowMeasure: this.article?.allowMeasure ?? false,
      posKitchen: this.article?.posKitchen ?? false,
      codeProvider: this.article?.codeProvider ?? '',
      updateVariants: this.article?.updateVariants ?? true,
      weight: this.article?.weight ?? '',
      width: this.article?.width ?? '',
      height: this.article?.height ?? '',
      depth: this.article?.depth ?? '',
      m3: this.article?.m3 ?? '',
      showMenu: this.article?.showMenu ?? false,
      tiendaNubeId: this.article?.tiendaNubeId ?? null,
      wooId: this.article?.wooId ?? null,
      salePriceTN: this.article?.salePriceTN ?? 0,
      picture: this.article?.picture ?? '',
      picturePOS: this.article?.picturePOS ?? '',
      typeTN: this.article?.typeTN ?? true,
      categoryTN: Array.isArray(this.article?.categoryTN)
        ? this.article.categoryTN.map((id: any) => id?.toString())
        : [],
      seoTitleTN: this.article?.seoTitleTN ?? '',
      seoDescriptionTN: this.article?.seoDescriptionTN ?? '',
      videoUrlTN: this.article?.videoUrlTN ?? '',
      salesAccount: salesAccounts ?? null,
      purchaseAccount: purchaseAccounts ?? null,
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

    if (this.article?.pictures && this.article?.pictures?.length > 0) {
      let pictures = this.articleForm.get('pictures') as FormArray;

      this.article?.pictures?.forEach((x) => {
        pictures.push(
          this._fb.group({
            _id: null,
            picture: x?.picture,
          })
        );
      });
    }

    // Cargar variantes existentes
    if (this.article?.variants?.length > 0 && this.variantTypes.length > 0) {
      this.loadExistingVariants();
    }
  }

  public setValueFormTax(): void {
    // Si no existe, inicializamos el objeto completo
    if (!this.articleTax) {
      this.articleTax = {
        _id: '',
        tax: null,
        percentage: 0,
        taxAmount: 0,
        taxBase: 0,
      };
    }

    // Valores que se van a setear en el Form
    const values = {
      tax: this.articleTax.tax,
      percentage: this.articleTax.percentage,
      taxAmount: this.articleTax.taxAmount,
    };

    this.taxForm.setValue(values);
  }

  public changeTax(op: string): void {
    if (this.taxForm.value.tax) {
      let taxedAmount = 0;

      if (this.article) {
        taxedAmount = this.article.basePrice;
      }

      switch (op) {
        case 'tax':
          this.articleTax.tax = this.taxForm.value.tax;
          this.articleTax.percentage = this.articleTax.tax.percentage;
          this.articleTax.taxAmount = this.articleTax.tax.amount;
          if (this.articleTax.percentage && this.articleTax.percentage !== 0) {
            if (this.articleTax.tax.taxBase === TaxBase.Neto) {
              console.log(this.roundNumber.transform(taxedAmount));
              this.articleTax.taxBase = Number(this.roundNumber.transform(taxedAmount));
              this.articleTax.taxAmount = Number(
                this.roundNumber.transform((this.articleTax.taxBase * this.articleTax.percentage) / 100)
              );
            }
          }
          break;
        case 'percentage':
          this.articleTax.tax = this.taxForm.value.tax;
          this.articleTax.percentage = this.taxForm.value.percentage;
          this.articleTax.taxAmount = this.articleTax.tax.amount;
          if (this.articleTax.percentage && this.articleTax.percentage !== 0) {
            if (this.articleTax.tax.taxBase === TaxBase.Neto) {
              this.articleTax.taxBase = parseFloat(this.roundNumber.transform(taxedAmount) as any);

              this.articleTax.taxAmount = parseFloat(
                this.roundNumber.transform((this.articleTax.taxBase * this.articleTax.percentage) / 100) as any
              );
            }
          }
          break;
        case 'taxAmount':
          this.articleTax.tax = this.taxForm.value.tax;
          this.articleTax.taxAmount = this.taxForm.value.taxAmount;
          if (this.articleTax.percentage && this.articleTax.percentage !== 0) {
            if (this.articleTax.tax.taxBase === TaxBase.Neto) {
              this.articleTax.taxBase = parseFloat(this.roundNumber.transform(taxedAmount) as any);

              this.taxForm.value.percentage = this.roundNumber.transform(
                (this.articleTax.taxAmount * 100) / this.articleTax.taxBase
              );
              this.articleTax.percentage = this.taxForm.value.percentage;
            }
          }
          break;
        default:
          break;
      }
      // No reseteamos el formulario del artículo ni los typeahead al cambiar impuestos
      // Solo reflejamos los valores calculados en el formulario de impuestos
      this.taxForm.patchValue(
        {
          tax: this.articleTax.tax,
          percentage: this.articleTax.percentage,
          taxAmount: this.articleTax.taxAmount,
        },
        { emitEvent: false }
      );
    }
  }

  public deleteArticleTax(index: number): void {
    (this.articleForm.get('taxes') as FormArray).removeAt(index);
    this.updatePrices('taxes');
  }

  /**
   * Carga las variantes existentes del artículo en el FormArray
   */
  private loadExistingVariants(): void {
    const variantsArray = this.articleForm.get('variants') as FormArray;

    // Limpiar el array existente
    while (variantsArray.length !== 0) {
      variantsArray.removeAt(0);
    }

    this.article.variants.forEach((variant) => {
      const selectedType = this.variantTypes.find(
        (variantType) => variantType._id === (typeof variant.type === 'string' ? variant.type : variant.type._id)
      );

      const selectedValue = this.variantValues.find((variantValue) => {
        const valueId = typeof variant.value === 'string' ? variant.value : variant.value._id;
        return variantValue._id === valueId;
      });

      if (selectedType && selectedValue) {
        variantsArray.push(
          this._fb.group({
            type: [selectedType, Validators.required],
            value: [selectedValue, Validators.required],
          })
        );
      }
    });

    // Actualizar la vista agrupada por tipos
    this.setVariantByType(variantsArray.value);
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
          if (this.operation === 'copy') delete this.article._id;
          this.setValueForm();
          this.setValueFormTax();
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

    this.article = { ...this.article, ...this.articleForm.value };

    switch (this.operation) {
      case 'add':
      case 'copy':
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

  public addArticleTax(): void {
    if (this.taxForm.valid && this.taxForm.value.tax) {
      const selectedTax = this.taxForm.value.tax;
      const percentage = this.taxForm.value.percentage || 0;
      const taxAmount = this.taxForm.value.taxAmount || 0;

      // Verificar si el impuesto ya existe
      const taxesArray = this.articleForm.get('taxes') as FormArray;
      const taxExists = taxesArray.controls.some((control) => control.get('tax')?.value?._id === selectedTax._id);

      if (taxExists) {
        this._toastService.showToast({
          type: 'info',
          message: `El impuesto ${selectedTax.name} ya existe`,
        });
        return;
      }

      // Agregar el impuesto al FormArray
      taxesArray.push(
        this._fb.group({
          tax: [selectedTax, Validators.required],
          percentage: [percentage, Validators.required],
          taxBase: [this.articleForm.get('basePrice')?.value || 0, Validators.required],
          taxAmount: [taxAmount, Validators.required],
        })
      );

      // Limpiar el formulario
      this.taxForm.reset();
      this.taxForm.patchValue({
        percentage: 0,
        taxAmount: 0,
      });

      this._toastService.showToast({
        type: 'success',
        message: `Impuesto ${selectedTax.name} agregado correctamente`,
      });

      // Actualizar los precios después de agregar el impuesto
      this.updatePrices('taxes');
    } else {
      this._toastService.showToast({
        type: 'warning',
        message: 'Por favor seleccione un impuesto',
      });
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
    // Solo actualizar si hay URLs nuevas, no si el array está vacío

    this.articleForm.get('picture')?.setValue(urls.length > 0 ? urls[0] : '');
    this.articleForm.get('picturePOS')?.setValue(urls.length > 0 ? urls[0] : '');
  }

  loadPosDescription(): void {
    if (this.articleForm?.value?.posDescription === '') {
      this.articleForm.patchValue({
        posDescription: this.articleForm.value.description.slice(0, 20),
      });
    }
  }

  updatePrices(op: string): void {
    let taxedAmount = 0;
    const taxesArray = this.articleForm.get('taxes') as FormArray;

    switch (op) {
      case 'basePrice':
        this.articleForm.patchValue({ costPrice: 0 });
        taxedAmount = this.articleForm.value.basePrice;

        if (taxesArray && taxesArray.length > 0) {
          this.totalTaxes = 0;
          taxesArray.controls.forEach((taxControl) => {
            const tax = taxControl.get('tax')?.value;
            const percentage = taxControl.get('percentage')?.value;
            if (tax && percentage && percentage !== 0) {
              taxControl.patchValue({ taxBase: taxedAmount });
              const taxAmount = this.roundNumber.transform((taxedAmount * percentage) / 100);
              taxControl.patchValue({ taxAmount: taxAmount });
              this.totalTaxes += parseFloat(taxAmount.toString());
            }
            this.articleForm.patchValue({
              costPrice: this.articleForm.value.costPrice + parseFloat(taxControl.get('taxAmount')?.value || 0),
            });
          });
        }
        this.articleForm.patchValue({
          costPrice: this.articleForm.value.costPrice + taxedAmount,
        });

        if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
          const markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
          );
          this.articleForm.patchValue({
            markupPrice: markupPrice,
            salePrice: this.articleForm.value.costPrice + parseFloat(markupPrice.toString()),
          });
        }
        break;

      case 'taxes':
        this.articleForm.patchValue({ costPrice: 0 });
        taxedAmount = this.articleForm.value.basePrice;

        if (taxesArray && taxesArray.length > 0) {
          this.totalTaxes = 0;
          taxesArray.controls.forEach((taxControl) => {
            this.articleForm.patchValue({
              costPrice: this.articleForm.value.costPrice + parseFloat(taxControl.get('taxAmount')?.value || 0),
            });
            this.totalTaxes += parseFloat(taxControl.get('taxAmount')?.value || 0);
          });
        }

        this.articleForm.patchValue({
          costPrice: this.articleForm.value.costPrice + taxedAmount,
        });

        if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
          const markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
          );
          this.articleForm.patchValue({
            markupPrice: markupPrice,
            salePrice: this.articleForm.value.costPrice + parseFloat(markupPrice.toString()),
          });
        }
        break;

      case 'markupPercentage':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          const markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
          );
          this.articleForm.patchValue({
            markupPrice: markupPrice,
            salePrice: this.articleForm.value.costPrice + parseFloat(markupPrice.toString()),
          });
        }
        break;

      case 'markupPrice':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          const markupPercentage = this.roundNumber.transform(
            (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100
          );
          this.articleForm.patchValue({
            markupPercentage: markupPercentage,
            salePrice: this.articleForm.value.costPrice + this.articleForm.value.markupPrice,
          });
        }
        break;

      case 'salePrice':
        if (this.articleForm.value.basePrice === 0) {
          this.articleForm.patchValue({
            costPrice: 0,
            markupPercentage: 100,
            markupPrice: this.articleForm.value.salePrice,
          });
        } else {
          const markupPrice = this.articleForm.value.salePrice - this.articleForm.value.costPrice;
          const markupPercentage = this.roundNumber.transform((markupPrice / this.articleForm.value.costPrice) * 100);
          this.articleForm.patchValue({
            markupPrice: markupPrice,
            markupPercentage: markupPercentage,
          });
        }
        break;

      default:
        break;
    }

    // Redondear todos los valores
    this.articleForm.value.basePrice = this.roundNumber.transform(this.articleForm.value.basePrice);
    this.articleForm.value.costPrice = this.roundNumber.transform(this.articleForm.value.costPrice);
    this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPercentage);
    this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.markupPrice);
    this.articleForm.value.salePrice = this.roundNumber.transform(this.articleForm.value.salePrice);
    this.articleForm.value.salePriceTN = this.roundNumber.transform(this.articleForm.value.salePriceTN);
    // Actualizar el artículo
    this.article = { ...this.article, ...this.articleForm.value };
  }

  addTag(tag: string): void {
    tag = tag.toUpperCase();
    if (!this.tags) this.tags = new Array();
    if (tag && tag !== '') {
      if (this.tags.indexOf(tag) == -1) {
        this.tags.push(tag);
      } else {
        this._toastService.showToast({
          type: 'success',
          message: 'La nota ingresada ya existe.',
        });
      }
    } else {
      this._toastService.showToast({
        type: 'success',
        message: 'Debe ingresar un valór válido.',
      });
    }
  }

  deleteTag(tag: string): void {
    tag = tag.toUpperCase();
    if (tag) this.tags.splice(this.tags.indexOf(tag), 1);
  }

  addNote(note: string): void {
    note = note.toUpperCase();
    if (!this.notes) this.notes = new Array();
    if (note && note !== '') {
      if (this.notes.indexOf(note) == -1) {
        this.notes.push(note);
      } else {
        this._toastService.showToast({
          type: 'success',
          message: 'La nota ingresada ya existe.',
        });
      }
    } else {
      this._toastService.showToast({
        type: 'success',
        message: 'Debe ingresar un valór válido.',
      });
    }
  }

  deleteNote(note: string): void {
    note = note.toUpperCase();
    if (note) this.notes.splice(this.notes.indexOf(note), 1);
  }

  fileChangeEvent(event: any, eCommerce: boolean): void {
    if (eCommerce) {
      this.filesToArray = <Array<File>>event.target.files;
      this.fileNameArray = this.filesToArray[0].name;
    } else {
      this.filesToUpload = <Array<File>>event.target.files;
      this.fileNamePrincipal = this.filesToUpload[0].name;

      if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imageURL = e.target.result;
        };
        // Coloca la siguiente línea fuera del evento onload
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }

  async addPicture() {
    if (this.filesToArray && this.filesToArray.length > 0) {
      try {
        const result = await this._fileService.uploadImage('article', this.filesToArray);
        if (result) {
          let response;
          try {
            // Intentar parsear la respuesta como JSON
            response = JSON.parse(result as string);
          } catch (parseError) {
            response = { url: result };
          }

          // Verificar si tenemos una URL válida
          if (response && (response.url || typeof response === 'string')) {
            const imageUrl = response.url || response;

            // Agregar la imagen al array de pictures
            this.addPictureArray(imageUrl);
            this._toastService.showToast({
              type: 'success',
              message: 'Imagen agregada correctamente',
            });
            // Limpiar el input de archivo
            this.fileNameArray = '';
            this.filesToArray = [];
          } else {
            this._toastService.showToast({
              type: 'error',
              message: 'Respuesta del servidor no válida',
            });
          }
        } else {
          this._toastService.showToast({
            type: 'error',
            message: 'No se recibió respuesta del servidor',
          });
        }
      } catch (error) {
        this._toastService.showToast({
          type: 'error',
          message: 'Error al subir la imagen: ' + (error.message || error),
        });
      }
    } else {
      this._toastService.showToast({
        type: 'warning',
        message: 'Por favor seleccione una imagen',
      });
    }
  }

  async addPictureArray(picture: string) {
    const pictures = this.articleForm.get('pictures') as FormArray;

    pictures.push(
      this._fb.group({
        _id: null,
        picture: picture,
      })
    );
  }

  async deletePicture(index: number, picture: string) {
    if (index !== null) {
      let control = <FormArray>this.articleForm.get('pictures');
      control.removeAt(index);
    } else {
      this.article.picture = './../../../assets/img/default.jpg';
    }

    await this.deleteFile(picture);
  }

  async deleteFile(pictureDelete: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this._fileService.deleteImage(pictureDelete).subscribe(
        (result) => {
          resolve(true);
        },
        (error) => {
          this._toastService.showToast(error.messge);
          resolve(true);
        }
      );
    });
  }

  public addVariant(variantsForm: NgForm): void {
    if (!variantsForm.valid || !variantsForm.value.type || !variantsForm.value.value) {
      this._toastService.showToast({
        type: 'warning',
        message: 'Por favor seleccione un tipo y valor de variante',
      });
      return;
    }

    const newVariant = {
      type: variantsForm.value.type,
      value: variantsForm.value.value,
    };

    // Verificar si la variante ya existe
    if (this.variantExists(newVariant)) {
      this._toastService.showToast({
        type: 'info',
        message: `La variante ${newVariant.type.name} - ${newVariant.value.description} ya existe`,
      });
      return;
    }

    // Verificar límite de tipos de variantes (máximo 2 tipos diferentes)
    const variantsArray = this.articleForm.get('variants') as FormArray;
    const existingTypes = new Set(variantsArray.value.map((v) => v.type._id));

    if (!existingTypes.has(newVariant.type._id) && existingTypes.size >= 2) {
      this._toastService.showToast({
        type: 'info',
        message: 'No puedes agregar más de dos tipos de variantes diferentes',
      });
      return;
    }

    // Agregar la nueva variante al FormArray
    variantsArray.push(
      this._fb.group({
        _id: [null],
        type: [newVariant.type, Validators.required],
        value: [newVariant.value, Validators.required],
      })
    );

    // Actualizar la vista agrupada
    this.setVariantByType(variantsArray.value);

    // Limpiar solo el valor seleccionado y mantener el tipo
    if (variantsForm && variantsForm.controls && variantsForm.controls['value']) {
      variantsForm.controls['value'].reset();
    }

    this.variantValueSelected = null;
    this.getVariantValuesByType(this.variantTypeSelected);

    this._toastService.showToast({
      type: 'success',
      message: `Variante ${newVariant.type.name} - ${newVariant.value.description} agregada correctamente`,
    });
  }

  public setValueVariants(): void {
    if (!this.variant.type) this.variant.type = null;
    if (!this.variant.value) this.variant.value = null;
    const variantsArray = this.articleForm.get('variants') as FormArray;

    const variantGroup = this._fb.group({
      type: [this.variant.type, Validators.required],
      value: [this.variant.value, Validators.required],
    });

    variantsArray.push(variantGroup);
  }

  public variantExists(variant: any): boolean {
    const variantsArray = this.articleForm.get('variants') as FormArray;

    return variantsArray.value.some(
      (existingVariant) =>
        existingVariant.type._id === variant.type._id && existingVariant.value._id === variant.value._id
    );
  }

  public deleteVariant(variant: any): void {
    const variantsArray = this.articleForm.get('variants') as FormArray;
    const variantData = {
      ...variant,
      type: this.variantTypes.find((type) => type._id === variant.type),
    };
    // Encontrar el índice de la variante en el FormArray
    const variantIndex = variantsArray.value.findIndex(
      (v) => v.type._id === variantData.type._id && v.value._id === variantData._id
    );
    if (variantIndex === -1) {
      this._toastService.showToast({
        type: 'error',
        message: 'No se encontró la variante a eliminar',
      });
      return;
    }

    // Verificar si es la última variante de ese tipo
    const sameTypeVariants = variantsArray.value.filter((v) => v.type._id === variantData.type._id);

    if (sameTypeVariants.length === 1) {
      this._toastService.showToast({
        type: 'info',
        message: 'No se puede eliminar la única variante de este tipo',
      });
      return;
    }

    // Eliminar del FormArray
    variantsArray.removeAt(variantIndex);

    // Actualizar la vista agrupada
    this.setVariantByType(variantsArray.value);

    this._toastService.showToast({
      type: 'success',
      message: `Variante ${variantData.type.name} - ${variantData.description} eliminada correctamente`,
    });
  }

  private setVariantByType(variants: any[]): void {
    // Crear un mapa para almacenar los valores únicos por tipo
    const typeMap = new Map<string, { type: any; value: any[] }>();

    // Procesar cada variante
    for (let variant of variants) {
      const typeId = variant.type._id;

      if (typeMap.has(typeId)) {
        // Si el tipo ya existe, agregar el valor si no está ya presente
        let existing = typeMap.get(typeId);
        const existingValues = existing.value;
        const valueExists = existingValues.some((val) => val._id === variant.value._id);

        if (!valueExists) {
          existingValues.push(variant.value);
        }
      } else {
        // Si el tipo no existe, agregar un nuevo tipo con su valor
        typeMap.set(typeId, {
          type: variant.type,
          value: [variant.value],
        });
      }
    }

    // Convertir el mapa a un array
    this.variantsByTypes = Array.from(typeMap.values());
  }

  public refreshValues(): void {
    if (this.variantTypeSelected) {
      // Filtrar los valores de variantes que pertenecen al tipo seleccionado
      // desde todos los valores disponibles
      this.variantValues = this.allVariantValues.filter((value) => {
        // Verificar diferentes estructuras posibles
        let typeId = null;

        if (value.type) {
          // Si type es un objeto
          if (typeof value.type === 'object' && value.type._id) {
            typeId = value.type._id;
          }
          // Si type es un string (ID)
          else if (typeof value.type === 'string') {
            typeId = value.type;
          }
        }

        return typeId === this.variantTypeSelected._id;
      });
    } else {
      this.variantValues = [];
    }
  }

  public getVariantValuesByType(variantType: VariantType): void {
    if (!variantType) {
      this.variantValues = [];
      return;
    }

    // Filtrar los valores de variantes que pertenecen al tipo seleccionado
    // desde todos los valores disponibles
    this.variantValues = this.allVariantValues.filter((value) => {
      let typeId = null;

      if (value.type) {
        // Si type es un objeto
        if (typeof value.type === 'object' && value.type._id) {
          typeId = value.type._id;
        }
        // Si type es un string (ID)
        else if (typeof value.type === 'string') {
          typeId = value.type;
        }
      }

      return typeId === variantType._id;
    });
  }

  padString(n, length) {
    n = n.toString();
    while (n.length < length) {
      n = '0' + n;
    }

    return n;
  }

  public processHierarchicalCategories(): void {
    // Crear lista plana con niveles jerárquicos
    const hierarchicalItems: HierarchicalItem[] = [];
    let categoriesTN = this.categories.filter((category) => category.tiendaNubeId) || [];
    // Primero agregar categorías raíz (level 0)
    categoriesTN
      .filter((category) => !category.parent)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((category) => {
        hierarchicalItems.push({
          _id: category.tiendaNubeId.toString(),
          name: category.description,
          level: 0,
        });
      });

    // Luego agregar categorías hijas (level 1)
    categoriesTN
      .filter((category) => category.parent)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .forEach((category) => {
        hierarchicalItems.push({
          _id: category.tiendaNubeId.toString(),
          name: category.description,
          level: 1,
        });
      });
    this.hierarchicalCategories = hierarchicalItems;
    this.updateCategoriesDisplayText();
  }

  public updateCategoriesDisplayText(): void {
    const selectedCount = this.articleForm.get('categoryTN')?.value?.length || 0;
    if (selectedCount === 0) {
      this.categoriesDisplayText = '';
    } else {
      this.categoriesDisplayText = `Items + ${selectedCount} seleccionados`;
    }
  }

  public onEnter(): void {
    const isInQuill = event.target instanceof HTMLDivElement && event.target.classList.contains('ql-editor');

    if (isInQuill) {
      event.preventDefault();
      return;
    }

    if (this.articleForm.valid) {
      this.handleArticleOperation();
    }
  }
}
