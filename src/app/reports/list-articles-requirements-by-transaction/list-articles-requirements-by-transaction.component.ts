import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '@types';
import { ExportersModule } from 'app/components/export/exporters.module';
import { TransactionType } from 'app/components/transaction-type/transaction-type';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { DateFormatPipe } from 'app/shared/pipes/date-format.pipe';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import * as moment from 'moment';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list-articles-requirements-by-transaction',
  templateUrl: './list-articles-requirements-by-transaction.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProgressbarModule,
    TranslateModule,
    PipesModule,
    NgbModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule,
    ExportersModule,
  ],
})
export class ListArticlesRequirementsByTransactionComponent implements OnInit {
  public data: any[] = [];
  public columns: any[] = [];

  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public startDate: string = moment().format('YYYY-MM-DD');
  public endDate: string = moment().format('YYYY-MM-DD');
  public itemsPerPage: string = '5';
  public currentPage: number = 1;
  public sort = { count: -1 };
  public transactionMovement: string;
  public totalItem: number = 0;
  public totalAmount: number = 0;
  public branches: Branch[];
  public branchSelectedId: string;
  public allowChangeBranch: boolean;
  public dateFormat = new DateFormatPipe();
  public statusSelect: string = '';

  public dateSelect: string;
  public transactionTypes: TransactionType[];
  transactionTypesSelect;
  dropdownSettings = {
    singleSelection: false,
    defaultOpen: false,
    idField: '_id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: true,
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };

  constructor(
    private _service: ReportSystemService,
    private _branchService: BranchService,
    public _transactionTypeService: TransactionTypeService,
    private _authService: AuthService,
    public _router: Router,
    private _toastService: ToastService
  ) {
    this.startDate = moment().format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.dateSelect = 'creationDate';
  }

  async ngOnInit() {
    if (!this.branchSelectedId) {
      await this.getBranches().then((branches) => {
        this.branches = branches;
        if (this.branches && this.branches.length > 1) {
          this.branchSelectedId = this.branches[0]._id;
        }
      });
      this._authService.getIdentity.subscribe(async (identity) => {
        if (identity && identity.origin) {
          this.allowChangeBranch = false;
          this.branchSelectedId = identity.origin.branch._id;
        } else {
          this.allowChangeBranch = true;
          this.branchSelectedId = null;
        }
      });
    }

    this.getTransactionTypes();
    this.getArticleRequirements();
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
          },
          match: {
            operationType: { $ne: 'D' },
          },
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            resolve(result.result);
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

  public getArticleRequirements(): void {
    this.loading = true;
    let types = this.transactionTypesSelect?.map((item) => item._id);

    const requestPayload = {
      reportType: 'art-requirements-by-transactions',
      filters: {
        branch: this.branchSelectedId,
        type: this.transactionMovement,
        transactionTypes: types ?? [],
        status: this.statusSelect ?? [],
        startDate: this.startDate,
        dateSelect: this.dateSelect,
        endDate: this.endDate,
      },
      pagination: {
        page: this.currentPage,
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
