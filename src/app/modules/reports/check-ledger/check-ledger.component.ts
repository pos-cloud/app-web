import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { IButton } from '@types';
import { MovementOfCashService } from 'app/core/services/movement-of-cash.service';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchableDropdownComponent } from 'app/shared/components/searchable-dropdown/searchable-dropdown.component';
import { ViewTransactionComponent } from '../../transaction/components/view-transaction/view-transaction.component';
import { MovementOfCash } from '../../../components/movement-of-cash/movement-of-cash';

@Component({
  selector: 'app-check-ledger',
  templateUrl: './check-ledger.component.html',
  styleUrls: ['./check-ledger.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    DataTableReportsComponent,
    ReactiveFormsModule,
    SearchableDropdownComponent,
  ],
})
export class ReportCheckLedgerComponent {
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  public checkForm: UntypedFormGroup;
  public checkControl: any;
  public movementOfCashes: MovementOfCash[] = [];
  public movementOfCashMatch = {
    operationType: { $ne: 'D' },
    'type.inputAndOuput': true,
    statusCheck: 'Disponible',
    number: { $exists: true, $ne: '' },
  };

  // data table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public header: any[] = [];
  public title: '';
  // sort
  public sort = {
    column: 'totalPrice',
    direction: 'desc',
  };

  public rowButtons: IButton[] = [
    {
      title: 'kardex-check',
      class: 'btn btn-success btn-sm',
      icon: 'fa fa-eye',
      click: `kardex-check`,
    },
  ];

  constructor(
    private _service: ReportSystemService,
    private _movementOfCashService: MovementOfCashService,
    private _toastService: ToastService,
    private _fb: UntypedFormBuilder,
    private cdRef: ChangeDetectorRef,
    public _router: Router,
    private _modalService: NgbModal,
    private _title: Title
  ) {
    this.checkForm = this._fb.group({ checkNumber: [null] });
    this.checkControl = this.checkForm.get('checkNumber');
  }

  async ngOnInit() {
    this.getMovementOfCashes();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('keydown.enter', ['$event'])
  onEnterKey(event: KeyboardEvent): void {
    if ((event.target as HTMLElement).closest('.check-filter')) {
      event.preventDefault();
      this.getReport();
    }
  }

  private get requestPayload() {
    return {
      reportType: 'check-ledger',
      filters: {
        number: this.checkControl?.value?.number ?? '',
      },
      pagination: {
        page: 1,
        pageSize: 10,
      },
      sorting: this.sort,
    };
  }

  public getMovementOfCashes(): void {
    this.subscription.add(
      this._movementOfCashService
        .getAll({
          project: {
            _id: 1,
            number: 1,
            'bank.name': 1,
            'type.inputAndOuput': 1,
            statusCheck: 1,
            amountPaid: 1,
            operationType: 1,
          },
          match: this.movementOfCashMatch,
          sort: { number: 1 },
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this.movementOfCashes = result?.result ?? [];
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
        })
    );
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
      modalRef.componentInstance.transactionId = event?.obj?._id;
    }
  }
}
