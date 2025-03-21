import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryService } from '@core/services/category.service';
import { MakeService } from '@core/services/make.service';
import { TranslateModule } from '@ngx-translate/core';
import { Branch, Make } from '@types';
import { Category } from 'app/components/category/category';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { BranchService } from 'app/core/services/branch.service';
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

  branches: Branch[];
  branchSelectedId: string[] = [];

  startDate: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

  article: string = '';

  makes: Make[];
  makesSelect: string[] = [];

  // sort
  public sort = {
    column: 'amount',
    direction: 'desc',
  };

  constructor(
    private _service: ReportSystemService,
    private _branchService: BranchService,
    private _transactionTypeService: TransactionTypeService,
    private _categoryService: CategoryService,
    private _makeService: MakeService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this._activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
      this.getTransactionTypes();
      this.getReport();
      this.getBranches();
      this.getCategories();
      this.getMakes();
    });
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
          requestArticles: true,
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
        branches: this.branchSelectedId,
        transactionMovement: this.transactionMovement,
        transactionTypes: this.transactionTypesSelect ?? [],
        startDate: this.startDate,
        endDate: this.endDate,
        categories: this.categoriesSelect ?? [],
        article: this.article,
        makes: this.makesSelect ?? [],
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
            this.title = result?.result?.info?.title ?? `Movimientos por artículo de ${this.transactionMovement}`;
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
