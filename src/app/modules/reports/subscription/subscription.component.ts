import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
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

interface ActiveMemberByArticle {
  articleId: unknown;
  description: string;
  rate: number;
  count: number;
  projected: number;
}

interface CollectionByPaymentMethod {
  paymentMethodId: unknown;
  name: string;
  collected: number;
  pending: number;
  count: number;
}

interface IncomeByType {
  typeId: unknown;
  type: string;
  total: number | string;
  count: number;
}

interface SubscriptionChartResponse {
  period?: { VATPeriod: string; label: string };
  activeMembers?: {
    byArticle: ActiveMemberByArticle[];
    total: number;
    totalProjected: number;
    totalProjectedFormatted: string;
  };
  collections?: {
    byPaymentMethod: CollectionByPaymentMethod[];
    totalCollected: number;
    totalCollectedFormatted: string;

    totalPending: number;
    totalPendingFormatted: string;
  };
  debt?: {
    count: number;
    totalBalance: number;
    totalBalanceFormatted: string;
  };
  subscriptionData?: {
    closeSubscription: SubscriptionGroup;
    openTransactions: SubscriptionGroup;
  };
  transactions?: {
    closeSubscription: SubscriptionGroup;
    openTransactions: SubscriptionGroup;
  };
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
export class SubscriptionComponent implements OnInit, OnDestroy {
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

  get transactionSummary(): SubscriptionChartResponse['subscriptionData'] | undefined {
    return this.data?.transactions ?? this.data?.subscriptionData;
  }

  get paymentMethods(): CollectionByPaymentMethod[] {
    if (this.data?.collections?.byPaymentMethod?.length) {
      return this.data.collections.byPaymentMethod;
    }

    return (this.data?.byType ?? []).map((item) => ({
      paymentMethodId: item.typeId,
      name: item.type,
      collected: this.toNumber(item.total),
      pending: 0,
      count: item.count,
    }));
  }

  toNumber(value: number | string | null | undefined): number {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;

    const cleaned = String(value)
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  formatMoney(value: number | string | null | undefined): string {
    return this.toNumber(value).toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  private buildByTypeChart(): void {
    const paymentMethods = this.paymentMethods;

    if (!paymentMethods.length) {
      this.byTypeChartOptions = null;
      return;
    }

    const categories = paymentMethods.map((item) => item.name);
    const collected = paymentMethods.map((item) => item.collected);
    const pending = paymentMethods.map((item) => item.pending);

    this.byTypeChartOptions = {
      series: [
        { name: 'Cobrado', data: collected },
        { name: 'Pendiente', data: pending },
      ],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        zoom: { enabled: false },
        stacked: false,
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
        enabled: false,
      },
      xaxis: {
        categories,
        labels: { rotate: -45, rotateAlways: true },
      },
      yaxis: {
        title: { text: 'Monto' },
        axisTicks: { show: true },
        labels: {
          formatter: (val: number) => this.formatMoney(val),
        },
      },
      tooltip: {
        y: { formatter: (val: number) => `$ ${this.formatMoney(val)}` },
      },
      colors: ['#2E7D32', '#F9A825'],
    };
  }

  actualizar(): void {
    this.loading = true;

    this.subscription.add(
      this._service
        .getChart({
          type: 'subscription',
          VATPeriod: this.VATPeriod,
        })
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
