//Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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

//Services
import { MovementOfArticleService } from '../../services/movement-of-article.service';
import { VariantService } from '../../services/variant.service';
import { VariantValueService } from '../../services/variant-value.service';
import { ArticleStockService } from '../../services/article-stock.service';

//Pipes
import { RoundNumberPipe } from '../../pipes/round-number.pipe';
import { TransactionMovement } from '../../models/transaction-type';
import { version } from 'punycode';

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
  public alertMessage: string = "";
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber: RoundNumberPipe;
  public errVariant: string;

  public formErrors = {
    'description': '',
    'amount': '',
    'salePrice': ''
  };

  public validationMessages = {
    'description': {
      'required': 'Este campo es requerido.'
    },
    'amount': {
      'required': 'Este campo es requerido.'
    },
    'salePrice': {
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
    this.containsVariants = this.movementOfArticle.article.containsVariants;
    if(this.movementOfArticle.article && this.containsVariants) {
      this.getVariantsByArticleParent();
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

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
      'salePrice': [this.movementOfArticle.salePrice, [
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

    if(this.containsVariants) {
      if(this.variantTypes.length > 0) {
        for(let type of this.variantTypes) {
          if(this.selectedVariants[type.name] === null) {
            isValid = false;
          }
        }
      }
    }

    return isValid;
  }

  public getVariantsByArticleParent(): void {

    this.loading = true;

    this._variantService.getVariantsByArticleParent(this.movementOfArticle.article).subscribe(
      result => {
        if (!result.variants) {
          this.areVariantsEmpty = true;
          this.variants = null;
        } else {
          this.variants = result.variants;
          this.variantTypes = this.getUniqueValues('type', this.variants);
          this.initializeSelectedVariants();
          this.areVariantsEmpty = false;

        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public initializeSelectedVariants(): void {
    
    if(this.variantTypes && this.variantTypes.length > 0) {
      for(let type of this.variantTypes) {
        let key = type.name;
        this.selectedVariants[key] = null;
      }
    }
  }

  public getVariantsByType(variantType: VariantType): Variant[] {

    let variantsToReturn: Variant[] = new Array();

    for(let variant of this.variants) {
      if (variant.type._id === variantType._id) {
        if (variantsToReturn.length > 0) {
          for(let variantAux of variantsToReturn) {
            if(variant.value._id !== variantAux.value._id) {
              variantsToReturn.push(variant);
            }
          }
        } else {
          variantsToReturn.push(variant);
        }
      }
    }

    variantsToReturn = this.getUniqueVariants(variantsToReturn);

    return variantsToReturn;
  }

  public getUniqueValues(property: string, array: Array<any>): Array<any> {

    let uniqueArray = new Array();
    let exists = false;

    for (let i = 0; i < array.length; i++) {
      let el = array[i][property];
      exists = false;
      for(let j = 0; j < uniqueArray.length; j++) {
        if (array[i][property]._id === uniqueArray[j]._id) {
          exists = true;
        }
      }
      if(!exists) {
        uniqueArray.push(el);
      }
    }

    return uniqueArray;
  }

  public getUniqueVariants(array: Array<any>): Array<any> {

    let uniqueArray = new Array();
    let exists = false;

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

    return uniqueArray;
  }

  public selectVariant(type: VariantType, value: VariantValue): void {

    let key = type.name;
    if (value.description === this.selectedVariants[key]) {
      this.selectedVariants[key] = null;
    } else {
      this.selectedVariants[key] = value.description;
    }
  }

  public addAmount(): void {
    this.movementOfArticle.amount += 1;
    this.setValueForm();
  }

  public subtractAmount(): void {
    if (this.movementOfArticleForm.value.amount > 1) {
      this.movementOfArticle.amount -= 1;
    } else {
      this.movementOfArticle.amount = 1;
    }
    this.setValueForm();
  }

  public setValueForm(): void {

    if (!this.movementOfArticle._id) this.movementOfArticle._id = "";
    if (!this.movementOfArticle.description) this.movementOfArticle.description = "";
    if (!this.movementOfArticle.amount) this.movementOfArticle.amount = 1;
    if (!this.movementOfArticle.notes) this.movementOfArticle.notes = "";
    if (!this.movementOfArticle.salePrice) this.movementOfArticle.salePrice = 0;

    this.movementOfArticle.amount = this.roundNumber.transform(this.movementOfArticle.amount, 2);

    this.movementOfArticleForm.setValue({
      '_id': this.movementOfArticle._id,
      'description': this.movementOfArticle.description,
      'amount': this.movementOfArticle.amount,
      'notes': this.movementOfArticle.notes,
      'salePrice': this.movementOfArticle.salePrice
    });
  }

  public addMovementOfArticle(): void {

    let isValidForm = this.movementOfArticleForm.valid;

    if(this.containsVariants) {
      if(!this.isValidSelectedVariants()) {
        isValidForm = false;    
        this.errVariant = "Debe seleccionar una variante";
      } else {
        this.errVariant = undefined;
        this.movementOfArticle.article = this.getArticleBySelectedVariants();
        if(this.movementOfArticle.transaction.type.modifyStock) {
          this.getArticleStock();
        } else {
          this.movementOfArticleExists();
        }
        
      }
    } else {
      if (this.movementOfArticle.transaction.type.modifyStock) {
        this.getArticleStock();
      } else {
        this.movementOfArticleExists();
      }
    }
  }

  public getArticleStock(): void {
    
    this.loading = true;

    this._articleStockService.getStockByArticle(this.movementOfArticle.article._id).subscribe(
      result => {
        if (!result.articleStocks || result.articleStocks.length <= 0) {
          this.loading = false;
          this.movementOfArticleExists();
        } else {
          this.loading = false;
          this.articleStock = result.articleStocks[0];
          this.movementOfArticleExists();
        }
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public getArticleBySelectedVariants(): Article {
    
    let articleToReturn: Article;
    let articles: Article[] = new Array();
    
    if(this.variants.length > 0) {
      for(let variant of this.variants) {
        if(variant.value.description === this.selectedVariants[variant.type.name]) {
          articles.push(variant.articleChild);
        }
      }
    }
    
    if (articles.length > 0) {
      for (let article of articles) {
        let count = 0;
        for (let articleAux of articles) {
          if(article._id === articleAux._id) {
            count++;
          }
        }
        if(count == this.variantTypes.length) {
          articleToReturn = article;
        }
      }
    }

    return articleToReturn;
  }

  public getVariantsByArticleChild(article: Article): Variant[] {

    let variantsToReturn: Variant[] = new Array();

    if (this.variants.length > 0) {
      for (let variant of this.variants) {
        if (variant.articleChild._id === article._id) {
          variantsToReturn.push(variant);
        }
      }
    }

    return variantsToReturn;
  }

  public movementOfArticleExists(): void {

    this.loading = true;

    this._movementOfArticleService.movementOfArticleExists(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          if (this.containsVariants) {
            this.loadDescriptionOfVariants();
          } else {
            this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
          }
          this.movementOfArticle.description = this.movementOfArticleForm.value.description;
          this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
          this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.salePrice, 2);
          this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.basePrice, 2);
          this.movementOfArticle.VATAmount = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.VATAmount, 2);
          this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
          this.movementOfArticle.markupPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.markupPrice, 2);
          this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
          this.verifyPermissions("save");
        } else {
          if(this.movementOfArticle._id && this.movementOfArticle._id !== "") {
            this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
          } else {
            this.movementOfArticle._id = result.movementsOfArticles[0]._id;
            this.movementOfArticle.amount += result.movementsOfArticles[0].amount;
          }
          this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.salePrice, 2);
          this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.basePrice, 2);
          this.movementOfArticle.VATAmount = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.VATAmount, 2);
          this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
          this.movementOfArticle.markupPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.markupPrice, 2);
          this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.amount * this.movementOfArticle.article.costPrice, 2);
          this.verifyPermissions("update");
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public verifyPermissions(op: string):void {

    let allowed = true;

    if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale &&
        !this.movementOfArticle.article.allowSale) {
      allowed = false;
      this.showMessage("El artículo no esta habilitado para la venta", "info", true);
    }

    if( this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale &&
        this.movementOfArticle.transaction.type.modifyStock &&
        !this.movementOfArticle.article.allowSaleWithoutStock &&
        this.articleStock &&
        this.movementOfArticle.amount > this.articleStock.realStock) {
      allowed = false;
      this.showMessage("No tiene el stock suficiente para vender este artículo", "info", true);
    }

    if (allowed) {
      if(op === "update") {
        this.updateMovementOfArticle();
      } else {
        this.saveMovementOfArticle();
      }
    } 
  }

  public loadDescriptionOfVariants(): void {
    
    this.movementOfArticle.notes = "";
    let variantsAux: Variant[] = this.getVariantsByArticleChild(this.movementOfArticle.article);
    for (let i = 0; i < variantsAux.length; i++) {
      this.movementOfArticle.notes += variantsAux[i].value.description;
      if (variantsAux[i + 1]) {
        this.movementOfArticle.notes += " / ";
      } else {
        this.movementOfArticle.notes += "\r\n";
      }
    }
    if (this.movementOfArticleForm.value.notes) {
      this.movementOfArticle.notes += this.movementOfArticleForm.value.notes;
    }
  }

  public saveMovementOfArticle(): void {
    
    this.loading = true;

    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.activeModal.close('save');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public deleteMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.deleteMovementOfArticle(this.movementOfArticleForm.value._id).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.activeModal.close('delete');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
        this.loading = false;
      }
    );
  }

  public updateMovementOfArticle() {

    this.loading = true;

    this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== "") this.showMessage(result.message, "info", true);
        } else {
          this.activeModal.close('update');
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, "danger", false);
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
    this.alertMessage = "";
  }
}