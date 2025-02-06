import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '@types';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-articles-requirements-by-transaction',
  templateUrl: './list-articles-requirements-by-transaction.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressbarModule,
    TranslateModule,
    PipesModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    DateTimePickerComponent,
    MultiSelectDropdownComponent,
    DataTableReportsComponent,
  ],
})
export class ListArticlesRequirementsByTransactionComponent implements OnInit {
  // date table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};

  public transactionMovement: string;
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  // filters
  statusSelect: string[] = [];
  statusOptions = [
    { _id: '', name: 'Todos' },
    { _id: 'Abierto', name: 'Abierto' },
    { _id: 'Anulado', name: 'Anulado' },
    { _id: 'Armando', name: 'Armando' },
    { _id: 'Cerrado', name: 'Cerrado' },
    { _id: 'Entregado', name: 'Entregado' },
    { _id: 'Enviado', name: 'Enviado' },
    { _id: 'Pago Confirmado', name: 'Pago Confirmado' },
    { _id: 'Pago Rechazado', name: 'Pago Rechazado' },
    { _id: 'Pendiente', name: 'Pendiente' },
    { _id: 'Pendiente de pago', name: 'Pendiente de pago' },
    { _id: 'Preparando', name: 'Preparando' },
  ];

  transactionTypes: TransactionType[];
  transactionTypesSelect: string[] = [];

  dateSelect: string[] = [];
  dateSelected: any[] = [
    {
      _id: 'creationDate',
      name: 'Creación',
    },
    {
      _id: 'updateDate',
      name: 'Modificación',
    },
    {
      _id: 'endDate2',
      name: 'Finalización',
    },
  ];

  branches: Branch[];
  branchSelectedId: string[] = [];

  startDate: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  endDate: string = new Date().toISOString();

  constructor(
    private _service: ReportSystemService,
    private _branchService: BranchService,
    private _transactionTypeService: TransactionTypeService,
    private _authService: AuthService,
    private _toastService: ToastService
  ) {}

  async ngOnInit() {
    this.getBranches();
    this.getTransactionTypes();
    this.getReport();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
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
          requestArticles: 1,
          operationType: 1,
          name: 1,
          branch: 1,
        },
        match: {
          transactionMovement: 'Producción',
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
      reportType: 'art-requirements-by-transactions',
      filters: {
        branch: this.branchSelectedId,
        type: this.transactionMovement,
        transactionTypes: this.transactionTypesSelect ?? [],
        status: this.statusSelect ?? [],
        startDate: this.startDate,
        dateSelect: this.dateSelect,
        endDate: this.endDate,
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: {
        column: 'article',
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
