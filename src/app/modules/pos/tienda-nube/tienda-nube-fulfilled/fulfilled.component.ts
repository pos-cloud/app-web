import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse } from '@types';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fulfilled',
  templateUrl: './fulfilled.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class FulfilledComponent implements OnInit {
  @Input() tiendaNubeId: string;
  @Input() userID: string;
  @Input() state: string;
  fulfilledForm: FormGroup;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private _tiendaNubeService: TiendaNubeService,
    public activeModal: NgbActiveModal,
    private _toastService: ToastService
  ) {}

  async ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buildForm(): void {
    this.fulfilledForm = this.fb.group({
      shipping_tracking_number: [''],
      shipping_tracking_url: [''],
      notify_customer: [true],
      storeIdTn: [this.userID],
    });
  }

  changeStatusTiendaNube() {
    if (this.fulfilledForm.valid) {
      this.loading = true;
      const formData = this.fulfilledForm.value;
      this._tiendaNubeService
        .updateTransactionStatus(this.tiendaNubeId, formData, this.state)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result: ApiResponse) => {
            this._toastService.showToast({
              message: 'Operacion realizada con exito',
            });
          },
          error: (error) => {
            this._toastService.showToast(error);
          },
          complete: () => {
            this.loading = false;
            this.activeModal.close();
          },
        });
    }
  }
}
