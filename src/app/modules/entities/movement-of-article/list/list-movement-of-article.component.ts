import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { MovementOfArticleService } from '@core/services/movement-of-article.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IAttribute, IButton } from '@types';
import { Config } from 'app/app.config';
import { DatatableComponent } from 'app/components/datatable/datatable.component';
import { DatatableModule } from 'app/components/datatable/datatable.module';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-movement-of-articles',
  templateUrl: './list-movement-of-article.component.html',
  styleUrls: ['./list-movement-of-article.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, DatatableModule, DateTimePickerComponent],
})
export class ListMovementOfArticleComponent implements OnInit, OnDestroy {
  public title: string = 'Movimientos de Artículos';
  public loading: boolean = false;
  public sort: any = { 'transaction.endDate': -1 };
  public columns: IAttribute[] = [
    {
      name: 'transaction.endDate',
      visible: true,
      disabled: true,
      filter: true,
      datatype: 'date',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transaction.type.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.origin',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.letter',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.number',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: `{"$toString" : "$transaction.number"}`,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.company.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.company.state.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.company.phones',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.company.address',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{"$trim":{"input":{"$concat":[{"$ifNull":["$transaction.company.address",""]}," ",{"$ifNull":["$transaction.company.addressNumber",""]}]}}}`,
      align: 'left',
      required: false,
    },
    {
      name: 'transaction.company.city',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'transaction.employeeClosing.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'center',
      required: false,
    },
    {
      name: 'code',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'codeSAT',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.barcode',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'description',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'category.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.posDescription',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'notes',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'observation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'make.description',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.provider.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.season',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'taxes',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: `{"$ifNull":[{"$sum":{"$ifNull":["$taxes.taxAmount", []]}}, 0]}`,
      align: 'right',
      required: false,
    },
    {
      name: 'priceWithoutTax',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: `{"$subtract":["$salePrice", {"$ifNull":[{"$sum":{"$ifNull":["$taxes.taxAmount", []]}}, 0]}]}`,
      align: 'right',
      required: false,
    },
    //   {
    //     name: 'amount',
    //     visible: true,
    //     disabled: false,
    //     filter: true,
    //     datatype: 'number',
    //     project: `{
    //   "$cond": {
    //     "if": {
    //       "$or": [
    //         {
    //           "$and": [
    //             { "$eq": ["$transaction.type.movement", "Entrada"] },
    //             { "$eq": ["$transaction.type.transactionMovement", "Venta"] }
    //           ]
    //         },
    //         {
    //           "$and": [
    //             { "$eq": ["$transaction.type.movement", "Cobra"] },
    //             { "$eq": ["$transaction.type.transactionMovement", "Venta"] }
    //           ]
    //         },
    //         {
    //           "$and": [
    //             { "$eq": ["$transaction.type.movement", "Entrada"] },
    //             { "$eq": ["$transaction.type.transactionMovement", "Compra"] }
    //           ]
    //         }
    //       ]
    //     },
    //     "then": { "$multiply": ["$amount", 1] },
    //     "else": { "$multiply": ["$amount", -1] }
    //   }
    // }`,
    //     align: 'right',
    //     required: false,
    //   },
    {
      name: 'amount',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'discountRate',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'percent',
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
      name: 'transactionDiscountAmount',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'basePrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'costPrice',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'unitPrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'markupPercentage',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'percent',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'markupPriceWithoutVAT',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'markupPrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'salePrice',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'roundingAmount',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'quotation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'deposit.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'deposit.branch.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'article.containsStructure',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString" : "$article.containsStructure"}`,
      align: 'left',
      required: false,
    },
    {
      name: 'quantityForStock',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'printed',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'read',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'status',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'measure',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'quantityMeasure',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'modifyStock',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString" : "$modifyStock"}`,
      align: 'left',
      required: false,
    },
    {
      name: 'isOptional',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString" : "$isOptional"}`,
      align: 'left',
      required: false,
    },
    {
      name: 'isGeneratedByPayment',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: `{ "$toString" : "$isGeneratedByPayment"}`,
      align: 'left',
      required: false,
    },
    {
      name: 'op',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'creationDate',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'date',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'updateDate',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'date',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'transaction.type.transactionMovement',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transaction.creationDate',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'date',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transaction.updateDate',
      visible: false,
      disabled: false,
      filter: false,
      datatype: 'date',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transaction.state',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transaction._id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'article._id',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'category._id',
      visible: false,
      disabled: true,
      filter: true,
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
    {
      name: 'transaction.operationType',
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
      name: 'endDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$transaction.endDate"`,
      align: 'right',
      required: true,
    },
    {
      name: 'transaction.type._id',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'creationDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$transaction.creationDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'updateDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$transaction.updateDate"`,
      align: 'left',
      required: true,
    },
  ];

  public showDatatable: boolean = true;
  public exportPermision: boolean = false;
  public dateSelect: string = 'endDate2';
  public startDate: string = '';
  public endDate: string = '';
  public timezone: string = '-03:00';
  public transactionMovement: string;
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
  private readonly dateFilterColumns = ['creationDate2', 'updateDate2', 'endDate2'];
  private destroy$ = new Subject<void>();

  @ViewChild(DatatableComponent) datatableComponent!: DatatableComponent;

  constructor(
    public _service: MovementOfArticleService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _modalService: NgbModal,
    private _authService: AuthService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.initDateFilters();
    this.setTransactionMovement(this._route.snapshot.params['type']);
    this.updateTitle();
    this.applyMovementFilter();
  }

  ngOnInit(): void {
    this.getPermissions();
    this._route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const previousMovement = this.transactionMovement;
      this.setTransactionMovement(params['type']);
      this.updateTitle();
      this.syncAdvancedFilters();

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

  public emitEvent(event: { op: string; obj: any }): void {
    if (event.op === 'view' || event.op === 'on-click') {
      this.openTransaction(event.obj);
    }
  }

  public refresh(): void {
    this.syncAdvancedFilters();
    this.datatableComponent?.refresh();
  }

  public syncAdvancedFilters(): void {
    this.applyDateFilter();
    this.applyMovementFilter();
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

  private applyMovementFilter(): void {
    const movementColumn = this.columns.find((column) => column.name === 'transaction.type.transactionMovement');
    if (!movementColumn || !this.transactionMovement) {
      return;
    }

    const movementFilter = `"${this.transactionMovement}"`;
    movementColumn.defaultFilter = movementFilter;
    if (this.datatableComponent?.filters) {
      this.datatableComponent.filters['transaction.type.transactionMovement'] = movementFilter;
    }
  }

  private updateTitle(): void {
    this.title = this.transactionMovement
      ? `Movimientos de Artículos de ${this.transactionMovement}`
      : 'Movimientos de Artículos';
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

  private recreateDatatable(): void {
    this.showDatatable = false;
    this._changeDetectorRef.detectChanges();
    this.showDatatable = true;
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
      if (identity) {
        this.exportPermision = identity.permission?.collections?.movementsOfArticles?.export === true;
      }
    });
  }

  private openTransaction(obj: any): void {
    if (!obj?.transaction?._id) {
      return;
    }

    const modalRef = this._modalService.open(ViewTransactionComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.transactionId = obj.transaction._id;
  }
}
