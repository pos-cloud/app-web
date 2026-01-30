import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import {
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type ByTypeChartOptions = {
  series: { name: string; data: number[] }[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  colors: string[];
};

interface SubscriptionGroup {
  clients: number;
  estimatedMoney: number;
}

interface ActiveSubscriptionData {
  activeSubscription: SubscriptionGroup;
  inactiveSubscription: SubscriptionGroup;
}

interface IncomeByType {
  typeId: unknown;
  type: string;
  total: string;
  count: number;
}

interface SubscriptionChartResponse {
  activeSubscription: ActiveSubscriptionData;
  totalIncome: string;
  byType: IncomeByType[];
}

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule, NgApexchartsModule],
})
export class SubscriptionComponent {
  loading = false;
  data: SubscriptionChartResponse | null = null;
  byTypeChartOptions: Partial<ByTypeChartOptions> | null = null;

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  months: { value: number; label: string }[] = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  years: number[] = [];

  private subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _title: Title
  ) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 10; y--) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this._title.setTitle('Dashboard Suscripciones');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  get VATPeriod(): string {
    const month = String(this.selectedMonth).padStart(2, '0');
    return `${this.selectedYear}${month}`;
  }

  private parseCurrencyToNumber(value: string): number {
    if (value == null || value === '') return 0;
    const cleaned = String(value)
      .replace(/[^\d,.-]/g, '')
      .replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  private buildByTypeChart(): void {
    if (!this.data?.byType?.length) {
      this.byTypeChartOptions = null;
      return;
    }
    const categories = this.data.byType.map((t) => t.type);
    const totals = this.data.byType.map((t) => this.parseCurrencyToNumber(t.total));

    this.byTypeChartOptions = {
      series: [{ name: 'Total', data: totals }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%',
          borderRadius: 4,
          dataLabels: { position: 'top' },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: { fontSize: '12px' },
      },
      xaxis: {
        categories,
        labels: { rotate: -45, rotateAlways: true },
      },
      yaxis: {
        title: { text: 'Monto' },
        axisTicks: { show: true },
      },
      tooltip: {
        y: { formatter: (val: number) => (val != null ? val.toLocaleString('es-AR') : '') },
      },
      colors: ['#546E7A'],
    };
  }

  actualizar(): void {
    this.loading = true;
    const requestPayload = {
      type: 'subscription',
      VATPeriod: this.VATPeriod,
    };

    this.subscription.add(
      this._service
        .getChart(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result) {
              this.data = result as SubscriptionChartResponse;
              this.buildByTypeChart();
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }
}
