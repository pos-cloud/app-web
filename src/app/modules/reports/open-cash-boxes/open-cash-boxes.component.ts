import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ReportSystemService } from 'app/core/services/report-system.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export type OpenCashBoxPayment = {
  paymentMethod: string;
  saldo: number;
};

export type OpenCashBoxItem = {
  _id?: string;
  name: string;
  user: string;
  payments: OpenCashBoxPayment[];
};

@Component({
  selector: 'app-open-cash-boxes',
  templateUrl: './open-cash-boxes.component.html',
  styleUrls: ['./open-cash-boxes.component.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CommonModule],
})
export class OpenCashBoxesComponent implements OnInit, OnDestroy {
  public cashBoxes: OpenCashBoxItem[] = [];
  public loading = false;

  private destroy$ = new Subject<void>();
  private subscription = new Subscription();

  constructor(
    private _service: ReportSystemService,
    private _toastService: ToastService,
    private _router: Router,
    private cdRef: ChangeDetectorRef,
    private _title: Title
  ) {}

  ngOnInit(): void {
    this._title.setTitle('Cajas abiertas');
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
        .getChart({ type: 'open-cash-boxes' })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            if (result?.status && result.status !== 200) {
              this._toastService.showToast(result);
              this.cashBoxes = [];
              return;
            }

            this.cashBoxes = result?.result ?? [];
            this.cdRef.detectChanges();
          },
          error: (error) => {
            this._toastService.showToast(error);
            this.cashBoxes = [];
          },
          complete: () => {
            this.loading = false;
            this.cdRef.detectChanges();
          },
        })
    );
  }

  public openCashBoxDetail(cashBox: OpenCashBoxItem): void {
    if (!cashBox?._id) {
      return;
    }

    this._router.navigateByUrl(`/reports/cash-box/${cashBox._id}`);
  }

  public formatMoney(value: number | string | null | undefined): string {
    const amount = Number(value) || 0;
    return amount.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
