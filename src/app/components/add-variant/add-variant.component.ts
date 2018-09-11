import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal, NgbAlertModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Variant } from './../../models/variant';
import { VariantType } from './../../models/variant-type';
import { VariantValue } from './../../models/variant-value';
import { Article, ArticleType } from './../../models/article';

import { VariantService } from './../../services/variant.service';
import { VariantValueService } from './../../services/variant-value.service';
import { VariantTypeService } from './../../services/variant-type.service';
import { last } from 'rxjs/operators';

@Component({
  selector: 'app-add-variant',
  templateUrl: './add-variant.component.html',
  styleUrls: ['./add-variant.component.css'],
  providers: [NgbAlertConfig]
})

export class AddVariantComponent implements OnInit {

  public variant: Variant;
  @Input() article: Article;
  public variants: Variant[] = new Array();
  @Input() articlesWithVariants: Article[];
  public variantsByArticles = new Array();
  public variantTypes: VariantType[] = new Array();
  public variantTypeSelected: VariantType;
  public variantValues: VariantValue[];
  public variantForm: FormGroup;
  public alertMessage: string = '';
  public user: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public areVariantsEmpty: boolean;
  public lastVariant: Variant;
  @Output() eventAddVariants: EventEmitter<Article[]> = new EventEmitter<Article[]>();

  public formErrors = {
    'type': '',
    'value': ''
  };

  public validationMessages = {
    'type': {
      'required': 'Este campo es requerido.'
    },
    'value': {
      'required': 'Este campo es requerido.'
    }
  };

  constructor(
    public _variantService: VariantService,
    public _variantTypeService: VariantTypeService,
    public _variantValueService: VariantValueService,
    public _fb: FormBuilder,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _modalService: NgbModal
  ) {
  }

  ngOnInit(): void {

    let pathLocation: string[] = this._router.url.split('/');
    this.user = pathLocation[1];
    if (this.article && this.article._id && this.article._id !== '' &&
    this.variants.length === 0) {
      this.getVariantsByArticleParent();
    }
    if (!this.articlesWithVariants) this.articlesWithVariants = new Array();
    this.getVariantTypes();
    if (!this.variant) {
      this.variant = new Variant();
      this.variant.articleParent = this.article;
    }
    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public buildForm(): void {

    this.variantForm = this._fb.group({
      'type': [this.variant.type, [
          Validators.required
        ]
      ],
      'value': [this.variant.value, [
          Validators.required
        ]
      ],
    });

    this.variantForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  public onValueChanged(data?: any): void {

    if (!this.variantForm) { return; }
    const form = this.variantForm;

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

    this.variantTypeSelected = this.variantForm.value.type;
  }

  public getVariantsByArticleParent(): void {

    this.loading = true;

    this._variantService.getVariantsByArticleParent(this.article).subscribe(
      result => {
        if (!result.variants) {
          this.areVariantsEmpty = true;
          this.variants = null;
        } else {
          this.variants = this.getUniqueVariants(result.variants);
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

  public getUniqueVariants(variants: Variant[]): Variant[] {

    let variantsToReturn: Variant[] = new Array();

    for (let variant of variants) {
      if (variantsToReturn.length > 0) {
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

  public getVariantTypes(): void {

    this.loading = true;

    this._variantTypeService.getVariantTypes().subscribe(
      result => {
        if (!result.variantTypes) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.variantTypes = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantTypes = result.variantTypes;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public setValueForm(): void {

    if (!this.variant.type) this.variant.type = null;
    if (!this.variant.value) this.variant.value = null;
    
    this.variantForm.setValue({
      'type': this.variant.type,
      'value': this.variant.value
    });
  }

  public refreshValues(): void {

    if (this.variantTypeSelected) {
      this.variant.value = null;
      this.getVariantValuesByType(this.variantTypeSelected);
    } else {
      this.variant.type = null;
      this.variant.value = null;
      this.setValueForm();
    }
  }

  public getVariantValuesByType(variantType: VariantType): void {

    this.loading = true;

    this._variantValueService.getVariantValuesByType(variantType).subscribe(
      result => {
        if (!result.variantValues) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.loading = false;
          this.variantValues = null;
        } else {
          this.hideMessage();
          this.loading = false;
          this.variantValues = result.variantValues;
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public openModal(op: string, article: Article): void {

  };

  public addVariant(): void {

    //Capturamos los valores del formulario de la variante a añadir
    this.variant = this.variantForm.value;

    //Comprobamos que la variante no existe
    if (!this.variantExists(this.variant)) {

      this.variant.articleParent = this.article;

      //Consultamos si ya fue creado algun producto Child
      if (this.articlesWithVariants.length === 0) {
        //Si no fue creado un producto child lo creamos, le asigamos nombre de variante y almacenamos
        let article: Article = this.copyArticle(this.article);
        article.variantDescription = this.variant.value.description;
        this.variant.articleChild = article;
        this.articlesWithVariants.push(article);
        this.eventAddVariants.emit(this.articlesWithVariants);

        //Almacenamos según la descripción las variantes que le pertecen
        this.variantsByArticles[article.variantDescription] = new Array();
        this.variantsByArticles[article.variantDescription].push(this.variant);
        this.lastVariant = this.variant;
      } else {
        //Si fue creado algun producto Child, consultamos si el tipo de variante existe
        if (this.variantTypeExists(this.variant.type)) {
          //Juntamos las variantes del primer producto existente por su descripcion para poder unirlas al nuevo producto Child
          //y solo cambiar la variante que nos hace falta
          this.variant.articleParent = this.lastVariant.articleParent;
          this.variant.articleChild = this.lastVariant.articleChild;
          let variantsByArticlesAux = new Array();
          let array = new Array();
          for (let desc in this.variantsByArticles) {
            let article: Article = this.copyArticle(this.variant.articleChild);
            array = this.copyArray(this.variantsByArticles[desc]);
            for (let i = 0; i < array.length; i++) {
              if (array[i].type._id === this.variant.type._id) {
                article.variantDescription += this.variant.value.description;
                variantsByArticlesAux.push(this.variant);
              } else {
                article.variantDescription += array[i].value.description;
                variantsByArticlesAux.push(array[i]);
              }
  
              if (i < (array.length - 1)) {
                article.variantDescription += " / ";
              }
            }
            if (!this.setOfVariantsExists(article.variantDescription)) {
              this.articlesWithVariants.push(article);
              this.eventAddVariants.emit(this.articlesWithVariants);
              this.variantsByArticles[article.variantDescription] = this.copyArray(variantsByArticlesAux);
            }
          }
          //Almacenamos nuevo producto, y almacenamos en ese productos todas las variantes que le corresponden
        } else {
          //Creamos una copia de variantes de productos y lo vaciamos
          let variantsByArticlesAux = new Array();
          variantsByArticlesAux = this.copyArray(this.variantsByArticles);
          this.variantsByArticles = new Array();
          //Si el tipo no existe recorremos todos los productos y le agregamos la variante solicitada
          for (let articleAux of this.articlesWithVariants) {
            //Guardamos las variantes en un arreglo provisorio para eliminar el elemento del arreglo
            let variantsByArticleAux = this.copyArray(variantsByArticlesAux[articleAux.variantDescription]);
            //Agregamos la variante a la descripción
            articleAux.variantDescription += " / " + this.variant.value.description;
            //Creamos un nuevo elemento en el arreglo y agregamos la variante que se solicita
            this.variantsByArticles[articleAux.variantDescription] = new Array();
            for (let i = 0; i < variantsByArticleAux.length; i++) {
              this.variantsByArticles[articleAux.variantDescription].push(variantsByArticleAux[i]);
            }
            this.variantsByArticles[articleAux.variantDescription].push(this.variant);
          }
        }
      }
      this.variants.push(this.variant);
      this.variant = new Variant();
      this.setValueForm();
      this.buildForm();
    } else {
      this.showMessage("La variante " + this.variant.type.name + " " + this.variant.value.description + " ya existe", 'info', true);
    }
  }

  public updateVariant(article: Article): void {
    this.openModal('update', article);
  }

  public copyArticle(articleToCopy: Article): Article {

    let article: Article = new Article();
    article.type = ArticleType.Variant;
    article.containsVariants = false;
    article.code = articleToCopy.code;
    article.description = articleToCopy.description;
    article.posDescription = articleToCopy.posDescription;
    article.variantDescription = '';
    article.observation = articleToCopy.observation;
    article.basePrice = articleToCopy.basePrice;
    article.costPrice = articleToCopy.costPrice;
    article.markupPercentage = articleToCopy.markupPercentage;
    article.markupPrice = articleToCopy.markupPrice;
    article.salePrice = articleToCopy.salePrice;
    article.make = articleToCopy.make;
    article.category = articleToCopy.category;
    article.barcode = articleToCopy.barcode;
    article.printIn = articleToCopy.printIn;
    article.allowPurchase = articleToCopy.allowPurchase;
    article.allowSale = articleToCopy.allowSale;
    article.allowSaleWithoutStock = articleToCopy.allowSaleWithoutStock;
    article.printed = articleToCopy.printed;

    return article;
  }

  public copyArray(arrayToCopy) {
    
    let array = new Array();

    if (arrayToCopy && arrayToCopy.length && arrayToCopy.length > 0) {
      for(let i = 0; i < arrayToCopy.length; i++) {
        array.push(arrayToCopy[i]);
      }
    } else {
      for (let prop in arrayToCopy) {
        array[prop] = arrayToCopy[prop];
      }
    }

    return array;
  }

  public variantTypeExists(variantType: VariantType): boolean {

    var exists: boolean = false;

    if (this.variants && this.variants.length > 0) {
      for (var variantAux of this.variants) {
        if (variantAux.type._id === variantType._id) {
          exists = true;
        }
      }
    }

    return exists;
  }

  public variantExists(variant: Variant): boolean {

    var exists: boolean = false;

    if (this.variants && this.variants.length > 0) {
      for (var variantAux of this.variants) {
        if (variantAux.type._id === variant.type._id &&
          variantAux.value._id === variant.value._id) {
          exists = true;
        }
      }
    }

    return exists;
  }

  public setOfVariantsExists(variantDescription: string): boolean {

    let exists: boolean = false;

    if (this.articlesWithVariants.length > 0) {
      for(let i = 0; i < this.articlesWithVariants.length; i++) {
        if (this.articlesWithVariants[i].variantDescription === variantDescription) {
          exists = true;
        }
      }
    }

    return exists;
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