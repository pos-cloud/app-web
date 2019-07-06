// Angular
import { Component, OnInit, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Terceros
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// Models
import { Article, ArticlePrintIn, ArticleType } from './../../models/article';
import { ArticleStock } from './../../models/article-stock';
import { Make } from './../../models/make';
import { Category } from './../../models/category';
import { Variant } from '../../models/variant';
import { Config } from './../../app.config';
import { Taxes } from '../../models/taxes';
import { Deposit } from '../../models/deposit';
import { Location } from '../../models/location';
import { UnitOfMeasurement } from 'app/models/unit-of-measurement';
import { Currency } from 'app/models/currency';
import { Company,CompanyType } from '../../models/company'

// Services
import { ArticleService } from './../../services/article.service';
import { ArticleStockService } from './../../services/article-stock.service';
import { MakeService } from './../../services/make.service';
import { CategoryService } from './../../services/category.service';
import { VariantService } from './../../services/variant.service';
import { DepositService } from './../../services/deposit.service';
import { LocationService} from './../../services/location.service';
import { CurrencyService } from 'app/services/currency.service';
import { CompanyService } from 'app/services/company.service';
import { UnitOfMeasurementService } from 'app/services/unit-of-measurement.service';

// Pipes
import { DecimalPipe } from '@angular/common';
import { SlicePipe } from '@angular/common';
import { ArticleFields } from '../../models/article-fields';
import { ArticleFieldType } from '../../models/article-field';
import { RoundNumberPipe } from '../../pipes/round-number.pipe';
import { TaxClassification } from 'app/models/tax';
import { ConfigService } from 'app/services/config.service';
import { MovementOfArticleService } from 'app/services/movement-of-article.service';
import { ArticleFieldService } from 'app/services/article-field.service';

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  providers: [NgbAlertConfig, DecimalPipe]
})

export class AddArticleComponent implements OnInit {

  public article: Article;
  @Input() articleId: string;
  @Input() operation: string;
  @Input() readonly: boolean;
  public articleStock: ArticleStock;
  public config: Config;
  public articleForm: FormGroup;
  public currencies: Currency[] = new Array();
  public makes: Make[] = new Array();
  public companies : Company[] = new Array();
  public deposits: Deposit[] = new Array();
  public locations: Location[] = new Array();
  public categories: Category[] = new Array();
  public variants: Variant[] = new Array();
  public unitsOfMeasurement: UnitOfMeasurement[] = new Array();
  public taxes: Taxes[] = new Array();
  public otherFields: ArticleFields[] = new Array();
  public printIns: ArticlePrintIn[] = [ArticlePrintIn.Counter, ArticlePrintIn.Kitchen, ArticlePrintIn.Bar];
  public alertMessage = '';
  public userType: string;
  public loading = false;
  public focusEvent = new EventEmitter<boolean>();
  public apiURL = Config.apiURL;
  public filesToUpload: Array<File>;
  public hasChanged = false;
  public roundNumber: RoundNumberPipe = new RoundNumberPipe();
  public imageURL: string;
  public articleType: string;
  public filterTaxClassification: TaxClassification = TaxClassification.Tax;
  public lastPricePurchase;
  public otherFieldsAlfabetico = false;
  public otherFieldsNumber = false;



  public formErrors = {
    'code': '',
    'make': '',
    'description': '',
    'posDescription': '',
    'basePrice': '',
    'costPrice': '',
    'markupPercentage': '',
    'markupPrice': '',
    'salePrice': '',
    'category': '',
    'deposit' : '',
    'location': '',
    'barcode': '',
    'currency': '',
    'providers' : ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.'
    },
    'make': {
      'required': 'Este campo es requerido.'
    },
    'description': {
      'required': 'Este campo es requerido.'
    },
    'posDescription': {
      'maxlength': 'No puede exceder los 20 carácteres.'
    },
    'basePrice': {
      'required': 'Este campo es requerido.'
    },
    'costPrice': {
      'required': 'Este campo es requerido.'
    },
    'markupPercentage': {
      'required': 'Este campo es requerido.'
    },
    'markupPrice': {
      'required': 'Este campo es requerido.'
    },
    'salePrice': {
      'required': 'Este campo es requerido.'
    },
    'category': {
      'required': 'Este campo es requerido.'
    },
    'deposit': {
      'required': 'Este campo es requerido'
    },
    'location': {
    },
    'barcode': {
      'maxlength': 'No puede exceder los 14 dígitos.'
    },
    'currency': {
      'maxlength': 'No puede exceder los 14 dígitos.'
    }
  };

  constructor(
    public _articleService: ArticleService,
    public _articleStockService: ArticleStockService,
    public _variantService: VariantService,
    public _depositService: DepositService,
    public _locationService: LocationService,
    public _makeService: MakeService,
    public _categoryService: CategoryService,
    public _companyService : CompanyService,
    public _unitOfMeasurementService: UnitOfMeasurementService,
    public _movementsOfArticle : MovementOfArticleService,
    public _articleFields : ArticleFieldService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _currencyService: CurrencyService,
    public _configService: ConfigService
  ) {
    this.article = new Article();
    this.getCurrencies();

    const pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (pathLocation[2] === "productos") {
      this.articleType = "Producto";
      this.article.type = ArticleType.Final;
    } else if (pathLocation[2] === "variantes") {
      this.article.type = ArticleType.Variant;
      this.articleType = "Variante";
    }
  }

  async ngOnInit() {
    
    this.buildForm();

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;

        // AGREGAMOS VALIDACIÓN DE LONGITUD DE CÓDIGO INTERNO
        this.validationMessages.code['maxlength'] = `No puede exceder los ${this.config.article.code.validators.maxLength} carácteres.`;
        this.articleForm.controls['code'].setValidators([Validators.maxLength(this.config.article.code.validators.maxLength)]);
      }
    );

    this.getArticleFields();
    
    if(this.articleId) {
      this.getArticle();
    } else {
      this.getMakes();
      this.imageURL = './../../../assets/img/default.jpg';
    }
  }

  public getArticleFields(){
    
    this.loading = true;

    this._articleFields.getArticleFields().subscribe(
      result => {
        if(result && result.articleFields) {
          for (let x = 0; x < result.articleFields.length; x++) {
            
            if(result.articleFields[x]['datatype'] === ArticleFieldType.String){
              this.otherFieldsAlfabetico = true;
            }
            if(result.articleFields[x]['datatype'] !== ArticleFieldType.String){
              this.otherFieldsNumber = true;
            }
            
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {
    this.articleForm = this._fb.group({
      '_id': [this.article._id, [
        ]
      ],
      'code': [this.article.code, [
        Validators.required
        ]
      ],
      'codeSAT': [this.article.codeSAT, [
        ]
      ],
      'currency': [this.article.currency, [
        ]
      ],
      'make': [this.article.make, [
        ]
      ],
      'description': [this.article.description, [
        Validators.required
        ]
      ],
      'posDescription': [this.article.posDescription, [
        Validators.maxLength(20)
        ]
      ],
      'basePrice': [this.article.basePrice, [
        Validators.required
        ]
      ],
      'costPrice': [this.article.costPrice, [
        Validators.required
        ]
      ],
      'markupPercentage': [this.article.markupPercentage, [
        Validators.required
        ]
      ],
      'markupPrice': [this.article.markupPrice, [
        Validators.required
        ]
      ],
      'salePrice': [this.article.salePrice, [
        Validators.required
        ]
      ],
      'category': [this.article.category, [
        Validators.required
        ]
      ],
      'quantityPerMeasure': [this.article.quantityPerMeasure, [
        ]
      ],
      'unitOfMeasurement': [this.article.unitOfMeasurement, [
        ]
      ],
      'deposit' : [this.article.deposit, [
        ]
      ],
      'location' : [this.article.location, [
        ]
      ],
      'observation': [this.article.observation, [
        ]
      ],
      'barcode': [this.article.barcode, [
        Validators.maxLength(14)
        ]
      ],
      'printIn': [this.article.printIn, [
        ]
      ],
      'allowPurchase': [this.article.allowPurchase, [
        ]
      ],
      'allowSale': [this.article.allowSale, [
        ]
      ],
      'allowSaleWithoutStock': [this.article.allowSaleWithoutStock, [
        ]
      ],
      'allowMeasure' : [this.article.allowMeasure, [
        ]
      ],
      'ecommerceEnabled' : [this.article.ecommerceEnabled, [
        ]
      ],
      'favourite' : [this.article.favourite, [
        ]
      ],
      'providers' : [this.article.providers, []],
      'lastPricePurchase' : [,[]]
    });

    this.articleForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.articleForm) { return; }
    const form = this.articleForm;

    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public getCurrencies(): void {

    this.loading = true;

    this._currencyService.getCurrencies('sort="name":1').subscribe(
      result => {
        if (!result.currencies) {
        } else {
          this.currencies = result.currencies;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getArticle(): void {

    this.loading = true;

    this._articleService.getArticle(this.articleId).subscribe(
      result => {
        if (!result.article) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
        } else {
          this.hideMessage();
          this.article = result.article;
          this.taxes = this.article.taxes;
          this.otherFields = this.article.otherFields;
          if (this.article.picture && this.article.picture !== 'default.jpg') {
            this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture;
          } else {
            this.imageURL = './../../../assets/img/default.jpg';
          }
          this.setValuesForm();
          this.getLastPricePurchase();
          this.getMakes();
          if(this.article.containsVariants) {
            this.getVariantsByArticleParent();
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getVariantsByArticleParent(): void {

    this.loading = true;

    let query = 'where="articleParent":"'+ this.article._id +'"';

    this._variantService.getVariants(query).subscribe(
      result => {
        if (!result.variants) {
          this.variants = new Array();
        } else {
          this.variants = this.getUniqueVariants(result.variants);
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getUniqueVariants(variants: Variant[]): Variant[] {

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

  public padString(n, length) {
    var n = n.toString();
    while (n.length < length) {
      n = '0' + n;
    }
    return n;
  }

  public autocompleteCode() {
    if(!isNaN(this.articleForm.value.code)) {
      this.article.code = this.padString(this.articleForm.value.code, this.config.article.code.validators.maxLength);
    } else {
      this.article.code = this.articleForm.value.code;
    }
    this.setValuesForm();
  }

  public getLastArticle(): void {

    this.loading = true;

    let query = 'sort="_id":-1&limit=1';

    this._articleService.getArticles(query).subscribe(
      result => {
        let code = this.padString(1, this.config.article.code.validators.maxLength);
        let category: Category = new Category();
        if (result.articles) {
          if (result.articles[0]) {
            if (!isNaN(parseInt(result.articles[0].code))) {
              code = ((parseInt(result.articles[0].code) + 1) + '').slice(0, this.config.article.code.validators.maxLength);
            } else {
              code = this.padString(1, this.config.article.code.validators.maxLength);
            }
          }
        }
        if (this.categories[0]) {
          category = this.categories[0];
        }

        this.article.code = this.padString(code, this.config.article.code.validators.maxLength);
        this.article.category = category;
        this.setValuesForm();
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveArticleStock(): void {

    if (!this.articleStock) {
      this.articleStock = new ArticleStock();
    }

    if (this.articleStock && !this.articleStock.article) {
      this.articleStock.article = this.article;
    }

    this._articleStockService.saveArticleStock(this.articleStock).subscribe(
      result => {
        if (!result.articleStock) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
          this.loading = false;
        } else {
          this.articleStock = result.articleStock;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getMakes(): void {

    this.loading = true;

    this._makeService.getMakes().subscribe(
      result => {
        if (!result.makes) {
          this.getDeposits();
        } else {
          this.hideMessage();
          this.makes = result.makes;
          this.getDeposits();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getDeposits(): void {
    this.loading = true;

    this._depositService.getDeposits().subscribe(
      result => {
        if (!result.deposits) {
          this.getLocations();
        } else {
          this.hideMessage();
          this.deposits = result.deposits;
          this.getLocations();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getLocations(): void {
    this.loading = true;

    this._locationService.getLocations().subscribe(
      result => {
        if (!result.locations) {
          this.getCategories();
        } else {
          this.hideMessage();
          this.locations = result.locations;
          this.getCategories();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCategories(): void {

    this.loading = true;

    this._categoryService.getCategories().subscribe(
      result => {
        if (!result.categories) {
          this.getCompany();
        } else {
          this.hideMessage();
          this.categories = result.categories;
          this.getCompany();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCompany(): void {

    this.loading = true;

    let query = 'where="type":"' + CompanyType.Provider.toString() + '"';

    this._companyService.getCompanies(query).subscribe(
      result => {
        if (!result.companies) {
          this.getUnitsOfMeasurement();
        } else {
          this.hideMessage();
          this.companies = result.companies;
          this.getUnitsOfMeasurement();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getLastPricePurchase() : void {

    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sortAux = { 'transaction.endDate': -1 };

    // FILTRAMOS LA CONSULTA

    let match = `{  "operationType": { "$ne": "D" },
                    "transaction.operationType" : { "$ne": "D" },
                    "transaction.state" : "Cerrado",
                    "transaction.type.transactionMovement" : "Compra",
                    "article._id" : { "$oid" : "${this.article._id}"}
                  }`;
    

    match = JSON.parse(match);

    let project = {
        "transaction.state": 1,
        "transaction.operationType": 1,
        "article._id": 1,
        "operationType": 1,
        "transaction.endDate": 1,
        "transaction.type.name": 1,
        "transaction.type.transactionMovement" : 1,
        "transaction._id": 1,
        "amount": 1,
        "salePrice" : 1
    };

    // AGRUPAMOS EL RESULTADO
    let group = {
        _id: null,
        count: { $sum: 1 },
        movementsOfArticles: { $push: "$$ROOT" }
    };

    let limit = 1;
    let skip = 0;
                
    this._movementsOfArticle.getMovementsOfArticlesV2(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        limit, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          console.log(result)
          this.lastPricePurchase = result.movementsOfArticles[0].salePrice / result.movementsOfArticles[0].amount;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getUnitsOfMeasurement(): void {

    this.loading = true;

    this._unitOfMeasurementService.getUnitsOfMeasurement().subscribe(
      result => {
        if (!result.unitsOfMeasurement) {
          if (this.operation === 'add') {
            this.getLastArticle();
          } else {
            this.setValuesForm();
          }
        } else {
          this.hideMessage();
          this.unitsOfMeasurement = result.unitsOfMeasurement;
          if (this.operation === 'add') {
            this.getLastArticle();
          } else {
            this.setValuesForm();
          };
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updatePrices(op): void {

    let taxedAmount = 0;

    switch (op) {
      case 'basePrice':
        this.articleForm.value.costPrice = 0;
        taxedAmount = this.articleForm.value.basePrice;

        if(this.otherFields && this.otherFields.length > 0) {
          for (const field of this.otherFields) {
            if(field.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((this.articleForm.value.basePrice * parseFloat(field.value) / 100));
            } else if(field.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
            if (field.articleField.modifyVAT) {
              taxedAmount += field.amount;
            } else {
              if(field.amount){
                this.articleForm.value.costPrice += field.amount;
              }
            }
          }
        }
        
        if (this.taxes && this.taxes.length > 0) {
          for (const articleTax of this.taxes) {
            if(articleTax.tax.percentage && articleTax.tax.percentage != 0) {
              articleTax.taxBase = taxedAmount;
              articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage / 100));
            }
            this.articleForm.value.costPrice += (articleTax.taxAmount);
          }
        }
        this.articleForm.value.costPrice += taxedAmount;

        if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.roundNumber.transform((this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100));
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
        case 'otherFields':
          this.articleForm.value.costPrice = 0;
          taxedAmount = this.articleForm.value.basePrice;

          if (this.otherFields && this.otherFields.length > 0) {
            for (const field of this.otherFields) {
              if (field.datatype === ArticleFieldType.Percentage) {
                field.amount = this.roundNumber.transform((this.articleForm.value.basePrice * parseFloat(field.value) / 100));
              } else if (field.datatype === ArticleFieldType.Number) {
                field.amount = parseFloat(field.value);
              }
              if (field.articleField.modifyVAT) {
                taxedAmount += field.amount;
              } else {
                this.articleForm.value.costPrice += field.amount;
              }
            }
          }

          if (this.taxes && this.taxes.length > 0) {
            for (const articleTax of this.taxes) {
              this.articleForm.value.costPrice += (articleTax.taxAmount);
            }
          }

          this.articleForm.value.costPrice += taxedAmount;

          if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
            this.articleForm.value.markupPrice = this.roundNumber.transform((this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100));
            this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
          }
          break;
      case 'taxes':
        this.articleForm.value.costPrice = 0;
        taxedAmount = this.articleForm.value.basePrice;

        if (this.otherFields && this.otherFields.length > 0) {
          for (const field of this.otherFields) {
            if (field.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((this.articleForm.value.basePrice * parseFloat(field.value) / 100));
            } else if (field.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
            if (field.articleField.modifyVAT) {
              taxedAmount += field.amount;
            } else {
              this.articleForm.value.costPrice += field.amount;
            }
          }
        }

        if (this.taxes && this.taxes.length > 0) {
          for (const articleTax of this.taxes) {
            this.articleForm.value.costPrice += (articleTax.taxAmount);
          }
        }

        this.articleForm.value.costPrice += taxedAmount;
        if (!(taxedAmount === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100);
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPercentage':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.costPrice * this.articleForm.value.markupPercentage / 100);
          this.articleForm.value.salePrice = this.articleForm.value.costPrice + this.articleForm.value.markupPrice;
        }
        break;
      case 'markupPrice':
        if (!(this.articleForm.value.basePrice === 0 && this.articleForm.value.salePrice !== 0)) {
          this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPrice / this.articleForm.value.costPrice * 100);
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
          this.articleForm.value.markupPercentage = this.roundNumber.transform(this.articleForm.value.markupPrice / this.articleForm.value.costPrice * 100);
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

    this.article = this.articleForm.value;
    this.setValuesForm();

  }

  public loadPosDescription(): void {
    if (this.articleForm.value.posDescription === '') {
      const slicePipe = new SlicePipe();
      this.articleForm.value.posDescription = slicePipe.transform(this.articleForm.value.description, 0, 20);
      this.article = this.articleForm.value;
      this.setValuesForm();
    }
  }

  public setValuesForm(): void {

    if (!this.article._id) { this.article._id = ''; }
    if (!this.article.code) { this.article.code = this.padString(1, this.config.article.code.validators.maxLength); }
    if (!this.article.codeSAT) { this.article.codeSAT = ''; }

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

    let make;
    if (!this.article.make) {
      make = null;
    } else {
      if (this.article.make._id) {
        make = this.article.make._id;
      } else {
        make = this.article.make;
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

    let deposit;
    if (!this.article.deposit) {
      deposit = null;
    } else {
      if (this.article.deposit._id) {
        deposit = this.article.deposit._id;
      } else {
        deposit = this.article.deposit;
      }
    }

    let location;
    if (!this.article.location) {
      location = null;
    } else {
      if (this.article.location._id) {
        location = this.article.location._id;
      } else {
        location = this.article.location;
      }
    }

    if (!this.article.description) { this.article.description = ''; }
    if (!this.article.posDescription) { this.article.posDescription = ''; }
    if (!this.article.basePrice) { this.article.basePrice = 0.00; }
    if (!this.article.costPrice) { this.article.costPrice = 0.00; }
    if (!this.article.markupPercentage) { this.article.markupPercentage = 0.00; }
    if (!this.article.markupPrice) { this.article.markupPrice = 0.00; }
    if (!this.article.salePrice) { this.article.salePrice = 0.00; }

    let category;
    if (!this.article.category) {
      category = null;
    } else {
      if (this.article.category._id) {
        category = this.article.category._id;
      } else {
        category = this.article.category;
      }
    }

    let unitOfMeasurement;
    if (!this.article.unitOfMeasurement) {
      unitOfMeasurement = null;
    } else {
      if (this.article.unitOfMeasurement._id) {
        unitOfMeasurement = this.article.unitOfMeasurement._id;
      } else {
        unitOfMeasurement = this.article.unitOfMeasurement;
      }
    }

    if (!this.article.quantityPerMeasure) { this.article.quantityPerMeasure = 1; }
    if (!this.article.observation) { this.article.observation = ''; }
    if (!this.article.barcode) { this.article.barcode = ''; }
    if (!this.article.printIn) { this.article.printIn = ArticlePrintIn.Counter; }
    if (!this.article.allowPurchase === undefined) { this.article.allowPurchase = true; }
    if (!this.article.allowSale === undefined) { this.article.allowSale = true; }
    if (!this.article.allowSaleWithoutStock === undefined) { this.article.allowSaleWithoutStock = false; }
    if (!this.article.ecommerceEnabled === undefined) { this.article.ecommerceEnabled = false; }

    this.article.basePrice = this.roundNumber.transform(this.article.basePrice);
    this.article.costPrice = this.roundNumber.transform(this.article.costPrice);
    this.article.markupPercentage = this.roundNumber.transform(this.article.markupPercentage);
    this.article.markupPrice = this.roundNumber.transform(this.article.markupPrice,3);
    this.article.salePrice = this.roundNumber.transform(this.article.salePrice);


    let lastPricePurchase
    if(this.lastPricePurchase && this.lastPricePurchase != 0) {
      lastPricePurchase = this.lastPricePurchase
    } else {
      lastPricePurchase = 0;
    }

    const values = {
      '_id': this.article._id,
      'code': this.article.code,
      'codeSAT': this.article.codeSAT,
      'currency': currency,
      'make': make,
      'deposit' : deposit,
      'location' : location,
      'description': this.article.description,
      'posDescription': this.article.posDescription,
      'basePrice': this.article.basePrice,
      'costPrice': this.article.costPrice,
      'markupPercentage': this.article.markupPercentage,
      'markupPrice': this.article.markupPrice,
      'salePrice': this.article.salePrice,
      'category': category,
      'quantityPerMeasure': this.article.quantityPerMeasure,
      'unitOfMeasurement': unitOfMeasurement,
      'observation': this.article.observation,
      'barcode': this.article.barcode,
      'printIn': this.article.printIn,
      'allowPurchase': this.article.allowPurchase,
      'allowSale': this.article.allowSale,
      'allowSaleWithoutStock': this.article.allowSaleWithoutStock,
      'allowMeasure': this.article.allowMeasure,
      'ecommerceEnabled': this.article.ecommerceEnabled,
      'favourite': this.article.favourite,
      'providers' : providers,
      'lastPricePurchase' : lastPricePurchase
    };

    this.articleForm.setValue(values);
  }

  public addArticle(): void {

    if (!this.readonly) {
      this.loading = true;
      this.loadPosDescription();
      this.article = this.articleForm.value;
      this.autocompleteCode();
      if (this.variants && this.variants.length > 0) {
        this.article.containsVariants = true;
      } else {
        this.article.containsVariants = false;
      }
      this.article.otherFields = this.otherFields;
      this.article.taxes = this.taxes;

      const pathLocation: string[] = this._router.url.split('/');
      if (pathLocation[2] === "productos") {
        this.article.type = ArticleType.Final;
      } else if (pathLocation[2] === "variantes") {
        this.article.type = ArticleType.Variant;
      } else if (pathLocation[2] === "ingredientes") {
        this.article.type = ArticleType.Ingredient;
      }

      if (this.operation === 'add') {
        this.saveArticle();
      } else if (this.operation === 'update') {
        this.updateArticle();
      }
    }
  }

  public saveArticle(): void {

    this.loading = true;

    this._articleService.saveArticle(this.article, this.variants).subscribe(
      result => {
        if (!result.article) {
          this.loading = false;
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.hasChanged = true;
          this.article = result.article;
          if (this.filesToUpload) {
            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
              .then(
                (result) => {
                  let resultUpload;
                  resultUpload = result;
                  this.article.picture = resultUpload.article.picture;
                  if (this.article.picture && this.article.picture !== 'default.jpg') {
                    this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture;
                  } else {
                    this.imageURL = './../../../assets/img/default.jpg';
                  }
                  this.loading = false;
                  this.showMessage('El producto se ha añadido con éxito.', 'success', false);
                },
                (error) => {
                  this.loading = false;
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            this.loading = false;
            this.showMessage('El producto se ha añadido con éxito.', 'success', false);
          }
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateArticle(): void {

    this.loading = true;

    this._articleService.updateArticle(this.article, this.variants).subscribe(
      result => {
        if (!result.article) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          this.hasChanged = true;
          this.article = result.article;
          if (this.filesToUpload) {
            this._articleService.makeFileRequest(this.article._id, this.filesToUpload)
              .then(
                (result) => {
                  let resultUpload;
                  resultUpload = result;
                  this.article.picture = resultUpload.article.picture;
                  if (this.article.picture && this.article.picture !== 'default.jpg') {
                    this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture;
                  } else {
                    this.imageURL = './../../../assets/img/default.jpg';
                  }
                  this.filesToUpload = null;
                  this.loading = false;
                  this.showMessage('El producto se ha actualizado con éxito.', 'success', false);
                },
                (error) => {
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            this.filesToUpload = null;
            this.loading = false;
            this.showMessage('El producto se ha actualizado con éxito.', 'success', false);
          }
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public cleanForm() {
    this.article = new Article();
    this.taxes = new Array();
    this.otherFields = new Array();
    this.filesToUpload = null;
    this.buildForm();
    this.variants = new Array();
    this.getLastArticle();
  }

  public closeModal() {
    this.activeModal.close(this.hasChanged);
  }

  public fileChangeEvent(fileInput: any): void {

    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  public makeFileRequest(files: Array<File>) {

    const articleId = this.article._id;
    return new Promise((resolve, reject) => {
      const formData: any = new FormData();
      const xhr: XMLHttpRequest = new XMLHttpRequest();

      if(files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append('image', files[i], files[i].name);
        }
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      }

      xhr.open('POST', Config.apiURL + 'upload-image/' + articleId, true);
      xhr.send(formData);
    });
  }

  public addArticleTaxes(articleTaxes: Taxes[]): void {
    this.taxes = articleTaxes;
    this.updatePrices('taxes');
  }

  public addArticleFields(otherFields: ArticleFields[]): void {
    this.otherFields = otherFields;
    for (let index = 0; index < this.otherFields.length; index++) {
      if(this.otherFields[index].datatype !== ArticleFieldType.String){
        this.updatePrices('otherFields');
      }
    }
    
  }

  public addStock(articleStock: ArticleStock): void {
    this.articleStock = articleStock;
  }

  // public saveArticleStock(article: Article): void {

  //   this.loading = true;

  //   if (!this.articleStock) {
  //     this.articleStock = new ArticleStock();
  //   }

  //   this.articleStock.article = article;

  //   this._articleStockService.saveArticleStock(this.articleStock).subscribe(
  //     result => {
  //       if (!result.articleStock) {
  //         if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
  //       } else {
  //         this.articleStock = result.articleStock;
  //       }
  //       this.loading = false;
  //     },
  //     error => {
  //       this.showMessage(error._body, 'danger', false);
  //       this.loading = false;
  //     }
  //   );
  // }

  public manageVariants(variants: Variant[]): void {
    this.variants = variants;
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }
}
