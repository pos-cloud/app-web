import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimePickerComponent } from '@shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from '@shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { PipesModule } from '@shared/pipes/pipes.module';
import { TransactionMovement, TransactionType } from 'app/components/transaction-type/transaction-type';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
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
    DateTimePickerComponent,
    MultiSelectDropdownComponent,
    DataTableReportsComponent,
  ],
})
export class AccountReceivablesComponent implements OnInit {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title: string = '';

  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public transactionMovement: TransactionMovement;

  transactionTypes: TransactionType[];

  // sort
  public sort = {
    column: 'transaction.company.name',
    direction: 'asc',
  };

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private _activatedRoute: ActivatedRoute
  ) {}

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async ngOnInit() {
    this._activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
      this.getReport();
    });
  }

  public getReport(): void {
    this.loading = true;

    let movement = this.transactionMovement === TransactionMovement.Sale ? 'Entrada' : 'Salida';
    const requestPayload = {
      reportType: 'account-receivables',
      filters: {
        type: this.transactionMovement,
        movement,
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
            (this.title = result?.info?.title ?? `Cuenta Corriente por ${this.transactionMovement}`),
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
