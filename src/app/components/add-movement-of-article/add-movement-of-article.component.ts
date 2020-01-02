//Angular
import { Component, OnInit, Input, EventEmitter, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//Terceros
import { NgbAlertConfig, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

//Models
import { MovementOfArticle, MovementOfArticleStatus } from '../../models/movement-of-article';
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
import { ConfigService } from 'app/services/config.service';
import { Deposit } from 'app/models/deposit';
import { TaxBase } from 'app/models/tax';
import { Transaction } from 'app/models/transaction';
import { CompanyType } from 'app/models/company';
import { PriceListService } from 'app/services/price-list.service';
import { PriceList } from 'app/models/price-list';
import { AddArticleComponent } from '../add-article/add-article.component';
import { StructureService } from 'app/services/structure.service';
import { Structure } from 'app/models/structure';
<<<<<<< HEAD
import { isTemplateExpression, updateConstructSignature } from 'typescript';
=======
import { isTemplateExpression } from 'typescript';
>>>>>>> franco
import { ArticleService } from 'app/services/article.service';
import { async } from '@angular/core/testing';
import { removeSummaryDuplicates } from '@angular/compiler';

@Component({
  selector: 'app-add-movement-of-article',
  templateUrl: './add-movement-of-article.component.html',
  styleUrls: ['./add-movement-of-article.component.scss'],
  providers: [NgbAlertConfig],
  encapsulation: ViewEncapsulation.None
})

export class AddMovementOfArticleComponent implements OnInit {

  @Input() movementOfArticle: MovementOfArticle;
  public containsVariants: Boolean;
  public articleStock: ArticleStock;
  public variants: Variant[];
  public variantTypes: VariantType[];
  public transaction: Transaction;
  public selectedVariants;
  public areVariantsEmpty: boolean = true;
  public movementOfArticleForm: FormGroup;
  public alertMessage: string = '';
  public userType: string;
  public loading: boolean = false;
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber: RoundNumberPipe;
  public errVariant: string;
  public config$: any;
  public orderByPipe: OrderByPipe = new OrderByPipe();
  public stock: number = 0;
  public position: string = '';
  public notes: string[];
  public structures: Structure[];
  public grouped: { name: string, names: [{ id: string, name: string, color: string, quantity: number, increasePrice: number }] }[] = [];
  public movChild: MovementOfArticle[]

  public formErrors = {
    'description': '',
    'amount': '',
    'unitPrice': '',
    'notes': '',
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
    },
    'notes': {
      'maxLength': 'Este campo no puede superar los 180 caracteres.'
    }
  };

  constructor(
    private _movementOfArticleService: MovementOfArticleService,
    private _articleStockService: ArticleStockService,
    private _variantService: VariantService,
    private _configService: ConfigService,
    private _priceListService: PriceListService,
    public _fb: FormBuilder,
    private _modalService: NgbModal,
    public _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _structureService: StructureService,
    public _articleService: ArticleService
  ) {
    this.roundNumber = new RoundNumberPipe();
    this.selectedVariants = {};
    this.movChild = new Array();
  }

  async ngOnInit() {
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.config$ = this._configService.getConfig;

    let depositArticle: Deposit

    if (this.movementOfArticle.article) {
      this.containsVariants = this.movementOfArticle.article.containsVariants;

      if (this.movementOfArticle.article.deposits && this.movementOfArticle.article.deposits.length > 0) {
        this.movementOfArticle.article.deposits.forEach(element => {
          if (element.deposit.branch._id === this.movementOfArticle.transaction.depositDestination.branch._id) {
            this.position += `Dep. ${element.deposit.name} - `;
            depositArticle = element.deposit;
          } else {
            depositArticle = this.movementOfArticle.transaction.depositDestination;
          }
        });
      } else {
        depositArticle = this.movementOfArticle.transaction.depositDestination;
      }

      if (this.movementOfArticle.article.locations && this.movementOfArticle.article.locations.length > 0) {
        this.movementOfArticle.article.locations.forEach(element => {
          if (element.location && element.location.deposit && element.location.deposit._id === depositArticle._id) {
            this.position += `Ubic. ${element.location.description} - ${element.location.positionX} - ${element.location.positionY} - ${element.location.positionZ}`;
          }
        });
      }
      if (Config.modules && Config.modules.stock && this.movementOfArticle.transaction.type.modifyStock) {
        await this.getArticleStock().then(
          articleStock => {
            if (articleStock) {
              this.stock = articleStock.realStock;
            }
          }
        );
      }
    }
    if (this.movementOfArticle.article && this.containsVariants) {
      this.getVariantsByArticleParent();
    }
    await this.getStructure(this.movementOfArticle.article._id)

    this.buildForm();
  }

  ngAfterViewInit() {
    this.focusEvent.emit(true);
  }

  public getStructure(idArticle: string) {

    return new Promise<Boolean>((resolve, reject) => {
      this.loading = true;

      /// ORDENAMOS LA CONSULTA
      let sortAux = { "child.category": 1 }

      // FILTRAMOS LA CONSULTA

      let match = `{
        "operationType": { "$ne": "D" }, 
        "parent._id": { "$oid" : "${idArticle}"}
      }`;

      match = JSON.parse(match);

      // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
      let project = {
        "_id": 1,
        "parent._id": 1,
        "parent.description": 1,
        "child._id": 1,
        "child.category.description": 1,
        "child.description": 1,
        "optional": 1,
        "quantity": 1,
        "increasePrice": 1,
        operationType: 1
      }

      // AGRUPAMOS EL RESULTADO
      let group = {
        _id: null,
        count: { $sum: 1 },
        structures: { $push: "$$ROOT" }
      };

      this._structureService.getStructures(
        project, // PROJECT
        match, // MATCH
        sortAux, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(
        async result => {
          this.loading = false;
          if (result && result[0] && result[0].structures) {

            this.structures = result[0].structures;
            this.structures.forEach((structure: Structure) => {
              const groupIndex = this.grouped.findIndex(
                (item: { name: string, names: [{}] }) => {
                  return item.name === structure.child.category.description;
                });
              if (structure.optional) {
                if (groupIndex !== -1) {
                  this.grouped[groupIndex].names.push({ id: structure.child._id, name: structure.child.description, color: "white", quantity: structure.quantity, increasePrice: structure.increasePrice })
                } else {
                  this.grouped.push({ name: structure.child.category.description, names: [{ id: structure.child._id, name: structure.child.description, color: "white", quantity: structure.quantity, increasePrice: structure.increasePrice }] });
                }
              }

            });

            if(this.movementOfArticle._id && this.movementOfArticle._id !== "" && this.movementOfArticle !== null){

              await this.getOptional().then(
                result =>{
                  if(result){
                    var movementsOfArticles : MovementOfArticle[] = result;

                    for (const movArticle of movementsOfArticles) {
                      
                      for (let x = 0; x < this.grouped.length; x++) {
                        if (this.grouped[x].name === movArticle.category.description) {
                          for (let y = 0; y < this.grouped[x].names.length; y++) {
                            if (movArticle.description === this.grouped[x].names[y].name) {
                              this.grouped[x].names[y].color = "blue";
                            } else {
                              this.grouped[x].names[y].color = "white";
                            }
                          }
                        }
                      }
                      
                    }
                    resolve(true)
                  }
                }
              )



            } else {
              resolve(true)
            }
          } else {
            resolve(false)
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    })

  }

  async getOptional() : Promise <MovementOfArticle[]>{

    return new Promise<MovementOfArticle[]>((resolve, reject) => {

      this._movementOfArticleService.getMovementsOfArticlesV2(
        { movementParent : 1, description : 1, "category.description" : 1 },
        { movementParent : { $oid : this.movementOfArticle._id }},
        {},
        {}
      ).subscribe(
        result => {
          if(result && result.movementsOfArticles){
            resolve(result.movementsOfArticles)
          } else {
            resolve(null)
          }
        },
        error =>{
          resolve(null)
        }
        
      )

    })
    
  }

  public addNote(note: string): void {
    note = note.toUpperCase();
    if (!this.notes) this.notes = new Array();
    if (note && note !== '') {
      if (this.notes.indexOf(note) == -1) {
        this.notes.push(note);
      } else {
        this.deleteNote(note);
      }
    }
  }

  public deleteNote(note: string): void {
    note = note.toUpperCase();
    if (note) this.notes.splice(this.notes.indexOf(note), 1);
  }

  public clearNotes(): void {
    this.movementOfArticle.notes = '';
    this.movementOfArticleForm.value.notes = '';
    this.notes = new Array();
    this.setValueForm();
  }

  public getPriceList(id: string): Promise<PriceList> {

    return new Promise<PriceList>((resolve, reject) => {

      this._priceListService.getPriceList(id).subscribe(
        result => {
          if (!result.priceList) {
            resolve(null);
          } else {
            resolve(result.priceList);
          }
        },
        error => {
          this.showMessage(error._body, "danger", false);
          resolve(null);
        }
      );
    });
  }

  async buildForm() {
    if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
      if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.SaleWithoutVAT) {
        if (this.movementOfArticle.taxes && this.movementOfArticle.taxes.length > 0) {
          let unitPrice = this.movementOfArticle.unitPrice;
          for (const articleTax of this.movementOfArticle.taxes) {
            if (articleTax.tax.taxBase == TaxBase.Neto) {
              articleTax.taxBase = this.roundNumber.transform((unitPrice) / ((articleTax.percentage / 100) + 1));
            }
            if (articleTax.percentage === 0) {
              articleTax.taxAmount = this.roundNumber.transform(articleTax.taxAmount * this.movementOfArticle.amount);
            } else {
              articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
            }
            this.movementOfArticle.unitPrice -= this.roundNumber.transform(articleTax.taxAmount);
          }
        }
      }
    } else {
      if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.CostWithVAT) {
        if (this.movementOfArticle.taxes && this.movementOfArticle.taxes.length > 0) {
          let unitPrice = this.movementOfArticle.unitPrice;
          for (const articleTax of this.movementOfArticle.taxes) {
            if (articleTax.percentage === 0) {
              for (let artTax of this.movementOfArticle.article.taxes) {
                if (artTax.tax._id === articleTax.tax._id) {
                  articleTax.taxAmount = this.roundNumber.transform(artTax.taxAmount);
                }
              }
            } else {
              articleTax.taxBase = unitPrice;
              articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
            }
            this.movementOfArticle.unitPrice += (articleTax.taxAmount);
          }
        }
      }
    }

    this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.unitPrice);



    this.movementOfArticleForm = this._fb.group({
      '_id': [this.movementOfArticle._id, [
      ]
      ],
      'code': [this.movementOfArticle.code, [
      ]
      ],
      'barcode': [this.movementOfArticle.barcode, [
      ]
      ],
      'description': [this.movementOfArticle.description, [
      ]
      ],
      'amount': [this.movementOfArticle.amount, [
        Validators.required
      ]
      ],
      'notes': [this.movementOfArticle.notes, [
        Validators.maxLength(165)
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
      ],
      'stock': [this.stock, [
      ]
      ],
      'position': [this.position, [
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
          this.formErrors
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

    let query = 'where="articleParent":"' + this.movementOfArticle.article._id + '"';

    this._variantService.getVariants(query).subscribe(
      result => {
        if (!result.variants) {
          this.areVariantsEmpty = true;
          this.variants = null;
        } else {
          this.variants = result.variants;
          this.variantTypes = this.getUniqueValues('type', this.variants);
          this.variantTypes = this.orderByPipe.transform(this.variantTypes, ['name']);
          this.variantTypes = this.orderByPipe.transform(this.variantTypes, ['order']);
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
    variantsToReturn = this.getUniqueVariants(variantsToReturn);
    variantsToReturn = this.orderByPipe.transform(variantsToReturn, ['value'], 'description');
    variantsToReturn = this.orderByPipe.transform(variantsToReturn, ['value'], 'order');
    return variantsToReturn;
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

  async selectVariant(type: VariantType, value: VariantValue) {

    let key = type.name;
    if (value.description === this.selectedVariants[key]) {
      this.selectedVariants[key] = null;
    } else {
      this.selectedVariants[key] = value.description;
    }

    this.buildForm();

    if (this.isValidSelectedVariants()) {
      this.movementOfArticle.article = this.getArticleBySelectedVariants();
      this.changeArticleByVariants(this.movementOfArticle.article);
    }
  }

  public addAmount(): void {
    this.movementOfArticle.amount += 1;
    this.setValueForm();
  }

  public subtractAmount(): void {

    if (this.movementOfArticle.transaction.type &&
      this.movementOfArticle.transaction.type.stockMovement &&
      this.movementOfArticle.transaction.type.stockMovement === StockMovement.Inventory ||
      this.movementOfArticle.transaction.type.stockMovement === StockMovement.Transfer) {
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
    if (!this.movementOfArticle.code) this.movementOfArticle.code = "";
    if (!this.movementOfArticle.barcode) this.movementOfArticle.barcode = "";

    let values = {
      '_id': this.movementOfArticle._id,
      'code': this.movementOfArticle.code,
      'barcode': this.movementOfArticle.barcode,
      'description': this.movementOfArticle.description,
      'amount': this.movementOfArticle.amount,
      'notes': this.movementOfArticle.notes,
      'unitPrice': this.movementOfArticle.unitPrice,
      'measure': this.movementOfArticle.measure,
      'quantityMeasure': this.movementOfArticle.quantityMeasure,
      'stock': this.stock,
      'position': this.position
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

    if (this.movementOfArticleForm.value.amount >= 0) {
      if (this.movementOfArticleForm.value.measure) {
        this.movementOfArticle.measure = this.movementOfArticleForm.value.measure;
        this.movementOfArticle.quantityMeasure = this.movementOfArticleForm.value.quantityMeasure;
        this.movementOfArticle.amount = this.roundNumber.transform(eval(this.movementOfArticleForm.value.measure) * this.movementOfArticleForm.value.quantityMeasure);
        this.movementOfArticle.notes = this.movementOfArticleForm.value.measure;
      } else {
        this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
        this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
      }

      if (this.notes && this.notes.length > 0) {
        for (let i = 0; i < this.notes.length; i++) {
          if (i == 0 && this.movementOfArticle.notes && this.movementOfArticle.notes !== '') {
            this.movementOfArticle.notes += `; `;
          }
          this.movementOfArticle.notes ? this.movementOfArticle.notes += this.notes[i] : this.movementOfArticle.notes = this.notes[i];

          if (i < this.notes.length - 1) {
            this.movementOfArticle.notes += `; `;
          }
        }
      }

      this.movementOfArticleForm.value.notes = this.movementOfArticle.notes;

      if (this.containsVariants) {
        this.movementOfArticle.article = this.getArticleBySelectedVariants();
      }

      this.calculateUnitPrice();

      if (this.containsVariants) {
        if (!this.isValidSelectedVariants()) {
          if (!this.variants || this.variants.length === 0) {
            if (await this.isValidMovementOfArticle(this.movementOfArticle)) {
              this.movementOfArticleExists();
            }
          } else {
            this.errVariant = "Debe seleccionar una variante";
          }
        } else {
          this.errVariant = undefined;
          if (await this.isValidMovementOfArticle(this.movementOfArticle)) {
            this.movementOfArticleExists();
          }
        }
      } else {
        if (await this.isValidMovementOfArticle(this.movementOfArticle)) {
          this.movementOfArticleExists();
        }
      }
    } else {
      this.showMessage("La cantidad del producto debe ser mayor o igual a 0.", "info", true);
    }
  }

  async calculateUnitPrice() {

    if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
      if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.SaleWithVAT) {
        this.movementOfArticle.unitPrice = this.movementOfArticleForm.value.unitPrice;
      } else if (this.movementOfArticle.transaction.type.entryAmount === EntryAmount.SaleWithoutVAT) {
        if (this.movementOfArticle.transaction.type.requestTaxes) {
          if (this.movementOfArticle.taxes && this.movementOfArticle.taxes.length > 0) {
            this.movementOfArticle.unitPrice = 0;
            for (const articleTax of this.movementOfArticle.taxes) {
              articleTax.taxBase = this.movementOfArticleForm.value.unitPrice;
              if (articleTax.percentage && articleTax.percentage !== 0) {
                articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
              } else {
                articleTax.taxAmount = articleTax.taxAmount * this.movementOfArticle.amount;
              }
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
            let impInt: number = 0;
            for (let taxAux of this.movementOfArticle.article.taxes) {
              if (taxAux.percentage === 0) {
                impInt = this.roundNumber.transform(taxAux.taxAmount);
              }
            }
            for (const articleTax of this.movementOfArticle.taxes) {
              if (articleTax.percentage === 0) {
                for (let artTax of this.movementOfArticle.article.taxes) {
                  if (artTax.tax._id === articleTax.tax._id) {
                    articleTax.taxAmount = this.roundNumber.transform(artTax.taxAmount);
                  }
                }
              } else {
                articleTax.taxBase = this.roundNumber.transform(((unitPrice - impInt) / ((articleTax.percentage / 100) + 1)));
                articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
              }
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

  async changeArticleByVariants(articleSelected: Article) {

    let transaction = this.movementOfArticle.transaction;
    this.movementOfArticle = new MovementOfArticle();
    this.movementOfArticle.transaction = transaction;
    this.movementOfArticle.modifyStock = transaction.type.modifyStock;
    if (transaction.type.stockMovement) {
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
    if (this.movementOfArticle.transaction.quotation) {
      quotation = this.movementOfArticle.transaction.quotation;
    }

    this.movementOfArticle.basePrice = this.roundNumber.transform(articleSelected.basePrice);

    if (articleSelected.currency &&
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
          if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((this.movementOfArticle.basePrice * parseFloat(field.value) / 100));
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
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

      if (articleSelected.currency &&
        Config.currency &&
        Config.currency._id !== articleSelected.currency._id) {
        this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.costPrice * quotation);
        this.movementOfArticle.markupPrice = this.roundNumber.transform(this.movementOfArticle.markupPrice * quotation);
        this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.salePrice * quotation);
        this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.salePrice * quotation);
      }
      if (this.movementOfArticle.transaction.type.requestTaxes) {
        let taxes: Taxes[] = new Array();
        if (articleSelected.taxes) {
          for (let taxAux of articleSelected.taxes) {
            let tax: Taxes = new Taxes();
            tax.percentage = this.roundNumber.transform(taxAux.percentage);
            tax.tax = taxAux.tax;
            if (tax.tax.taxBase == TaxBase.Neto) {
              tax.taxBase = this.roundNumber.transform(this.movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
            }
            if (tax.percentage === 0) {
              tax.taxAmount = this.roundNumber.transform(taxAux.taxAmount * this.movementOfArticle.amount);
            } else {
              tax.taxAmount = this.roundNumber.transform(tax.taxBase * tax.percentage / 100);
            }
            taxes.push(tax);
          }
        }
        this.movementOfArticle.taxes = taxes;
      }

      let increasePrice = 0;

      if (this.movementOfArticle &&
        this.movementOfArticle.transaction &&
        this.movementOfArticle.transaction.company &&
        this.movementOfArticle.transaction.company.priceList &&
        this.movementOfArticle.transaction.company.priceList != null &&
        this.movementOfArticle.transaction.company.type === CompanyType.Client) {
        let priceList = await this.getPriceList(this.movementOfArticle.transaction.company.priceList._id)
        if (priceList) {
          if (priceList.allowSpecialRules) {
            priceList.rules.forEach(rule => {
              if (rule) {
                if (this.movementOfArticle &&
                  this.movementOfArticle.article &&
                  this.movementOfArticle.article.category &&
                  this.movementOfArticle.article.make &&
                  rule.category &&
                  rule.make &&
                  rule.category._id === this.movementOfArticle.article.category._id &&
                  rule.make._id === this.movementOfArticle.article.make._id) {

                  increasePrice = rule.percentage + priceList.percentage
                }
                if (this.movementOfArticle &&
                  this.movementOfArticle.article &&
                  this.movementOfArticle.article.make &&
                  rule.make &&
                  rule.category === null &&
                  rule.make._id === this.movementOfArticle.article.make._id) {

                  increasePrice = rule.percentage + priceList.percentage
                }
                if (this.movementOfArticle &&
                  this.movementOfArticle.article &&
                  this.movementOfArticle.article.category &&
                  rule.category &&
                  rule.make === null &&
                  rule.category._id === this.movementOfArticle.article.category._id) {

                  increasePrice = rule.percentage + priceList.percentage
                }
              }
              if (increasePrice === 0) {
                increasePrice = priceList.percentage
              }
            });
          } else {
            increasePrice = priceList.percentage
          }

          if (priceList.exceptions && priceList.exceptions.length > 0) {
            priceList.exceptions.forEach(exception => {
              if (exception) {
                if (this.movementOfArticle && this.movementOfArticle.article && exception.article && exception.article._id === this.movementOfArticle.article._id) {
                  increasePrice = exception.percentage
                }
              }
            })
          }
        }
      }

      if (increasePrice != 0) {
        this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.unitPrice + (this.movementOfArticle.unitPrice * increasePrice / 100));
      }

    } else {
      this.movementOfArticle.markupPercentage = 0;
      this.movementOfArticle.markupPrice = 0;

      let taxedAmount = this.movementOfArticle.basePrice;
      this.movementOfArticle.costPrice = 0;

      let fields: ArticleFields[] = new Array();
      if (this.movementOfArticle.otherFields && this.movementOfArticle.otherFields.length > 0) {
        for (const field of this.movementOfArticle.otherFields) {
          if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((this.movementOfArticle.basePrice * parseFloat(field.value) / 100));
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
            if (field.articleField.modifyVAT) {
              taxedAmount += field.amount;
            } else {
              this.movementOfArticle.costPrice += field.amount;
            }
          }
          fields.push(field);
        }
      }
      this.movementOfArticle.otherFields = fields;
      if (this.movementOfArticle.transaction.type.requestTaxes) {
        let taxes: Taxes[] = new Array();
        if (articleSelected.taxes) {
          for (let taxAux of articleSelected.taxes) {
            if (taxAux.tax.taxBase == TaxBase.Neto) {
              taxAux.taxBase = this.roundNumber.transform(taxedAmount);
            }
            if (taxAux.percentage === 0) {
              taxAux.taxAmount = this.roundNumber.transform(taxAux.tax.amount * this.movementOfArticle.amount);
            } else {
              taxAux.taxAmount = this.roundNumber.transform((taxAux.taxBase * taxAux.percentage / 100));
            }
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

  async isValidMovementOfArticle(movArticle: MovementOfArticle) {


    return new Promise<boolean>((resolve, reject) => {

      if (movArticle.transaction.type &&
        movArticle.transaction.type.transactionMovement === TransactionMovement.Sale &&
        movArticle.article &&
        !movArticle.article.allowSale) {
        this.showMessage("El producto " + movArticle.article.description + " (" + movArticle.article.code + ") no esta habilitado para la venta", 'info', true);
        resolve(false)
      } else if (
        movArticle.transaction.type &&
        movArticle.transaction.type.transactionMovement === TransactionMovement.Purchase &&
        movArticle.article &&
        !movArticle.article.allowPurchase) {
        this.showMessage("El producto " + movArticle.article.description + " (" + movArticle.article.code + ") no esta habilitado para la compra", 'info', true);
        resolve(false)
      } else if (
        movArticle.article &&
        movArticle.article.taxes &&
        movArticle.article.taxes.length > 0 &&
        movArticle.taxes &&
        movArticle.taxes.length > 0) {
        let taxAmount = 0;
        for (let tax of movArticle.article.taxes) {
          if (tax.percentage === 0 &&
            tax.taxAmount > 0) {
            taxAmount += tax.taxAmount;
          }
        }
        if (taxAmount > this.movementOfArticleForm.value.unitPrice) {
          this.showMessage("El precio unitario del producto no puede ser menor a la suma de impuestos con monto fijo.", 'info', true);
          resolve(false)
        }
      } else if (
        movArticle.article &&
        Config.modules.stock &&
        movArticle.transaction.type &&
        movArticle.transaction.type.modifyStock &&
        movArticle.transaction.type.stockMovement === StockMovement.Outflows &&
        !movArticle.article.allowSaleWithoutStock) {
        this.getArticleStock().then(
          articleStock => {
            if (!articleStock || (movArticle.amount + movArticle.quantityForStock) > articleStock.realStock) {
              let realStock = 0;
              if (articleStock) {
                realStock = articleStock.realStock;
              }
              this.showMessage("No tiene el stock suficiente del producto " + movArticle.article.description + " (" + movArticle.article.code + "). Stock Actual: " + realStock, 'info', true);
              resolve(false)
            } else {
              resolve(true)
            }
          }
        );
      } else {
        resolve(true)
      }
    });
  }

  async openModal(op: string, article?: Article) {

    let modalRef;
    switch (op) {
      case 'update':
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.articleId = this.movementOfArticle.article._id;
        modalRef.componentInstance.operation = "update";
        modalRef.result.then((result) => {

        }, (reason) => {

        });
        break;

      default: ;
    }
  };

  public getArticleStock(): Promise<ArticleStock> {

    return new Promise<ArticleStock>((resolve, reject) => {

      let depositID;
      let query;

      if (this.movementOfArticle.article.deposits && this.movementOfArticle.article.deposits.length > 0) {
        this.movementOfArticle.article.deposits.forEach(async element => {
          if (element.deposit && element.deposit.branch && element.deposit.branch._id === this.movementOfArticle.transaction.branchOrigin._id) {
            depositID = element.deposit._id;
          }
        });
      }

      if (depositID) {
        query = `where= "article": "${this.movementOfArticle.article._id}",
                        "branch": "${this.movementOfArticle.transaction.branchOrigin._id}",
                        "deposit": "${depositID}"`;

      } else {
        query = `where= "article": "${this.movementOfArticle.article._id}",
                        "branch": "${this.movementOfArticle.transaction.branchOrigin._id}",
                        "deposit": "${this.movementOfArticle.transaction.depositOrigin._id}"`;
      }



      this._articleStockService.getArticleStocks(query).subscribe(
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

    if (this.movementOfArticle.article) {

      let query = 'where="article":"' + this.movementOfArticle.article._id + '","transaction":"' + this.movementOfArticle.transaction._id + '"';

      this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
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

            if (await this.isValidMovementOfArticle(this.movementOfArticle)) {
              this.verifyStructure();
            }
          } else {

            await this.deleteMovementOfStructure();

            let movementFound = result.movementsOfArticles[0];

            this.movementOfArticle.article = movementFound.article;

            this.movementOfArticle.notes = this.movementOfArticleForm.value.notes;
            this.movementOfArticle.amount = this.movementOfArticleForm.value.amount;
            if (movementFound.measure === this.movementOfArticleForm.value.measure) {
                this.movementOfArticle._id = movementFound._id;
                this.movementOfArticle.amount += movementFound.amount;
            }
           
            
            if (this.movementOfArticle.transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.movementOfArticle = this.recalculateSalePrice(this.movementOfArticle);
            } else {
              this.movementOfArticle = this.recalculateCostPrice(this.movementOfArticle);
            }

            if (await this.isValidMovementOfArticle(this.movementOfArticle)) {
              this.verifyStructure()
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

      if (await this.isValidMovementOfArticle(this.movementOfArticle)) {
        this.updateMovementOfArticle();
      }
    }
  }

  async getMovsWithoutOptional() {

    return new Promise<boolean>(async (resolve, reject) => {
      this.loading = true;


      var isFinish: boolean = false;
      for (const iterator of this.structures) {
        if(!iterator.optional){
          if (!isFinish) {
            if(!await this.buildMovsArticle(iterator.child._id, iterator.quantity, iterator.increasePrice)){
              isFinish = true;
            }
          }
        }
      }
      if (isFinish) {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  }

  async getMovsWithOptional() {

    return new Promise<Boolean>(async (resolve, reject) => {

      if (this.grouped && this.grouped.length > 0) {
        for (const name of this.grouped) {
          for (const names of name.names) {
            if (names.color === "blue") {
              await this.buildMovsArticle(names.id, names.quantity, names.increasePrice)
            }
          }
        }
        resolve(true)
      } else {
        resolve(false)
      }

    })
  }

  async buildMovsArticle(articleId: string, quantity: number, salePrice?: number) {

    return new Promise<boolean>((resolve, reject) => {


      this._articleService.getArticle(articleId).subscribe(
        async result => {
          if (result.article) {

            var movArticle = new MovementOfArticle();
            //traigo todo lo del padre transaccion etc...
            //movArticle = this.movementOfArticle;
            movArticle = Object.assign(movArticle, this.movementOfArticle);

            var article: Article = result.article;

            movArticle._id = null;

            //todo lo de article
            movArticle.article = article;
            movArticle.code = article.code;
            movArticle.description = article.description;
            movArticle.make = article.make;
            movArticle.category = article.category;
            movArticle.barcode = article.barcode;

            //para stock y cocina
            movArticle.amount = quantity * this.movementOfArticle.amount;
            movArticle.status = MovementOfArticleStatus.Ready;

            //todo en 0 para que no sume nada

            if (salePrice && salePrice > 0) {
              movArticle.salePrice = salePrice * movArticle.amount;
              movArticle.basePrice = article.basePrice * movArticle.amount;
              movArticle.costPrice = article.costPrice * movArticle.amount;
              movArticle.markupPercentage = article.markupPercentage;
              movArticle.markupPrice = article.markupPrice;
              movArticle.unitPrice = salePrice * movArticle.amount;
              movArticle = await this.recalculateSalePrice(movArticle)
            } else {
              movArticle.salePrice = 0;
              movArticle.basePrice = 0
              movArticle.costPrice = 0
              movArticle.markupPercentage = 0
              movArticle.markupPrice = 0
              movArticle.unitPrice = 0
            }

            if (await this.isValidMovementOfArticle(movArticle)) {
              this.movChild.push(movArticle)
              resolve(true)
            } else {
              resolve(false)
            }

          } else {
            resolve(false)
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(false)
        }
      );
    })
  }

  public saveMovementsOfArticle(movementOfArticle: MovementOfArticle[]): Promise<boolean> {


    return new Promise<boolean>((resolve, reject) => {

      this._movementOfArticleService.saveMovementsOfArticles(movementOfArticle).subscribe(
        result => {
          if (!result.movementsOfArticles) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            this.hideMessage();
            resolve(true);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async getArticle(articleId: string): Promise<Article> {

    return new Promise<Article>((resolve, reject) => {


      this._articleService.getArticle(articleId).subscribe(
        result => {
          if (result.article) {
            resolve(result.article)
          } else {
            resolve(null)
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    })
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);

    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * movementOfArticle.transaction.discountPercent / 100), 3);
    movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.transactionDiscountAmount);
    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.00;
    movementOfArticle.markupPercentage = 0.00;

    let taxedAmount = movementOfArticle.basePrice;
    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();
    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
          if (field.articleField.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
          } else if (field.articleField.datatype === ArticleFieldType.Number) {
            field.amount = parseFloat(field.value);
          }
          if (field.articleField.modifyVAT) {
            taxedAmount += this.roundNumber.transform(field.amount);
          } else {
            movementOfArticle.costPrice += this.roundNumber.transform(field.amount);
          }
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;
    if (movementOfArticle.transaction.type.requestTaxes) {
      if (movementOfArticle.taxes && movementOfArticle.taxes.length > 0) {
        let taxes: Taxes[] = new Array();
        for (let articleTax of movementOfArticle.taxes) {
          if (articleTax.tax.taxBase === TaxBase.Neto) {
            articleTax.taxBase = this.roundNumber.transform(taxedAmount);
          } else {
            articleTax.taxBase = 0;
          }
          if (articleTax.percentage === 0) {
            for (let artTax of movementOfArticle.article.taxes) {
              if (artTax.tax._id === articleTax.tax._id) {
                articleTax.taxAmount = this.roundNumber.transform(artTax.taxAmount * movementOfArticle.amount);
              }
            }
          } else {
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage / 100));
          }
          taxes.push(articleTax);
          movementOfArticle.costPrice += this.roundNumber.transform(articleTax.taxAmount);
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.costPrice + movementOfArticle.roundingAmount);

    return movementOfArticle;
  }

  public recalculateSalePrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    if (movementOfArticle.article) {

      let quotation = 1;
      if (this.movementOfArticle.transaction.quotation) {
        quotation = this.movementOfArticle.transaction.quotation;
      }

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);

      if (movementOfArticle.article &&
        movementOfArticle.article.currency &&
        Config.currency &&
        Config.currency._id !== movementOfArticle.article.currency._id) {
        movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
      }

      let fields: ArticleFields[] = new Array();
      if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
        for (const field of movementOfArticle.otherFields) {
          if (field.articleField.datatype === ArticleFieldType.Percentage || field.articleField.datatype === ArticleFieldType.Number) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value) / 100));
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
          }
          fields.push(field);
        }
      }
      movementOfArticle.otherFields = fields;

      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);

      if (movementOfArticle.article &&
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
        let taxes: Taxes[] = new Array();
        if (movementOfArticle.taxes) {
          let impInt: number = 0;
          for (let taxAux of movementOfArticle.article.taxes) {
            if (taxAux.percentage === 0) {
              impInt = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount);
            }
          }
          for (let taxAux of movementOfArticle.taxes) {
            let tax: Taxes = new Taxes();
            tax.tax = taxAux.tax;
            tax.percentage = this.roundNumber.transform(taxAux.percentage);
            if (tax.tax.taxBase == TaxBase.Neto) {
              tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice - impInt) / ((tax.percentage / 100) + 1));
            }
            if (tax.percentage === 0) {
              tax.taxAmount = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount);
            } else {
              tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100));
            }
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

  async verifyStructure() {

    this.loading = true;

    this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.basePrice);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.costPrice);
    this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.unitPrice, 4);
    this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.salePrice);

    this.movChild = new Array();

    //pregunto si tiene  estructura 
    if (this.structures && this.structures.length > 0) {

      await this.getMovsWithoutOptional().then(
        async result => {
          if (result) {
            if(this.grouped && this.grouped.length > 0){
              await this.getMovsWithOptional().then(
                async result =>{
                  if(result){
                    if(!this.movementOfArticle._id){
                      this.saveMovementOfArticle()
                    } else {
                      this.updateMovementOfArticle()
                    }
                  }
                }
              )
            } else {
              if(!this.movementOfArticle._id){
                this.saveMovementOfArticle()
              } else {
                this.updateMovementOfArticle()
              }
            }
          }
        }
      )
    } else {
      if(!this.movementOfArticle._id){
        this.saveMovementOfArticle()
      } else {
        this.updateMovementOfArticle()
      }
    }

  }

  async saveMovementOfArticle() {
    this._movementOfArticleService.saveMovementOfArticle(this.movementOfArticle).subscribe(
      async result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          //pregunto si hay movchild
          if (this.movChild && this.movChild.length > 0) {

            //le meto a todos el movimiento del padre
            for (let index = 0; index < this.movChild.length; index++) {
              this.movChild[index].movementParent = result.movementOfArticle._id
            }

            //guardo todas las estrcturas
            if (await this.saveMovementsOfArticle(this.movChild)) {
              this.activeModal.close('save');
            }

          } else {
            this.activeModal.close('save');
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

  async deleteMovementOfStructure() {

    return new Promise<boolean>(async (resolve, reject) => {

      let query = '{"movementParent":"' + this.movementOfArticle._id + '"}';
            this._movementOfArticleService.deleteMovementsOfArticles(query).subscribe(
              result => {
                if (result && result.movementsOfArticles) {
                  resolve(true)
                } else {
                  resolve(false)
                }
              }
            )
    })
  }

  public deleteMovementOfArticle(): void {

    this.loading = true;

    this._movementOfArticleService.deleteMovementOfArticle(this.movementOfArticleForm.value._id).subscribe(
      result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          let query = '{"movementParent":"' + result.movementOfArticle._id + '"}';
          this._movementOfArticleService.deleteMovementsOfArticles(query).subscribe(
            result => {
              if (result && result.movementsOfArticles) {
                this.activeModal.close('delete');
              } else {
                this.activeModal.close('delete');
              }
            }
          )
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  async updateMovementOfArticle() {

    this.loading = true;

    this.movementOfArticle.basePrice = this.roundNumber.transform(this.movementOfArticle.basePrice);
    this.movementOfArticle.costPrice = this.roundNumber.transform(this.movementOfArticle.costPrice);
    this.movementOfArticle.unitPrice = this.roundNumber.transform(this.movementOfArticle.unitPrice, 4);
    this.movementOfArticle.salePrice = this.roundNumber.transform(this.movementOfArticle.salePrice);

    this._movementOfArticleService.updateMovementOfArticle(this.movementOfArticle).subscribe(
      async result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          if (this.movChild && this.movChild.length > 0) {

            //le meto a todos el movimiento del padre
            for (let index = 0; index < this.movChild.length; index++) {
              this.movChild[index].movementParent = result.movementOfArticle._id
            }

            //guardo todas las estrcturas
            if (await this.saveMovementsOfArticle(this.movChild)) {
              this.activeModal.close('update');
            }

          } else {
            this.activeModal.close('update');

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

  public changeOptional(child: string, group) {

    for (let x = 0; x < this.grouped.length; x++) {
      if (this.grouped[x].name === group) {
        for (let y = 0; y < this.grouped[x].names.length; y++) {
          if (child === this.grouped[x].names[y].name) {
            this.grouped[x].names[y].color = "blue";
          } else {
            this.grouped[x].names[y].color = "white";
          }
        }
      }
    }

  }

  public selectOptional() {
    return { background: 'black', 'border': '2px solid black' };

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
