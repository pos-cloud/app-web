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
    transactionTypes?: string[];
  };
};

const CHARTS_ON_LOAD = [
  'sales-totals',
  'purchase-totals',
  'inventory-totals',
  'account-receivable',
  'sales-by-month',
  'sales-by-category',
  'top-selling-products',
];

const CHARTS_ON_REFRESH = [
  'sales-totals',
  'purchase-totals',
  'sales-by-category',
  'top-selling-products',
  'sales-by-month',
];

describe('DasboardComponent', () => {
  let getChart: jest.Mock;
  let getAll: jest.Mock;

  async function createComponent(): Promise<DasboardComponent> {
    getChart = jest.fn().mockReturnValue(of({}));
    getAll = jest.fn().mockReturnValue(of({ result: [] }));

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

  it('al crearse pide los siete charts sin filters y los tipos distintos de D', async () => {
    await createComponent();

    expect(getAll).toHaveBeenCalledWith({
      project: { _id: 1, name: 1 },
      match: { operationType: { $ne: 'D' } },
    });
    expect(chartRequests()).toEqual(CHARTS_ON_LOAD.map((type) => ({ type })));
  });

  it('refresh con sucursal y tipos vuelve a pedir los cinco charts con esos filters', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.transactionTypesSelect = ['venta', 'pedido'];
    getChart.mockClear();

    component.refresh();

    const filters = {
      branches: ['sucursal-1'],
      transactionTypes: ['venta', 'pedido'],
    };
    const refreshed = chartRequests().filter((request) => CHARTS_ON_REFRESH.includes(request.type));

    expect(refreshed).toEqual(CHARTS_ON_REFRESH.map((type) => ({ type, filters })));
  });

  it('refresh no pide account-receivable', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.transactionTypesSelect = ['venta'];
    getChart.mockClear();

    component.refresh();

    expect(chartRequests().map((request) => request.type)).not.toContain('account-receivable');
    expect(getChart).toHaveBeenCalled();
  });

  it('refresh no pide inventory-totals si la sucursal no cambió desde la carga', async () => {
    const component = await createComponent();
    component.transactionTypesSelect = ['venta'];
    getChart.mockClear();

    component.refresh();

    expect(chartRequests().map((request) => request.type)).not.toContain('inventory-totals');
    expect(getChart).toHaveBeenCalled();
  });

  it('refresh pide inventory-totals con la sucursal y sin tipos cuando la sucursal cambia, incluso al volver a null', async () => {
    const component = await createComponent();
    component.branchSelectedId = 'sucursal-1';
    component.transactionTypesSelect = ['venta'];
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
});
