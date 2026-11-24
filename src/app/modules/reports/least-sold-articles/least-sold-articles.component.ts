import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CategoryService } from '@core/services/category.service';
import { MakeService } from '@core/services/make.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Category, Deposit, IButton, Make, TransactionType } from '@types';
import { DepositService } from 'app/core/services/deposit.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { UserBranchSelectComponent } from 'app/shared/components/user-branch-select/user-branch-select.component';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-least-sold-articles',
  templateUrl: './least-sold-articles.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .popover.least-sold-help {
        max-width: 460px;
        border: 1px solid #e4e7ec;
        box-shadow: 0 10px 28px rgba(20, 30, 40, 0.14);
      }
      .popover.least-sold-help .popover-body {
        width: 430px;
        padding: 14px 16px;
        color: #1f2933;
        font-size: 13px;
        line-height: 1.45;
      }
      .least-sold-help-list > div + div {
        margin-top: 6px;
      }
      .least-sold-help-scale {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid #eceff3;
      }
      .least-sold-help-scale-title {
        font-weight: 700;
      }
      .least-sold-help-rows {
        display: grid;
        grid-template-columns: max-content max-content;
        column-gap: 28px;
        row-gap: 3px;
        margin-top: 8px;
      }
      .least-sold-help-rows span:nth-child(odd) {
        color: #5c6b7a;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    NgbModule,
    MultiSelectDropdownComponent,
    UserBranchSelectComponent,
    DataTableReportsComponent,
    ReactiveFormsModule,
  ],
})
export class ReportLeastSoldArticlesComponent {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title: string = '';

  public transactionMovement = 'Venta';
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  transactionTypes: TransactionType[];
  transactionTypesSelect: string[] = [];

  categories: Category[];
  categoriesSelect: string[] = [];

  branchSelectedId: string | null = null;

  article: string = '';

  makes: Make[];
  makesSelect: string[] = [];

  deposits: Deposit[];
  depositSelectedId: string | null = null;

  rotationIndexes = [
    { _id: 'Muy baja', name: 'Muy baja' },
    { _id: 'Baja', name: 'Baja' },
    { _id: 'Normal', name: 'Normal' },
    { _id: 'Alta', name: 'Alta' },
    { _id: 'Muy alta', name: 'Muy alta' },
  ];
  rotationSelect: string[] = [];

  page = 1;
  pageSize = 20;
  total = 0;

  public sort = {
    column: 'amount',
    direction: 'asc',
  };

  public rowButtons: IButton[] = [
    {
      title: 'Kardex',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: 'article-ledger',
    },
  ];

  constructor(
    private _service: ReportSystemService,
    private _depositService: DepositService,
    private _transactionTypeService: TransactionTypeService,
    private _categoryService: CategoryService,
    private _makeService: MakeService,
    private _toastService: ToastService,
    private _title: Title,
    private cdRef: ChangeDetectorRef,
    private _router: Router
  ) {}

  ngOnInit() {
    this.getTransactionTypes();
    this.getCategories();
    this.getMakes();
    this.getDeposits();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private get requestPayload() {
    return {
      reportType: 'least-sold-articles',
      filters: {
        branches: this.branchSelectedId ? [this.branchSelectedId] : [],
        transactionMovement: this.transactionMovement,
        transactionTypes: this.transactionTypesSelect,
        categories: this.categoriesSelect ?? [],
        deposits: this.depositSelectedId ? [this.depositSelectedId] : [],
        article: this.article,
        makes: this.makesSelect ?? [],
        page: this.page,
        pageSize: this.pageSize,
        rotationStatuses: this.rotationSelect ?? [],
      },
      pagination: {
        page: this.page,
        pageSize: this.pageSize,
      },
      sorting: this.sort,
    };
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
          modifyStock: 1,
        },
        match: {
          transactionMovement: 'Venta',
          stockMovement: 'Salida',
          operationType: { $ne: 'D' },
          requestArticles: true,
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.transactionTypes = result.result;
          for (let transactionType of this.transactionTypes) {
            this.transactionTypesSelect.push(transactionType._id);
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  private getCategories() {
    this._categoryService
      .getAll({
        project: {
          _id: 1,
          operationType: 1,
          description: 1,
        },
        match: {
          operationType: { $ne: 'D' },
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          let category = result.result.map((cate) => {
            return {
              _id: cate._id,
              name: cate.description,
              operationType: cate.operationType,
            };
          });
          this.categories = category;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  private getMakes() {
    this._makeService
      .getAll({
        project: {
          _id: 1,
          operationType: 1,
          description: 1,
        },
        match: {
          operationType: { $ne: 'D' },
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          let makesList = result.result.map((make) => {
            return {
              _id: make._id,
              name: make.description,
              operationType: make.operationType,
            };
          });
          this.makes = makesList;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
  }

  private getDeposits(): void {
    this._depositService
      .getAll({
        project: { _id: 1, operationType: 1, name: 1 },
        match: { operationType: { $ne: 'D' } },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.deposits = result.result;
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
      });
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
            this.total = result?.result?.pagination?.length ?? this.data.length;
            this.title = result?.result?.metaData?.title ?? 'Artículos menos vendidos';
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

  public onEventFunction(event: { op: string; obj: any }): void {
    if (event.op !== 'article-ledger' || !event.obj?.article) {
      return;
    }

    this._router.navigate(['/reports/article-ledger'], {
      queryParams: {
        article: event.obj.article,
        code: event.obj.code || '',
        description: event.obj.description || '',
      },
    });
  }

  public refresh(): void {
    this.page = 1;
    this.getReport();
  }

  public get lastPage(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  public changePage(next: number): void {
    const page = this.page + next;
    const last = this.lastPage;
    if (page < 1 || page > last) {
      return;
    }
    this.page = page;
    this.getReport();
  }

  public onSortingChange(event: { column: string; direction: string }): void {
    this.sort = {
      column: event.column,
      direction: event.direction,
    };
    this.page = 1;
    this.getReport();
  }

  public onExportExcel(event): void {
    this.loading = true;
    const pathUrl = this._router.url.split('/');
    const entity = pathUrl[2];

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
}
