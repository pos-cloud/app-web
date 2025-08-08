import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableReportsComponent } from '@shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from '@shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from '@shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { PipesModule } from '@shared/pipes/pipes.module';
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

@Component({
  selector: 'app-transaction-by-hour',
  templateUrl: './transaction-by-hour.component.html',
  styleUrls: ['./transaction-by-hour.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    DateTimePickerComponent,
    MultiSelectDropdownComponent,
    DataTableReportsComponent,
  ],
})
export class TransactionComponetByHour {
  salesByMonth: Partial<ChartOptions>;
  public transactionMovement: string;
  public loading: boolean = false;
  startDate: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

  private subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this._activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
      this.getSalesByMonth();
    });
    this.getSalesByMonth();
  }

  public getSalesByMonth(): void {
    const requestPayload = {
      type: 'transactions-by-hour',
      filters: {
        startDate: this.startDate,
        endDate: this.endDate,
        type: this.transactionMovement,
      },
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
}
