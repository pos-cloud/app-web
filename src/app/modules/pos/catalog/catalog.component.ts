import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { IAttribute } from '@types';
import { Transaction } from 'app/components/transaction/transaction';
import { DatatableService } from 'app/core/services/datatable.service';
import { TransactionService } from 'app/core/services/transaction.service';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { TransactionStateComponent } from 'app/shared/components/transaction-state/transaction-state.component';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';

@Component({
  selector: 'app-pos-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
  standalone: true,
  providers: [TranslateService],
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    NgbModule,
    PipesModule,
    TranslateModule,
    FormsModule,
    ProgressbarModule,
    TransactionStateComponent,
  ],
})
export class CatalogComponent implements OnInit {
  public loading = false;
  public transactions: Transaction[] = [];
  public _datatableService: DatatableService;
  public columns: IAttribute[];
  public sort: Record<string, number> = {};
  public filters: any;
  public currentPage = 0;
  public itemsPerPage = 10;
  public totalItems = 0;

  constructor(
    private _transactionService: TransactionService,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private _router: Router
  ) {
    this.columns = [
      {
        name: 'type.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'number',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'number',
        project: `{"$toString" : "$number"}`,
        align: 'right',
        required: false,
      },
      {
        name: 'startDate',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'date',
        project: `{ "$dateToString": { "date": "$startDate", "format": "%d/%m/%Y %H:%M", "timezone": "-03:00" } }`,
        align: 'right',
        required: true,
      },
      {
        name: 'company.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'state',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'employeeClosing.name',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'string',
        project: null,
        align: 'left',
        required: false,
      },
      {
        name: 'totalPrice',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: `{"$toString" : "$totalPrice"}`,
        align: 'right',
        required: true,
      },
      {
        name: 'balance',
        visible: true,
        disabled: false,
        filter: true,
        datatype: 'currency',
        project: `{"$toString" : "$balance"}`,
        align: 'right',
        required: true,
      },
      {
        name: 'madein',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        defaultFilter: `{ "$eq": "catalog" }`,
        align: 'left',
        required: true,
      },
      {
        name: 'operationType',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        defaultFilter: `{ "$ne": "D" }`,
        project: null,
        align: 'left',
        required: true,
      },
      {
        name: 'type.transactionMovement',
        visible: false,
        disabled: true,
        filter: false,
        datatype: 'string',
        project: null,
        align: 'left',
        required: true,
      },
    ];
  }

  ngOnInit(): void {
    this._datatableService = new DatatableService(this._transactionService, this.columns);
    this.processParams();
  }

  public refresh(): void {
    this.getTransactions();
  }

  private processParams(): void {
    this.filters = {};

    for (const field of this.columns) {
      this.filters[field.name] = field.defaultFilter;
    }
    this.itemsPerPage = 10;
    this.sort = {};
    this.getTransactions();
  }

  public async getTransactions(): Promise<void> {
    this.loading = true;
    try {
      const result = await this._datatableService.getItems(
        this.filters,
        this.currentPage,
        this.itemsPerPage,
        this.sort
      );
      if (result.status === 200) {
        if (result.result.length > 0) {
          if (this.itemsPerPage === 0) {
            this.itemsPerPage = 10;
          } else {
            this.transactions = result.result[0].items;
            this.totalItems = result.result[0].count;
          }
        } else {
          this.transactions = [];
          this.totalItems = 0;
        }
      } else {
        this._toastService.showToast(result);
      }
    } catch (error) {
      this._toastService.showToast(error);
    } finally {
      this.loading = false;
    }
  }

  public openModal(op: string, transaction?: Transaction): void {
    if (op === 'view-transaction' && transaction) {
      const modalRef = this._modalService.open(ViewTransactionComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.transactionId = transaction._id;
    }
  }

  public openTransaction(transaction: Transaction): void {
    if (!transaction?._id) return;

    this._router.navigate(['/pos/mostrador/editar-transaccion'], {
      queryParams: {
        transactionId: transaction._id,
        returnURL: this._router.url,
      },
    });
  }

  public orderBy(term: string): void {
    if (this.sort[term]) {
      this.sort[term] *= -1;
    } else {
      this.sort = { [term]: 1 };
    }

    this.getTransactions();
  }

  public addFilters(): void {
    this.currentPage = 1;
    this.getTransactions();
  }

  public pageChange(page: number): void {
    this.currentPage = page;
    this.getTransactions();
  }
}
