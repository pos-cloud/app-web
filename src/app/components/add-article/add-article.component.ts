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
import { VariantType } from '../../models/variant-type';
import { Taxes } from '../../models/taxes';
import { Deposit } from '../../models/deposit';
import { Location } from '../../models/location';

// Services
import { ArticleService } from './../../services/article.service';
import { ArticleStockService } from './../../services/article-stock.service';
import { MakeService } from './../../services/make.service';
import { CategoryService } from './../../services/category.service';
import { VariantService } from './../../services/variant.service';
import { DepositService } from './../../services/deposit.service';
import { LocationService} from './../../services/location.service';

// Pipes
import { DecimalPipe } from '@angular/common';
import { SlicePipe } from '@angular/common';
import { ArticleFields } from '../../models/article-fields';
import { ArticleFieldType } from '../../models/article-field';
import { RoundNumberPipe } from '../../pipes/round-number.pipe';

@Component({
  selector: 'app-add-article',
  templateUrl: './add-article.component.html',
  styleUrls: ['./add-article.component.css'],
  providers: [NgbAlertConfig, DecimalPipe]
})

export class AddArticleComponent implements OnInit {

  @Input() article: Article;
  @Input() operation: string;
  @Input() readonly: boolean;
  public articleStock: ArticleStock;
  public articleForm: FormGroup;
  public makes: Make[] = new Array();
  public deposits: Deposit[] = new Array();
  public locations: Location[] = new Array();
  public categories: Category[] = new Array();
  public variants: Variant[] = new Array();
  public articlesWithVariants: Article[] = new Array();
  public variantsStored = new Array();
  public raffledVariants: Variant[] = Array();
  public taxes: Taxes[] = new Array();
  public otherFields: ArticleFields[] = new Array();
  public printIns: ArticlePrintIn[] = [ArticlePrintIn.Counter, ArticlePrintIn.Counter, ArticlePrintIn.Kitchen];
  public alertMessage = '';
  public userType: string;
  public loading = false;
  public focusEvent = new EventEmitter<boolean>();
  public apiURL = Config.apiURL;
  public filesToUpload: Array<File>;
  public numberOfVariantsStored = 0;
  public numberOfVariantsToStore = 0;
  public numberOfGroupOfVariantsStored = 0;
  public numberOfGroupOfVariantsToStore = 0;
  public numberOfArticleChildStored = 0;
  public numberOfArticleChildToStore = 0;
  public numberOfArticleTaxStored = 0;
  public numberOfArticleTaxToStore = 0;
  public uniqueVariantTypes: VariantType[] = new Array();
  public hasChanged = false;
  public roundNumber: RoundNumberPipe = new RoundNumberPipe();
  public imageURL: string;

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
    'location': ''
  };

  public validationMessages = {
    'code': {
      'required': 'Este campo es requerido.',
      'maxlength': 'No puede exceder los 10 carácteres.'
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
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    if (!this.article) {
      this.article = new Article();
    }
  }

  ngOnInit(): void {

    const pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.buildForm();
    this.getMakes();
    if (this.operation === 'update') {
      this.taxes = this.article.taxes;
      this.otherFields = this.article.otherFields;
      if (this.article.picture && this.article.picture !== 'default.jpg') {
        this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture;
      } else {
        this.imageURL = './../../../assets/img/default.jpg';
      }
      this.setValuesForm();
    } else if (this.operation === 'view') {
      this.taxes = this.article.taxes;
      this.otherFields = this.article.otherFields;
      this.readonly = true;
      if (this.article.picture && this.article.picture !== 'default.jpg') {
        this.imageURL = Config.apiURL + 'get-image-article/' + this.article.picture;
      } else {
        this.imageURL = './../../../assets/img/default.jpg';
      }
      this.setValuesForm();
    } else {
      this.imageURL = './../../../assets/img/default.jpg';
    }
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
        Validators.required,
        Validators.maxLength(10)
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
      ]
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

  public padString(n, length) {
    var n = n.toString();
    while (n.length < length) {
      n = '0' + n;
    }
    return n;
  }

  public autocompleteCode() {
    this.article.code = this.padString(this.articleForm.value.code, 5);
    this.setValuesForm();
  }

  public getLastArticle(): void {

    this.loading = true;

    this._articleService.getLastArticle().subscribe(
      result => {
        let code = '00001';
        let category: Category = new Category();
        if (result.articles) {
          if (result.articles[0]) {
            if (!isNaN(parseInt(result.articles[0].code))) {
              code = (parseInt(result.articles[0].code) + 1) + '';
            } else {
              code = '00001';
            }
          }
        }
        if (this.categories[0]) {
          category = this.categories[0];
        }

        this.article.code = this.padString(code, 5);
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

  public getArticleStock(): void {

    this.loading = true;

    this._articleStockService.getStockByArticle(this.article._id).subscribe(
      result => {
        if (!result.articleStocks) {
          this.saveArticleStock();
        } else {
          this.articleStock = result.articleStocks[0];
        }
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

  public getCategories(): void {

    this.loading = true;

    this._categoryService.getCategories().subscribe(
      result => {
        if (!result.categories) {
          this.getLastArticle();
        } else {
          this.hideMessage();
          this.categories = result.categories;
          if (this.operation === 'add') {
            this.getLastArticle();
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
              this.articleForm.value.costPrice += field.amount;
            }
          }
        }

        if (this.taxes && this.taxes.length > 0) {
          for (const articleTax of this.taxes) {
            articleTax.taxBase = taxedAmount;
            articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage / 100));
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
              articleTax.taxBase = taxedAmount;
              articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage / 100));
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
            articleTax.taxBase = taxedAmount;
            articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage / 100));
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
    this.articleForm.value.markupPrice = this.roundNumber.transform(this.articleForm.value.markupPrice,3);
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
    if (!this.article.code) { this.article.code = '00001'; }

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

    if (!this.article.observation) { this.article.observation = ''; }
    if (!this.article.barcode) { this.article.barcode = ''; }
    if (!this.article.printIn) { this.article.printIn = ArticlePrintIn.Counter; }
    if (!this.article.allowPurchase === undefined) { this.article.allowPurchase = true; }
    if (!this.article.allowSale === undefined) { this.article.allowSale = true; }
    if (!this.article.allowSaleWithoutStock === undefined) { this.article.allowSaleWithoutStock = false; }

    const values = {
      '_id': this.article._id,
      'code': this.article.code,
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
      'observation': this.article.observation,
      'barcode': this.article.barcode,
      'printIn': this.article.printIn,
      'allowPurchase': this.article.allowPurchase,
      'allowSale': this.article.allowSale,
      'allowSaleWithoutStock': this.article.allowSaleWithoutStock
    };

    this.articleForm.setValue(values);
  }

  public addArticle(): void {

    if (!this.readonly) {
      this.loading = true;
      this.loadPosDescription();
      this.article = this.articleForm.value;
      this.autocompleteCode();
      this.article.type = ArticleType.Final;
      if (this.variants && this.variants.length > 0) {
        this.article.containsVariants = true;
      } else {
        this.article.containsVariants = false;
      }
      this.article.otherFields = this.otherFields;
      this.article.taxes = this.taxes;
      if (this.operation === 'add') {
        this.saveArticle();
      } else if (this.operation === 'update') {
        this.updateArticle();
      }
    }
  }

  public saveArticle(): void {

    this.loading = true;

    this._articleService.saveArticle(this.article).subscribe(
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
                  if (this.article.containsVariants) {
                    this.addVariants(this.article);
                  } else {
                    this.loading = false;
                    this.showMessage('El producto se ha añadido con éxito.', 'success', false);
                  }
                },
                (error) => {
                  this.loading = false;
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            if (this.article.containsVariants) {
              this.addVariants(this.article);
            } else {
              this.loading = false;
              this.showMessage('El producto se ha añadido con éxito.', 'success', false);
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

  public updateArticle(): void {

    this.loading = true;

    this._articleService.updateArticle(this.article).subscribe(
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
                  // console.log(console.log(this.imageURL));
                  if (this.article.containsVariants) {
                    this.addVariants(this.article);
                  } else {
                    this.filesToUpload = null;
                    this.loading = false;
                    this.showMessage('El producto se ha actualizado con éxito.', 'success', false);
                  }
                },
                (error) => {
                  this.showMessage(error, 'danger', false);
                }
              );
          } else {
            if (this.article.containsVariants) {
              this.addVariants(this.article);
            } else {
              this.filesToUpload = null;
              this.loading = false;
              this.showMessage('El producto se ha actualizado con éxito.', 'success', false);
            }
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
    return new Promise(function (resolve, reject) {
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
    this.updatePrices('otherFields');
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

  public addVariants(articleParent: Article): void {

    this.loading = true;

    this.numberOfArticleChildToStore = 1;

    const variantTypes: VariantType[] = new Array();

    if (this.variants && this.variants.length > 0) {
      for (const variant of this.variants) {
        variantTypes.push(variant.type);
      }
    }

    this.uniqueVariantTypes = this.getUniqueValues(variantTypes);
    this.numberOfVariantsToStore = this.uniqueVariantTypes.length;

    if(this.uniqueVariantTypes && this.uniqueVariantTypes.length > 0) {
      for (let i = 0; i < this.uniqueVariantTypes.length; i++) {
        this.numberOfArticleChildToStore = this.roundNumber.transform(this.numberOfArticleChildToStore * this.getDuplicateValues(this.uniqueVariantTypes[i], variantTypes));
      }
    }

    this.numberOfGroupOfVariantsToStore = this.numberOfArticleChildToStore;

    this.addArticleChildren(articleParent);
  }

  public getUniqueValues(array: Array<any>): Array<any> {

    const uniqueArray = new Array();

    if(array && array.length > 0) {
      for (let index = 0; index < array.length; index++) {
        const el = array[index];
        if (uniqueArray.indexOf(el) === -1) { uniqueArray.push(el); }
      }
    }

    return uniqueArray;
  }

  public getDuplicateValues(value: any, array: Array<any>): number {

    let cant = 0;

    if(array && array.length > 0) {
      for (let index = 0; index < array.length; index++) {
        if (value._id === array[index]._id) {
          cant++;
        }
      }
    }

    return cant;
  }

  public addArticleChildren(articleParent: Article): void {

    if (this.numberOfArticleChildStored < this.numberOfArticleChildToStore) {

      const articleChild = articleParent;
      articleChild.type = ArticleType.Variant;
      articleChild.containsVariants = false;
      this.saveArticleChild(articleParent, articleChild);
    } else {
      this.loading = false;
      this.showMessage('El producto se ha añadido con éxito.', 'success', false);
    }
  }

  public saveArticleChild(articleParent: Article, articleChild: Article): void {

    this.loading = true;

    this._articleService.saveArticle(articleChild).subscribe(
      result => {
        if (!result.article) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          articleChild = result.article;
          this.numberOfArticleChildStored++;
          this.numberOfGroupOfVariantsStored = 0;
          this.numberOfArticleTaxStored = 0;
          this.saveVariants(articleParent, articleChild);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public saveVariants(articleParent: Article, articleChild: Article): void {

    this.loading = true;

    if (this.numberOfGroupOfVariantsStored === 0) {
      if (!this.raffledVariants || (this.raffledVariants && this.raffledVariants.length === 0)) {
        let exists = false;
        do {
          for (const uniqueVariantType of this.uniqueVariantTypes) {
            const variant = this.getVariantByType(uniqueVariantType);
            variant.articleParent = articleParent;
            variant.articleChild = articleChild;
            this.raffledVariants.push(variant);
          }

          if (this.variantsExists()) {
            exists = true;
            this.raffledVariants = new Array();
          } else {
            exists = false;
          }
        } while (exists);
      }
      this.variantsStored.push(this.raffledVariants);
      this.numberOfVariantsStored = 0;

      this.saveGroupOfVariants(articleParent, articleChild);
    } else {
      this.addArticleChildren(articleParent);
    }
  }

  public variantsExists(): boolean {

    let exists = false;
    let equals = 0;

    if(this.variantsStored && this.variantsStored.length > 0) {
      for (let i = 0; i < this.variantsStored.length; i++) {
        if (!exists) {
          for (let j = 0; j < this.raffledVariants.length; j++) {
            for (let k = 0; k < this.variantsStored[i].length; k++) {
              if (this.raffledVariants[j].type._id === this.variantsStored[i][k].type._id) {
                if (this.raffledVariants[j].value._id === this.variantsStored[i][k].value._id) {
                  equals++;
                }
              }
            }
          }
        }
        if (this.uniqueVariantTypes && equals === this.uniqueVariantTypes.length) {
          exists = true;
        }
        equals = 0;
      }
    }
    return exists;
  }

  public getVariantByType(variantType: VariantType): Variant {

    let variant;

    do {
      const random: number = Math.round(Math.random() * ((this.variants.length - 1) - 0) + 0);
      variant = this.variants[random];
    } while (variant.type._id !== variantType._id);

    return variant;
  }

  public saveGroupOfVariants(articleParent: Article, articleChild: Article): void {

    this.loading = true;

    if (this.numberOfVariantsStored < this.numberOfVariantsToStore) {
      this.saveVariant(this.raffledVariants[this.numberOfVariantsStored]);
    } else {
      this.numberOfGroupOfVariantsStored++;
      this.raffledVariants = new Array();
      this.saveVariants(articleParent, articleChild);
    }
  }

  public saveVariant(variant: Variant): void {

    this.loading = true;

    this._variantService.saveVariant(variant).subscribe(
      result => {
        if (!result.variant) {
          if (result.message && result.message !== '') { this.showMessage(result.message, 'info', true); }
        } else {
          variant = result.variant;
          this.numberOfVariantsStored++;
          this.saveGroupOfVariants(variant.articleParent, variant.articleChild);
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public manageVariants(articlesWithVariants: Article[]): void {
    this.articlesWithVariants = articlesWithVariants;
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
