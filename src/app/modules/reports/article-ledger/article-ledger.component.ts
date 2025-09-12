import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Article, Deposit } from '@types';
import { ArticleService } from 'app/core/services/article.service';
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
  deposits: Deposit[];
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
    private _depositService: DepositService,
    private _toastService: ToastService,
    private _articleService: ArticleService,
    public _fb: UntypedFormBuilder,
    private cdRef: ChangeDetectorRef,
    public _router: Router,
    private _title: Title
  ) {
    this.articleForm = this._fb.group({ article: [null] });
    this.articleControl = this.articleForm.get('article');
  }

  async ngOnInit() {
    this.getDeposits();
    this.getArticles();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private get requestPayload() {
    return {
      reportType: 'article-ledger',
      filters: {
        article: this.articleControl?.value?._id,
        deposits: this.depositSelectedId,
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: this.sort,
    };
  }

  private getDeposits(): Promise<Deposit[]> {
    return new Promise<Deposit[]>((resolve, reject) => {
      this._depositService
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            name: 1,
            default: 1,
          },
          match: {
            operationType: { $ne: 'D' },
          },
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.deposits = result.result;
            for (let deposit of this.deposits) {
              if (deposit.default) this.depositSelectedId.push(deposit._id);
            }
          },
          error: (error) => {
            resolve(null);
          },
          complete: () => {},
        });
    });
  }

  private getArticles(): Promise<Article[]> {
    return new Promise<Article[]>((resolve, reject) => {
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

  public onAdjust(event): void {
    if (!this.articleControl?.value?._id) {
      this._toastService.showToast({ message: 'Debe seleccionar un artículo para ajustar' });
      return;
    }

    this.loading = true;
    const articleId = this.articleControl.value._id;

    this.subscription.add(
      this._service
        .adjustByArticle(articleId, this.depositSelectedId[0])
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            // Refrescar el reporte después del ajuste
            this.getReport();
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
