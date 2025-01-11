// Angular
import { DecimalPipe, SlicePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
  FormArray,
  FormGroup,
  NgForm,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'app/shared/components/toast/toast.service';

// Terceros
import { NgbActiveModal, NgbModal, NgbTypeahead, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';

// Models
import { Observable, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

import { Make } from '@types';
import { Config } from '../../../app.config';
import { ArticleStockService } from '../../../core/services/article-stock.service';
import { ArticleService } from '../../../core/services/article.service';
import { CategoryService } from '../../../core/services/category.service';
import { VariantService } from '../../../core/services/variant.service';
import { RoundNumberPipe } from '../../../shared/pipes/round-number.pipe';
import { ArticleStock } from '../../article-stock/article-stock';
import { Category } from '../../category/category';
import { Company } from '../../company/company';
import { Taxes } from '../../tax/taxes';
import { Variant } from '../../variant/variant';
import { Article, ArticlePrintIn, Type } from '../article';

import { AccountService } from '../../../core/services/account.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ClassificationService } from '../../../core/services/classification.service';
import { ConfigService } from '../../../core/services/config.service';
import { Account } from '../../account/account';
import { Application } from '../../application/application.model';
import { Classification } from '../../classification/classification';
import { Currency } from '../../currency/currency';

// Services

import { CurrencyService } from '../../../core/services/currency.service';

// Pipes
import { TranslateService } from '@ngx-translate/core';
import { ApiResponse, MediaCategory } from '@types';
import { User } from 'app/components/user/user';
import { VariantType } from 'app/components/variant-type/variant-type';
import { VariantValue } from 'app/components/variant-value/variant-value';
import { AddVariantComponent } from 'app/components/variant/add-variant/add-variant.component';
import { CompanyService } from 'app/core/services/company.service';
import { FileService } from 'app/core/services/file.service';
import { MakeService } from 'app/core/services/make.service';
import { TaxService } from 'app/core/services/tax.service';
import { UserService } from 'app/core/services/user.service';
import { VariantTypeService } from 'app/core/services/variant-type.service';
import { VariantValueService } from 'app/core/services/variant-value.service';
import { OrderByPipe } from 'app/shared/pipes/order-by.pipe';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import { merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UnitOfMeasurementService } from '../../../core/services/unit-of-measurement.service';
import { Tax, TaxClassification } from '../../tax/tax';
import { UnitOfMeasurement } from '../../unit-of-measurement/unit-of-measurement.model';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  providers: [DecimalPipe, NgbTypeaheadConfig, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class ArticleComponent implements OnInit {
  @Input() property: {
    articleId: string;
    operation: string;
  };
  public articleId: string;
  public operation: string;
  public readonly: boolean;
  public variant: Variant;
  private subscription: Subscription = new Subscription();
  article: Article;
  articleStock: ArticleStock;
  config: Config;
  articleForm: UntypedFormGroup;
  public variantsByTypes: any[];
  currencies: Currency[] = new Array();
  makes: Make[] = new Array();
  classifications: Classification[] = new Array();
  companies: Company[] = new Array();
  categories: Category[] = new Array();
  variants: Variant[] = new Array();
  unitsOfMeasurement: UnitOfMeasurement[] = new Array();
  taxes: any[] = new Array();
  printIns: ArticlePrintIn[] = [
    ArticlePrintIn.Counter,
    ArticlePrintIn.Kitchen,
    ArticlePrintIn.Bar,
    ArticlePrintIn.Voucher,
  ];
  userType: string;
  loading = true;
  focusEvent = new EventEmitter<boolean>();
  focusNoteEvent = new EventEmitter<boolean>();
  focusTagEvent = new EventEmitter<boolean>();
  filesToUpload: Array<File>;
  filesToArray: Array<File>;
  hasChanged = false;
  roundNumber: RoundNumberPipe = new RoundNumberPipe();
  imageURL: string;
  articleType: string;
  filtersTaxClassification: TaxClassification[] = [TaxClassification.Tax];
  lastPricePurchase: number = 0.0;
  lastDatePurchase: string;
  notes: string[];
  tags: string[];
  fileNamePrincipal: string;
  fileNameArray: string;
  formErrorsNote: string;
  formErrorsTag: string;
  applications: Application[];
  focus$: Subject<string>[] = new Array();
  totalTaxes: number = 0;
  salePriceWithoutVAT: number = 0;
  markupPriceWithoutVAT: number = 0;
  database: string;
  users: User[];
  creationUser: User;
  updateUser: User;
  typeSelect = [];
  filteredVariantTypes: any[] = [];
  tax: Tax[];

  public variantTypes: VariantType[];
  public variantType: VariantType[];
  public variantTypeSelected: VariantType;
  public variantValueSelected: VariantValue;
  public variantValues: VariantValue[];
  public orderByPipe: OrderByPipe = new OrderByPipe();

  html = '';
  model: any;

  @ViewChild('instance', { static: true }) instance: NgbTypeahead;

  categoryFocus$ = new Subject<string>();
  categoryClick$ = new Subject<string>();
  makeFocus$ = new Subject<string>();
  makeClick$ = new Subject<string>();
  unitsOfMeasurementClick$ = new Subject<string>();
  unitsOfMeasurementFocus$ = new Subject<string>();
  companiesClick$ = new Subject<string>();
  companiesFocus$ = new Subject<string>();

  observationContent: string = '';
  quillConfig = {
    formats: ['bold', 'italic', 'underline', 'strike', 'list', 'link'],
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'], // Estilos básicos
        [{ list: 'ordered' }, { list: 'bullet' }], // Listas
        ['link'], // Enlaces
      ],
    },
    theme: 'snow', // Tema similar a "modern" en TinyMCE
    readOnly: false, // Si quieres solo lectura, usa true
    styles: {
      height: '150px', // Altura del editor
      width: '100%', // Ancho completo
      'max-width': '600px',
    },
  };

  formErrors = {
    code: '',
    make: '',
    description: '',
    posDescription: '',
    basePrice: '',
    costPrice: '',
    markupPercentage: '',
    markupPrice: '',
    salePrice: '',
    category: '',
    barcode: '',
    currency: '',
    providers: '',
    provider: '',
    note: '',
    codeProvider: '',
  };

  validationMessages = {
    code: { validateAutocomplete: 'Este campo es requerido.' },
    make: { validateAutocomplete: 'Debe ingresar un valor válido' },
    description: { required: 'Este campo es requerido.' },
    posDescription: { maxlength: 'No puede exceder los 20 carácteres.' },
    basePrice: { required: 'Este campo es requerido.' },
    costPrice: { required: 'Este campo es requerido.' },
    markupPercentage: { required: 'Este campo es requerido.' },
    markupPrice: { required: 'Este campo es requerido.' },
    salePrice: { required: 'Este campo es requerido.' },
    category: {
      required: 'Este campo es requerido.',
      validateAutocomplete: 'Debe ingresar un valor válido',
    },
    unitOfMeasurement: {
      validateAutocomplete: 'Debe ingresar un valor válido',
    },
    currency: { maxlength: 'No puede exceder los 14 dígitos.' },
    note: {},
    tag: {},
  };

  searchCategories: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.categoryClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.categoryFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === ''
          ? this.categories
          : this.categories.filter((v) => v.description.toLowerCase().includes(term.toLowerCase()))
        ).slice()
      )
    );
  };

  formatResult = (result: any) => {
    if (result.parent && result.parent) {
      return result.description + ' - ' + this.categories.find((c: Category) => c._id === result.parent).description;
    }
    return result.description;
  };

  formatInput = (result: any) => {
    let valueId = result._id === undefined ? result : result._id;
    const category: any = this.categories.find((c: Category) => c._id === valueId);

    if (category.parent) {
      return (
        category.description + ' - ' + this.categories.find((c: Category) => c._id === category.parent).description
      );
    }

    return category?.description;
  };

  searchMakes: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.makeClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.makeFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === ''
          ? this.makes
          : this.makes.filter((v) => v.description.toLowerCase().includes(term.toLowerCase()))
        ).slice()
      )
    );
  };

  formatterMakes = (x: any) => {
    let valueId = x._id === undefined ? x : x._id;
    const make = this.makes.find((c: Make) => c._id === valueId);
    return make?.description;
  };

  formatResultMakes = (x: any) => {
    let valueId = x._id === undefined ? x : x._id;
    const make = this.makes.find((c: Make) => c._id === valueId);
    return make?.description;
  };

  searchUnitsOfMeasurement: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.unitsOfMeasurementClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.unitsOfMeasurementFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === ''
          ? this.unitsOfMeasurement
          : this.unitsOfMeasurement.filter((v) => v.name.toLowerCase().includes(term.toLowerCase()))
        ).slice()
      )
    );
  };

  formatterUnitsOfMeasurement = (x: any) => {
    let valueId = x._id === undefined ? x : x._id;
    const unitsOfMeasurement = this.unitsOfMeasurement.find((u: UnitOfMeasurement) => u._id === valueId);
    return unitsOfMeasurement.name;
  };

  searchProvider: OperatorFunction<string, readonly any[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.companiesClick$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.companiesFocus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        (term === ''
          ? this.companies
          : this.companies.filter((v) => v.name.toLowerCase().includes(term.toLowerCase()))
        ).slice()
      )
    );
  };

  formatterProvider = (x: any) => {
    let valueId = x._id === undefined ? x : x._id;
    const company = this.companies.find((c: Company) => c._id === valueId);
    return company.name;
  };

  @ViewChild(AddVariantComponent) addVariantComponent: AddVariantComponent;

  constructor(
    private _articleService: ArticleService,
    private _articleStockService: ArticleStockService,
    private _variantService: VariantService,
    private _modalService: NgbModal,
    private _makeService: MakeService,
    private _categoryService: CategoryService,
    private _classificationService: ClassificationService,
    public _companyService: CompanyService,
    private _unitOfMeasurementService: UnitOfMeasurementService,
    private _applicationService: ApplicationService,
    private _accountService: AccountService,
    private _currencyService: CurrencyService,
    private _configService: ConfigService,
    private _toastService: ToastService,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    private _route: ActivatedRoute,
    public activeModal: NgbActiveModal,
    public _fileService: FileService,
    public _variantTypeService: VariantTypeService,
    public _variantValueService: VariantValueService,
    public _userService: UserService,
    public _taxService: TaxService,
    public translate: TranslateService
  ) {
    this.article = new Article();
    this.notes = new Array();
    this.tags = new Array();
    this.getCurrencies();
    this.getArticleTypes();
    this.getVariantValues();
    this.getVariantTypes();
    this.getMake();
    this.getCategory();
    this.getUnitsOfMeasurement();
    this.getCompany();
    this.getUsers();
    this.getTax();

    const pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.operation = pathLocation[3];
    if (pathLocation[2] === 'articles') {
      this.articleType = 'Producto';
      this.readonly = false;

      if (pathLocation[3] === 'view') this.readonly = true;
    } else if (pathLocation[2] === 'variants') {
      this.readonly = true;
      this.articleType = 'Variante';
    }
  }

  async ngOnInit() {
    if (this.property) {
      this.operation = this.property.operation;
      this.articleId = this.property.articleId;
    } else {
      const URL = this._router.url.split('/');
      this.operation = URL[3].split('?')[0];
      this.articleId = URL[4];
    }

    if (this.operation === 'view') this.readonly = true;

    if (!this.variant) {
      this.variant = new Variant();
      this.variant.articleParent = this.article;
    }
    this.buildForm();
    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
      // AGREGAMOS VALIDACIÓN DE LONGITUD DE CÓDIGO INTERNO
      this.validationMessages.code['maxlength'] =
        `No puede exceder los ${this.config.article.code.validators.maxLength} carácteres.`;
      this.articleForm.controls['code'].setValidators([
        Validators.maxLength(this.config.article.code.validators.maxLength),
      ]);
      this.article.isWeigth = this.config.article.isWeigth.default;
      this.article.salesAccount = this.config.article.salesAccount.default;
      this.article.purchaseAccount = this.config.article.purchaseAccount.default;
      this.article.allowSaleWithoutStock = this.config.article.allowSaleWithoutStock.default || false;
    });

    await this.getAllApplications({})
      .then((result: Application[]) => {
        this.applications = result;
        if (!this.articleId) {
          this.applications.forEach((x) => {
            const control = new UntypedFormControl(false);

            (this.articleForm.controls.applications as UntypedFormArray).push(control);
          });
        }
      })
      .catch((error: ApiResponse) => this._toastService.showToast(error));
    if (this.articleId && this.articleId !== '') {
      this.getArticle();
    } else {
      this.imageURL = './../../../assets/img/default.jpg';
    }
    if (this.operation === 'add' || this.operation === 'copy') {
      this.getLastArticle();
    }
  }

  getArticleTypes() {
    let match = `{"operationType": { "$ne": "D" } }`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      name: 1,
      operationType: 1,
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      classifications: { $push: '$$ROOT' },
    };

    this._classificationService
      .getClassifications(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
      )
      .subscribe(
        (result) => {
          if (result.result && result.result[0] && result.result[0]) {
            this.classifications = result.result[0].classifications;
          } else {
            this.classifications = new Array();
          }
        },
        (error) => this._toastService.showToast(error)
      );
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  buildForm(): void {
    this.articleForm = this._fb.group({
      _id: [this.article._id, []],
      order: [this.article.order, []],
      code: [this.article.code, [Validators.required]],
      codeProvider: [this.article.codeProvider, []],
      codeSAT: [this.article.codeSAT, []],
      currency: [this.article.currency, []],
      make: [this.article.make, []],
      description: [this.article.description, [Validators.required]],
      posDescription: [this.article.posDescription, [Validators.maxLength(20)]],
      basePrice: [this.article.basePrice, [Validators.required]],
      costPrice: [this.article.costPrice, [Validators.required]],
      costPrice2: [this.article.costPrice2],
      markupPercentage: [this.article.markupPercentage, [Validators.required]],
      markupPriceWithoutVAT: [this.markupPriceWithoutVAT],
      markupPrice: [this.article.markupPrice, [Validators.required]],
      salePrice: [this.article.salePrice, [Validators.required]],
      salePriceWithoutVAT: [this.salePriceWithoutVAT],
      category: [this.article.category, [Validators.required]],
      quantityPerMeasure: [this.article.quantityPerMeasure, []],
      unitOfMeasurement: [this.article.unitOfMeasurement, []],
      children: this._fb.array([]),
      observation: [this.article.observation, []],
      barcode: [this.article.barcode, []],
      printIn: [this.article.printIn, []],
      allowPurchase: [this.article.allowPurchase, []],
      allowSale: [this.article.allowSale, []],
      allowStock: [this.article.allowStock, []],
      allowSaleWithoutStock: [this.article.allowSaleWithoutStock, []],
      allowMeasure: [this.article.allowMeasure, []],
      ecommerceEnabled: [this.article.ecommerceEnabled, []],
      posKitchen: [this.article.posKitchen, []],
      isWeigth: [this.article.isWeigth, []],
      favourite: [this.article.favourite, []],
      providers: [this.article.provider, []],
      provider: [this.article.provider, []],
      lastPricePurchase: [0.0, []],
      lastDatePurchase: [0.0, []],
      classification: [this.article.classification, []],
      pictures: this._fb.array([]),
      applications: this._fb.array([]),
      url: [this.article.url, []],
      forShipping: [this.article.forShipping, []],
      salesAccount: [this.article.salesAccount, []],
      purchaseAccount: [this.article.purchaseAccount, []],
      minStock: [this.article.minStock, []],
      maxStock: [this.article.maxStock, []],
      pointOfOrder: [this.article.pointOfOrder, []],
      meliId: [this.article.meliId, []],
      wooId: [this.article.wooId, []],
      purchasePrice: [this.article.purchasePrice, []],
      m3: [this.article.m3, []],
      weight: [this.article.weight, []],
      width: [this.article.width, []],
      height: [this.article.height, []],
      depth: [this.article.depth, []],
      showMenu: [this.article.showMenu, []],
      tiendaNubeId: [this.article.tiendaNubeId, []],
      updateVariants: [this.article.updateVariants, []],
      variants: this._fb.array([]),
      salePriceTN: [this.article.salePriceTN, []],
    });

    this.articleForm.valueChanges.subscribe((data) => this.onValueChanged(data));
    this.focusEvent.emit(true);
  }

  onValueChanged(fieldID?: any): void {
    if (!this.articleForm) {
      return;
    }
    const form = this.articleForm;

    if (!fieldID || typeof fieldID === 'string') {
      for (const field in this.formErrors) {
        if (!fieldID || field === fieldID) {
          this.formErrors[field] = '';
          const control = form.get(field);

          if (control && !control.valid) {
            for (const key in control.errors) {
              if (this.validationMessages[field][key] && this.validationMessages[field][key] != 'undefined') {
                this.formErrors[field] += this.validationMessages[field][key] + ' ';
              }
            }
          }
        }
      }
    }
  }

  addNote(note: string): void {
    note = note.toUpperCase();
    if (!this.notes) this.notes = new Array();
    if (note && note !== '') {
      if (this.notes.indexOf(note) == -1) {
        this.notes.push(note);
        this.formErrorsNote = null;
      } else {
        this.formErrorsNote = 'La nota ingresada ya existe.';
      }
    } else {
      this.formErrorsNote = 'Debe ingresar un valór válido.';
    }
    this.focusNoteEvent.emit(true);
  }

  deleteNote(note: string): void {
    note = note.toUpperCase();
    if (note) this.notes.splice(this.notes.indexOf(note), 1);
    this.formErrorsNote = null;
    this.focusNoteEvent.emit(true);
  }

  addTag(tag: string): void {
    tag = tag.toUpperCase();
    if (!this.tags) this.tags = new Array();
    if (tag && tag !== '') {
      if (this.tags.indexOf(tag) == -1) {
        this.tags.push(tag);
        this.formErrorsTag = null;
      } else {
        this.formErrorsTag = 'La nota ingresada ya existe.';
      }
    } else {
      this.formErrorsTag = 'Debe ingresar un valór válido.';
    }
    this.focusTagEvent.emit(true);
  }

  deleteTag(tag: string): void {
    tag = tag.toUpperCase();
    if (tag) this.tags.splice(this.tags.indexOf(tag), 1);
    this.formErrorsTag = null;
    this.focusTagEvent.emit(true);
  }

  getCurrencies(): void {
    this._currencyService.getCurrencies('sort="name":1').subscribe(
      (result) => {
        if (!result.result) {
        } else {
          this.currencies = result.result;
        }
      },
      (error) => this._toastService.showToast(error)
    );
  }

  getArticle(): void {
    this._articleService.getById(this.articleId).subscribe(
      (result: any) => {
        if (!result.result) {
          this._toastService.showToast(result);
        } else {
          this.article = result.result;
          this.notes = this.article.notes;
          this.tags = this.article.tags;
          this.taxes = this.article.taxes;
          this.totalTaxes = 0;
          for (let tax of this.taxes) {
            const taxes: any = typeof tax.tax === 'string' ? this.tax.find((app) => app._id === tax.tax) : tax.tax._id;
            tax.tax = taxes;
            this.totalTaxes += tax.taxAmount;
          }
          this.imageURL = this.article.picture ?? './../../../assets/img/default.jpg';
          if (this.article.picture == 'default.jpg') this.imageURL = './../../../assets/img/default.jpg';

          if (this.operation === 'copy') {
            this.article._id = null;
            this.article.code = '';
            this.article.posDescription = '';
            this.article.url = '';
            this.article.wooId = '';
            this.article.tiendaNubeId = '';
            this.article.creationDate = '';
            this.article.creationUser = null;
            this.article.updateDate = '';
            this.article.updateUser = null;
          }
          this.creationUser = this.users.find(
            (user: User) =>
              user._id ===
              (typeof this.article.creationUser === 'string'
                ? this.article.creationUser
                : typeof this.article.creationUser !== 'undefined'
                  ? this.article.creationUser._id
                  : '')
          );
          this.updateUser = this.users.find(
            (user: User) =>
              user._id ===
              (typeof this.article.updateUser === 'string'
                ? this.article.updateUser
                : typeof this.article.updateUser !== 'undefined'
                  ? this.article.updateUser._id
                  : '')
          );
          if (this.article.variants.length > 0) {
            const types = this.article.variants.map((item) => item.type);
            const uniqueTypes = [...new Set(types)];
            const filteredObjects = this.variantTypes.filter((item: any) => uniqueTypes.includes(item._id));

            this.variantTypes = filteredObjects;
          }
          this.setValuesForm();
          this.setValuesArray();
          this.setVariantByType(this.articleForm.controls.variants.value);
        }
      },
      (error) => this._toastService.showToast(error)
    );
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
    this.variantsByTypes = Array.from(typeMap.values());
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

  public getUsers() {
    this.loading = true;
    let project = {
      _id: 1,
      name: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._userService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result) {
          this.loading = false;
          this.users = new Array();
        } else {
          this.loading = false;
          this.users = result.result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public updateAndRefresh() {
    if (this.operation !== 'add' && this.operation !== 'copy') {
      const selectedTypeNames = this.articleForm.controls.variants.value.map((v) => v.value.type.name);
      if (!selectedTypeNames.length) {
        this.filteredVariantTypes = this.variantTypes;
      } else {
        this.filteredVariantTypes = this.variantTypes.filter((type) => selectedTypeNames.includes(type.name));
      }
    } else {
      this.filteredVariantTypes = this.variantTypes;
    }
  }

  public refreshValues(): void {
    if (this.variantTypeSelected) {
      this.variant.value = null;
      this.getVariantValuesByType(this.variantTypeSelected);
    } else {
      this.variant.type = null;
      this.variant.value = null;
      this.setValuesForm();
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
        this.variant.articleParent = this.article;
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

  public getVariantValues(): void {
    this.loading = true;
    let project = {
      _id: 1,
      'type.name': 1,
      'type._id': 1,
      description: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._variantValueService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this.loading = false;
          this.variantValues = new Array();
        } else {
          this.loading = false;
          this.variantValues = result.result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  onEnter() {
    const isInQuill = event.target instanceof HTMLDivElement && event.target.classList.contains('ql-editor');

    if (isInQuill) {
      event.preventDefault();
      return;
    }

    if (this.articleForm.valid && this.operation !== 'view' && this.operation !== 'delete') {
      this.addArticle();
    }
    if (this.articleForm.valid && this.operation === 'delete') {
      this.deleteArticle();
    }
  }

  getVariantTypes(): void {
    let project = {
      _id: 1,
      name: 1,
      operationType: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };
    this._variantTypeService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this.loading = false;
          this.variantTypes = new Array();
        } else {
          this.loading = false;
          this.variantTypes = result.result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public getCategory(): void {
    this.loading = true;

    let project = {
      _id: 1,
      description: 1,
      parent: 1,
      operationType: 1,
    };
    let query = {
      operationType: { $ne: 'D' },
    };

    this._categoryService.find({ project, query }).subscribe(
      (result) => {
        if (!result) {
          this.loading = false;
          this.categories = new Array();
        } else {
          this.loading = false;
          this.categories = result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public getMake(): void {
    this.loading = true;

    let project = {
      _id: 1,
      description: 1,
      operationType: 1,
    };
    let query = {
      operationType: { $ne: 'D' },
    };

    this._makeService.find({ project, query }).subscribe(
      (result) => {
        if (!result) {
          this.loading = false;
          this.makes = new Array();
        } else {
          this.loading = false;
          this.makes = result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public getTax(): void {
    this.loading = true;

    let project = {
      amount: 1,
      classification: 1,
      code: 1,
      creationDate: 1,
      lastNumber: 1,
      name: 1,
      operationType: 1,
      percentage: 1,
      taxBase: 1,
      type: 1,
      _id: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
    };

    this._taxService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this.loading = false;
          this.tax = new Array();
        } else {
          this.loading = false;
          this.tax = result.result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public getUnitsOfMeasurement(): void {
    this.loading = true;

    let project = {
      _id: 1,
      name: 1,
      operationType: 1,
    };
    let query = {
      operationType: { $ne: 'D' },
    };

    this._unitOfMeasurementService.find({ project, query }).subscribe(
      (result) => {
        if (!result) {
          this.loading = false;
          this.unitsOfMeasurement = new Array();
        } else {
          this.loading = false;
          this.unitsOfMeasurement = result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public getCompany(): void {
    this.loading = true;

    let project = {
      _id: 1,
      name: 1,
      operationType: 1,
      type: 1,
    };
    let match = {
      operationType: { $ne: 'D' },
      type: 'Proveedor',
    };
    this._companyService.getAll({ project, match }).subscribe(
      (result) => {
        if (!result.result) {
          this.loading = false;
          this.companies = new Array();
        } else {
          this.loading = false;
          this.companies = result.result;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  onAppChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedValue = selectElement.value === 'true';
    (this.articleForm.controls.applications as UntypedFormArray).at(index).setValue(selectedValue);
  }

  setValuesArray(): void {
    if (this.article.pictures && this.article.pictures.length > 0) {
      let pictures = this.articleForm.controls.pictures as UntypedFormArray;

      this.article.pictures.forEach((x) => {
        pictures.push(
          this._fb.group({
            _id: null,
            picture: x.picture,
            meliId: x.meliId,
          })
        );
      });
    }

    if (this.article.variants && this.article.variants.length > 0) {
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

    if (this.applications && this.applications.length > 0) {
      this.applications.forEach((app) => {
        const exists = this.article.applications.toString().includes(app._id);
        const control = new UntypedFormControl(exists);
        (this.articleForm.controls.applications as UntypedFormArray).push(control);
      });
    }
  }

  public returnTo(): void {
    this._route.queryParams.subscribe((params) => {
      const returnUrl = params['returnURL'] ? decodeURIComponent(params['returnURL']) : null;

      if (this.property) {
        this.activeModal.close();
      } else {
        if (returnUrl) {
          // Si hay una returnURL, navegar a esa URL
          this._router.navigateByUrl(returnUrl);
        } else {
          // Navegar a una ruta por defecto si no hay returnURL
          if (this.article.type === Type.Variant) {
            this._router.navigate(['/admin/variants']);
          } else {
            this._router.navigate(['/admin/articles']);
          }
        }
      }
    });
  }
  getUniqueVariants(variants: Variant[]): Variant[] {
    let variantsToReturn: Variant[] = new Array();

    for (let variant of variants) {
      if (variantsToReturn && variantsToReturn.length > 0) {
        let exists: boolean = false;

        for (let variantAux of variantsToReturn) {
          if (variantAux.value._id === variant.value._id) {
            exists = true;
          }
        }
        if (!exists) {
          variantsToReturn.push(variant);
        }
      } else {
        variantsToReturn.push(variant);
      }
    }
    return variantsToReturn;
  }

  padString(n, length) {
    n = n.toString();
    while (n.length < length) {
      n = '0' + n;
    }

    return n;
  }

  validateAutocomplete(c: UntypedFormControl) {
    let result =
      c.value && Object.keys(c.value)[0] === '0'
        ? {
            validateAutocomplete: {
              valid: false,
            },
          }
        : null;

    return result;
  }

  getLastArticle(): void {
    this._articleService.getLasCode().subscribe(
      (result) => {
        let code = this.padString(1, this.config.article.code.validators.maxLength);

        if (result.code) {
          code = result.code;
        }
        this.article.code = code;

        this.setValuesForm();
      },
      (error) => this._toastService.showToast(error)
    );
  }

  async openModal(op: string, articleId?: string) {
    let modalRef;

    switch (op) {
      case 'view':
        modalRef = this._modalService.open(ArticleComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.articleId = articleId;
        modalRef.componentInstance.readonly = true;
        modalRef.componentInstance.operation = 'view';
        break;
    }
  }

  getCategories(query): Promise<Category[]> {
    return new Promise<Category[]>((resolve, reject) => {
      this._categoryService.getCategories(query).subscribe(
        (result) => {
          if (!result.categories) {
            resolve(null);
          } else {
            resolve(result.categories);
          }
        },
        (error) => this._toastService.showToast(error)
      );
    });
  }

  updatePrices(op): void {
    let taxedAmount = 0;

    switch (op) {
      case 'basePrice':
        this.articleForm.value.costPrice = 0;
        taxedAmount = this.articleForm.value.basePrice;

        if (this.taxes && this.taxes.length > 0) {
          this.totalTaxes = 0;
          for (const articleTax of this.taxes) {
            if (articleTax.tax.percentage && articleTax.tax.percentage != 0) {
              articleTax.taxBase = taxedAmount;
              articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage) / 100);
              this.totalTaxes += articleTax.taxAmount;
            }
            this.articleForm.value.costPrice += articleTax.taxAmount;
          }
        }
        this.articleForm.value.costPrice += taxedAmount;

        if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
          );
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'taxes':
        this.articleForm.value.costPrice = 0;
        taxedAmount = this.articleForm.value.basePrice;

        if (this.taxes && this.taxes.length > 0) {
          this.totalTaxes = 0;
          for (const articleTax of this.taxes) {
            this.articleForm.value.costPrice += articleTax.taxAmount;
            this.totalTaxes += articleTax.taxAmount;
          }
        }

        this.articleForm.value.costPrice += taxedAmount;
        if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
          );
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPercentage':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) / 100
          );
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPrice':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPercentage = this.roundNumber.transform(
            (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100
          );
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'salePrice':
        if (this.articleForm.value.basePrice === 0) {
          this.articleForm.value.costPrice === 0;
          this.articleForm.value.markupPercentage = 100;
          this.articleForm.value.markupPrice = this.articleForm.value.salePrice;
        } else {
          this.articleForm.value.markupPrice = this.articleForm.value.salePrice - this.articleForm.value.costPrice;
          this.articleForm.value.markupPercentage = this.roundNumber.transform(
            (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100
          );
        }
        break;
      default:
        break;
    }

    this.articleForm.value.basePrice = this.roundNumber.transform(this.articleForm.value.basePrice);
    this.articleForm.value.costPrice = this.roundNumber.transform(this.articleForm.value.costPrice);
    this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPercentage);
    this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.markupPrice);
    this.articleForm.value.salePrice = this.roundNumber.transform(this.articleForm.value.salePrice);
    this.articleForm.value.salePriceTN = this.roundNumber.transform(this.articleForm.value.salePriceTN);
    this.article = Object.assign(this.article, this.articleForm.value);
    this.setValuesForm();
  }

  loadPosDescription(): void {
    if (this.articleForm.value.posDescription === '') {
      const slicePipe = new SlicePipe();

      this.articleForm.patchValue({
        posDescription: slicePipe.transform(this.articleForm.value.description, 0, 20),
      });
    }
  }

  setValuesForm(): void {
    const values = {
      _id: this.article._id ?? '',
      order: this.article.order ?? 1,
      code: this.article.code ?? this.padString(1, this.config.article.code.validators.maxLength),
      codeSAT: this.article.codeSAT ?? '',
      currency: this.article.currency?._id ?? this.article.currency ?? null,
      make: this.article.make ?? null,
      description: this.article.description ?? '',
      posDescription: this.article.posDescription ?? '',
      basePrice: this.roundNumber.transform(this.article.basePrice ?? 0.0),
      costPrice: this.roundNumber.transform(this.article.costPrice ?? 0.0),
      costPrice2: this.roundNumber.transform(this.article.costPrice2 ?? 0.0),
      markupPercentage: this.roundNumber.transform(this.article.markupPercentage ?? 0.0),
      markupPrice: this.roundNumber.transform(this.article.markupPrice ?? 0.0, 3),
      markupPriceWithoutVAT: this.roundNumber.transform((this.article.basePrice * this.article.markupPercentage) / 100),
      salePrice: this.roundNumber.transform(this.article.salePrice ?? 0.0),
      salePriceWithoutVAT: this.roundNumber.transform(this.article.basePrice + this.markupPriceWithoutVAT),
      category: this.article.category ?? null,
      quantityPerMeasure: this.article.quantityPerMeasure ?? 1,
      unitOfMeasurement: this.article.unitOfMeasurement ?? null,
      observation: this.article.observation ?? '',
      barcode: this.article.barcode ?? '',
      printIn: this.article.printIn ?? ArticlePrintIn.Counter,
      allowPurchase: this.article.allowPurchase ?? true,
      allowSale: this.article.allowSale ?? true,
      allowSaleWithoutStock: this.article.allowSaleWithoutStock ?? false,
      isWeigth: this.article.isWeigth ?? false,
      allowMeasure: this.article.allowMeasure ?? false,
      ecommerceEnabled: this.article.ecommerceEnabled ?? false,
      posKitchen: this.article.posKitchen ?? false,
      favourite: this.article.favourite ?? false,
      providers:
        this.article.provider?._id ??
        this.article.provider ??
        this.article.providers?.[0]?._id ??
        this.article.providers ??
        null,
      provider: this.article.provider?._id ?? this.article.provider ?? null,
      lastPricePurchase: this.lastPricePurchase ?? 0,
      classification: this.article.classification?.[0]?._id ?? this.article.classification ?? null,
      url: this.article.url ?? '',
      forShipping: this.article.forShipping ?? false,
      salesAccount: this.article.salesAccount ?? null,
      purchaseAccount: this.article.purchaseAccount ?? null,
      minStock: this.article.minStock ?? null,
      maxStock: this.article.maxStock ?? null,
      pointOfOrder: this.article.pointOfOrder ?? null,
      codeProvider: this.article.codeProvider ?? null,
      allowStock: this.article.allowStock ?? null,
      wooId: this.article.wooId ?? null,
      purchasePrice: this.article.purchasePrice ?? null,
      m3: this.article.m3 ?? null,
      weight: this.article.weight ?? null,
      height: this.article.height ?? null,
      width: this.article.width ?? null,
      depth: this.article.depth ?? null,
      showMenu: this.article.showMenu ?? '',
      updateVariants: this.article.updateVariants ?? false,
      tiendaNubeId: this.article.tiendaNubeId ?? null,
      salePriceTN: this.roundNumber.transform(this.article.salePriceTN ?? 0.0),
    };

    this.articleForm.patchValue(values);
  }

  addArticle(): void {
    if (this.articleForm.valid) {
      this.loadPosDescription();
      const salePrice = this.articleForm.get('salePrice')?.value;
      if (salePrice <= 0) {
        return this._toastService.showToast({
          message: salePrice < 0 ? 'El precio no puede ser negativo.' : 'El precio tiene que ser mayor a 0.',
        });
      }

      this.article = Object.assign(this.article, this.articleForm.value);

      if (this.article.make === null || this.article?.make?.toString() === '') {
        this.article.make = null;
      }

      if (this.article.provider === null || this.article?.provider?.toString() === '') {
        this.article.provider = null;
      }
      if (this.article.category && this.article.category.toString() === '') this.article.category = null;
      if (this.article.unitOfMeasurement && this.article.unitOfMeasurement.toString() === '')
        this.article.unitOfMeasurement = null;
      this.article.notes = this.notes;
      this.article.tags = this.tags;
      if (this.article.variants && this.article.variants.length > 0) {
        this.article.containsVariants = true;
      } else {
        this.article.containsVariants = false;
      }

      this.article.taxes = this.taxes;
      const selectedOrderIds = this.articleForm.value.applications
        .map((v, i) => (v ? this.applications[i] : null))
        .filter((v) => v !== null);

      this.article.applications = selectedOrderIds;

      const pathLocation: string[] = this._router.url.split('/');
      if (pathLocation[2] === 'articles') {
        this.article.type = Type.Final;
      } else if (pathLocation[2] === 'variants') {
        this.article.type = Type.Variant;
      }
      // else if (pathLocation[2] === 'ingredientes') {
      //   this.article.type = Type.Ingredient;
      // }
      else {
        this.article.type = Type.Final;
      }

      if (this.article.provider == null) {
        this.article.providers = [];
      } else if (this.article.providers == undefined) {
        this.article.providers = [this.article.provider];
      } else if (this.article.providers.length == 0) {
        this.article.providers = [this.article.provider];
      }
      if (this.operation === 'add' || this.operation === 'copy') {
        this.saveArticle();
      } else if (this.operation === 'update') {
        this.updateArticle();
      }
    } else {
      this._toastService.showToast({
        message: 'Por favor, revisa los campos en rojo para continuar.',
      });
      this.onValueChanged();
    }
  }

  async saveArticle() {
    this.loading = true;

    if (await this.isValid()) {
      if (this.filesToUpload) this.article.picture = await this.uploadFile(this.article.picture);
      this._articleService.saveArticle(this.article).subscribe({
        next: (result) => {
          if (!result.result) {
            this._toastService.showToast(result);
            this.loading = false;
          } else {
            this.hasChanged = true;
            this.article = result.result;
            this._toastService.showToast(result);

            this.returnTo();
            this.loading = false;
          }
        },
        error: (err) => {
          this._toastService.showToast(err);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
    } else {
      this.loading = false;
    }
  }

  async updateArticle() {
    this.loading = true;
    if (await this.isValid()) {
      if (this.filesToUpload) this.article.picture = await this.uploadFile(this.article.picture);
      this._articleService.updateArticle(this.article).subscribe(
        async (result) => {
          if (!result.result) {
            this._toastService.showToast(result);
          } else {
            this.hasChanged = true;
            this.article = result.result;
            this.articleForm.patchValue({ meliId: this.article.meliId });
            this.articleForm.patchValue({ wooId: this.article.wooId });
            this._articleService.setItems(null);
            this._toastService.showToast(result);
            this.returnTo();
            this.loading = false;
          }
        },
        (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        }
      );
    }
  }

  async deleteArticle() {
    this.loading = true;
    this._articleService.delete(this.article._id).subscribe(
      (result: ApiResponse) => {
        if (result.status == 200) {
          this._toastService.showToast(result);
          this.returnTo();
        } else {
          this._toastService.showToast(result);
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error);
        this.loading = false;
      }
    );
  }

  getVariantsByArticleChild(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loading = true;
      let query = 'where="articleChild":"' + id + '"';

      this._variantService.getVariants(query).subscribe(
        (result) => {
          if (!result.variants) {
            resolve(null);
          } else {
            resolve(result.variants);
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error al obtener variantes:', error);
          // this.showMessage(error._body, 'danger', false);
          this.loading = false;
          reject(error);
        }
      );
    });
  }

  async uploadFile(pictureDelete: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (pictureDelete && pictureDelete.includes('https://storage.googleapis')) {
        await this.deleteFile(pictureDelete);
      }

      this._fileService.uploadImage(MediaCategory.ARTICLE, this.filesToUpload).then(
        (result: string) => {
          this.article.picture = result;
          this.imageURL = result;
          resolve(result);
        },
        (error) => this._toastService.showToast(JSON.parse(error))
      );
    });
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

  async isValid(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      // if (this.article.category) {
      //   const category: any =
      //     typeof this.article.category === 'string'
      //       ? this.categories.find(
      //           (category: any) => category._id === this.article.category
      //         )._id
      //       : this.article.category._id;
      //   await this.getCategories(`where="parent": "${category}"`).then(
      //     (result) => {
      //       if (result && result.length > 0) {
      //         this._toastService.showToast(
      //           null,
      //           'danger',
      //           undefined,
      //           'Debe seleccionar una categoría valida'
      //         );
      //         resolve(false);
      //       }
      //     }
      //   );
      // }
      // if (this.article.applications.length > 0 && this.article.type === Type.Final) {
      //   await this.getArticleURL().then((result) => {
      //     if (result) {
      //       this._toastService.showToast(null, 'danger', 'La URL ya esta en uso');
      //       resolve(false);
      //     } else {
      //       resolve(true);
      //     }
      //   });
      // } else {

      // }
      resolve(true);
    });
  }

  cleanForm() {
    this.article = new Article();
    this.taxes = new Array();
    this.filesToUpload = null;
    this.buildForm();
    this.variants = new Array();
    this.getLastArticle();
  }

  closeModal() {
    this.activeModal.close(this.hasChanged);
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

  addPicture(): void {
    this._articleService.makeFileRequest(MediaCategory.ARTICLE, this.filesToArray).then(
      (result: string) => {
        this.addPictureArray(result);
      },
      (error) => this._toastService.showToast(error)
    );
  }

  async addPictureArray(picture: string) {
    let valid = true;
    const pictures = this.articleForm.controls.pictures as UntypedFormArray;

    if (valid) {
      pictures.push(
        this._fb.group({
          _id: null,
          picture: picture,
        })
      );
    }
  }

  getAllUnitsOfMeasurement(match: {}): Promise<UnitOfMeasurement[]> {
    return new Promise<UnitOfMeasurement[]>((resolve, reject) => {
      this.subscription.add(
        this._unitOfMeasurementService
          .getAll({
            match,
            sort: { name: 1 },
            limit: 10,
          })
          .subscribe(
            (result) => {
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  getAllApplications(match: {}): Promise<Application[]> {
    return new Promise<Application[]>((resolve, reject) => {
      this.subscription.add(
        this._applicationService
          .getAll({
            match,
            sort: { name: 1 },
          })
          .subscribe(
            (result) => {
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  getAllAccounts(match: {}): Promise<Account[]> {
    return new Promise<Account[]>((resolve, reject) => {
      this.subscription.add(
        this._accountService
          .getAll({
            match,
            sort: { description: 1 },
          })
          .subscribe(
            (result) => {
              result.status === 200 ? resolve(result.result) : reject(result);
            },
            (error) => reject(error)
          )
      );
    });
  }

  addArticleTaxes(articleTaxes: Taxes[]): void {
    this.taxes = articleTaxes;
    this.updatePrices('taxes');
  }

  addStock(articleStock: ArticleStock): void {
    this.articleStock = articleStock;
  }

  manageVariants(variants: Variant[]): void {
    this.variants = variants;
  }

  async deletePicture(index: number, picture: string) {
    if (index !== null) {
      let control = <UntypedFormArray>this.articleForm.controls.pictures;
      control.removeAt(index);
    } else {
      this.article.picture = './../../../assets/img/default.jpg';
      this.imageURL = './../../../assets/img/default.jpg';
    }

    await this.deleteFile(picture);
  }
}
