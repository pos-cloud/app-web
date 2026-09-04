import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementOfCancellationService } from '@core/services/movement-of-cancellation.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAttribute, IButton } from '@types';
import { Config } from 'app/app.config';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-movement-of-cancellation',
  templateUrl: './list-movements-of-cancellation.component.html',
  styleUrls: ['./list-movements-of-cancellation.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatatableModule, DateTimePickerComponent],
})
export class ListMovementOfCancellationsComponent implements OnInit, OnDestroy {
  public title: string = 'Movimientos de Cancelaciones';
  public loading: boolean = false;
  public sort: any = { 'transactionOrigin.endDate': -1 };
  public columns: IAttribute[] = [
    {
      name: 'transactionOrigin._id',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionOrigin.endDate',
      visible: true,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$transactionOrigin.endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionOrigin.endDate2',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'date',
      project: `"$transactionOrigin.endDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionOrigin.creationDate2',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'date',
      project: `"$transactionOrigin.creationDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionOrigin.updateDate2',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'date',
      project: `"$transactionOrigin.updateDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionOrigin.employeeClosing.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionOrigin.type.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionOrigin.type.transactionMovement',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: true,
    },
    {
      name: 'transactionOrigin.origin',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionOrigin.letter',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionOrigin.number',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionOrigin.company.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },

    {
      name: 'transactionOrigin.totalPrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionOrigin.operationType',
      visible: false,
      disabled: true,
      filter: true,
      defaultFilter: `{ "$ne": "D" }`,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },

    {
      name: 'transactionOrigin.state',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionDestination.endDate',
      visible: true,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: `{ "$dateToString": { "date": "$transactionDestination.endDate", "format": "%d/%m/%Y", "timezone": "-03:00" } }`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionDestination.endDate2',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: `"$transactionDestination.endDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionDestination.creationDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$transactionDestination.creationDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionDestination.updateDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$transactionDestination.updateDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionDestination.type.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionDestination.origin',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionDestination.letter',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionDestination.number',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionDestination.totalPrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transactionDestination.operationType',
      visible: false,
      disabled: true,
      filter: true,
      defaultFilter: `{ "$ne": "D" }`,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transactionDestination.state',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'balance',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'center',
      required: false,
    },
  ];

  public showDatatable: boolean = true;
  public exportPermision: boolean = true;
  public dateSelect: string = 'transactionOrigin.endDate2';
  public startDate: string = '';
  public endDate: string = '';
  public timezone: string = '-03:00';
  public transactionMovement: string;
  public stateSelectOrigin: string = 'Cerrado';
  public stateSelectDestination: string = 'Cerrado';
  public headerButtons: IButton[] = [
    {
      title: 'refresh',
      class: 'btn btn-light',
      icon: 'fa fa-refresh',
      click: `this.addFilters()`,
    },
  ];
  public rowButtons: IButton[] = [
    {
      title: 'view',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `this.emitEvent('view', item, null)`,
    },
  ];
  private readonly dateFilterColumns = [
    'transactionOrigin.creationDate2',
    'transactionOrigin.updateDate2',
    'transactionOrigin.endDate2',
    'transactionDestination.creationDate2',
    'transactionDestination.updateDate2',
    'transactionDestination.endDate2',
  ];
  private destroy$ = new Subject<void>();

  @ViewChild(DatatableComponent) datatableComponent!: DatatableComponent;

  constructor(
    public _service: MovementOfCancellationService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: NgbModal,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.initDateFilters();
    this.setTransactionMovement(this._route.snapshot.params['type']);
    this.updateTitle();
    this.applyMovementFilter();
    this.applyStateFilter();
  }

  ngOnInit(): void {
    this._route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const previousMovement = this.transactionMovement;
      this.setTransactionMovement(params['type']);
      this.updateTitle();

      if (previousMovement && previousMovement !== this.transactionMovement) {
        this.resetListState();
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

  public emitEvent(event: { op: string; obj: any }): void {
    if (event.op === 'view' || event.op === 'on-click') {
      this.openTransaction(event.obj);
    }
  }

  public refresh(): void {
    this.syncAdvancedFilters();
    this.datatableComponent?.refresh();
  }

  public onDatePickerChange(): void {
    this.applyFilters();
  }

  public syncAdvancedFilters(): void {
    this.applyDateFilter();
    this.applyMovementFilter();
    this.applyStateFilter();
  }

  public applyFilters(): void {
    this.syncAdvancedFilters();

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

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    this.startDate = startOfMonth.toISOString();

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

  private applyMovementFilter(): void {
    const movementColumn = this.columns.find((column) => column.name === 'transactionOrigin.type.transactionMovement');
    if (!movementColumn || !this.transactionMovement) {
      return;
    }

    const movementFilter = `"${this.transactionMovement}"`;
    movementColumn.defaultFilter = movementFilter;
    if (this.datatableComponent?.filters) {
      this.datatableComponent.filters['transactionOrigin.type.transactionMovement'] = movementFilter;
    }
  }

  private applyStateFilter(): void {
    this.setColumnFilter('transactionOrigin.state', this.stateSelectOrigin);
    this.setColumnFilter('transactionDestination.state', this.stateSelectDestination);
  }

  private setColumnFilter(columnName: string, value: string): void {
    const column = this.columns.find((item) => item.name === columnName);
    if (!column) {
      return;
    }

    if (value) {
      const filter = `"${value}"`;
      column.defaultFilter = filter;
      if (this.datatableComponent?.filters) {
        this.datatableComponent.filters[columnName] = filter;
      }
    } else {
      delete column.defaultFilter;
      if (this.datatableComponent?.filters) {
        delete this.datatableComponent.filters[columnName];
      }
    }
  }

  private updateTitle(): void {
    this.title = this.transactionMovement
      ? `Movimientos de Cancelaciones de ${this.transactionMovement}`
      : 'Movimientos de Cancelaciones';
  }

  private setTransactionMovement(typeParam?: string): void {
    if (typeParam) {
      const type = typeParam.toLowerCase();
      if (type === 'produccion' || type === 'production') {
        this.transactionMovement = 'Producción';
      } else if (type === 'venta') {
        this.transactionMovement = 'Venta';
      } else if (type === 'compra') {
        this.transactionMovement = 'Compra';
      } else if (type === 'stock') {
        this.transactionMovement = 'Stock';
      } else if (type === 'fondos') {
        this.transactionMovement = 'Fondos';
      } else {
        this.transactionMovement = type.charAt(0).toUpperCase() + type.slice(1);
      }
      return;
    }

    const pathLocation = this._router.url.split('/');
    const listType = pathLocation[2] ? pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1) : '';
    if (listType === 'Compras') {
      this.transactionMovement = 'Compra';
    } else if (listType === 'Ventas') {
      this.transactionMovement = 'Venta';
    } else if (listType === 'Stock') {
      this.transactionMovement = 'Stock';
    } else if (listType === 'Fondos') {
      this.transactionMovement = 'Fondos';
    } else if (listType === 'Production') {
      this.transactionMovement = 'Producción';
    }
  }

  private resetListState(): void {
    this.dateSelect = 'transactionOrigin.endDate2';
    this.stateSelectOrigin = 'Cerrado';
    this.stateSelectDestination = 'Cerrado';
    this.initDateFilters();
    this.applyMovementFilter();
    this.applyStateFilter();
    this.clearUserColumnFilters();
  }

  private recreateDatatable(): void {
    this.showDatatable = false;
    this._changeDetectorRef.detectChanges();
    this.showDatatable = true;
  }

  private clearUserColumnFilters(): void {
    if (!this.datatableComponent?.filters) {
      return;
    }

    for (const column of this.columns) {
      if (this.dateFilterColumns.includes(column.name) || column.defaultFilter) {
        continue;
      }

      delete this.datatableComponent.filters[column.name];
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

  private openTransaction(obj: any): void {
    if (!obj?.transactionOrigin?._id) {
      return;
    }

    const modalRef = this._modalService.open(ViewTransactionComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transactionId = obj.transactionOrigin._id;
    modalRef.componentInstance.readonly = true;
  }
}
