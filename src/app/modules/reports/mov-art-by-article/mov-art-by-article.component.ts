import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '@core/services/category.service';
import { DepositService } from '@core/services/deposit.service';
import { MakeService } from '@core/services/make.service';
import { TranslateModule } from '@ngx-translate/core';
import { Deposit, Make } from '@types';
import { Category } from 'app/components/category/category';
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
  selector: 'app-mov-art-by-article',
  templateUrl: './mov-art-by-article.component.html',
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
export class ReportMovArtByArticleComponent {
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

  categories: Category[];
  categoriesSelect: string[] = [];

  deposits: Deposit[];
  depositsSelectedId: string[] = [];

  startDate: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

  article: string = '';

  makes: Make[];
  makesSelect: string[] = [];
  public excel: boolean = false;

  // sort
  public sort = {
    column: 'amount',
    direction: 'desc',
  };

  constructor(
    private _service: ReportSystemService,
    private _depositService: DepositService,
    private _transactionTypeService: TransactionTypeService,
    private _categoryService: CategoryService,
    private _makeService: MakeService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute,
    private _title: Title,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
      this.getTransactionTypes();
      this.getReport();
      this.getDeposits();
      this.getCategories();
      this.getMakes();
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getDeposits(): Promise<Deposit[]> {
    return new Promise<Deposit[]>((resolve, reject) => {
      this._depositService
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
            this.deposits = result.result;
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
          modifyStock: 1,
        },
        match: {
          transactionMovement: this.transactionMovement,
          operationType: { $ne: 'D' },
          requestArticles: true,
          modifyStock: true,
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

  public getReport(): void {
    this.loading = true;

    const requestPayload = {
      reportType: 'mov-art-by-article',
      filters: {
        deposits: this.depositsSelectedId,
        transactionMovement: this.transactionMovement,
        transactionTypes: this.transactionTypesSelect,
        startDate: this.startDate,
        endDate: this.endDate,
        categories: this.categoriesSelect ?? [],
        article: this.article,
        makes: this.makesSelect ?? [],
      },
      exportData: {
        excel: this.excel,
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
            if (this.excel) {
              if (result instanceof Blob) {
                try {
                  const blobUrl = URL.createObjectURL(result);
                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = 'movimientos de artículos.xlsx';
                  a.click();
                  URL.revokeObjectURL(blobUrl); // liberar memoria
                } catch (e) {
                  this._toastService.showToast({ message: 'Error al generar el Excel' });
                }
              } else {
                this._toastService.showToast(result);
              }
            } else {
              this._toastService.showToast(result);
              this.data = result?.result?.data ?? [];
              this.columns = result?.result?.columns ?? [];
              this.totals = result?.result?.totals ?? {};
              this.title = result?.result?.info?.title ?? `Movimientos por artículo de ${this.transactionMovement}`;
              this._title.setTitle(this.title);
              this.cdRef.detectChanges();
            }
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.excel = false;
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

  public onExportExcel(event): void {
    this.excel = event;
    this.getReport();
  }
}
