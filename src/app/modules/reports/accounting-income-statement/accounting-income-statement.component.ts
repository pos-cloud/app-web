import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AccountPeriodService } from 'app/core/services/account-period.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { accountingAmount } from '../accounting-format';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-accounting-income-statement',
  templateUrl: './accounting-income-statement.component.html',
  styleUrls: ['../accounting-sheet.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PipesModule],
})
export class AccountingIncomeStatementComponent implements OnInit, OnDestroy {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title = 'Estado de Resultados';
  public loading = false;
  public periodId = '';
  public periods: { _id: string; description?: string; status?: string }[] = [];

  private destroy$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(
    private _service: ReportSystemService,
    private _periodService: AccountPeriodService,
    private _toastService: ToastService,
    private _title: Title,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._title.setTitle(this.title);
    this.loadPeriods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  public linesOf(rubro: string): any[] {
    return this.data.filter((row) => row.rubro === rubro && row.code);
  }

  public totalOf(description: string): number {
    return Number(this.data.find((row) => row.description === description)?.importe) || 0;
  }

  public money(value: unknown, blankZero = false): string {
    return accountingAmount(value, blankZero);
  }

  public getReport(): void {
    if (!this.periodId) {
      this._toastService.showToast({ message: 'Debe seleccionar un período contable' });
      return;
    }
    this.loading = true;
    this.subscription.add(
      this._service
        .getReport({ reportType: 'accounting-income-statement', filters: { period: this.periodId } })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            this.data = result?.result?.data ?? [];
            this.columns = result?.result?.columns ?? [];
            this.totals = result?.result?.totals ?? {};
            this.title = result?.result?.metaData?.title || 'Estado de Resultados';
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

  public onExportExcel(_event?: boolean): void {
    this.loading = true;
    this.subscription.add(
      this._service
        .downloadXlsx({ reportType: 'accounting-income-statement', filters: { period: this.periodId } })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (!(result instanceof Blob)) {
              this._toastService.showToast(result);
              return;
            }
            const blobUrl = URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'estado-de-resultados.xlsx';
            link.click();
            URL.revokeObjectURL(blobUrl);
          },
          error: (error) => this._toastService.showToast(error),
          complete: () => {
            this.loading = false;
            this.cdRef.detectChanges();
          },
        })
    );
  }

  private loadPeriods(): void {
    this._periodService
      .getAll({
        project: { _id: 1, description: 1, status: 1, startDate: 1 },
        match: { operationType: { $ne: 'D' } },
        sort: { startDate: -1 },
        limit: 0,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.periods = Array.isArray(result?.result) ? result.result : [];
          const open = this.periods.find((period) => period.status === 'Abierto');
          this.periodId = open?._id || this.periods[0]?._id || '';
          if (this.periodId) this.getReport();
        },
      });
  }
}
