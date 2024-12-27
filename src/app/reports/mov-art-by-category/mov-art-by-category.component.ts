import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { NgbAlertConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import 'moment/locale/es';

import { Branch } from 'app/components/branch/branch';
import { AuthService } from 'app/core/services/auth.service';
import { BranchService } from 'app/core/services/branch.service';
import { TransactionTypeService } from 'app/core/services/transaction-type.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-report-sales-by-category',
  templateUrl: './mov-art-by-category.component.html',
  providers: [NgbAlertConfig],
})
export class ReportSalesByCategoryComponent implements OnInit {
  public items: any[] = new Array();
  public alertMessage: string = '';
  public propertyTerm: string;
  public areFiltersVisible: boolean = false;
  public loading: boolean = false;
  public startDate: string;
  public endDate: string;
  public limit: number = 0;
  public listType: string = 'statistics';
  public itemsPerPage: string = '5';
  public currentPage: number = 1;
  public sort = { count: -1 };
  public transactionMovement: string;
  public totalItem;
  public totalAmount;
  public branches: Branch[];
  public branchSelectedId: String;
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
    public _categoryService: CategoryService,
    public _router: Router,
    public _modalService: NgbModal,
    public alertConfig: NgbAlertConfig,
    private _branchService: BranchService,
    private _authService: AuthService,
    public _transactionTypeService: TransactionTypeService,
    private _toastService: ToastService
  ) {
    this.startDate = moment().format('YYYY-MM-DD');
    this.endDate = moment().format('YYYY-MM-DD');
    this.totalAmount = 0;
    this.totalItem = 0;
  }

  async ngOnInit() {
    this.loading = true;
    let pathLocation: string[] = this._router.url.split('/');
    this.transactionMovement =
      pathLocation[2].charAt(0).toUpperCase() + pathLocation[2].slice(1);
    this.listType = pathLocation[3];
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
    this.getAlltransactionTypes();

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
            this._toastService.showToast(error);
            resolve(null);
          },
          complete: () => {},
        });
    });
  }

  public getSalesByCategory(): void {
    let types = this.transactionTypesSelect?.map((item) => item._id);
    let data = {
      branch: this.branchSelectedId,
      type: this.transactionMovement,
      startDate: this.startDate,
      endDate: this.endDate,
      transactionTypes: types ?? [],
    };

    this.subscription.add(
      this._categoryService
        .getSalesByCategoryV2(data)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            this.items = result.result;
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.calculateTotal();
            this.loading = false;
          },
        })
    );
  }

  public calculateTotal(): void {
    this.totalItem = 0;
    this.totalAmount = 0;

    for (let index = 0; index < this.items.length; index++) {
      this.totalItem = this.totalItem + this.items[index]['count'];
      this.totalAmount = this.totalAmount + this.items[index]['total'];
    }
  }

  getAlltransactionTypes() {
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
