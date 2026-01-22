import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementOfCashService } from '@core/services/movement-of-cash.service';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { IAttribute } from '@types';
import { Config } from 'app/app.config';
import { ExportExcelComponent } from 'app/components/export/export-excel/export-excel.component';
import { ExportersModule } from 'app/components/export/exporters.module';
import { ViewTransactionComponentNew } from 'app/modules/transaction/components/view-transactions/view-transactions.component';
import { ColumnsConfigComponent } from 'app/shared/components/columns-config/columns-config.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { DateFormatPipe } from 'app/shared/pipes/date-format.pipe';
import { RoundNumberPipe } from 'app/shared/pipes/round-number.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-list-movement-of-cash',
  templateUrl: './list-movement-of-cash.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ProgressbarModule,
    TranslateModule,
    ExportersModule,
    DateTimePickerComponent,
    ColumnsConfigComponent,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ListMovementOfCashComponent implements OnInit, OnDestroy {
  public title: string = 'Movimientos de Caja';
  public loading: boolean = false;
  public sort: any = { 'transaction.endDate': -1 };
  public columns: IAttribute[] = [
    {
      name: 'transaction.endDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      align: 'left',
      required: true,
    },
    {
      name: 'transaction.cashBox.number',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'transaction.type.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'transaction.company.identificationValue',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'type._id',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
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
      name: 'quota',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'number',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'amountPaid',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'discount',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'right',
      required: false,
    },
    {
      name: 'number',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'bank.name',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'expirationDate',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'date',
      align: 'left',
      required: false,
    },
    {
      name: 'expirationDate2',
      visible: false,
      disabled: true,
      filter: false,
      datatype: 'date',
      project: `"$expirationDate"`,
      align: 'left',
      required: true,
    },
    {
      name: 'statusCheck',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
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
      name: 'transaction.observation',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'interestAmount',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'balanceCanceled',
      visible: true,
      disabled: false,
      filter: true,
      datatype: 'currency',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'transaction.company.name',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'deliveredBy',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
    },
    {
      name: 'CUIT',
      visible: false,
      disabled: false,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: false,
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
      name: 'transaction.type.transactionMovement',
      visible: false,
      disabled: true,
      filter: true,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transaction._id',
      visible: false,
      disabled: true,
      filter: true,
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
      defaultFilter: `{ "$ne": "Abierto" }`,
      project: null,
      align: 'left',
      required: true,
    },
    {
      name: 'transaction.branchDestination._id',
      visible: false,
      disabled: true,
      filter: true,
      defaultFilter: null,
      datatype: 'string',
      project: null,
      align: 'left',
      required: true,
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
  public dateSelect: string = 'transaction.endDate';
  public transactionMovement: string;
  public pathLocation: string[];
  private identifier: string = 'list-movement-of-cash';

  private subscription: Subscription = new Subscription();
  private roundNumberPipe: RoundNumberPipe = new RoundNumberPipe();
  private currencyPipe: CurrencyPipe = new CurrencyPipe('es-Ar');
  private dateFormatPipe: DateFormatPipe = new DateFormatPipe();
  @ViewChild(ExportExcelComponent) exportExcelComponent: ExportExcelComponent;

  constructor(
    public _service: MovementOfCashService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _toastService: ToastService,
    private _modalService: NgbModal
  ) {
    // Inicializar fechas por defecto (hoy)
    this.setTodayDates();

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

  private setTodayDates(): void {
    // Inicializar con fecha de hoy a las 00:00:00 para inicio
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    this.startDate = startOfToday.toISOString();

    // Inicializar con fecha de hoy a las 23:59:59 para fin
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    this.endDate = endOfToday.toISOString();
  }

  ngOnInit(): void {
    if (Config.timezone && Config.timezone !== '') {
      this.timezone = Config.timezone.split('UTC')[1];
    }

    // Asegurar que las fechas siempre sean de hoy
    this.setTodayDates();

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
    match += `"transaction.type.transactionMovement": "${this.transactionMovement}",`;

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
        .getAll({
          project, // PROJECT
          match, // MATCH
          sort: this.sort, // SORT
          group, // GROUP
          limit, // LIMIT
          skip, // SKIP
        })
        .subscribe(
          (result: any) => {
            this.loading = false;
            if (result && result.result && result.result[0] && result.result[0].items) {
              if (this.itemsPerPage === 0) {
                this.exportExcelComponent.items = result.result[0].items;
                this.exportExcelComponent.export();
                this.itemsPerPage = 10;
                this.getItems();
              } else {
                this.items = result.result[0].items;
                this.totalItems = result.result[0].count;
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
    if (!obj || !obj.transaction || !obj.transaction._id) {
      return;
    }

    if (op === 'view') {
      const modalRef = this._modalService.open(ViewTransactionComponentNew, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.transactionId = obj.transaction._id;
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
