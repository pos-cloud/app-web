import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponse } from '@types';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Config } from '../../../../app.config';
import { Transaction } from '../../../../components/transaction/transaction';

@Component({
  selector: 'app-cancel',
  templateUrl: './cancel.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class CancelComponent implements OnInit {
  @Input() transaction: Transaction;
  @Input() config: Config;
  @Input() state: string;
  public cancelForm: FormGroup;
  public loading = false;
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
    this.cancelForm = this.fb.group({
      reason: ['El cliente cambió de idea'],
      email: [true],
      restock: [true],
      storeIdTn: [this.config?.tiendaNube?.userID],
    });
  }

  changeStatusTiendaNube() {
    if (this.cancelForm.valid) {
      this.loading = true;
      const formData = this.cancelForm.value;
      let reasonMappings: any = {
        'Otro motivo': 'other',
        'El cliente cambió de idea': 'customer',
        'El producto no esta disponible': 'inventory',
        'Es fraudulenta': 'fraud',
      };
      formData.reason = reasonMappings[formData.reason];
      this._tiendaNubeService
        .updateTransactionStatus(
          this.transaction.tiendaNubeId,
          formData,
          this.state
        )
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
