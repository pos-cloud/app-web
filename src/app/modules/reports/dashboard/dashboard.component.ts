import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectDropdownComponent } from '@shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { PipesModule } from '@shared/pipes/pipes.module';
import { TransactionMovement, TransactionType } from '@types';
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
  saleTransactionTypes: string[];
  purchaseTransactionTypes: string[];
};

type StoredDashboardFilters = {
  branchId: string | null;
  saleTransactionTypes: string[];
  purchaseTransactionTypes: string[];
};

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
  topDebtors: { rank: number; name: string; balance: number; balanceFormatted: string }[] = [];
  salesByMonth: Partial<ChartOptions>;
  salesByCategory: Partial<ChartOptions>;
  salesByMake: Partial<ChartOptions>;
  salesCollections: Partial<ChartOptions>;
  topProducts: TopProduct[] = [];

  loading = false;
  filtersOpen = false;
  hasQueried = false;
  branchSelectedId: string | null = null;
  transactionTypes: TransactionType[] = [];
  saleTransactionTypesSelect: string[] = [];
  purchaseTransactionTypesSelect: string[] = [];

  private subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();
  private lastInventoryBranchId: string | null = null;
  private inventoryLoaded = false;
  private receivableLoaded = false;
  private refreshInProgress = false;
  private pendingCharts = 0;

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _title: Title,
    private _transactionTypeService: TransactionTypeService
  ) {}

  ngOnInit(): void {
    this.getTransactionTypes();
    this.restoreFilters();
    this._title.setTitle('Dashboard');
    if (this.hasTypeSelection()) {
      this.filtersOpen = false;
      this.loadCharts();
    } else {
      this.filtersOpen = true;
    }
  }

  public get saleTypes(): TransactionType[] {
    return this.transactionTypes.filter((type) => type.transactionMovement === TransactionMovement.Sale);
  }

  public get purchaseTypes(): TransactionType[] {
    return this.transactionTypes.filter((type) => type.transactionMovement === TransactionMovement.Purchase);
  }

  public hasTypeSelection(): boolean {
    return this.saleTransactionTypesSelect.length > 0 || this.purchaseTransactionTypesSelect.length > 0;
  }

  public refresh(): void {
    if (!this.hasTypeSelection()) {
      this._toastService.showToast({ message: 'Elegí al menos un tipo de venta o de compra.' });
      return;
    }

    this.persistFilters();
    this.filtersOpen = false;
    this.loadCharts();
  }

  private loadCharts(): void {
    this.loading = true;
    this.refreshInProgress = true;
    this.pendingCharts = 0;
    this.hasQueried = true;

    const filters = this.currentFilters();
    this.getSalesTotal(filters);
    this.getPurchaseTotal(filters);
    this.getSalesByCategory(filters);
    this.getSalesByMake(filters);
    this.getTopSellingProducts(filters);
    this.getSalesByMonth(filters);
    this.getSalesCollections(filters);

    const branchId = this.branchSelectedId ?? null;
    if (!this.inventoryLoaded || branchId !== this.lastInventoryBranchId) {
      this.getInventoryTotal(filters.branches);
      this.inventoryLoaded = true;
    }

    if (!this.receivableLoaded) {
      this.getAccountReveivable();
      this.receivableLoaded = true;
    }

    if (this.pendingCharts === 0) {
      this.loading = false;
      this.refreshInProgress = false;
    }
  }

  private filtersStorageKey(): string {
    const company = localStorage.getItem('company') || '';
    return `dashboardFilters:${company}`;
  }

  private restoreFilters(): void {
    const raw = localStorage.getItem(this.filtersStorageKey());
    if (!raw) return;

    try {
      const stored = JSON.parse(raw) as StoredDashboardFilters;
      this.branchSelectedId = stored?.branchId ?? null;
      this.saleTransactionTypesSelect = Array.isArray(stored?.saleTransactionTypes) ? stored.saleTransactionTypes : [];
      this.purchaseTransactionTypesSelect = Array.isArray(stored?.purchaseTransactionTypes)
        ? stored.purchaseTransactionTypes
        : [];
    } catch {
      localStorage.removeItem(this.filtersStorageKey());
    }
  }

  private persistFilters(): void {
    const stored: StoredDashboardFilters = {
      branchId: this.branchSelectedId ?? null,
      saleTransactionTypes: this.saleTransactionTypesSelect,
      purchaseTransactionTypes: this.purchaseTransactionTypesSelect,
    };
    localStorage.setItem(this.filtersStorageKey(), JSON.stringify(stored));
  }

  private getTransactionTypes(): void {
    this._transactionTypeService
      .getAll({
        project: {
          _id: 1,
          name: 1,
          transactionMovement: 1,
        },
        match: {
          operationType: { $ne: 'D' },
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.transactionTypes = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  private currentFilters(): ChartFilters {
    return {
      branches: this.branchSelectedId ? [this.branchSelectedId] : [],
      saleTransactionTypes: this.saleTransactionTypesSelect ?? [],
      purchaseTransactionTypes: this.purchaseTransactionTypesSelect ?? [],
    };
  }

  private chartPayload(type: string, filters?: ChartFilters): { type: string; filters?: ChartFilters } {
    if (!filters) {
      return { type };
    }

    return {
      type,
      filters: {
        branches: filters.branches,
        saleTransactionTypes: filters.saleTransactionTypes ?? [],
        purchaseTransactionTypes: filters.purchaseTransactionTypes ?? [],
      },
    };
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
            const payload = result?.result;
            if (payload && typeof payload === 'object') {
              this.accountReveivable = payload.total;
              this.topDebtors = payload.debtors || [];
              return;
            }
            this.accountReveivable = payload;
            this.topDebtors = [];
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
                  height: 260,
                  width: '100%',
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
              this.salesByCategory = {
                ...result,
                chart: {
                  ...(result.chart || {}),
                  height: 280,
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

  private getSalesByMake(filters?: ChartFilters): void {
    const requestPayload = this.chartPayload('sales-by-make', filters);
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.salesByMake = {
                ...result,
                chart: {
                  ...(result.chart || {}),
                  height: 280,
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

  private getSalesCollections(filters?: ChartFilters): void {
    const requestPayload = this.chartPayload('sales-collections', filters);
    const track = this.beginChart();

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.salesCollections = {
                ...result,
                chart: {
                  ...(result.chart || {}),
                  type: 'bar',
                  height: 280,
                  toolbar: { show: false },
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
