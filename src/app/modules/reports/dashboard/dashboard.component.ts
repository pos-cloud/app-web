import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
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

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, NgbModule, ReactiveFormsModule, NgApexchartsModule],
})
export class DasboardComponent {
  salesTotal: Partial<ChartOptions>;
  purchaseTotal: Partial<ChartOptions>;
  inventoryTotal: string;
  accountReveivable: string;
  salesByMonth: Partial<ChartOptions>;
  salesByCategory: Partial<ChartOptions>;
  topProducts: TopProduct[] = [];

  private subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(private _service: ReportSystemService, private _toastService: ToastService, private _title: Title) {}

  ngOnInit(): void {
    this.getSalesTotal();
    this.getPurchaseTotal();
    this.getInventoryTotal();
    this.getAccountReveivable();
    this.getSalesByMonth();
    this.getSalesByCategory();
    this.getTopSellingProducts();
    this._title.setTitle('Dashboard');
  }

  private getSalesTotal(): void {
    const requestPayload = {
      type: 'sales-totals',
    };

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
          },
          complete: () => {},
        })
    );
  }

  private getPurchaseTotal(): void {
    const requestPayload = {
      type: 'purchase-totals',
    };

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
          },
          complete: () => {},
        })
    );
  }

  private getInventoryTotal(): void {
    const requestPayload = {
      type: 'inventory-totals',
    };

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
          },
          complete: () => {},
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

  private getSalesByMonth(): void {
    const requestPayload = {
      type: 'sales-by-month',
    };

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
          },
          complete: () => {},
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

  private getSalesByCategory(): void {
    const requestPayload = {
      type: 'sales-by-category',
    };

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
          },
          complete: () => {},
        })
    );
  }

  private getTopSellingProducts(): void {
    const requestPayload = {
      type: 'top-selling-products',
    };

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
          },
          complete: () => {},
        })
    );
  }
}
