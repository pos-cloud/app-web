import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { PaymentMethodService } from '@core/services/payment-method.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { IButton, PaymentMethod } from '@types';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ViewTransactionComponentNew } from 'app/modules/transaction/components/view-transactions/view-transactions.component';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    PipesModule,
    DateTimePickerComponent,
    MultiSelectDropdownComponent,
    DataTableReportsComponent,
    TypeaheadDropdownComponent,
  ],
})
export class ReportPaymentMethodComponent implements OnInit {
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title: string = '';
  public paymentMethodForm: UntypedFormGroup;

  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();

  startDate: string = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  endDate: string = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();

  paymentMethods: PaymentMethod[];
  paymentMethodControl: any;

  // sort
  sort = {
    column: 'totalPrice',
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
    public _paymentMethodService: PaymentMethodService,
    public _router: Router,
    private _modalService: NgbModal,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private _title: Title,
    public _fb: UntypedFormBuilder
  ) {
    this.paymentMethodForm = this._fb.group({ article: [null] });
    this.paymentMethodControl = this.paymentMethodForm.get('article');
  }

  async ngOnInit() {
    this.getReport();
    this.getPaymentMethods();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private get requestPayload() {
    return {
      reportType: 'payment-methods',
      filters: {
        startDate: this.startDate,
        endDate: this.endDate,
        paymentMethod: this.paymentMethodControl?.value?._id,
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
            this.title = result?.result?.title ?? `Métodos de pago`;
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

  private getPaymentMethods(): Promise<PaymentMethod[]> {
    return new Promise<PaymentMethod[]>((resolve, reject) => {
      this._paymentMethodService
        .getAll({
          project: {
            _id: 1,
            operationType: 1,
            name: 1,
            isCurrentAccount: 1,
          },
          match: {
            operationType: { $ne: 'D' },
            isCurrentAccount: { $ne: true },
          },
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.paymentMethods = result.result;
          },
          error: (error) => {
            resolve(null);
          },
          complete: () => {},
        });
    });
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

  public onEventFunction(event: { op: string; obj: any; items: any[] }): void {
    console.log(event?.obj?.transaction?._id);
    if (event.op === 'view-transaction') {
      let modalRef;
      modalRef = this._modalService.open(ViewTransactionComponentNew, {
        size: 'lg',
        backdrop: 'static',
      });
      modalRef.componentInstance.transactionId = event?.obj?.transaction?._id;
    }
  }
}
