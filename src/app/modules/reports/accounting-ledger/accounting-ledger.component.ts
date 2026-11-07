import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AccountPeriodService } from 'app/core/services/account-period.service';
import { AccountService } from 'app/core/services/account.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { accountingAmount, accountingDate } from '../accounting-format';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-accounting-ledger',
  templateUrl: './accounting-ledger.component.html',
  styleUrls: ['../accounting-sheet.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PipesModule],
})
export class AccountingLedgerComponent implements OnInit, OnDestroy {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title = 'Libro Mayor';
  public loading = false;
  public periodId = '';
  public periods: { _id: string; description?: string; status?: string }[] = [];
  public accountId = '';
  public accounts: { _id: string; code?: string; description?: string }[] = [];

  private destroy$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(
    private _service: ReportSystemService,
    private _accountService: AccountService,
    private _periodService: AccountPeriodService,
    private _toastService: ToastService,
    private _title: Title,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._title.setTitle(this.title);
    this.loadAccounts();
    this.loadPeriods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  public get ledgers(): {
    code: string;
    description: string;
    lines: any[];
    debit: number;
    credit: number;
    balance: number;
  }[] {
    const books = new Map<
      string,
      { code: string; description: string; lines: any[]; debit: number; credit: number; balance: number }
    >();
    this.data.forEach((line) => {
      const current = books.get(line.code) || {
        code: line.code,
        description: line.description,
        lines: [],
        debit: 0,
        credit: 0,
        balance: 0,
      };
      current.lines.push(line);
      current.debit += Number(line.debit) || 0;
      current.credit += Number(line.credit) || 0;
      current.balance = Number(line.balance) || 0;
      books.set(line.code, current);
    });
    return [...books.values()];
  }

  public money(value: unknown, blankZero = false): string {
    return accountingAmount(value, blankZero);
  }

  public day(value: unknown): string {
    return accountingDate(value);
  }

  public getReport(): void {
    if (!this.periodId) {
      this._toastService.showToast({ message: 'Debe seleccionar un período contable' });
      return;
    }
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
            this.title = result?.result?.metaData?.title || 'Libro Mayor';
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
        .downloadXlsx(this.requestPayload)
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
            link.download = 'libro-mayor.xlsx';
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

  private get requestPayload() {
    const filters: any = { period: this.periodId };
    if (this.accountId) filters.account = this.accountId;
    return { reportType: 'accounting-ledger', filters };
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

  private loadAccounts(): void {
    this._accountService
      .getAll({
        project: { _id: 1, code: 1, description: 1 },
        match: { operationType: { $ne: 'D' } },
        sort: { code: 1 },
        limit: 0,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.accounts = result?.result || [];
        },
      });
  }
}
