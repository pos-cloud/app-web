import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article, Type } from './../../models/article';
import { Category } from './../../models/category';
import { Config } from './../../app.config';
import { MovementOfArticle } from '../../models/movement-of-article';
import { Taxes } from './../../models/taxes';
import { Transaction } from './../../models/transaction';

import { ArticleService } from './../../services/article.service';

import { RoundNumberPipe } from './../../pipes/round-number.pipe';
import { TransactionMovement } from '../../models/transaction-type';
import { ArticleFields } from 'app/models/article-fields';
import { ArticleFieldType } from 'app/models/article-field';
import { FilterPipe } from 'app/pipes/filter.pipe';
import { AuthService } from 'app/services/auth.service';
import { User } from 'app/models/user';
import { TaxService } from 'app/services/tax.service';
import { Tax } from 'app/models/tax';
import { ConfigService } from 'app/services/config.service';
import { Claim, ClaimPriority, ClaimType } from 'app/models/claim';
import { ClaimService } from 'app/services/claim.service';
import { PriceList } from 'app/models/price-list';
import { PriceListService } from 'app/services/price-list.service';
import { CompanyType } from 'app/models/company';
import { TransactionService } from 'app/services/transaction.service';
import { Structure } from 'app/models/structure';
import { StructureService } from 'app/services/structure.service';

@Component({
  selector: 'app-list-articles-pos',
  templateUrl: './list-articles-pos.component.html',
  styleUrls: ['./list-articles-pos.component.scss'],
  providers: [NgbAlertConfig, RoundNumberPipe],
  encapsulation: ViewEncapsulation.None,
})

export class ListArticlesPosComponent implements OnInit {

  public identity: User;
  public articles: Article[];
  public alertMessage: string = '';
  public userType: string = '';
  public orderTerm: string[] = ["description"];
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  @Output() eventAddItem = new EventEmitter<{parent : MovementOfArticle, child :MovementOfArticle[]}>();
  @Input() areArticlesVisible: boolean = false;
  @Input() filterArticle: string = '';
  @Input() transactionId: string;
  @Input() transaction: Transaction;
  public apiURL = Config.apiURL;
  public itemsPerPage = 10;
  public roundNumber = new RoundNumberPipe();
  public articleType: Type;
  public currentPage: number = 0;
  public priceList : PriceList;
  public database: string;
  public filterPipe: FilterPipe = new FilterPipe();
  public filteredArticles: Article[];
  public config: Config;

  constructor(
    private _articleService: ArticleService,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _authService: AuthService,
    private _taxService: TaxService,
    private _configService: ConfigService,
    private _claimService: ClaimService,
    private _priceListService : PriceListService,
    private _transactionService: TransactionService,
    public _structureService : StructureService
  ) {
    this.articles = new Array();
    this.filteredArticles = new Array();
  }

  async ngOnInit() {

    this.database = Config.database;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];

    await this._authService.getIdentity.subscribe(
      identity => {
        this.identity = identity;
      }
    );

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    if((!this.transaction || !this.transaction._id || this.transaction._id === '') && this.transactionId) {
      await this.getTransaction().then(
        async transaction => {
          this.transaction = transaction;
          if(this.transaction && this.transaction.company && this.transaction.company.priceList && this.transaction.company.type === CompanyType.Client ) {
            this.priceList = await this.getPriceList(this.transaction.company.priceList._id)
          }
        }
      );
    }

    this.getArticles();
  }

  public getTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this._transactionService.getTransaction(this.transactionId).subscribe(
        async result => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getArticles(): void {
    
    this.loading = true;
    
    let match = {};

    match['$or'] = new Array();
    match['$or'].push({ type: Type.Final });
    match['$or'].push({ type: Type.Variant });
    match['operationType'] = { $ne: "D" };

    if(this.transaction && this.transaction.type && this.transaction.type.transactionMovement === TransactionMovement.Sale) {
      match['allowSale'] = true;
    }

    if(this.transaction && this.transaction.type && this.transaction.type.transactionMovement === TransactionMovement.Purchase) {
      match['allowPurchase'] = true;
    }

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      type: 1,
      code: 1,
      barcode: 1,
      description: 1,
      posDescription: 1,
      costPrice: 1,
      salePrice: 1,
      picture: 1,
      category: 1,
      operationType: 1,
      allowSale: 1,
      allowPurchase: 1,
      "make._id": 1,
      "make.description": 1,
      "make.visibleSale": 1,
      favourite: 1
    }
    
    this._articleService.getArticlesV2(
        project, // PROJECT
        match, // MATCH
        { posDescription: 1, description: 1, favourite: -1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        if (result && result && result.articles) {
          this.articles = result.articles;
        } else {
          this.articles = new Array();
        }
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getRealPrice(article : Article) : void {
    
    let increasePrice = 0;
    if(this.priceList) {
      if(this.priceList.allowSpecialRules) {
        this.priceList.rules.forEach(rule => {
          if(rule) {
            if(rule.category && article.category && rule.make && article.make && rule.category._id === article.category.toString() && rule.make._id === article.make._id) {
              increasePrice = rule.percentage + this.priceList.percentage
            }
            if(rule.make && article.make && rule.category == null && rule.make._id === article.make._id) {
              increasePrice = rule.percentage + this.priceList.percentage
            }
            if(rule.category && article.category && rule.make == null && rule.category._id === article.category.toString()) {
              increasePrice = rule.percentage + this.priceList.percentage
            }
          }
        });
        if(increasePrice === 0){
          increasePrice = this.priceList.percentage;
        }
      } else {
        increasePrice = this.priceList.percentage
      }

      if(this.priceList.exceptions && this.priceList.exceptions.length > 0) {
        this.priceList.exceptions.forEach(exception =>{
          if(exception) {
            if(article && exception.article && exception.article._id === article._id) {
              increasePrice = exception.percentage
            }
          }
        })
      }

    }
    let realPrice = this.roundNumber.transform(article.salePrice + (article.salePrice * increasePrice / 100));

    return realPrice

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

  async addItem(articleSelected: Article, amount?: number, salePrice?: number) {
    
    let err: boolean = false;

    return new Promise<MovementOfArticle>(async(resolve, reject) => {

    await this.getArticle(articleSelected._id).then(
      async article => {
        if(article) {
          let increasePrice = 0;

          if(this.transaction && this.transaction.company && this.transaction.company.priceList && this.transaction.company.type === CompanyType.Client ) {
            let priceList = await this.getPriceList(this.transaction.company.priceList._id)
            if(priceList) {
              if(priceList.allowSpecialRules) {
                priceList.rules.forEach(rule => {
                  if(rule) {
                    if(rule.category && article.category && rule.make && article.make && rule.category._id === article.category._id && rule.make._id === article.make._id) {
                      increasePrice = rule.percentage + priceList.percentage
                    }
                    if(rule.make && article.make && rule.category == null && rule.make._id === article.make._id) {
                      increasePrice = rule.percentage + priceList.percentage
                    }
                    if(rule.category && article.category && rule.make == null && rule.category._id === article.category._id) {
                      increasePrice = rule.percentage + priceList.percentage
                    }
                  }
                });
                if(increasePrice === 0){
                  increasePrice = priceList.percentage;
                }
              } else {
                increasePrice = priceList.percentage
              }

              if(priceList.exceptions && priceList.exceptions.length > 0) {
                priceList.exceptions.forEach(exception =>{
                  if(exception) {
                    if(article && exception.article && exception.article._id === article._id) {
                      increasePrice = exception.percentage
                    }
                  }
                })
              }
            }
          }

          let movementOfArticle = new MovementOfArticle();
          movementOfArticle.article = article;
          movementOfArticle.code = article.code;
          movementOfArticle.codeSAT = article.codeSAT;
          movementOfArticle.description = article.description;
          movementOfArticle.observation = article.observation;
          movementOfArticle.make = article.make;
          movementOfArticle.category = article.category;
          movementOfArticle.barcode = article.barcode;
          movementOfArticle.transaction = this.transaction;
          movementOfArticle.modifyStock = this.transaction.type.modifyStock;
          movementOfArticle.otherFields = article.otherFields;
          if(amount && amount > 0) movementOfArticle.amount = amount; 

          if(this.transaction.type.stockMovement) {
            movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
          }

          let quotation = 1;
          if(this.transaction.quotation) {
            quotation = this.transaction.quotation;
          }

          movementOfArticle.basePrice = this.roundNumber.transform(article.basePrice);

          if(article.currency &&
            Config.currency &&
            Config.currency._id !== article.currency._id) {
            movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
          }

          if (this.transaction &&
            this.transaction.type &&
            this.transaction.type.transactionMovement === TransactionMovement.Sale) {
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
              movementOfArticle.costPrice = this.roundNumber.transform(article.costPrice);
              movementOfArticle.markupPercentage = article.markupPercentage;
              movementOfArticle.markupPrice = this.roundNumber.transform(article.markupPrice);
              if(salePrice) article.salePrice = salePrice;
              movementOfArticle.unitPrice = this.roundNumber.transform(article.salePrice / movementOfArticle.amount);
              movementOfArticle.salePrice = this.roundNumber.transform(article.salePrice);

              if(article.currency &&
                Config.currency &&
                Config.currency._id !== article.currency._id) {
                  movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
                  movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
              }

              if(increasePrice != 0) {
                  movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.markupPrice + (movementOfArticle.markupPrice *increasePrice / 100));
                  movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice +(movementOfArticle.unitPrice *increasePrice / 100));
                  movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice +(movementOfArticle.salePrice *increasePrice / 100));
              }

              if (this.transaction.type.requestTaxes) {
                let taxes: Taxes[] = new Array();
                if (article.taxes) {
                  for (let taxAux of article.taxes) {
                    let tax: Taxes = new Taxes();
                    if(taxAux.tax && taxAux.tax._id) {
                      tax.tax = taxAux.tax;
                    } else if(taxAux.tax && typeof taxAux.tax === 'string' && taxAux.tax != '') {
                      this.saveClaim('ERROR ARTICLE NULL - LINEA 510 -', JSON.stringify(article));
                      let query = `where="_id":"${taxAux.tax}"`;
                      await this.getTaxes(query).then(
                        taxes => {
                          if(taxes && taxes.length > 0) {
                            tax.tax = taxes[0];
                          } else {
                            err = true;
                            this.showMessage("Error interno de la aplicación, comunicarse con Soporte.", "danger", false);
                          }
                        }
                      );
                    } else if(taxAux.tax === null) {
                      this.saveClaim('ERROR ARTICLE NULL - LINEA 523 -', JSON.stringify(article));
                      err = true;
                      this.showMessage("Error interno de la aplicación, comunicarse con Soporte.", "danger", false);
                    }
                    tax.percentage = this.roundNumber.transform(taxAux.percentage);
                    tax.taxAmount = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount);
                    tax.taxBase = this.roundNumber.transform(taxAux.taxBase * movementOfArticle.amount);
                    taxes.push(tax);
                  }
                }
                movementOfArticle.taxes = taxes;
              }
          } else {
            movementOfArticle.markupPercentage = 0;
            movementOfArticle.markupPrice = 0;

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
                    taxedAmount += field.amount;
                  } else {
                    movementOfArticle.costPrice += field.amount;
                  }
                }
                fields.push(field);
              }
            }
            movementOfArticle.otherFields = fields;
            if(this.transaction.type.requestTaxes) {
              let taxes: Taxes[] = new Array();
              if (article.taxes) {
                for (let taxAux of article.taxes) {
                  if(taxAux.tax && taxAux.tax._id) {
                    taxAux.tax = taxAux.tax;
                  } else if(taxAux.tax && typeof taxAux.tax === 'string' && taxAux.tax != '') {
                    this.saveClaim('ERROR ARTICLE NULL - LINEA 572 -', JSON.stringify(article));
                    let query = `where="_id":"${taxAux.tax}"`;
                    await this.getTaxes(query).then(
                      taxes => {
                        if(taxes && taxes.length > 0) {
                          taxAux.tax = taxes[0];
                        } else {
                          err = true;
                          this.showMessage("Error interno de la aplicación, comunicarse con Soporte.", "danger", false);
                        }
                      }
                    );
                  } else if(taxAux.tax === null) {
                    this.saveClaim('ERROR ARTICLE NULL - LINEA 585 -', JSON.stringify(article));
                    err = true;
                    this.showMessage("Error interno de la aplicación, comunicarse con Soporte.", "danger", false);
                  }
                  taxAux.taxBase = this.roundNumber.transform(taxedAmount);
                  if(taxAux.percentage !== 0) {
                    taxAux.taxAmount = this.roundNumber.transform((taxAux.taxBase * taxAux.percentage / 100));
                  }
                  taxes.push(taxAux);
                  movementOfArticle.costPrice += taxAux.taxAmount;
                }
                movementOfArticle.taxes = taxes;
              }
            }
            movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
            movementOfArticle.unitPrice = movementOfArticle.basePrice;
            movementOfArticle.salePrice = movementOfArticle.costPrice;
          }
          this.areArticlesVisible = true;
          if(!err) {
            resolve(movementOfArticle)
          }
        }
      }
    );

    })
  }

  async getStructureForStock(articleSelected: Article, amount?: number, salePrice?: number) {

      this.loading = true;

      /// ORDENAMOS LA CONSULTA
      let sortAux = {}

      // FILTRAMOS LA CONSULTA

      let match = `{
        "operationType": { "$ne": "D" }, 
        "parent._id": { "$oid" : "${articleSelected._id}"},
        "optional" : false
      }`;

      match = JSON.parse(match);

      // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
      let project = {
        "_id" : 1,
        "parent._id" : 1,
        "child._id" : 1,
        "optional" :1 ,
        "quantity" : 1,
        operationType : 1
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

          var parent : MovementOfArticle;
          var child : MovementOfArticle[] = new Array();
          if (result && result[0] && result[0].structures) {
            var structures : Structure[] = result[0].structures
            if(structures.length > 0 ){
              parent = await this.addItem(articleSelected,amount,salePrice)
              for (const iterator of structures) {
                child.push(await this.addItem(iterator.child,iterator.quantity))
              }
            } else {
              parent = await this.addItem(articleSelected,amount,salePrice)
            }
            
            this.eventAddItem.emit({parent,child});
          } else {
            parent = await this.addItem(articleSelected,amount,salePrice)
            this.eventAddItem.emit({parent,child});
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
    
  }

  public getTaxes(query?: string): Promise<Tax[]> {

    return new Promise<Tax[]> ((resolve, reject) => {

      this._taxService.getTaxes(query).subscribe(
        result => {
          if (!result.taxes) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.taxes);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getArticle(articleId: string): Promise<Article> {

    return new Promise<Article> ((resolve, reject) => {

      this._articleService.getArticle(articleId).subscribe(
        result => {
          if (!result.article) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.article);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async filterItem(article?: Article, category?: Category) {

    let isCodePrefix: boolean = false;

    // GUARDAMOS LE CÓDIGO ORIGINAL PARA LOS PESABLES
    let originalFilter: string = this.filterArticle;

    // CORTAMOS EL CÓDIGO SI ES PESABLE
    if(this.transaction && this.transaction.type.transactionMovement === TransactionMovement.Sale &&
      this.config.tradeBalance.codePrefix && this.config.tradeBalance.codePrefix !== 0) {
      if(this.filterArticle.slice(0, this.config.tradeBalance.codePrefix.toString().length) === this.config.tradeBalance.codePrefix.toString()) {
        this.filterArticle = this.padNumber(this.filterArticle.slice((this.config.tradeBalance.codePrefix.toString().length + 
                                                      this.config.tradeBalance.numberOfQuantity), 
                                                      (originalFilter.length -
                                                        this.config.tradeBalance.numberOfDecimals -
                                                        this.config.tradeBalance.numberOfIntegers - 1)), this.config.article.code.validators.maxLength);
          isCodePrefix = true;
        }
    }
    
    // FILTRA DENTRO DE LA CATEGORIA SI EXISTE
    if(article) {
      // CORTAMOS EL CÓDIGO SI MANDA CANTIDAD *
      var amount = 1;
      if(this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
        amount = parseFloat(this.filterArticle.slice(1, this.filterArticle.length));
      }
      await this.getStructureForStock(article, amount);
    } else if(category) {
      this.filteredArticles = this.filterPipe.transform(this.articles, category._id, 'category');
      this.filteredArticles = this.filterPipe.transform(this.filteredArticles, Type.Final.toString(), 'type');
      if (this.filterArticle && this.filterArticle !== "") {
        this.filteredArticles = this.filterPipe.transform(this.filteredArticles, this.filterArticle);
      }
    } else if(this.filterArticle && this.filterArticle !== "") {

      this.filteredArticles = this.filterPipe.transform(this.articles, this.filterArticle);

      if (this.filteredArticles && this.filteredArticles.length > 0 && this.articles && this.articles.length >= 2) {
        
        this.hideMessage();

        var count = 1;

        if (this.filteredArticles.length === 1) {
          article = this.filteredArticles[0];
        } else if (this.filteredArticles.length > 1) {
          count = 0;
          for(let art of this.filteredArticles) {
            if(art.type === Type.Final) {
              if(isCodePrefix && 
                this.padNumber(art.code, this.config.article.code.validators.maxLength) === this.padNumber(this.filterArticle, this.config.article.code.validators.maxLength)) {
                count++;
                article = art;
              } else if(!isCodePrefix) {
                count++;
                article = art;
              }
            }
          }
        }
        if (  count === 1 &&
              this.filterArticle &&
            ( article &&
              (article.barcode && article.barcode === this.filterArticle) ||
              (article.description && article.description.toUpperCase() === this.filterArticle.toUpperCase()) ||
              (article.posDescription && article.posDescription.toUpperCase() === this.filterArticle.toUpperCase()) ||
              (article.code && article.code === this.filterArticle))) {
                this.filterArticle = '';
                if(this.transaction.type.transactionMovement === TransactionMovement.Sale && isCodePrefix) {
                  let wholePart = originalFilter.slice((originalFilter.length -
                                                        this.config.tradeBalance.numberOfDecimals -
                                                        this.config.tradeBalance.numberOfIntegers - 1)
                                                        , 
                                                        (originalFilter.length -
                                                          this.config.tradeBalance.numberOfDecimals -
                                                          this.config.tradeBalance.numberOfIntegers - 1) + 
                                                          this.config.tradeBalance.numberOfIntegers);
                  let decimalPart = originalFilter.slice((originalFilter.length -
                                                          this.config.tradeBalance.numberOfDecimals - 1),
                                                          (originalFilter.length - 1));
                  let salePrice = parseFloat(wholePart + "." + decimalPart);
                  let amount = 1;
                  if(this.config.tradeBalance.numberOfQuantity && this.config.tradeBalance.numberOfQuantity != 0) {
                    amount = parseInt(originalFilter.slice(this.config.tradeBalance.codePrefix.toString().length, 
                                                            this.config.tradeBalance.codePrefix.toString().length + this.config.tradeBalance.numberOfQuantity));
                  }
                  await this.getStructureForStock(article, amount, salePrice);
                } else {
                  await this.getStructureForStock(article);
                }
        } else {
          this.filteredArticles = this.filterPipe.transform(this.filteredArticles, Type.Final.toString(), 'type');
          this.eventAddItem.emit(null);
        }
      } else {
        this.filteredArticles = this.filterPipe.transform(this.filteredArticles, Type.Final.toString(), 'type');
        this.eventAddItem.emit(null);
      }
    }
  }


  public padNumber(n, length) {
    var n = n.toString();
    while (n.length < length)
        n = "0" + n;
    return n;
  }

  public saveClaim(titulo: string, message: string): void {
    
    this.loading = true;

    let claim: Claim = new Claim();
    claim.description = message;
    claim.name = titulo;
    claim.priority = ClaimPriority.High;
    claim.type = ClaimType.Err;
    claim.listName = 'ERRORES 500';

    this._claimService.saveClaim(claim).subscribe();
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

