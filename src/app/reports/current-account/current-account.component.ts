//Paquetes Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/es';

import { Config } from 'app/app.config';
import { Company } from 'app/components/company/company';
import { CompanyService } from 'app/components/company/company.service';
import { ConfigService } from 'app/components/config/config.service';
import { AuthService } from 'app/components/login/auth.service';
import { MovementOfCashService } from 'app/components/movement-of-cash/movement-of-cash.service';
import { CompanyType } from 'app/components/payment-method/payment-method';
import { PrintComponent } from 'app/components/print/print/print.component';
import { Printer, PrinterPrintIn } from 'app/components/printer/printer';
import { PrinterService } from 'app/components/printer/printer.service';
import {
  TransactionMovement,
  TransactionType,
} from 'app/components/transaction-type/transaction-type';
import { TransactionTypeService } from 'app/components/transaction-type/transaction-type.service';
import { AddTransactionComponent } from 'app/components/transaction/add-transaction/add-transaction.component';
import { Transaction } from 'app/components/transaction/transaction';
import { TransactionService } from 'app/components/transaction/transaction.service';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { User } from 'app/components/user/user';
import { RoundNumberPipe } from 'app/core/pipes/round-number.pipe';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { CurrentAccountService } from './current-account.service';
@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.scss'],
  providers: [NgbAlertConfig],
})
export class CurrentAccountComponent implements OnInit {
  public transactions: Transaction[];
  public companySelected: Company;
  public companyType: CompanyType;
  public alertMessage: string = '';
  public loading: boolean = false;
  public loadingTotal: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[] = new Array();
  public totalPrice: number = 0;
  public balance: number = 0;
  public currentPage: number = 1;
  public roundNumber: RoundNumberPipe;
  public userCountry: string;
  public detailsPaymentMethod: boolean = false;
  public showPaymentMethod: boolean = false;
  public config: Config;
  public transactionMovement: TransactionMovement;
  public showBalanceOfTransactions: boolean = false;
  public transactionTypes: TransactionType[];
  public transactionTypesSelect;
  public data = {};
  public isFirstTime = true;

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

  constructor(
    public _transactionService: TransactionService,
    public _transactionTypeService: TransactionTypeService,
    public _movementOfCashService: MovementOfCashService,
    public _service: CurrentAccountService,
    public _companyService: CompanyService,
    public _configService: ConfigService,
    public _router: Router,
    public _authService: AuthService,
    private _route: ActivatedRoute,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    public _printerService: PrinterService,
    private _toastService: ToastService
  ) {
    this.transactionTypesSelect = new Array();
    this.roundNumber = new RoundNumberPipe();
  }

  async ngOnInit() {
    this.userCountry = Config.country;
    const companyId = this._route.snapshot.paramMap.get('id');

    if (companyId) {
      this.getCompany(companyId);
    } else {
      this._toastService.showToast({
        message: 'Not found',
        title: 'Cuenta Corriente',
      });
      this._router.navigate(['/']);
    }
  }

  public getCompany(companyId: string): void {
    this.loading = true;

    this._companyService.getById(companyId).subscribe(
      async (result) => {
        if (result.result) {
          this.companySelected = result.result;
          if (this.companySelected.type === CompanyType.Client) {
            this.transactionMovement = TransactionMovement.Sale;
          } else {
            this.transactionMovement = TransactionMovement.Purchase;
          }

          this.loading = false;

          await this.getTransactionTypes().then((result) => {
            if (result) {
              this.transactionTypes = result;
            }
          });
          this.refresh();
        }
      },
      (error) => {
        this._toastService.showToast(error);
        this.loading = false;
      }
    );
  }

  public refresh(): void {
    if (this.companySelected) {
      //this.getSummary();
      this.getPaymentMethodOfAccountsByCompany();
      this.getTotalOfAccountsByCompany();
      //this.getBalanceOfAccountsByCompany();
    } else {
      this._toastService.showToast({
        message: 'Not found',
        title: 'Debe seleccionar una empresa.',
      });
    }
  }

  public getTotalOfAccountsByCompany(): void {
    this.totalPrice = 0;
    this.loadingTotal = true;

    this._service.getTotalOfAccountsByCompany(this.data).subscribe(
      (result) => {
        if (result) {
          this.totalPrice = result[0].totalPrice;
        }
        this.loadingTotal = false;
      },
      (error) => {
        this._toastService.showToast(error);
        this.loadingTotal = true;
      }
    );
  }

  public getBalanceOfAccountsByCompany(): void {
    this.balance = 0;

    this._service.getBalanceOfAccountsByCompany(this.data).subscribe(
      (result) => {
        if (result) {
          this.balance = result[0].balance;
        }
      },
      (error) => {
        this._toastService.showToast(error);
      }
    );
  }

  public getPaymentMethodOfAccountsByCompany(): void {
    this.loading = true;

    if (typeof this.detailsPaymentMethod !== 'boolean') {
      this.detailsPaymentMethod = Boolean(
        JSON.parse(this.detailsPaymentMethod)
      );
    }

    let transactionTypes = [];

    if (this.transactionTypesSelect) {
      this.transactionTypesSelect.forEach((element) => {
        transactionTypes.push({ $oid: element._id });
      });
    }

    let page = 0;

    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.data = {
      company: this.companySelected._id,
      transactionType: transactionTypes,
      transactionMovement: this.transactionMovement,
      skip,
      limit,
    };

    this._service.getPaymentMethodOfAccountsByCompany(this.data).subscribe(
      (result) => {
        if (!result.result.length) {
          this._toastService.showToast(result);
          this.items = new Array();
          this.totalItems = 0;
        } else {
          this.items = result.result[0].items;
          this.totalItems = result.result[0].count;
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error);
        this.loading = false;
      }
    );
  }

  async openModal(op: string, transactionId?: string) {
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
      case 'print':
        if (this.companySelected) {
          modalRef = this._modalService.open(PrintComponent);
          modalRef.componentInstance.items = this.items;
          modalRef.componentInstance.company = this.companySelected;
          modalRef.componentInstance.params = {
            detailsPaymentMethod: this.detailsPaymentMethod,
          };
          modalRef.componentInstance.typePrint = 'current-account';
          modalRef.componentInstance.balance = this.totalPrice;
        } else {
          //this.showMessage('Debe seleccionar una empresa.', 'info', true);
        }
        break;
      case 'print-transaction':
        modalRef = this._modalService.open(PrintComponent);
        modalRef.componentInstance.transactionId = transactionId;
        modalRef.componentInstance.company = this.companySelected;
        modalRef.componentInstance.typePrint = 'invoice';
        await this.getTransaction(transactionId).then(async (transaction) => {
          if (transaction) {
            if (transaction.type.defectPrinter) {
              modalRef.componentInstance.printer =
                transaction.type.defectPrinter;
            } else {
              await this.getPrinters().then((printers) => {
                if (printers) {
                  for (let printer of printers) {
                    if (printer.printIn === PrinterPrintIn.Counter) {
                      modalRef.componentInstance.printer = printer;
                    }
                  }
                }
              });
            }
          }
        });
        break;

      default:
    }
  }

  public getTransaction(transactionId: string): Promise<Transaction> {
    return new Promise<Transaction>((resolve, reject) => {
      this._transactionService.getTransaction(transactionId).subscribe(
        async (result) => {
          if (!result.transaction) {
            this._toastService.showToast(result);
            resolve(null);
          } else {
            resolve(result.transaction);
          }
        },
        (error) => {
          this._toastService.showToast(error);
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
            this._toastService.showToast(error);
            resolve(null);
          }
        );
    });
  }

  public pageChange(page): void {
    this.currentPage = page;
    this.getSummary();
  }

  public getSummary(): void {
    this.loading = true;

    if (typeof this.detailsPaymentMethod !== 'boolean') {
      this.detailsPaymentMethod = Boolean(
        JSON.parse(this.detailsPaymentMethod)
      );
    }

    let transactionTypes = [];

    if (this.transactionTypesSelect) {
      this.transactionTypesSelect.forEach((element) => {
        transactionTypes.push({ $oid: element._id });
      });
    }

    let page = 0;

    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.data = {
      company: this.companySelected._id,
      transactionType: transactionTypes,
      transactionMovement: this.transactionMovement,
      skip,
      limit,
    };

    this._service.getSummaryOfAccountsByCompany(this.data).subscribe(
      (result) => {
        if (!result.result.length) {
          this._toastService.showToast(result);
          this.items = new Array();
          this.totalItems = 0;
        } else {
          this.items = result.result[0].items;
          this.totalItems = result.result[0].count;

          if (this.isFirstTime) {
            const totalPages = Math.ceil(this.totalItems / limit); // Número total de páginas
            const lastPageSkip = (totalPages - 1) * limit;

            this.pageChange(lastPageSkip);
            this.isFirstTime = false;
          }
        }
        this.loading = false;
      },
      (error) => {
        this._toastService.showToast(error);
        this.loading = false;
      }
    );
  }
}
