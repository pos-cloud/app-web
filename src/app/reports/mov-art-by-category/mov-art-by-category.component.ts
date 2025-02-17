import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Branch } from '@types';
import { ExportersModule } from 'app/components/export/exporters.module';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MovArtByCategoryService } from './mov-art-by-category.service';

@Component({
  standalone: true,
  selector: 'app-report-sales-by-category',
  templateUrl: './mov-art-by-category.component.html',
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
  providers: [MovArtByCategoryService],
})
export class ReportSalesByCategoryComponent implements OnInit {
  public items: any[] = [];
  public loading: boolean = false;
  public startDate: string = moment().format('YYYY-MM-DD');
  public endDate: string = moment().format('YYYY-MM-DD');
  public limit: number = 0;
  public itemsPerPage: string = '5';
  public currentPage: number = 1;
  public sort = { count: -1 };
  public transactionMovement: string;
  public totalItem: number = 0;
  public totalAmount: number = 0;
  public branches: Branch[];
  public branchSelectedId: string;
  public allowChangeBranch: boolean;
  private subscription: Subscription = new Subscription();
  transactionTypes: any;
  private destroy$ = new Subject<void>();
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
    public _service: MovArtByCategoryService,
    public _router: Router,
    private _branchService: BranchService,
    private _authService: AuthService,
    public _transactionTypeService: TransactionTypeService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    this._activatedRoute.params.subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
    });

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
    this.getSalesByCategory();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getBranches(): Promise<Branch[]> {
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

  public getSalesByCategory(): void {
    this.loading = true;
    let types = this.transactionTypesSelect?.map((item) => item._id);
    let data = {
      branch: this.branchSelectedId,
      type: this.transactionMovement,
      startDate: this.startDate,
      endDate: this.endDate,
      transactionTypes: types ?? [],
    };

    this.subscription.add(
      this._service
        .getMovArtByCategory(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.items = result.result;
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.calculateTotal();
          },
        })
    );
  }

  public calculateTotal(): void {
    this.totalItem = 0;
    this.totalAmount = 0;

    for (let index = 0; index < this.items?.length; index++) {
      this.totalItem = this.totalItem + this.items[index]['count'];
      this.totalAmount = this.totalAmount + this.items[index]['total'];
    }
  }

  getTransactionTypes() {
    let match = {
      transactionMovement: this.transactionMovement,
      operationType: { $ne: 'D' },
    };
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
        match: match,
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

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = JSON.parse('{"' + term + '": 1 }');
    }

    this.getSalesByCategory();
  }
}
