import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { IButton } from '@types';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { UserBranchSelectComponent } from 'app/shared/components/user-branch-select/user-branch-select.component';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CheckWalletEditComponent } from '../../transaction/components/edit-check/check-wallet-edit.component';
import { ViewTransactionComponent } from '../../transaction/components/view-transaction/view-transaction.component';

@Component({
  selector: 'app-check-wallet',
  templateUrl: './check-wallet.component.html',
  styleUrls: ['./check-wallet.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    DataTableReportsComponent,
    ReactiveFormsModule,
    UserBranchSelectComponent,
  ],
})
export class ReportCheckWalletComponent {
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public form: FormGroup;

  // data table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public header: any[] = [];
  public title: '';

  branchSelectedId: string | null = null;
  // sort
  public sort = {
    column: 'expirationDate',
    direction: 'asc',
  };

  public rowButtons: IButton[] = [
    {
      title: 'kardex-check',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `kardex-check`,
    },
    {
      title: 'edit-check',
      class: 'btn btn-primary btn-sm',
      icon: 'fa fa-pencil',
      click: `edit-check`,
    },
  ];

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _fb: UntypedFormBuilder,
    private cdRef: ChangeDetectorRef,
    public _router: Router,
    private _modalService: NgbModal,
    private _title: Title
  ) {
    this.form = this._fb.group({
      checkNumber: [''],
    });
  }

  async ngOnInit() {}

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private get requestPayload() {
    return {
      reportType: 'check-wallet',
      filters: {
        branches: this.branchSelectedId ? [this.branchSelectedId] : [],
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: this.sort,
    };
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
            this.title = result?.result?.info?.title ?? 'Kadex de cheque';
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

  public onSortingChange(event: { column: string; direction: string }): void {
    this.sort = {
      column: event.column,
      direction: event.direction,
    };
    this.getReport();
  }

  public onEventFunction(event: { op: string; obj: any; items: any[] }): void {
    if (event.op === 'kardex-check') {
      let modalRef = this._modalService.open(ViewTransactionComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.transactionId = event?.obj?.transactionId;
    } else if (event.op === 'edit-check') {
      const modalRef = this._modalService.open(CheckWalletEditComponent, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.movementOfCashId = event?.obj?._id;
      modalRef.result.then(
        () => this.getReport(),
        () => {}
      );
    }
  }
}
