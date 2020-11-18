//Paquetes Angular
import { Component, ElementRef, ViewChild, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbAlertConfig, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { Transaction, TransactionState } from '../transaction/transaction';
import { TransactionMovement, StockMovement, TransactionType } from '../transaction-type/transaction-type';
import { Taxes } from '../tax/taxes';
import { ArticlePrintIn, Article } from '../article/article';
import { ArticleStock } from '../article-stock/article-stock';
import { MovementOfArticle, MovementOfArticleStatus } from '../movement-of-article/movement-of-article';
import { Table, TableState } from '../table/table';
import { Category } from '../category/category';
import { Print } from '../print/print';
import { Printer, PrinterType, PrinterPrintIn } from '../printer/printer';
import { Config } from './../../app.config';
import { CompanyType } from '../company/company';
import { MovementOfCancellation } from "../movement-of-cancellation/movement-of-cancellation"

//Servicios
import { MovementOfArticleService } from '../movement-of-article/movement-of-article.service';
import { TransactionService } from '../transaction/transaction.service';
import { TableService } from '../table/table.service';
import { PrinterService } from '../printer/printer.service';
import { UserService } from '../user/user.service';
import { ArticleStockService } from '../article-stock/article-stock.service';

//Componentes
import { AddMovementOfArticleComponent } from '../movement-of-article/add-movement-of-article/add-movement-of-article.component';
import { SelectEmployeeComponent } from '../employee/select-employee/select-employee.component';
import { PrintComponent } from '../print/print/print.component';
import { DeleteTransactionComponent } from '../transaction/delete-transaction/delete-transaction.component';
import { AddMovementOfCashComponent } from '../movement-of-cash/add-movement-of-cash/add-movement-of-cash.component';
import { ApplyDiscountComponent } from '../apply-discount/apply-discount.component';

//Pipes
import { DateFormatPipe } from '../../main/pipes/date-format.pipe';
import { RoundNumberPipe } from '../../main/pipes/round-number.pipe';
import { ArticleFields } from '../article-field/article-fields';
import { ArticleFieldType } from '../article-field/article-field';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { UseOfCFDIService } from 'app/components/use-of-CFDI.component.ts/use-of-CFDI.service';
import { UseOfCFDI } from 'app/components/use-of-CFDI.component.ts/use-of-CFDI';
import { RelationTypeService } from 'app/components/relation-type/relation-type.service';
import { RelationType } from 'app/components/relation-type/relation-type';
import { MovementOfCancellationComponent } from '../movement-of-cancellation/movement-of-cancellation.component';
import { MovementOfCancellationService } from 'app/components/movement-of-cancellation/movement-of-cancellation.service';
import { CancellationTypeService } from 'app/components/cancellation-type/cancellation-type.service';
import { CurrencyService } from 'app/components/currency/currency.service';
import { Currency } from 'app/components/currency/currency';
import { CancellationType } from 'app/components/cancellation-type/cancellation-type';
import { ImportComponent } from '../import/import.component';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { ClaimService } from 'app/layout/claim/claim.service';
import { Claim, ClaimPriority, ClaimType } from 'app/layout/claim/claim';
import { TransportService } from 'app/components/transport/transport.service';
import { Transport } from 'app/components/transport/transport';
import { SelectTransportComponent } from '../transport/select-transport/select-transport.component';
import { ConfigService } from 'app/components/config/config.service';
import { ListArticlesPosComponent } from '../article/list-articles-pos/list-articles-pos.component';
import { PriceList } from 'app/components/price-list/price-list';
import { PriceListService } from 'app/components/price-list/price-list.service';
import { PrintTransactionTypeComponent } from '../print/print-transaction-type/print-transaction-type.component';
import { ArticleService } from 'app/components/article/article.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'app/components/user/user';
import { CancellationTypeAutomaticComponent } from '../cancellation-type/cancellation-types-automatic/cancellation-types-automatic.component';
import { StructureService } from 'app/components/structure/structure.service';
import { JsonDiffPipe } from 'app/main/pipes/json-diff';
import { SelectTableComponent } from 'app/components/table/select-table/select-table.component';
import { SendEmailComponent } from '../send-email/send-email.component';
import { AddArticleComponent } from '../article/article/add-article.component';
import { SelectShipmentMethodComponent } from '../shipment-method/select-shipment-method/select-shipment-method.component';
import { SelectCompanyComponent } from '../company/select-company/select-company.component';
import { TaxBase, TaxClassification } from '../tax/tax';
import { TaxService } from '../tax/tax.service';
import { ListCategoriesPosComponent } from '../category/list-categories-pos/list-categories-pos.component';
import { TranslateMePipe } from 'app/main/pipes/translate-me';

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.scss'],
  providers: [NgbAlertConfig, DateFormatPipe, RoundNumberPipe, TranslateMePipe],
  encapsulation: ViewEncapsulation.None
})

export class AddSaleOrderComponent {

  public transaction: Transaction;
  public transactionId: string;
  public transactionMovement: string;
  public alertMessage: string = '';
  public display = true;
  public movementsOfArticles: MovementOfArticle[];
  public movementsOfCashes: MovementOfCash[];
  public usesOfCFDI: UseOfCFDI[];
  public relationTypes: RelationType[];
  public printers: Printer[];
  public currencies: Currency[];
  public cancellationTypes: CancellationType[];
  public showButtonCancelation: boolean;
  public printerSelected: Printer;
  public printersAux: Printer[];  //Variable utilizada para guardar las impresoras de una operación determinada (Cocina, mostrador, Bar)
  public userType: string;
  public posType: string;
  public loading: boolean;
  public isCharge: boolean;
  @ViewChild('contentPrinters', { static: true }) contentPrinters: ElementRef;
  @ViewChild('contentMessage', { static: true }) contentMessage: ElementRef;
  @ViewChild('contentChangeDate', { static: true }) contentChangeDate: ElementRef;
  @ViewChild('contentChangeObservation', { static: true }) contentChangeObservation: ElementRef;
  @ViewChild('contentChangeQuotation', { static: true }) contentChangeQuotation: ElementRef;
  @ViewChild('containerMovementsOfArticles', { static: true }) containerMovementsOfArticles: ElementRef;
  @ViewChild('containerTaxes', { static: true }) containerTaxes: ElementRef;
  public paymentAmount: number = 0.00;
  public typeOfOperationToPrint: string;
  public kitchenArticlesToPrint: MovementOfArticle[];
  public kitchenArticlesPrinted: number = 0;
  public barArticlesToPrint: MovementOfArticle[];
  public barArticlesPrinted: number = 0;
  public voucherArticlesToPrint: MovementOfArticle[];
  public voucherArticlesPrinted: number = 0;
  public printSelected: Print;
  public filterArticle: string = '';
  public focusEvent = new EventEmitter<boolean>();
  public roundNumber = new RoundNumberPipe();
  public areMovementsOfArticlesEmpty: boolean = true;
  public apiURL = Config.apiURL;
  public userCountry: string = 'AR';
  public lastQuotation: number = 1;
  @ViewChild(ListArticlesPosComponent, { static: false }) listArticlesComponent: ListArticlesPosComponent;
  @ViewChild(ListCategoriesPosComponent, { static: false }) listCategoriesComponent: ListCategoriesPosComponent;
  public categorySelected: Category;
  public totalTaxesAmount: number = 0;
  public totalTaxesBase: number = 0;
  public filtersTaxClassification: TaxClassification[];
  public fastPayment: PaymentMethod
  public transports: Transport[];
  public config: Config;
  public database: string;
  public lastMovementOfArticle: MovementOfArticle;
  public isCancellationAutomatic: boolean = false;
  public priceList: PriceList;
  public newPriceList: PriceList;
  public increasePrice = 0;
  public lastIncreasePrice = 0;
  public companyOld: boolean = false;
  public quantity = 0;

  constructor(
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    private _transactionService: TransactionService,
    private _movementOfArticleService: MovementOfArticleService,
    private _articleStockService: ArticleStockService,
    private _tableService: TableService,
    private _articleService: ArticleService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: NgbModal,
    private _printerService: PrinterService,
    private _userService: UserService,
    private _taxService: TaxService,
    private _useOfCFDIService: UseOfCFDIService,
    private _relationTypeService: RelationTypeService,
    private _movementOfCancellationService: MovementOfCancellationService,
    private _cancellationTypeService: CancellationTypeService,
    private _currencyService: CurrencyService,
    private _claimService: ClaimService,
    private _transportService: TransportService,
    private _priceListService: PriceListService,
    private _toastr: ToastrService,
    private _configService: ConfigService,
    private _structureService: StructureService,
    private _jsonDiffPipe: JsonDiffPipe,
    public translatePipe: TranslateMePipe
  ) {
    this.initVariables();
    this.processParams();
  }

  public initVariables(): void {
    this.transaction = new Transaction();
    this.transaction.type = new TransactionType();
    this.movementsOfArticles = new Array();
    this.printers = new Array();
    this.printersAux = new Array();
    this.barArticlesToPrint = new Array();
    this.kitchenArticlesToPrint = new Array();
    this.voucherArticlesToPrint = new Array();
    this.usesOfCFDI = new Array();
    this.relationTypes = new Array();
    this.currencies = new Array();
    this.cancellationTypes = new Array();
  }

  private processParams(): void {
    this._route.queryParams.subscribe(params => {
      this.transactionId = params['transactionId'];
      if (!this.transactionId) {
        this.backFinal();
      }
    });
  }

  async ngOnInit() {

    this.database = Config.database;

    await this._configService.getConfig.subscribe(
      config => {
        this.config = config;
        this.userCountry = this.config['country'];
        if (this.userCountry === 'MX') {
          this.getUsesOfCFDI().then(
            usesOfCFDI => {
              if (usesOfCFDI) {
                this.usesOfCFDI = usesOfCFDI;
              }
            }
          );
          this.getRelationTypes().then(
            relationTypes => {
              if (relationTypes) {
                this.relationTypes = relationTypes;
              }
            }
          );
        }
      }
    );

    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];
    this.posType = pathLocation[2];

    this.initComponent();
  }

  public async initComponent() {

    this.loading = true;

    if (this.transactionId) {
      await this.getTransaction().then(
        async transaction => {
          if (transaction) {
            this.transaction = transaction;

            if (!this.transaction.company && this.transaction.type.company) {
              this.transaction.company = this.transaction.type.company;
            }

            if (this.transaction &&
              this.transaction.company &&
              this.transaction.company.transport) {
              this.transaction.transport = this.transaction.company.transport
            }
            if (this.transaction.state === TransactionState.Closed ||
              this.transaction.state === TransactionState.Canceled) {
              if (this.posType === 'resto' && this.transaction.table) {
                this.transaction.table.employee = null;
                this.transaction.table.state = TableState.Available;
                await this.updateTable().then(table => {
                  if (table) {
                    this.transaction.table = table;
                    this.backFinal();
                  }
                });
              } else {
                this.backFinal();
              }
            } else {
              this.transactionMovement = '' + this.transaction.type.transactionMovement;
              this.filtersTaxClassification = [TaxClassification.Withholding, TaxClassification.Perception];
              this.lastQuotation = this.transaction.quotation;

              if (this.userCountry === 'MX' &&
                this.transaction.type.defectUseOfCFDI &&
                !this.transaction.useOfCFDI) {
                this.transaction.useOfCFDI = this.transaction.type.defectUseOfCFDI;
              }

              this.getCancellationTypes().then(
                cancellationTypes => {
                  if (cancellationTypes) {
                    this.cancellationTypes = cancellationTypes;
                    this.showButtonCancelation = true;
                  } else {
                    this.showButtonCancelation = false;
                  }
                }
              );
              this.getTransports();
              this.getMovementsOfTransaction();
            }
          }
        }
      );
    }

    this.loading = false;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
        this.focusEvent.emit(true);
      }
    }, 1000);
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

  public getCancellationTypes(): Promise<CancellationType[]> {

    return new Promise<CancellationType[]>((resolve, reject) => {

      this._cancellationTypeService.getCancellationTypes(
        { "destination._id": 1, "operationType": 1 }, // PROJECT
        { "destination._id": { $oid: this.transaction.type._id }, "operationType": { "$ne": "D" } }, // MATCH
        { order: 1 }, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(result => {
        if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
          resolve(result.cancellationTypes);
        } else {
          resolve(null);
        }
      },
        error => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        });
    });
  }

  public getUsesOfCFDI(): Promise<UseOfCFDI[]> {

    return new Promise<UseOfCFDI[]>((resolve, reject) => {

      this.loading = true;

      this._useOfCFDIService.getUsesOfCFDI().subscribe(
        result => {
          this.loading = false;
          if (!result.usesOfCFDI) {
            resolve(null);
          } else {
            resolve(result.usesOfCFDI);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async changeUseOfCFDI(useOfCFDI) {
    this.transaction.useOfCFDI = useOfCFDI;
    await this.updateTransaction().then(
      async transaction => {
        if (transaction) {
          this.transaction = transaction;
          this.lastQuotation = this.transaction.quotation;
        }
      }
    );
  }

  async changeTransport(transport) {
    if (transport) {
      this.transaction.transport = transport;
    } else {
      this.transaction.transport = null;
    }
    await this.updateTransaction().then(
      async transaction => {
        if (transaction) {
          this.transaction = transaction;
          this.lastQuotation = this.transaction.quotation;
        }
      }
    );
  }

  public getRelationTypes(): Promise<RelationType[]> {

    return new Promise<RelationType[]>((resolve, reject) => {

      this.loading = true;
      let query = 'sort="description":1';

      this._relationTypeService.getRelationTypes(query).subscribe(
        result => {
          this.loading = false;
          if (!result.relationTypes) {
            resolve(null);
          } else {
            resolve(result.relationTypes);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this.loading = true;

      this._transactionService.getTransaction(this.transactionId).subscribe(
        async result => {
          this.loading = false;
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public updateTransaction(): Promise<Transaction> {

    return new Promise<Transaction>((resolve, reject) => {

      this.loading = true;

      this.transaction.exempt = this.roundNumber.transform(this.transaction.exempt);
      this.transaction.discountAmount = this.roundNumber.transform(this.transaction.discountAmount, 6);
      this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);

      this._transactionService.updateTransaction(this.transaction).subscribe(
        result => {
          this.loading = false;
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Promise<MovementOfCancellation[]> {

    for (let mov of movementsOfCancellations) {
      let transOrigin = new Transaction();
      transOrigin._id = mov.transactionOrigin._id;
      let transDestino = new Transaction();
      transDestino._id = mov.transactionDestination._id;
      mov.transactionOrigin = transOrigin;
      mov.transactionDestination = transDestino;
    }

    return new Promise<MovementOfCancellation[]>((resolve, reject) => {

      this.loading = true;

      this._movementOfCancellationService.saveMovementsOfCancellations(movementsOfCancellations).subscribe(
        async result => {
          this.loading = false;
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public daleteMovementsOfCancellations(query: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

      this.loading = true;

      this._movementOfCancellationService.deleteMovementsOfCancellations(query).subscribe(
        async result => {
          this.loading = false;
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async changeCurrency(currency: Currency) {
    this.transaction.currency = currency;
    if (this.config['currency'] && this.transaction.currency._id !== this.config['currency']._id) {
      for (let currency of this.currencies) {
        if (currency._id !== this.config['currency']._id) {
          this.transaction.quotation = currency.quotation;
        }
      }
    } else {
      if (!this.transaction.quotation) {
        this.transaction.quotation = currency.quotation;
      }
    }
    await this.updateTransaction().then(
      async transaction => {
        if (transaction) {
          this.transaction = transaction;
          this.lastQuotation = this.transaction.quotation;
        } else {
          this.hideMessage();
          this.getMovementsOfTransaction();
        }
      }
    );
  }

  public updateTable(): Promise<Table> {

    return new Promise<Table>((resolve, reject) => {

      this.loading = true;

      this._tableService.updateTable(this.transaction.table).subscribe(
        result => {
          this.loading = false;
          if (!result.table) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.table);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          reject(null);
        }
      );
    });
  }

  public getMovementsOfTransaction(): void {

    this.hideMessage();

    this.loading = true;

    let query = 'where="transaction":"' + this.transaction._id + '"';

    this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
      result => {
        if (!result.movementsOfArticles) {
          this.areMovementsOfArticlesEmpty = true;
          this.movementsOfArticles = new Array();
          this.lastMovementOfArticle = null;
          this.updatePrices();
        } else {
          this.areMovementsOfArticlesEmpty = false;
          this.movementsOfArticles = result.movementsOfArticles;
          this.lastMovementOfArticle = this.movementsOfArticles[this.movementsOfArticles.length - 1];
          this.containerMovementsOfArticles.nativeElement.scrollTop = this.containerMovementsOfArticles.nativeElement.scrollHeight;
          this.updateQuantity();
          this.updatePrices();
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public updateQuantity(): void {
    this.quantity = 0;
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (!movementOfArticle.movementParent) {
          this.quantity += movementOfArticle.amount;
        }
      }
    }
  }

  async addItem(event) {

    if (event && event['parent']) {
      var itemData: MovementOfArticle = event['parent'];
      var child: MovementOfArticle[] = event['child']

      this.showCategories();

      if (itemData && itemData.article && itemData.article._id) {

        if (!itemData.article.containsVariants && !itemData.article.allowMeasure && !await this.getStructure(itemData.article._id)) {

          let movementOfArticle: MovementOfArticle;

          if (!itemData.article.isWeigth || this.transaction.type.stockMovement == StockMovement.Inventory) {
            if (this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
              if (this.lastMovementOfArticle) {
                let query = `where="_id":"${this.lastMovementOfArticle._id}"`;
                await this.getMovementsOfArticles(query).then(
                  movementsOfArticles => {
                    if (movementsOfArticles && movementsOfArticles.length > 0) {
                      movementOfArticle = movementsOfArticles[0];
                    }
                  }
                );
              }
            } else if (this.transaction.type.stockMovement == StockMovement.Inventory) {
              let query = `where="transaction":"${this.transactionId}","operationType":{"$ne":"D"},"article":"${itemData.article._id}"`;
              await this.getMovementsOfArticles(query).then(
                movementsOfArticles => {
                  if (movementsOfArticles && movementsOfArticles.length > 0) {
                    movementOfArticle = movementsOfArticles[0];
                  }
                }
              );
            }
          }
          if (!movementOfArticle) {
            movementOfArticle = itemData;
            movementOfArticle._id = '';
            movementOfArticle.transaction = this.transaction;
            movementOfArticle.modifyStock = this.transaction.type.modifyStock;
            if (this.transaction.type.stockMovement) {
              movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
            }
            movementOfArticle.printed = 0;
            if (child && child.length === 0) {
              if (await this.isValidMovementOfArticle(movementOfArticle)) {
                await this.saveMovementOfArticle(movementOfArticle).then(
                  movementOfArticle => {
                    if (movementOfArticle) {
                      this.getMovementsOfTransaction();
                    }
                  }
                );
              }
            } else {

              var movsArticle: MovementOfArticle[] = new Array();

              for (const movArticle of child) {
                var stock: boolean = await this.getUtilization(movementOfArticle.article._id, movArticle.article._id)
                if (await this.isValidMovementOfArticle(movArticle, stock)) {
                  movsArticle.push(movArticle)
                }
              }
              if (movsArticle.length === child.length) {
                await this.saveMovementOfArticle(movementOfArticle).then(
                  async movementOfArticle => {
                    if (movementOfArticle) {
                      movsArticle = new Array();
                      for (const movArticle of child) {
                        movArticle.movementParent = movementOfArticle
                        movsArticle.push(movArticle)
                      }
                      await this.saveMovementsOfArticles(movsArticle).then(
                        result => {
                          if (result) {
                            this.getMovementsOfTransaction();
                          } else {
                            this.showMessage("No se pudo crear la estructura de producto", 'info', false);
                          }
                        });
                    }
                  });
              }
            }
          } else {
            if (this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
              movementOfArticle.amount = itemData.amount;
              this.filterArticle = '';
            } else {
              movementOfArticle.amount += 1;
            }
            if (await this.isValidMovementOfArticle(movementOfArticle)) {
              if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
                await this.updateMovementOfArticle(await this.recalculateSalePrice(movementOfArticle)).then(
                  movementOfArticle => {
                    if (movementOfArticle) {
                      this.getMovementsOfTransaction();
                    }
                  }
                );
              } else {
                await this.updateMovementOfArticle(this.recalculateCostPrice(movementOfArticle)).then(
                  movementOfArticle => {
                    if (movementOfArticle) {
                      this.getMovementsOfTransaction();
                    }
                  }
                );
              }
            } else {
              movementOfArticle.amount -= 1;
            }
          }
        } else {
          let movementOfArticle: MovementOfArticle;
          movementOfArticle = itemData;
          movementOfArticle._id = '';
          movementOfArticle.transaction = this.transaction;
          movementOfArticle.modifyStock = this.transaction.type.modifyStock;
          if (this.transaction.type.stockMovement) {
            movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
          }
          movementOfArticle.printed = 0;
          movementOfArticle.amount = 1;
          this.openModal("movement_of_article", movementOfArticle);
        }
      } else {
        this.showToast(null, 'danger', 'Error al agregar el artículo, por favor inténtelo de nuevo.');
      }
    } else {
      this.showArticles();
    }
  }

  private getStructure(articleId: string): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
      this.loading = true;

      let match = `{
			"operationType": { "$ne": "D" },
			"parent._id": { "$oid" : "${articleId}"},
			"optional" : true,
			"child.operationType": { "$ne": "D" }
		  }`;

      match = JSON.parse(match);

      let project = {
        "_id": 1,
        "parent._id": 1,
        "parent.description": 1,
        "child._id": 1,
        "child.description": 1,
        "child.operationType": 1,
        "optional": 1,
        "utilization": 1,
        operationType: 1
      }

      let group = {
        _id: null,
        count: { $sum: 1 },
        structures: { $push: "$$ROOT" }
      };

      this._structureService.getStructures(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(
        result => {
          this.loading = false;
          if (result && result[0] && result[0].structures) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
          resolve(false);
        }
      );
    })
  }

  private getUtilization(parent: string, child: string): Promise<boolean> {

    return new Promise<boolean>((resolve, reject) => {
      this.loading = true;

      let match = `{
			"operationType": { "$ne": "D" },
			"parent._id": { "$oid" : "${parent}"},
			"child._id" : { "$oid" : "${child}"},
			"child.operationType": { "$ne": "D" },
			"utilization" : "Venta"
		  }`;

      match = JSON.parse(match);

      let project = {
        "_id": 1,
        "parent._id": 1,
        "parent.description": 1,
        "child._id": 1,
        "child.description": 1,
        "child.operationType": 1,
        "optional": 1,
        "utilization": 1,
        operationType: 1
      }

      let group = {
        _id: null,
        count: { $sum: 1 },
        structures: { $push: "$$ROOT" }
      };

      this._structureService.getStructures(
        project, // PROJECT
        match, // MATCH
        {}, // SORT
        group, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(
        result => {
          this.loading = false;
          if (result && result[0] && result[0].structures) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
          resolve(false);
        }
      );
    })
  }


  public getMovementsOfArticles(query?: string): Promise<MovementOfArticle[]> {

    return new Promise<MovementOfArticle[]>((resolve, reject) => {

      this.loading = true;

      this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
        result => {
          this.loading = false;
          if (!result.movementsOfArticles) {
            resolve(null);
          } else {
            resolve(result.movementsOfArticles);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public saveMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>((resolve, reject) => {

      this.loading = true;

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice);
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice);

      this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(
        result => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            this.hideMessage();
            movementOfArticle = result.movementOfArticle;
            resolve(movementOfArticle);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  private saveMovementsOfArticles(movementsOfArticles: MovementOfArticle[]): Promise<boolean> {

    return new Promise<boolean>(async (resolve, reject) => {

      this.loading = true;

      var movsArticles: MovementOfArticle[] = new Array();

      for (const movArticle of movementsOfArticles) {

        movArticle.basePrice = 0;
        movArticle.costPrice = 0;
        movArticle.salePrice = 0;
        movArticle.unitPrice = 0;
        movArticle.status = MovementOfArticleStatus.Ready;

        if (await this.recalculateSalePrice(movArticle)) {
          movsArticles.push(movArticle)
        } else {
          resolve(false)
        }

      }

      this._movementOfArticleService.saveMovementsOfArticles(movsArticles).subscribe(
        result => {
          this.loading = false;
          if (!result.movementsOfArticles) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(false);
          } else {
            this.hideMessage();
            resolve(true);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(false);
        }
      );
    });
  }

  async isValidMovementOfArticle(movementOfArticle: MovementOfArticle, verificaStock: boolean = true): Promise<boolean> {

    return new Promise<boolean>(async (resolve, reject) => {

      this.loading = true;

      let isValid = true;

      if (this.transaction.type &&
        this.transaction.type.transactionMovement === TransactionMovement.Sale &&
        movementOfArticle.article &&
        !movementOfArticle.article.allowSale) {
        isValid = false;
        this.showMessage("El producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + ") no esta habilitado para la venta", 'info', true);
      }

      if (this.transaction.type &&
        this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
        movementOfArticle.article &&
        !movementOfArticle.article.allowPurchase) {
        isValid = false;
        this.showMessage("El producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + ") no esta habilitado para la compra", 'info', true);
      }

      if (verificaStock &&
        movementOfArticle.article &&
        this.config['modules'].stock &&
        this.transaction.type &&
        this.transaction.type.modifyStock &&
        (this.transaction.type.stockMovement === StockMovement.Outflows || this.transaction.type.stockMovement === StockMovement.Transfer) &&
        !movementOfArticle.article.allowSaleWithoutStock) {
        await this.getArticleStock(movementOfArticle).then(
          articleStock => {
            if (!articleStock || (movementOfArticle.amount + movementOfArticle.quantityForStock) > articleStock.realStock) {
              if (this.transaction.type.stockMovement === StockMovement.Transfer && movementOfArticle.deposit && movementOfArticle.deposit._id.toString() === this.transaction.depositDestination._id.toString()) {
              } else {
                isValid = false;
                let realStock = 0;
                if (articleStock) {
                  realStock = articleStock.realStock;
                }
                this.showMessage("No tiene el stock suficiente del producto " + movementOfArticle.article.description + " (" + movementOfArticle.article.code + "). Stock Actual: " + realStock, 'info', true);
              }
            }
          }
        );
      }
      this.loading = false;
      resolve(isValid);
    });
  }

  public getArticleStock(movementOfArticle: MovementOfArticle): Promise<ArticleStock> {

    return new Promise<ArticleStock>((resolve, reject) => {

      this.loading = true;

      let depositID;
      let query;

      if (movementOfArticle.article.deposits && movementOfArticle.article.deposits.length > 0) {
        movementOfArticle.article.deposits.forEach(element => {
          if (element.deposit.branch._id === this.transaction.branchOrigin._id) {
            depositID = element.deposit._id;
          }
        });
      }

      if (depositID) {
        query = `where= "article": "${movementOfArticle.article._id}",
                        "branch": "${this.transaction.branchOrigin._id}",
                        "deposit": "${depositID}"`;
      } else {
        query = `where= "article": "${movementOfArticle.article._id}",
                        "branch": "${this.transaction.branchOrigin._id}",
                        "deposit": "${this.transaction.depositOrigin._id}"`;
      }

      this._articleStockService.getArticleStocks(query).subscribe(
        result => {
          this.loading = false;
          if (!result.articleStocks || result.articleStocks.length <= 0) {
            resolve(null);
          } else {
            resolve(result.articleStocks[0]);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {

    let quotation = 1;

    if (this.transaction.quotation) {
      quotation = this.transaction.quotation;
    }

    movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);

    if (movementOfArticle.article &&
      movementOfArticle.article.currency &&
      this.config['currency'] &&
      this.config['currency']._id !== movementOfArticle.article.currency._id) {
      movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice / this.lastQuotation) * quotation);
    }

    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * this.transaction.discountPercent / 100), 6);
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
            taxedAmount += field.amount;
          } else {
            movementOfArticle.costPrice += field.amount;
          }
        }
        fields.push(field);
      }
    }
    movementOfArticle.otherFields = fields;
    if (this.transaction.type.requestTaxes) {
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
    movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
    movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.costPrice + movementOfArticle.roundingAmount);
    return movementOfArticle;
  }

  public recalculateSalePrice(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>(async (resolve, reject) => {

      this.loading = true;

      let quotation = 1;

      if (this.transaction.quotation) {
        quotation = this.transaction.quotation;
      }

      if (movementOfArticle.article) {

        movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.article.basePrice * movementOfArticle.amount);

        if (movementOfArticle.article.currency &&
          this.config['currency'] &&
          this.config['currency']._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
        }
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

      if (movementOfArticle.article) {
        movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.article.costPrice * movementOfArticle.amount);
        if (movementOfArticle.article.currency &&
          this.config['currency'] &&
          this.config['currency']._id !== movementOfArticle.article.currency._id) {
          movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
        }
      }

      movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount);
      if (movementOfArticle.article &&
        movementOfArticle.article.currency &&
        this.config['currency'] &&
        this.config['currency']._id !== movementOfArticle.article.currency._id) {
        movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice / this.lastQuotation) * quotation);
      }

      if (movementOfArticle.article && this.priceList) {
        let increasePrice = 0;
        if (this.priceList.allowSpecialRules && this.priceList.rules && this.priceList.rules.length > 0) {
          this.priceList.rules.forEach(rule => {
            if (rule) {
              if (rule.category && movementOfArticle.category && rule.make && movementOfArticle.make && rule.category._id === movementOfArticle.category._id && rule.make._id === movementOfArticle.make._id) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.priceList.percentage);
              }
              if (rule.make && movementOfArticle.make && rule.category == null && rule.make._id === movementOfArticle.make._id) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.priceList.percentage);
              }
              if (rule.category && movementOfArticle.category && rule.make == null && rule.category._id === movementOfArticle.category._id) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.priceList.percentage);
              }
            }
          });
          if (increasePrice === 0) {
            increasePrice = this.roundNumber.transform(this.priceList.percentage);
          }
        } else {
          increasePrice = this.roundNumber.transform(this.priceList.percentage);
        }

        if (this.priceList.exceptions && this.priceList.exceptions.length > 0) {
          this.priceList.exceptions.forEach(exception => {
            if (exception) {
              if (exception.article._id === movementOfArticle.article._id) {
                increasePrice = this.roundNumber.transform(exception.percentage);
              }
            }
          })
        }

        if (increasePrice != 0) {
          movementOfArticle.unitPrice = this.roundNumber.transform((movementOfArticle.unitPrice * 100) / (100 + increasePrice));
        }
      }

      if (movementOfArticle.article && this.newPriceList) {
        let increasePrice = 0;
        if (this.newPriceList.allowSpecialRules && this.newPriceList.rules && this.newPriceList.rules.length > 0) {
          this.newPriceList.rules.forEach(rule => {
            if (rule) {
              if (rule.category && movementOfArticle.category && rule.make && movementOfArticle.make && rule.category._id === movementOfArticle.category._id && rule.make._id === movementOfArticle.make._id) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.newPriceList.percentage);
              }
              if (rule.make && movementOfArticle.make && rule.category == null && rule.make._id === movementOfArticle.make._id) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.newPriceList.percentage);
              }
              if (rule.category && movementOfArticle.category && rule.make == null && rule.category._id === movementOfArticle.category._id) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.newPriceList.percentage);
              }
            }
          });
          if (increasePrice === 0) {
            increasePrice = this.roundNumber.transform(this.newPriceList.percentage);
          }
        } else {
          increasePrice = this.roundNumber.transform(this.newPriceList.percentage);
        }

        if (this.newPriceList.exceptions && this.newPriceList.exceptions.length > 0) {
          this.newPriceList.exceptions.forEach(exception => {
            if (exception) {
              if (exception.article._id === movementOfArticle.article._id) {
                increasePrice = this.roundNumber.transform(exception.percentage);
              }
            }
          })
        }

        if (increasePrice != 0) {
          movementOfArticle.unitPrice = this.roundNumber.transform(movementOfArticle.unitPrice + (movementOfArticle.unitPrice * increasePrice / 100));
        }
      }

      movementOfArticle.transactionDiscountAmount = this.roundNumber.transform((movementOfArticle.unitPrice * this.transaction.discountPercent / 100), 6);
      movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.transactionDiscountAmount);
      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
      movementOfArticle.markupPrice = this.roundNumber.transform(movementOfArticle.salePrice - movementOfArticle.costPrice);
      movementOfArticle.markupPercentage = this.roundNumber.transform((movementOfArticle.markupPrice / movementOfArticle.costPrice * 100), 3);

      if (this.transaction.type.requestTaxes) {
        let taxes: Taxes[] = new Array();
        if (movementOfArticle.taxes) {
          let impInt: number = 0;
          if (movementOfArticle.article) {
            for (let taxAux of movementOfArticle.article.taxes) {
              if (taxAux.percentage === 0) {
                impInt = this.roundNumber.transform(taxAux.taxAmount * movementOfArticle.amount, 4);
              }
            }
          }
          for (let taxAux of movementOfArticle.taxes) {
            let tax: Taxes = new Taxes();
            tax.tax = taxAux.tax;
            tax.percentage = this.roundNumber.transform(taxAux.percentage);
            if (tax.tax.taxBase == TaxBase.Neto) {
              tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice - impInt) / ((tax.percentage / 100) + 1), 4);
            }
            if (taxAux.percentage === 0) {
              for (let artTax of movementOfArticle.article.taxes) {
                if (artTax.tax._id === tax.tax._id) {
                  tax.taxAmount = this.roundNumber.transform((artTax.taxAmount * movementOfArticle.amount), 4);
                }
              }
            } else {
              tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100), 4);
            }
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;
      }
      this.loading = false;
      //guardamos la lista con la que se calculo el precio
      this.transaction.priceList = this.priceList

      resolve(movementOfArticle);
    });
  }

  public getMovementOfArticleByArticle(articleId: string): MovementOfArticle {

    let movementOfArticle: MovementOfArticle;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticleAux of this.movementsOfArticles) {
        if (movementOfArticleAux.article && movementOfArticleAux.article._id === articleId) {
          movementOfArticle = movementOfArticleAux;
        }
      }
    }

    return movementOfArticle;
  }

  public updateMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {

    return new Promise<MovementOfArticle>(async (resolve, reject) => {

      this.loading = true;

      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice);
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice);

      // LIMPIAR UN POCO LA RELACIÓN
      movementOfArticle.transaction = new Transaction();
      movementOfArticle.transaction._id = this.transaction._id;
      // FIN DE LIMPIADO

      this._movementOfArticleService.updateMovementOfArticle(movementOfArticle).subscribe(
        result => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            this.containerMovementsOfArticles.nativeElement.scrollTop = this.containerMovementsOfArticles.nativeElement.scrollHeight;
            resolve(result.movementOfArticle);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async addTransactionTaxes(taxes: Taxes[]) {
    this.transaction.taxes = taxes;
    this.updatePrices();
  }

  async updatePrices(discountPercent?: number) {

    this.loading = true;

    let totalPriceAux: number = 0;
    let discountAmountAux: number = 0;
    this.transaction.discountPercent = 0;

    if (discountPercent !== undefined) this.transaction.discountPercent = this.roundNumber.transform(discountPercent, 6);

    if (this.transaction.company && this.transaction.company.discount > 0) this.transaction.discountPercent += this.transaction.company.discount;
    if (this.transaction.company && this.transaction.company.group && this.transaction.company.group.discount > 0) this.transaction.discountPercent += this.transaction.company.group.discount;

    let isUpdateValid: boolean = true;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        // BORRAMOS TAXES ID PARA COMPARAR
        for (let taxes of movementOfArticle.taxes) {
          delete taxes._id;
        }
        let oldMovementOfArticle: {} = {};
        oldMovementOfArticle = Object.assign(oldMovementOfArticle, movementOfArticle);
        if (!movementOfArticle.movementParent) {
          this.transaction.discountPercent = this.roundNumber.transform(this.transaction.discountPercent, 6);
          if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
            movementOfArticle = await this.recalculateSalePrice(movementOfArticle);
          } else {
            movementOfArticle = this.recalculateCostPrice(movementOfArticle);
          }
          totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
          discountAmountAux += this.roundNumber.transform(movementOfArticle.transactionDiscountAmount * movementOfArticle.amount, 6);
          // COMPARAMOS JSON -- SI CAMBIO ACTUALIZAMOS
          if (this._jsonDiffPipe.transform(oldMovementOfArticle, movementOfArticle) ||
            (oldMovementOfArticle['taxes'] && oldMovementOfArticle['taxes'].length > 0 &&
              movementOfArticle['taxes'] && movementOfArticle['taxes'].length > 0 &&
              oldMovementOfArticle['taxes'][0].taxAmount !== movementOfArticle['taxes'][0].taxAmount)
          ) {
            let result = await this.updateMovementOfArticle(movementOfArticle);
            if (!result) {
              isUpdateValid = false;
              break;
            }

          }
        }
      }
    } else {
      isUpdateValid = true;
      totalPriceAux = 0;
      this.transaction.discountPercent = 0;
      discountAmountAux = 0;
    }

    this.priceList = null;
    this.newPriceList = null;

    if (isUpdateValid) {
      this.transaction.totalPrice = totalPriceAux;
      this.transaction.discountAmount = discountAmountAux;
      if (this.transaction.type.requestTaxes) {
        this.loading = false;
        await this.updateTaxes();
      } else {
        this.transaction.exempt = this.transaction.totalPrice;
        await this.updateTransaction().then(
          async transaction => {
            if (transaction) {
              this.loading = false;
              this.transaction = transaction;
              this.lastQuotation = this.transaction.quotation;
              if (this.isCancellationAutomatic) {
                this.openModal('charge');
              }
            } else {
              this.loading = false;
              this.hideMessage();
              this.getMovementsOfTransaction();
            }
          }
        );
      }
    } else {
      this.loading = false;
      this.getMovementsOfTransaction(); // EN CASO DE QUE DE ERROR DE ACTUALIZAR ALGÚN PRODUCTO.
    }
  }

  async updateTaxes() {

    this.loading = true;

    let oldTaxes: Taxes[] = this.transaction.taxes;
    let totalPriceAux = 0;

    let transactionTaxes: Taxes[] = new Array();
    let transactionTaxesAUX: Taxes[] = new Array();

    this.transaction.exempt = 0;
    this.transaction.basePrice = 0;
    if (this.movementsOfArticles) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (movementOfArticle.taxes && movementOfArticle.taxes.length !== 0) {
          let taxBaseTotal = 0;
          let taxAmountTotal = 0;
          for (let taxesAux of movementOfArticle.taxes) {
            let transactionTax: Taxes = new Taxes();
            transactionTax.percentage = this.roundNumber.transform(taxesAux.percentage);
            transactionTax.tax = taxesAux.tax;
            transactionTax.taxBase = this.roundNumber.transform(taxesAux.taxBase, 4);
            transactionTax.taxAmount = this.roundNumber.transform(taxesAux.taxAmount, 4);
            transactionTaxesAUX.push(transactionTax);
            this.transaction.basePrice += this.roundNumber.transform(transactionTax.taxBase);
            taxBaseTotal += this.roundNumber.transform(transactionTax.taxBase);
            taxAmountTotal += this.roundNumber.transform(transactionTax.taxAmount);
          }
          if (taxBaseTotal === 0) {
            this.transaction.exempt += this.roundNumber.transform(movementOfArticle.salePrice - taxAmountTotal);
          }
        } else {
          this.transaction.exempt += this.roundNumber.transform(movementOfArticle.salePrice);
        }
        totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
      }
    }

    this.transaction.basePrice = this.roundNumber.transform(this.transaction.basePrice);

    if (transactionTaxesAUX) {
      for (let transactionTaxAux of transactionTaxesAUX) {
        let exists: boolean = false;
        for (let transactionTax of transactionTaxes) {
          if (transactionTaxAux.tax._id.toString() === transactionTax.tax._id.toString()) {
            transactionTax.taxAmount += this.roundNumber.transform(transactionTaxAux.taxAmount, 4);
            transactionTax.taxBase += this.roundNumber.transform(transactionTaxAux.taxBase, 4);
            exists = true;
          }
        }
        if (!exists) {
          transactionTaxes.push(transactionTaxAux);
        }
      }
    }

    this.totalTaxesAmount = 0;
    this.totalTaxesBase = 0;

    // REDONDEAMOS IMPUESTO
    for (let taxes of transactionTaxes) {
      taxes.taxBase = this.roundNumber.transform(taxes.taxBase);
      taxes.taxAmount = this.roundNumber.transform(taxes.taxAmount);
      this.totalTaxesAmount += taxes.taxAmount;
      this.totalTaxesBase += taxes.taxBase;
    }

    this.transaction.taxes = transactionTaxes;

    if (oldTaxes && oldTaxes.length > 0) {
      for (let oldTax of oldTaxes) {
        if (oldTax.tax.classification !== TaxClassification.Tax) {
          this.transaction.taxes.push(oldTax);
          this.totalTaxesAmount += this.roundNumber.transform(oldTax.taxAmount);
          // SUMAMOS AL TOTAL DE LA TRANSACCION LOS IMPUESTOS CARGADOS MANUALMENTE COMO PERCEPCIONES Y RETENCIONES
          totalPriceAux += oldTax.taxAmount;
        }
      }
    }
    this.totalTaxesAmount = this.roundNumber.transform(this.totalTaxesAmount);
    this.transaction.totalPrice = this.roundNumber.transform(totalPriceAux);

    await this.updateTransaction().then(
      async transaction => {
        if (transaction) {
          this.loading = false;
          this.transaction = transaction;
          this.lastQuotation = this.transaction.quotation;
          if (this.isCancellationAutomatic) {
            this.openModal('charge');
          }
        } else {
          this.loading = false;
          this.hideMessage();
          this.getMovementsOfTransaction();
        }
      }
    );
  }

  public validateElectronicTransactionAR(): void {

    this.showMessage("Validando comprobante con AFIP...", 'info', false);
    this.loading = true;
    this.transaction.type.defectEmailTemplate = null;
    this._transactionService.validateElectronicTransactionAR(this.transaction).subscribe(
      result => {
        let msn = '';
        if (result && result.status != 0) {
          if (result.status === 'err') {
            if (result.code && result.code !== '') {
              msn += result.code + " - ";
            }
            if (result.message && result.message !== '') {
              msn += result.message + ". ";
            }
            if (result.observationMessage && result.observationMessage !== '') {
              msn += result.observationMessage + ". ";
            }
            if (result.observationMessage2 && result.observationMessage2 !== '') {
              msn += result.observationMessage2 + ". ";
            }
            if (msn === '') {
              msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
            }
            this.showMessage(msn, 'info', true);
            let body = {
              transaction: {
                origin: this.transaction.origin,
                letter: this.transaction.letter,
                number: this.transaction.number,
                startDate: this.transaction.startDate,
                endDate: this.transaction.endDate,
                expirationDate: this.transaction.expirationDate,
                VATPeriod: this.transaction.VATPeriod,
                state: this.transaction.state,
                basePrice: this.transaction.basePrice,
                exempt: this.transaction.exempt,
                discountAmount: this.transaction.discountAmount,
                discountPercent: this.transaction.discountPercent,
                totalPrice: this.transaction.totalPrice,
                roundingAmount: this.transaction.roundingAmount,
                CAE: this.transaction.CAE,
                CAEExpirationDate: this.transaction.CAEExpirationDate,
                type: this.transaction.type,
                company: this.transaction.company,
                priceList: this.transaction.priceList
              },
              config: {
                companyIdentificationValue: this.config['companyIdentificationValue'],
                vatCondition: this.config['companyVatCondition'].code,
                database: this.config['database']
              }
            }
            this.saveClaim('ERROR FE AR ' + moment().format('DD/MM/YYYY HH:mm') + " : " + msn, JSON.stringify(body));
          } else if (result.message) {
            this.showMessage(result.message, 'info', true);
            this.saveClaim('ERROR FE AR ' + moment().format('DD/MM/YYYY HH:mm') + " : " + "ERROR AL CONECTAR ", result.message);
          } else {
            this.transaction.number = result.number;
            this.transaction.CAE = result.CAE;
            this.transaction.CAEExpirationDate = moment(result.CAEExpirationDate, 'DD/MM/YYYY HH:mm:ss').format("YYYY-MM-DDTHH:mm:ssZ");
            this.transaction.state = TransactionState.Closed;
            this.finish();
          }
        } else {
          if (msn === '') {
            msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
          }
          this.showMessage(msn, 'info', true);
        }
        this.loading = false;
      },
      error => {
        this.showMessage("Ha ocurrido un error en el servidor. Comuníquese con Soporte.", 'danger', false);
        this.loading = false;
      }
    )
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

  public validateElectronicTransactionMX(): void {

    this.showMessage("Validando comprobante con SAT...", 'info', false);

    this._transactionService.validateElectronicTransactionMX(this.transaction, this.movementsOfArticles, this.movementsOfCashes).subscribe(
      result => {
        if (result.status === 'err') {
          let msn = '';
          if (result.code && result.code !== '') {
            msn += "ERROR " + result.code + ": ";
          }
          if (result.message && result.message !== '') {
            msn += result.message + ". ";
          }
          if (msn === '') {
            msn = "Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.";
          }
          this.showMessage(msn, 'info', true);

          let body = {
            transaction: {
              origin: this.transaction.origin,
              letter: this.transaction.letter,
              number: this.transaction.number,
              startDate: this.transaction.startDate,
              endDate: this.transaction.endDate,
              expirationDate: this.transaction.expirationDate,
              VATPeriod: this.transaction.VATPeriod,
              state: this.transaction.state,
              basePrice: this.transaction.basePrice,
              exempt: this.transaction.exempt,
              discountAmount: this.transaction.discountAmount,
              discountPercent: this.transaction.discountPercent,
              totalPrice: this.transaction.totalPrice,
              roundingAmount: this.transaction.roundingAmount,
              CAE: this.transaction.CAE,
              CAEExpirationDate: this.transaction.CAEExpirationDate,
              type: this.transaction.type,
              company: this.transaction.company,
              priceList: this.transaction.priceList
            },
            config: {
              companyIdentificationValue: this.config['companyIdentificationValue'],
              vatCondition: this.config['companyVatCondition'].code,
              database: this.config['database']
            }
          }
          this.saveClaim('ERROR FE MX ' + moment().format('DD/MM/YYYY HH:mm') + " : " + msn, JSON.stringify(body));
        } else {
          this.transaction.state = TransactionState.Closed;
          this.transaction.stringSAT = result.stringSAT;
          this.transaction.CFDStamp = result.CFDStamp;
          this.transaction.SATStamp = result.SATStamp;
          this.transaction.endDate = result.endDate;
          this.transaction.UUID = result.UUID;
          this.finish();
        }
        this.loading = false;
      },
      error => {
        this.showMessage("Ha ocurrido un error en el servidor. Comuníquese con Soporte.", 'danger', false);
        this.loading = false;
      }
    )
  }

  async openModal(op: string, movementOfArticle?: MovementOfArticle, fastPayment?: PaymentMethod) {

    this.fastPayment = fastPayment;

    let modalRef;

    switch (op) {
      case 'current-account':
        if (this.transaction.company && this.transaction.company._id) {
          window.open(`/#/admin/cuentas-corrientes?companyId=${this.transaction.company._id}&companyType=${this.transaction.company.type}`, '_blank');
        }
        break;
      case 'add-article':
        this.display = false;
        modalRef = this._modalService.open(AddArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.operation = 'add';
        modalRef.result.then((result) => {
          if (result && result.article) {
            this.display = true;
            this.filterArticle = result.article.code
            this.focusEvent.emit(true);
          } else {
            this.display = true;
            this.getMovementsOfArticles();
          }
        }, (reason) => {
          this.display = true;
          this.getMovementsOfTransaction();
        });
        break;
      case 'list-cancellations':
        modalRef = this._modalService.open(MovementOfCancellationComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionDestinationId = this.transaction._id;
        modalRef.componentInstance.selectionView = true;
        modalRef.result.then(async (result) => {
          if (result && result.movementsOfCancellations && result.movementsOfCancellations.length > 0) {
            this.showButtonCancelation = false;
            await this.daleteMovementsOfCancellations('{"transactionDestination":"' + this.transaction._id + '"}').then(
              async movementsOfCancellations => {
                if (movementsOfCancellations) {
                  await this.saveMovementsOfCancellations(result.movementsOfCancellations).then(
                    movementsOfCancellations => {
                      if (movementsOfCancellations) {
                        this.focusEvent.emit(true);
                        this.getMovementsOfTransaction();
                      }
                    }
                  );
                }
              }
            );
          }
        }, (reason) => {
        });
        break;
      case 'movement_of_article':
        movementOfArticle.transaction = this.transaction;
        movementOfArticle.modifyStock = this.transaction.type.modifyStock;
        if (this.transaction.type.stockMovement) {
          movementOfArticle.stockMovement = this.transaction.type.stockMovement.toString();
        }
        modalRef = this._modalService.open(AddMovementOfArticleComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.movementOfArticle = movementOfArticle;
        modalRef.componentInstance.transaction = this.transaction;
        modalRef.result.then((result) => {
          this.focusEvent.emit(true);
          this.getMovementsOfTransaction();
        }, (reason) => {
          this.focusEvent.emit(true);
          this.getMovementsOfTransaction();
        });
        break;
      case 'apply_discount':
        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
          modalRef = this._modalService.open(ApplyDiscountComponent, { size: 'lg', backdrop: 'static' });
          modalRef.componentInstance.totalPrice = this.transaction.totalPrice;
          modalRef.componentInstance.amountToApply = this.transaction.discountAmount;
          modalRef.componentInstance.percentageToApply = this.transaction.discountPercent;
          modalRef.componentInstance.percentageToApplyCompany = (this.transaction.company && this.transaction.company.discount > 0) ? this.transaction.company.discount : 0;
          modalRef.componentInstance.percentageToApplyCompanyGroup = (this.transaction.company && this.transaction.company.group && this.transaction.company.group.discount > 0) ? this.transaction.company.group.discount : 0;
          modalRef.result.then((result) => {
            if (result.discount) {
              this.updatePrices(
                result.discount.percentageToApply
              );
            }
          }, (reason) => {
          });
        } else {
          this.showMessage("No se ingresaron productos a la transacción.", 'info', true);
        }
        break;
      case 'send-email':
        if (this.transaction.type.readLayout) {
          modalRef = this._modalService.open(PrintTransactionTypeComponent)
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.componentInstance.source = "mail";
        } else {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.company = this.transaction.company;
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.componentInstance.typePrint = 'invoice';
          modalRef.componentInstance.source = "mail";
        }
        if (this.transaction.type.defectPrinter) {
          modalRef.componentInstance.printer = this.transaction.type.defectPrinter;
        } else {
          if (this.printers && this.printers.length > 0) {
            for (let printer of this.printers) {
              if (printer.printIn === PrinterPrintIn.Counter) {
                modalRef.componentInstance.printer = printer;
              }
            }
          }
        }

        modalRef = this._modalService.open(SendEmailComponent, { size: 'lg', backdrop: 'static' });
        if (this.transaction.company && this.transaction.company.emails) {
          modalRef.componentInstance.emails = this.transaction.company.emails;
        }
        let labelPrint = this.transaction.type.name;
        if (this.transaction.type.labelPrint) {
          labelPrint = this.transaction.type.labelPrint;
        }
        modalRef.componentInstance.subject = `${labelPrint} ${this.padNumber(this.transaction.origin, 4)}-${this.transaction.letter}-${this.padNumber(this.transaction.number, 8)}`;
        if (this.transaction.type.electronics) {
          modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente` + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/invoice/${this.transaction._id}">Su comprobante</a>`
        } else {
          modalRef.componentInstance.body = `Estimado Cliente: Haciendo click en el siguiente link, podrá descargar el comprobante correspondiente ` + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/others/${this.transaction._id}">Su comprobante</a>`
        }

        if (Config.country === 'MX') {
          modalRef.componentInstance.body += ` y su XML correspondiente en http://${Config.database}.poscloud.com.ar:300/api/print/xml/CFDI-33_Factura_` + this.transaction.number;
        }

        if (this.transaction.type.defectEmailTemplate) {

          if (this.transaction.type.electronics) {
            modalRef.componentInstance.body = this.transaction.type.defectEmailTemplate.design + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/invoice/${this.transaction._id}">Su comprobante</a>`
          } else {
            modalRef.componentInstance.body = this.transaction.type.defectEmailTemplate.design + `<a href="http://${Config.database}.poscloud.com.ar:300/api/print/others/${this.transaction._id}">Su comprobante</a>`
          }

          if (Config.country === 'MX') {
            modalRef.componentInstance.body += ` y su XML correspondiente en http://${Config.database}.poscloud.com.ar:300/api/print/xml/CFDI-33_Factura_` + this.transaction.number;
          }
        }

        modalRef.result.then((result) => {
          this.backFinal();
        }, (reason) => {
          this.backFinal();
        });

        break;
      case 'cancel':
        modalRef = this._modalService.open(DeleteTransactionComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then(async (result) => {
          if (result === 'delete_close') {
            if (this.posType === 'resto' && this.transaction.table) {
              this.transaction.table.employee = null;
              this.transaction.table.state = TableState.Available;
              await this.updateTable().then(table => {
                if (table) {
                  this.transaction.table = table;
                  this.backFinal();
                }
              });
            } else {
              this.backFinal();
            }
          }
        }, (reason) => {

        });
        break;
      case 'add_client':

        modalRef = this._modalService.open(SelectCompanyComponent, { size: 'lg', backdrop: 'static' });
        if (this.transaction.type.transactionMovement === TransactionMovement.Purchase) {
          modalRef.componentInstance.type = CompanyType.Provider;
        } else if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          modalRef.componentInstance.type = CompanyType.Client;
        }
        modalRef.result.then(async (result) => {
          if (result.company) {

            if (this.transaction.type.requestTransport && result.company['transport']) {
              this.transaction.transport = result.company['transport'];
            }

            if (!this.transaction.company && result.company.priceList) {
              this.priceList = undefined
              this.newPriceList = await this.getPriceList(result.company.priceList._id);
            }

            if (this.transaction.company && this.transaction.company.priceList && result.company.priceList) {
              this.priceList = await this.getPriceList(this.transaction.company.priceList._id);
              this.newPriceList = await this.getPriceList(result.company.priceList._id)
            }

            if (this.transaction.company && !this.transaction.company.priceList && result.company.priceList) {
              this.priceList = undefined;
              this.newPriceList = await this.getPriceList(result.company.priceList._id);
            }

            if (result.company.priceList == null && this.transaction.company && this.transaction.company.priceList) {
              this.priceList = await this.getPriceList(this.transaction.company.priceList._id);
              this.newPriceList = undefined;
            }

            this.transaction.company = result.company;

            if (this.transaction.company.transport) {
              this.transaction.transport = this.transaction.company.transport;
            } else {
              this.transaction.transport = null;
            }

            this.updatePrices();
          }
        }, (reason) => {

        });
        break;
      case 'charge':

        this.typeOfOperationToPrint = "charge";

        if (await this.isValidCharge() &&
          await this.areValidMovementOfArticle()) {

          if (this.transaction.type.requestPaymentMethods ||
            fastPayment) {

            modalRef = this._modalService.open(AddMovementOfCashComponent, { size: 'lg', backdrop: 'static' });
            modalRef.componentInstance.transaction = this.transaction;
            if (fastPayment) {
              modalRef.componentInstance.fastPayment = fastPayment;
            }
            modalRef.result.then((result) => {
              this.movementsOfCashes = result.movementsOfCashes;

              if (this.movementsOfCashes) {


                if (result.movementOfArticle) {
                  this.movementsOfArticles.push(result.movementOfArticle);
                }

                if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
                  if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                    this.transaction.origin = this.transaction.type.fixedOrigin;
                  }

                  this.assignLetter();
                  if (this.transaction.type.electronics) {
                    if (this.config['country'] === 'MX') {
                      if (!this.transaction.CFDStamp &&
                        !this.transaction.SATStamp &&
                        !this.transaction.stringSAT) {
                        this.validateElectronicTransactionMX();
                      } else {
                        this.finish(); //SE FINALIZA POR ERROR EN LA FE
                      }
                    } else if (this.config['country'] === 'AR') {
                      if (!this.transaction.CAE) {
                        this.validateElectronicTransactionAR();
                      } else {
                        this.finish(); //SE FINALIZA POR ERROR EN LA FE
                      }
                    } else {
                      this.showMessage("Facturación electrónica no esta habilitada para tu país.", "info", true);
                    }
                  } else if (this.transaction.type.electronics && this.transaction.CAE) {
                    this.finish(); //SE FINALIZA POR ERROR EN LA FE
                  } else {
                    if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                      this.assignTransactionNumber();
                    } else {
                      this.finish();
                    }
                  }
                } else {
                  this.finish();
                }
              }
            }, (reason) => {
            });
          } else {
            if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.assignLetter();
              if (this.transaction.type.electronics && !this.transaction.CAE) {
                this.validateElectronicTransactionAR();
              } else if (this.transaction.type.electronics && this.transaction.CAE) {
                this.finish(); //SE FINALIZA POR ERROR EN LA FE
              } else {
                if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                  this.assignTransactionNumber();
                } else {
                  this.finish();
                }
              }
            } else {
              this.finish();
            }
          }
        }
        break;
      case 'cancelation-type-automatic':
        modalRef = this._modalService.open(CancellationTypeAutomaticComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then((result) => {
          if (result && result.transaction) {
            this.isCancellationAutomatic = true;
            this.initVariables();
            this.transactionId = result.transaction._id;
            this.initComponent();
          } else {
            if (this.transaction && this.transaction.type.printable) {
              this.print();
            } else if (this.transaction && this.transaction.type.requestEmailTemplate) {
              this.openModal('send-email');
            } else {
              this.backFinal();
            }
          }
        }, (reason) => {
          if (this.transaction && this.transaction.type.printable) {
            this.print();
          } else if (this.transaction && this.transaction.type.requestEmailTemplate) {
            this.openModal('send-email');
          } else {
            this.backFinal();
          }
        });
        break;
      case 'printers':

        await this.getPrinters().then(
          printers => {
            if (printers) {
              this.printers = printers;
            }
          }
        );

        if (this.countPrinters() > 1) {
          modalRef = this._modalService.open(this.contentPrinters, { size: 'lg', backdrop: 'static' }).result.then((result) => {
            if (result !== "cancel" && result !== '') {
              this.distributeImpressions(result);
            }
          }, (reason) => {

          });
        } else if (this.countPrinters() === 1) {
          this.distributeImpressions(this.printersAux[0]);
        } else {
          this.backFinal();
        }
        break;
      case 'errorMessage':
        modalRef = this._modalService.open(this.contentMessage, { size: 'lg', backdrop: 'static' }).result.then((result) => {
          if (result !== "cancel" && result !== '') {
            this.backFinal();
          }
        }, (reason) => {
        });
        break;
      case 'change-date':
        modalRef = this._modalService.open(this.contentChangeDate).result.then(async (result) => {
          if (result !== "cancel" && result !== '') {
            if (this.transaction.endDate && moment(this.transaction.endDate, 'YYYY-MM-DD').isValid()) {
              this.transaction.endDate = moment(this.transaction.endDate, 'YYYY-MM-DD').format('YYYY-MM-DDTHH:mm:ssZ');
              this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
              this.transaction.expirationDate = this.transaction.endDate;
              await this.updateTransaction().then(
                async transaction => {
                  if (transaction) {
                    this.transaction = transaction;
                    this.lastQuotation = this.transaction.quotation;
                  }
                }
              );
            }
          }
        }, (reason) => {
        });
        break;
      case 'observation':
        modalRef = this._modalService.open(this.contentChangeObservation).result.then(async (result) => {
          if (result !== "cancel" && result !== '') {
            if (this.transaction.observation) {
              await this.updateTransaction().then(
                async transaction => {
                  if (transaction) {
                    this.transaction = transaction;
                    this.lastQuotation = this.transaction.quotation;
                  }
                }
              );
            }
          }
        }, (reason) => {
        });
        break;
      case 'change-quotation':
        modalRef = this._modalService.open(this.contentChangeQuotation).result.then(async (result) => {
          if (result !== "cancel" && result !== '') {
            this.updatePrices();
          } else {
            this.transaction.quotation = this.lastQuotation;
          }
        }, (reason) => {
          this.transaction.quotation = this.lastQuotation;
        });
        break;
      case 'change-taxes':
        modalRef = this._modalService.open(this.containerTaxes, { size: 'lg', backdrop: 'static' }).result.then(async (result) => {
        }, (reason) => {
        });
        break;
      case 'change-employee':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.typeEmployee = this.transaction.type.requestEmployee;
        modalRef.componentInstance.op = "change-employee";
        modalRef.result.then(async (result) => {
          if (result) {
            if (result.employee) {
              this.transaction.employeeClosing = result.employee;
            }
            await this.updateTransaction().then(
              async transaction => {
                if (transaction) {
                  this.transaction = transaction;
                  if (this.transaction.table) {
                    this.transaction.table.employee = result.employee;
                    await this.updateTable().then(
                      table => {
                        if (table) {
                          this.transaction.table = table;
                        }
                      }
                    );
                  }
                }
              }
            );
          }
        }, (reason) => {

        });
        break;
      case 'print':
        if (this.transaction.type.expirationDate && moment(this.transaction.type.expirationDate).diff(moment(), 'days') <= 0) {
          this.showToast(null, "danger", "El documento esta vencido no se puede imprimir");
          this.backFinal();
        } else {
          if (this.transaction.type.readLayout) {
            modalRef = this._modalService.open(PrintTransactionTypeComponent)
            modalRef.componentInstance.transactionId = this.transaction._id
            modalRef.result.then((result) => {
            }, (reason) => {
              this.backFinal();
            });
          } else {
            modalRef = this._modalService.open(PrintComponent);
            modalRef.componentInstance.transactionId = this.transaction._id;
            modalRef.componentInstance.company = this.transaction.company;
            modalRef.componentInstance.printer = this.printerSelected;
            modalRef.componentInstance.typePrint = 'invoice';
            modalRef.result.then((result) => {
            }, (reason) => {
              this.backFinal();
            });
          }
        }
        break;
      case 'printKitchen':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.kitchenArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'kitchen';

        modalRef.result.then((result) => {
        }, (reason) => {
          this.updateMovementOfArticlePrintedKitchen();
        });
        break;
      case 'printBar':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.barArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'bar';

        modalRef.result.then((result) => {
        }, (reason) => {
          this.updateMovementOfArticlePrintedBar();
        });
        break;
      case 'printVoucher':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.voucherArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'voucher';

        modalRef.result.then((result) => {
        }, (reason) => {
          this.updateMovementOfArticlePrintedVoucher();
        });
        break;
      case 'import':
        modalRef = this._modalService.open(ImportComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.transaction = this.transaction._id;
        let model: any = new MovementOfArticle();
        model.model = "movement-of-article";
        model.relations = new Array();
        model.relations.push("article_relation_code");

        modalRef.componentInstance.model = model;
        modalRef.result.then((result) => {
          this.focusEvent.emit(true);
          this.getMovementsOfTransaction();
        }, (reason) => {
          this.focusEvent.emit(true);
          this.getMovementsOfTransaction();
        });
        break;
      case 'change-transport':
        modalRef = this._modalService.open(SelectTransportComponent);
        modalRef.result.then(async (result) => {
          if (result && result.transport) {
            this.transaction.transport = result.transport
            await this.updateTransaction().then(
              async transaction => {
                if (transaction) {
                  this.transaction = transaction;
                  this.lastQuotation = this.transaction.quotation;
                }
              }
            );
          }
        }, (reason) => {
        });
        break;
      case 'change-shipment-method':
        modalRef = this._modalService.open(SelectShipmentMethodComponent);
        modalRef.result.then(async (result) => {
          if (result && result.shipmentMethod) {
            this.transaction.shipmentMethod = result.shipmentMethod
            await this.updateTransaction().then(
              async transaction => {
                if (transaction) {
                  this.transaction = transaction;
                  this.lastQuotation = this.transaction.quotation;
                }
              }
            );
          }
        }, (reason) => {
        });
        break;
      case 'change-table':
        modalRef = this._modalService.open(SelectTableComponent);
        modalRef.componentInstance.roomId = this.transaction.table.room;
        modalRef.result.then(async (result) => {
          if (result && result.table) {
            result.table.employee = this.transaction.table.employee;
            result.table.lastTransaction = this.transaction._id;
            this.transaction.table.state = TableState.Available;
            this.transaction.table.employee = null;
            this.transaction.table.lastTransaction = null;
            await this.updateTable();
            this.transaction.table = result.table
            this.transaction.table.state = TableState.Busy;
            await this.updateTable();
            await this.updateTransaction().then(
              async transaction => {
                if (transaction) {
                  this.transaction = transaction;
                  this.lastQuotation = this.transaction.quotation;
                  this.transaction.table.state = TableState.Busy;
                }
              }
            );
          }
        }, (reason) => {
        });
        break;
      default: ;
    };
  }

  async updateArticlesCostPrice(): Promise<number> {

    return new Promise<number>(async (resolve, reject) => {

      let unitPrice: number = 0;
      let countArticle = 0;

      for (const element of this.movementsOfArticles) {
        if (element && element.article && element.article._id) {
          if (this.transaction.quotation > 1) {
            unitPrice = this.roundNumber.transform((element.basePrice / element.amount) / this.transaction.quotation);
          } else {
            unitPrice = this.roundNumber.transform(element.basePrice / element.amount);
          }

          unitPrice = this.roundNumber.transform(unitPrice + element.transactionDiscountAmount);

          if (unitPrice !== element.article.basePrice) {
            if (await this.updateArticleCostPrice(element.article, unitPrice)) {
              countArticle++;
            }
          }

        }
      }

      resolve(countArticle);
    })
  }

  async updateArticleCostPrice(article: Article, basePrice: number): Promise<boolean> {

    return new Promise<boolean>(async (resolve, reject) => {

      this.loading = true;

      if (basePrice && article) {
        let taxedAmount = 0;
        article.costPrice = 0;
        article.basePrice = basePrice;
        taxedAmount = basePrice;

        if (article.otherFields && article.otherFields.length > 0) {
          for (const field of article.otherFields) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((basePrice * parseFloat(field.value) / 100));
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
            if (field.articleField.modifyVAT) {
              taxedAmount += field.amount;
            } else {
              if (field.amount) {
                article.costPrice += field.amount;
              }
            }
          }
        }

        if (article.taxes && article.taxes.length > 0) {
          for (const articleTax of article.taxes) {
            if (articleTax.tax.percentage && articleTax.tax.percentage != 0) {
              articleTax.taxBase = this.roundNumber.transform(taxedAmount);
              articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage / 100));
            }
            article.costPrice += (articleTax.taxAmount);
          }
        }
        article.costPrice += taxedAmount;

        if (!(taxedAmount === 0 && article.salePrice !== 0)) {
          article.markupPrice = this.roundNumber.transform((article.costPrice * article.markupPercentage / 100));
          article.salePrice = article.costPrice + article.markupPrice;
        }

        this._articleService.updateArticle(article, null).subscribe(
          result => {
            this.loading = false;
            if (result && result.article) {
              resolve(true);
            }
          },
          error => {
            this.loading = false;
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        )
      } else {
        this.loading = false;
        resolve(false);
      }
    });
  }

  async isValidCharge(): Promise<boolean> {

    let isValid = true;

    if (this.movementsOfArticles && this.movementsOfArticles.length <= 0) {
      isValid = false;
      this.showMessage("No existen productos en la transacción.", 'info', true);
    } else {
      if (await !this.areValidMovementOfArticle()) {
        isValid = false;
      }
    }

    if (this.transaction.type.requestPaymentMethods &&
      this.fastPayment &&
      this.fastPayment.isCurrentAccount &&
      !this.transaction.company) {
      isValid = false;
      this.showMessage("Debe seleccionar una empresa para poder efectuarse un pago con el método " + this.fastPayment.name + ".", "info", true);
    }

    if (this.transaction.type.requestPaymentMethods &&
      this.fastPayment &&
      this.fastPayment.isCurrentAccount &&
      this.transaction.company &&
      !this.transaction.company.allowCurrentAccount) {
      isValid = false;
      this.showMessage("La empresa seleccionada no esta habilitada para cobrar con el método " + this.fastPayment.name + ".", "info", true);
    }

    if (isValid &&
      this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
      !this.transaction.company) {
      isValid = false;
      this.showMessage("Debe seleccionar un proveedor para la transacción.", 'info', true);
    }

    if (isValid &&
      this.transaction.type.electronics &&
      this.transaction.totalPrice >= 5000 &&
      !this.transaction.company &&
      this.config['country'] === 'AR') {
      isValid = false;
      this.showMessage("Debe indentificar al cliente para transacciones electrónicos con monto mayor a $5.000,00.", 'info', true);
    }

    if (isValid &&
      this.transaction.type.electronics &&
      this.transaction.company && (
        !this.transaction.company.identificationType ||
        !this.transaction.company.identificationValue ||
        this.transaction.company.identificationValue === '')
    ) {
      isValid = false;
      this.showMessage("El cliente ingresado no tiene número de identificación", 'info', true);
      this.loading = false;
    }

    if (isValid &&
      this.transaction.type.fixedOrigin &&
      this.transaction.type.fixedOrigin === 0 &&
      this.transaction.type.electronics &&
      this.config['country'] === 'MX') {
      isValid = false;
      this.showMessage("Debe configurar un punto de venta para transacciones electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción.", 'info', true);
      this.loading = false;
    }

    return isValid;
  }

  public getPrinters(): Promise<Printer[]> {

    return new Promise<Printer[]>(async (resolve, reject) => {

      this.loading = true;

      this._printerService.getPrinters().subscribe(
        result => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async areValidMovementOfArticle(): Promise<boolean> {

    return new Promise<boolean>(async (resolve, reject) => {

      this.loading = true;

      let areValid: boolean = true;

      for (let movementOfArticle of this.movementsOfArticles) {
        if (await this.isValidMovementOfArticle(movementOfArticle)) {
        } else {
          areValid = false;
        }
      }

      this.loading = false;
      resolve(areValid);
    });
  }

  async finish() {

    this.loading = true;

    let isValid: boolean = true;

    if (!this.movementsOfArticles || this.movementsOfArticles.length === 0) {
      isValid = false;
      this.showToast(null, "info", "No se encontraron productos en la transacción");
    }

    // ACTUALIZACIÓN DE PRECIOS DE COSTOS
    if (isValid && this.transaction.type.updatePrice) {
      let count = await this.updateArticlesCostPrice();
      if (count === 1) {
        this.showToast(null, "info", "Se actualizó : 1 producto");
      } else {
        if (count > 1) {
          this.showToast(null, "info", "Se actualizaron : " + await this.updateArticlesCostPrice() + " productos");
        }
      }
    }
    // FIN DE ACTUALIZACIÓN DE PRECIOS DE COSTOS
    // ACTUALIZACIÓN DE A PREPARAR SI APARECE EN COCINA LOS ARTICULOS
    if (isValid && this.transaction.type.posKitchen) {
      isValid = await this.changeArticlesStatusToPending();
    }
    // FIN DE ACTUALIZACIÓN DE A PREPARAR SI APARECE EN COCINA LOS ARTICULOS

    // ACTUALIZACIÓN DE STOCK
    if (isValid &&
      this.config['modules'].stock &&
      this.transaction.type.modifyStock) {
      this.loading = true;
      if (await this.areValidMovementOfArticle()) {
        isValid = await this.updateStockByTransaction();
      } else {
        isValid = false;
      }
      this.loading = false;
    }
    // FIN DE ACTUALIZACIÓN DE STOCK

    if (isValid) {

      await this.updateBalance().then(async balance => {
        if (balance !== null) {
          this.transaction.balance = balance;
          if (!this.transaction.endDate) {
            this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
          }
          if (this.transaction.type.transactionMovement !== TransactionMovement.Purchase || !this.transaction.VATPeriod) {
            this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
          }
          this.transaction.expirationDate = this.transaction.endDate;
          this.transaction.state = TransactionState.Closed;

          await this.updateTransaction().then(
            async transaction => {
              if (transaction) {
                this.transaction = transaction;

                if (this.transaction.table) {

                  if (this.transaction.type.finishCharge) {
                    this.transaction.table.employee = null;
                    this.transaction.table.state = TableState.Available;
                  } else {
                    this.transaction.table.state = TableState.Pending;
                  }
                  await this.updateTable().then(table => {
                    if (table) {
                      this.transaction.table = table;
                    }
                  });
                }

                let cancellationTypesAutomatic = await this.getCancellationTypesAutomatic();

                if (!cancellationTypesAutomatic || cancellationTypesAutomatic.length == 0) {
                  if (this.transaction && this.transaction.type.printable) {
                    this.print();
                  } else if (this.transaction && this.transaction.type.requestEmailTemplate) {
                    this.openModal('send-email');
                  } else {
                    this.backFinal();
                  }
                } else {
                  this.openModal('cancelation-type-automatic');
                }
              }
            }
          );
        }
      });
    }
    this.loading = false;
  }

  public getTransactionsV2(
    match: {},
    sort: {} = { endDate: -1 },
    group: {} = {},
    limit: number = 0
  ): Promise<Transaction[]> {

    return new Promise<Transaction[]>((resolve, reject) => {

      this.loading = true;

      let project = {
        type: 1,
        endDate: 1,
        orderNumber: 1,
        operationType: 1,
        state: 1,
      }

      this._transactionService.getTransactionsV2(
        project, // PROJECT
        match, // MATCH
        sort, // SORT
        group, // GROUP
        limit, // LIMIT
        0 // SKIP
      ).subscribe(
        result => {
          this.loading = false;
          this.hideMessage();
          resolve(result.transactions);
        },
        error => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
          resolve(new Array());
        }
      );
    });
  }

  public async changeArticlesStatusToPending(): Promise<boolean> {

    return new Promise<boolean>(async (resolve, reject) => {

      let isValid: boolean = true;

      for (let mov of this.movementsOfArticles) {
        if (mov.article.posKitchen) {
          mov.status = MovementOfArticleStatus.Pending;
          await this.updateMovementOfArticle(mov).then(
            movementOfArticle => {
              if (!movementOfArticle) {
                isValid = false;
              }
            }
          );
        }
      }

      resolve(isValid);
    });
  }

  public async print() {

    await this.getPrinters().then(
      printers => {
        if (printers) {
          this.printers = printers;
        }
      }
    );

    if (this.transaction.type.defectPrinter) {
      this.printerSelected = this.transaction.type.defectPrinter;
      this.distributeImpressions(this.transaction.type.defectPrinter);
    } else {
      this.openModal('printers');
    }
  }

  public updateBalance(): Promise<number> {

    return new Promise<number>((resolve, reject) => {

      this.loading = true;

      this._transactionService.updateBalance(this.transaction).subscribe(
        async result => {
          this.loading = false;
          if (!result.transaction) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.transaction.balance);
          }
        },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          reject(null);
        }
      )
    });
  }

  public updateStockByTransaction(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.loading = true;
      this._articleStockService.updateStockByTransaction(this.transaction).subscribe(
        result => {
          this.loading = false;
          if (result.status === 200) {
            resolve(true);
          } else {
            this.showToast(result);
            resolve(false);
          }
        },
        error => {
          this.loading = false;
          this.showToast(error);
          resolve(false);
        }
      );
    });
  }

  public getCancellationTypesAutomatic(): Promise<CancellationType[]> {

    return new Promise<CancellationType[]>((resolve, reject) => {

      this.loading = true;

      this._cancellationTypeService.getCancellationTypes(
        {
          "origin._id": 1,
          "origin.operationType": 1,
          "destination._id": 1,
          "destination.name": 1,
          "destination.operationType": 1,
          "operationType": 1,
          "requestAutomatic": 1
        }, // PROJECT
        {
          "origin._id": { $oid: this.transaction.type._id },
          "requestAutomatic": true,
          "operationType": { "$ne": "D" },
          "destination.operationType": { "$ne": "D" },
          "origin.operationType": { "$ne": "D" }
        }, // MATCH
        {}, // SORT
        {}, // GROUP
        0, // LIMIT
        0 // SKIP
      ).subscribe(result => {
        this.loading = false;
        if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
          resolve(result.cancellationTypes);
        } else {
          resolve(null);
        }
      },
        error => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        });
    });
  }

  async close(op?: string) {

    if (op === 'charge') {
      this.isCharge = true;
    } else {
      this.isCharge = false;
    }

    if (this.transaction.type.posKitchen) {
      this.typeOfOperationToPrint = 'item';
      if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
        for (let movementOfArticle of this.movementsOfArticles) {
          if (movementOfArticle.article && movementOfArticle.article.printIn === ArticlePrintIn.Bar && movementOfArticle.printed < movementOfArticle.amount) {
            this.barArticlesToPrint.push(movementOfArticle);
          }
          if (movementOfArticle.article && movementOfArticle.article.printIn === ArticlePrintIn.Kitchen && movementOfArticle.printed < movementOfArticle.amount) {
            this.kitchenArticlesToPrint.push(movementOfArticle);
          }
          if (movementOfArticle.article && movementOfArticle.article.printIn === ArticlePrintIn.Voucher && movementOfArticle.printed < movementOfArticle.amount) {
            this.voucherArticlesToPrint.push(movementOfArticle);
          }
        }
      }
    }

    if (this.barArticlesToPrint && this.barArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = "bar";
      this.distributeImpressions()
    } else if (this.kitchenArticlesToPrint && this.kitchenArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = "kitchen";
      this.distributeImpressions()
    } else if (this.voucherArticlesToPrint && this.voucherArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = "voucher";
      this.distributeImpressions()
    } else if (this.posType === 'resto' && this.transaction.table) {
      this.transaction.table.state = TableState.Busy;
      await this.updateTable().then(table => {
        if (table) {
          this.transaction.table = table;
          if (this.isCharge) {
            this.openModal('charge')
          } else {
            this.backFinal();
          }
        }
      });
    } else {
      if (this.isCharge) {
        this.openModal('charge')
      } else {
        this.backFinal();
      }
    }
  }

  public backFinal(): void {

    this._route.queryParams.subscribe(params => {
      if (params['returnURL']) {
        if (params['automaticCreation']) {
          if (this.transaction.state === TransactionState.Closed) {
            let route = params['returnURL'].split('?')[0];
            let paramsFromRoute = params['returnURL'].split('?')[1];
            if (paramsFromRoute && paramsFromRoute !== '') {
              paramsFromRoute = this.removeParam(paramsFromRoute, 'automaticCreation');
              route += '?' + paramsFromRoute + '&automaticCreation=' + params['automaticCreation'];
            } else {
              route += '?' + 'automaticCreation=' + params['automaticCreation'];
            }
            this._router.navigateByUrl(route);
          } else {
            this._router.navigateByUrl(this.removeParam(params['returnURL'], 'automaticCreation'));
          }
        } else {
          this._router.navigateByUrl(params['returnURL']);
        }
      }
    });
  }

  private removeParam(sourceURL: string, key: string) {
    let rtn = sourceURL.split("?")[0], param, params_arr = [], queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
      params_arr = queryString.split("&");
      for (let i = params_arr.length - 1; i >= 0; i -= 1) {
        param = params_arr[i].split("=")[0];
        if (param === key) {
          params_arr.splice(i, 1);
        }
      }
      rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
  }

  async getTaxVAT(movementOfArticle: MovementOfArticle) {

    this.loading = true;

    let taxes: Taxes[] = new Array();
    let tax: Taxes = new Taxes();
    tax.percentage = 21.00;
    tax.taxBase = this.roundNumber.transform((movementOfArticle.salePrice / ((tax.percentage / 100) + 1)));
    tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage / 100));

    this._taxService.getTaxes('where="name":"IVA"').subscribe(
      async result => {
        this.loading = false;
        if (!result.taxes) {
          this.showMessage("Debe configurar el impuesto IVA para el realizar el recargo de la tarjeta", 'info', true);
        } else {
          this.hideMessage();
          tax.tax = result.taxes[0];
          taxes.push(tax);
          movementOfArticle.taxes = taxes;
          await this.saveMovementOfArticle(movementOfArticle).then(
            movementOfArticle => {
              if (movementOfArticle) {
                this.focusEvent.emit(true);
                this.getMovementsOfTransaction();
              }
            }
          );
        }
      },
      error => {
        this.loading = false;
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public updateMovementOfArticlePrintedBar(): void {

    this.loading = true;

    this.barArticlesToPrint[this.barArticlesPrinted].printed = this.barArticlesToPrint[this.barArticlesPrinted].amount;
    this._movementOfArticleService.updateMovementOfArticle(this.barArticlesToPrint[this.barArticlesPrinted]).subscribe(
      async result => {
        this.loading = false;
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.barArticlesPrinted++;
          if (this.barArticlesPrinted < this.barArticlesToPrint.length) {
            this.updateMovementOfArticlePrintedBar();
          } else {
            if (this.posType === 'resto') {
              if (this.transaction.table) {
                this.transaction.table.state = TableState.Busy;
                await this.updateTable().then(table => {
                  if (table) {
                    this.transaction.table = table;
                    if (this.kitchenArticlesToPrint.length > 0) {
                      this.typeOfOperationToPrint = 'kitchen';
                      this.distributeImpressions(null)
                    } else if (this.voucherArticlesToPrint.length > 0) {
                      this.typeOfOperationToPrint = 'voucher';
                      this.distributeImpressions(null)
                    } else {
                      if (this.isCharge) {
                        this.openModal('charge')
                      } else {
                        this.backFinal();
                      }
                    }
                  }
                });
              } else {
                if (this.kitchenArticlesToPrint.length > 0) {
                  this.typeOfOperationToPrint = 'kitchen';
                  this.distributeImpressions(null)
                } else if (this.voucherArticlesToPrint.length > 0) {
                  this.typeOfOperationToPrint = 'voucher';
                  this.distributeImpressions(null)
                } else {
                  if (this.isCharge) {
                    this.openModal('charge')
                  } else {
                    this.backFinal();
                  }
                }
              }
            } else {
              if (this.kitchenArticlesToPrint.length > 0) {
                this.typeOfOperationToPrint = 'kitchen';
                this.distributeImpressions(null)
              } else if (this.voucherArticlesToPrint.length > 0) {
                this.typeOfOperationToPrint = 'voucher';
                this.distributeImpressions(null)
              } else {
                if (this.isCharge) {
                  this.openModal('charge')
                } else {
                  this.backFinal();
                }
              }
            }
          }
        }
      },
      error => {
        this.loading = false;
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public updateMovementOfArticlePrintedKitchen(): void {

    this.loading = true;

    this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].printed = this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].amount;
    this._movementOfArticleService.updateMovementOfArticle(this.kitchenArticlesToPrint[this.kitchenArticlesPrinted]).subscribe(
      async result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.kitchenArticlesPrinted++;
          if (this.kitchenArticlesPrinted < this.kitchenArticlesToPrint.length) {
            this.updateMovementOfArticlePrintedKitchen();
          } else {
            if (this.posType === 'resto') {
              if (this.transaction.table) {
                this.transaction.table.state = TableState.Busy;
                await this.updateTable().then(table => {
                  if (table) {
                    this.transaction.table = table;
                    if (this.voucherArticlesToPrint.length > 0) {
                      this.typeOfOperationToPrint = 'voucher';
                      this.distributeImpressions(null)
                    } else {
                      if (this.isCharge) {
                        this.openModal('charge')
                      } else {
                        this.backFinal();
                      }
                    }
                  }
                });
              } else {
                if (this.voucherArticlesToPrint.length > 0) {
                  this.typeOfOperationToPrint = 'voucher';
                  this.distributeImpressions(null)
                } else {
                  if (this.isCharge) {
                    this.openModal('charge')
                  } else {
                    this.backFinal();
                  }
                }
              }
            } else {
              if (this.voucherArticlesToPrint.length > 0) {
                this.typeOfOperationToPrint = 'voucher';
                this.distributeImpressions(null)
              } else {
                if (this.isCharge) {
                  this.openModal('charge')
                } else {
                  this.backFinal();
                }
              }

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

  public updateMovementOfArticlePrintedVoucher(): void {

    this.loading = true;

    this.voucherArticlesToPrint[this.voucherArticlesPrinted].printed = this.voucherArticlesToPrint[this.voucherArticlesPrinted].amount;
    this._movementOfArticleService.updateMovementOfArticle(this.voucherArticlesToPrint[this.voucherArticlesPrinted]).subscribe(
      async result => {
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.voucherArticlesPrinted++;
          if (this.voucherArticlesPrinted < this.voucherArticlesToPrint.length) {
            this.updateMovementOfArticlePrintedVoucher();
          } else {
            if (this.posType === 'resto' && this.transaction.table) {
              this.transaction.table.state = TableState.Busy;
              await this.updateTable().then(table => {
                if (table) {
                  this.transaction.table = table;
                  if (this.isCharge) {
                    this.openModal('charge')
                  } else {
                    this.backFinal();
                  }

                }
              });
            } else {
              if (this.isCharge) {
                this.openModal('charge')
              } else {
                this.backFinal();
              }
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

  public countPrinters(): number {

    let numberOfPrinters: number = 0;
    this.printersAux = new Array();

    if (this.printers != undefined) {
      for (let printer of this.printers) {
        if (this.typeOfOperationToPrint === 'charge' && printer.printIn === PrinterPrintIn.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bill' && printer.printIn === PrinterPrintIn.Counter) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'bar' && printer.printIn === PrinterPrintIn.Bar) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'kitchen' && printer.printIn === PrinterPrintIn.Kitchen) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        } else if (this.typeOfOperationToPrint === 'voucher' && printer.printIn === PrinterPrintIn.Voucher) {
          this.printersAux.push(printer);
          numberOfPrinters++;
        }
      }
    } else {
      numberOfPrinters = 0;
    }

    return numberOfPrinters;
  }

  async distributeImpressions(printer?: Printer) {

    this.printerSelected = printer;

    await this.getUser().then(
      async user => {
        if (user) {
          if (user.printers && user.printers.length > 0) {
            for (const element of user.printers) {
              if (element && element.printer && element.printer.printIn === PrinterPrintIn.Bar && this.typeOfOperationToPrint === 'bar') {
                this.printerSelected = element.printer;
              }
              if (element && element.printer && element.printer.printIn === PrinterPrintIn.Counter && (this.typeOfOperationToPrint === 'charge' || this.typeOfOperationToPrint === 'bill')) {
                this.printerSelected = element.printer;
              }
              if (element && element.printer && element.printer.printIn === PrinterPrintIn.Kitchen && this.typeOfOperationToPrint === 'kitchen') {
                this.printerSelected = element.printer;
              }
              if (element && element.printer && element.printer.printIn === PrinterPrintIn.Voucher && this.typeOfOperationToPrint === 'voucher') {
                this.printerSelected = element.printer;
              }
            }
          } else {
            if (!this.printerSelected) {
              await this.getPrinters().then(
                printers => {
                  if (printers) {
                    this.printers = printers;
                    for (const element of this.printers) {
                      if (element && element.printIn === PrinterPrintIn.Bar && this.typeOfOperationToPrint === 'bar') {
                        this.printerSelected = element;
                      }
                      if (element && element.printIn === PrinterPrintIn.Kitchen && this.typeOfOperationToPrint === 'kitchen') {
                        this.printerSelected = element;
                      }
                      if (element && element.printIn === PrinterPrintIn.Voucher && this.typeOfOperationToPrint === 'voucher') {
                        this.printerSelected = element;
                      }
                      if (element && element.printIn === PrinterPrintIn.Counter && (this.typeOfOperationToPrint === 'charge' || this.typeOfOperationToPrint === 'bill')) {
                        this.printerSelected = element;
                      }
                    }
                  }
                }
              );
            }
          }
        } else {
          this.showToast(null, "info", "Debe iniciar sesión");
        }

        switch (this.typeOfOperationToPrint) {
          case 'charge':
            if (printer.type === PrinterType.PDF) {
              this.openModal("print");
            }
            break;
          case 'kitchen':
            this.openModal("printKitchen");
            break;
          case 'bar':
            this.openModal("printBar");
            break;
          case 'voucher':
            this.openModal("printVoucher");
            break;
          default:
            this.showMessage("No se reconoce la operación de impresión.", 'danger', false);
            break;
        }
      }
    );

  }

  public getUser(): Promise<User> {

    return new Promise<User>((resolve, reject) => {

      var identity: User = JSON.parse(sessionStorage.getItem('user'));
      var user;
      if (identity) {
        this._userService.getUser(identity._id).subscribe(
          result => {
            if (result && result.user) {
              resolve(result.user)
            } else {
              this.showMessage("Debe volver a iniciar sesión", "danger", false);
            }
          },
          error => {
            this.showMessage(error._body, "danger", false);
          }
        )
      }
    });
  }

  public assignLetter() {

    if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
      this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
    } else {
      if (this.config['country'] === 'AR') {
        if (this.config['companyVatCondition'] && this.config['companyVatCondition'].description === "Responsable Inscripto") {
          if (this.transaction.company &&
            this.transaction.company.vatCondition) {
            this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
          } else {
            this.transaction.letter = "B";
          }
        } else if (this.config['companyVatCondition'] && this.config['companyVatCondition'].description === "Monotributista") {
          this.transaction.letter = "C";
        } else {
          this.transaction.letter = "X";
        }
      }
    }

    this.loading = true;
  }

  public getTransports(): void {

    this.loading = true;

    this._transportService.getTransports(
      { name: 1, operationType: 1 }, // PROJECT
      { operationType: { $ne: "D" } }, // MATCH
      { name: 1 }, // SORT
      {}, // GROUP
      0, // LIMIT
      0 // SKIP
    ).subscribe(
      result => {
        if (result && result.transports && result.transports.length > 0) {
          this.transports = result.transports;
        }
        this.loading = false;
      },
      error => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public assignTransactionNumber() {

    this.loading = true;

    let query = `where= "type":"${this.transaction.type._id}",
                    "origin":${this.transaction.origin},
                    "letter":"${this.transaction.letter}",
                    "_id":{"$ne":"${this.transaction._id}"}
                    &sort="number":-1
                    &limit=1`;

    this._transactionService.getTransactions(query).subscribe(
      result => {
        this.loading = false;
        if (!result.transactions) {
          this.transaction.number = 1;
        } else {
          this.transaction.number = result.transactions[0].number + 1;
        }
        this.finish();
      },
      error => {
        this.loading = false;
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  public setPrintBill(): void {
    if (this.movementsOfArticles && this.movementsOfArticles.length !== 0) {
      this.typeOfOperationToPrint = 'bill';
      this.openModal('printers');
    } else {
      this.showMessage("No existen productos en el pedido.", 'info', true);
      this.loading = false;
    }
  }

  public filterArticles(): void {

    this.listArticlesComponent.filterArticle = this.filterArticle;
    if (this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
      this.listArticlesComponent.filterItem(this.lastMovementOfArticle.article, this.categorySelected);
    } else {
      this.listArticlesComponent.filterItem(null, this.categorySelected);
    }
    if (!this.filterArticle || this.filterArticle === '') {
      this.showCategories();
    }
  }

  public showCategories(): void {

    this.categorySelected = null;
    if (!(this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*')) {
      this.filterArticle = '';
    }
    this.listCategoriesComponent.areCategoriesVisible = true;
    this.listArticlesComponent.areArticlesVisible = false;
    this.listArticlesComponent.filterArticle = this.filterArticle;
    if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
      this.listCategoriesComponent.ngOnInit();
      this.focusEvent.emit(true);
    }
  }

  public showArticles(category?: Category): void {

    if (category) {
      this.categorySelected = category;
      this.listArticlesComponent.filterItem(null, this.categorySelected);
      this.listArticlesComponent.hideMessage();
    }
    this.listCategoriesComponent.areCategoriesVisible = false;
    this.listArticlesComponent.areArticlesVisible = true;
    if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
      this.focusEvent.emit(true);
    }
  }

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  public showToast(result, type?: string, title?: string, message?: string): void {
    if (result) {
      if (result.status === 200) {
        type = 'success';
        title = result.message;
      } else if (result.status >= 400) {
        type = 'danger';
        title = (result.error && result.error.message) ? result.error.message : result.message;
      } else {
        type = 'info';
        title = result.message;
      }
    }
    switch (type) {
      case 'success':
        this._toastr.success(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      case 'danger':
        this._toastr.error(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
      default:
        this._toastr.info(this.translatePipe.translateMe(message), this.translatePipe.translateMe(title));
        break;
    }
    this.loading = false;
  }

  public padNumber(n, length): string {

    var n = n.toString();
    while (n.length < length)
      n = "0" + n;
    return n;
  }
}
