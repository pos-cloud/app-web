import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BranchService } from '@core/services/branch.service';
import { TransactionTypeService } from '@core/services/transaction-type.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DataTableReportsComponent } from '@shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from '@shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from '@shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { PipesModule } from '@shared/pipes/pipes.module';
import { Branch, TransactionType } from '@types';
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
  selector: 'app-transactions-by-hour',
  templateUrl: './transactions-by-hour.component.html',
  styleUrls: ['./transactions-by-hour.component.scss'],
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
export class TransactionsComponetByHour {
  salesByMonth: Partial<ChartOptions>;
  public transactionMovement: string;
  public loading: boolean = false;
  startDate: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

  branches: Branch[];
  branchSelectedId: string[] = [];

  transactionTypes: TransactionType[];
  transactionTypesSelect: string[] = [];
  private subscription: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute,
    private _transactionTypeService: TransactionTypeService,
    private _branchService: BranchService
  ) {}

  ngOnInit(): void {
    this._activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
      this.getSalesByMonth();
      this.getBranches();
      this.getTransactionTypes();
    });
  }

  private getBranches(): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve, reject) => {
      this._branchService
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            name: 1,
          },
          match: {
            operationType: { $ne: 'D' },
          },
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.branches = result.result;
          },
          error: (error) => {
            resolve(null);
          },
          complete: () => {},
        });
    });
  }

  private getTransactionTypes() {
    this._transactionTypeService
      .getAll({
        project: {
          _id: 1,
          transactionMovement: 1,
          requestEmployee: 1,
          operationType: 1,
          name: 1,
          branch: 1,
        },
        match: {
          transactionMovement: this.transactionMovement,
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

  public getSalesByMonth(): void {
    this.loading = true;
    const requestPayload = {
      type: 'transactions-by-hour',
      filters: {
        startDate: this.startDate,
        endDate: this.endDate,
        type: this.transactionMovement,
        branches: this.branchSelectedId,
        transactionTypes: this.transactionTypesSelect ?? [],
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
          complete: () => {
            this.loading = false;
          },
        })
    );
  }
}
