import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ReportSystemService } from 'app/core/services/report-system.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';

import { ViewTransactionComponent } from '../../transaction/components/view-transaction/view-transaction.component';

@Component({
  standalone: true,
  selector: 'app-report-cash-box',
  templateUrl: './cash-box.component.html',
  styleUrls: ['./cash-box.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, NgxPaginationModule, PipesModule, TranslateModule, ProgressbarModule],
})
export class ReportCashBoxComponent implements OnInit, OnDestroy {
  public items: any[] = [];
  public loading = false;
  public itemsPerPage = 10;
  public currentPage = 1;
  public totalItems = 0;
  public balance = 0;
  public header: any[] = [];
  public title = 'Detalle de Caja';

  public filters = {
    movement: '',
    transactionTypeName: '',
    transactionNumber: '',
    paymentMethodName: '',
  };

  public sort = {
    column: 'endDate',
    direction: 'asc',
  };

  public sortableColumns = [
    { column: 'endDate', label: 'Fecha' },
    { column: 'movement', label: 'Movimiento' },
    { column: 'type', label: 'Nombre' },
    { column: 'number', label: 'Numero' },
    { column: 'paymentMethod', label: 'Metodo de Pago' },
    { column: 'observation', label: 'Observación' },
    { column: 'inflow', label: 'Entrada' },
    { column: 'outflow', label: 'Salida' },
    { column: 'balance', label: 'Total' },
  ];

  private cashBoxId = '';
  private destroy$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private _router: Router,
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _modalService: NgbModal,
    private _title: Title
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.cashBoxId = params['cashBoxId'];
      this.getReport();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  public goBackToList(): void {
    this._router.navigateByUrl('/entities/cash-boxes');
  }

  private get requestPayload() {
    return {
      reportType: 'cash-box',
      filters: {
        cashBoxId: this.cashBoxId,
        movement: this.filters.movement?.trim() ?? '',
        transactionTypeName: this.filters.transactionTypeName?.trim() ?? '',
        transactionNumber: this.filters.transactionNumber?.trim() ?? '',
        paymentMethodName: this.filters.paymentMethodName?.trim() ?? '',
        pageSize: this.itemsPerPage,
      },
      pagination: {
        page: this.currentPage,
        pageSize: this.itemsPerPage,
      },
      sorting: this.sort,
    };
  }

  public getReport(): void {
    if (!this.cashBoxId) {
      return;
    }

    this.loading = true;

    this.subscription.add(
      this._service
        .getReport(this.requestPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result?.status && result.status !== 200) {
              this._toastService.showToast(result);
              this.items = [];
              this.totalItems = 0;
              this.header = [];
              return;
            }

            this.header = result?.result?.header ?? [];

            this.items = result?.result?.data ?? [];
            this.totalItems = result?.result?.pagination?.length ?? this.items.length;
            this.balance = result?.result?.totals?.balance ?? 0;
            this.title = result?.result?.metaData?.title ?? 'Detalle de Caja';
            this.setLastPage();

            this._title.setTitle(this.title);
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.items = [];
            this.totalItems = 0;
            this.header = [];
          },
          complete: () => {
            this.loading = false;
          },
        })
    );
  }

  public getMovementOfCashes(): void {
    this.getReport();
  }

  public onItemsPerPageChange(): void {
    this.setLastPage();
  }

  private setLastPage(): void {
    if (this.totalItems > 0) {
      this.currentPage = Math.ceil(this.totalItems / this.itemsPerPage);
    } else {
      this.currentPage = 1;
    }
  }

  public changeSorting(column: string): void {
    if (this.sort.column === column) {
      this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sort = {
        column,
        direction: 'asc',
      };
    }

    this.getReport();
  }

  public openModal(op: string, movement?: any): void {
    if (op === 'view-transaction' && movement) {
      const modalRef = this._modalService.open(ViewTransactionComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.transactionId = movement.transactionId;
    }
  }
}
