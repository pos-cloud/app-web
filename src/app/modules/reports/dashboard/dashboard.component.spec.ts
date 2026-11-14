import { Title } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { of } from 'rxjs';

import { DasboardComponent } from './dashboard.component';

type ChartRequest = {
  type: string;
  filters?: {
    branches?: string[];
    saleTransactionTypes?: string[];
    purchaseTransactionTypes?: string[];
  };
};

const CHARTS_ON_LOAD = [
  'sales-totals',
  'purchase-totals',
  'inventory-totals',
  'sales-by-category',
  'sales-by-make',
  'top-selling-products',
  'sales-by-month',
  'sales-collections',
];

const CHARTS_ON_REFRESH = [
  'sales-totals',
  'purchase-totals',
  'sales-by-category',
  'sales-by-make',
  'top-selling-products',
  'sales-by-month',
  'sales-collections',
];

describe('DasboardComponent', () => {
  let getChart: jest.Mock;
  let getAll: jest.Mock;
  let showToast: jest.Mock;

  beforeEach(() => {
    localStorage.clear();
  });

  async function createComponent(): Promise<DasboardComponent> {
    getChart = jest.fn().mockReturnValue(of({}));
    getAll = jest.fn().mockReturnValue(of({ result: [] }));
    showToast = jest.fn();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DasboardComponent],
      providers: [
        { provide: ReportSystemService, useValue: { getChart } },
        { provide: TransactionTypeService, useValue: { getAll } },
        { provide: ToastService, useValue: { showToast } },
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

  function saveFilters(filters: {
    branchId: string | null;
    saleTransactionTypes: string[];
    purchaseTransactionTypes: string[];
  }): void {
    localStorage.setItem('company', 'acme');
    localStorage.setItem('dashboardFilters:acme', JSON.stringify(filters));
  }

  it('al crearse no pide charts y sí pide los tipos de venta y compra', async () => {
    const component = await createComponent();

    expect(getAll).toHaveBeenCalledWith({
      project: { _id: 1, name: 1, transactionMovement: 1 },
      match: { operationType: { $ne: 'D' } },
    });
    expect(getChart).not.toHaveBeenCalled();
    expect(component.filtersOpen).toBe(true);
    expect(component.hasQueried).toBe(false);
  });

  it('con una elección guardada pide los charts al entrar y deja los filtros cerrados', async () => {
    saveFilters({
      branchId: 'sucursal-1',
      saleTransactionTypes: ['venta'],
      purchaseTransactionTypes: ['compra'],
    });

    const component = await createComponent();

    const filters = {
      branches: ['sucursal-1'],
      saleTransactionTypes: ['venta'],
      purchaseTransactionTypes: ['compra'],
    };

    expect(component.filtersOpen).toBe(false);
    expect(chartRequests().filter((request) => CHARTS_ON_LOAD.includes(request.type))).toEqual([
      { type: 'sales-totals', filters },
      { type: 'purchase-totals', filters },
      { type: 'sales-by-category', filters },
      { type: 'sales-by-make', filters },
      { type: 'top-selling-products', filters },
      { type: 'sales-by-month', filters },
      { type: 'sales-collections', filters },
      { type: 'inventory-totals', filters: { branches: ['sucursal-1'] } },
    ]);
    expect(chartRequests().map((request) => request.type)).toContain('account-receivable');
  });

  it('refresh sin tipos no consulta la api', async () => {
    const component = await createComponent();

    component.refresh();

    expect(getChart).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalled();
  });

  it('refresh con sucursal y tipos pide los charts, guarda la elección y no repite deudas', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.saleTransactionTypesSelect = ['venta'];
    component.purchaseTransactionTypesSelect = ['compra'];
    localStorage.setItem('company', 'acme');

    component.refresh();

    const filters = {
      branches: ['sucursal-1'],
      saleTransactionTypes: ['venta'],
      purchaseTransactionTypes: ['compra'],
    };
    const refreshed = chartRequests().filter((request) => CHARTS_ON_REFRESH.includes(request.type));

    expect(refreshed).toEqual(CHARTS_ON_REFRESH.map((type) => ({ type, filters })));
    expect(JSON.parse(localStorage.getItem('dashboardFilters:acme') || '{}')).toEqual({
      branchId: 'sucursal-1',
      saleTransactionTypes: ['venta'],
      purchaseTransactionTypes: ['compra'],
    });
    expect(component.filtersOpen).toBe(false);

    getChart.mockClear();
    component.refresh();

    expect(chartRequests().map((request) => request.type)).not.toContain('account-receivable');
    expect(getChart).toHaveBeenCalled();
  });

  it('refresh no pide inventory-totals si la sucursal no cambió desde la primera consulta', async () => {
    const component = await createComponent();
    component.saleTransactionTypesSelect = ['venta'];

    component.refresh();
    getChart.mockClear();
    component.refresh();

    expect(chartRequests().map((request) => request.type)).not.toContain('inventory-totals');
    expect(getChart).toHaveBeenCalled();
  });

  it('refresh pide inventory-totals con la sucursal y sin tipos cuando la sucursal cambia, incluso al volver a null', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.saleTransactionTypesSelect = ['venta'];

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
});
