import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { MovementOfCancellationService } from '@core/services/movement-of-cancellation.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { IAttribute } from '@types';
import { Config } from 'app/app.config';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { ColumnsConfigComponent } from 'app/shared/components/columns-config/columns-config.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { ExportExcelComponent } from 'app/shared/components/export-excel/export-excel.component';
import { ExportExcelModule } from 'app/shared/components/export-excel/export-excel.module';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { DateFormatPipe } from 'app/shared/pipes/date-format.pipe';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list-movement-of-cancellation',
  templateUrl: './list-movements-of-cancellation.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ProgressbarModule,
    TranslateModule,
    ExportExcelModule,
    DateTimePickerComponent,
    ColumnsConfigComponent,
  ],
  encapsulation: ViewEncapsulation.None,
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

  public items: any[] = [];
  public totalItems: number = 0;
  public itemsPerPage: number = 10;
  public currentPage: number = 1;
  public filters: any = {};
  public timezone: string = '-03:00';

  // Filtros de fecha por defecto
  public startDate: string;
  public endDate: string;
  public dateSelect: string = 'transactionOrigin.endDate';
  public stateSelectOrigin: string = 'Cerrado';
  public stateSelectDestination: string = 'Cerrado';
  public transactionMovement: string;
  public pathLocation: string[];
  private identifier: string = 'list-movements-of-cancellation';
  public export;

  private subscription: Subscription = new Subscription();
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  private dateFormatPipe: DateFormatPipe = new DateFormatPipe();
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;
  private destroy$ = new Subject<void>();

  constructor(
    public _service: MovementOfCancellationService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private _authService: AuthService
  ) {
    this.setDefaultDates();

    // Inicializar filtros (igual que ListTransactionsComponent)
    this.filters = new Array();
    for (let field of this.columns) {
      if (field.defaultFilter) {
        this.filters[field.name] = field.defaultFilter;
      } else {
        this.filters[field.name] = '';
      }
    }
  }

  private setDefaultDates(): void {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    this.startDate = startOfMonth.toISOString();

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    this.endDate = endOfToday.toISOString();
  }

  ngOnInit(): void {
    this._authService.getIdentity.pipe(takeUntil(this.destroy$)).subscribe((identity) => {
      this.export = true;
    });
    if (Config.timezone && Config.timezone !== '') {
      this.timezone = Config.timezone.split('UTC')[1];
    }

    // Cargar visibilidad de columnas guardada
    this.loadColumnVisibility();

    // Obtener transactionMovement desde el parámetro de ruta
    this._route.params.subscribe((params) => {
      if (params['type']) {
        let type = params['type'].toLowerCase();
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
      } else {
        // Fallback: obtener desde la URL (igual que ListTransactionsComponent)
        this.pathLocation = this._router.url.split('/');
        let listType = this.pathLocation[2]
          ? this.pathLocation[2].charAt(0).toUpperCase() + this.pathLocation[2].slice(1)
          : '';
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
      this.getItems();
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getItems(): void {
    this.loading = true;

    // FILTRAMOS LA CONSULTA
    let match = `{`;

    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        let value = this.filters[this.columns[i].name];

        if (value && value != '') {
          if (this.columns[i].defaultFilter) {
            match += `"${this.columns[i].name}": ${this.columns[i].defaultFilter}`;
          } else {
            if (this.columns[i].name.includes('_id')) {
              match += `"${this.columns[i].name}": { "$oid": "${value}" }`;
            } else {
              if (value.includes('$')) {
                match += `"${this.columns[i].name}": { ${value} }`;
              } else {
                match += `"${this.columns[i].name}": { "$regex": "${value}", "$options": "i"}`;
              }
            }
          }
          if (i < this.columns.length - 1) {
            match += ',';
          }
        }
      }
    }

    if (match.charAt(match.length - 1) === '}') match += ',';
    match += `"transactionOrigin.type.transactionMovement": "${this.transactionMovement}",`;
    match += `"transactionOrigin.state": "${this.stateSelectOrigin}",`;
    match += `"transactionDestination.state": "${this.stateSelectDestination}",`;

    // Convertir fechas ISO a formato para la consulta
    const startDateStr = this.startDate
      ? new Date(this.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    const endDateStr = this.endDate
      ? new Date(this.endDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    match += `"${this.dateSelect}" : {
                    "$gte" : { "$date" : "${startDateStr}T00:00:00${this.timezone}" },
                    "$lte" : { "$date" : "${endDateStr}T23:59:59${this.timezone}" }
                }`;

    if (match.charAt(match.length - 1) === ',') match = match.substring(0, match.length - 1);

    match += `}`;

    match = JSON.parse(match);

    // ARMAMOS EL PROJECT SEGÚN DISPLAYCOLUMNS
    let project = `{`;
    let j = 0;

    for (let i = 0; i < this.columns.length; i++) {
      if (this.columns[i].visible || this.columns[i].required) {
        if (j > 0) {
          project += `,`;
        }
        j++;

        if (this.columns[i].project === null || this.columns[i].project === undefined) {
          project += `"${this.columns[i].name}": 1`;
        } else {
          project += `"${this.columns[i].name}": ${this.columns[i].project}`;
        }
      }
    }
    project += `}`;

    project = JSON.parse(project);

    // AGRUPAMOS EL RESULTADO
    let group = {
      _id: null,
      count: { $sum: 1 },
      items: { $push: '$$ROOT' },
    };

    let page = 0;

    if (this.currentPage != 0) {
      page = this.currentPage - 1;
    }
    let skip = !isNaN(page * this.itemsPerPage) ? page * this.itemsPerPage : 0; // SKIP
    let limit = this.itemsPerPage;

    this.subscription.add(
      this._service
        .getMovementsOfCancellations(
          project, // PROJECT
          match, // MATCH
          this.sort, // SORT
          group, // GROUP
          limit, // LIMIT
          skip // SKIP
        )
        .subscribe(
          (result: any) => {
            this.loading = false;
            const data = this.parseListResult(result);
            if (data) {
              if (this.itemsPerPage === 0) {
                this.exportExcelComponent.items = data.items;
                this.exportExcelComponent.export();
                this.itemsPerPage = 10;
                this.getItems();
              } else {
                this.items = data.items;
                this.totalItems = data.count;
              }
            } else {
              this.items = new Array();
              this.totalItems = 0;
            }
          },
          (error: any) => {
            this.loading = false;
            this.totalItems = 0;
            this._toastService.showToast(error);
          }
        )
    );
  }

  private parseListResult(result: any): { items: any[]; count: number } | null {
    const group = result?.result?.[0] ?? result?.[0];
    if (group?.items) {
      return { items: group.items, count: group.count ?? group.items.length };
    }
    return null;
  }

  public getValue(item: any, column: IAttribute): any {
    let val: string = 'item';
    let exists: boolean = true;
    let value: any = '';

    for (let a of column.name.split('.')) {
      val += '.' + a;
      if (exists && !eval(val)) {
        exists = false;
      }
    }

    if (exists) {
      switch (column.datatype) {
        case 'number':
          value = this.roundNumberPipe.transform(eval(val));
          break;
        case 'currency':
          value = this.currencyPipe.transform(
            this.roundNumberPipe.transform(eval(val)),
            'USD',
            'symbol-narrow',
            '1.2-2'
          );
          break;
        case 'percent':
          value = this.roundNumberPipe.transform(eval(val)) + '%';
          break;
        case 'date':
          value = this.dateFormatPipe.transform(eval(val), 'DD/MM/YYYY');
          break;
        default:
          value = eval(val);
          break;
      }
    }
    return value;
  }

  public pageChange(page: number): void {
    this.currentPage = page;
    this.getItems();
  }

  public onItemsPerPageChange(): void {
    this.currentPage = 1; // Resetear a la primera página cuando cambia itemsPerPage
    this.getItems();
  }

  public exportItems(): void {
    this.loading = true;
    this.itemsPerPage = 0; // Para obtener todos los items
    this.getItems();
  }

  public orderBy(columnName: string): void {
    if (this.sort[columnName]) {
      this.sort[columnName] = this.sort[columnName] * -1;
    } else {
      this.sort = {} as any;
      this.sort[columnName] = 1;
    }
    this.getItems();
  }

  public getColumnsVisibles(): number {
    return this.columns.filter((column) => column.visible).length;
  }

  public openModal(op: string, obj: any): void {
    if (!obj || !obj.transactionOrigin || !obj.transactionOrigin._id) {
      return;
    }

    if (op === 'view') {
      const modalRef = this._modalService.open(ViewTransactionComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.transactionId = obj.transactionOrigin._id;
      modalRef.componentInstance.readonly = true;
    }
  }

  public refresh(): void {
    this.getItems();
  }

  public onColumnsChange(updatedColumns: IAttribute[]): void {
    // Actualizar las columnas manteniendo la referencia
    this.columns.length = 0;
    this.columns.push(...updatedColumns);
    // Guardar el orden de las columnas
    this.saveColumnOrder();
    this.getItems();
  }

  public loadColumnVisibility(): void {
    const storedColumnVisibility = JSON.parse(localStorage.getItem(`${this.identifier}_columnVisibility`) || '{}');

    this.columns.forEach((column) => {
      if (storedColumnVisibility[column.name] !== undefined) {
        column.visible = storedColumnVisibility[column.name];
      }
    });

    // Cargar el orden de las columnas guardado
    this.loadColumnOrder();
  }

  public saveColumnVisibility(): void {
    // Guardar solo la visibilidad de las columnas en localStorage
    const columnVisibility = {};
    this.columns.forEach((column) => {
      columnVisibility[column.name] = column.visible;
    });
    localStorage.setItem(`${this.identifier}_columnVisibility`, JSON.stringify(columnVisibility));
    this.getItems();
  }

  private loadColumnOrder(): void {
    const storedOrder = JSON.parse(localStorage.getItem(`${this.identifier}_columnOrder`) || '[]');

    if (storedOrder.length > 0) {
      // Crear un mapa de columnas por nombre para acceso rápido
      const columnMap = new Map(this.columns.map((col) => [col.name, col]));

      // Crear el nuevo orden basado en el orden guardado
      const orderedColumns: IAttribute[] = [];
      const usedColumns = new Set<string>();

      // Primero agregar las columnas en el orden guardado
      storedOrder.forEach((columnName: string) => {
        const column = columnMap.get(columnName);
        if (column) {
          orderedColumns.push(column);
          usedColumns.add(columnName);
        }
      });

      // Agregar las columnas que no estaban en el orden guardado (columnas nuevas)
      this.columns.forEach((column) => {
        if (!usedColumns.has(column.name)) {
          orderedColumns.push(column);
        }
      });

      // Actualizar el array de columnas con el orden cargado
      this.columns.length = 0;
      this.columns.push(...orderedColumns);
    } else {
      // Si no hay orden guardado, ordenar poniendo primero las columnas visibles
      this.columns.sort((a, b) => {
        if (a.visible && !b.visible) return -1;
        if (!a.visible && b.visible) return 1;
        return 0;
      });
    }
  }

  private saveColumnOrder(): void {
    // Guardar el orden como un array de nombres de columnas
    const columnOrder = this.columns.map((column) => column.name);
    localStorage.setItem(`${this.identifier}_columnOrder`, JSON.stringify(columnOrder));
  }
}
