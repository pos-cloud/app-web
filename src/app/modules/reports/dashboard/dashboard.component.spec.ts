import { Title } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { StockMovement, TransactionMovement, TransactionType } from '@types';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { of, throwError } from 'rxjs';

import { DasboardComponent } from './dashboard.component';

type ChartRequest = {
  type: string;
  filters?: {
    branches?: string[];
    saleTransactionTypes?: string[];
    purchaseTransactionTypes?: string[];
  };
};

const FILTERED_CHARTS = [
  'sales-totals',
  'purchase-totals',
  'sales-by-category',
  'top-selling-products',
  'sales-by-month',
];

const TYPES: TransactionType[] = [
  {
    _id: 'v1',
    name: 'Factura',
    transactionMovement: TransactionMovement.Sale,
    modifyStock: true,
    stockMovement: StockMovement.Outflows,
  } as TransactionType,
  {
    _id: 'v2',
    name: 'Presupuesto',
    transactionMovement: TransactionMovement.Sale,
    modifyStock: false,
    stockMovement: StockMovement.Outflows,
  } as TransactionType,
  {
    _id: 'v3',
    name: 'Nota de crédito',
    transactionMovement: TransactionMovement.Sale,
    modifyStock: true,
    stockMovement: StockMovement.Inflows,
  } as TransactionType,
  {
    _id: 'c1',
    name: 'Factura de compra',
    transactionMovement: TransactionMovement.Purchase,
    modifyStock: true,
    stockMovement: StockMovement.Inflows,
  } as TransactionType,
  {
    _id: 'c2',
    name: 'Pedido de compra',
    transactionMovement: TransactionMovement.Purchase,
    modifyStock: false,
    stockMovement: StockMovement.Inflows,
  } as TransactionType,
  {
    _id: 's1',
    name: 'Ajuste',
    transactionMovement: TransactionMovement.Stock,
    modifyStock: true,
    stockMovement: StockMovement.Inventory,
  } as TransactionType,
];

describe('DasboardComponent', () => {
  let getChart: jest.Mock;
  let getAll: jest.Mock;

  beforeEach(() => {
    localStorage.clear();
  });

  async function createComponent(types: TransactionType[] = []): Promise<DasboardComponent> {
    getChart = jest.fn().mockReturnValue(of({}));
    getAll = jest.fn().mockReturnValue(of({ result: types }));

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DasboardComponent],
      providers: [
        { provide: ReportSystemService, useValue: { getChart } },
        { provide: TransactionTypeService, useValue: { getAll } },
        { provide: ToastService, useValue: { showToast: jest.fn() } },
        { provide: Title, useValue: { setTitle: jest.fn() } },
      ],
    })
      .overrideComponent(DasboardComponent, {
        set: {
          imports: [],
          template: '',
          styleUrls: [],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(DasboardComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function chartRequests(): ChartRequest[] {
    return getChart.mock.calls.map((call) => call[0] as ChartRequest);
  }

  function filteredRequests(): ChartRequest[] {
    return chartRequests().filter((request) => FILTERED_CHARTS.includes(request.type));
  }

  it('al crearse pide inventario y deudas sin filtros, y el resto con las listas vacías si no hay tipos', async () => {
    await createComponent();

    expect(getAll).toHaveBeenCalledWith({
      project: { _id: 1, name: 1, transactionMovement: 1, modifyStock: 1, stockMovement: 1 },
      match: { operationType: { $ne: 'D' } },
    });
    expect(chartRequests().filter((request) => request.type === 'inventory-totals')).toEqual([
      { type: 'inventory-totals' },
    ]);
    expect(chartRequests().filter((request) => request.type === 'account-receivable')).toEqual([
      { type: 'account-receivable' },
    ]);
    expect(filteredRequests()).toEqual(
      FILTERED_CHARTS.map((type) => ({
        type,
        filters: {
          branches: [],
          saleTransactionTypes: [],
          purchaseTransactionTypes: [],
        },
      }))
    );
  });

  it('sin preferencia preselecciona los tipos que modifican stock y no los guarda hasta que cambia', async () => {
    const component = await createComponent(TYPES);

    expect(component.saleTransactionTypes.map((type) => type._id)).toEqual(['v1', 'v2', 'v3']);
    expect(component.purchaseTransactionTypes.map((type) => type._id)).toEqual(['c1', 'c2']);
    expect(component.saleTransactionTypesSelect).toEqual(['v1']);
    expect(component.purchaseTransactionTypesSelect).toEqual(['c1']);
    expect(localStorage.getItem('dashboard.typeFilters')).toBeNull();
    expect(filteredRequests()[0].filters).toEqual({
      branches: [],
      saleTransactionTypes: ['v1'],
      purchaseTransactionTypes: ['c1'],
    });
  });

  it('guarda la elección por negocio y la vuelve a usar, descartando ids que ya no existen', async () => {
    localStorage.setItem('company', 'acme');
    localStorage.setItem(
      'dashboard.typeFilters:otra',
      JSON.stringify({ saleTransactionTypes: ['v2'], purchaseTransactionTypes: [] })
    );
    localStorage.setItem(
      'dashboard.typeFilters:acme',
      JSON.stringify({ saleTransactionTypes: ['v2', 'borrado'], purchaseTransactionTypes: [] })
    );

    const component = await createComponent(TYPES);

    expect(component.saleTransactionTypesSelect).toEqual(['v2']);
    expect(component.purchaseTransactionTypesSelect).toEqual([]);
    expect(filteredRequests()[0].filters?.saleTransactionTypes).toEqual(['v2']);
    expect(filteredRequests()[0].filters?.purchaseTransactionTypes).toEqual([]);

    component.onSaleTypesChange(['v1']);

    expect(JSON.parse(localStorage.getItem('dashboard.typeFilters:acme') as string)).toEqual({
      saleTransactionTypes: ['v1'],
      purchaseTransactionTypes: [],
    });
    expect(localStorage.getItem('dashboard.typeFilters:otra')).toContain('v2');
  });

  it('refresh con sucursal y tipos vuelve a pedir los cinco charts con esas listas', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.saleTransactionTypesSelect = ['venta'];
    component.purchaseTransactionTypesSelect = ['compra'];
    getChart.mockClear();

    component.refresh();

    const filters = {
      branches: ['sucursal-1'],
      saleTransactionTypes: ['venta'],
      purchaseTransactionTypes: ['compra'],
    };

    expect(filteredRequests()).toEqual(FILTERED_CHARTS.map((type) => ({ type, filters })));
  });

  it('refresh no pide account-receivable', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.saleTransactionTypesSelect = ['venta'];
    getChart.mockClear();

    component.refresh();

    expect(chartRequests().map((request) => request.type)).not.toContain('account-receivable');
    expect(getChart).toHaveBeenCalled();
  });

  it('refresh no pide inventory-totals si la sucursal no cambió desde la carga', async () => {
    const component = await createComponent();
    component.saleTransactionTypesSelect = ['venta'];
    getChart.mockClear();

    component.refresh();

    expect(chartRequests().map((request) => request.type)).not.toContain('inventory-totals');
    expect(getChart).toHaveBeenCalled();
  });

  it('refresh pide inventory-totals con la sucursal y sin tipos cuando la sucursal cambia, incluso al volver a null', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.saleTransactionTypesSelect = ['venta'];
    getChart.mockClear();

    component.refresh();

    expect(chartRequests().filter((request) => request.type === 'inventory-totals')).toEqual([
      {
        type: 'inventory-totals',
        filters: { branches: ['sucursal-1'] },
      },
    ]);

    getChart.mockClear();
    component.refresh();

    expect(chartRequests().filter((request) => request.type === 'inventory-totals')).toEqual([]);

    component.branchSelectedId = null;
    component.refresh();

    expect(chartRequests().filter((request) => request.type === 'inventory-totals')).toEqual([
      {
        type: 'inventory-totals',
        filters: { branches: [] },
      },
    ]);
  });

  it('si los tipos fallan igual pide los charts sin listas de tipos', async () => {
    getChart = jest.fn().mockReturnValue(of({}));
    getAll = jest.fn().mockReturnValue(throwError(() => ({ message: 'falló' })));

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DasboardComponent],
      providers: [
        { provide: ReportSystemService, useValue: { getChart } },
        { provide: TransactionTypeService, useValue: { getAll } },
        { provide: ToastService, useValue: { showToast: jest.fn() } },
        { provide: Title, useValue: { setTitle: jest.fn() } },
      ],
    })
      .overrideComponent(DasboardComponent, {
        set: { imports: [], template: '', styleUrls: [] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(DasboardComponent);
    fixture.detectChanges();

    expect(filteredRequests()).toEqual(
      FILTERED_CHARTS.map((type) => ({
        type,
        filters: { branches: [] },
      }))
    );
    expect(filteredRequests()[0].filters).not.toHaveProperty('saleTransactionTypes');
    expect(filteredRequests()[0].filters).not.toHaveProperty('purchaseTransactionTypes');
  });
});
