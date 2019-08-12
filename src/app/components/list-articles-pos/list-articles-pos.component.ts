
import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Article, ArticleType } from './../../models/article';
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
import { TransactionService } from 'app/services/transaction.service';
import { CompanyType } from 'app/models/company';


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
  @Output() eventAddItem: EventEmitter<MovementOfArticle> = new EventEmitter<MovementOfArticle>();
  @Input() areArticlesVisible: boolean = false;
  @Input() filterArticle: string = '';
  @Input() transaction: Transaction;
  @Input() transactionId : string
  public apiURL = Config.apiURL;
  public itemsPerPage = 10;
  public roundNumber = new RoundNumberPipe();
  public articleType: ArticleType;
  public listTitle: string;
  public currentPage: number = 0;
  public database: string;
  public displayedColumns = [
      'type',
      'code',
      'barcode',
      'description',
      'posDescription',
      'make.description',
      'category.description',
      'category.description',
      'costPrice',
      'salePrice',
      'observation',
      'picture',
      'operationType',
      'currency.name'
  ];
  public filters: any[];
  public totalItems: number = 0;
  public filterPipe: FilterPipe = new FilterPipe();
  public filteredArticles: Article[];
  public config: Config;
  public stock;

  constructor(
    private _articleService: ArticleService,
    private _router: Router,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _authService: AuthService,
    private _taxService: TaxService,
    private _configService: ConfigService,
    private _transactionService : TransactionService,
    private _claimService: ClaimService,
    private _priceListService : PriceListService
  ) {
    this.filters = new Array();
    this.articles = new Array();
    this.filteredArticles = new Array();
    for(let field of this.displayedColumns) {
      this.filters[field] = "";
    }
  }

  async ngOnInit() {


    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.listTitle = pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);

    this._authService.getIdentity.subscribe(
      identity => {
        this.identity = identity;
      }
    );

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
      }
    );

    this.database = Config.database;


    if ('Variantes' === this.listTitle) {
      this.articleType = ArticleType.Variant;
    } else if ('Ingredientes' === this.listTitle) {
      this.articleType = ArticleType.Ingredient;
    } else {
      // ENTRA CUANDO SE HACE UNA TRANSACCIÓN O EN LA TABLA
      this.articleType = ArticleType.Final;
    }
    this.getArticles();

  }

  public getArticles(): void {
    
    this.loading = true;

    /// ORDENAMOS LA CONSULTA
    let sort = { posDescription: 1, description: 1, favourite: -1 };

    // FILTRAMOS LA CONSULTA
    let match = `{`;
    for(let i = 0; i < this.displayedColumns.length; i++) {
      let value = this.filters[this.displayedColumns[i]];
      if (value && value != "") {
        match += `"${this.displayedColumns[i]}": { "$regex": "${value}", "$options": "i"}`;
        if (i < this.displayedColumns.length - 1) {
          match += ',';
        }
      }
    }
    
    match = `{ "$or": [ { "type": "${ArticleType.Final}"}, {"type": "${ArticleType.Variant}" } ] , "operationType": { "$ne": "D" } }`;
    
    match = JSON.parse(match);
    let group = {};
    let limit = 0;
    let skip = 0;

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = {
      type:1,
      code:1,
      barcode:1,
      description:1,
      posDescription:1,
      costPrice:1,
      salePrice:1,
      observation:1,
      picture: 1,
      category: 1,
      operationType: 1,
      isWeigth: 1,
      "make._id": 1,
      "make.description": 1,
      "make.visibleSale": 1,
      priceLists: 1
      //"articleStocks" : 1
    }
    

    this._articleService.getArticlesV2(
        project, // PROJECT
        match, // MATCH
        sort, // SORT
        group, // GROUP
        limit, // LIMIT
        skip // SKIP
    ).subscribe(
      result => {
        this.loading = false;
        console.log(result);
        if (result && result && result.articles) {
          this.articles = result.articles;
          this.totalItems = result.count;
        } else {
          this.articles = new Array();
          this.totalItems = 0;
        }
        
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
        this.totalItems = 0;
      }
    );
  }

  public selectArticle(articleSelected: Article): void {
    this.activeModal.close({ article: articleSelected });
  }

  public getPriceList(id: string): Promise<PriceList[]> {

    return new Promise<PriceList[]>((resolve, reject) => {

      this._priceListService.getPriceList(id).subscribe(
        result => {
          console.log(result)
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

    await this.getArticle(articleSelected._id).then(
      async article => {
        if(article) {
          let increasePrice = 0;
          /*if(this.transaction.company.priceList && this.transaction.company.type === CompanyType.Client ){
            let priceList = await this.getPriceList(this.transaction.company.priceList.toString())
            if(priceList['allowSpecialRules']){
              priceList['rules'].forEach(rule => {
                if(rule){
                  if(rule['category'] === article.category._id && rule['make'] === article.make._id){
                    increasePrice = rule['percentage']
                  }
                }
              });
            } else {
              increasePrice = priceList['percentage']
            }
          }*/

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

          if(increasePrice > 0){
            movementOfArticle.basePrice = this.roundNumber.transform( movementOfArticle.basePrice + (movementOfArticle.basePrice * increasePrice / 100));
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
              if(amount) movementOfArticle.amount = amount; 
              movementOfArticle.unitPrice = this.roundNumber.transform(article.salePrice / movementOfArticle.amount);
              movementOfArticle.salePrice = this.roundNumber.transform(article.salePrice);

              if(article.currency &&
                Config.currency &&
                Config.currency._id !== article.currency._id) {
                  movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
                  movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.markupPrice * quotation);
                  movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
                  movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice * quotation);
              }

              if(increasePrice > 0){
                  movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice + (movementOfArticle.costPrice *increasePrice / 100));
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
                    if(tax.percentage && tax.percentage !== 0) {
                      tax.taxBase = (movementOfArticle.salePrice / ((tax.percentage / 100) + 1));
                      tax.taxAmount = (tax.taxBase * tax.percentage / 100);
                    } else {
                      tax.taxAmount = taxAux.taxAmount;
                    }
                    tax.taxBase = this.roundNumber.transform(tax.taxBase);
                    tax.taxAmount = this.roundNumber.transform(tax.taxAmount);
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
                  if(taxAux.percentage && taxAux.percentage !== 0) {
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
            console.log(movementOfArticle)
            this.eventAddItem.emit(movementOfArticle);
          }
        }
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

  public filterItem(category?: Category) {

    // GUARDAMOS LE CÓDIGO ORIGINAL PARA LOS PESABLES
    let originalFilter: string = this.filterArticle;

    // CORTAMOS EL CÓDIGO SI ES PESABLE
    if(this.transaction.type.transactionMovement === TransactionMovement.Sale &&
      this.config.tradeBalance.codePrefix && this.config.tradeBalance.codePrefix !== 0) {
      if(this.filterArticle.slice(0, this.config.tradeBalance.codePrefix.toString().length) === this.config.tradeBalance.codePrefix.toString()) {
        this.filterArticle = this.padNumber(this.filterArticle.slice((this.config.tradeBalance.codePrefix.toString().length + 
                                                      this.config.tradeBalance.numberOfQuantity), 
                                                      (originalFilter.length -
                                                        this.config.tradeBalance.numberOfDecimals -
                                                        this.config.tradeBalance.numberOfIntegers - 1)), this.config.article.code.validators.maxLength);
      }
    }
    // FILTRA DENTRO DE LA CATEGORIA SI EXISTE
    if(category) {
      this.filteredArticles = this.filterPipe.transform(this.articles, category._id, 'category');
      this.filteredArticles = this.filterPipe.transform(this.filteredArticles, ArticleType.Final.toString(), 'type');
      if (this.filterArticle && this.filterArticle !== "") {
        this.filteredArticles = this.filterPipe.transform(this.filteredArticles, this.filterArticle);
      }
    } else if(this.filterArticle && this.filterArticle !== "") {

      this.filteredArticles = this.filterPipe.transform(this.articles, this.filterArticle);

      if (this.filteredArticles && this.filteredArticles.length > 0 && this.articles && this.articles.length >= 2) {

        this.hideMessage();

        let article;
        var count = 1;

        if (this.filteredArticles.length === 1) {
          article = this.filteredArticles[0];
        } else if (this.filteredArticles.length > 1) {
          count = 0;
          for(let art of this.filteredArticles) {
            if(art.type === ArticleType.Final) {
              count++;
              article = art;
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
                if(article.isWeigth && this.transaction.type.transactionMovement === TransactionMovement.Sale) {
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
                  this.addItem(article, amount, salePrice);
                } else {
                  this.addItem(article);
                }
        } else {
          this.filteredArticles = this.filterPipe.transform(this.filteredArticles, ArticleType.Final.toString(), 'type');
          this.eventAddItem.emit(null);
        }
      } else {
        this.filteredArticles = this.filterPipe.transform(this.filteredArticles, ArticleType.Final.toString(), 'type');
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

