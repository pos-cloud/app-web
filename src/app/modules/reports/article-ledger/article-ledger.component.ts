import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Article, Branch } from '@types';
import { ArticleService } from 'app/core/services/article.service';
import { BranchService } from 'app/core/services/branch.service';
import { DepositService } from 'app/core/services/deposit.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-article-ledger',
  templateUrl: './article-ledger.component.html',
  styleUrls: ['./article-ledger.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    MultiSelectDropdownComponent,
    DataTableReportsComponent,
    ReactiveFormsModule,
    TypeaheadDropdownComponent,
  ],
})
export class ReportArticleLedgerComponent implements OnInit, OnDestroy {
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public articleForm: UntypedFormGroup;

  // data table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public header: any[] = [];
  public title: string = '';

  // filters
  branches: Branch[];
  branchSelectedId: string[] = [];

  deposits: Branch[];
  depositSelectedId: string[] = [];

  articles: Article[];
  articleControl: any;

  // sort
  public sort = {
    column: 'transaction.endDate',
    direction: 'desc',
  };

  constructor(
    private _service: ReportSystemService,
    private _branchService: BranchService,
    private _depositService: DepositService,
    private _toastService: ToastService,
    private _articleService: ArticleService,
    public _fb: UntypedFormBuilder,
    private cdRef: ChangeDetectorRef,
    private _title: Title
  ) {
    this.articleForm = this._fb.group({ article: [null] });
    this.articleControl = this.articleForm.get('article');
  }

  async ngOnInit() {
    this.getBranches();
    this.getDeposits();
    this.getArticles();
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

  private getDeposits(): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve, reject) => {
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

  private getArticles(): Promise<Branch[]> {
    return new Promise<Branch[]>((resolve, reject) => {
      this._articleService
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            description: 1,
            code: 1,
          },
          match: {
            operationType: { $ne: 'D' },
          },
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.articles = result.result;
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
      reportType: 'article-ledger',
      filters: {
        article: this.articleControl?.value?._id,
        branches: this.branchSelectedId,
        deposits: this.depositSelectedId,
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
            this.header = result?.result?.header ?? [];
            this.title = result?.result?.info?.title ?? 'Kadex de producto';
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

  public onSortingChange(event: { column: string; direction: string }): void {
    this.sort = {
      column: event.column,
      direction: event.direction,
    };
    this.getReport();
  }
}
