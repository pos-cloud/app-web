import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimePickerComponent } from '@shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from '@shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { PipesModule } from '@shared/pipes/pipes.module';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-birthday',
  templateUrl: './birthday.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    DataTableReportsComponent,
    DateTimePickerComponent,
    MultiSelectDropdownComponent,
    TranslateModule,
    PipesModule,
    CommonModule,
    FormsModule,
  ],
})
export class ReportBirthdayComponent implements OnInit {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title: string = '';

  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  public months: { name: string; _id: number }[] = [
    {
      name: 'Enero',
      _id: 1,
    },
    {
      name: 'Febrero',
      _id: 2,
    },
    {
      name: 'Marzo',
      _id: 3,
    },
    {
      name: 'Abril',
      _id: 4,
    },
    {
      name: 'Mayo',
      _id: 5,
    },
    {
      name: 'Junio',
      _id: 6,
    },
    {
      name: 'Julio',
      _id: 7,
    },
    {
      name: 'Agosto',
      _id: 8,
    },
    {
      name: 'Septiembre',
      _id: 9,
    },
    {
      name: 'Octubre',
      _id: 10,
    },
    {
      name: 'Noviembre',
      _id: 11,
    },
    {
      name: 'Diciembre',
      _id: 12,
    },
  ];

  public monthsSelect: string[] = [];
  public day: number;
  startDate: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  public excel: boolean = false;
  // sort
  public sort = {
    column: 'year',
    direction: 'desc',
  };

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private _title: Title,
    private _router: Router
  ) {}

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async ngOnInit() {
    this.getReport();
  }

  public getReport(): void {
    this.loading = true;
    const pathUrl = this._router.url.split('/');
    const entity = pathUrl[2];

    const requestPayload = {
      reportType: 'birthday',
      filters: {
        months: this.monthsSelect,
        day: this.day,
      },
      exportData: {
        excel: this.excel,
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: this.sort,
    };
    this.subscription.add(
      this._service
        .getReport(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (this.excel) {
              if (result instanceof Blob) {
                try {
                  const blobUrl = URL.createObjectURL(result);
                  console.log(blobUrl);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = `${entity}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(blobUrl); // liberar memoria
                } catch (e) {
                  this._toastService.showToast({ message: 'Error al generar el Excel' });
                }
              } else {
                this._toastService.showToast(result);
              }
            } else {
              this._toastService.showToast(result);
              this.data = result?.result?.data ?? [];
              this.columns = result?.result?.columns ?? [];
              this.totals = result?.result?.totals ?? {};
              this.title = result?.info?.title ?? 'Cumpleaños';
              this._title.setTitle(this.title);
              this.cdRef.detectChanges();
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.excel = false;
            this.cdRef.detectChanges();
          },
        })
    );
  }

  public onSortingChange(event: { column: string; direction: string }): void {
    this.sort = {
      column: event.column,
      direction: event.direction,
    };
    this.getReport();
  }

  public onExportExcel(event): void {
    this.excel = event;
    this.getReport();
  }
}
