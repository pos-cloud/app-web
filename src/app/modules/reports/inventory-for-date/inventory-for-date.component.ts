import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Branch, Deposit } from '@types';
import { BranchService } from 'app/core/services/branch.service';
import { DepositService } from 'app/core/services/deposit.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-for-date',
  templateUrl: './inventory-for-date.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    DateTimePickerComponent,
    DataTableReportsComponent,
    ReactiveFormsModule,
    MultiSelectDropdownComponent,
  ],
})
export class InventoryForDateComponent {
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
  branches: Branch[];
  branchSelectedId: string[] = [];

  deposits: Deposit[];
  depositSelectedId: string[] = [];

  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  public form: FormGroup;
  // sort
  public sort = { column: 'quantityForStock', direction: 'desc' };

  constructor(
    private _service: ReportSystemService,
    private _branchService: BranchService,
    private _depositService: DepositService,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private _fb: UntypedFormBuilder
  ) {
    this.form = this._fb.group({ number: [] });
  }

  async ngOnInit() {
    this.getBranches();
    this.getDeposits();
    this.getReport();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getBranches(): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve, reject) => {
      this._branchService
        .getAll({ project: { _id: 1, operationType: 1, name: 1 }, match: { operationType: { $ne: 'D' } } })
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

  private getDeposits(): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve, reject) => {
      this._depositService
        .getAll({ project: { _id: 1, operationType: 1, name: 1 }, match: { operationType: { $ne: 'D' } } })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.deposits = result.result;
          },
          error: (error) => {
            resolve(null);
          },
          complete: () => {},
        });
    });
  }

  public getReport(): void {
    this.loading = true;

    const requestPayload = {
      reportType: 'inventory-for-date',
      filters: { branches: this.branchSelectedId, deposits: this.depositSelectedId, endDate: this.endDate },
      pagination: { page: 1, pageSize: 10 },
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
            this.title = result?.result?.info?.title ?? 'Inventario por fecha';
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
    this.sort = { column: event.column, direction: event.direction };
    this.getReport();
  }
}
