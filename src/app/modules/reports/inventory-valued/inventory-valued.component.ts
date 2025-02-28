import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '@types';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-valued',
  templateUrl: './inventory-valued.component.html',
  styleUrls: ['./inventory-valued.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    DateTimePickerComponent,
    MultiSelectDropdownComponent,
    DataTableReportsComponent,
    ReactiveFormsModule,
  ],
})
export class InventoryValuedComponent {
  // date table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title: string = '';

  public transactionMovement: string;
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  // filters

  transactionTypes: TransactionType[];
  transactionTypesSelect: string[] = [];

  branches: Branch[];
  branchSelectedId: string[] = [];

  startDate: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  public form: FormGroup;
  // sort
  public sort = {
    column: 'amount',
    direction: 'asc',
  };

  constructor(
    private _service: ReportSystemService,
    private _transactionTypeService: TransactionTypeService,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private _fb: UntypedFormBuilder
  ) {
    this.form = this._fb.group({
      number: [],
    });
  }

  async ngOnInit() {
    this.getTransactionTypes();
    this.getReport();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getTransactionTypes() {
    this._transactionTypeService
      .getAll({
        project: {
          _id: 1,
          //  transactionMovement: 1,
          requestArticles: 1,
          operationType: 1,
          name: 1,
          branch: 1,
        },
        match: {
          //   transactionMovement: this.transactionMovement,
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

  public getReport(): void {
    this.loading = true;

    const requestPayload = {
      reportType: 'inventory-valued',
      filters: {
        number: Number(this.form.value.number),
        transactionTypes: this.transactionTypesSelect ?? [],
        startDate: this.startDate,
        endDate: this.endDate,
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
            this.title = result?.result?.info?.title ?? 'Stock valorizado';
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
