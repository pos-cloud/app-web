import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '@shared/pipes/pipes.module';
import { CompanyType, IButton } from '@types';
import { CompanyCurrentAccountService } from 'app/core/services/company-current-account.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-account-receivables',
  templateUrl: './account-receivables.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    DataTableReportsComponent,
    DateTimePickerComponent,
  ],
})
export class AccountReceivablesComponent implements OnInit, AfterViewInit {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title: string = '';

  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public companyType: CompanyType;

  // filter
  endDate: string = '';
  company: string = '';
  startDate: string = '';
  // sort
  public sort = {
    column: 'total',
    direction: 'desc',
  };
  public rowButtons: IButton[] = [
    {
      title: 'current-account2',
      class: 'btn btn-light btn-sm',
      icon: 'fa fa-address-book',
      click: `current-account2`,
    },
  ];
  constructor(
    private _service: ReportSystemService,
    private _companyCurrentAccountService: CompanyCurrentAccountService,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute,
    public _router: Router,
    private _title: Title
  ) {}

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  private get requestPayload() {
    const filters: any = {
      companyType: this.companyType,
      company: this.company,
    };

    if (this.startDate || this.endDate) {
      filters.startDate = this.normalizeDate(this.startDate || new Date().toISOString(), 0, 0, 0, 0);
      filters.endDate = this.normalizeDate(this.endDate || new Date().toISOString(), 23, 59, 59, 999);
    }

    return {
      reportType: 'account-receivables',
      filters,
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: this.sort,
    };
  }

  public onStartDateChange(value: string): void {
    if (!value) {
      this.startDate = '';
      return;
    }
    const normalized = this.normalizeDate(value, 0, 0, 0, 0);
    if (this.isSameInstant(this.startDate, normalized)) {
      return;
    }
    this.startDate = normalized;
  }

  public onEndDateChange(value: string): void {
    if (!value) {
      this.endDate = '';
      return;
    }
    const normalized = this.normalizeDate(value, 23, 59, 59, 999);
    if (this.isSameInstant(this.endDate, normalized)) {
      return;
    }
    // Dejar que el picker termine de actualizar y luego forzar fin de día en la UI
    setTimeout(() => {
      this.endDate = normalized;
      this.cdRef.detectChanges();
    });
  }

  private normalizeDate(value: string, hours: number, minutes: number, seconds: number, ms: number): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return value;
    }
    date.setHours(hours, minutes, seconds, ms);
    return date.toISOString();
  }

  private isSameInstant(a: string, b: string): boolean {
    if (!a || !b) {
      return false;
    }
    return new Date(a).getTime() === new Date(b).getTime();
  }

  async ngOnInit() {
    this._activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.companyType = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);

      this.getReport();
    });
  }

  ngAfterViewInit(): void {
    // El date-picker ignora el primer onChange si arranca vacío; lo "calentamos" y volvemos a vacío.
    const warm = new Date().toISOString();
    this.startDate = warm;
    this.endDate = warm;
    this.cdRef.detectChanges();
    this.startDate = '';
    this.endDate = '';
    this.cdRef.detectChanges();
  }

  public getReport(): void {
    this.loading = true;

    this.subscription.add(
      this._service
        .getReport(this.requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            this.data = result?.result?.data ?? [];
            this.columns = result?.result?.columns ?? [];
            this.totals = result?.result?.totals ?? {};
            this.title = result?.info?.title ?? `Cuenta Corriente por ${this.companyType}`;
            this._title.setTitle(this.title);
            this.cdRef.detectChanges();
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
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
    this.loading = true;
    const pathUrl = this._router.url.split('/');
    const entity = pathUrl[2] || 'account-receivables';

    this.subscription.add(
      this._service
        .downloadXlsx(this.requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            try {
              const blobUrl = URL.createObjectURL(result);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = `${entity}.xlsx`;
              a.click();
              URL.revokeObjectURL(blobUrl);
            } catch (e) {
              this._toastService.showToast({ message: 'Error al generar el Excel' });
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.cdRef.detectChanges();
          },
        })
    );
  }

  public onAdjust(event): void {
    this.loading = true;

    this.subscription.add(
      this._companyCurrentAccountService
        .recalculate()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            // Refrescar el reporte después del ajuste
            this.getReport();
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.cdRef.detectChanges();
          },
        })
    );
  }

  public onEventFunction(event: { op: string; obj: any; items: any[] }): void {
    if (event.op === 'current-account2') {
      this._router.navigateByUrl('reports/current-account/' + event?.obj?._id);
    }
  }
}
