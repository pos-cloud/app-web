//Angular
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Terceros
import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

//Models
import { MovementOfArticle } from '../../models/movement-of-article';
import { Article } from '../../models/article';
import { Variant } from '../../models/variant';
import { VariantValue } from '../../models/variant-value';
import { VariantType } from '../../models/variant-type';
import { ArticleStock } from '../../models/article-stock';
import { Config } from './../../app.config';

//Services
import { MovementOfArticleService } from '../../services/movement-of-article.service';
import { VariantService } from '../../services/variant.service';
import { ArticleStockService } from '../../services/article-stock.service';

//Pipes
import { RoundNumberPipe } from '../../pipes/round-number.pipe';
import { TransactionMovement, EntryAmount, StockMovement } from '../../models/transaction-type';
import { Taxes } from '../../models/taxes';
import { ArticleFieldType } from '../../models/article-field';
import { ArticleFields } from '../../models/article-fields';
import { OrderByPipe } from 'app/pipes/order-by.pipe';

@Component({
  selector: 'app-add-movement-of-article',
  templateUrl: './add-movement-of-article.component.html',
  styleUrls: ['./add-movement-of-article.component.css'],
  providers: [NgbAlertConfig]
})

export class AddMovementOfArticleComponent implements OnInit {

  @Input() movementOfArticle: MovementOfArticle;
  public containsVariants: Boolean;
  public articleStock: ArticleStock;
  public variants: Variant[];
  public variantTypes: VariantType[];
  public selectedVariants;
  public areVariantsEmpty: boolean = true;
  public movementOfArticleForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber: RoundNumberPipe;
  public errVariant: string;
  public config: Config;
  public orderByPipe: OrderByPipe = new OrderByPipe();

  public formErrors = {
    'description': '',
    'amount': '',
    'unitPrice': ''
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    },
    'amount': {
      'required': 'Este campo es requerido.'
    },
    'unitPrice': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _movementOfArticleService: MovementOfArticleService,
    public _articleStockService: ArticleStockService,
    public _variantService: VariantService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig
  ) {
    this.roundNumber = new RoundNumberPipe();
    this.selectedVariants = {};
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    if (this.movementOfArticle.article) {
      this.containsVariants = this.movementOfArticle.article.containsVariants;
    }
    if (this.movementOfArticle.article && this.containsVariants) {
      this.getVariantsByArticleParent();
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
      if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.SaleWithoutVAT) {
        if (this.movementOfArticle.taxes && this.movementOfArticle.taxes.length > 0) {
          let unitPrice = this.movementOfArticle.unitPrice;
          for (const articleTax of this.movementOfArticle.taxes) {
            articleTax.taxBase = this.roundNumber.transform((unitPrice / ((articleTax.percentage / 100) + 1)));
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
            this.movementOfArticle.unitPrice -= (articleTax.taxAmount);
          }
        }
      }
    } else {
      if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.CostWithVAT) {
        if (this.movementOfArticle.taxes && this.movementOfArticle.taxes.length > 0) {
          let unitPrice = this.movementOfArticle.unitPrice;
          for (const articleTax of this.movementOfArticle.taxes) {
            articleTax.taxBase = unitPrice;
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
            this.movementOfArticle.unitPrice += (articleTax.taxAmount);
          }
        }
      }
    }

    this.movementOfArticleForm = this._fb.group({
      '_id': [this.movementOfArticle._id, [
        ]
      ],
      'description': [this.movementOfArticle.description, [
        Validators.required
        ]
      ],
      'amount': [this.movementOfArticle.amount, [
        Validators.required
        ]
      ],
      'notes': [this.movementOfArticle.notes, [
        ]
      ],
      'unitPrice': [this.movementOfArticle.unitPrice, [
        ]
      ],
      'measure': [this.movementOfArticle.measure, [
        ]
      ],
      'quantityMeasure': [this.movementOfArticle.quantityMeasure, [
        ]
      ]
    });

    this.movementOfArticleForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
    this.focusEvent.emit(true);
  }

  public onValueChanged(data?: any): void {

    if (!this.movementOfArticleForm) { return; }
    const form = this.movementOfArticleForm;

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

  public isValidSelectedVariants(): boolean {

    let isValid: boolean = true;

    if (this.containsVariants && this.variantTypes && this.variantTypes.length > 0) {
      for (let type of this.variantTypes) {
        if (this.selectedVariants[type.name] === null) {
          isValid = false;
        }
      }
    } else {
      isValid = false;
    }

    return isValid;
  }

  public getVariantsByArticleParent(): void {

    this.loading = true;

    let query = 'where="articleParent":"'+ this.movementOfArticle.article._id +'"';

    this._variantService.getVariants(query).subscribe(
      result => {
        if (!result.variants) {
          this.areVariantsEmpty = true;
          this.variants = null;
        } else {
          this.variants = result.variants;
          this.variantTypes = this.getUniqueValues('type', this.variants);
          this.variantTypes = this.orderByPipe.transform(this.variantTypes, ['name']);
          this.initializeSelectedVariants();
          this.areVariantsEmpty = false;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public initializeSelectedVariants(): void {

    if (this.variantTypes && this.variantTypes.length > 0) {
      for (let type of this.variantTypes) {
        let key = type.name;
        this.selectedVariants[key] = null;
      }
    }
  }

  public getVariantsByType(variantType: VariantType): Variant[] {

    let variantsToReturn: Variant[] = new Array();

    for (let variant of this.variants) {
      if (variant.type._id === variantType._id) {
        variantsToReturn.push(variant);
      }
    }

    return this.orderByPipe.transform(this.getUniqueVariants(variantsToReturn), ['value'], 'description');
  }

  public getUniqueValues(property: string, array: Array<any>): Array<any> {

    let uniqueArray = new Array();
    let exists = false;

    if (array && array.length > 0) {
      for (let i = 0; i < array.length; i++) {
        let el = array[i][property];
        exists = false;
        for (let j = 0; j < uniqueArray.length; j++) {
          if (el._id === uniqueArray[j]._id) {
            exists = true;
          }
        }
        if (!exists) {
          uniqueArray.push(el);
        }
      }
    }
    return uniqueArray;
  }

  public getUniqueVariants(array: Array<any>): Array<any> {

    let uniqueArray = new Array();
    let exists = false;

    if (array && array.length > 0) {
      for (let i = 0; i < array.length; i++) {
        let el = array[i];
        exists = false;
        for (let j = 0; j < uniqueArray.length; j++) {
          if (array[i].value._id === uniqueArray[j].value._id) {
            exists = true;
          }
        }
        if (!exists) {
          uniqueArray.push(el);
        }
      }
    }

    return uniqueArray;
  }

  public selectVariant(type: VariantType, value: VariantValue): void {

    let key = type.name;
    if (value.description === this.selectedVariants[key]) {
      this.selectedVariants[key] = null;
    } else {
      this.selectedVariants[key] = value.description;
    }

    if(this.isValidSelectedVariants()) {
      this.movementOfArticle.article = this.getArticleBySelectedVariants();
      this.changeArticleByVariants(this.movementOfArticle.article);
    }
  }

  public addAmount(): void {
    this.movementOfArticle.amount += 1;
    this.setValueForm();
  }

  public subtractAmount(): void {

    if( this.movementOfArticle.transaction.type &&
        this.movementOfArticle.transaction.type.stockMovement &&
        this.movementOfArticle.transaction.type.stockMovement === StockMovement.Inventory) {
      if (this.movementOfArticleForm.value.amount > 0) {
        this.movementOfArticle.amount -= 1;
      } else {
        this.movementOfArticle.amount = 0;
      }
    } else {
      if (this.movementOfArticleForm.value.amount > 1) {
        this.movementOfArticle.amount -= 1;
      } else {
        this.movementOfArticle.amount = 1;
      }
    }
    this.setValueForm();
  }

  public setValueForm(): void {

    if (!this.movementOfArticle._id) this.movementOfArticle._id = '';
    if (!this.movementOfArticle.description) this.movementOfArticle.description = '';
    if (this.movementOfArticle.amount === undefined) this.movementOfArticle.amount = 1;
    if (!this.movementOfArticle.notes) this.movementOfArticle.notes = '';
    if (!this.movementOfArticle.salePrice) this.movementOfArticle.salePrice = 0;
    if (!this.movementOfArticle.measure) this.movementOfArticle.measure = "";
    if (!this.movementOfArticle.quantityMeasure) this.movementOfArticle.quantityMeasure = 0;

    let values = {
      '_id': this.movementOfArticle._id,
      'description': this.movementOfArticle.description,
      'amount': this.movementOfArticle.amount,
      'notes': this.movementOfArticle.notes,
      'unitPrice': this.movementOfArticle.unitPrice,
      'measure': this.movementOfArticle.measure,
      'quantityMeasure': this.movementOfArticle.quantityMeasure
    };

    this.movementOfArticleForm.setValue(values);
  }

  public calculateMeasure(): void {

    this.movementOfArticle.measure = this.movementOfArticleForm.value.measure;
    this.movementOfArticle.quantityMeasure = this.movementOfArticleForm.value.quantityMeasure;

    this.movementOfArticle.amount = this.roundNumber.transform(eval(this.movementOfArticleForm.value.measure) * this.movementOfArticleForm.value.quantityMeasure);
    this.movementOfArticle.notes = this.movementOfArticleForm.value.measure;

    this.setValueForm();
  }

  async addMovementOfArticle() {

    if(this.movementOfArticleForm.value.amount >= 0) {
      if (this.movementOfArticleForm.value.measure) {
        this.movementOfArticle.measure = this.movementOfArticleForm.value.measure;
        this.movementOfArticle.quantityMeasure = this.movementOfArticleForm.value.quantityMeasure;
        this.movementOfArticle.amount = this.roundNumber.transform(eval(this.movementOfArticleForm.value.measure) * this.movementOfArticleForm.value.quantityMeasure);
        this.movementOfArticle.notes = this.movementOfArticleForm.value.measure;
      } else {
        this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
        this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
      }

      if(this.containsVariants) {

        this.movementOfArticle.article = this.getArticleBySelectedVariants();
      }

      this.calculateUnitPrice();

      if (this.containsVariants) {
        if (!this.isValidSelectedVariants()) {
          if (!this.variants || this.variants.length === 0) {
            if(await this.isValidMovementOfArticle()) {
              this.movementOfArticleExists();
            }
          } else {
            this.errVariant = "Debe seleccionar una variante";
          }
        } else {
          this.errVariant = undefined;
          if(await this.isValidMovementOfArticle()) {
            this.movementOfArticleExists();
          }
        }
      } else {
        if(await this.isValidMovementOfArticle()) {
          this.movementOfArticleExists();
        }
      }
    } else {
      this.showMessage("La cantidad del producto debe ser mayor o igual a 0.", "info", true);
    }
  }

  public calculateUnitPrice(): void {

    if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
      if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.SaleWithVAT) {
        this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
      } else if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.SaleWithoutVAT) {
        if (this.movementOfArticle.transaction.type.requestTaxes) {
          if (this.movementOfArticle.taxes && this.movementOfArticle.taxes.length > 0) {
            this.movementOfArticle.unitPrice = 0;
            for (const articleTax of this.movementOfArticle.taxes) {
              articleTax.taxBase = this.movementOfArticleForm.value.unitPrice;
              articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
              this.movementOfArticle.unitPrice += (articleTax.taxAmount);
            }
            this.movementOfArticle.unitPrice += this.movementOfArticleForm.value.unitPrice;
          } else {
            this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
          }
        } else {
          this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
        }
      } else {
        this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
      }
    } else {
      if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.CostWithVAT) {
        if (this.movementOfArticle.transaction.type.requestTaxes) {
          if (this.movementOfArticle.taxes && this.movementOfArticle.taxes.length > 0) {
            let unitPrice = this.movementOfArticleForm.value.unitPrice;
            this.movementOfArticle.unitPrice = unitPrice;
            for (const articleTax of this.movementOfArticle.taxes) {
              articleTax.taxBase = this.roundNumber.transform((unitPrice / ((articleTax.percentage / 100) + 1)));
              articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
              this.movementOfArticle.unitPrice -= (articleTax.taxAmount);
            }
          } else {
            this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
          }
        } else {
          this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
        }
      } else if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.CostWithoutVAT) {
        this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
      } else {
        this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
      }
    }
  }

  public changeArticleByVariants(articleSelected: Article) {

    let transaction = this.movementOfArticle.transaction;
    this.movementOfArticle = new MovementOfArticle();
    this.movementOfArticle.transaction = transaction;
    this.movementOfArticle.modifyStock = transaction.type.modifyStock;
    if(transaction.type.stockMovement) {
      this.movementOfArticle.stockMovement = transaction.type.stockMovement.toString();
    }
    this.movementOfArticle.article = articleSelected;
    this.movementOfArticle.code = articleSelected.code;
    this.movementOfArticle.codeSAT = articleSelected.codeSAT;
    this.movementOfArticle.description = articleSelected.description;
    this.movementOfArticle.observation = articleSelected.observation;
    this.movementOfArticle.make = articleSelected.make;
    this.movementOfArticle.category = articleSelected.category;
    this.movementOfArticle.barcode = articleSelected.barcode;
    this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;

    let quotation = 1;
    if(this.movementOfArticle.transaction.quotation) {
      quotation = this.movementOfArticle.transaction.quotation;
    }

    this.movementOfArticle.basePrice = this.roundNumber.transform(articleSelected.basePrice);

    if(articleSelected.currency &&
      Config.currency &&
      Config.currency._id !== articleSelected.currency._id) {
      this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.basePrice * quotation);
    }

    this.movementOfArticle.otherFields = articleSelected.otherFields;
    this.movementOfArticle.costPrice = articleSelected.costPrice;
    if (this.movementOfArticle.transaction &&
      this.movementOfArticle.transaction.type &&
      this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
        let fields: ArticleFields[] = new Array();
        if (this.movementOfArticle.otherFields && this.movementOfArticle.otherFields.length > 0) {
          for (const field of this.movementOfArticle.otherFields) {
            if (field.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((this.movementOfArticle.basePrice * parseFloat(field.value) / 100));
            } else if (field.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
            fields.push(field);
          }
        }
        this.movementOfArticle.otherFields = fields;
        this.movementOfArticle.costPrice = this.roundNumber.transform(articleSelected.costPrice);
        this.movementOfArticle.markupPercentage = articleSelected.markupPercentage;
        this.movementOfArticle.markupPrice = this.roundNumber.transform(articleSelected.markupPrice);
        this.movementOfArticle.unitPrice = this.roundNumber.transform(articleSelected.salePrice);
        this.movementOfArticle.salePrice = this.roundNumber.transform(articleSelected.salePrice);

        if(articleSelected.currency &&
          Config.currency &&
          Config.currency._id !== articleSelected.currency._id) {
            this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.costPrice * quotation);
            this.movementOfArticle.markupPrice = this.roundNumber.transform(this.movementOfArticle.markupPrice * quotation);
            this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.salePrice * quotation);
            this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.salePrice * quotation);
        }
        if(this.movementOfArticle.transaction.type.requestTaxes) {
          let tax: Taxes = new Taxes();
          let taxes: Taxes[] = new Array();
          if (articleSelected.taxes) {
            for (let taxAux of articleSelected.taxes) {
              tax.percentage = this.roundNumber.transform(taxAux.percentage);
              tax.tax = taxAux.tax;
              tax.taxBase = (this.movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
              tax.taxAmount = (tax.taxBase * tax.percentage / 100);
              tax.taxBase = this.roundNumber.transform(tax.taxBase);
              tax.taxAmount = this.roundNumber.transform(tax.taxAmount);
              taxes.push(tax);
            }
          }
          this.movementOfArticle.taxes = taxes;
        }
    } else {
      this.movementOfArticle.markupPercentage = 0;
      this.movementOfArticle.markupPrice = 0;

      let taxedAmount = this.movementOfArticle.basePrice;
      this.movementOfArticle.costPrice = 0;

      let fields: ArticleFields[] = new Array();
      if (this.movementOfArticle.otherFields && this.movementOfArticle.otherFields.length > 0) {
        for (const field of this.movementOfArticle.otherFields) {
          if (field.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform((this.movementOfArticle.basePrice * parseFloat(field.value) / 100));
          } else if (field.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
          if (field.articleField.modifyVAT) {
            taxedAmount += field.amount;
          } else {
            this.movementOfArticle.costPrice += field.amount;
          }
          fields.push(field);
        }
      }
      this.movementOfArticle.otherFields = fields;
      if(this.movementOfArticle.transaction.type.requestTaxes) {
        let taxes: Taxes[] = new Array();
        if (articleSelected.taxes) {
          for (let taxAux of articleSelected.taxes) {
            taxAux.taxBase = this.roundNumber.transform(taxedAmount);
            taxAux.taxAmount = this.roundNumber.transform((taxAux.taxBase * taxAux.percentage / 100));
            taxes.push(taxAux);
            this.movementOfArticle.costPrice += taxAux.taxAmount;
          }
          this.movementOfArticle.taxes = taxes;
        }
      }
      this.movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
      this.movementOfArticle.unitPrice = this.movementOfArticle.basePrice;
      this.movementOfArticle.salePrice = this.movementOfArticle.costPrice;
    }
    this.setValueForm();
  }

  async isValidMovementOfArticle(): Promise<boolean> {

    let isValid = true;

    if (this.movementOfArticle.transaction.type &&
        this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale &&
        this.movementOfArticle.article &&
        !this.movementOfArticle.article.allowSale) {
        isValid = false;
        this.showMessage("El producto " + this.movementOfArticle.article.description + " (" + this.movementOfArticle.article.code + ") no esta habilitado para la venta", 'info', true);
    }

    if (this.movementOfArticle.transaction.type &&
        this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Purchase &&
        this.movementOfArticle.article &&
        !this.movementOfArticle.article.allowPurchase) {
        isValid = false;
        this.showMessage("El producto " + this.movementOfArticle.article.description + " (" + this.movementOfArticle.article.code + ") no esta habilitado para la compra", 'info', true);
    }

    if  (this.movementOfArticle.article &&
        Config.modules.stock &&
        this.movementOfArticle.transaction.type &&
        this.movementOfArticle.transaction.type.modifyStock &&
        this.movementOfArticle.transaction.type.stockMovement === StockMovement.Outflows &&
        !this.movementOfArticle.article.allowSaleWithoutStock) {
        await this.getArticleStock().then(
          articleStock => {
            if (!articleStock || this.movementOfArticle.amount > articleStock.realStock) {
              isValid = false;
              let realStock = 0;
              if(articleStock) {
                realStock = articleStock.realStock;
              }
              this.showMessage("No tiene el stock suficiente del producto " + this.movementOfArticle.article.description + " (" + this.movementOfArticle.article.code + "). Stock Actual: " + realStock, 'info', true);
            }
          }
        );
    }
    return isValid;
  }

  public getArticleStock(): Promise<ArticleStock> {

    return new Promise<ArticleStock>((resolve, reject) => {
      this._articleStockService.getStockByArticle(this.movementOfArticle.article._id).subscribe(
        result => {
          if (!result.articleStocks || result.articleStocks.length <= 0) {
            resolve(null);
          } else {
            resolve(result.articleStocks[0]);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getArticleBySelectedVariants(): Article {

    let articleToReturn: Article;
    let articles: Article[] = new Array();

    if (this.variants && this.variants.length > 0) {
      for (let variant of this.variants) {
        if (variant.value.description === this.selectedVariants[variant.type.name]) {
          articles.push(variant.articleChild);
        }
      }
    }

    if (articles && articles.length > 0) {
      for (let article of articles) {
        let count = 0;
        for (let articleAux of articles) {
          if (article._id === articleAux._id) {
            count++;
          }
        }
        if (count == this.variantTypes.length) {
          articleToReturn = article;
        }
      }
    }

    return articleToReturn;
  }

  public getVariantsByArticleChild(article: Article): Variant[] {

    let variantsToReturn: Variant[] = new Array();

    if (this.variants && this.variants.length > 0) {
      for (let variant of this.variants) {
        if (variant.articleChild._id === article._id) {
          variantsToReturn.push(variant);
        }
      }
    }

    return variantsToReturn;
  }

  async movementOfArticleExists() {

    this.loading = true;

    if(this.movementOfArticle.article) {
      this._movementOfArticleService.movementOfArticleExists(this.movementOfArticle.article._id, this.movementOfArticle.transaction._id).subscribe(
        async result => {
          if (!result.movementsOfArticles) {

            // Si no existe ningún movimiento del producto guardamos uno nuevo

            this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
            this.movementOfArticle.description = this.movementOfArticleForm.value.description;
            this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;

            if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.movementOfArticle = this.recalculateSalePrice(this.movementOfArticle);
            } else {
              this.movementOfArticle = this.recalculateCostPrice(this.movementOfArticle);
            }

            if(await this.isValidMovementOfArticle()) {
              this.saveMovementOfArticle();
            }
          } else {
            let movementFound = result.movementsOfArticles[0];


            this.movementOfArticle.article = movementFound.article;

            this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
            if (this.movementOfArticle._id && this.movementOfArticle._id !== '') {
              this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
            } else {

              if (movementFound.measure === this.movementOfArticleForm.value.measure) {
                this.movementOfArticle._id = movementFound._id;
                this.movementOfArticle.amount += movementFound.amount;
              } else {
                this.saveMovementOfArticle();
              }
            }

            if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.movementOfArticle = this.recalculateSalePrice(this.movementOfArticle);
            } else {
              this.movementOfArticle = this.recalculateCostPrice(this.movementOfArticle);
            }

            if(await this.isValidMovementOfArticle()) {
              this.updateMovementOfArticle();
            }
          }
          this.loading = false;
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    } else {
      this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
      if (this.movementOfArticle._id && this.movementOfArticle._id !== '') {
        this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
      }

      if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
        this.movementOfArticle = this.recalculateSalePrice(this.movementOfArticle);
      } else {
        this.movementOfArticle = this.recalculateCostPrice(this.movementOfArticle);
      }

      if(await this.isValidMovementOfArticle()) {
        this.updateMovementOfArticle();
      }
    }
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;

    if(movementOfArticle.transaction.quotation) {
      quotation = movementOfArticle.transaction.quotation;
    }

    movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);
    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * movementOfArticle.transaction.discountPercent / 100), 3);
    movementOfArticle.unitPrice -= movementOfArticle.transactionDiscountAmount;
    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.00;
    movementOfArticle.markupPercentage = 0.00;

    let taxedAmount = movementOfArticle.basePrice;
    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();
    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (field.datatype === ArticleFieldType.Percentage) {
          field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
        } else if (field.datatype === ArticleFieldType.Number) {
          field.amount = parseFloat(field.value);
        }
        if (field.articleField.modifyVAT) {
          taxedAmount += field.amount;
        } else {
          movementOfArticle.costPrice += field.amount;
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;
    if (movementOfArticle.transaction.type.requestTaxes) {
      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
        let taxes: Taxes[] = new Array();
        for (let articleTax of movementOfArticle.taxes) {
          articleTax.taxBase = taxedAmount;
          articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
          taxes.push(articleTax);
          movementOfArticle.costPrice += articleTax.taxAmount;
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice = movementOfArticle.costPrice + movementOfArticle.roundingAmount;

    return movementOfArticle;
  }

  public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    if (movementOfArticle.article) {

      let quotation = 1;
      if(this.movementOfArticle.transaction.quotation) {
        quotation = this.movementOfArticle.transaction.quotation;
      }

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);

      if(movementOfArticle.article &&
        movementOfArticle.article.currency &&
        Config.currency &&
        Config.currency._id !== movementOfArticle.article.currency._id) {
        movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
      }

      let fields: ArticleFields[] = new Array();
      if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
        for (const field of movementOfArticle.otherFields) {
          if (field.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
          } else if (field.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
          fields.push(field);
        }
      }
      movementOfArticle.otherFields = fields;

      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);

      if( movementOfArticle.article &&
          movementOfArticle.article.currency &&
          Config.currency &&
          Config.currency._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
      }

      movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);
      movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * movementOfArticle.transaction.discountPercent / 100), 3);
      movementOfArticle.unitPrice -= movementOfArticle.transactionDiscountAmount;
      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
      movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
      movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);

      if (movementOfArticle.transaction.type.requestTaxes) {
        let tax: Taxes = new Taxes();
        let taxes: Taxes[] = new Array();
        if (movementOfArticle.taxes) {
          for (let taxAux of movementOfArticle.taxes) {
            tax.percentage = this.roundNumber.transform(taxAux.percentage);
            tax.tax = taxAux.tax;
            tax.taxBase = (movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
            tax.taxAmount = (tax.taxBase * tax.percentage / 100);
            tax.taxBase = this.roundNumber.transform(tax.taxBase);
            tax.taxAmount = this.roundNumber.transform(tax.taxAmount);
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;
      }
    } else {
      this.showMessage("No se puede recalcular el precio ya que el producto fue eliminado de la base de datos.", "info", true);
    }

    return movementOfArticle;
  }

  public saveMovementOfArticle(): void {

    this.loading = true;

    this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.basePrice);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.costPrice);
    this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.unitPrice, 4);
    this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.salePrice);

    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.activeModal.close('save');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public deleteMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.deleteMovementOfArticle(this.movementOfArticleForm.value._id).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.activeModal.close('delete');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateMovementOfArticle() {

    this.loading = true;

    this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.basePrice);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.costPrice);
    this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.unitPrice, 4);
    this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.salePrice);

    this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.activeModal.close('update');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
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
