// Angular
import {DecimalPipe} from '@angular/common';
import {SlicePipe} from '@angular/common';
import {Component, OnInit, EventEmitter, Input, ViewEncapsulation} from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormArray,
  NgForm,
  UntypedFormControl,
} from '@angular/forms';
import {Router} from '@angular/router';

// Terceros
import {NgbAlertConfig, NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as $ from 'jquery';

// Models
import {ToastrService} from 'ngx-toastr';
import {Subscription, Observable, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, tap, switchMap} from 'rxjs/operators';

import {Config} from '../../../app.config';
import {RoundNumberPipe} from '../../../main/pipes/round-number.pipe';
import {ArticleFieldType, ArticleField} from '../../article-field/article-field';
import {ArticleFields} from '../../article-field/article-fields';
import {ArticleStock} from '../../article-stock/article-stock';
import {ArticleStockService} from '../../article-stock/article-stock.service';
import {Category} from '../../category/category';
import {CategoryService} from '../../category/category.service';
import {Company, CompanyType} from '../../company/company';
import {Deposit} from '../../deposit/deposit';
import {DepositService} from '../../deposit/deposit.service';
import {Location} from '../../location/location';
import {LocationService} from '../../location/location.service';
import {Make} from '../../make/make';
import {MakeService} from '../../make/make.service';
import {Taxes} from '../../tax/taxes';
import {Variant} from '../../variant/variant';
import {VariantService} from '../../variant/variant.service';
import {Article, ArticlePrintIn, IMeliAttrs, Type} from '../article';
import {ArticleService} from '../article.service';

import {Account} from './../../../components/account/account';
import {AccountService} from './../../../components/account/account.service';
import {Application} from './../../../components/application/application.model';
import {ApplicationService} from './../../../components/application/application.service';
import {ArticleFieldService} from './../../../components/article-field/article-field.service';
import {Classification} from './../../../components/classification/classification';
import {ClassificationService} from './../../../components/classification/classification.service';
import {CompanyService} from './../../../components/company/company.service';
import {ConfigService} from './../../../components/config/config.service';
import {Currency} from './../../../components/currency/currency';

// Services

import {CurrencyService} from './../../../components/currency/currency.service';

// Pipes
import {TaxClassification} from './../../../components/tax/tax';
import {UnitOfMeasurement} from './../../../components/unit-of-measurement/unit-of-measurement.model';
import {UnitOfMeasurementService} from './../../../components/unit-of-measurement/unit-of-measurement.service';
import {TranslateMePipe} from './../../../main/pipes/translate-me';
import Resulteable from './../../../util/Resulteable';
import { ORIGINMEDIA } from 'app/types';
import { FileService } from 'app/services/file.service';

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.scss'],
  providers: [NgbAlertConfig, DecimalPipe, ApplicationService, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AddArticleComponent implements OnInit {
  @Input() articleId: string;
  @Input() operation: string;
  @Input() readonly: boolean;

  private subscription: Subscription = new Subscription();

  article: Article;
  articleStock: ArticleStock;
  articles: Article[];
  config: Config;
  articleForm: UntypedFormGroup;
  newDeposit: UntypedFormGroup;
  newLocation: UntypedFormGroup;
  currencies: Currency[] = new Array();
  makes: Make[] = new Array();
  classifications: Classification[] = new Array();
  companies: Company[] = new Array();
  deposits: Deposit[] = new Array();
  locations: Location[] = new Array();
  categories: Category[] = new Array();
  variants: Variant[] = new Array();
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
  meliAttrs: IMeliAttrs;
  database: string;

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
    deposit: '',
    location: '',
    barcode: '',
    currency: '',
    providers: '',
    provider: '',
    note: '',
  };

  validationMessages = {
    code: {required: 'Este campo es requerido.'},
    make: {validateAutocomplete: 'Debe ingresar un valor válido'},
    description: {required: 'Este campo es requerido.'},
    posDescription: {maxlength: 'No puede exceder los 20 carácteres.'},
    basePrice: {required: 'Este campo es requerido.'},
    costPrice: {required: 'Este campo es requerido.'},
    markupPercentage: {required: 'Este campo es requerido.'},
    markupPrice: {required: 'Este campo es requerido.'},
    salePrice: {required: 'Este campo es requerido.'},
    category: {
      required: 'Este campo es requerido.',
      validateAutocomplete: 'Debe ingresar un valor válido',
    },
    deposit: {required: 'Este campo es requerido'},
    location: {},
    unitOfMeasurement: {validateAutocomplete: 'Debe ingresar un valor válido'},
    currency: {maxlength: 'No puede exceder los 14 dígitos.'},
    note: {},
    tag: {},
  };

  searchCategories = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap(
        async (term) =>
          await this.getCategories(
            `where="description": { "$regex": "${term}", "$options": "i" }&sort="description":1&limit=10`,
          ).then((categories) => {
            return categories;
          }),
      ),
      tap(() => null),
    );

  formatterCategories(value: Category) {
    if (value.parent && value.parent.description)
      return value.description + ' - ' + value.parent.description;

    return value.description;
  }

  inputCategories(value: Category) {
    if (value.parent && value.parent.description)
      return value.description + ' - ' + value.parent.description;

    return value.description;
  }

  searchMakes = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap((term) =>
        this.getMakes(
          `where="description": { "$regex": "${term}", "$options": "i" }&sort="description":1&limit=10`,
        ).then((makes) => {
          return makes;
        }),
      ),
      tap(() => null),
    );

  formatterMakes = (x: {description: string}) => x.description;

  searchUnitsOfMeasurement = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => null),
      switchMap(async (term) => {
        let match: {} = term && term !== '' ? {name: {$regex: term, $options: 'i'}} : {};

        return await this.getAllUnitsOfMeasurement(match).then((result) => {
          return result;
        });
      }),
      tap(() => null),
    );
  formatterUnitsOfMeasurement = (x: UnitOfMeasurement) => {
    return x.name;
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
                description: {$regex: term, $options: 'i'},
                mode: 'Analitico',
                operationType: {$ne: 'D'},
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

  constructor(
    private _articleService: ArticleService,
    private _articleStockService: ArticleStockService,
    private _variantService: VariantService,
    private _depositService: DepositService,
    private _locationService: LocationService,
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
    public _fileService: FileService
  ) {
    if (window.screen.width < 1000) this.orientation = 'vertical';
    this.article = new Article();
    this.notes = new Array();
    this.tags = new Array();
    this.getCurrencies();
    this.getArticleTypes();

    const pathLocation: string[] = this._router.url.split('/');

    this.userType = pathLocation[1];
    if (pathLocation[2] === 'productos') {
      this.articleType = 'Producto';
    } else if (pathLocation[2] === 'variantes') {
      this.articleType = 'Variante';
    }
    this.getArticleFields();
    this.getDeposits();
  }

  async ngOnInit() {
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

    if (this.articleId) {
      this.getArticle();
    } else {
      this.imageURL = './../../../assets/img/default.jpg';
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
      count: {$sum: 1},
      classifications: {$push: '$$ROOT'},
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
      make: [this.article.make, [this.validateAutocomplete]],
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
      category: [this.article.category, [Validators.required, this.validateAutocomplete]],
      quantityPerMeasure: [this.article.quantityPerMeasure, []],
      unitOfMeasurement: [this.article.unitOfMeasurement, [this.validateAutocomplete]],
      deposits: this._fb.array([]),
      locations: this._fb.array([]),
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
      meliAttrs: [this.article.meliAttrs, []],
      wooId: [this.article.wooId, []],
      purchasePrice: [this.article.purchasePrice, []],
    });

    this.newDeposit = this._fb.group({
      deposit: [null, []],
    });
    this.newLocation = this._fb.group({
      location: [null, []],
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

  getDeposit(id: string): Promise<Deposit> {
    return new Promise<Deposit>((resolve, reject) => {
      this._depositService.getDeposit(id).subscribe((result) => {
        if (result && result.deposit) {
          resolve(result.deposit);
        } else {
          resolve(null);
        }
      });
    });
  }

  async addDeposit(depositForm: any) {
    depositForm = this.newDeposit;
    let valid = true;
    const deposits = this.articleForm.controls.deposits as UntypedFormArray;

    let deposit = await this.getDeposit(depositForm.value.deposit);

    for (const element of this.articleForm.controls.deposits.value) {
      let depositAux = await this.getDeposit(element.deposit);

      if (depositAux.branch._id === deposit.branch._id) {
        valid = false;
        this.showToast(null, 'info', 'Solo puede tener un depósito por sucursal.');
      }
    }

    this.articleForm.controls.deposits.value.forEach((element) => {
      if (depositForm.value.deposit == element.deposit) {
        valid = false;
        this.showToast(null, 'info', 'El depósito ya existe');
      }
    });

    if (
      depositForm.value.deposit == '' ||
      depositForm.value.deposit == 0 ||
      depositForm.value.deposit == null
    ) {
      this.showToast(null, 'info', 'Debe seleccionar un depósito');
      valid = false;
    }

    if (valid) {
      deposits.push(
        this._fb.group({
          _id: null,
          deposit: depositForm.value.deposit,
          capacity: 0,
        }),
      );
      // depositForm.resetForm();
    }
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

  async addLocation(locationForm: any) {
    locationForm = this.newLocation;
    let valid = true;
    const locations = this.articleForm.controls.locations as UntypedFormArray;

    if (
      (locationForm && locationForm.value && locationForm.value.location == '') ||
      locationForm.value.location == null
    ) {
      this.showToast(null, 'info', 'Debe seleccionar una ubicación.');
      valid = false;
    }

    this.articleForm.controls.locations.value.forEach((element) => {
      if (
        locationForm &&
        locationForm.value &&
        locationForm.value.location == element.location
      ) {
        valid = false;
        this.showToast(null, 'info', 'La ubicación ya existe.');
      }
    });

    if (valid) {
      locations.push(
        this._fb.group({
          _id: null,
          location: locationForm.value.location || null,
        }),
      );
      // locationForm.resetForm();
    }
  }

  deleteDeposit(index): void {
    let control = <UntypedFormArray>this.articleForm.controls.deposits;

    control.removeAt(index);
  }

  deleteOtherField(index): void {
    let control = <UntypedFormArray>this.articleForm.controls.otherFields;

    control.removeAt(index);
  }

  deleteLocation(index): void {
    let control = <UntypedFormArray>this.articleForm.controls.locations;

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
    this._articleService.getArticle(this.articleId).subscribe(
      (result: any) => {
        if (!result.article) {
          this.showToast(result);
        } else {
          this.article = result.article;
          this.meliAttrs = Object.assign({}, this.article.meliAttrs);
          this.notes = this.article.notes;
          this.tags = this.article.tags;
          this.taxes = this.article.taxes;
          this.totalTaxes = 0;
          for (let tax of this.taxes) {
            this.totalTaxes += tax.taxAmount;
          }
          if (this.article.url === '') {
            this.loadURL();
          }


          this.imageURL = this.article.picture ?? './../../../assets/img/default.jpg'

          if (this.article.containsVariants) {
            this.getVariantsByArticleParent();
          }
          if (this.operation === 'copy') {
            this.article._id = null;
            this.article.code = '';
            this.article.posDescription = '';
            this.article.url = '';
            this.article.meliId = '';
            this.article.wooId = '';
          }
          this.setValuesForm();
          this.setValuesArray();
        }
      },
      (error) => this.showToast(error),
    );
  }

  loadURL(): void {
    if (this.articleForm.value.url === '') {
      let url = this.articleForm.value.description
        .split(' ')
        .join('-')
        .split(':')
        .join('')
        .split('.')
        .join('')
        .split('"')
        .join('')
        .split('“')
        .join('')
        .split('”')
        .join('')
        .split('?')
        .join('')
        .split('/')
        .join('-')
        .split('\\')
        .join('-')
        .split('¿')
        .join('')
        .split('!')
        .join('')
        .split('¡')
        .join('')
        .split('+')
        .join('')
        .split('-')
        .join('')
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      this.articleForm.patchValue({url: url});
    }
  }

  setValuesArray(): void {
    if (this.article.deposits && this.article.deposits.length > 0) {
      let deposits = this.articleForm.controls.deposits as UntypedFormArray;

      this.article.deposits.forEach((x) => {
        if (x.deposit && x.deposit._id && x.deposit.operationType != 'D') {
          deposits.push(
            this._fb.group({
              _id: null,
              deposit: x.deposit._id,
              capacity: x.capacity,
            }),
          );
        }
      });
    }

    if (this.article.locations && this.article.locations.length > 0) {
      let locations = this.articleForm.controls.locations as UntypedFormArray;

      this.article.locations.forEach((x) => {
        let locationId;

        if (x.location && x.location._id && x.location.operationType != 'D') {
          locationId = x.location._id;
          locations.push(
            this._fb.group({
              _id: null,
              location: locationId,
            }),
          );
        }
      });
    }

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

    if (this.applications && this.applications.length > 0) {
      this.applications.forEach((x) => {
        let exists = false;

        this.article.applications.forEach((y) => {
          if (x._id === y._id) {
            exists = true;
            const control = new UntypedFormControl(y); // if first item set to true, else false

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
    let query = `where="type":"${Type.Final}"&sort="_id":-1&limit=1`;

    this._articleService.getArticles(query).subscribe(
      (result) => {
        let code = this.padString(1, this.config.article.code.validators.maxLength);

        if (result.articles) {
          if (result.articles[0]) {
            if (!isNaN(parseInt(result.articles[0].code))) {
              code = (parseInt(result.articles[0].code) + 1 + '').slice(
                0,
                this.config.article.code.validators.maxLength,
              );
            } else {
              code = this.padString(1, this.config.article.code.validators.maxLength);
            }
          }
        }
        this.article.code = this.padString(
          code,
          this.config.article.code.validators.maxLength,
        );

        this.setValuesForm();
      },
      (error) => this.showToast(error),
    );
  }

  async openModal(op: string, articleId?: string) {
    let modalRef;

    switch (op) {
      case 'view':
        modalRef = this._modalService.open(AddArticleComponent, {
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

  getMakes(query) {
    return new Promise((resolve, reject) => {
      this._makeService.getMakes(query).subscribe(
        (result) => {
          if (!result.makes) {
            resolve(null);
          } else {
            resolve(result.makes);
          }
        },
        (error) => this.showToast(error),
      );
    });
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

  getDeposits(): void {
    this._depositService.getDeposits().subscribe(
      (result) => {
        if (!result.deposits) {
          this.getLocations();
        } else {
          this.deposits = result.deposits;
          this.getLocations();
        }
      },
      (error) => this.showToast(error),
    );
  }

  getLocations(): void {
    this._locationService.getLocations().subscribe(
      (result) => {
        if (!result.locations) {
          this.getCompany();
        } else {
          this.locations = result.locations;
          this.getCompany();
        }
      },
      (error) => this.showToast(error),
    );
  }

  getCompany(): void {
    let query = 'where="type":"' + CompanyType.Provider.toString() + '"';

    this._companyService.getCompanies(query).subscribe(
      (result) => {
        if (result.companies) {
          this.companies = result.companies;
        }
        if (this.operation === 'add' || this.operation === 'copy') {
          this.getLastArticle();
        } else {
          this.setValuesForm();
        }
      },
      (error) => this.showToast(error),
    );
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

    const values = {
      _id: this.article._id,
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
    };

    this.articleForm.patchValue(values);
  }

  addArticle(): void {
    if (!this.readonly) {
      if (this.articleForm.valid) {
        this.loadPosDescription();
        this.loadURL();
        const oldMeliId: string = this.article.meliId;

        this.article = Object.assign(this.article, this.articleForm.value);
        this.article.meliId = oldMeliId;
        this.article.meliAttrs = this.meliAttrs;
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

        if (pathLocation[2] === 'productos') {
          this.article.type = Type.Final;
        } else if (pathLocation[2] === 'variantes') {
          this.article.type = Type.Variant;
        } else if (pathLocation[2] === 'ingredientes') {
          this.article.type = Type.Ingredient;
        } else {
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
        this.showToast({message: 'Revisa los errores en el formulario.'});
        this.onValueChanged();
      }
    }
  }

  eventAddMeliAttrs(params: any) {
    this.article.meliId = params.article.meliId;
    this.articleForm.patchValue({meliId: this.article.meliId});
    this.meliAttrs = params.meliAttrs;
  }

  async saveArticle() {
    this.loading = true;

    if (await this.isValid()) {

      if(this.filesToUpload) this.article.picture = await this.uploadFile(this.article.picture);

      this._articleService.saveArticle(this.article, this.variants).subscribe(
        (result) => {
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
          
              this.showToast(null, 'success', 'El producto se ha añadido con éxito.');
              this.activeModal.close({article: this.article});
            
          }
        },
        (error) => this.showToast(error),
      );
    } else {
      this.loading = false;
    }
  }

  async updateArticle() {
    this.loading = true;

    if (await this.isValid()) {

      if(this.filesToUpload) this.article.picture = await this.uploadFile(this.article.picture);

      this._articleService.updateArticle(this.article, this.variants).subscribe(
        (result) => {
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
            this.articleForm.patchValue({meliId: this.article.meliId});
            this.articleForm.patchValue({wooId: this.article.wooId});
            this._articleService.setItems(null);
            this.showToast(null, 'success', 'Operación realizada con éxito');
            this.activeModal.close();
          }
        },
        (error) => this.showToast(error),
      );
    }
  }

  deleteArticle(): void {
    this.loading = true;

    this._articleService.delete(this.article._id).subscribe(
      (result: Resulteable) => {
        if (result.status == 200) {
          this.activeModal.close('delete_close');
        } else {
          this.showToast(result);
        }
      },
      (error) => this.showToast(error),
    );
  }

  async uploadFile(pictureDelete: string): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      if(pictureDelete && pictureDelete.includes('https://storage.googleapis')) {
        await this.deleteFile(pictureDelete);
      }

      this._fileService
          .uploadImage(ORIGINMEDIA.ARTICLES, this.filesToUpload)
          .then(
            (result: string) => {
              console.log(result);
              this.article.picture = result;
              this.imageURL = result;
              resolve(result);
          },
          (error) => this.showToast(error),
        );
    })
  }

  async deleteFile(pictureDelete: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      this._fileService.deleteImage(pictureDelete).subscribe(
        (result) => {
          resolve(true)
        },
        (error) => {
          console.log(error)
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
      if (this.article.applications.length > 0 && this.article.type === Type.Final) {
        await this.getArticleURL().then((result) => {
          if (result) {
            this.showToast(null, 'danger', 'La URL ya esta en uso');
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  async getArticleURL(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      let project = {
        _id: 1,
        url: 1,
        ecommerceEnabled: 1,
        type: 1,
        operationType: 1,
      };

      let match = `{`;

      if (this.article._id && this.article._id !== null) {
        match += `"_id": { "$ne" : { "$oid" : "${this.article._id}"}},`;
      }

      match += `  "url":"${this.article.url}",
                    "type": "Final",
                    "operationType" : { "$ne" : "D" } }`;

      match = JSON.parse(match);
      this._articleService.getArticlesV2(project, match, {}, {}).subscribe(
        (result) => {
          if (result && result.articles && result.articles.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        (error) => this.showToast(error),
      );
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
            sort: {name: 1},
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
            sort: {name: 1},
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
            sort: {description: 1},
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

    if(index !== null) {
      let control = <UntypedFormArray>this.articleForm.controls.pictures;
      control.removeAt(index);
    } else {
      this.article.picture = './../../../assets/img/default.jpg';
      this.imageURL = "./../../../assets/img/default.jpg"
    }
    
    await this.deleteFile(picture)
  }
}
