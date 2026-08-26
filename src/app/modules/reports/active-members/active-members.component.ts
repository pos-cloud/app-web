import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface ActiveMemberRow {
  companyId: string;
  name: string;
  identificationValue: string;
  phones: string;
  status: 'Activo' | 'Inactivo';
  pendingCount: number;
  debt: number;
  debtFormatted: string;
  days: number;
}

@Component({
  selector: 'app-active-members',
  templateUrl: './active-members.component.html',
  styleUrls: ['./active-members.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ActiveMembersComponent implements OnInit, OnDestroy {
  public data: ActiveMemberRow[] = [];
  public filteredData: ActiveMemberRow[] = [];
  public search = '';
  public loading = false;

  private destroy$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private _title: Title,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this._title.setTitle('Socios activos');
    this.getReport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscription.unsubscribe();
  }

  public getReport(): void {
    this.loading = true;
    this.subscription.add(
      this._service
        .getReport({
          reportType: 'active-members',
          filters: {},
          pagination: { page: 1, pageSize: 9999 },
          sorting: { column: 'name', direction: 'asc' },
        })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            this._toastService.showToast(result);
            this.data = result?.result?.data ?? [];
            this.applyFilter();
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

  public applyFilter(): void {
    const term = (this.search || '').trim().toLowerCase();
    if (!term) {
      this.filteredData = [...this.data];
      return;
    }

    this.filteredData = this.data.filter((row) => {
      const name = (row.name || '').toLowerCase();
      const id = (row.identificationValue || '').toLowerCase();
      const phones = (row.phones || '').toLowerCase();
      return name.includes(term) || id.includes(term) || phones.includes(term);
    });
  }

  public isInactive(row: ActiveMemberRow): boolean {
    return row.status === 'Inactivo';
  }

  public isWarning(row: ActiveMemberRow): boolean {
    return this.isInactive(row) && (row.days ?? 0) <= 10;
  }

  public openHistory(row: ActiveMemberRow): void {
    if (!row?.companyId) return;
    this._router.navigate(['/reports/subscription-history-by-client'], {
      queryParams: { company: row.companyId, returnTo: '/reports/active-members' },
    });
  }
}
