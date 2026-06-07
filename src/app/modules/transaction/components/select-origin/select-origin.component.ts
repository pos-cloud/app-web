import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Origin } from '@types';
import { OriginService } from '@core/services/origin.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-origin',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './select-origin.component.html',
})
export class SelectOriginComponent implements OnInit, OnDestroy {
  @Input() branchId: string;

  public origins: Origin[] = [];
  public originSelected: Origin;
  public loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private _originService: OriginService,
    private _toastService: ToastService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit(): void {
    this.getOrigins();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public selectOrigin(): void {
    this.activeModal.close({ origin: this.originSelected });
  }

  private getOrigins(): void {
    const branchId = this.normalizeId(this.branchId);
    if (!branchId) {
      this._toastService.showToast({
        type: 'danger',
        message: 'No se pudo determinar la sucursal.',
      });
      return;
    }

    this.loading = true;
    this._originService
      .find({
        project: { number: 1, branch: 1 },
        query: {
          operationType: { $ne: 'D' },
          branch: branchId,
        },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.length) {
            this.origins = [...result].sort((a, b) => a.number - b.number);
            this.originSelected = this.origins[0];
          } else {
            this.origins = [];
            this._toastService.showToast({
              type: 'info',
              message: 'No se encontraron puntos de venta para esta sucursal.',
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this._toastService.showToast(error);
          this.loading = false;
        },
      });
  }

  private normalizeId(id: unknown): string {
    if (id == null) {
      return '';
    }
    if (typeof id === 'string') {
      return id;
    }
    if (typeof id === 'object') {
      const record = id as { $oid?: string; _id?: unknown; toString?: () => string };
      if (record.$oid) {
        return record.$oid;
      }
      if (record._id != null) {
        return this.normalizeId(record._id);
      }
      if (typeof record.toString === 'function') {
        return record.toString();
      }
    }
    return String(id);
  }
}
