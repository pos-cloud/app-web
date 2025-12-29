//Paquetes Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Paquetes de terceros
import { NgbAlertConfig, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { PrintService } from '@core/services/print.service';
import { TranslateModule } from '@ngx-translate/core';
import { SendEmailComponent } from '@shared/components/send-email/send-email.component';
import { ApiResponse, Company, Printer, PrintType } from '@types';
import { ExportersModule } from 'app/components/export/exporters.module';
import { CompanyType } from 'app/components/payment-method/payment-method';
import { TransactionMovement } from 'app/components/transaction-type/transaction-type';
import { AddTransactionComponent } from 'app/components/transaction/add-transaction/add-transaction.component';
import { Transaction } from 'app/components/transaction/transaction';
import { ViewTransactionComponent } from 'app/components/transaction/view-transaction/view-transaction.component';
import { User } from 'app/components/user/user';
import { CompanyService } from 'app/core/services/company.service';
import { PrinterService } from 'app/core/services/printer.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import * as printJS from 'print-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompanyCurrentAccountService } from '../../../core/services/company-current-account.service';
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
export class CurrentAccountComponent implements OnInit, OnDestroy {
  public transactions: Transaction[] = [];
  public companySelected: Company;
  public companyType: CompanyType;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[] = new Array();
  public totalPrice: number = 0;
  public balance: number = 0;
  public currentPage: number = 1;
  public roundNumber: RoundNumberPipe;
  public showPaymentMethod: boolean = false;
  public transactionMovement: TransactionMovement;
  public showBalanceOfTransactions: boolean = false;
  public data = {};
  public isFirstTime = true;
  public hasInitialized: boolean = false;
  public printers: Printer[] = [];
  private destroy$ = new Subject<void>();

  public identity: User;
  public actions = {
    add: true,
    edit: true,
    delete: true,
    export: true,
  };

  constructor(
    private _service: CompanyService,
    private _companyService: CompanyService,
    private _companyCurrentAccountService: CompanyCurrentAccountService,
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

    this._companyService
      .getById(companyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.result) {
            this.companySelected = result.result;
            if (this.companySelected.type === CompanyType.Client) {
              this.transactionMovement = TransactionMovement.Sale;
            } else {
              this.transactionMovement = TransactionMovement.Purchase;
            }
            this.refresh();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this._router.navigate(['/']);
        },
        complete: () => {
          // No cambiamos loading aquí porque refresh() lo maneja
        },
      });
  }

  public refresh(): void {
    if (this.companySelected) {
      this.loading = true;
      this.hasInitialized = false;
      this.isFirstTime = true; // Resetear para que vaya a la última página

      // Consulta 1: Comprobantes (con paginación automática a la última página)
      this.getPaymentMethodOfAccountsByCompany();

      // Consulta 2: Saldo total (en paralelo, independiente)
      this.getTotalOfAccountsByCompany();

      // Consulta 3: Balance (en paralelo, independiente)
      this.getBalanceOfAccountsByCompany();
    } else {
      this._toastService.showToast({
        message: 'Not found',
        title: 'Debe seleccionar una empresa.',
      });
    }
  }

  public getTotalOfAccountsByCompany(): void {
    // Esta consulta se ejecuta en paralelo, no afecta el loading principal
    this._companyCurrentAccountService
      .getAll({
        project: { 'company._id': 1, 'company.operationType': 1, balance: 1 },
        match: { 'company._id': { $oid: this.companySelected._id }, 'company.operationType': { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.status === 200) {
            this.totalPrice = result.result[0]?.balance || 0;
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.totalPrice = 0;
        },
        complete: () => {
          // No afecta el loading principal
        },
      });
  }

  public getBalanceOfAccountsByCompany(): void {
    // Esta consulta se ejecuta en paralelo, no afecta el loading principal
    this._service
      .getBalanceOfAccountsByCompany(this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.balance = result[0]?.balance || 0;
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.balance = 0;
        },
        complete: () => {
          // No afecta el loading principal
        },
      });
  }

  public getPaymentMethodOfAccountsByCompany(): void {
    this.loading = true;

    let page = this.currentPage > 0 ? this.currentPage - 1 : 0;
    let skip = page * this.itemsPerPage;
    let limit = this.itemsPerPage;

    this.data = {
      company: this.companySelected._id,
      transactionMovement: this.transactionMovement,
      skip,
      limit,
    };

    this._service
      .getPaymentMethodOfAccountsByCompany(this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!result.result.length) {
            this._toastService.showToast(result);
            this.items = [];
            this.totalItems = 0;
            this.hasInitialized = true;
            this.loading = false; // Solo aquí terminamos el loading
          } else {
            // Caso normal: no es la primera vez, mostrar datos de la página actual
            this.items = result.result[0].items;
            this.totalItems = result.result[0].count;
            this.hasInitialized = true;
            this.loading = false; // Terminar loading
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.items = [];
          this.totalItems = 0;
          this.hasInitialized = true;
          this.loading = false; // Terminar loading en caso de error
        },
        complete: () => {
          // El loading se maneja en next() o error() según el caso
        },
      });
  }

  async openModal(op: string, transaction?: Transaction) {
    let modalRef;
    switch (op) {
      case 'send-email':
        modalRef = this._modalService.open(SendEmailComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.to = this.companySelected.emails;
        modalRef.componentInstance.subject = `Resumen de cuenta corriente de ${this.companySelected.name}`;
        modalRef.componentInstance.companyId = this.companySelected._id;
        modalRef.componentInstance.items = this.itemsPerPage;

        break;
      case 'view-transaction':
        modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        break;
      case 'edit-transaction':
        modalRef = this._modalService.open(AddTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
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
            companyId: this.companySelected._id,
            items: this.itemsPerPage,
          };
          this.toPrint(PrintType.CurrentAccount, dataLabels);
        } else {
          this._toastService.showToast({ message: 'Debe seleccionar una empresa.' });
        }
        break;
      case 'print-transaction':
        const data = {
          transactionId: transaction._id,
        };
        this.toPrint(PrintType.Transaction, data);
        break;
      case 'send-email-transaction':
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

  public padNumber(n, length): string {
    n = n.toString();
    while (n.length < length) n = '0' + n;

    return n;
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
    this.loading = true;
    this.getPaymentMethodOfAccountsByCompany();
  }

  public selectItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.loading = true;
    this.getPaymentMethodOfAccountsByCompany();
  }

  public getSummary(): void {
    this.loading = true;

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

    this._service.getSummaryOfAccountsByCompanyV2(this.data).subscribe(
      (result) => {
        if (!result.result.length) {
          this._toastService.showToast(result);
          this.items = new Array();
          this.totalItems = 0;
        } else {
          this.items = result.result[0].items;
          this.totalItems = result.result[0].count;

          if (this.isFirstTime) {
            const totalPages = Math.ceil(this.totalItems / limit);
            const lastPageSkip = (totalPages - 1) * limit;
            this.currentPage = totalPages;
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
