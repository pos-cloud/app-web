import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  ApiResponse,
  Article,
  Classification,
  Company,
  Config,
  Make,
  UnitOfMeasurement,
  VariantType,
  VariantValue,
} from '@types';

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

import { ClassificationService } from '@core/services/classification.service';
import { CompanyService } from '@core/services/company.service';
import { ConfigService } from '@core/services/config.service';
import { FileService } from '@core/services/file.service';
import { TaxService } from '@core/services/tax.service';
import { VariantTypeService } from '@core/services/variant-type.service';
import { VariantValueService } from '@core/services/variant-value.service';
import { ProgressbarModule } from '@shared/components/progressbar/progressbar.module';
import { Tax } from 'app/components/tax/tax';
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
    UploadFileComponent,
    QuillModule,
    ProgressbarModule,
    FormsModule,
  ],
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
  public articleTaxes;
  public notes: string[];
  public tags: string[];
  public userType: string;
  public articleType: string;
  public variant: Variant;
  public variantsByTypes: any[];
  public typeSelect = [];
  public filteredVariantTypes: any[] = [];
  public variantTypes: VariantType[];
  public variantType: VariantType[];
  public variantTypeSelected: VariantType;
  public variantValueSelected: VariantValue;
  public variantValues: VariantValue[];
  public variants: Variant[] = new Array();

  public categories: Category[] = [];
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
    private _variantValueService: VariantValueService
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
      updateVariants: [false, []],
      variants: this._fb.array([]),
      salePriceTN: ['', []],
      publishTiendaNube: [[false, []]],
      publishWooCommerce: [[false, []]],
      pictures: this._fb.array([]),
      season: ['', []],
    });

    this.buildTaxForm();

    const pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.operation = pathLocation[3];
    if (pathLocation[2] === 'articles') {
      console.log('acacac');
      this.articleType = 'Producto';
      this.readonly = false;

      if (pathLocation[3] === 'view') this.readonly = true;
    } else if (pathLocation[2] === 'variants') {
      this.readonly = true;
      this.articleType = 'Variante';
    }
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
    const classification = this.classifications?.find((item) => item._id === this.article?.classification?.toString());
    const make = this.makes?.find((item) => item._id === this.article?.make?.toString());
    const unitOfMeasurement = this.unitOfMeasurements?.find(
      (item) => item._id === this.article?.unitOfMeasurement?.toString()
    );
    const provider = this.companies?.find((item) => item._id === this.article?.provider?.toString());

    const values = {
      _id: this.article?._id ?? '',
      order: this.article?.order ?? 1,
      code: this.article.code ?? this.padString(1, this.config.article.code.validators.maxLength),
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
      classification: classification ?? null,
      provider: provider ?? null,
      taxes: [],
      publishTiendaNube: this.article?.publishTiendaNube ?? false,
      publishWooCommerce: this.article?.publishWooCommerce ?? false,
      season: this.article?.season ?? '',
      allowPurchase: this.article?.allowPurchase ?? false,
      allowSale: this.article?.allowSale ?? false,
      allowStock: this.article?.allowStock ?? false,
      allowSaleWithoutStock: this.article?.allowSaleWithoutStock ?? false,
      isWeigth: this.article?.isWeigth ?? false,
      quantityPerMeasure: this.article?.quantityPerMeasure ?? '',
      allowMeasure: this.article?.allowMeasure ?? false,
      posKitchen: this.article?.posKitchen ?? false,
      codeProvider: this.article?.codeProvider ?? '',
      updateVariants: this.article?.updateVariants ?? false,
      weight: this.article?.weight ?? '',
      width: this.article?.width ?? '',
      height: this.article?.height ?? '',
      depth: this.article?.depth ?? '',
      showMenu: this.article?.showMenu ?? false,
      tiendaNubeId: this.article?.tiendaNubeId ?? null,
      wooId: this.article?.wooId ?? null,
      salePriceTN: this.article?.salePriceTN ?? 0,
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

    if (this.article.pictures && this.article.pictures.length > 0) {
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

    if (this.article?.variants?.length > 0 && this.variantTypes.length > 0) {
      let variants = this.articleForm.controls.variants as UntypedFormArray;
      this.article.variants.forEach((x) => {
        const selectedType = this.variantTypes.find(
          (varianType) => varianType._id === (typeof x.type === 'string' ? x.type : x.type._id)
        );
        const selectedValue = this.variantValues.find((variantValue) => {
          const valueId = typeof x.value === 'string' ? x.value : x.value._id;
          return variantValue._id === valueId;
        });
        variants.push(
          this._fb.group({
            type: selectedType,
            value: [selectedValue],
          })
        );
      });
    }
    console.log(this.variantValues);
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
          this.notes = this.article.notes;
          this.tags = this.article.tags;
          if (this.article.variants.length > 0) {
            const types = this.article.variants.map((item) => item.type);
            const uniqueTypes = [...new Set(types)];
            const filteredObjects = this.variantTypes.filter((item: any) => uniqueTypes.includes(item._id));

            this.variantTypes = filteredObjects;
          }
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

  public buildTaxForm(): void {
    this.taxForm = this._fb.group({
      tax: [null, [Validators.required]],
      percentage: [0, []],
      taxAmount: [0, []],
    });
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

      console.log('Taxes array:', taxesArray.value);
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
    if (
      typeof variantsForm.value.type !== 'undefined' &&
      typeof variantsForm.value.type !== null &&
      typeof variantsForm.value.value !== 'undefined' &&
      typeof variantsForm.value.value !== null
    ) {
      this.variant = variantsForm.value;
      const uniqueIds = Array.from(new Set(this.typeSelect));

      // Verificar si el nuevo ID ya está en el array
      if (uniqueIds.includes(this.variant.type._id)) {
        this.typeSelect.push(this.variant.type._id);
      } else if (uniqueIds.length < 2) {
        this.typeSelect.push(this.variant.type._id);
      } else {
        return this._toastService.showToast(
          null,
          'info',
          undefined,
          'No puedes agregar más de un tipo de variante diferente.'
        );
      }
      //Comprobamos que la variante no existe
      if (!this.variantExists(this.variant)) {
        this.variants.push(this.variant);
        this.articleForm.controls.variants.value.push(variantsForm.value);
        this.setVariantByType(this.articleForm.controls.variants.value);
        let variantTypeAux = this.variant.type;
        let variantValueAux = this.variant.value;
        this.variant = new Variant();
        this.variant.type = variantTypeAux;
        this.variant.value = variantValueAux;
        this.setValueVariants();
      } else {
        this._toastService.showToast(
          null,
          'info',
          undefined,
          'La variante ' + this.variant.type.name + ' ' + this.variant.value.description + ' ya existe'
        );
      }
    }
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
  public variantExists(variant: Variant): boolean {
    let exists: boolean = false;

    if (this.variants && this.variants.length > 0) {
      for (let variantAux of this.variants) {
        if (variantAux.type._id === variant.type._id && variantAux.value._id === variant.value._id) {
          exists = true;
        }
      }
    }

    return exists;
  }

  public deleteVariant(v) {
    // Verifica si solo hay un tipo con un valor en variantsByTypes
    const typeId = v.type?._id; // Obtén el ID del tipo desde el objeto v
    const typeIndex = this.variantsByTypes.findIndex((type) => type.type._id === typeId);

    if (typeIndex !== -1) {
      const type = this.variantsByTypes[typeIndex];

      // Permitir la eliminación solo si hay más de un value
      if (type.value.length > 1) {
        // Procede con la eliminación
        let countvt: number = 0;

        // Encuentra y elimina el value correspondiente
        for (let vt of this.variantsByTypes) {
          if (vt.type._id === typeId) {
            let countval: number = 0;
            let delval: number = -1;
            for (let val of vt.value) {
              if (val._id === v._id) {
                delval = countval;
              }
              countval++;
            }

            // Eliminar el value encontrado
            if (delval !== -1) {
              vt.value.splice(delval, 1);
            }

            // Si el array de values está vacío, eliminar el tipo
            if (vt.value.length === 0) {
              this.variantsByTypes.splice(countvt, 1);
            }
          }
          countvt++;
        }

        // Eliminar de this.variants si corresponde
        if (this.variants && this.variants.length > 0) {
          let countvar: number = 0;
          let delvar: number = -1;
          for (let variantAux of this.variants) {
            if (variantAux.value._id === v._id) {
              delvar = countvar;
            }
            countvar++;
          }
          if (delvar !== -1) {
            this.variants.splice(delvar, 1);
          }
        }

        // Eliminar la variante del FormArray
        this.deleteVariantFromFormArray(v);
      } else {
        this._toastService.showToast(null, 'info', undefined, 'No se puede eliminar la única variante restante.');
        return;
      }
    }
  }

  private deleteVariantFromFormArray(variant): void {
    const variantsArray = this.articleForm.get('variants') as FormArray;

    for (let i = 0; i < variantsArray.length; i++) {
      const variantGroup = variantsArray.at(i) as FormGroup;
      const variantId =
        typeof variantGroup.value.value === 'string' ? variantGroup.value.value : variantGroup.value.value._id;
      if (variantId === variant._id) {
        variantsArray.removeAt(i);
        break;
      }
    }
  }

  private setVariantByType(variants: Variant[]): void {
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
    // Convertir el mapa a un array y ordenar
    console.log(typeMap.values());
    this.variantsByTypes = Array.from(typeMap.values());
  }

  public refreshValues(): void {
    if (this.variantTypeSelected) {
      this.getVariantValuesByType(this.variantTypeSelected);
    } else {
      this.variantValues = [];
    }
  }

  public getVariantValuesByType(variantType: VariantType): void {
    this.loading = true;

    let query = 'where="type":"' + variantType._id + '"&sort="order":1,"description":1';

    this._variantValueService.getVariantValues(query).subscribe(
      (result) => {
        if (!result.variantValues) {
          this.loading = false;
          this.variantValues = new Array();
        } else {
          //  this.hideMessage();
          this.loading = false;
          this.variantValues = result.variantValues;
        }
      },
      (error) => {
        //   this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  padString(n, length) {
    n = n.toString();
    while (n.length < length) {
      n = '0' + n;
    }

    return n;
  }
}
