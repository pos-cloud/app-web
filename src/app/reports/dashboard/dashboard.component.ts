import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  markers: any; //ApexMarkers;
  stroke: any; //ApexStroke;
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
};

const sparkLineData = [47, 45, 54, 38, 56, 24, 65, 31, 37, 39, 62, 51, 35, 41, 35, 27, 93, 53, 61, 27, 54, 43, 19, 46];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, NgbModule, NgMultiSelectDropDownModule, ReactiveFormsModule, NgApexchartsModule],
})
export class DasboardComponent {
  salesTotal: Partial<ChartOptions>;
  inventoryTotal: Partial<ChartOptions>;
  accountReveivable: Partial<ChartOptions>;
  salesByMonth: Partial<ChartOptions>;
  salesByCategory: Partial<ChartOptions>;

  private subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getSalesTotal();
    this.getInventoryTotal();
    this.getAccountReveivable();
    this.getSalesByMonth();
    this.getSalesByCategory();
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
              this.inventoryTotal = result;
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
              this.accountReveivable = result;
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
              this.salesByMonth = result;
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {},
        })
    );
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
}
