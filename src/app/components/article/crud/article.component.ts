// Angular
import { DecimalPipe } from '@angular/common';
import { SlicePipe } from '@angular/common';
import { Component, OnInit, EventEmitter, Input, Output, ViewEncapsulation, ViewChild } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormArray,
  NgForm,
  FormArray,
  UntypedFormControl,
} from '@angular/forms';
import { Router } from '@angular/router';

// Terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal, NgbTypeaheadConfig } from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';

// Models
import { ToastrService } from 'ngx-toastr';
import { Subscription, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, map } from 'rxjs/operators';

import { Config } from '../../../app.config'
import { RoundNumberPipe } from '../../../main/pipes/round-number.pipe';
import { ArticleFieldType, ArticleField } from '../../article-field/article-field';
import { ArticleFields } from '../../article-field/article-fields';
import { ArticleStock } from '../../article-stock/article-stock';
import { ArticleStockService } from '../../article-stock/article-stock.service';
import { Category } from '../../category/category';
import { CategoryService } from '../../category/category.service';
import { Company, CompanyType } from '../../company/company';
import { Make } from '../../make/make';
import { MakeService } from '../../make/make.service';
import { Taxes } from '../../tax/taxes';
import { Variant } from '../../variant/variant';
import { VariantService } from '../../variant/variant.service';
import { Article, ArticlePrintIn, Type } from '../article';
import { ArticleService } from '../article.service';

import { Account } from '../../account/account';
import { AccountService } from '../../account/account.service';
import { Application, ApplicationType } from '../../application/application.model';
import { ApplicationService } from '../../application/application.service';
import { ArticleFieldService } from '../../article-field/article-field.service';
import { Classification } from '../../classification/classification';
import { ClassificationService } from '../../classification/classification.service';
import { CompanyService } from '../../company/company.service';
import { ConfigService } from '../../config/config.service';
import { Currency } from '../../currency/currency';

// Services

import { CurrencyService } from '../../currency/currency.service';

// Pipes
import { TaxClassification } from '../../tax/tax';
import { UnitOfMeasurement } from '../../unit-of-measurement/unit-of-measurement.model';
import { UnitOfMeasurementService } from '../../unit-of-measurement/unit-of-measurement.service';
import { TranslateMePipe } from '../../../main/pipes/translate-me';
import Resulteable from '../../../util/Resulteable';
import { ORIGINMEDIA } from 'app/types';
import { FileService } from 'app/services/file.service';
import { VariantType } from 'app/components/variant-type/variant-type';
import { VariantValue } from 'app/components/variant-value/variant-value';
import { VariantTypeService } from 'app/components/variant-type/variant-type.service';
import { VariantValueService } from 'app/components/variant-value/variant-value.service';
import { OrderByPipe } from 'app/main/pipes/order-by.pipe';
import { AddVariantComponent } from 'app/components/variant/add-variant/add-variant.component';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  providers: [NgbAlertConfig, DecimalPipe, ApplicationService, TranslateMePipe, NgbTypeaheadConfig],
  encapsulation: ViewEncapsulation.None,
})
export class ArticleComponent implements OnInit {
  public articleId: string;
  public operation: string;
  public readonly: boolean;
  public variant: Variant;
  private subscription: Subscription = new Subscription();
  article: Article;
  articleStock: ArticleStock;
  articles: Article[];
  config: Config;
  articleForm: UntypedFormGroup;
  public variantsByTypes: any[];
  currencies: Currency[] = new Array();
  makes: Make[] = new Array();
  classifications: Classification[] = new Array();
  companies: Company[] = new Array();
  categories: Category[] = new Array();
  variants: any = new Array();
  unitsOfMeasurement: UnitOfMeasurement[] = new Array();
  taxes: Taxes[] = new Array();
  otherFields: ArticleFields[] = new Array();
  printIns: ArticlePrintIn[] = [
    ArticlePrintIn.Counter,
    ArticlePrintIn.Kitchen,
    ArticlePrintIn.Bar,
    ArticlePrintIn.Voucher,
  ];
  alertMessage = '';
  userType: string;
  loading = false;
  focusEvent = new EventEmitter<boolean>();
  focusNoteEvent = new EventEmitter<boolean>();
  focusTagEvent = new EventEmitter<boolean>();
  apiURL = Config.apiURL;
  filesToUpload: Array<File>;
  filesToArray: Array<File>;
  hasChanged = false;
  roundNumber: RoundNumberPipe = new RoundNumberPipe();
  imageURL: string;
  articleType: string;
  filtersTaxClassification: TaxClassification[] = [TaxClassification.Tax];
  lastPricePurchase: number = 0.0;
  lastDatePurchase: string;
  otherFieldsAlfabetico = false;
  otherFieldsNumber = false;
  orientation: string = 'horizontal';
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

  public variantTypes: VariantType[];
  public variantTypeSelected: VariantType;
  public variantValueSelected: VariantValue;
  public variantValues: VariantValue[];
  public orderByPipe: OrderByPipe = new OrderByPipe();
  public pathUrl: string[]

  html = '';

  tinyMCEConfigBody = {
    selector: 'textarea',
    theme: 'modern',
    paste_data_images: true,
    plugins: [
      'advlist autolink lists link image charmap print preview hr anchor pagebreak',
      'searchreplace wordcount visualblocks visualchars code fullscreen',
      'insertdatetime media nonbreaking table contextmenu directionality',
      'emoticons template paste textcolor colorpicker textpattern',
    ],
    toolbar1:
      'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | forecolor backcolor emoticons | print preview fullscreen',
    image_advtab: true,
    height: 100,
    file_picker_types: 'file image media',
    images_dataimg_filter: function (img) {
      return img.hasAttribute('internal-blob');
    },
    file_picker_callback: function (callback, value, meta) {
      if (meta.filetype == 'image') {
        $('#upload').trigger('click');
        $('#upload').on('change', function () {
          let file = this.files[0];
          let reader = new FileReader();

          reader.onload = function (e) {
            callback(e.target['result'], {
              alt: '',
            });
          };
          reader.readAsDataURL(file);
        });
      }
    },
  };

  value;
  articleFieldSelected: ArticleField;
  articleFields: ArticleField[];
  articleFieldValues = [];
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
    codeProvider: ''
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
    unitOfMeasurement: { validateAutocomplete: 'Debe ingresar un valor válido' },
    currency: { maxlength: 'No puede exceder los 14 dígitos.' },
    note: {},
    tag: {},
  };

  searchCategories = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 0 ? []
        : this.categories.filter(v => v.description.toLowerCase().startsWith(term.toLocaleLowerCase())).slice(0, 10)
      )
    );

  formatterCategories = (value: any) => {
    if (value.parent && value.parent) {
      return value.description + ' - ' + this.categories.find((c: Category) => c._id === value.parent).description;
    }
    return value.description;
  }

  inputCategories = (value: any) => {
    let valueId = value._id === undefined ? value : value._id
    const category: any = this.categories.find((c: Category) => c._id === valueId);

    if (category.parent) {
      return category.description + ' - ' + this.categories.find((c: Category) => c._id === category.parent).description
    }

    return category?.description
  }

  searchMakes = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 0 ? []
        : this.makes.filter(v => v.description.toLowerCase().startsWith(term.toLocaleLowerCase())).slice(0, 10))
    );

  formatterMakes = (x: any) => {
    let valueId = x._id === undefined ? x : x._id
    const make = this.makes.find((c: Make) => c._id === valueId);
    return make.description
  };

  searchAccounts = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap(async (term) => {
        let match: {} =
          term && term !== ''
            ? {
              description: { $regex: term, $options: 'i' },
              mode: 'Analitico',
              operationType: { $ne: 'D' },
            }
            : {};

        return await this.getAllAccounts(match).then((result) => {
          return result;
        });
      }),
      tap(() => null),
    );
  formatterAccounts = (x: Account) => {
    return x.description;
  };

  searchUnitsOfMeasurement = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(term => term.length < 0 ? []
        : this.unitsOfMeasurement.filter(v => v.name.toLowerCase().startsWith(term.toLocaleLowerCase())).slice(0, 10))
    );
  formatterUnitsOfMeasurement = (x: any) => {
    let valueId = x._id === undefined ? x : x._id
    const unitsOfMeasurement = this.unitsOfMeasurement.find((u: UnitOfMeasurement) => u._id === valueId);
    return unitsOfMeasurement.name
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
    private _companyService: CompanyService,
    private _unitOfMeasurementService: UnitOfMeasurementService,
    private _articleFields: ArticleFieldService,
    private _applicationService: ApplicationService,
    private _accountService: AccountService,
    private _currencyService: CurrencyService,
    private _configService: ConfigService,
    private _toastr: ToastrService,
    public translatePipe: TranslateMePipe,
    public _fb: UntypedFormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _fileService: FileService,
    public _variantTypeService: VariantTypeService,
    public _variantValueService: VariantValueService,
    config: NgbTypeaheadConfig
  ) {
    config.showHint = true;
    if (window.screen.width < 1000) this.orientation = 'vertical';
    this.article = new Article();
    this.notes = new Array();
    this.tags = new Array();
    this.variantTypes = new Array();
    this.variantsByTypes = new Array();
    this.getCurrencies();
    this.getArticleTypes();

    const pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.operation = pathLocation[3]
    if (pathLocation[2] === 'article' || pathLocation[2] === 'articles') {
      this.articleType = 'Producto';
      this.readonly = false

      if (pathLocation[3] === 'view') this.readonly = true
      if (pathLocation[3] === 'add') this.getVariantTypes()
    } else if (pathLocation[2] === 'variants') {
      this.readonly = true
      this.articleType = 'Variante';
    }
    this.getArticleFields();
  }

  async ngOnInit() {
    this.pathUrl = this._router.url.split('/');
    this.operation = this.pathUrl[3];
    this.articleId = this.pathUrl[4];
    
    if (!this.variant) {
      this.variant = new Variant();
      this.variant.articleParent = this.article;
    }
    this.buildForm();
    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
      // AGREGAMOS VALIDACIÓN DE LONGITUD DE CÓDIGO INTERNO
      this.validationMessages.code[
        'maxlength'
      ] = `No puede exceder los ${this.config.article.code.validators.maxLength} carácteres.`;
      this.articleForm.controls['code'].setValidators([
        Validators.maxLength(this.config.article.code.validators.maxLength),
      ]);
      this.article.isWeigth = this.config.article.isWeigth.default;
      this.article.salesAccount = this.config.article.salesAccount.default;
      this.article.purchaseAccount = this.config.article.purchaseAccount.default;
      this.article.allowSaleWithoutStock =
        this.config.article.allowSaleWithoutStock.default || false;
    });
    this.getMake()
    this.getCategory()
    this.getUnitsOfMeasurement()
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
      .catch((error: Resulteable) => this.showToast(error));
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
        0, // SKIP
      )
      .subscribe(
        (result) => {
          if (result && result[0] && result[0].classifications) {
            this.classifications = result[0].classifications;
          } else {
            this.classifications = new Array();
          }
        },
        (error) => this.showToast(error),
      );
  }

  getArticleFields() {
    this._articleFields.getArticleFields().subscribe(
      (result) => {
        if (result && result.articleFields) {
          this.articleFields = result.articleFields;
        }
      },
      (error) => this.showToast(error),
    );
  }

  buildListArticleField(articleField: ArticleField) {
    this.articleFieldValues = [];
    this.value = '';

    if (articleField && articleField.datatype === ArticleFieldType.Array) {
      this.articleFieldValues = articleField.value.split(';');
    }
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
      otherFields: this._fb.array([]),
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
      variants: this._fb.array([])
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
              if (
                this.validationMessages[field][key] &&
                this.validationMessages[field][key] != 'undefined'
              ) {
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

  async addOtherField(otherFieldsForm: NgForm) {
    let valid = true;

    if (otherFieldsForm) {
      const otherFields = this.articleForm.controls.otherFields as UntypedFormArray;

      this.articleForm.controls.otherFields.value.forEach((element) => {
        if (otherFieldsForm.value.articleField._id == element.articleField) {
          valid = false;
          this.showToast(null, 'info', 'El campo ya existe');
        }
      });

      if (
        (otherFieldsForm.value && otherFieldsForm.value.value == '') ||
        otherFieldsForm.value.value == null
      ) {
        this.showToast(null, 'info', 'Debe ingresar un valor');
        valid = false;
      }

      if (valid) {
        otherFields.push(
          this._fb.group({
            _id: null,
            value: otherFieldsForm.value.value,
            articleField: otherFieldsForm.value.articleField._id,
            amount: otherFieldsForm.value.amount,
          }),
        );
        otherFieldsForm.resetForm();
        this.value = '';
      }
    }
  }

  deleteOtherField(index): void {
    let control = <UntypedFormArray>this.articleForm.controls.otherFields;

    control.removeAt(index);
  }

  getCurrencies(): void {
    this._currencyService.getCurrencies('sort="name":1').subscribe(
      (result) => {
        if (!result.currencies) {
        } else {
          this.currencies = result.currencies;
        }
      },
      (error) => this.showToast(error),
    );
  }

  getArticle(): void {
    this._articleService.getById(this.articleId).subscribe(
      (result: any) => {
        if (!result.result) {
          this.showToast(result);
        } else {
          this.article = result.result;
          this.notes = this.article.notes;
          this.tags = this.article.tags;
          this.taxes = this.article.taxes;
          this.totalTaxes = 0;
          for (let tax of this.taxes) {
            this.totalTaxes += tax.taxAmount;
          }
          this.imageURL = this.article.picture ?? './../../../assets/img/default.jpg'
          if (this.article.picture == 'default.jpg') this.imageURL = './../../../assets/img/default.jpg'

          if (this.article.containsVariants) {
            this.getVariantsByArticleParent();
          }else if(!this.article.containsVariants){
            this.getVariantTypes()
          }
          if (this.operation === 'copy') {
            this.article._id = null;
            this.article.code = '';
            this.article.posDescription = '';
            this.article.url = '';
            this.article.wooId = '';
          }
          this.setValuesForm();
          this.setValuesArray();
        }
      },
      (error) => this.showToast(error),
    );
  }

  public getVariantTypes(): void {

    this.loading = true;

    let query = 'sort="name":1,"order":1';

    this._variantTypeService.getVariantTypes(query).subscribe(
      result => {
        if (!result.variantTypes) {
          this.loading = false;
          this.variantTypes = new Array();
        } else {
          //  this.hideMessage();
          this.loading = false;
          this.variantTypes = result.variantTypes;
          if (this.variants && this.variants.length > 0) {
            for (let variant of this.variants) {
              this.setVariantByType(variant);
            }
          }
        }
      },
      error => {
        // this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  private setVariantByType(variant: Variant): void {
    let exist: boolean = false;
    for (let v of this.variantsByTypes) {
      if (v.type._id === variant.type._id) {
        exist = true;
        v.value.push(variant.value);
        v.value = this.orderByPipe.transform(v.value, ['description']);
        v.value = this.orderByPipe.transform(v.value, ['order']);
      }
    }

    if (!exist) {
      this.variantsByTypes.push({
        type: variant.type,
        value: [variant.value]
      });
      this.variantsByTypes = this.orderByPipe.transform(this.variantsByTypes, ['type'], 'name');
      this.variantsByTypes = this.orderByPipe.transform(this.variantsByTypes, ['type'], 'order');
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

  public getVariantValuesByType(variantType: VariantType): void {

    this.loading = true;

    let query = 'where="type":"' + variantType._id + '"&sort="order":1,"description":1';

    this._variantValueService.getVariantValues(query).subscribe(
      result => {
        if (!result.variantValues) {
          this.loading = false;
          this.variantValues = new Array();
        } else {
          //  this.hideMessage();
          this.loading = false;
          this.variantValues = result.variantValues;
        }
      },
      error => {
        //   this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueVariants(): void {

    if (!this.variant.type) this.variant.type = null;
    if (!this.variant.value) this.variant.value = null;
    const variantsArray = this.articleForm.get('variants') as FormArray;
  
    const variantGroup = this._fb.group({
      type: [this.variant.type, Validators.required],
      value: [this.variant.value, Validators.required]
    });
    
    variantsArray.push(variantGroup);
  }

  public addVariant(variantsForm: NgForm): void {
    if (typeof variantsForm.value.type !== 'undefined' && typeof variantsForm.value.value !== 'undefined' ) {
      this.variant = variantsForm.value

      //Comprobamos que la variante no existe
      if (!this.variantExists(this.variant)) {

        this.variant.articleParent = this.article;
        this.variants.push(this.variant);
        this.setVariantByType(this.variant);
        let variantTypeAux = this.variant.type;
        let variantValueAux = this.variant.value
        this.variant = new Variant();
        this.variant.type = variantTypeAux;
        this.variant.value = variantValueAux
        this.setValueVariants();
      } else {
        this.showToast(null, 'info', "La variante " + this.variant.type.name + " " + this.variant.value.description + " ya existe", 'info');
      }
    }
  }

  public variantExists(variant: Variant): boolean {

    let exists: boolean = false;

    if (this.variants && this.variants.length > 0) {
      for (let variantAux of this.variants) {
        if (variantAux.type._id === variant.type._id &&
          variantAux.value._id === variant.value._id) {
          exists = true;
        }
      }
    }

    return exists;
  }

  public deleteVariant(v) {

    let countvt: number = 0;

    for (let vt of this.variantsByTypes) {
      let typeId = v.type;
      if (v.type && v.type._id) {
        typeId = v.type._id;
      }
      if (vt.type._id === typeId) {
        let countval: number = 0;
        let delval: number = -1;
        for (let val of vt.value) {
          if (val._id == v._id) {
            delval = countval;

          }
          countval++;
        }
        if (delval !== -1) {
          vt.value.splice(delval, 1);
        }
        if (vt.value.length === 0) {
          this.variantsByTypes.splice(countvt, 1);
        }
      }
      countvt++;
    }

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
  }

  public getVariantValues(): void {

    this.loading = true;
    let project = {
      "_id": 1,
      "type": 1,
      "description": 1,
      "operationType": 1
    };
    let query = {
      operationType: { $ne: 'D' }
    }
    this._variantValueService.find({ project, query }).subscribe(
      result => {
        if (!result) {
          this.loading = false;
          this.variantValues = new Array();
        } else {
          this.loading = false;
          this.variantValues = result;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }

  public getCategory(): void {
    this.loading = true;

    let project = {
      "_id": 1,
      "description": 1,
      "parent": 1
    };
    let query = {
      operationType: { $ne: 'D' }
    }

    this._categoryService.find({ project, query }).subscribe(
      result => {
        if (!result) {
          this.loading = false;
          this.categories = new Array();
        } else {
          this.loading = false;
          this.categories = result;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }

  public getMake(): void {
    this.loading = true;

    let project = {
      "_id": 1,
      "description": 1,
      "operationType": 1
    };
    let query = {
      operationType: { $ne: 'D' }
    }

    this._makeService.find({ project, query }).subscribe(
      result => {
        if (!result) {
          this.loading = false;
          this.makes = new Array();
        } else {
          this.loading = false;
          this.makes = result;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }

  public getUnitsOfMeasurement(): void {
    this.loading = true;

    let project = {
      "_id": 1,
      "name": 1,
      "operationType": 1
    };
    let query = {
      operationType: { $ne: 'D' }
    }

    this._unitOfMeasurementService.find({ project, query }).subscribe(
      result => {
        if (!result) {
          this.loading = false;
          this.unitsOfMeasurement = new Array();
        } else {
          this.loading = false;
          this.unitsOfMeasurement = result;
        }
      },
      error => {
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
    if (this.article.otherFields && this.article.otherFields.length > 0) {
      let otherFields = this.articleForm.controls.otherFields as UntypedFormArray;

      this.article.otherFields.forEach((x) => {
        let articleFieldId;

        if (x.articleField && x.articleField._id && x.articleField.operationType != 'D') {
          articleFieldId = x.articleField._id;
          otherFields.push(
            this._fb.group({
              _id: null,
              articleField: articleFieldId,
              value: x.value,
            }),
          );
        }
      });
    }

    if (this.article.pictures && this.article.pictures.length > 0) {
      let pictures = this.articleForm.controls.pictures as UntypedFormArray;

      this.article.pictures.forEach((x) => {
        pictures.push(
          this._fb.group({
            _id: null,
            picture: x.picture,
            meliId: x.meliId,
          }),
        );
      });
    }

    if (this.article.variants && this.article.variants.length > 0) {
      let variants = this.articleForm.controls.variants as UntypedFormArray;

      this.article.variants.forEach((x) => {
        variants.push(
          this._fb.group({
            'type': x.type,
            'value': x.value,
          }),
        );
      });
    }

    if (this.applications && this.applications.length > 0) {
      this.applications.forEach((x) => {
        let exists = false;

        this.article.applications.forEach((y) => {
          const app: any= typeof y === 'string' ? this.applications.find((app)=> app._id === y) : y._id
          if (x._id === app._id) {
            exists = true;
            const control = new UntypedFormControl(true); // if first item set to true, else false

            (this.articleForm.controls.applications as UntypedFormArray).push(control);
          }
        });
        if (!exists) {
          const control = new UntypedFormControl(false); // if first item set to true, else false

          (this.articleForm.controls.applications as UntypedFormArray).push(control);
        }
      });
    }   
  }

  getVariantsByArticleParent(): void {
    let query = 'where="articleParent":"' + this.article._id + '"';

    this._variantService.getVariants(query).subscribe(
      (result) => {
        if (!result.variants) {
          this.variants = new Array();
        } else {
          this.variants = this.getUniqueVariants(result.variants);
          this.getVariantTypes()
        }
      },
      (error) => this.showToast(error),
    );
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
          code = result.code
        }
        this.article.code = code

        this.setValuesForm();
      },
      (error) => this.showToast(error),
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

  saveArticleStock(): void {
    if (!this.articleStock) {
      this.articleStock = new ArticleStock();
    }

    if (this.articleStock && !this.articleStock.article) {
      this.articleStock.article = this.article;
    }

    this._articleStockService.saveArticleStock(this.articleStock).subscribe(
      (result) => {
        if (!result.articleStock) {
          this.showToast(result);
        } else {
          this.articleStock = result.articleStock;
        }
      },
      (error) => this.showToast(error),
    );
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
        (error) => this.showToast(error),
      );
    });
  }

  updatePrices(op): void {
    let taxedAmount = 0;

    switch (op) {
      case 'basePrice':
        this.articleForm.value.costPrice = 0;
        taxedAmount = this.articleForm.value.basePrice;

        if (this.otherFields && this.otherFields.length > 0) {
          for (const field of this.otherFields) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform(
                (this.articleForm.value.basePrice * parseFloat(field.value)) / 100,
              );
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
            if (field.articleField.modifyVAT) {
              taxedAmount += field.amount;
            } else {
              if (field.amount) {
                this.articleForm.value.costPrice += field.amount;
              }
            }
          }
        }

        if (this.taxes && this.taxes.length > 0) {
          this.totalTaxes = 0;
          for (const articleTax of this.taxes) {
            if (articleTax.tax.percentage && articleTax.tax.percentage != 0) {
              articleTax.taxBase = taxedAmount;
              articleTax.taxAmount = this.roundNumber.transform(
                (taxedAmount * articleTax.percentage) / 100,
              );
              this.totalTaxes += articleTax.taxAmount;
            }
            this.articleForm.value.costPrice += articleTax.taxAmount;
          }
        }
        this.articleForm.value.costPrice += taxedAmount;

        if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) /
            100,
          );
          this.articleForm.value.salePrice =
            this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'otherFields':
        this.articleForm.value.costPrice = 0;
        taxedAmount = this.articleForm.value.basePrice;

        if (this.otherFields && this.otherFields.length > 0) {
          for (const field of this.otherFields) {
            if (
              field.articleField.datatype === ArticleFieldType.Percentage ||
              field.articleField.datatype === ArticleFieldType.Number
            ) {
              if (field.articleField.datatype === ArticleFieldType.Percentage) {
                field.amount = this.roundNumber.transform(
                  (this.articleForm.value.basePrice * parseFloat(field.value)) / 100,
                );
              } else if (field.articleField.datatype === ArticleFieldType.Number) {
                field.amount = parseFloat(field.value);
              }
              if (field.articleField.modifyVAT) {
                taxedAmount += field.amount;
              } else {
                this.articleForm.value.costPrice += field.amount;
              }
            }
          }
        }

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
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) /
            100,
          );
          this.articleForm.value.salePrice =
            this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'taxes':
        this.articleForm.value.costPrice = 0;
        taxedAmount = this.articleForm.value.basePrice;

        if (this.otherFields && this.otherFields.length > 0) {
          for (const field of this.otherFields) {
            if (
              field.articleField.datatype === ArticleFieldType.Percentage ||
              field.articleField.datatype === ArticleFieldType.Number
            ) {
              if (field.articleField.datatype === ArticleFieldType.Percentage) {
                field.amount = this.roundNumber.transform(
                  (this.articleForm.value.basePrice * parseFloat(field.value)) / 100,
                );
              } else if (field.articleField.datatype === ArticleFieldType.Number) {
                field.amount = parseFloat(field.value);
              }
              if (field.articleField.modifyVAT) {
                taxedAmount += field.amount;
              } else {
                this.articleForm.value.costPrice += field.amount;
              }
            }
          }
        }

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
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) /
            100,
          );
          this.articleForm.value.salePrice =
            this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPercentage':
        if (
          !(
            this.articleForm.value.basePrice === 0 &&
            this.articleForm.value.salePrice !== 0
          )
        ) {
          this.articleForm.value.markupPrice = this.roundNumber.transform(
            (this.articleForm.value.costPrice * this.articleForm.value.markupPercentage) /
            100,
          );
          this.articleForm.value.salePrice =
            this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPrice':
        if (
          !(
            this.articleForm.value.basePrice === 0 &&
            this.articleForm.value.salePrice !== 0
          )
        ) {
          this.articleForm.value.markupPercentage = this.roundNumber.transform(
            (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100,
          );
          this.articleForm.value.salePrice =
            this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'salePrice':
        if (this.articleForm.value.basePrice === 0) {
          this.articleForm.value.costPrice === 0;
          this.articleForm.value.markupPercentage = 100;
          this.articleForm.value.markupPrice = this.articleForm.value.salePrice;
        } else {
          this.articleForm.value.markupPrice =
            this.articleForm.value.salePrice - this.articleForm.value.costPrice;
          this.articleForm.value.markupPercentage = this.roundNumber.transform(
            (this.articleForm.value.markupPrice / this.articleForm.value.costPrice) * 100,
          );
        }
        break;
      default:
        break;
    }

    this.articleForm.value.basePrice = this.roundNumber.transform(
      this.articleForm.value.basePrice,
    );
    this.articleForm.value.costPrice = this.roundNumber.transform(
      this.articleForm.value.costPrice,
    );
    this.articleForm.value.markupPercentage = this.roundNumber.transform(
      this.articleForm.value.markupPercentage,
    );
    this.articleForm.value.markupPrice = this.roundNumber.transform(
      this.articleForm.value.markupPrice,
    );
    this.articleForm.value.salePrice = this.roundNumber.transform(
      this.articleForm.value.salePrice,
    );
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
    if (!this.article._id) {
      this.article._id = '';
    }
    if (!this.article.code) {
      this.article.code = this.padString(
        1,
        this.config.article.code.validators.maxLength,
      );
    }
    if (!this.article.codeSAT) {
      this.article.codeSAT = '';
    }
    if (!this.article.order) {
      this.article.order = 1;
    }

    let currency;

    if (!this.article.currency) {
      currency = null;
    } else {
      if (this.article.currency._id) {
        currency = this.article.currency._id;
      } else {
        currency = this.article.currency;
      }
    }

    let providers;

    if (!this.article.providers || this.article.providers.length === 0) {
      providers = null;
    } else {
      if (this.article.providers[0]._id) {
        providers = this.article.providers[0]._id;
      } else {
        providers = this.article.providers;
      }
    }

    let provider;

    if (!this.article.provider || this.article.provider === null) {
      provider = null;
      providers = null;
    } else {
      if (this.article.provider._id) {
        provider = this.article.provider._id;
        providers = this.article.provider._id;
      } else {
        provider = this.article.provider;
        providers = this.article.provider;
      }
    }

    let classification;

    if (!this.article.classification) {
      classification = null;
    } else {
      if (this.article.classification[0]._id) {
        classification = this.article.classification[0]._id;
      } else {
        classification = this.article.classification;
      }
    }

    if (!this.article.description) {
      this.article.description = '';
    }
    if (!this.article.posDescription) {
      this.article.posDescription = '';
    }
    if (!this.article.basePrice) {
      this.article.basePrice = 0.0;
    }
    if (!this.article.costPrice) {
      this.article.costPrice = 0.0;
    }
    if (!this.article.markupPercentage) {
      this.article.markupPercentage = 0.0;
    }
    if (!this.article.markupPrice) {
      this.article.markupPrice = 0.0;
    }
    if (!this.article.salePrice) {
      this.article.salePrice = 0.0;
    }
    if (!this.article.quantityPerMeasure) {
      this.article.quantityPerMeasure = 1;
    }
    if (!this.article.observation) {
      this.article.observation = '';
    }
    if (!this.article.barcode) {
      this.article.barcode = '';
    }
    if (!this.article.printIn) {
      this.article.printIn = ArticlePrintIn.Counter;
    }
    if (this.article.allowPurchase === undefined) {
      this.article.allowPurchase = true;
    }
    if (this.article.allowSale === undefined) {
      this.article.allowSale = true;
    }
    if (this.article.allowSaleWithoutStock === undefined) {
      this.article.allowSaleWithoutStock = false;
    }
    if (this.article.ecommerceEnabled === undefined) {
      this.article.ecommerceEnabled = false;
    }
    if (this.article.posKitchen === undefined) {
      this.article.posKitchen = false;
    }
    if (this.article.isWeigth === undefined) {
      this.article.isWeigth = false;
    }
    if (this.article.forShipping === undefined) {
      this.article.forShipping = false;
    }
    if (!this.article.url) {
      this.article.url = '';
    }
    if (!this.article.unitOfMeasurement) {
      this.article.unitOfMeasurement = null;
    }
    if (!this.article.salesAccount) {
      this.article.salesAccount = null;
    }
    if (!this.article.purchaseAccount) {
      this.article.purchaseAccount = null;
    }
    if (!this.article.make) {
      this.article.make = null;
    }
    if (!this.article.weight) {
      this.article.weight = null;
    }
    if (!this.article.height) {
      this.article.height = null;
    }
    if (!this.article.width) {
      this.article.width = null;
    }
    if (!this.article.depth) {
      this.article.depth = null;
    }

    this.article.basePrice = this.roundNumber.transform(this.article.basePrice);
    this.article.costPrice = this.roundNumber.transform(this.article.costPrice);
    this.article.markupPercentage = this.roundNumber.transform(
      this.article.markupPercentage,
    );
    this.article.markupPrice = this.roundNumber.transform(this.article.markupPrice, 3);
    this.article.salePrice = this.roundNumber.transform(this.article.salePrice);
    this.markupPriceWithoutVAT = this.roundNumber.transform(
      (this.article.basePrice * this.article.markupPercentage) / 100,
    );
    this.salePriceWithoutVAT = this.roundNumber.transform(
      this.article.basePrice + this.markupPriceWithoutVAT,
    );

    let lastPricePurchase: number = 0;

    if (this.lastPricePurchase && this.lastPricePurchase != 0)
      lastPricePurchase = this.lastPricePurchase;

    if (!this.variant.type) this.variant.type = null;
    if (!this.variant.value) this.variant.value = null;


    const values = {
      _id: this.article._id,
      order: this.article.order,
      code: this.article.code,
      codeSAT: this.article.codeSAT,
      currency: currency,
      make: this.article.make,
      description: this.article.description,
      posDescription: this.article.posDescription,
      basePrice: this.article.basePrice,
      costPrice: this.article.costPrice,
      costPrice2: this.article.costPrice2,
      markupPercentage: this.article.markupPercentage,
      markupPrice: this.article.markupPrice,
      markupPriceWithoutVAT: this.markupPriceWithoutVAT,
      salePrice: this.article.salePrice,
      salePriceWithoutVAT: this.salePriceWithoutVAT,
      category: this.article.category,
      quantityPerMeasure: this.article.quantityPerMeasure,
      unitOfMeasurement: this.article.unitOfMeasurement,
      observation: this.article.observation,
      barcode: this.article.barcode,
      printIn: this.article.printIn,
      allowPurchase: this.article.allowPurchase,
      allowSale: this.article.allowSale,
      allowSaleWithoutStock: this.article.allowSaleWithoutStock,
      isWeigth: this.article.isWeigth,
      allowMeasure: this.article.allowMeasure,
      ecommerceEnabled: this.article.ecommerceEnabled,
      posKitchen: this.article.posKitchen,
      favourite: this.article.favourite,
      providers: provider,
      provider: provider,
      lastPricePurchase: lastPricePurchase,
      classification: classification,
      url: this.article.url,
      forShipping: this.article.forShipping,
      salesAccount: this.article.salesAccount,
      purchaseAccount: this.article.purchaseAccount,
      minStock: this.article.minStock,
      maxStock: this.article.maxStock,
      pointOfOrder: this.article.pointOfOrder,
      codeProvider: this.article.codeProvider,
      allowStock: this.article.allowStock,
      wooId: this.article.wooId,
      purchasePrice: this.article.purchasePrice,
      m3: this.article.m3,
      weight: this.article.weight,
      height: this.article.height,
      width: this.article.width,
      depth: this.article.depth,
      showMenu: this.article.showMenu ?? '',
      tiendaNubeId: this.article.tiendaNubeId,
    };

    this.articleForm.patchValue(values);
  }

  addArticle(): void {
    if (this.articleForm.valid) {
      this.loadPosDescription();
      //this.loadURL();

      this.article = Object.assign(this.article, this.articleForm.value);
      if (this.article.make && this.article.make.toString() === '')
        this.article.make = null;
      if (this.article.category && this.article.category.toString() === '')
        this.article.category = null;
      if (
        this.article.unitOfMeasurement &&
        this.article.unitOfMeasurement.toString() === ''
      )
        this.article.unitOfMeasurement = null;
      this.article.notes = this.notes;
      this.article.tags = this.tags;
      if (this.variants && this.variants.length > 0) {
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
      this.showToast({ message: 'Revisa los errores en el formulario.' });
      this.onValueChanged();
    }
  }

  async saveArticle() {
    this.loading = true;

    if (await this.isValid()) {

      if (this.filesToUpload) this.article.picture = await this.uploadFile(this.article.picture);
      this._articleService.saveArticle(this.article).subscribe(
        (result) => {
          if (!result.resultParent.result) {
            this.showToast(
              null,
              'info',
              result.resultParent.error && result.resultParent.error.message
                ? result.resultParent.error.message
                : result.resultParent.message
                  ? result.resultParent.message
                  : '',
            );
          } else {
            this.hasChanged = true;
            this.article = result.resultParent.result;
            this.showToast(null, 'success', 'El producto se ha añadido con éxito.');
     
            if (this.pathUrl[2] === "article") {
              this._router.navigate(['/admin/articles']);
            } else {
              this._router.navigate(['/admin/variants']);
            }
            this.loading = false;
          }
        },
        (error) => {
          this.showToast(error)
          this.loading = false
        }
      );
    } else {
      this.loading = false;
    }
  }

  async updateArticle() {
    this.loading = true;
    if (await this.isValid()) {

      if (this.filesToUpload) this.article.picture = await this.uploadFile(this.article.picture);
      this._articleService.updateArticle(this.article, this.variants).subscribe(
        async (result) => {
          if (!result.article) {
            this.showToast(
              null,
              'info',
              result.error && result.error.message
                ? result.error.message
                : result.message
                  ? result.message
                  : '',
            );
          } else {
            this.hasChanged = true;
            this.article = result.article;
            this.articleForm.patchValue({ meliId: this.article.meliId });
            this.articleForm.patchValue({ wooId: this.article.wooId });
            this._articleService.setItems(null);
            this.showToast(null, 'success', 'Operación realizada con éxito');
            if (this.pathUrl[2] === "articles") {
              this._router.navigate(['/admin/articles']);
            } else {
              this._router.navigate(['/admin/variants']);
            }
            this.loading = false

            if (this.article.applications.some(application => application.type === ApplicationType.TiendaNube)) {
              if (this.article.type === Type.Final) {
                this.updateArticleTiendaNube(this.article._id)
              } else if (this.article.type === Type.Variant) {
                const result = await this.getVariantsByArticleChild(this.article._id);
                if (result && result.length > 0) {
                  if (result[0] && result[0].articleParent._id) {
                    this.updateArticleTiendaNube(result[0].articleParent._id);
                  }
                }
              }
            } else if (this.article.tiendaNubeId && this.article.type === Type.Final) {
              this.deleteArticleTiendaNube();
            }
          }
        },
        (error) => {
          this.showToast(error)
          this.loading = false
        }
      );
    }
  }

  async deleteArticle() {
    this.loading = true;

    this._articleService.delete(this.article._id).subscribe(
      (result: Resulteable) => {
        if (result.status == 200) {
          if (this.pathUrl[2] === "article") {
            this._router.navigate(['/admin/articles']);
          } else {
            this._router.navigate(['/admin/variants']);
          }
          if (this.article.tiendaNubeId) {
            this.deleteArticleTiendaNube();
          }
        } else {
          this.showToast(result);
        }
        this.loading = false;
      },
      (error) => {
        this.showToast(error)
        this.loading = false;
      }
    );
  }

  async deleteArticleTiendaNube() {
    this.loading = true;

    this._articleService.deleteArticleTiendaNube(this.article.tiendaNubeId).subscribe(
      (result) => {
        if (result.error) {
          this.showToast(
            null,
            'info',
            result.error && result.error.message
              ? result.error.message
              : result.message
                ? result.message
                : '',
          );
        } else {
          this.showToast(null, 'success', 'Producto eliminado con éxito en TiendaNube');
        }
        this.loading = false
      },
      (error) => {
        this.showToast(error)
        this.loading = false
      }
    );
  }

  async updateArticleTiendaNube(articleId) {
    this.loading = true;

    this._articleService.updateArticleTiendaNube(articleId).subscribe(
      (result) => {
        if (result.error) {
          this.showToast(
            null,
            'info',
            result.error && result.error.message
              ? result.error.message
              : result.message
                ? result.message
                : '',
          );
        } else {
          this.showToast(null, 'success', 'Producto actualizado con éxito en TiendaNube');
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        this.showToast(error)
      }
    );
  }

  getVariantsByArticleChild(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loading = true;
      let query = 'where="articleChild":"' + id + '"';

      this._variantService.getVariants(query)
        .subscribe(
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
          },
        );
    });
  }

  async uploadFile(pictureDelete: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if (pictureDelete && pictureDelete.includes('https://storage.googleapis')) {
        await this.deleteFile(pictureDelete);
      }

      this._fileService
        .uploadImage(ORIGINMEDIA.ARTICLES, this.filesToUpload)
        .then(
          (result: string) => {
            this.article.picture = result;
            this.imageURL = result;
            resolve(result);
          },
          (error) => this.showToast(JSON.parse(error))

        )
    })
  }

  async deleteFile(pictureDelete: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this._fileService.deleteImage(pictureDelete).subscribe(
        (result) => {
          resolve(true)
        },
        (error) => {
          this.showToast(error.messge)
          resolve(true)
        }
      )
    })
  }

  async isValid(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      if (this.article.category) {
        await this.getCategories(`where="parent": "${this.article.category._id}"`).then(
          (result) => {
            if (result && result.length > 0) {
              this.showToast(null, 'danger', 'Debe seleccionar una categoría valida');
              resolve(false);
            }
          },
        );
      }
      // if (this.article.applications.length > 0 && this.article.type === Type.Final) {
      //   await this.getArticleURL().then((result) => {
      //     if (result) {
      //       this.showToast(null, 'danger', 'La URL ya esta en uso');
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
    this.otherFields = new Array();
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
        }
        // Coloca la siguiente línea fuera del evento onload
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }

  addPicture(): void {
    this._articleService
      .makeFileRequest(ORIGINMEDIA.ARTICLES, this.filesToArray)
      .then(
        (result: string) => {
          this.addPictureArray(result);
        },
        (error) => this.showToast(error),
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
        }),
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
            (error) => reject(error),
          ),
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
            (error) => reject(error),
          ),
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
            (error) => reject(error),
          ),
      );
    });
  }

  addArticleTaxes(articleTaxes: Taxes[]): void {
    this.taxes = articleTaxes;
    this.updatePrices('taxes');
  }

  addArticleFields(): void {
    this.updatePrices('otherFields');
  }

  addStock(articleStock: ArticleStock): void {
    this.articleStock = articleStock;
  }

  manageVariants(variants: Variant[]): void {
    this.variants = variants;
  }

  showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title =
          result.error && result.error.message ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      case 'danger':
        this._toastr.error(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
      default:
        this._toastr.info(
          this.translatePipe.translateMe(message),
          this.translatePipe.translateMe(title),
        );
        break;
    }
    this.loading = false;
  }

  async deletePicture(index: number, picture: string) {

    if (index !== null) {
      let control = <UntypedFormArray>this.articleForm.controls.pictures;
      control.removeAt(index);
    } else {
      this.article.picture = './../../../assets/img/default.jpg';
      this.imageURL = "./../../../assets/img/default.jpg"
    }

    await this.deleteFile(picture)
  }
}
