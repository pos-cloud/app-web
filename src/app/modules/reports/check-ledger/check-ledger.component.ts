import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-check-ledger',
  templateUrl: './check-ledger.component.html',
  styleUrls: ['./check-ledger.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, PipesModule, DataTableReportsComponent, ReactiveFormsModule],
})
export class ReportCheckLedgerComponent {
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public form: FormGroup;

  // data table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public header: any[] = [];
  public title: '';
  // sort
  public sort = {
    column: 'totalPrice',
    direction: 'desc',
  };

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _fb: UntypedFormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.form = this._fb.group({
      checkNumber: [''],
    });
  }

  async ngOnInit() {}

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getReport(): void {
    this.loading = true;
    const requestPayload = {
      reportType: 'check-ledger',
      filters: {
        number: this.form.value.checkNumber,
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
            this._toastService.showToast(result);
            this.data = result?.result?.data ?? [];
            this.columns = result?.result?.columns ?? [];
            this.totals = result?.result?.totals ?? {};
            this.header = result?.result?.header ?? {};
            this.title = result?.result?.info?.title ?? 'Kadex de cheque';
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
}
