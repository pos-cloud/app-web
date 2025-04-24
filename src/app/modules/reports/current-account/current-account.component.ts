//Paquetes Angular
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/es';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { PrintService } from '@core/services/print.service';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse, Printer, PrintType } from '@types';
import { Company } from 'app/components/company/company';
import { ExportersModule } from 'app/components/export/exporters.module';
import { CompanyType } from 'app/components/payment-method/payment-method';
import { PrintComponent } from 'app/components/print/print/print.component';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';
import { AddTransactionComponent } from 'app/components/transaction/add-transaction/add-transaction.component';
import { Transaction } from 'app/components/transaction/transaction';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { User } from 'app/components/user/user';
import { CompanyService } from 'app/core/services/company.service';
import { PrinterService } from 'app/core/services/printer.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import * as printJS from 'print-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurrentAccountService } from './current-account.service';
@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.scss'],
  providers: [NgbAlertConfig],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressbarModule,
    TranslateModule,
    PipesModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule,
    ExportersModule,
  ],
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
  public detailsPaymentMethod: boolean = false;
  public showPaymentMethod: boolean = false;
  public transactionMovement: TransactionMovement;
  public showBalanceOfTransactions: boolean = false;
  public data = {};
  public isFirstTime = true;
  printers: Printer[];
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

  constructor(
    private _transactionService: TransactionService,
    private _service: CurrentAccountService,
    private _companyService: CompanyService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: NgbModal,
    private _printerService: PrinterService,
    public _printService: PrintService,
    private _toastService: ToastService,
    private _title: Title
  ) {
    this.roundNumber = new RoundNumberPipe();
  }

  async ngOnInit() {
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

    this._title.setTitle('Cuenta corriente');
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
      this.getBalanceOfAccountsByCompany();
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
          this.totalPrice = result[0]?.totalPrice;
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
          this.balance = result[0]?.balance;
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
      this.detailsPaymentMethod = Boolean(JSON.parse(this.detailsPaymentMethod));
    }

    let page = 0;

    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.data = {
      company: this.companySelected._id,
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
          if (this.isFirstTime && result?.result?.[0]?.count > 0) {
            const totalCount = result.result[0].count;
            const totalPages = Math.ceil(totalCount / limit);
            const lastPageSkip = (totalPages - 1) * limit;
            this.pageChange(lastPageSkip);
            this.isFirstTime = false;
            this.loading = false;
          } else {
            this.items = result.result[0].items;
            this.totalItems = result.result[0].count;
            this.loading = false;
          }
        }
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
          const dataLabels = {
            clientId: this.companySelected._id,
          };
          this.toPrint(PrintType.CurrentAccount, dataLabels);
        } else {
          this._toastService.showToast({ message: 'Debe seleccionar una empresa.' });
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
              modalRef.componentInstance.printer = transaction.type.defectPrinter;
            } else {
              await this.getPrinters().then((printers) => {
                if (printers) {
                  for (let printer of printers) {
                    if (printer.printIn.toString() == 'Mostrador') {
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

  public pageChange(page): void {
    this.currentPage = page;
    this.getPaymentMethodOfAccountsByCompany();
  }

  public getSummary(): void {
    this.loading = true;

    if (typeof this.detailsPaymentMethod !== 'boolean') {
      this.detailsPaymentMethod = Boolean(JSON.parse(this.detailsPaymentMethod));
    }

    let page = 0;

    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.data = {
      company: this.companySelected._id,
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

  public getPrinters(): Promise<Printer[]> {
    return new Promise<Printer[]>((resolve, reject) => {
      this.loading = true;

      this._printerService.getPrinters().subscribe(
        (result) => {
          if (!result.printers) {
            this.printers = new Array();
          } else {
            resolve(result.printers);
          }
          this.loading = false;
        },
        (error) => {
          this.loading = false;
        }
      );
    });
  }
}
