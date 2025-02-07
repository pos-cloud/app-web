import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Article } from '@types';
import { Branch } from 'app/components/branch/branch';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { ArticleService } from 'app/core/services/article.service';
import { BranchService } from 'app/core/services/branch.service';
import { DepositService } from 'app/core/services/deposit.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { TypeaheadDropdownComponent } from 'app/shared/components/typehead-dropdown/typeahead-dropdown.component';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-kardex-article',
  templateUrl: './kardex-article.component.html',
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
    ReactiveFormsModule,
    TypeaheadDropdownComponent,
  ],
})
export class KardexArticleComponent implements OnInit {
  // date table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};

  public transactionMovement: string;
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public articleForm: UntypedFormGroup;
  // filters

  transactionTypes: TransactionType[];
  transactionTypesSelect: string[] = [];

  branches: Branch[];
  branchSelectedId: string[] = [];

  deposits: Branch[];
  depositSelectedId: string[] = [];

  articles: Article[];
  articleControl: any;

  constructor(
    private _service: ReportSystemService,
    private _branchService: BranchService,
    private _depositService: DepositService,
    private _transactionTypeService: TransactionTypeService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute,
    private _articleService: ArticleService,
    public _fb: UntypedFormBuilder
  ) {
    this.articleForm = this._fb.group({ article: [null] });

    this.articleControl = this.articleForm.get('article');
  }

  async ngOnInit() {
    this._activatedRoute.params.subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
    });

    this.getBranches();
    this.getDeposits();
    this.getArticles();
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
    const requestPayload = {
      reportType: 'kardex-articles',
      filters: {
        article: this.articleControl?.value?._id,
        branch: this.branchSelectedId,
        deposit: this.depositSelectedId,
        type: this.transactionMovement,
        transactionTypes: this.transactionTypesSelect ?? [],
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: {
        column: 'kardex',
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
