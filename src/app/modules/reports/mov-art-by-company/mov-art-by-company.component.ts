import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyService } from '@core/services/company.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TypeaheadDropdownComponent } from '@shared/components/typehead-dropdown/typeahead-dropdown.component';
import { Company } from '@types';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { CompanyComponent } from 'app/modules/entities/company/crud/company.component';
import { DataTableReportsComponent } from 'app/shared/components/data-table-reports/data-table-reports.component';
import { DateTimePickerComponent } from 'app/shared/components/datetime-picker/date-time-picker.component';
import { MultiSelectDropdownComponent } from 'app/shared/components/multi-select-dropdown/multi-select-dropdown.component';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mov-art-by-company',
  templateUrl: './mov-art-by-company.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    PipesModule,
    DateTimePickerComponent,
    MultiSelectDropdownComponent,
    DataTableReportsComponent,
    ReactiveFormsModule,
    TypeaheadDropdownComponent,
  ],
})
export class ReportMovArtByCompanyComponent implements OnInit {
  // date table
  public data: any[] = [];
  public columns: any[] = [];
  public totals: any = {};
  public title: string = '';

  public transactionMovement: string;
  public loading: boolean = false;
  private destroy$ = new Subject<void>();
  private subscription: Subscription = new Subscription();
  companies: Company[];
  public companyControl: any;
  public companyForm: UntypedFormGroup;

  company: string = '';
  // sort
  public sort = {
    column: 'amount',
    direction: 'desc',
  };

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _activatedRoute: ActivatedRoute,
    private _companyService: CompanyService,
    private _modalService: NgbModal,
    private _title: Title,
    public _router: Router,
    private cdRef: ChangeDetectorRef,
    private _fb: UntypedFormBuilder
  ) {
    this.companyForm = this._fb.group({ company: [null] });
    this.companyControl = this.companyForm.get('company');
  }

  async ngOnInit() {
    this.getCompanies();
    this._activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.transactionMovement = params['module'].charAt(0).toUpperCase() + params['module'].slice(1);
      this.getReport();
    });
  }

  private getCompanies(): Promise<Company[]> {
    return new Promise<Company[]>((resolve, reject) => {
      this._companyService
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
            this.companies = result.result;
          },
          error: (error) => {
            resolve(null);
          },
          complete: () => {},
        });
    });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  private get requestPayload() {
    return {
      reportType: 'mov-art-by-company',
      filters: {
        company: this.companyControl?.value?._id,
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
            this.title = result?.result?.info?.title ?? `Movimientos por cliente`;
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

  public viewSelectedCompany(): void {
    const companyId = this.companyControl?.value?._id;
    if (!companyId) {
      return;
    }

    const modalRef = this._modalService.open(CompanyComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.property = {
      companyId,
      operation: 'view',
      type: '',
    };
  }
}
