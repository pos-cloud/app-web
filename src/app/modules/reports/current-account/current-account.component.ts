//Paquetes Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

//Paquetes de terceros
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { AuthService } from '@core/services/auth.service';
import { CancellationTypeService } from '@core/services/cancellation-type.service';
import { PrintService } from '@core/services/print.service';
import { TranslateModule } from '@ngx-translate/core';
import { SendEmailComponent } from '@shared/components/send-email/send-email.component';
import { ApiResponse, Company, PrintType, TransactionMovement, TransactionState, User } from '@types';
import { CompanyType } from 'app/components/payment-method/payment-method';
import { AddTransactionComponent } from 'app/components/transaction/add-transaction/add-transaction.component';
import { Transaction } from 'app/components/transaction/transaction';
import { CompanyService } from 'app/core/services/company.service';
import { DeleteTransactionComponent } from 'app/modules/transaction/components/delete-transaction/delete-transaction.component';
import { MovementOfCancellationComponent } from 'app/modules/transaction/components/movement-of-cancellation/movement-of-cancellation.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import * as printJS from 'print-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CompanyComponent } from '../../entities/company/crud/company.component';
import { CompanyCurrentAccountService } from '../../../core/services/company-current-account.service';
import { ViewTransactionComponent } from '../../transaction/components/view-transaction/view-transaction.component';
@Component({
  selector: 'app-current-account',
  templateUrl: './current-account.component.html',
  styleUrls: ['./current-account.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ProgressbarModule, TranslateModule, PipesModule, NgbModule],
})
export class CurrentAccountComponent implements OnInit, OnDestroy {
  public companySelected: Company;
  public loading: boolean = false;
  public itemsPerPage = 10;
  public totalItems = 0;
  public items: any[] = new Array();
  public totalPrice: number = 0;
  public currentPage: number = 1;
  public transactionMovement: TransactionMovement;
  public data = {};
  public user: User | null = null;
  private destroy$ = new Subject<void>();
  private cancellableDestinationTypeIds: string[] = [];

  // Getter para obtener los items paginados (para ngb-pagination)
  get paginatedItems(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.items.slice(startIndex, endIndex);
  }

  constructor(
    private _companyService: CompanyService,
    private _companyCurrentAccountService: CompanyCurrentAccountService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: NgbModal,
    private _authService: AuthService,
    public _printService: PrintService,
    private _cancellationTypeService: CancellationTypeService,
    private _toastService: ToastService,
    private _title: Title
  ) {}

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
    this.getPermissions();
    this.loadCancellableDestinationTypes();
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
            this._title.setTitle(`Cuenta corriente de ${this.companySelected.name}`);
            this.refresh();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this._router.navigate(['/']);
        },
        complete: () => {},
      });
  }

  public refresh(): void {
    if (this.companySelected) {
      this.loading = true;

      // Consulta 1: Comprobantes
      this.getPaymentMethodOfAccountsByCompany();

      // Consulta 2: Saldo total (en paralelo, independiente)
      this.getTotalOfAccountsByCompany();
    } else {
      this._toastService.showToast({
        message: 'Not found',
        title: 'Debe seleccionar una empresa.',
      });
    }
  }

  public getTotalOfAccountsByCompany(): void {
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
      });
  }

  public getPaymentMethodOfAccountsByCompany(): void {
    this.loading = true;

    // Obtenemos todos los datos sin paginación, el pipe pagination maneja la paginación del lado del cliente
    this.data = {
      company: this.companySelected._id,
      transactionMovement: this.transactionMovement,
    };

    this._companyService
      .getPaymentMethodOfAccountsByCompany(this.data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (!result.result.length) {
            this._toastService.showToast(result);
            this.items = [];
            this.totalItems = 0;
            this.loading = false;
          } else {
            this.items = result.result[0].items;
            // Si el endpoint devuelve todos los items, usamos items.length
            // Si tiene count, lo usamos (por si acaso el backend lo proporciona)
            this.totalItems = result.result[0].count || result.result[0].items.length;

            // Calcular y setear la última página automáticamente
            if (this.totalItems > 0) {
              const lastPage = Math.ceil(this.totalItems / this.itemsPerPage);
              this.currentPage = lastPage > 0 ? lastPage : 1;
            } else {
              this.currentPage = 1;
            }

            this.loading = false;
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.items = [];
          this.totalItems = 0;
          this.loading = false;
        },
        complete: () => {
          // El loading se maneja en next() o error()
        },
      });
  }

  async openModal(op: string, transaction?: Transaction) {
    let modalRef;
    switch (op) {
      case 'view-company':
        if (!this.companySelected) {
          break;
        }
        modalRef = this._modalService.open(CompanyComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.property = {
          companyId: this.companySelected._id,
          operation: 'view',
          type: '',
        };
        break;
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
        if (!this.canEdit({ transaction })) {
          break;
        }
        modalRef = this._modalService.open(AddTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.result.then(
          (result) => {
            if (result.transaction) {
              this.refresh();
            }
          },
          () => {}
        );
        break;
      case 'delete-transaction':
        if (!transaction || !this.canDelete({ transaction })) {
          break;
        }
        modalRef = this._modalService.open(DeleteTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = transaction._id;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.refresh();
            }
          },
          () => {}
        );
        break;
      case 'cancel':
        if (transaction) {
          this.openCancellation(transaction);
        }
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

  public canEdit(item: any): boolean {
    return this.transactionPermission?.edit === true && !!item?.transaction?.type?.allowEdit;
  }

  public canDelete(item: any): boolean {
    const transaction = item?.transaction;
    const type = transaction?.type;
    if (this.transactionPermission?.delete !== true || !type?.allowDelete) {
      return false;
    }

    return !(type.electronics && String(transaction.state) === TransactionState.Closed);
  }

  public canCancel(item: any): boolean {
    const transaction = item?.transaction;
    const typeId = this.toObjectId(transaction?.type?._id);
    if (!typeId || !this.cancellableDestinationTypeIds.includes(typeId)) {
      return false;
    }

    return String(transaction.state) === TransactionState.Closed && Number(transaction.balance) > 0;
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
    // No necesitamos llamar al servidor, el pipe pagination maneja la paginación del lado del cliente
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private get transactionPermission() {
    return this.user?.permission?.collections?.transactions;
  }

  private getPermissions(): void {
    this._authService.getIdentity.pipe(takeUntil(this.destroy$)).subscribe((identity) => {
      this.user = identity;
    });
  }

  private openCancellation(transaction: Transaction): void {
    const typeId = this.toObjectId(transaction?.type?._id);
    if (!typeId || !this.cancellableDestinationTypeIds.includes(typeId)) {
      this._toastService.showToast({
        message: 'Solo se pueden cancelar transacciones que tengan un tipo de cancelación.',
        type: 'info',
      });
      return;
    }

    if (String(transaction?.state) !== TransactionState.Closed) {
      this._toastService.showToast({
        message: 'Solo se pueden cancelar transacciones cerradas.',
        type: 'info',
      });
      return;
    }

    if (Number(transaction?.balance) <= 0) {
      this._toastService.showToast({
        message: 'La transacción ya está cancelada. No queda saldo para cancelar.',
        type: 'info',
      });
      return;
    }

    const modalRef = this._modalService.open(MovementOfCancellationComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transactionDestinationId = transaction._id;
    modalRef.componentInstance.totalPrice = Number(transaction.balance) || 0;
    modalRef.componentInstance.selectionView = true;
    modalRef.componentInstance.movementsOfCancellations = [];
    modalRef.result.then(
      (result) => {
        if (result?.movementsOfCancellations?.length > 0 || result?.movementsOfCashes) {
          this.refresh();
        }
      },
      () => {}
    );
  }

  private toObjectId(value: any): string | null {
    if (!value) {
      return null;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (value.$oid) {
      return String(value.$oid);
    }
    if (value._id) {
      return this.toObjectId(value._id);
    }
    return String(value);
  }

  private loadCancellableDestinationTypes(): void {
    this._cancellationTypeService
      .getAll({
        project: {
          'destination._id': 1,
          operationType: 1,
        },
        match: {
          operationType: { $ne: 'D' },
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.status && result.status !== 200) {
            this._toastService.showToast(result);
            this.cancellableDestinationTypeIds = [];
            return;
          }

          let raw = result?.result ?? result?.cancellationTypes ?? [];
          if (Array.isArray(raw) && raw[0]?.items) {
            raw = raw[0].items;
          }
          const cancellationTypes = Array.isArray(raw) ? raw : [];
          const ids = new Set<string>();

          cancellationTypes.forEach((cancellationType: any) => {
            const destinationId = this.toObjectId(cancellationType?.destination?._id ?? cancellationType?.destination);
            if (destinationId) {
              ids.add(destinationId);
            }
          });

          this.cancellableDestinationTypeIds = Array.from(ids);
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.cancellableDestinationTypeIds = [];
        },
      });
  }
}
