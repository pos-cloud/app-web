import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { IButton } from '@types';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ViewTransactionComponent } from 'app/modules/transaction/components/view-transaction/view-transaction.component';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscription-history-by-client',
  templateUrl: './subscription-history-by-client.component.html',
  styleUrls: ['./subscription-history-by-client.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, TranslateModule, PipesModule, DataTableReportsComponent],
})
export class ReportSubscriptionHistoryByClientComponent implements OnInit, OnDestroy {
  public loading = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  private companyId: string;

  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public header: any[] = [];
  public title = '';

  public sort = {
    column: 'VATPeriod',
    direction: 'desc',
  };

  public rowButtons: IButton[] = [
    {
      title: 'view-transaction',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `view-transaction`,
    },
  ];

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute,
    private _modalService: NgbModal,
    private cdRef: ChangeDetectorRef,
    public _router: Router,
    private _title: Title
  ) {}

  ngOnInit() {
    this._activatedRoute.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.companyId = params.get('company');
      this.getReport();
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  public goBack(): void {
    const returnTo = this._activatedRoute.snapshot.queryParamMap.get('returnTo');
    if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
      this._router.navigateByUrl(returnTo);
      return;
    }

    this._router.navigateByUrl('/entities/companies/client');
  }

  private get requestPayload() {
    return {
      reportType: 'subscription-history-by-client',
      filters: {
        company: this.companyId,
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: this.sort,
    };
  }

  public getReport(): void {
    if (!this.companyId) {
      this._toastService.showToast({ message: 'Debe seleccionar un cliente' });
      return;
    }

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
            this.title = result?.result?.info?.title ?? result?.result?.metaData?.title ?? 'Historial de suscripciones';
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

  public onExportExcel(): void {
    this.loading = true;
    const entity = this._router.url.split('/')[2];

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

  public onEventFunction(event: { op: string; obj: any; items: any[] }): void {
    if (event.op === 'view-transaction') {
      const modalRef = this._modalService.open(ViewTransactionComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.transactionId = event?.obj?._id;
    }
  }
}
