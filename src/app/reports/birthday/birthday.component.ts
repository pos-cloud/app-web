import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-birthday',
  templateUrl: './birthday.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, NgbModule, NgMultiSelectDropDownModule, ReactiveFormsModule, DataTableReportsComponent],
})
export class ReportBirthdayComponent {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};

  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService
  ) {}

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getReport(): void {
    this.loading = true;
    const requestPayload = {
      reportType: 'birthday',
      filters: {},
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: {
        column: 'endDate',
        direction: 'asc',
      },
    };

    this.subscription.add(
      this._service
        .getReport(requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            this.data = result.result.data;
            this.columns = result.result.columns;
            this.totals = result.result.totals;
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
