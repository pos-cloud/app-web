import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { WooCommerceService } from 'app/core/services/woocommerce.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sync-orders',
  templateUrl: './sync-orders.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PipesModule, TranslateModule],
})
export class SyncOrderComponent {
  loading = false;
  syncForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _wooCommerceService: WooCommerceService,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {
    this.syncForm = this.fb.group({
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  syncOrders() {
    this.syncForm.markAllAsTouched();
    if (this.syncForm.invalid) {
      return;
    }

    this.loading = true;
    const formData = this.syncForm.value;

    const requestData = {
      fromDate: formData.fromDate ? new Date(formData.fromDate).toISOString() : '',
      toDate: formData.toDate ? new Date(formData.toDate).toISOString() : '',
    };

    this._wooCommerceService
      .syncOrders(requestData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this._toastService.showToast(result);
          if (result.status == 200) {
            this.activeModal.close();
          }
        },
        error: (error) => {
          this._toastService.showToast(error);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
