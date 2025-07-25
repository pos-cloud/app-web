import { Component, ElementRef, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbActiveModal, NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CancellationType } from 'app/components/cancellation-type/cancellation-type';
import { MovementOfCash } from 'app/components/movement-of-cash/movement-of-cash';
import { PaymentMethod } from 'app/components/payment-method/payment-method';
import { PriceList } from 'app/components/price-list/price-list';
import { SelectTableComponent } from 'app/components/table/select-table/select-table.component';
import { User } from 'app/components/user/user';
import { ArticleService } from 'app/core/services/article.service';
import { CancellationTypeService } from 'app/core/services/cancellation-type.service';
import { ConfigService } from 'app/core/services/config.service';
import { MovementOfCancellationService } from 'app/core/services/movement-of-cancellation.service';
import { PriceListService } from 'app/core/services/price-list.service';
import { RelationTypeService } from 'app/core/services/relation-type.service';
import { StructureService } from 'app/core/services/structure.service';
import { JsonDiffPipe } from 'app/shared/pipes/json-diff';
import { TranslateMePipe } from 'app/shared/pipes/translate-me';
import * as moment from 'moment';
import 'moment/locale/es';

import { CompanyType, RelationType, Table, TableState, Transport, UseOfCFDI } from '@types';
import { AccountSeatService } from '../../core/services/account-seat.service';
import { ArticleStockService } from '../../core/services/article-stock.service';
import { MovementOfArticleService } from '../../core/services/movement-of-article.service';
import { PrinterService } from '../../core/services/printer.service';
import { TableService } from '../../core/services/table.service';
import { TaxService } from '../../core/services/tax.service';
import { TransactionService } from '../../core/services/transaction.service';
import { UserService } from '../../core/services/user.service';
import { SelectTransportComponent } from '../../modules/transaction/components/select-transport/select-transport.component';
import { SelectEmployeeComponent } from '../../shared/components/select-employee/select-employee.component';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { RoundNumberPipe } from '../../shared/pipes/round-number.pipe';
import { ApplyDiscountComponent } from '../apply-discount/apply-discount.component';
import { ArticleFieldType } from '../article-field/article-field';
import { ArticleFields } from '../article-field/article-fields';
import { ArticleStock } from '../article-stock/article-stock';
import { Article, ArticlePrintIn, Type } from '../article/article';
import { ArticleComponent } from '../article/crud/article.component';
import { ListArticlesPosComponent } from '../article/list-articles-pos/list-articles-pos.component';
import { CancellationTypeAutomaticComponent } from '../cancellation-type/cancellation-types-automatic/cancellation-types-automatic.component';
import { Category } from '../category/category';
import { ListCategoriesPosComponent } from '../category/list-categories-pos/list-categories-pos.component';
import { AddMovementOfArticleComponent } from '../movement-of-article/add-movement-of-article/add-movement-of-article.component';
import { MovementOfArticle, MovementOfArticleStatus } from '../movement-of-article/movement-of-article';
import { MovementOfCancellation } from '../movement-of-cancellation/movement-of-cancellation';
import { MovementOfCancellationComponent } from '../movement-of-cancellation/movement-of-cancellation.component';
import { AddMovementOfCashComponent } from '../movement-of-cash/add-movement-of-cash/add-movement-of-cash.component';
import { SelectPriceListComponent } from '../price-list/select-price-list/select-price-list.component';
import { Print } from '../print/print';
import { PrintTransactionTypeComponent } from '../print/print-transaction-type/print-transaction-type.component';
import { PrintComponent } from '../print/print/print.component';
import { Printer, PrinterPrintIn } from '../printer/printer';
import { SelectShipmentMethodComponent } from '../shipment-method/select-shipment-method/select-shipment-method.component';
import { TaxBase, TaxClassification } from '../tax/tax';
import { Taxes } from '../tax/taxes';
import {
  optionalAFIP,
  PriceType,
  StockMovement,
  TransactionMovement,
  TransactionType,
} from '../transaction-type/transaction-type';
import { Transaction, TransactionState } from '../transaction/transaction';

import { ApiResponse, Currency, EmailProps } from '@types';
import { AuthService } from 'app/core/services/auth.service';
import { SelectCompanyComponent } from 'app/modules/entities/company/select-company/select-company.component';
import { ChangeObservationComponent } from 'app/modules/transaction/components/change-observation/change-observation.component';
import { FinishTransactionDialogComponent } from 'app/modules/transaction/components/finish-transaction-dialog/finish-transaction-dialog.component';
import { DeleteTransactionComponent } from 'app/shared/components/delete-transaction/delete-transaction.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { VariantService } from '../../core/services/variant.service';
import { ApplyBusinessRuleComponent } from '../../modules/transaction/components/apply-business-rule/apply-business-rule.component';
import { ChangeDateComponent } from '../../modules/transaction/components/change-date/change-date.component';
import { Config } from './../../app.config';

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.scss'],
  providers: [NgbAlertConfig, DateFormatPipe, RoundNumberPipe, TranslateMePipe],
  encapsulation: ViewEncapsulation.None,
})
export class AddSaleOrderComponent {
  @ViewChild('contentPrinters', { static: true }) contentPrinters: ElementRef;
  @ViewChild('contentOptionalAFIP', { static: true }) contentChangeOptionalAFIP: ElementRef;

  @ViewChild('contentChangeQuotation', { static: true }) contentChangeQuotation: ElementRef;
  @ViewChild('contentInformCancellation', { static: true }) contentInformCancellation: ElementRef;
  @ViewChild('containerMovementsOfArticles', { static: true }) containerMovementsOfArticles: ElementRef;
  @ViewChild('containerTaxes', { static: true }) containerTaxes: ElementRef;
  @ViewChild(ListArticlesPosComponent) listArticlesComponent: ListArticlesPosComponent;
  @ViewChild(ListCategoriesPosComponent) listCategoriesComponent: ListCategoriesPosComponent;
  optional: string = '';
  transaction: Transaction;
  transactionId: string;
  article: Article;
  transactionMovement: string;
  alertMessage: string = '';
  display = true;
  discountApply = 0;
  movementsOfArticles: MovementOfArticle[];
  movementsOfCashes: MovementOfCash[];
  usesOfCFDI: UseOfCFDI[];
  relationTypes: RelationType[];
  printers: Printer[];
  currencies: Currency[];
  cancellationTypes: CancellationType[];
  showButtonCancelation: boolean;
  showButtonInformCancellation: boolean;
  printerSelected: Printer;
  printersAux: Printer[]; //Variable utilizada para guardar las impresoras de una operación determinada (Cocina, mostrador, Bar)
  posType: string;
  loading: boolean;
  isCharge: boolean;
  optionalAFIP: optionalAFIP;
  paymentAmount: number = 0.0;
  typeOfOperationToPrint: string;
  kitchenArticlesToPrint: MovementOfArticle[];
  kitchenArticlesPrinted: number = 0;
  barArticlesToPrint: MovementOfArticle[];
  barArticlesPrinted: number = 0;
  voucherArticlesToPrint: MovementOfArticle[];
  voucherArticlesPrinted: number = 0;
  printSelected: Print;
  filterArticle: string = '';
  focusEvent = new EventEmitter<boolean>();
  roundNumber = new RoundNumberPipe();
  areMovementsOfArticlesEmpty: boolean = true;
  userCountry: string = 'AR';
  lastQuotation: number = 1;
  categorySelected: Category;
  totalTaxesAmount: number = 0;
  totalTaxesBase: number = 0;
  filtersTaxClassification: TaxClassification[];
  fastPayment: PaymentMethod;
  transports: Transport[];
  config: Config;
  database: string;
  lastMovementOfArticle: MovementOfArticle;
  isCancellationAutomatic: boolean = false;

  priceList: any;
  newPriceList: any;
  increasePrice = 0;
  lastIncreasePrice = 0;
  companyOld: boolean = false;
  quantity = 0;

  movementsOfCancellations: MovementOfCancellation[] = new Array();
  email: EmailProps;
  canceledTransactions: {
    typeId: string;
    code: number;
    origin: number;
    letter: string;
    number: number;
  } = {
    typeId: '',
    code: 0,
    origin: 0,
    letter: '',
    number: 0,
  };
  m3: number = 0;
  weight: number = 0;
  width: number = 0;
  depth: number = 0;
  height: number = 0;
  user: User;

  constructor(
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
    private _variantService: VariantService,
    private _taxService: TaxService,
    private _relationTypeService: RelationTypeService,
    private _movementOfCancellationService: MovementOfCancellationService,
    private _cancellationTypeService: CancellationTypeService,
    private _accountSeatService: AccountSeatService,
    private _priceListService: PriceListService,
    private _configService: ConfigService,
    private _structureService: StructureService,
    private _jsonDiffPipe: JsonDiffPipe,
    private _toastService: ToastService,
    public translatePipe: TranslateMePipe,
    public activeModal: NgbActiveModal,
    public alertConfig: NgbAlertConfig,
    public _authService: AuthService
  ) {
    this.initVariables();
    this.processParams();
  }

  initVariables(): void {
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
    this._route.queryParams.subscribe((params) => {
      this.transactionId = params['transactionId'];
      if (!this.transactionId) {
        this.backFinal();
      }
    });
  }

  async ngOnInit() {
    this.database = localStorage.getItem('company');

    this._configService.getConfig.subscribe((config) => {
      this.config = config;
      this.userCountry = this.config['country'];
      // if (this.userCountry === 'MX') {
      //   this.getUsesOfCFDI().then((usesOfCFDI) => {
      //     if (usesOfCFDI) {
      //       this.usesOfCFDI = usesOfCFDI;
      //     }
      //   });
      //   this.getRelationTypes().then((relationTypes) => {
      //     if (relationTypes) {
      //       this.relationTypes = relationTypes;
      //     }
      //   });
      // }
    });

    this._authService.getIdentity.subscribe((identity) => {
      if (identity) {
        this.user = identity;
      }
    });

    let pathLocation: string[] = this._router.url.split('/');
    this.posType = pathLocation[2];

    this.initComponent();
  }

  async initComponent() {
    try {
      this.loading = true;

      if (this.transactionId) {
        this.transaction = await this.getTransaction();

        if (this.transaction.type.optionalAFIP && !this.transaction.optionalAFIP) {
          this.transaction.optionalAFIP = this.transaction.type.optionalAFIP;
        }

        if (!this.transaction.company && this.transaction.type.company) {
          this.transaction.company = this.transaction.type.company;
        }

        if (this.transaction && this.transaction.company && this.transaction.company.transport) {
          this.transaction.transport = this.transaction.company.transport;
        }
        if (
          this.transaction.state === TransactionState.Closed ||
          this.transaction.state === TransactionState.Canceled ||
          this.transaction.CAE
        ) {
          if (this.posType === 'resto' && this.transaction.table) {
            this.transaction.table.employee = null;
            this.transaction.table.state = TableState.Available;
            this.transaction.table = await this.updateTable(this.transaction.table);
          }
          this.backFinal();
        } else {
          this.transactionMovement = '' + this.transaction.type.transactionMovement || '';
          this.filtersTaxClassification = [TaxClassification.Withholding, TaxClassification.Perception];
          this.lastQuotation = this.transaction.quotation;

          if (this.userCountry === 'MX' && this.transaction.type.defectUseOfCFDI && !this.transaction.useOfCFDI) {
            this.transaction.useOfCFDI = this.transaction.type.defectUseOfCFDI;
          }

          this.cancellationTypes = await this.getCancellationTypes();
          if (this.cancellationTypes) {
            this.cancellationTypes = this.cancellationTypes;
            this.showButtonInformCancellation = true;
            this.showButtonCancelation = true;
          } else {
            this.showButtonCancelation = false;
          }

          this.movementsOfCancellations = await this.getMovementsOfCancellations();
          if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
            this.showButtonCancelation = false;
          } else {
            this.showButtonCancelation = true;
          }

          this.getMovementsOfTransaction();
        }
      }

      this.loading = false;
    } catch (error) {
      this._toastService.showToast(error);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        this.focusEvent.emit(true);
      }
    }, 1000);
  }

  getPriceList(id: string): Promise<PriceList> {
    return new Promise<PriceList>((resolve) => {
      this._priceListService.getPriceList(id).subscribe(
        (result) => {
          if (!result.priceList) {
            resolve(null);
          } else {
            resolve(result.priceList);
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  getCancellationTypes(): Promise<CancellationType[]> {
    return new Promise<CancellationType[]>((resolve) => {
      this._cancellationTypeService
        .getCancellationTypes(
          {
            'destination._id': 1,
            'destination.name': 1,
            'origin._id': 1,
            'origin.name': 1,
            operationType: 1,
          }, // PROJECT
          {
            'destination._id': { $oid: this.transaction.type._id },
            operationType: { $ne: 'D' },
          }, // MATCH
          { order: 1 }, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
              resolve(result.cancellationTypes);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  getMovementsOfCancellations(): Promise<MovementOfCancellation[]> {
    return new Promise<MovementOfCancellation[]>((resolve) => {
      this._movementOfCancellationService
        .getAll({
          project: {
            _id: 1,
            transactionDestination: 1,
            'transactionOrigin._id': 1,
            'transactionOrigin.type.codes': 1,
            'transactionOrigin.type.electronics': 1,
            'transactionOrigin.letter': 1,
            'transactionOrigin.origin': 1,
            'transactionOrigin.number': 1,
          },
          match: { transactionDestination: { $oid: this.transaction._id } },
        })
        .subscribe(
          (result) => {
            if (result.status == 200) {
              resolve(result.result);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
    });
  }

  async changeUseOfCFDI(useOfCFDI) {
    this.transaction.useOfCFDI = useOfCFDI;
    this.transaction = await this.updateTransaction();
  }

  getRelationTypes(): Promise<RelationType[]> {
    return new Promise<RelationType[]>((resolve) => {
      this.loading = true;
      let query = 'sort="description":1';

      this._relationTypeService.getRelationTypes(query).subscribe(
        (result) => {
          this.loading = false;
          if (!result.relationTypes) {
            resolve(null);
          } else {
            resolve(result.relationTypes);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  getTransaction(): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.getTransaction(this.transactionId).subscribe(
        async (result) => {
          if (result.transaction) {
            resolve(result.transaction);
          } else reject(result);
        },
        (error) => reject(error)
      );
    });
  }

  updateTransaction(): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this.transaction.exempt = this.roundNumber.transform(this.transaction.exempt);
      this.transaction.discountAmount = this.roundNumber.transform(this.transaction.discountAmount, 6);
      this.transaction.totalPrice = this.roundNumber.transform(this.transaction.totalPrice);
      this._transactionService.update(this.transaction).subscribe(
        (result: ApiResponse) => {
          if (result.status === 200) {
            resolve(result.result);
          } else {
            this._toastService.showToast(result);
            reject(result);
          }
        },
        (error) => {
          this._toastService.showToast(error);
          reject(error);
        }
      );
    });
  }

  saveMovementsOfCancellations(movementsOfCancellations: MovementOfCancellation[]): Promise<MovementOfCancellation[]> {
    for (let mov of movementsOfCancellations) {
      if (mov.transactionOrigin.discountAmount > 0 && this.database === 'borlaschic') {
        this.discountApply =
          (mov.transactionOrigin.totalPrice + mov.transactionOrigin.discountAmount) /
          mov.transactionOrigin.discountAmount;
      }

      const validDatabases = ['insumosmaxs', 'arterama', 'globalstore', 'syp', 'polirrubrojb', 'laraherzig'];

      if (mov.transactionOrigin.discountAmount > 0 && validDatabases.includes(this.database)) {
        this.discountApply =
          (mov.transactionOrigin.discountAmount /
            (mov.transactionOrigin.totalPrice + mov.transactionOrigin.discountAmount)) *
          100;
      }

      let transOrigin = new Transaction();

      transOrigin._id = mov.transactionOrigin._id;
      let transDestino = new Transaction();

      transDestino._id = mov.transactionDestination._id;
      mov.transactionOrigin = transOrigin;
      mov.transactionDestination = transDestino;
    }
    return new Promise<MovementOfCancellation[]>((resolve) => {
      this.loading = true;

      this._movementOfCancellationService.saveMovementsOfCancellations(movementsOfCancellations).subscribe(
        async (result) => {
          this.loading = false;
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  daleteMovementsOfCancellations(query: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.loading = true;

      this._movementOfCancellationService.deleteMovementsOfCancellations(query).subscribe(
        async (result) => {
          this.loading = false;
          if (!result.movementsOfCancellations) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementsOfCancellations);
          }
        },
        (error) => {
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
    await this.updateTransaction().then(async (transaction) => {
      if (transaction) {
        this.transaction = transaction;
        this.lastQuotation = this.transaction.quotation;
      } else {
        this.hideMessage();
        this.getMovementsOfTransaction();
      }
    });
  }

  updateTable(table): Promise<Table> {
    return new Promise<Table>((resolve, reject) => {
      this.loading = true;

      this._tableService.updateTable(table).subscribe(
        (result) => {
          this.loading = false;
          if (!result.table) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.table);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          reject(null);
        }
      );
    });
  }

  getMovementsOfTransaction(): void {
    this.hideMessage();

    this.loading = true;

    let query = 'where="transaction":"' + this.transaction._id + '"';

    this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
      (result) => {
        if (!result.movementsOfArticles) {
          this.areMovementsOfArticlesEmpty = true;
          this.movementsOfArticles = new Array();
          this.lastMovementOfArticle = null;
          this.updatePrices();
          this.updateQuantity();
        } else {
          this.areMovementsOfArticlesEmpty = false;
          this.movementsOfArticles = result.movementsOfArticles;
          this.lastMovementOfArticle = this.movementsOfArticles[this.movementsOfArticles.length - 1];
          this.containerMovementsOfArticles.nativeElement.scrollTop =
            this.containerMovementsOfArticles.nativeElement.scrollHeight;
          this.updateQuantity();
          if (this.discountApply > 0) {
            // esto es solo para borlaschic e insumosmaxs
            this.updatePrices(this.discountApply);
          } else {
            this.updatePrices();
          }
          // esto para bardo solamente por que necesita que se haga la lectura de uno y se vuelva a crear automaticamente.
          if (
            result.movementsOfArticles.length == 1 &&
            this.transaction.type.name == 'Cierre de producción' &&
            this.transaction.type.transactionMovement === TransactionMovement.Production
          ) {
            this.finish();
          }
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  updateQuantity(): void {
    this.quantity = 0;
    this.m3 = 0;
    this.height = 0;
    this.weight = 0;
    this.depth = 0;
    this.width = 0;
    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        if (!movementOfArticle.movementParent) {
          this.quantity += movementOfArticle.amount;
          this.m3 += (movementOfArticle.article?.m3 ?? 0) * movementOfArticle.amount;
          this.height += (movementOfArticle.article?.height ?? 0) * movementOfArticle.amount;
          this.weight += (movementOfArticle.article?.weight ?? 0) * movementOfArticle.amount;
          this.depth += (movementOfArticle.article?.depth ?? 0) * movementOfArticle.amount;
          this.width += (movementOfArticle.article?.width ?? 0) * movementOfArticle.amount;
        }
      }

      this.m3 = +this.m3.toFixed(2);
      this.height = +this.height.toFixed(2);
      this.width = +this.width.toFixed(2);
      this.depth = +this.depth.toFixed(2);
      this.weight = +this.weight.toFixed(2);
    }
  }

  async addItem(event) {
    if (event && event['parent']) {
      let itemData: MovementOfArticle = event['parent'];
      let child: MovementOfArticle[] = event['child'];

      this.showCategories();

      if (itemData && itemData.article && itemData.article._id) {
        if (
          !itemData.article.containsVariants &&
          !itemData.article.allowMeasure &&
          !(await this.getStructure(itemData.article._id))
        ) {
          let movementOfArticle: MovementOfArticle;

          if (!itemData.article.isWeigth || this.transaction.type.stockMovement == StockMovement.Inventory) {
            if (this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
              if (this.lastMovementOfArticle) {
                let query = `where="_id":"${this.lastMovementOfArticle._id}"`;

                await this.getMovementsOfArticles(query).then((movementsOfArticles) => {
                  if (movementsOfArticles && movementsOfArticles.length > 0) {
                    movementOfArticle = movementsOfArticles[0];
                  }
                });
              }
            } else if (this.transaction.type.stockMovement == StockMovement.Inventory) {
              let query = `where="transaction":"${this.transactionId}","operationType":{"$ne":"D"},"article":"${itemData.article._id}"`;

              await this.getMovementsOfArticles(query).then((movementsOfArticles) => {
                if (movementsOfArticles && movementsOfArticles.length > 0) {
                  movementOfArticle = movementsOfArticles[0];
                }
              });
            }
          }
          if (!movementOfArticle) {
            movementOfArticle = itemData;
            movementOfArticle._id = '';
            movementOfArticle.transaction = this.transaction;
            movementOfArticle.modifyStock = this.transaction.type.modifyStock;
            movementOfArticle.stockMovement = this.transaction.type.stockMovement;
            movementOfArticle.printed = 0;
            movementOfArticle.read = 0;
            if (child && child.length === 0) {
              if (await this.isValidMovementOfArticle(movementOfArticle)) {
                await this.saveMovementOfArticle(movementOfArticle).then((movementOfArticle) => {
                  if (movementOfArticle) {
                    this.getMovementsOfTransaction();
                  }
                });
              }
            } else {
              let movsArticle: MovementOfArticle[] = new Array();

              for (const movArticle of child) {
                let stock: boolean = await this.getUtilization(movementOfArticle.article._id, movArticle.article._id);

                if (await this.isValidMovementOfArticle(movArticle, stock)) {
                  movsArticle.push(movArticle);
                }
              }
              if (movsArticle.length === child.length) {
                await this.saveMovementOfArticle(movementOfArticle).then(async (movementOfArticle) => {
                  if (movementOfArticle) {
                    movsArticle = new Array();
                    for (const movArticle of child) {
                      movArticle.movementParent = movementOfArticle;
                      movArticle.movementOrigin = null;
                      movsArticle.push(movArticle);
                    }
                    await this.saveMovementsOfArticles(movsArticle).then((result) => {
                      if (result) {
                        this.getMovementsOfTransaction();
                      } else {
                        this.showMessage('No se pudo crear la estructura de producto', 'info', false);
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
                  (movementOfArticle) => {
                    if (movementOfArticle) {
                      this.getMovementsOfTransaction();
                    }
                  }
                );
              } else {
                await this.updateMovementOfArticle(this.recalculateCostPrice(movementOfArticle)).then(
                  (movementOfArticle) => {
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
          movementOfArticle.stockMovement = this.transaction.type.stockMovement;
          movementOfArticle.printed = 0;
          movementOfArticle.amount = 1;
          this.openModal('movement_of_article', movementOfArticle);
        }
      } else {
        this._toastService.showToast({
          type: 'danger',
          message: 'Error al agregar el artículo, por favor inténtelo de nuevo.',
        });
      }
    } else {
      this.showArticles();
    }
  }

  private getStructure(articleId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.loading = true;

      let match = `{
			"operationType": { "$ne": "D" },
			"parent._id": { "$oid" : "${articleId}"},
			"optional" : true,
			"child.operationType": { "$ne": "D" }
		  }`;

      match = JSON.parse(match);

      let project = {
        _id: 1,
        'parent._id': 1,
        'parent.description': 1,
        'child._id': 1,
        'child.description': 1,
        'child.operationType': 1,
        optional: 1,
        utilization: 1,
        operationType: 1,
      };

      let group = {
        _id: null,
        count: { $sum: 1 },
        structures: { $push: '$$ROOT' },
      };

      this._structureService
        .getStructures(
          project, // PROJECT
          match, // MATCH
          {}, // SORT
          group, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            this.loading = false;
            if (result && result[0] && result[0].structures) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
            resolve(false);
          }
        );
    });
  }

  private getUtilization(parent: string, child: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
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
        _id: 1,
        'parent._id': 1,
        'parent.description': 1,
        'child._id': 1,
        'child.description': 1,
        'child.operationType': 1,
        optional: 1,
        utilization: 1,
        operationType: 1,
      };

      let group = {
        _id: null,
        count: { $sum: 1 },
        structures: { $push: '$$ROOT' },
      };

      this._structureService
        .getStructures(
          project, // PROJECT
          match, // MATCH
          {}, // SORT
          group, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            this.loading = false;
            if (result && result[0] && result[0].structures) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
            resolve(false);
          }
        );
    });
  }

  getMovementsOfArticles(query?: string): Promise<MovementOfArticle[]> {
    return new Promise<MovementOfArticle[]>((resolve) => {
      this.loading = true;

      this._movementOfArticleService.getMovementsOfArticles(query).subscribe(
        (result) => {
          this.loading = false;
          if (!result.movementsOfArticles) {
            resolve(null);
          } else {
            resolve(result.movementsOfArticles);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  saveMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {
    return new Promise<MovementOfArticle>((resolve) => {
      this.loading = true;
      movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice);
      movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.salePrice);

      this._movementOfArticleService.saveMovementOfArticle(movementOfArticle).subscribe(
        (result) => {
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
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  private saveMovementsOfArticles(movementsOfArticles: MovementOfArticle[]): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      this.loading = true;

      let movsArticles: MovementOfArticle[] = new Array();

      for (const movArticle of movementsOfArticles) {
        movArticle.basePrice = 0;
        movArticle.costPrice = 0;
        movArticle.salePrice = 0;
        movArticle.unitPrice = 0;
        movArticle.status = MovementOfArticleStatus.Ready;

        if (await this.recalculateSalePrice(movArticle)) {
          movsArticles.push(movArticle);
        } else {
          resolve(false);
        }
      }

      this._movementOfArticleService.saveMovementsOfArticles(movsArticles).subscribe(
        (result) => {
          this.loading = false;
          if (!result.movementsOfArticles) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(false);
          } else {
            this.hideMessage();
            resolve(true);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(false);
        }
      );
    });
  }

  async isValidMovementOfArticle(movementOfArticle: MovementOfArticle, verifyStock: boolean = true): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      try {
        if (
          this.transaction.type &&
          this.transaction.type.transactionMovement === TransactionMovement.Sale &&
          movementOfArticle.article &&
          !movementOfArticle.article.allowSale
        )
          throw new Error(
            `El producto ${movementOfArticle.article.description} (${movementOfArticle.article.code}) no esta habilitado para la venta`
          );

        if (
          this.transaction.type &&
          this.transaction.type.transactionMovement === TransactionMovement.Purchase &&
          movementOfArticle.article &&
          !movementOfArticle.article.allowPurchase
        )
          throw new Error(
            `El producto ${movementOfArticle.article.description} (${movementOfArticle.article.code}) no esta habilitado para la compra`
          );
        if (verifyStock && !(await this.hasStock(movementOfArticle)))
          throw new Error(
            `No tiene el stock suficiente del producto ${movementOfArticle.article.description} (${movementOfArticle.article.code}).`
          );
        resolve(true);
      } catch (error) {
        this._toastService.showToast(error);
        resolve(false);
      }
    });
  }

  async hasStock(movementOfArticle: MovementOfArticle): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        let has: boolean = true;

        if (
          movementOfArticle.article &&
          this.config['modules'].stock &&
          movementOfArticle.modifyStock &&
          (movementOfArticle.stockMovement === StockMovement.Outflows ||
            movementOfArticle.stockMovement === StockMovement.Transfer) &&
          !movementOfArticle.article.allowSaleWithoutStock
        ) {
          let articleStocks: ArticleStock[] = await this.getArticleStock(movementOfArticle);
          let articleStock: ArticleStock;

          if (articleStocks && articleStocks.length > 0) articleStock = articleStocks[0];
          let totalStock: number = movementOfArticle.amount;

          this.movementsOfArticles.forEach((mov: MovementOfArticle) => {
            if (
              mov?._id?.toString() !== movementOfArticle?._id?.toString() &&
              mov?.article?._id?.toString() === movementOfArticle?.article?._id?.toString()
            ) {
              totalStock += mov.amount - mov.quantityForStock;
            }
          });
          if (!articleStock || totalStock > articleStock.realStock) {
            if (
              !(
                this.transaction.type.stockMovement === StockMovement.Transfer &&
                movementOfArticle.deposit &&
                movementOfArticle.deposit._id.toString() === this.transaction.depositDestination._id.toString()
              )
            ) {
              has = false;
            }
          }
        }
        resolve(has);
      } catch (error) {
        reject(error);
      }
    });
  }

  getArticleStock(movementOfArticle: MovementOfArticle): Promise<ArticleStock[]> {
    return new Promise<ArticleStock[]>((resolve, reject) => {
      let depositID;
      let query;

      if (movementOfArticle.article.deposits && movementOfArticle.article.deposits.length > 0) {
        movementOfArticle.article.deposits.forEach((element) => {
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
        (result) => {
          if (result.articleStocks) resolve(result.articleStocks);
          else reject(result);
        },
        (error) => reject(error)
      );
    });
  }

  recalculateCostPrice(movementOfArticle: MovementOfArticle): MovementOfArticle {
    let quotation = 1;

    if (this.transaction.quotation) {
      quotation = this.transaction.quotation;
    }

    movementOfArticle.unitPrice = this.roundNumber.transform(
      movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount
    );

    if (
      movementOfArticle.article &&
      movementOfArticle.article.currency &&
      this.config['currency'] &&
      this.config['currency']._id !== movementOfArticle.article.currency._id
    ) {
      movementOfArticle.unitPrice = this.roundNumber.transform(
        (movementOfArticle.unitPrice / this.lastQuotation) * quotation
      );
    }

    movementOfArticle.transactionDiscountAmount = this.roundNumber.transform(
      (movementOfArticle.unitPrice * this.transaction.discountPercent) / 100,
      6
    );
    movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.transactionDiscountAmount);
    movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
    movementOfArticle.markupPrice = 0.0;
    movementOfArticle.markupPercentage = 0.0;

    let taxedAmount = movementOfArticle.basePrice;

    movementOfArticle.costPrice = 0;

    let fields: ArticleFields[] = new Array();

    if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
      for (const field of movementOfArticle.otherFields) {
        if (
          field.articleField.datatype === ArticleFieldType.Percentage ||
          field.articleField.datatype === ArticleFieldType.Number
        ) {
          if (field.articleField.datatype === ArticleFieldType.Percentage) {
            field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value)) / 100);
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
            articleTax.taxAmount = this.roundNumber.transform((articleTax.taxBase * articleTax.percentage) / 100);
          }
          taxes.push(articleTax);
          movementOfArticle.costPrice += this.roundNumber.transform(articleTax.taxAmount);
        }
        movementOfArticle.taxes = taxes;
      }
    }
    movementOfArticle.costPrice += this.roundNumber.transform(taxedAmount);
    movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice);
    movementOfArticle.salePrice = this.roundNumber.transform(
      movementOfArticle.costPrice + movementOfArticle.roundingAmount
    );

    return movementOfArticle;
  }

  recalculateSalePrice(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {
    return new Promise<MovementOfArticle>(async (resolve) => {
      this.loading = true;

      let quotation = 1;

      if (this.transaction.quotation) {
        quotation = this.transaction.quotation;
      }

      if (movementOfArticle.article) {
        movementOfArticle.basePrice = this.roundNumber.transform(
          movementOfArticle.article.basePrice * movementOfArticle.amount
        );

        if (
          movementOfArticle.article.currency &&
          this.config['currency'] &&
          this.config['currency']._id !== movementOfArticle.article.currency._id
        ) {
          movementOfArticle.basePrice = this.roundNumber.transform(movementOfArticle.basePrice * quotation);
        }
      }

      let fields: ArticleFields[] = new Array();

      if (movementOfArticle.otherFields && movementOfArticle.otherFields.length > 0) {
        for (const field of movementOfArticle.otherFields) {
          if (
            field.articleField.datatype === ArticleFieldType.Percentage ||
            field.articleField.datatype === ArticleFieldType.Number
          ) {
            if (field.articleField.datatype === ArticleFieldType.Percentage) {
              field.amount = this.roundNumber.transform((movementOfArticle.basePrice * parseFloat(field.value)) / 100);
            } else if (field.articleField.datatype === ArticleFieldType.Number) {
              field.amount = parseFloat(field.value);
            }
          }
          fields.push(field);
        }
      }
      movementOfArticle.otherFields = fields;

      if (movementOfArticle.article) {
        movementOfArticle.costPrice = this.roundNumber.transform(
          movementOfArticle.article.costPrice * movementOfArticle.amount
        );
        if (
          movementOfArticle.article.currency &&
          this.config['currency'] &&
          this.config['currency']._id !== movementOfArticle.article.currency._id
        ) {
          movementOfArticle.costPrice = this.roundNumber.transform(movementOfArticle.costPrice * quotation);
        }
      }

      movementOfArticle.unitPrice = this.roundNumber.transform(
        movementOfArticle.unitPrice + movementOfArticle.transactionDiscountAmount + movementOfArticle.discountAmount
      );
      if (
        movementOfArticle.article &&
        movementOfArticle.article.currency &&
        this.config['currency'] &&
        this.config['currency']._id !== movementOfArticle.article.currency._id
      ) {
        movementOfArticle.unitPrice = this.roundNumber.transform(
          (movementOfArticle.unitPrice / this.lastQuotation) * quotation
        );
      }

      if (
        movementOfArticle.article &&
        this.priceList &&
        this.database !== 'sangenemi' &&
        this.database !== 'globalstore'
      ) {
        let increasePrice = 0;

        if (this.priceList.allowSpecialRules && this.priceList.rules && this.priceList.rules.length > 0) {
          this.priceList.rules.forEach((rule) => {
            if (rule) {
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make &&
                movementOfArticle.make &&
                rule.category._id === movementOfArticle.category._id &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.priceList.percentage);
              }
              if (
                rule.make &&
                movementOfArticle.make &&
                rule.category == null &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.priceList.percentage);
              }
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make == null &&
                rule.category._id === movementOfArticle.category._id
              ) {
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
          this.priceList.exceptions.forEach((exception) => {
            if (exception) {
              if (exception.article._id === movementOfArticle.article._id) {
                increasePrice = this.roundNumber.transform(exception.percentage);
              }
            }
          });
        }

        if (increasePrice != 0) {
          movementOfArticle.unitPrice = this.roundNumber.transform(
            (movementOfArticle.unitPrice * 100) / (100 + increasePrice)
          );
        }
      }

      if (
        movementOfArticle.article &&
        this.newPriceList &&
        this.database !== 'sangenemi' &&
        this.database !== 'globalstore'
      ) {
        let increasePrice = 0;

        if (this.newPriceList.allowSpecialRules && this.newPriceList.rules && this.newPriceList.rules.length > 0) {
          this.newPriceList.rules.forEach((rule) => {
            if (rule) {
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make &&
                movementOfArticle.make &&
                rule.category._id === movementOfArticle.category._id &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.newPriceList.percentage);
              }
              if (
                rule.make &&
                movementOfArticle.make &&
                rule.category == null &&
                rule.make._id === movementOfArticle.make._id
              ) {
                increasePrice = this.roundNumber.transform(rule.percentage + this.newPriceList.percentage);
              }
              if (
                rule.category &&
                movementOfArticle.category &&
                rule.make == null &&
                rule.category._id === movementOfArticle.category._id
              ) {
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
          this.newPriceList.exceptions.forEach((exception) => {
            if (exception) {
              if (exception.article._id === movementOfArticle.article._id) {
                increasePrice = this.roundNumber.transform(exception.percentage);
              }
            }
          });
        }

        if (increasePrice != 0) {
          movementOfArticle.unitPrice = this.roundNumber.transform(
            movementOfArticle.unitPrice + (movementOfArticle.unitPrice * increasePrice) / 100
          );
        }
      }

      movementOfArticle.transactionDiscountAmount = this.roundNumber.transform(
        (movementOfArticle.unitPrice * this.transaction.discountPercent) / 100,
        6
      );
      movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.transactionDiscountAmount);
      movementOfArticle.unitPrice -= this.roundNumber.transform(movementOfArticle.discountAmount);

      //logic for sangenemi quiere que se updatee por lista de precios esto lo vamos a mejorar y agregar una funcion en apiv2
      if ((this.database === 'sangenemi' || this.database === 'globalstore') && (this.priceList || this.newPriceList)) {
        const priceListToUse = this.newPriceList ?? this.priceList;
        let markupPrice = this.getIncreasePercentage(priceListToUse, movementOfArticle);
        if (markupPrice) {
          movementOfArticle.unitPrice -= movementOfArticle.markupPrice;
          let aux = (movementOfArticle.unitPrice * markupPrice) / 100;
          movementOfArticle.unitPrice = movementOfArticle.unitPrice + aux;
        }
      }

      movementOfArticle.salePrice = this.roundNumber.transform(movementOfArticle.unitPrice * movementOfArticle.amount);
      movementOfArticle.markupPrice = this.roundNumber.transform(
        movementOfArticle.salePrice - movementOfArticle.costPrice
      );
      movementOfArticle.markupPercentage = this.roundNumber.transform(
        (movementOfArticle.markupPrice / movementOfArticle.costPrice) * 100,
        3
      );

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
              tax.taxBase = this.roundNumber.transform(
                (movementOfArticle.salePrice - impInt) / (tax.percentage / 100 + 1),
                4
              );
            }
            if (taxAux.percentage === 0) {
              for (let artTax of movementOfArticle.article.taxes) {
                if (artTax.tax._id === tax.tax._id) {
                  tax.taxAmount = this.roundNumber.transform(artTax.taxAmount * movementOfArticle.amount, 4);
                }
              }
            } else {
              tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage) / 100, 4);
            }
            taxes.push(tax);
          }
        }
        movementOfArticle.taxes = taxes;
      }
      this.loading = false;
      //guardamos la lista con la que se calculo el precio

      if (this.transaction.company && this.transaction.company.priceList) {
        this.transaction.priceList = this.transaction.company.priceList;
      }

      resolve(movementOfArticle);
    });
  }

  getMovementOfArticleByArticle(articleId: string): MovementOfArticle {
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

  updateMovementOfArticle(movementOfArticle: MovementOfArticle): Promise<MovementOfArticle> {
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
        (result) => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            reject(result.message);
          } else {
            this.containerMovementsOfArticles.nativeElement.scrollTop =
              this.containerMovementsOfArticles.nativeElement.scrollHeight;
            resolve(result.movementOfArticle);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          reject(error);
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

    if (!discountPercent && this.transaction.discountPercent === 0) {
      if (
        this.transaction.company &&
        this.transaction.company.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.discount;
      if (
        this.transaction.company &&
        this.transaction.company.group &&
        this.transaction.company.group.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.group.discount;
    }

    if (discountPercent !== undefined) {
      this.transaction.discountPercent = this.roundNumber.transform(discountPercent, 6);
      if (
        this.transaction.company &&
        this.transaction.company.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.discount;
      if (
        this.transaction.company &&
        this.transaction.company.group &&
        this.transaction.company.group.discount > 0 &&
        this.transaction.type.allowCompanyDiscount
      )
        this.transaction.discountPercent += this.transaction.company.group.discount;
    }

    let isUpdateValid: boolean = true;

    if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
      for (let movementOfArticle of this.movementsOfArticles) {
        // BORRAMOS TAXES ID PARA COMPARAR
        for (let taxes of movementOfArticle.taxes) {
          delete taxes._id;
        }
        let oldMovementOfArticle: {} = {};

        oldMovementOfArticle = Object.assign(oldMovementOfArticle, movementOfArticle);
        if (!movementOfArticle.movementParent || (movementOfArticle.movementParent && movementOfArticle.isOptional)) {
          this.transaction.discountPercent = this.roundNumber.transform(this.transaction.discountPercent, 6);
          if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
            movementOfArticle = await this.recalculateSalePrice(movementOfArticle);
          } else {
            movementOfArticle = this.recalculateCostPrice(movementOfArticle);
          }
          totalPriceAux += this.roundNumber.transform(movementOfArticle.salePrice);
          discountAmountAux += this.roundNumber.transform(
            movementOfArticle.transactionDiscountAmount * movementOfArticle.amount,
            6
          );
          // COMPARAMOS JSON -- SI CAMBIO ACTUALIZAMOS
          if (
            this._jsonDiffPipe.transform(oldMovementOfArticle, movementOfArticle) ||
            (oldMovementOfArticle['taxes'] &&
              oldMovementOfArticle['taxes'].length > 0 &&
              movementOfArticle['taxes'] &&
              movementOfArticle['taxes'].length > 0 &&
              oldMovementOfArticle['taxes'][0].taxAmount !== movementOfArticle['taxes'][0].taxAmount)
          ) {
            try {
              let result = await this.updateMovementOfArticle(movementOfArticle);

              if (!result) {
                isUpdateValid = false;
                break;
              }
            } catch (error) {
              isUpdateValid = false;
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
        await this.updateTransaction().then(async (transaction) => {
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
        });
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

    await this.updateTransaction().then(async (transaction) => {
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
    });
  }

  async validateElectronicTransactionAR() {
    this.showMessage('Validando comprobante con AFIP...', 'info', false);
    this.loading = true;
    this.transaction.type.defectEmailTemplate = null;

    this.canceledTransactions =
      this.canceledTransactions && this.canceledTransactions.typeId && this.canceledTransactions.typeId != ''
        ? this.canceledTransactions
        : null;
    this._transactionService.validateElectronicTransactionAR(this.transaction, this.canceledTransactions).subscribe(
      (result: ApiResponse) => {
        if (result.status === 200) {
          let transactionResponse: Transaction = result.result;

          this.transaction.CAE = transactionResponse.CAE;
          this.transaction.CAEExpirationDate = transactionResponse.CAEExpirationDate;
          this.transaction.number = transactionResponse.number;
          this.transaction.state = transactionResponse.state;
          this.finish();
        } else this._toastService.showToast(result);
      },
      (error) => {
        this._toastService.showToast(error);
      }
    );
  }

  updateMovementsOfArticlesByWhere(where: {}, set: {}, sort: {}): Promise<MovementOfArticle> {
    return new Promise<MovementOfArticle>((resolve, reject) => {
      this.loading = true;

      this._movementOfArticleService.updateMovementsOfArticlesByWhere(where, set, sort).subscribe(
        (result) => {
          this.loading = false;
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.movementOfArticle);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  validateElectronicTransactionMX(): void {
    this.showMessage('Validando comprobante con SAT...', 'info', false);

    this._transactionService
      .validateElectronicTransactionMX(this.transaction, this.movementsOfArticles, this.movementsOfCashes)
      .subscribe(
        (result) => {
          if (result.status === 'err') {
            let msn = '';

            if (result.code && result.code !== '') {
              msn += 'ERROR ' + result.code + ': ';
            }
            if (result.message && result.message !== '') {
              msn += result.message + '. ';
            }
            if (msn === '') {
              msn = 'Ha ocurrido un error al intentar validar la factura. Comuníquese con Soporte Técnico.';
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
                priceList: this.transaction.priceList,
              },
              config: {
                companyIdentificationValue: this.config['companyIdentificationValue'],
                vatCondition: this.config['companyVatCondition'].code,
                database: this.config['database'],
              },
            };
          } else {
            if (this.transaction.type.finishState) {
              this.transaction.state = this.transaction.type.finishState;
            } else {
              this.transaction.state = TransactionState.Closed;
            }
            this.transaction.stringSAT = result.stringSAT;
            this.transaction.CFDStamp = result.CFDStamp;
            this.transaction.SATStamp = result.SATStamp;
            this.transaction.endDate = result.endDate;
            this.transaction.UUID = result.UUID;
            this.finish();
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage('Ha ocurrido un error en el servidor. Comuníquese con Soporte.', 'danger', false);
          this.loading = false;
        }
      );
  }

  async openModal(op: string, movementOfArticle?: MovementOfArticle, fastPayment?: PaymentMethod) {
    this.fastPayment = fastPayment;

    let modalRef;

    switch (op) {
      case 'current-account':
        if (this.transaction.company && this.transaction.company._id) {
          window.open(
            `/#/admin/cuentas-corrientes?companyId=${this.transaction.company._id}&companyType=${this.transaction.company.type}`,
            '_blank'
          );
        }
        break;
      case 'add-article':
        modalRef = this._modalService.open(ArticleComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          articleId: null,
          operation: 'add',
        };
        break;
      case 'list-cancellations':
        modalRef = this._modalService.open(MovementOfCancellationComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionDestinationId = this.transaction._id;
        modalRef.componentInstance.selectionView = true;
        modalRef.result.then(async (result) => {
          if (result) {
            this.movementsOfCancellations = result.movementsOfCancellations;
          }
          if (this.movementsOfCancellations && this.movementsOfCancellations.length > 0) {
            this.showButtonCancelation = false;
            await this.daleteMovementsOfCancellations('{"transactionDestination":"' + this.transaction._id + '"}').then(
              async (movementsOfCancellations) => {
                if (movementsOfCancellations) {
                  await this.saveMovementsOfCancellations(this.movementsOfCancellations).then(
                    (movementsOfCancellations) => {
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
        });
        break;

      case 'movement_of_article':
        const movementOfArticleCollection = this.user?.permission?.collections?.movementsOfArticles;

        if (movementOfArticleCollection && movementOfArticleCollection.edit === false) {
          this._toastService.showToast({ message: 'No tiene permisos para editar artículos.', type: 'danger' });
          return;
        }

        movementOfArticle.transaction = this.transaction;
        movementOfArticle.modifyStock = this.transaction.type.modifyStock;
        movementOfArticle.stockMovement = this.transaction.type.stockMovement;
        modalRef = this._modalService.open(AddMovementOfArticleComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.movementOfArticle = movementOfArticle;
        modalRef.componentInstance.transaction = this.transaction;
        modalRef.result.then(
          (result) => {
            this.focusEvent.emit(true);
            this.getMovementsOfTransaction();
          },
          (reason) => {
            this.focusEvent.emit(true);
            this.getMovementsOfTransaction();
          }
        );
        break;
      case 'apply_discount':
        const user: User = await this.getUser();

        if (user.permission.allowDiscount === false) {
          this._toastService.showToast({
            type: 'danger',
            message: 'No tiene permisos para aplicar descuento.',
          });
          return;
        }

        if (this.movementsOfArticles && this.movementsOfArticles.length > 0) {
          modalRef = this._modalService.open(ApplyDiscountComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.totalPrice = this.transaction.totalPrice;
          modalRef.componentInstance.amountToApply = this.transaction.discountAmount;
          modalRef.componentInstance.percentageToApply = this.transaction.discountPercent;
          modalRef.componentInstance.percentageToApplyCompany =
            this.transaction.company &&
            this.transaction.company.discount > 0 &&
            this.transaction.type.allowCompanyDiscount
              ? this.transaction.company.discount
              : 0;
          modalRef.componentInstance.percentageToApplyCompanyGroup =
            this.transaction.company &&
            this.transaction.company.group &&
            this.transaction.company.group.discount > 0 &&
            this.transaction.type.allowCompanyDiscount
              ? this.transaction.company.group.discount
              : 0;
          modalRef.result.then((result) => {
            if (result.discount) {
              this.updatePrices(result.discount.percentageToApply);
            }
          });
        } else {
          this.showMessage('No se ingresaron productos a la transacción.', 'info', true);
        }
        break;
      case 'cancel':
        modalRef = this._modalService.open(DeleteTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then(async (result) => {
          if (result === 'delete_close') {
            if (this.posType === 'resto' && this.transaction.table) {
              this.transaction.table.employee = null;
              this.transaction.table.state = TableState.Available;
              await this.updateTable(this.transaction.table).then((table) => {
                if (table) {
                  this.transaction.table = table;
                  this.backFinal();
                }
              });
            } else {
              this.backFinal();
            }
          }
        });

        break;
      case 'add_client':
        modalRef = this._modalService.open(SelectCompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
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
              this.priceList = undefined;
              this.newPriceList = await this.getPriceList(result.company.priceList._id);
            }

            if (this.transaction.company && this.transaction.company.priceList && result.company.priceList) {
              this.priceList = await this.getPriceList(this.transaction.company.priceList._id);
              this.newPriceList = await this.getPriceList(result.company.priceList._id);
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
        });
        break;
      case 'charge':
        this.typeOfOperationToPrint = 'charge';

        const users: User = await this.getUser();
        if (users.permission.allowPayment === false) {
          this._toastService.showToast({
            type: 'danger',
            message: 'No tiene permisos para hacer esta operación.',
          });
          return;
        }
        if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
          this.transaction = await this.assignLetter();
        }

        if ((await this.isValidCharge()) && (await this.areValidMovementOfArticle())) {
          if (this.transaction.type.requestPaymentMethods || fastPayment) {
            modalRef = this._modalService.open(AddMovementOfCashComponent, {
              size: 'lg',
              backdrop: 'static',
            });
            modalRef.componentInstance.transaction = this.transaction;
            if (fastPayment) {
              modalRef.componentInstance.fastPayment = fastPayment;
            }
            modalRef.result.then((result) => {
              if (result != 'cancel') {
                this.movementsOfCashes = result.movementsOfCashes;

                if (this.movementsOfCashes) {
                  this.transaction = result.transaction;

                  if (result.movementOfArticle) {
                    this.movementsOfArticles.push(result.movementOfArticle);
                  }

                  if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
                    if (this.transaction.type.fixedOrigin && this.transaction.type.fixedOrigin !== 0) {
                      this.transaction.origin = this.transaction.type.fixedOrigin;
                    }

                    if (this.transaction.type.electronics) {
                      if (this.config['country'] === 'MX') {
                        if (!this.transaction.CFDStamp && !this.transaction.SATStamp && !this.transaction.stringSAT) {
                          this.validateElectronicTransactionMX();
                        } else {
                          this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
                        }
                      } else if (this.config['country'] === 'AR') {
                        if (!this.transaction.CAE) {
                          this.validateElectronicTransactionAR();
                        } else {
                          this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
                        }
                      } else {
                        this.showMessage('Facturación electrónica no esta habilitada para tu país.', 'info', true);
                      }
                    } else if (this.transaction.type.electronics && this.transaction.CAE) {
                      this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
                    } else {
                      if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                        this.assignTransactionNumber();
                      } else {
                        this.close('charge');
                      }
                    }
                  } else {
                    this.close('charge');
                  }
                }
              } else {
                this.voucherArticlesToPrint = [];
              }
            });
          } else {
            if (this.transaction.type.transactionMovement === TransactionMovement.Sale) {
              this.transaction = await this.assignLetter();
              if (this.transaction.type.electronics && !this.transaction.CAE) {
                this.validateElectronicTransactionAR();
              } else if (this.transaction.type.electronics && this.transaction.CAE) {
                this.close('charge'); //SE FINALIZA POR ERROR EN LA FE
              } else {
                if (this.transaction.type.fixedLetter !== this.transaction.letter) {
                  this.assignTransactionNumber();
                } else {
                  this.close('charge');
                }
              }
            } else {
              this.close('charge');
            }
          }
        }
        break;
      case 'cancelation-type-automatic':
        modalRef = this._modalService.open(CancellationTypeAutomaticComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.result.then(
          (result) => {
            if (result && result.transaction) {
              this.isCancellationAutomatic = true;
              this.initVariables();
              this.transactionId = result.transaction._id;
              this.initComponent();
            } else {
              if (this.transaction && this.transaction.type.printable) {
                this.print();
                if (this.transaction && this.transaction.type.requestEmailTemplate) this.openModal('send-email');
              } else {
                this.backFinal();
              }
            }
          },
          (reason) => {
            if (this.transaction && this.transaction.type.printable) {
              this.print();
              if (this.transaction && this.transaction.type.requestEmailTemplate) this.openModal('send-email');
            } else {
              this.backFinal();
            }
          }
        );
        break;
      case 'printers':
        await this.getPrinters().then((printers) => {
          if (printers) {
            this.printers = printers;
          }
        });

        if (this.countPrinters() > 1) {
          modalRef = this._modalService
            .open(this.contentPrinters, {
              size: 'lg',
              backdrop: 'static',
            })
            .result.then((result) => {
              if (result !== 'cancel' && result !== '') {
                this.distributeImpressions(result);
              }
            });
        } else if (this.countPrinters() === 1) {
          this.distributeImpressions(this.printersAux[0]);
        } else {
          this.backFinal();
        }
        break;
      case 'change-optional-afip':
        modalRef = this._modalService.open(this.contentChangeOptionalAFIP).result.then(async (result) => {
          if (result !== 'cancel' && result !== '') {
            this.transaction.optionalAFIP = {
              id: this.transaction.type.optionalAFIP.id,
              value: result ? result : this.transaction.type.optionalAFIP.value,
            };

            await this.updateTransaction().then(async (transaction) => {
              if (transaction) {
                this.transaction = transaction;
                this.lastQuotation = this.transaction.quotation;
              }
            });
          }
        });
        break;
      case 'priceList':
        modalRef = this._modalService.open(SelectPriceListComponent).result.then(async (result) => {
          if (result && result.priceList) {
            if (this.transaction) {
              if (!this.transaction.priceList) {
                this.transaction.priceList = result.priceList;
                this.newPriceList = result.priceList;
              } else {
                if (!this.priceList) {
                  this.priceList = this.transaction.priceList;
                }
                this.transaction.priceList = result.priceList;
                this.newPriceList = result.priceList;
              }
              await this.updateTransaction().then(async (transaction) => {
                if (transaction) {
                  this.transaction = transaction;
                  this.updatePrices();
                }
              });
            }
          }
        });
        break;
      case 'change-information-cancellation':
        modalRef = this._modalService.open(this.contentInformCancellation).result.then(async (result) => {
          if (result !== 'cancel' && result !== '') {
            this.checkInformationCancellation();
          }
        });
        break;
      case 'change-quotation':
        modalRef = this._modalService.open(this.contentChangeQuotation).result.then(
          async (result) => {
            if (result !== 'cancel' && result !== '') {
              this.updatePrices();
            } else {
              this.transaction.quotation = this.lastQuotation;
            }
          },
          (reason) => {
            this.transaction.quotation = this.lastQuotation;
          }
        );
        break;
      case 'change-taxes':
        modalRef = this._modalService.open(this.containerTaxes, {
          size: 'lg',
          backdrop: 'static',
        });
        break;
      case 'change-employee':
        modalRef = this._modalService.open(SelectEmployeeComponent);
        modalRef.componentInstance.requireLogin = false;
        modalRef.componentInstance.typeEmployee = this.transaction.type.requestEmployee;
        modalRef.componentInstance.op = 'change-employee';
        modalRef.result.then(async (result) => {
          if (result) {
            if (result.employee) {
              this.transaction.employeeClosing = result.employee;
            }
            await this.updateTransaction().then(async (transaction) => {
              if (transaction) {
                this.transaction = transaction;
                if (this.transaction.table) {
                  this.transaction.table.employee = result.employee;
                  await this.updateTable(this.transaction.table).then((table) => {
                    if (table) {
                      this.transaction.table = table;
                    }
                  });
                }
              }
            });
          }
        });
        break;
      case 'print':
        if (this.transaction.type.readLayout) {
          modalRef = this._modalService.open(PrintTransactionTypeComponent);
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.result.then(() => {
            this.backFinal();
          });
        } else {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.transactionId = this.transaction._id;
          modalRef.componentInstance.company = this.transaction.company;
          modalRef.componentInstance.printer = this.printerSelected;
          modalRef.componentInstance.typePrint = 'invoice';
          modalRef.result
            .then(() => {
              this.backFinal();
            })
            .catch((e) => {
              this.backFinal();
            });
        }

        break;
      case 'printKitchen':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.kitchenArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'kitchen';

        modalRef.result
          .then(() => {
            this.updateMovementOfArticlePrintedKitchen();
          })
          .catch((e) => {
            this.updateMovementOfArticlePrintedKitchen();
          });
        break;
      case 'printBar':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.barArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'bar';

        modalRef.result
          .then(() => {
            this.updateMovementOfArticlePrintedBar();
          })
          .catch((e) => {
            this.updateMovementOfArticlePrintedBar();
          });
        break;
      case 'printVoucher':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = this.transaction._id;
        modalRef.componentInstance.movementsOfArticles = this.voucherArticlesToPrint;
        modalRef.componentInstance.printer = this.printerSelected;
        modalRef.componentInstance.typePrint = 'voucher';

        modalRef.result
          .then(() => {
            this.updateMovementOfArticlePrintedVoucher();
          })
          .catch((e) => {
            this.updateMovementOfArticlePrintedVoucher();
          });
        break;
      case 'change-shipment-method':
        if (this.transaction.company) {
          modalRef = this._modalService.open(SelectShipmentMethodComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.company = this.transaction.company;
          modalRef.result.then(async (result) => {
            if (result && result.shipmentMethod) {
              this.transaction.shipmentMethod = result.shipmentMethod;
              this.transaction.deliveryAddress = result.address;
              await this.updateTransaction().then(async (transaction) => {
                if (transaction) {
                  this.transaction = transaction;
                  this.lastQuotation = this.transaction.quotation;
                }
              });
            }
          });
        } else {
          this._toastService.showToast(null, 'info', 'Debe seleccionar una empresa.');
        }
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
            await this.updateTable(this.transaction.table);
            this.transaction.table = result.table;
            this.transaction.table.state = TableState.Busy;
            await this.updateTable(this.transaction.table);
            await this.updateTransaction().then(async (transaction) => {
              if (transaction) {
                this.transaction = transaction;
                this.lastQuotation = this.transaction.quotation;
                this.transaction.table.state = TableState.Busy;
              }
            });
          }
        });
        break;
      default:
    }
  }

  async updateArticlesCostPrice(): Promise<number> {
    let countArticle = 0;

    for (const mov of this.movementsOfArticles) {
      try {
        if (mov && mov.article && mov.article._id) {
          let unitPrice: number = 0;

          if (this.transaction.quotation > 1) {
            unitPrice = this.roundNumber.transform(mov.basePrice / mov.amount / this.transaction.quotation);
          } else {
            unitPrice = this.roundNumber.transform(mov.basePrice / mov.amount);
          }

          unitPrice = this.roundNumber.transform(unitPrice + mov.transactionDiscountAmount);

          if (unitPrice !== mov.article.basePrice) {
            const updated = await this.updateArticleCostPrice(mov.article, unitPrice);
            if (updated) {
              countArticle++;
            }
          }
        }
      } catch (error) {
        console.error(`Error actualizando precio de costo para el artículo con ID ${mov?.article?._id}:`, error);
        // Continúa con el siguiente artículo
      }
    }

    return countArticle;
  }

  async updateArticleCostPrice(article: Article, basePrice: number): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        if (basePrice && article) {
          let taxedAmount = 0;

          article.costPrice = 0;
          article.basePrice = basePrice;
          taxedAmount = basePrice;

          if (article.otherFields && article.otherFields.length > 0) {
            for (const field of article.otherFields) {
              if (field.articleField.datatype === ArticleFieldType.Percentage) {
                field.amount = this.roundNumber.transform((basePrice * parseFloat(field.value)) / 100);
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
                articleTax.taxAmount = this.roundNumber.transform((taxedAmount * articleTax.percentage) / 100);
              }
              article.costPrice += articleTax.taxAmount;
            }
          }
          article.costPrice += taxedAmount;

          if (!(taxedAmount === 0 && article.salePrice !== 0)) {
            article.markupPrice = this.roundNumber.transform((article.costPrice * article.markupPercentage) / 100);
            article.salePrice = article.costPrice + article.markupPrice;
          }

          await this._articleService
            .updateArticle(article)
            .toPromise()
            .then((result) => {
              if (result && !result.article && result.message) throw new Error(result.message);
            });
        }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async isValidCharge(): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        if (this.movementsOfArticles && this.movementsOfArticles.length <= 0)
          throw new Error('No existen productos en la transacción');

        await this.areValidMovementOfArticle();

        if (this.transaction.type.transactionMovement === TransactionMovement.Purchase && !this.transaction.company)
          throw new Error(`Debe seleccionar un proveedor para la transacción`);

        if (
          this.transaction.type.transactionMovement === TransactionMovement.Sale &&
          !this.transaction.company &&
          this.transaction.type.requestCompany
        )
          throw new Error(`Debe seleccionar un cliente para la transacción`);

        if (
          this.transaction.type.electronics &&
          this.transaction.totalPrice >= 26228 &&
          !this.transaction.company &&
          this.config['country'] === 'AR'
        )
          throw new Error(`Debe indentificar al cliente para transacciones electrónicos con monto mayor a $5.000,00`);

        if (
          this.transaction.type.electronics &&
          this.transaction.company &&
          (!this.transaction.company.identificationType ||
            !this.transaction.company.identificationValue ||
            this.transaction.company.identificationValue === '')
        )
          throw new Error(`El cliente ingresado no tiene número de identificación`);

        if (
          this.transaction.type.fixedOrigin &&
          this.transaction.type.fixedOrigin === 0 &&
          this.transaction.type.electronics &&
          this.config['country'] === 'MX'
        )
          throw new Error(
            `Debe configurar un punto de venta para transacciones electrónicos. Lo puede hacer en /Configuración/Tipos de Transacción`
          );

        resolve(true);
      } catch (error) {
        this._toastService.showToast(error);
        resolve(false);
      }
    });
  }

  getPrinters(): Promise<Printer[]> {
    return new Promise<Printer[]>(async (resolve) => {
      this.loading = true;

      this._printerService.getPrinters().subscribe(
        (result) => {
          this.loading = false;
          if (!result.printers) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  async areValidMovementOfArticle(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      try {
        let isValid: boolean = true;

        for (let movementOfArticle of this.movementsOfArticles) {
          if (isValid) isValid = await this.isValidMovementOfArticle(movementOfArticle);
        }
        resolve(isValid);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async updateArticleTiendaNube(idArticle: string) {
    return new Promise<boolean>(async (resolve) => {
      this._articleService.updateArticleTiendaNube(idArticle).subscribe(
        (result) => {
          if (result.error) {
            this._toastService.showToast({
              type: 'info',
              message:
                result.error && result.error.message ? result.error.message : result.message ? result.message : '',
            });
          } else {
            this._toastService.showToast({
              type: 'success',
              message: 'Producto actualizado con éxito en TiendaNube',
            });
          }
          resolve(true);
        },
        (error) => {
          resolve(true);
          this._toastService.showToast(error);
        }
      );
    });
  }

  getVariantsByArticleChild(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loading = true;
      let query = 'where="articleChild":"' + id + '"';

      this._variantService.getVariants(query).subscribe(
        (result) => {
          if (!result.variants) {
            resolve(null);
          } else {
            resolve(result.variants);
          }
          this.loading = false;
        },
        (error) => {
          console.error('Error al obtener variantes:', error);
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
          reject(error);
        }
      );
    });
  }

  async finish() {
    try {
      this.loading = true;

      if (!this.movementsOfArticles || this.movementsOfArticles.length === 0)
        throw new Error('No se encontraron productos en la transacción');

      // ACTUALIZACIÓN DE PRECIOS DE COSTOS
      if (this.transaction.type.updatePrice === PriceType.Base) {
        let count = await this.updateArticlesCostPrice();
        if (count === 1) {
          this._toastService.showToast({
            type: 'info',
            message: 'Se actualizó : 1 producto',
          });
        } else {
          if (count > 1) {
            this._toastService.showToast({
              type: 'info',
              message: 'Se actualizaron : ' + count + ' productos',
            });
          }
        }
      }
      // ACTUALIZACIÓN DE A PREPARAR SI APARECE EN COCINA LOS ARTICULOS
      if (this.transaction.type.posKitchen) {
        await this.changeArticlesStatusToPending();
      }
      // ACTUALIZACIÓN DE STOCK
      if (this.config['modules'].stock && this.transaction.type.modifyStock) {
        if (await this.areValidMovementOfArticle()) await this.updateStockByTransaction();
      }

      // ACTUALIZACION DE ORDENES DE PRODUCCION
      // esto es solo para actualizar el estado de la orden cuando todos los movimientos de articulos fueron leidos
      if (this.transaction.type.transactionMovement === TransactionMovement.Production) {
        await this.updateOrdenOfProduction(this.transaction._id);
      }

      let result: ApiResponse = await this._transactionService.updateBalance(this.transaction).toPromise();
      if (result.status !== 200) throw result;
      this.transaction.balance = result.result.balance;

      if (!this.transaction.endDate) {
        this.transaction.endDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
      }
      if (this.transaction.type.transactionMovement !== TransactionMovement.Purchase || !this.transaction.VATPeriod) {
        this.transaction.VATPeriod = moment(this.transaction.endDate, 'YYYY-MM-DDTHH:mm:ssZ').format('YYYYMM');
      }
      this.transaction.expirationDate = this.transaction.endDate;
      if (this.transaction.type.finishState) {
        this.transaction.state = this.transaction.type.finishState;
      } else {
        this.transaction.state = TransactionState.Closed;
      }
      this.transaction = await this.updateTransaction();

      // GUARDAMOS LA FECHA DE TRANSACCION EN LOS MOV DE ARTICULOS.
      await this.updateMovementsOfArticlesByWhere(
        {
          transaction: this.transaction._id,
          operationType: { $ne: 'D' },
        },
        {
          transactionEndDate: this.transaction.endDate,
        },
        {}
      );

      if (this.transaction.table) {
        let table: Table = await this.getTable(
          this.transaction.table._id ? this.transaction.table._id : this.transaction.table.toString()
        );

        if (this.transaction.type.finishCharge) {
          table.employee = null;
          table.state = TableState.Available;
        } else {
          table.state = TableState.Pending;
        }
        this.transaction.table = await this.updateTable(table);
      }

      if (this.transaction.type.allowAccounting)
        this._accountSeatService.addAccountSeatByTransaction(this.transaction._id);

      let cancellationTypesAutomatic = await this.getCancellationTypesAutomatic();

      if (!cancellationTypesAutomatic || cancellationTypesAutomatic.length == 0) {
        if (this.transaction && this.transaction.type.printable) {
          this.print();
        } else {
          this.backFinal();
        }
      } else {
        this.openModal('cancelation-type-automatic');
      }
      if (
        this.transaction.type.requestArticles &&
        this.transaction.type.modifyStock &&
        this.config.tiendaNube !== undefined &&
        this.config.tiendaNube.userID &&
        this.config.tiendaNube.userID !== '' &&
        this.movementsOfArticles.length > 0
      ) {
        let articlesForUpdate = [];

        for (let movement of this.movementsOfArticles) {
          if (movement.article.tiendaNubeId) {
            if (movement.article.type === Type.Final) {
              await this.updateArticleTiendaNube(movement.article._id);
            }
            if (movement.article.type === Type.Variant) {
              const result = await this.getVariantsByArticleChild(movement.article._id);

              if (result && result.length > 0) {
                if (!articlesForUpdate.includes(result[0].articleParent._id)) {
                  articlesForUpdate.push(result[0].articleParent._id);
                }
              }
            }
          }
        }
        if (articlesForUpdate.length > 0) {
          for (let articleId of articlesForUpdate) {
            await this.updateArticleTiendaNube(articleId);
          }
        }
      }

      this.loading = false;
    } catch (error) {
      this._toastService.showToast(error);
    }
  }

  async updateArticlesTiendaNube(tiendaNubeIds: string[]) {
    this.loading = true;

    this._articleService.updateArticlesTiendaNube(tiendaNubeIds).subscribe(
      (result) => {
        if (result.error) {
          this._toastService.showToast({
            type: 'info',
            message: result.error && result.error.message ? result.error.message : result.message ? result.message : '',
          });
        } else {
          this._toastService.showToast({
            type: 'success',
            message: 'Operación realizada con éxito en TiendaNube',
          });
          this.activeModal.close();
        }
      },
      (error) => this._toastService.showToast(error)
    );
  }

  async changeArticlesStatusToPending(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
      try {
        for (let mov of this.movementsOfArticles)
          if (mov.article.posKitchen) {
            mov.status = MovementOfArticleStatus.Pending;
            await this.updateMovementOfArticle(mov);
          }
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async print() {
    // if (environment.production) {
    //   // old code
    //   await this.getPrinters().then((printers) => {
    //     if (printers) {
    //       this.printers = printers;
    //     }
    //   });

    //   if (this.transaction.type.defectPrinter) {
    //     this.printerSelected = this.transaction.type.defectPrinter;
    //     this.typeOfOperationToPrint = 'charge';
    //     this.distributeImpressions(this.transaction.type.defectPrinter);
    //   } else {
    //     this.openModal('printers');
    //   }
    // } else {
    const modalRef = this._modalService.open(FinishTransactionDialogComponent, {
      size: 'md',
      backdrop: 'static',
    });
    modalRef.componentInstance.transaction = this.transaction;

    try {
      await modalRef.result;
    } catch (e) {
      // Si se cierra el modal sin seleccionar opción, también continuar
    }
    this.backFinal();
    // }
  }

  updateStockByTransaction(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.loading = true;
      this._articleStockService.updateStockByTransaction(this.transaction).subscribe(
        (result) => {
          this.loading = false;
          if (result.status === 200) {
            resolve(true);
            this._toastService.showToast(result);
          } else {
            this._toastService.showToast(result);
            resolve(false);
          }
        },
        (error) => {
          this.loading = false;
          this._toastService.showToast(error);
          resolve(false);
        }
      );
    });
  }

  getCancellationTypesAutomatic(): Promise<CancellationType[]> {
    return new Promise<CancellationType[]>((resolve) => {
      this.loading = true;

      this._cancellationTypeService
        .getCancellationTypes(
          {
            'origin._id': 1,
            'origin.operationType': 1,
            'destination._id': 1,
            'destination.name': 1,
            'destination.operationType': 1,
            operationType: 1,
            requestAutomatic: 1,
          }, // PROJECT
          {
            'origin._id': { $oid: this.transaction.type._id },
            requestAutomatic: true,
            operationType: { $ne: 'D' },
            'destination.operationType': { $ne: 'D' },
            'origin.operationType': { $ne: 'D' },
          }, // MATCH
          {}, // SORT
          {}, // GROUP
          0, // LIMIT
          0 // SKIP
        )
        .subscribe(
          (result) => {
            this.loading = false;
            if (result && result.cancellationTypes && result.cancellationTypes.length > 0) {
              resolve(result.cancellationTypes);
            } else {
              resolve(null);
            }
          },
          (error) => {
            this.loading = false;
            this.showMessage(error._body, 'danger', false);
            resolve(null);
          }
        );
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
          if (
            movementOfArticle.article &&
            movementOfArticle.article.printIn === ArticlePrintIn.Bar &&
            movementOfArticle.printed < movementOfArticle.amount
          ) {
            this.barArticlesToPrint.push(movementOfArticle);
          }
          if (
            movementOfArticle.article &&
            movementOfArticle.article.printIn === ArticlePrintIn.Kitchen &&
            movementOfArticle.printed < movementOfArticle.amount
          ) {
            this.kitchenArticlesToPrint.push(movementOfArticle);
          }
          if (
            movementOfArticle.article &&
            movementOfArticle.article.printIn === ArticlePrintIn.Voucher &&
            movementOfArticle.printed < movementOfArticle.amount
          ) {
            this.voucherArticlesToPrint.push(movementOfArticle);
          }
        }
      }
    }

    if (this.barArticlesToPrint && this.barArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = 'bar';
      this.distributeImpressions();
    } else if (this.kitchenArticlesToPrint && this.kitchenArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = 'kitchen';
      this.distributeImpressions();
    } else if (this.voucherArticlesToPrint && this.voucherArticlesToPrint.length !== 0) {
      this.typeOfOperationToPrint = 'voucher';
      this.distributeImpressions();
    } else {
      if (this.isCharge) {
        this.finish();
      } else {
        this.backFinal();
      }
    }
  }

  backFinal(): void {
    this._route.queryParams.subscribe((params) => {
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
    let rtn = sourceURL.split('?')[0],
      param,
      params_arr = [],
      queryString = sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';

    if (queryString !== '') {
      params_arr = queryString.split('&');
      for (let i = params_arr.length - 1; i >= 0; i -= 1) {
        param = params_arr[i].split('=')[0];
        if (param === key) {
          params_arr.splice(i, 1);
        }
      }
      rtn = rtn + '?' + params_arr.join('&');
    }

    return rtn;
  }

  getTable(tableId: string): Promise<Table> {
    return new Promise<Table>((resolve) => {
      this.loading = true;
      this._tableService.getTable(tableId).subscribe(
        (result) => {
          this.loading = false;
          if (!result.table) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            resolve(null);
          } else {
            this.hideMessage();
            resolve(result.table);
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
          resolve(null);
        }
      );
    });
  }

  async getTaxVAT(movementOfArticle: MovementOfArticle) {
    this.loading = true;

    let taxes: Taxes[] = new Array();
    let tax: Taxes = new Taxes();

    tax.percentage = 21.0;
    tax.taxBase = this.roundNumber.transform(movementOfArticle.salePrice / (tax.percentage / 100 + 1));
    tax.taxAmount = this.roundNumber.transform((tax.taxBase * tax.percentage) / 100);

    this._taxService.getTaxes('where="name":"IVA"').subscribe(
      async (result) => {
        this.loading = false;
        if (!result.taxes) {
          this.showMessage('Debe configurar el impuesto IVA para el realizar el recargo de la tarjeta', 'info', true);
        } else {
          this.hideMessage();
          tax.tax = result.taxes[0];
          taxes.push(tax);
          movementOfArticle.taxes = taxes;
          await this.saveMovementOfArticle(movementOfArticle).then((movementOfArticle) => {
            if (movementOfArticle) {
              this.focusEvent.emit(true);
              this.getMovementsOfTransaction();
            }
          });
        }
      },
      (error) => {
        this.loading = false;
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  updateMovementOfArticlePrintedBar(): void {
    this.loading = true;

    this.barArticlesToPrint[this.barArticlesPrinted].printed = this.barArticlesToPrint[this.barArticlesPrinted].amount;
    this._movementOfArticleService.updateMovementOfArticle(this.barArticlesToPrint[this.barArticlesPrinted]).subscribe(
      async (result) => {
        this.loading = false;
        if (!result.movementOfArticle) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.barArticlesPrinted++;
          if (this.barArticlesPrinted < this.barArticlesToPrint.length) {
            this.updateMovementOfArticlePrintedBar();
          } else {
            if (this.kitchenArticlesToPrint.length > 0) {
              this.typeOfOperationToPrint = 'kitchen';
              this.distributeImpressions(null);
            } else if (this.voucherArticlesToPrint.length > 0) {
              this.typeOfOperationToPrint = 'voucher';
              this.distributeImpressions(null);
            } else {
              if (this.isCharge) {
                this.finish();
              } else {
                this.backFinal();
              }
            }
          }
        }
      },
      (error) => {
        this.loading = false;
        this.showMessage(error._body, 'danger', false);
      }
    );
  }

  updateMovementOfArticlePrintedKitchen(): void {
    this.loading = true;

    this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].printed =
      this.kitchenArticlesToPrint[this.kitchenArticlesPrinted].amount;
    this._movementOfArticleService
      .updateMovementOfArticle(this.kitchenArticlesToPrint[this.kitchenArticlesPrinted])
      .subscribe(
        async (result) => {
          if (!result.movementOfArticle) {
            if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          } else {
            this.kitchenArticlesPrinted++;
            if (this.kitchenArticlesPrinted < this.kitchenArticlesToPrint.length) {
              this.updateMovementOfArticlePrintedKitchen();
            } else {
              if (this.voucherArticlesToPrint.length > 0) {
                this.typeOfOperationToPrint = 'voucher';
                this.distributeImpressions(null);
              } else {
                if (this.isCharge) {
                  this.finish();
                } else {
                  this.backFinal();
                }
              }
            }
          }
          this.loading = false;
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          this.loading = false;
        }
      );
  }

  updateMovementOfArticlePrintedVoucher(): void {
    this.loading = true;

    if (
      this.voucherArticlesToPrint[this.voucherArticlesPrinted] &&
      this.voucherArticlesToPrint[this.voucherArticlesPrinted].amount
    ) {
      this.voucherArticlesToPrint[this.voucherArticlesPrinted].printed =
        this.voucherArticlesToPrint[this.voucherArticlesPrinted].amount;
      this._movementOfArticleService
        .updateMovementOfArticle(this.voucherArticlesToPrint[this.voucherArticlesPrinted])
        .subscribe(
          async (result) => {
            if (!result.movementOfArticle) {
              if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
            } else {
              this.voucherArticlesPrinted++;
              if (this.voucherArticlesPrinted < this.voucherArticlesToPrint.length) {
                this.updateMovementOfArticlePrintedVoucher();
              } else {
                if (this.isCharge) {
                  this.finish();
                } else {
                  this.backFinal();
                }
              }
            }
            this.loading = false;
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
            this.loading = false;
          }
        );
    } else {
      if (this.isCharge) {
        this.openModal('charge');
      } else {
        this.backFinal();
      }
    }
  }

  countPrinters(): number {
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

    await this.getUser().then(async (user) => {
      if (user) {
        if (user.printers && user.printers.length > 0) {
          for (const element of user.printers) {
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Bar &&
              this.typeOfOperationToPrint === 'bar'
            ) {
              this.printerSelected = element.printer;
            }
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Counter &&
              (this.typeOfOperationToPrint === 'charge' || this.typeOfOperationToPrint === 'bill')
            ) {
              this.printerSelected = element.printer;
            }
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Kitchen &&
              this.typeOfOperationToPrint === 'kitchen'
            ) {
              this.printerSelected = element.printer;
            }
            if (
              element &&
              element.printer &&
              element.printer.printIn === PrinterPrintIn.Voucher &&
              this.typeOfOperationToPrint === 'voucher'
            ) {
              this.printerSelected = element.printer;
            }
          }
        } else {
          if (!this.printerSelected) {
            await this.getPrinters().then((printers) => {
              if (printers) {
                this.printers = printers;
                for (const element of this.printers) {
                  if (element && element.printIn === PrinterPrintIn.Bar && this.typeOfOperationToPrint === 'bar') {
                    this.printerSelected = element;
                  }
                  if (
                    element &&
                    element.printIn === PrinterPrintIn.Kitchen &&
                    this.typeOfOperationToPrint === 'kitchen'
                  ) {
                    this.printerSelected = element;
                  }
                  if (
                    element &&
                    element.printIn === PrinterPrintIn.Voucher &&
                    this.typeOfOperationToPrint === 'voucher'
                  ) {
                    this.printerSelected = element;
                  }
                  if (
                    element &&
                    element.printIn === PrinterPrintIn.Counter &&
                    (this.typeOfOperationToPrint === 'charge' || this.typeOfOperationToPrint === 'bill')
                  ) {
                    this.printerSelected = element;
                  }
                }
              }
            });
          }
        }
      } else {
        this._toastService.showToast({
          type: 'info',
          message: 'Debe iniciar sesión',
        });
      }

      switch (this.typeOfOperationToPrint) {
        case 'charge':
          this.openModal('print');
          break;
        case 'kitchen':
          this.openModal('printKitchen');
          break;
        case 'bar':
          this.openModal('printBar');
          break;
        case 'voucher':
          this.openModal('printVoucher');
          break;
        default:
          this.showMessage('No se reconoce la operación de impresión.', 'danger', false);
          break;
      }
    });
  }

  getUser(): Promise<User> {
    return new Promise<User>((resolve) => {
      let identity: User = JSON.parse(sessionStorage.getItem('user'));

      if (identity) {
        this._userService.getUser(identity._id).subscribe(
          (result) => {
            if (result && result.user) {
              resolve(result.user);
            } else {
              this.showMessage('Debe volver a iniciar sesión', 'danger', false);
            }
          },
          (error) => {
            this.showMessage(error._body, 'danger', false);
          }
        );
      }
    });
  }

  async assignLetter(): Promise<Transaction> {
    if (this.transaction.type.fixedLetter && this.transaction.type.fixedLetter !== '') {
      this.transaction.letter = this.transaction.type.fixedLetter.toUpperCase();
    } else {
      if (this.config['country'] === 'AR') {
        if (
          this.config['companyVatCondition'] &&
          (this.config['companyVatCondition'].description === 'Responsable Inscripto' ||
            this.config['companyVatCondition'].description === 'Resp.Insc.')
        ) {
          if (this.transaction.company && this.transaction.company.vatCondition) {
            this.transaction.letter = this.transaction.company.vatCondition.transactionLetter;
          } else {
            this.transaction.letter = 'B';
          }
        } else if (
          this.config['companyVatCondition'] &&
          (this.config['companyVatCondition'].description === 'Monotributista' ||
            this.config['companyVatCondition'].description === 'Monotributo')
        ) {
          this.transaction.letter = 'C';
        } else {
          this.transaction.letter = 'X';
        }
      }
    }

    return this.updateTransaction();
  }

  async assignTransactionNumber() {
    try {
      let query = `where= "type":"${this.transaction.type._id}",
            "origin":${this.transaction.origin},
            "letter":"${this.transaction.letter}",
            "_id":{"$ne":"${this.transaction._id}"}
            &sort="number":-1
            &limit=1`;

      this._transactionService.getTransactions(query).subscribe(
        async (result) => {
          if (!result.transactions || result.transactions.length === 0) {
            this.transaction.number = 1;
          } else {
            this.transaction.number = result.transactions[0].number + 1;
          }
          this.transaction = await this.updateTransaction();
          this.close('charge');
        },
        (error) => {
          throw error;
        }
      );
    } catch (error) {
      this._toastService.showToast(error);
    }
  }

  checkInformationCancellation() {
    if (this.canceledTransactions && this.canceledTransactions.typeId) {
      this.loading = true;

      let query = `where= "type":"${this.canceledTransactions.typeId}","origin":${this.canceledTransactions.origin},"letter":"${this.canceledTransactions.letter}","operationType":{"$ne":"D"}`;

      if (this.transaction.company) {
        query += `,"company":"${this.transaction.company._id}"`;
      }

      query += `&limit=1`;

      this._transactionService.getTransactions(query).subscribe(
        (result) => {
          this.loading = false;
          if (!result.transactions || result.transactions.length === 0) {
            this.showMessage('Debe informar un comprobante válido', 'info', false);
          } else {
            for (let cod of result.transactions[0].type.codes) {
              if (cod.letter === this.canceledTransactions.letter) {
                this.canceledTransactions.code = cod.code;
              }
            }
          }
        },
        (error) => {
          this.loading = false;
          this.showMessage(error._body, 'danger', false);
        }
      );
    } else {
      this.showMessage('Debe informar todos los campos del comprobante a informar', 'info', true);
    }
  }

  setPrintBill(): void {
    if (this.movementsOfArticles && this.movementsOfArticles.length !== 0) {
      this.typeOfOperationToPrint = 'bill';
      this.openModal('printers');
    } else {
      this.showMessage('No existen productos en el pedido.', 'info', true);
      this.loading = false;
    }
  }

  async filterArticles() {
    this.listArticlesComponent.filterArticle = this.filterArticle;
    let article: Article = null;
    if (this.transaction.type.transactionMovement == TransactionMovement.Production && this.database !== 'ajonjoli') {
      let query = 'where="op":"' + this.filterArticle + '"';
      const mov = await this.getMovementsOfArticles(query);

      //validate read
      if (mov.length === 0 || mov[0].read >= mov[0].amount) {
        this._toastService.showToast({
          type: 'info',
          message: `El producto ya fue cerrado`,
        });
        return;
      }

      if (mov?.[0]?.article) {
        article = mov[0].article;
        this.listArticlesComponent.movementOfArticleOrigin = mov[0];
      }
    }

    if (this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*') {
      this.listArticlesComponent.filterItem(this.lastMovementOfArticle.article, this.categorySelected);
    } else if (article) {
      this.listArticlesComponent.filterItem(article, this.categorySelected);
    } else {
      this.listArticlesComponent.filterItem(null, this.categorySelected);
    }
    if (!this.filterArticle || this.filterArticle === '') {
      this.showCategories();
    }
  }

  showCategories(): void {
    this.categorySelected = null;
    if (!(this.filterArticle && this.filterArticle !== '' && this.filterArticle.slice(0, 1) === '*')) {
      this.filterArticle = '';
    }
    this.listCategoriesComponent.areCategoriesVisible = true;
    this.listArticlesComponent.areArticlesVisible = false;
    this.listArticlesComponent.filterArticle = this.filterArticle;
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.listCategoriesComponent.ngOnInit();
      this.focusEvent.emit(true);
    }
  }

  showArticles(category?: Category): void {
    if (category) {
      this.categorySelected = category;
      this.listArticlesComponent.filterItem(null, this.categorySelected);
      this.listArticlesComponent.hideMessage();
    }
    this.listCategoriesComponent.areCategoriesVisible = false;
    this.listArticlesComponent.areArticlesVisible = true;
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      this.focusEvent.emit(true);
    }
  }

  showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
    this.loading = false;
  }

  hideMessage(): void {
    this.alertMessage = '';
    this.loading = false;
  }

  padNumber(n, length): string {
    n = n.toString();
    while (n.length < length) n = '0' + n;

    return n;
  }

  updateOrdenOfProduction(id): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.loading = true;
      this._movementOfArticleService.updateMovementOfArticles(id).subscribe(
        (result) => {
          this.loading = false;
          if (result.status === 200) {
            resolve(true);
          } else {
            this._toastService.showToast(result);
            resolve(false);
          }
        },
        (error) => {
          this.loading = false;
          this._toastService.showToast(error);
          resolve(false);
        }
      );
    });
  }

  private getIncreasePercentage(priceList: PriceList, movementOfArticle: MovementOfArticle): number {
    // 1. Verificar si hay excepción para el artículo
    if (priceList.exceptions?.length) {
      const exception = priceList.exceptions.find((e) => e?.article?._id === movementOfArticle.article?._id);
      if (exception) {
        return this.roundNumber.transform(exception.percentage);
      }
    }

    // 2. Verificar si hay reglas especiales
    if (priceList.allowSpecialRules && priceList.rules?.length) {
      for (const rule of priceList.rules) {
        if (!rule) continue;

        const matchCategory = rule.category?._id === movementOfArticle.category?._id;
        const matchMake = rule.make?._id === movementOfArticle.make?._id;

        if (rule.category && rule.make && matchCategory && matchMake) {
          return this.roundNumber.transform(rule.percentage + priceList.percentage);
        }

        if (!rule.category && rule.make && matchMake) {
          return this.roundNumber.transform(rule.percentage + priceList.percentage);
        }

        if (rule.category && !rule.make && matchCategory) {
          return this.roundNumber.transform(rule.percentage + priceList.percentage);
        }
      }
    }

    // 3. Si no se aplicó ninguna regla ni excepción, usar porcentaje base
    return this.roundNumber.transform(priceList.percentage);
  }

  editObservation() {
    const modalRef = this._modalService.open(ChangeObservationComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.observation = this.transaction.observation || '';
    modalRef.result.then(
      (result) => {
        if (result !== 'cancel' && result !== '') {
          this.transaction.observation = result;
          this.updateTransaction();
        }
      },
      (reason) => {}
    );
  }

  changeTransport() {
    let modalRef = this._modalService.open(SelectTransportComponent);
    modalRef.result.then(async (result) => {
      if (result && result.transport) {
        this.transaction.transport = result.transport;
        this.transaction.declaredValue = result.declaredValue;
        this.transaction.package = result.package;
        await this.updateTransaction().then(async (transaction) => {
          if (transaction) {
            this.transaction = transaction;
            this.lastQuotation = this.transaction.quotation;
          }
        });
      }
    });
  }

  changeDate() {
    const modalRef = this._modalService.open(ChangeDateComponent, {
      size: 'md',
      backdrop: 'static',
    });
    modalRef.componentInstance.currentDate = this.transaction.endDate;
    modalRef.result
      .then(async (result) => {
        if (result && result.success && result.endDate) {
          const selectedDate = new Date(result.endDate);
          if (!isNaN(selectedDate.getTime())) {
            this.transaction.endDate = result.endDate; // Ya viene en formato ISO del datetime picker
            this.transaction.VATPeriod = this.formatDateToYYYYMM(selectedDate);
            this.transaction.expirationDate = this.transaction.endDate;
            await this.updateTransaction().then(async (transaction) => {
              if (transaction) {
                this.transaction = transaction;
                this.lastQuotation = this.transaction.quotation;
              }
            });
          }
        }
      })
      .catch(() => {
        // Modal cerrado sin cambios
      });
  }

  /**
   * Formatea una fecha al formato YYYYMM para VATPeriod
   * @param date - La fecha a formatear
   * @returns String en formato YYYYMM
   */
  private formatDateToYYYYMM(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  applyBusinessRule() {
    const modalRef = this._modalService.open(ApplyBusinessRuleComponent, {
      size: 'md',
      backdrop: 'static',
    });
    modalRef.componentInstance.transactionId = this.transactionId;
    modalRef.result.then(
      (result) => {
        if (result && result.success) {
          this.getMovementsOfTransaction();
        }
      },
      (reason) => {
        // Modal cerrado sin cambios
      }
    );
  }
}
