import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { PrintService } from '@core/services/print.service';
import { TransactionService } from '@core/services/transaction.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SendEmailComponent } from '@shared/components/send-email/send-email.component';
import { SendWppComponent } from '@shared/components/send-wpp/send-wpp.component';
import { ToastService } from '@shared/components/toast/toast.service';
import { ApiResponse, IAttribute, IButton, PrintType, TransactionMovement, User } from '@types';
import { Config } from 'app/app.config';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { AddTransactionComponent } from 'app/components/transaction/add-transaction/add-transaction.component';
import { DeleteTransactionComponent } from 'app/modules/transaction/components/delete-transaction/delete-transaction.component';
import { ExportIvaArcaComponent } from 'app/modules/transaction/components/export-iva-arca/export-iva-arca.component';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { UserBranchSelectComponent } from 'app/shared/components/user-branch-select/user-branch-select.component';
import * as printJS from 'print-js';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-transaction',
  templateUrl: './list-transaction.component.html',
  styleUrls: ['./list-transaction.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatatableModule, DateTimePickerComponent, UserBranchSelectComponent],
})
export class ListTransactionComponent implements OnInit, OnDestroy {
  public loading: boolean = false;
  public title: string = 'Transacciones';
  public showDatatable: boolean = true;
  public exportPermision: boolean = false;
  public sort = { endDate: -1 };
  public user: User | null = null;
  public headerButtons: IButton[] = [];
  public rowButtons: IButton[] = [];
  public branchSelectedId: string | null = null;
  public dateSelect: string = 'creationDate2';
  public startDate: string = '';
  public endDate: string = '';
  public timezone: string = '-03:00';
  public transactionMovement: TransactionMovement;
  private readonly dateFilterColumns = ['creationDate2', 'updateDate2', 'endDate2'];
  private destroy$ = new Subject<void>();
  public columns: IAttribute[] = [
    {
      name: 'type.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'type.transactionMovement',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'origin',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: `{"$toString" : "$origin"}`,
      align: 'center',
      required: false,
    },
    {
      name: 'letter',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'number',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: `{"$toString" : "$number"}`,
      align: 'right',
      required: false,
    },
    {
      name: 'endDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$endDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'company.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'company.fantasyName',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'company.identificationValue',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'state',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'observation',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'madein',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'balance',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: `{"$toString" : "$balance"}`,
      align: 'right',
      required: false,
    },
    {
      name: 'totalPrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: `{"$toString" : "$totalPrice"}`,
      align: 'right',
      required: false,
    },
    {
      name: 'basePrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'discountAmount',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'employeeClosing.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'cashBox.number',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: `{"$toString" : "$cashBox.number"}`,
      align: 'right',
      required: false,
    },
    {
      name: 'table.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'VATPeriod',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'CAE',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'branchDestination.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'depositDestination.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'priceList.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'creationDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$creationDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: 'updateDate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'date',
      project: `{ "$dateToString": { "date": "$updateDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
      align: 'left',
      required: false,
    },
    {
      name: 'creationUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'updateUser.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: '_id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString": "$_id" }`,
      align: 'left',
      required: false,
    },
    {
      name: 'type.allowEdit',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'type.allowDelete',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'type.electronics',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'boolean',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'company.emails',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'company.phones',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'endDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$endDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'creationDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$creationDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'updateDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$updateDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'branchOrigin',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'operationType',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      defaultFilter: `{ "$ne": "D" }`,
      project: null,
      align: 'left',
      required: true,
    },
  ];
  @ViewChild(DatatableComponent) datatableComponent!: DatatableComponent;

  constructor(
    public _service: TransactionService,
    private _modalService: NgbModal,
    private _authService: AuthService,
    private _printService: PrintService,
    private _toastService: ToastService,
    private _route: ActivatedRoute,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.initDateFilters();
    this.setTransactionMovement(this._route.snapshot.params['type']);
    this.applyMovementFilter();
  }

  ngOnInit(): void {
    this.getPermissions();
    this._route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const previousMovement = this.transactionMovement;
      this.setTransactionMovement(params['type']);
      this.updateTitle(params['type']);
      this.applyDateFilter();
      this.applyBranchFilter();
      this.applyMovementFilter();

      if (previousMovement && previousMovement !== this.transactionMovement) {
        this.recreateDatatable();
        return;
      }

      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async emitEvent(event: { op: string; obj: any }) {
    this.redirect(event.op, event.obj);
  }

  public async redirect(op: string, obj: any) {
    switch (op) {
      case 'view': {
        const modalRef = this._modalService.open(ViewTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = obj._id;
        break;
      }
      case 'update': {
        const modalRef = this._modalService.open(AddTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = obj._id;
        modalRef.result.then(
          (result) => {
            if (result?.transaction) {
              this.refresh();
            }
          },
          () => {}
        );
        break;
      }
      case 'delete': {
        const modalRef = this._modalService.open(DeleteTransactionComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionId = obj._id;
        modalRef.result.then(
          (result) => {
            if (result === 'delete_close') {
              this.refresh();
            }
          },
          () => {}
        );
        break;
      }
      case 'print': {
        this.toPrint(PrintType.Transaction, { transactionId: obj._id });
        break;
      }
      case 'send-email': {
        const modalRef = this._modalService.open(SendEmailComponent, {
          size: 'lg',
          backdrop: 'static',
        });
        modalRef.componentInstance.to = obj.company?.emails;
        modalRef.componentInstance.subject = `${obj.type?.name} ${this.padNumber(obj.origin, 4)}-${obj.letter}-${this.padNumber(obj.number, 8)}`;
        modalRef.componentInstance.transactionId = obj._id;
        break;
      }
      case 'send-wpp': {
        const modalRef = this._modalService.open(SendWppComponent, {
          size: 'md',
          backdrop: 'static',
        });
        modalRef.componentInstance.phone = obj.company?.phones;
        modalRef.componentInstance.transactionId = obj._id;
        break;
      }
      case 'export-iva-arca': {
        const modalRef = this._modalService.open(ExportIvaArcaComponent, {
          size: 'md',
          backdrop: 'static',
        });
        modalRef.componentInstance.transactionMovement = this.transactionMovement || TransactionMovement.Sale;
        break;
      }
    }
  }

  public refresh() {
    this.datatableComponent.refresh();
  }

  public onDatePickerChange(): void {
    this.applyFilters();
  }

  public applyFilters(): void {
    this.applyDateFilter();
    this.applyBranchFilter();
    this.applyMovementFilter();

    if (!this.datatableComponent) {
      return;
    }

    this.datatableComponent.currentPage = 1;
    this.datatableComponent.refresh();
  }

  private initDateFilters(): void {
    if (Config.timezone && Config.timezone !== '') {
      this.timezone = Config.timezone.split('UTC')[1];
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    this.startDate = startOfToday.toISOString();

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    this.endDate = endOfToday.toISOString();

    this.applyDateFilter();
  }

  private applyDateFilter(): void {
    const rangeFilter = `{ "$gte": { "$date": "${this.toDateStart(this.startDate)}" }, "$lte": { "$date": "${this.toDateEnd(this.endDate)}" } }`;

    this.columns.forEach((column) => {
      if (!this.dateFilterColumns.includes(column.name)) {
        return;
      }

      if (column.name === this.dateSelect) {
        column.defaultFilter = rangeFilter;
        if (this.datatableComponent?.filters) {
          this.datatableComponent.filters[column.name] = rangeFilter;
        }
      } else {
        delete column.defaultFilter;
        if (this.datatableComponent?.filters) {
          delete this.datatableComponent.filters[column.name];
        }
      }
    });
  }

  private applyBranchFilter(): void {
    const branchColumn = this.columns.find((column) => column.name === 'branchOrigin');
    if (!branchColumn) {
      return;
    }

    if (this.branchSelectedId) {
      const branchFilter = `{ "$oid": "${this.branchSelectedId}" }`;
      branchColumn.defaultFilter = branchFilter;
      if (this.datatableComponent?.filters) {
        this.datatableComponent.filters['branchOrigin'] = branchFilter;
      }
    } else {
      delete branchColumn.defaultFilter;
      if (this.datatableComponent?.filters) {
        delete this.datatableComponent.filters['branchOrigin'];
      }
    }
  }

  private setTransactionMovement(typeParam?: string): void {
    const type = (typeParam || '').toLowerCase();

    if (type === 'produccion' || type === 'production') {
      this.transactionMovement = TransactionMovement.Production;
    } else if (type === 'venta' || type === 'ventas') {
      this.transactionMovement = TransactionMovement.Sale;
    } else if (type === 'compra' || type === 'compras') {
      this.transactionMovement = TransactionMovement.Purchase;
    } else if (type === 'stock') {
      this.transactionMovement = TransactionMovement.Stock;
    } else if (type === 'fondos') {
      this.transactionMovement = TransactionMovement.Money;
    }
  }

  private updateTitle(typeParam?: string): void {
    this.title = this.transactionMovement
      ? `Transacciones de ${this.transactionMovement}`
      : 'Transacciones';
  }

  private recreateDatatable(): void {
    this.showDatatable = false;
    this._changeDetectorRef.detectChanges();
    this.showDatatable = true;
  }

  private applyMovementFilter(): void {
    const movementColumn = this.columns.find((column) => column.name === 'type.transactionMovement');
    if (!movementColumn || !this.transactionMovement) {
      return;
    }

    const movementFilter = `"${this.transactionMovement}"`;
    movementColumn.defaultFilter = movementFilter;
    if (this.datatableComponent?.filters) {
      this.datatableComponent.filters['type.transactionMovement'] = movementFilter;
    }
  }

  private toDateStart(value: string): string {
    return `${this.formatDateYmd(value)}T00:00:00${this.timezone}`;
  }

  private toDateEnd(value: string): string {
    return `${this.formatDateYmd(value)}T23:59:59${this.timezone}`;
  }

  private formatDateYmd(value: string): string {
    const date = value ? new Date(value) : new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getPermissions(): void {
    this._authService.getIdentity.pipe(takeUntil(this.destroy$)).subscribe((identity) => {
      if (!identity) {
        return;
      }
      this.user = identity;
      this.configureButtons();
    });
  }

  private configureButtons(): void {
    const transactionPermission = this.user?.permission?.collections?.transactions;
    this.exportPermision = transactionPermission?.export === true;

    this.rowButtons = [];
    this.headerButtons = [];

    this.rowButtons.push({
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item, null)`,
    });

    if (transactionPermission?.edit) {
      this.rowButtons.push({
        title: 'update',
        class: 'btn btn-primary btn-sm',
        icon: 'fa fa-pencil',
        click: `this.emitEvent('update', item, null)`,
        showWhen: `item.type && item.type.allowEdit`,
      });
    }

    if (transactionPermission?.delete) {
      this.rowButtons.push({
        title: 'delete',
        class: 'btn btn-danger btn-sm',
        icon: 'fa fa-trash-o',
        click: `this.emitEvent('delete', item, null)`,
        showWhen: `item.type && item.type.allowDelete && !(item.type.electronics && String(item.state) === 'Cerrado')`,
      });
    }

    this.rowButtons.push(
      {
        title: 'print',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-print',
        click: `this.emitEvent('print', item, null)`,
      },
      {
        title: 'send-email',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-envelope',
        click: `this.emitEvent('send-email', item, null)`,
        showWhen: `String(item.state) !== 'Pendiente' && String(item.state) !== 'Abierto'`,
      },
      {
        title: 'send-wpp',
        class: 'btn btn-light btn-sm',
        icon: 'fa fa-whatsapp',
        click: `this.emitEvent('send-wpp', item, null)`,
        showWhen: `String(item.state) !== 'Pendiente' && String(item.state) !== 'Abierto'`,
      }
    );

    this.headerButtons.push(
      {
        title: 'Exportar IVA Arca',
        class: 'btn btn-light',
        icon: 'fa fa-book',
        click: `this.emitEvent('export-iva-arca', null)`,
      },
      {
        title: 'refresh',
        class: 'btn btn-light',
        icon: 'fa fa-refresh',
        click: `this.refresh()`,
      }
    );
  }

  private padNumber(n: string | number, length: number): string {
    let value = n != null ? n.toString() : '';
    while (value.length < length) {
      value = '0' + value;
    }
    return value;
  }

  private toPrint(type: PrintType, data: {}): void {
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
        error: () => {
          this._toastService.showToast({ message: 'Error al generar el PDF' });
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
