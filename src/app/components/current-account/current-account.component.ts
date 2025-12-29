//Paquetes Angular
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

//Modelos
import { ApiResponse, Company, PrintType } from '@types';
import { MovementOfCash } from '../movement-of-cash/movement-of-cash';
import { Transaction } from '../transaction/transaction';

//Services
import { CompanyService } from '../../core/services/company.service';
import { MovementOfCashService } from '../../core/services/movement-of-cash.service';
import { TransactionTypeService } from '../../core/services/transaction-type.service';
import { TransactionService } from '../../core/services/transaction.service';

//Componentes
import { PrintService } from '@core/services/print.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { Printer } from '@types';
import { Config } from 'app/app.config';
import { CompanyType } from 'app/components/payment-method/payment-method';
import { PrintComponent } from 'app/components/print/print/print.component';
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';
import { User } from 'app/components/user/user';
import { ConfigService } from 'app/core/services/config.service';
import { SelectCompanyComponent } from 'app/modules/entities/company/select-company/select-company.component';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import * as printJS from 'print-js';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { PrinterService } from '../../core/services/printer.service';
import { SendEmailComponent } from '../../shared/components/send-email/send-email.component';
import { ExportExcelComponent } from '../export/export-excel/export-excel.component';
import { AddTransactionComponent } from '../transaction/add-transaction/add-transaction.component';
import { ViewTransactionComponent } from '../transaction/view-transaction/view-transaction.component';

@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.css'],
  providers: [NgbAlertConfig],
})
export class CurrentAccountComponent implements OnInit {
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;

  public title: string = 'Cuenta Corriente';
  public transactions: Transaction[];
  public companySelected: Company;
  public companyType: CompanyType;
  public movementsOfCashes: MovementOfCash[];
  public areTransactionsEmpty: boolean = true;
  public alertMessage: string = '';
  public userType: string;
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[] = new Array();
  public balance: number = 0;
  public balanceDoc: number = 0;
  public currentPage: number = 1;
  public roundNumber: RoundNumberPipe;
  public startDate: string;
  public endDate: string;
  public userCountry: string;
  public detailsPaymentMethod: boolean = false;
  public showPaymentMethod: boolean = false;
  public config: Config;
  public invertedView: boolean = false;
  public transactionMovement: TransactionMovement;
  public showBalanceOfTransactions: boolean = false;
  public showBalanceOfCero: boolean = false;
  public selectedItems;
  public transactionTypes: TransactionType[];
  public transactionTypesSelect;
  private destroy$ = new Subject<void>();
  public dropdownSettings = {
    singleSelection: false,
    defaultOpen: false,
    idField: '_id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: true,
    itemsShowLimit: 1,
    allowSearchFilter: true,
  };

  public identity: User;
  public actions = {
    add: true,
    edit: true,
    delete: true,
    export: true,
  };

  public columns = [
    {
      name: 'transactionDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'transactionTypeName',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'transactionOrigin',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'transactionLetter',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'transactionNumber',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'transactionTotalPrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      align: 'right',
    },
    {
      name: 'paymentMethodName',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'quota',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'paymentMethodExpirationDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      align: 'left',
    },
    {
      name: 'debe',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      align: 'right',
    },
    {
      name: 'haber',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      align: 'right',
    },
    {
      name: 'balance',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      align: 'right',
    },
    {
      name: 'transactionBalance',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      align: 'right',
    },
  ];

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfCashService: MovementOfCashService,
    public _companyService: CompanyService,
    public _configService: ConfigService,
    public _router: Router,
    public _authService: AuthService,
    private _route: ActivatedRoute,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService,
    public _toastService: ToastService,
    public _printService: PrintService
  ) {
    this.transactionTypesSelect = new Array();
    this.movementsOfCashes = new Array();
    this.roundNumber = new RoundNumberPipe();
    this.startDate = moment('1990-01-01').format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.processParams();
  }

  private processParams(): void {
    this._route.queryParams.subscribe((params) => {
      this.companyType = params['companyType'];
      if (params['companyId']) {
        this.getCompany(params['companyId']);
      } else {
        this.openModal('company');
      }
    });
  }

  async ngOnInit() {
    this._authService.getIdentity.pipe(first()).subscribe((identity) => {
      this.identity = identity;
    });

    if (this.identity.permission && this.identity.permission.collections) {
      if (this.identity.permission.collections.transactions) {
        this.actions = this.identity.permission.collections.transactions;
      }
    }

    this.userCountry = Config.country;
    let pathLocation: string[] = this._router.url.split('/');
    this.userType = pathLocation[1];

    await this._configService.getConfig.subscribe((config) => {
      this.config = config;
      this.detailsPaymentMethod = this.config.reports.summaryOfAccounts.detailsPaymentMethod;
      if (this.companyType === CompanyType.Client) {
        this.invertedView = this.config.reports.summaryOfAccounts.invertedViewClient;
      } else {
        this.invertedView = this.config.reports.summaryOfAccounts.invertedViewProvider;
      }

      // Inicializar columnas
      this.updateColumns();
    });
  }

  public getSummary(): void {
    this.loading = true;

    let timezone = '-03:00';
    if (Config.timezone && Config.timezone !== '') {
      timezone = Config.timezone.split('UTC')[1];
    }

    if (typeof this.detailsPaymentMethod !== 'boolean') {
      this.detailsPaymentMethod = Boolean(JSON.parse(this.detailsPaymentMethod));
    }

    let transactionTypes = [];

    if (this.transactionTypesSelect) {
      this.transactionTypesSelect.forEach((element) => {
        transactionTypes.push({ $oid: element._id });
      });
    }
    let query: {};
    query = {
      company: this.companySelected._id,
      startDate: this.startDate + ' 00:00:00' + timezone,
      endDate: this.endDate + ' 23:59:59' + timezone,
      detailsPaymentMethod: this.detailsPaymentMethod,
      transactionMovement: this.transactionMovement,
      invertedView: this.invertedView,
      transactionTypes: transactionTypes,
    };
    if (this.showBalanceOfTransactions && this.showBalanceOfCero) {
      query = {
        company: this.companySelected._id,
        startDate: this.startDate + ' 00:00:00' + timezone,
        endDate: this.endDate + ' 23:59:59' + timezone,
        detailsPaymentMethod: this.detailsPaymentMethod,
        transactionMovement: this.transactionMovement,
        invertedView: this.invertedView,
        transactionTypes: transactionTypes,
        transactionBalance: { $gt: 0 },
      };
    }
    this._companyService.getSummaryOfAccountsByCompanyV2(JSON.stringify(query)).subscribe(
      (result) => {
        if (!result) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
          this.items = new Array();
          this.totalItems = 0;
        } else {
          this.hideMessage();
          this.items = result;
          if (this.showBalanceOfTransactions && this.showBalanceOfCero) {
            this.items = result.filter((e) => e.debe > e.haber);
          }

          this.totalItems = this.items.length;
          this.currentPage = parseFloat(
            this.roundNumber.transform(this.totalItems / this.itemsPerPage + 0.5, 0).toFixed(0)
          );
          this.getBalance();
          this.showPaymentMethod = this.detailsPaymentMethod;

          // Actualizar columnas según las opciones seleccionadas
          this.updateColumns();
        }
        this.loading = false;
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public getCompany(companyId: string): void {
    this.loading = true;

    this._companyService.getCompany(companyId).subscribe(
      async (result) => {
        if (!result.company) {
          if (result.message && result.message !== '') this.showMessage(result.message, 'info', true);
        } else {
          this.companySelected = result.company;
          if (this.companySelected.type === CompanyType.Client) {
            this.transactionMovement = TransactionMovement.Sale;
          } else {
            this.transactionMovement = TransactionMovement.Purchase;
          }

          await this.getTransactionTypes().then((result) => {
            if (result) {
              this.transactionTypes = result;
            }
          });

          this.refresh();
        }
      },
      (error) => {
        this.showMessage(error._body, 'danger', false);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    if (this.companySelected) {
      this.getSummary();
    } else {
      this.showMessage('Debe seleccionar una empresa.', 'info', true);
    }
  }

  public onFilterChange(): void {
    // Actualizar columnas cuando cambien los filtros
    this.updateColumns();
  }

  public getBalance(): void {
    this.balance = 0;
    this.balanceDoc = 0;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].isCurrentAccount || this.items[i].typeCurrentAccount !== 'No') {
        //SALDO
        this.balance += this.items[i].debe;
        this.balance -= this.items[i].haber;
        this.items[i].balance = this.items[i].debe - this.items[i].haber;
        if (this.items[i - 1]) {
          this.items[i].balance += this.items[i - 1].balance;
        }

        //SALDO DOC
        if (this.items[i].haber > 0) this.items[i].transactionBalance *= -1;
        this.balanceDoc += this.items[i].transactionBalance;
      }
    }
  }

  public getDefaultPrinter() {
    return {
      _id: 'default',
      name: 'PDF',
      pageWidth: 210,
      pageHigh: 297,
      labelWidth: 0,
      labelHigh: 0,
      printIn: 'Counter',
      url: '',
      quantity: 1,
      orientation: 'p',
      row: 0,
      addPag: 0,
      fields: [],
      // Propiedades de Activity
      operationType: 'add',
      status: 'active',
      creationDate: new Date(),
      updateDate: new Date(),
      creationUser: null,
      updateUser: null,
    };
  }

  public async openModal(op: string, transactionId?: string) {
    let modalRef;
    switch (op) {
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transactionId;
        break;
      case 'edit-transaction':
        modalRef = this._modalService.open(AddTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transactionId;
        modalRef.result.then(
          (result) => {
            if (result.transaction) {
              // this.refresh();
            }
          },
          (reason) => {}
        );
        break;
      case 'company':
        modalRef = this._modalService.open(SelectCompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        console.log(this.companyType);
        modalRef.componentInstance.type = this.companyType;
        modalRef.result.then(
          (result) => {
            if (result.company) {
              this.companySelected = result.company;
              if (this.companyType === CompanyType.Client) {
                this._router.navigate(['admin/cuentas-corrientes'], {
                  queryParams: {
                    companyId: this.companySelected._id,
                    companyType: this.companySelected.type,
                  },
                });
              } else {
                this._router.navigate(['admin/cuentas-corrientes'], {
                  queryParams: {
                    companyId: this.companySelected._id,
                    companyType: this.companySelected.type,
                  },
                });
              }
            }
          },
          (reason) => {}
        );
        break;
      case 'send-email-current':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.items = this.items;
        modalRef.componentInstance.company = this.companySelected;
        modalRef.componentInstance.params = {
          detailsPaymentMethod: this.detailsPaymentMethod,
        };
        modalRef.componentInstance.typePrint = 'current-account';
        modalRef.componentInstance.source = 'mail';
        modalRef.componentInstance.balance = this.balance;
        // Pasar una impresora por defecto para evitar el error
        modalRef.componentInstance.printer = this.getDefaultPrinter();

        if (this.companySelected) {
          modalRef = this._modalService.open(SendEmailComponent, {
            size: 'lg',
            backdrop: 'static',
          });
          modalRef.componentInstance.emails = this.companySelected.emails;
          modalRef.componentInstance.subject = 'Cuenta Corriente';
          modalRef.componentInstance.body = ' ';
          modalRef.componentInstance.attachments = {
            filename: `current-account.pdf`,
            path: `/home/clients/${Config.database}/others/current-account.pdf`,
          };
        } else {
          this.showMessage('Debe seleccionar una empresa.', 'info', true);
        }
        break;
      case 'print':
        if (this.companySelected) {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.items = this.items;
          modalRef.componentInstance.company = this.companySelected;
          modalRef.componentInstance.params = {
            detailsPaymentMethod: this.detailsPaymentMethod,
          };
          modalRef.componentInstance.typePrint = 'current-account';
          modalRef.componentInstance.balance = this.balance;
          // Pasar una impresora por defecto para evitar el error
          modalRef.componentInstance.printer = this.getDefaultPrinter();
        } else {
          this.showMessage('Debe seleccionar una empresa.', 'info', true);
        }
        break;
      case 'print-transaction':
        const data = {
          transactionId: transactionId,
        };
        this.toPrint(PrintType.Transaction, data);
        break;
      case 'send-email-transaction':
        let transaction: Transaction;

        await this.getTransaction(transactionId).then(async (result) => {
          transaction = result;
        });
        modalRef = this._modalService.open(SendEmailComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.to = transaction.company.emails;
        modalRef.componentInstance.subject = `${transaction.type.name} ${this.padNumber(transaction.origin, 4)}-${
          transaction.letter
        }-${this.padNumber(transaction.number, 8)}`;
        modalRef.componentInstance.transactionId = transaction._id;
        break;
      default:
    }
  }

  public toPrint(type: PrintType, data: {}): void {
    this.loading = true;

    this._printService
      .toPrint(type, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: Blob | ApiResponse) => {
          if (!result) {
            this._toastService.showToast({ message: 'Error al generar el PDF' });
            return;
          }
          if (result instanceof Blob) {
            try {
              const blobUrl = URL.createObjectURL(result);
              printJS(blobUrl);
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el PDF' });
            }
          } else {
            this._toastService.showToast(result);
          }
        },
        error: (error) => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  public padNumber(n, length): string {
    n = n.toString();
    while (n.length < length) n = '0' + n;
    return n;
  }

  public getTransaction(transactionId: string): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.getTransaction(transactionId).subscribe(
        async (result) => {
          if (!result.transaction) {
            this.showMessage(result.message, 'danger', false);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        (error) => {
          this.showMessage(error._body, 'danger', false);
          resolve(null);
        }
      );
    });
  }

  public getPrinters(): Promise<Printer[]> {
    return new Promise<Printer[]>(async (resolve, reject) => {
      this._printerService.getPrinters().subscribe(
        (result) => {
          if (!result.printers) {
            resolve(null);
          } else {
            resolve(result.printers);
          }
        },
        (error) => {
          resolve(null);
        }
      );
    });
  }

  public getTransactionTypes(): Promise<TransactionType[]> {
    return new Promise<TransactionType[]>((resolve, reject) => {
      let match = {};

      match = {
        transactionMovement: this.transactionMovement,
        $or: [{ currentAccount: 'Si' }, { currentAccount: 'Cobra' }],
      };

      this._transactionTypeService
        .getAll({
          project: {
            _id: 1,
            transactionMovement: 1,
            operationType: 1,
            name: 1,
            currentAccount: 1,
            branch: 1,
          },
          match: match,
        })
        .subscribe(
          (result) => {
            if (result) {
              resolve(result.result);
              this.transactionTypesSelect = result.result;
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

  public showMessage(message: string, type: string, dismissible: boolean): void {
    this.alertMessage = message;
    this.alertConfig.type = type;
    this.alertConfig.dismissible = dismissible;
  }

  public hideMessage(): void {
    this.alertMessage = '';
  }

  public exportItems(): void {
    this.exportExcelComponent.items = this.items;
    this.exportExcelComponent.export();
  }

  private updateColumns(): void {
    // Actualizar visibilidad de columnas según las opciones seleccionadas
    this.columns.forEach((column) => {
      switch (column.name) {
        case 'transactionOrigin':
          column.visible = this.userCountry === 'AR';
          break;
        case 'paymentMethodName':
        case 'quota':
        case 'paymentMethodExpirationDate':
          column.visible = this.showPaymentMethod;
          break;
        case 'transactionBalance':
          column.visible = this.showBalanceOfTransactions;
          break;
        default:
          column.visible = true;
          break;
      }
    });
  }
}
