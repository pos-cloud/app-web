import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectDropdownComponent } from '@shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { PipesModule } from '@shared/pipes/pipes.module';
import { StockMovement, TransactionMovement, TransactionType } from '@types';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { UserBranchSelectComponent } from 'app/shared/components/user-branch-select/user-branch-select.component';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  markers: any;
  stroke: any;
  yaxis: ApexYAxis | ApexYAxis[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
  labels: string[] | number[];
  title: ApexTitleSubtitle;
  subtitle: ApexTitleSubtitle;
  responsive: ApexResponsive[];
  legend: ApexLegend;
  fill: ApexFill;
  tooltip: ApexTooltip;
  grid?: any;
};

export type TopProduct = {
  rank: number;
  description: string;
  code: string;
  quantity: number;
  total: number;
  totalFormatted: string;
};

type ChartFilters = {
  branches: string[];
  saleTransactionTypes?: string[];
  purchaseTransactionTypes?: string[];
};

type StoredTypeFilters = {
  saleTransactionTypes: string[];
  purchaseTransactionTypes: string[];
};

const TYPE_FILTERS_KEY = 'dashboard.typeFilters';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    MultiSelectDropdownComponent,
    UserBranchSelectComponent,
  ],
})
export class DasboardComponent {
  salesTotal: Partial<ChartOptions>;
  purchaseTotal: Partial<ChartOptions>;
  inventoryTotal: string;
  accountReveivable: string;
  salesByMonth: Partial<ChartOptions>;
  salesByCategory: Partial<ChartOptions>;
  topProducts: TopProduct[] = [];

  loading = false;
  branchSelectedId: string | null = null;
  saleTransactionTypes: TransactionType[] = [];
  purchaseTransactionTypes: TransactionType[] = [];
  saleTransactionTypesSelect: string[] = [];
  purchaseTransactionTypesSelect: string[] = [];

  private subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();
  private lastInventoryBranchId: string | null = null;
  private refreshInProgress = false;
  private pendingCharts = 0;
  private typesLoaded = false;

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _title: Title,
    private _transactionTypeService: TransactionTypeService
  ) {}

  ngOnInit(): void {
    this.getInventoryTotal();
    this.getAccountReveivable();
    this.getTransactionTypes();
    this._title.setTitle('Dashboard');
  }

  public refresh(): void {
    this.loading = true;
    this.refreshInProgress = true;
    this.pendingCharts = 0;

    const filters = this.currentFilters();
    this.loadFilteredCharts(filters);

    const branchId = this.branchSelectedId ?? null;
    if (branchId !== this.lastInventoryBranchId) {
      this.getInventoryTotal(filters.branches);
    }

    if (this.pendingCharts === 0) {
      this.loading = false;
      this.refreshInProgress = false;
    }
  }

  public persistTypeFilters(): void {
    if (!this.typesLoaded) {
      return;
    }

    const payload: StoredTypeFilters = {
      saleTransactionTypes: this.saleTransactionTypesSelect ?? [],
      purchaseTransactionTypes: this.purchaseTransactionTypesSelect ?? [],
    };
    localStorage.setItem(this.typeFiltersKey(), JSON.stringify(payload));
  }

  public onSaleTypesChange(ids: string[]): void {
    this.saleTransactionTypesSelect = ids ?? [];
    this.persistTypeFilters();
  }

  public onPurchaseTypesChange(ids: string[]): void {
    this.purchaseTransactionTypesSelect = ids ?? [];
    this.persistTypeFilters();
  }

  private getTransactionTypes(): void {
    this._transactionTypeService
      .getAll({
        project: {
          _id: 1,
          name: 1,
          transactionMovement: 1,
          modifyStock: 1,
          stockMovement: 1,
        },
        match: {
          operationType: { $ne: 'D' },
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.applyTypeSelection(result?.result ?? []);
          this.loadFilteredCharts(this.currentFilters());
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loadFilteredCharts(this.currentFilters());
        },
      });
  }

  private applyTypeSelection(types: TransactionType[]): void {
    const sales = types.filter((type) => type.transactionMovement === TransactionMovement.Sale);
    const purchases = types.filter((type) => type.transactionMovement === TransactionMovement.Purchase);
    this.saleTransactionTypes = sales;
    this.purchaseTransactionTypes = purchases;

    const stored = this.readStoredTypeFilters();
    if (stored) {
      const saleIds = new Set(sales.map((type) => type._id));
      const purchaseIds = new Set(purchases.map((type) => type._id));
      this.saleTransactionTypesSelect = stored.saleTransactionTypes.filter((id) => saleIds.has(id));
      this.purchaseTransactionTypesSelect = stored.purchaseTransactionTypes.filter((id) =>
        purchaseIds.has(id)
      );
    } else {
      this.saleTransactionTypesSelect = sales
        .filter((type) => type.modifyStock && type.stockMovement === StockMovement.Outflows)
        .map((type) => type._id);
      this.purchaseTransactionTypesSelect = purchases
        .filter((type) => type.modifyStock && type.stockMovement === StockMovement.Inflows)
        .map((type) => type._id);
    }

    this.typesLoaded = true;
  }

  private readStoredTypeFilters(): StoredTypeFilters | null {
    try {
      const raw = localStorage.getItem(this.typeFiltersKey());
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as StoredTypeFilters;
      if (!Array.isArray(parsed?.saleTransactionTypes) || !Array.isArray(parsed?.purchaseTransactionTypes)) {
        return null;
      }

      return {
        saleTransactionTypes: parsed.saleTransactionTypes.filter((id) => typeof id === 'string'),
        purchaseTransactionTypes: parsed.purchaseTransactionTypes.filter((id) => typeof id === 'string'),
      };
    } catch {
      return null;
    }
  }

  private typeFiltersKey(): string {
    const company = (localStorage.getItem('company') ?? '').trim();
    return company ? `${TYPE_FILTERS_KEY}:${company}` : TYPE_FILTERS_KEY;
  }

  private loadFilteredCharts(filters?: ChartFilters): void {
    this.getSalesTotal(filters);
    this.getPurchaseTotal(filters);
    this.getSalesByCategory(filters);
    this.getTopSellingProducts(filters);
    this.getSalesByMonth(filters);
  }

  private currentFilters(): ChartFilters {
    const filters: ChartFilters = {
      branches: this.branchSelectedId ? [this.branchSelectedId] : [],
    };

    if (this.typesLoaded) {
      filters.saleTransactionTypes = this.saleTransactionTypesSelect ?? [];
      filters.purchaseTransactionTypes = this.purchaseTransactionTypesSelect ?? [];
    }

    return filters;
  }

  private chartPayload(type: string, filters?: ChartFilters): { type: string; filters?: ChartFilters } {
    if (!filters) {
      return { type };
    }

    return { type, filters };
  }

  private beginChart(): boolean {
    if (!this.refreshInProgress) {
      return false;
    }

    this.pendingCharts++;
    return true;
  }

  private endChart(track: boolean): void {
    if (!track) {
      return;
    }

    this.pendingCharts--;
    if (this.pendingCharts <= 0) {
      this.pendingCharts = 0;
      this.loading = false;
      this.refreshInProgress = false;
    }
  }

  private getSalesTotal(filters?: ChartFilters): void {
    const requestPayload = this.chartPayload('sales-totals', filters);
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.salesTotal = result;
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.endChart(track);
          },
          complete: () => {
            this.endChart(track);
          },
        })
    );
  }

  private getPurchaseTotal(filters?: ChartFilters): void {
    const requestPayload = this.chartPayload('purchase-totals', filters);
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.purchaseTotal = result;
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.endChart(track);
          },
          complete: () => {
            this.endChart(track);
          },
        })
    );
  }

  private getInventoryTotal(branches?: string[]): void {
    const requestPayload =
      branches === undefined
        ? {
            type: 'inventory-totals',
          }
        : {
            type: 'inventory-totals',
            filters: {
              branches,
            },
          };
    this.lastInventoryBranchId = this.branchSelectedId ?? null;
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.inventoryTotal = result.result;
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.endChart(track);
          },
          complete: () => {
            this.endChart(track);
          },
        })
    );
  }

  private getAccountReveivable(): void {
    const requestPayload = {
      type: 'account-receivable',
    };

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.accountReveivable = result.result;
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {},
        })
    );
  }

  private getSalesByMonth(filters?: ChartFilters): void {
    const requestPayload = this.chartPayload('sales-by-month', filters);
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.salesByMonth = {
                ...result,
                chart: {
                  ...(result.chart || {}),
                  type: 'line',
                  height: result.chart?.height || 360,
                  toolbar: { show: false },
                  zoom: { enabled: false },
                },
                stroke: {
                  curve: 'smooth',
                  width: 3,
                },
                markers: {
                  size: 4,
                  hover: { size: 6 },
                },
                colors: result.colors || ['#2563eb', '#10b981'],
                yaxis: {
                  ...(result.yaxis || {}),
                  decimalsInFloat: 2,
                  labels: {
                    ...(result.yaxis?.labels || {}),
                    formatter: (val: number) => this.formatMoney(val),
                  },
                },
                tooltip: {
                  ...(result.tooltip || {}),
                  y: {
                    formatter: (val: number) => `$ ${this.formatMoney(val)}`,
                  },
                },
              };
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.endChart(track);
          },
          complete: () => {
            this.endChart(track);
          },
        })
    );
  }

  private formatMoney(value: number | string | null | undefined): string {
    const amount = Number(value) || 0;
    return amount.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private getSalesByCategory(filters?: ChartFilters): void {
    const requestPayload = this.chartPayload('sales-by-category', filters);
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.salesByCategory = result;
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.endChart(track);
          },
          complete: () => {
            this.endChart(track);
          },
        })
    );
  }

  private getTopSellingProducts(filters?: ChartFilters): void {
    const requestPayload = this.chartPayload('top-selling-products', filters);
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result?.products) {
              this.topProducts = result.products;
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.endChart(track);
          },
          complete: () => {
            this.endChart(track);
          },
        })
    );
  }
}
