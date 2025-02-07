import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import 'moment/locale/es';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from 'app/components/branch/branch';
import { CompanyType } from 'app/components/payment-method/payment-method';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
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
  standalone: true,
  selector: 'app-transactions-by-clients',
  templateUrl: './transactions-by-clients.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
export class transactionsByClientsComponent implements OnInit {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};

  public transactionMovement: string;
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  branches: Branch[];
  branchSelectedId: string[] = [];

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

  startDate: string = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  endDate: string = new Date().toISOString();

  constructor(
    public _service: ReportSystemService,
    public _router: Router,
    private _branchService: BranchService,
    public _transactionTypeService: TransactionTypeService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    this._activatedRoute.params.subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
    });

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
          transactionMovement: this.transactionMovement,
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

    let companyType: CompanyType;
    if (this.transactionMovement === 'Venta') {
      companyType = CompanyType.Client;
    } else if (this.transactionMovement === 'Compra') {
      companyType = CompanyType.Provider;
    }
    const requestPayload = {
      reportType: 'transactions-by-client',
      filters: {
        branch: this.branchSelectedId,
        type: companyType,
        status: this.statusSelect ?? [],
        transactionTypes: this.transactionTypesSelect ?? [],
        startDate: this.startDate,
        endDate: this.endDate,
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: {
        column: 'clients',
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
