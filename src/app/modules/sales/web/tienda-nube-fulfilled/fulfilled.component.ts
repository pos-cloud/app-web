import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse } from '@types';
import { Config } from 'app/app.config';
import { Transaction } from 'app/components/transaction/transaction';
import { TiendaNubeService } from 'app/core/services/tienda-nube.service';
import { ProgressbarModule } from 'app/shared/components/progressbar/progressbar.module';
import { ToastService } from 'app/shared/components/toast/toast.service';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-fulfilled',
  templateUrl: './fulfilled.component.html',
  standalone: true,
  imports: [
    CommonModule,
    PipesModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressbarModule,
  ],
})
export class FulfilledComponent implements OnInit {
  @Input() transaction: Transaction;
  @Input() config: Config;
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
      storeIdTn: [this.config.tiendaNube.userID],
    });
  }

  changeStatusTiendaNube() {
    if (this.fulfilledForm.valid) {
      const formData = this.fulfilledForm.value;

      return new Promise<Transaction>((resolve, reject) => {
        this._tiendaNubeService
          .updateTransactionStatus(
            this.transaction.tiendaNubeId,
            formData,
            this.state
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe(
            (result: ApiResponse) => {
              if (result.status === 201) {
                resolve(result.result);
                this.activeModal.close();
              } else {
                reject(result);
                this.activeModal.close();
              }
            },
            (error) => {
              this._toastService.showToast(error);
              reject(error);
              this.activeModal.close();
            }
          );
      });
    }
  }
}
